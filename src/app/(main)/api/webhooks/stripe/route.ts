import { NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import Stripe from 'stripe';
import { z } from 'zod';
import { stripe } from '@/lib/stripe';
import { db } from '@/db';
import { bookings, payments, pendingReservations } from '@/db/schema';
import { eq } from 'drizzle-orm';
import {
  InvalidEmailRecipientError,
  sendBookingConfirmationEmail,
  sendPhilipNotificationEmail,
} from '@/lib/email';
import { SERVER_AVAILABILITY_TAG } from '@/lib/serverCalendar';

/**
 * Schema for `session.metadata` on `checkout.session.completed`.
 *
 * Stripe metadata values are always strings. We coerce the integers explicitly
 * and reject NaN / non-integers so a malformed/replayed event never produces
 * `db.insert({ packageId: NaN })` and a 500-then-retry-without-email scenario.
 *
 * See WR-01 in .planning/phases/03-booking-and-payments/03-REVIEW.md.
 */
const checkoutCompletedMetadataSchema = z.object({
  packageId: z
    .string()
    .regex(/^\d+$/, 'packageId must be a non-negative integer string')
    .transform((s) => Number.parseInt(s, 10))
    .refine((n) => Number.isInteger(n) && n > 0, 'packageId must be > 0'),
  packageName: z.string().min(1),
  clientName: z.string().min(1),
  clientEmail: z.string().email(),
  clientPhone: z.string().optional().default(''),
  clientNotes: z.string().optional().default(''),
  eventDate: z
    .string()
    .refine((s) => !Number.isNaN(Date.parse(s)), 'eventDate must be a valid ISO date'),
  reservationId: z
    .string()
    .regex(/^\d+$/, 'reservationId must be a non-negative integer string')
    .transform((s) => Number.parseInt(s, 10))
    .refine((n) => Number.isInteger(n) && n > 0, 'reservationId must be > 0')
    .optional(),
  durationMinutes: z
    .string()
    .regex(/^\d+$/, 'durationMinutes must be a non-negative integer string')
    .transform((s) => Number.parseInt(s, 10))
    .refine((n) => Number.isInteger(n) && n > 0 && n <= 24 * 60, 'durationMinutes out of range')
    .optional(),
});

/**
 * Failure paths the post-DB step needs to distinguish:
 *
 *   DB insert succeeds + email succeeds  -> 200 OK, normal
 *   DB insert succeeds + email FAILS     -> 200 OK + loud manual-followup log.
 *                                           We do NOT 5xx here because the
 *                                           idempotency check would short-circuit
 *                                           Stripe's retry and we'd never re-try
 *                                           the email anyway. The booking row's
 *                                           email_sent_at column stays NULL so a
 *                                           future operator job can replay it.
 *   DB insert FAILS                      -> 5xx, Stripe retries (no row to dupe).
 *
 * See .planning/phases/03-booking-and-payments/03-REVIEW.md CR-01.
 */

export async function POST(request: Request) {
  // RAW body — required for Stripe signature verification
  const body = await request.text();
  const sig = request.headers.get('stripe-signature');

  if (!sig) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    console.error('[webhook] Signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  try {
    if (event.type === 'checkout.session.completed') {
      return await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
    }

    if (event.type === 'checkout.session.expired') {
      return await handleCheckoutExpired(event.data.object as Stripe.Checkout.Session);
    }

    if (event.type === 'charge.refunded') {
      return await handleChargeRefunded(event.data.object as Stripe.Charge);
    }

    if (event.type === 'payment_intent.payment_failed') {
      return await handlePaymentFailed(event.data.object as Stripe.PaymentIntent);
    }
  } catch (err) {
    // Unhandled errors from inside an event-type branch — 500 lets Stripe retry.
    console.error(`[webhook] Unhandled error in ${event.type} handler:`, err);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }

  // Unhandled event types: ack so Stripe doesn't retry them.
  return NextResponse.json({ received: true });
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const paymentIntentId = session.payment_intent as string;

  // WR-01: validate metadata shape up front. Malformed metadata (e.g. a
  // Stripe Workbench replay with edits, or a future-us bug in /api/checkout)
  // produces a 400 rather than a 500-then-retry-without-email storm.
  const parsed = checkoutCompletedMetadataSchema.safeParse(session.metadata ?? {});
  if (!parsed.success) {
    const issues = parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ');
    console.error(
      '[webhook] Rejecting checkout.session.completed with invalid metadata:',
      issues,
      { paymentIntentId, rawMetadata: session.metadata },
    );
    return NextResponse.json(
      { error: `Invalid session metadata: ${issues}` },
      { status: 400 },
    );
  }
  const meta = parsed.data;

  // IDEMPOTENCY: check if booking already exists for this payment intent
  const existing = await db
    .select({ id: bookings.id, emailSentAt: bookings.emailSentAt })
    .from(bookings)
    .where(eq(bookings.stripePaymentIntentId, paymentIntentId))
    .limit(1);

  if (existing.length > 0) {
    // Retry path: row exists. If email was already sent we're done; otherwise
    // try sending again (the previous attempt failed and we logged it then).
    const row = existing[0];
    if (row.emailSentAt) {
      console.log('[webhook] Booking + email already complete for', paymentIntentId);
      return NextResponse.json({ received: true });
    }
    console.warn(
      '[webhook] Booking exists but email_sent_at is NULL — retrying email for booking',
      row.id,
    );
    await sendBookingEmailsAndMark({
      bookingId: row.id,
      meta,
      amountTotal: session.amount_total ?? 0,
    });
    return NextResponse.json({ received: true });
  }

  // DB writes: if any of these throw, we 500 so Stripe retries with no
  // orphaned row. They're wrapped in the outer try/catch in POST().
  const [booking] = await db
    .insert(bookings)
    .values({
      packageId: meta.packageId,
      clientName: meta.clientName,
      clientEmail: meta.clientEmail,
      clientPhone: meta.clientPhone || null,
      eventDate: new Date(meta.eventDate),
      stripePaymentIntentId: paymentIntentId,
      depositPaidInCents: session.amount_total ?? 0,
      status: 'confirmed',
      notes: meta.clientNotes || null,
    })
    .returning();

  await db.insert(payments).values({
    bookingId: booking.id,
    stripePaymentIntentId: paymentIntentId,
    amountInCents: session.amount_total ?? 0,
    currency: session.currency ?? 'usd',
    status: 'succeeded',
  });

  if (meta.reservationId !== undefined) {
    await db
      .delete(pendingReservations)
      .where(eq(pendingReservations.id, meta.reservationId));
  }

  // The booking is now durably "confirmed" — invalidate any cached availability
  // view so the slot disappears from the picker before the (now 2-minute) TTL.
  safeRevalidateAvailability('checkout.session.completed');

  // DB state is now consistent. Email failures must NOT bubble out of this
  // function — they get logged and the booking row stays email_sent_at=NULL
  // so a follow-up job can replay them.
  await sendBookingEmailsAndMark({
    bookingId: booking.id,
    meta,
    amountTotal: session.amount_total ?? 0,
  });

  return NextResponse.json({ received: true });
}

type CheckoutCompletedMetadata = z.infer<typeof checkoutCompletedMetadataSchema>;

/**
 * Send the two booking emails and mark email_sent_at on success.
 * Swallows email errors so they never trigger a Stripe retry (which would
 * either no-op via idempotency or, worse, dupe the row). Logs loudly so the
 * operator has a manual-followup trail.
 */
async function sendBookingEmailsAndMark({
  bookingId,
  meta,
  amountTotal,
}: {
  bookingId: number;
  meta: CheckoutCompletedMetadata;
  amountTotal: number;
}) {
  try {
    await sendBookingConfirmationEmail({
      clientName: meta.clientName,
      clientEmail: meta.clientEmail,
      packageName: meta.packageName,
      eventDate: new Date(meta.eventDate),
      depositPaidInCents: amountTotal,
      durationMinutes: meta.durationMinutes ?? 60,
    });

    await sendPhilipNotificationEmail({
      clientName: meta.clientName,
      clientEmail: meta.clientEmail,
      packageName: meta.packageName,
      eventDate: new Date(meta.eventDate),
      depositPaidInCents: amountTotal,
    });

    await db
      .update(bookings)
      .set({ emailSentAt: new Date() })
      .where(eq(bookings.id, bookingId));
  } catch (err) {
    // MANUAL FOLLOWUP REQUIRED — surface a structured marker for log scrapers.
    const reason =
      err instanceof InvalidEmailRecipientError
        ? 'invalid_recipient'
        : err instanceof Error
          ? err.message
          : 'unknown';
    console.error(
      '[webhook][MANUAL_FOLLOWUP_REQUIRED] Booking confirmed but email failed.',
      JSON.stringify({
        bookingId,
        clientEmail: meta.clientEmail,
        clientName: meta.clientName,
        packageName: meta.packageName,
        reason,
      }),
    );
    // Intentionally do not rethrow.
  }
}

/**
 * Best-effort cache invalidation. Logs but never throws — a missed revalidate
 * is at worst 2 minutes of stale UI, not worth failing a Stripe ack.
 */
function safeRevalidateAvailability(triggerEvent: string) {
  try {
    // Next.js 16: second arg is required ('max' = invalidate all profiles).
    revalidateTag(SERVER_AVAILABILITY_TAG, 'max');
  } catch (err) {
    console.warn(`[webhook] revalidateTag failed after ${triggerEvent}:`, err);
  }
}

/**
 * Parse a metadata integer field safely. Returns null when the value is
 * missing, non-numeric, or out of range. Used by handlers where the metadata
 * may not exist at all (e.g. expired sessions without a reservationId).
 */
function parseMetadataInt(value: unknown): number | null {
  if (typeof value !== 'string' || !/^\d+$/.test(value)) return null;
  const n = Number.parseInt(value, 10);
  return Number.isInteger(n) && n > 0 ? n : null;
}

async function handleCheckoutExpired(session: Stripe.Checkout.Session) {
  // Stripe expires unpaid Checkout sessions after ~24h. Clear the hold so the
  // slot becomes bookable again without waiting for the cleanup sweep in
  // /api/checkout to fire.
  const reservationId = parseMetadataInt(session.metadata?.reservationId);
  let deleted = false;

  if (reservationId !== null) {
    try {
      await db
        .delete(pendingReservations)
        .where(eq(pendingReservations.id, reservationId));
      console.log('[webhook] Deleted expired pending reservation', reservationId);
      deleted = true;
    } catch (err) {
      console.error('[webhook] Failed to delete expired reservation', reservationId, err);
      // Don't fail the webhook — the periodic sweep will catch it.
    }
  } else if (session.id) {
    // Fallback: match on stripe session id.
    try {
      await db
        .delete(pendingReservations)
        .where(eq(pendingReservations.stripeSessionId, session.id));
      deleted = true;
    } catch (err) {
      console.error('[webhook] Failed to delete reservation by session id', session.id, err);
    }
  }

  if (deleted) safeRevalidateAvailability('checkout.session.expired');
  return NextResponse.json({ received: true });
}

/**
 * `charge.refunded` — issued when Stripe (or the dashboard) refunds a charge,
 * fully or partially. We treat any refund as "release the slot": mark the
 * booking cancelled, mark the payment refunded, and drop any straggler
 * pending-reservation row. Idempotent: refunding twice is a no-op.
 *
 * See WR-03 in .planning/phases/03-booking-and-payments/03-REVIEW.md.
 */
async function handleChargeRefunded(charge: Stripe.Charge) {
  const paymentIntentId =
    typeof charge.payment_intent === 'string'
      ? charge.payment_intent
      : (charge.payment_intent?.id ?? null);

  if (!paymentIntentId) {
    console.warn('[webhook] charge.refunded without payment_intent — ignoring');
    return NextResponse.json({ received: true });
  }

  // Look up the booking before mutating so we can detect "no row found" cleanly.
  const matchingBooking = await db
    .select({ id: bookings.id, status: bookings.status })
    .from(bookings)
    .where(eq(bookings.stripePaymentIntentId, paymentIntentId))
    .limit(1);

  if (matchingBooking.length === 0) {
    console.warn(
      '[webhook] charge.refunded for unknown payment_intent — no-op',
      paymentIntentId,
    );
    return NextResponse.json({ received: true });
  }

  const row = matchingBooking[0];

  // Idempotent — repeat refunds (or a partial-then-full sequence) end here.
  if (row.status === 'cancelled') {
    return NextResponse.json({ received: true });
  }

  await db
    .update(bookings)
    .set({ status: 'cancelled', updatedAt: new Date() })
    .where(eq(bookings.id, row.id));

  await db
    .update(payments)
    .set({ status: 'refunded' })
    .where(eq(payments.stripePaymentIntentId, paymentIntentId));

  safeRevalidateAvailability('charge.refunded');
  console.log('[webhook] Booking cancelled via refund', { bookingId: row.id, paymentIntentId });
  return NextResponse.json({ received: true });
}

/**
 * `payment_intent.payment_failed` — the customer's payment failed (card
 * declined, auth abandoned, etc). Stripe normally only sends this for
 * intents created via the API, but Checkout can also surface it. We don't
 * have a booking row yet (that's only created on `checkout.session.completed`),
 * so we just drop any pending reservation tied to the same intent so the slot
 * isn't held for the full 30-minute TTL.
 *
 * See WR-03 in .planning/phases/03-booking-and-payments/03-REVIEW.md.
 */
async function handlePaymentFailed(pi: Stripe.PaymentIntent) {
  // The pending reservation is keyed by stripe_session_id, not by payment_intent;
  // we don't have a direct lookup. Best effort: if the failure event ever carries
  // a session id under metadata.checkoutSessionId (we don't currently set it),
  // delete by that. Otherwise the natural 30-min TTL + periodic sweep handles it.
  const sessionId =
    (pi.metadata && typeof pi.metadata.checkoutSessionId === 'string'
      ? pi.metadata.checkoutSessionId
      : null) ?? null;

  if (sessionId) {
    try {
      await db
        .delete(pendingReservations)
        .where(eq(pendingReservations.stripeSessionId, sessionId));
      safeRevalidateAvailability('payment_intent.payment_failed');
    } catch (err) {
      console.error('[webhook] Failed to delete reservation on payment_failed', sessionId, err);
    }
  } else {
    console.log(
      '[webhook] payment_intent.payment_failed without session id — TTL cleanup will reap',
      pi.id,
    );
  }

  return NextResponse.json({ received: true });
}

import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { stripe } from '@/lib/stripe';
import { db } from '@/db';
import { bookings, payments, pendingReservations } from '@/db/schema';
import { eq } from 'drizzle-orm';
import {
  InvalidEmailRecipientError,
  sendBookingConfirmationEmail,
  sendPhilipNotificationEmail,
} from '@/lib/email';

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
  } catch (err) {
    // Unhandled errors from inside an event-type branch — 500 lets Stripe retry.
    console.error(`[webhook] Unhandled error in ${event.type} handler:`, err);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }

  // Unhandled event types: ack so Stripe doesn't retry them.
  return NextResponse.json({ received: true });
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const meta = session.metadata ?? {};
  const paymentIntentId = session.payment_intent as string;

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
      packageId: parseInt(meta.packageId),
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

  if (meta.reservationId) {
    await db
      .delete(pendingReservations)
      .where(eq(pendingReservations.id, parseInt(meta.reservationId)));
  }

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
  meta: Record<string, string | undefined>;
  amountTotal: number;
}) {
  try {
    await sendBookingConfirmationEmail({
      clientName: meta.clientName ?? '',
      clientEmail: meta.clientEmail ?? '',
      packageName: meta.packageName ?? '',
      eventDate: new Date(meta.eventDate ?? Date.now()),
      depositPaidInCents: amountTotal,
      durationMinutes: parseInt(meta.durationMinutes ?? '60') || 60,
    });

    await sendPhilipNotificationEmail({
      clientName: meta.clientName ?? '',
      clientEmail: meta.clientEmail ?? '',
      packageName: meta.packageName ?? '',
      eventDate: new Date(meta.eventDate ?? Date.now()),
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

async function handleCheckoutExpired(session: Stripe.Checkout.Session) {
  // Stripe expires unpaid Checkout sessions after ~24h. Clear the hold so the
  // slot becomes bookable again without waiting for the cleanup sweep in
  // /api/checkout to fire.
  const reservationId = session.metadata?.reservationId;

  if (reservationId) {
    try {
      await db
        .delete(pendingReservations)
        .where(eq(pendingReservations.id, parseInt(reservationId)));
      console.log('[webhook] Deleted expired pending reservation', reservationId);
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
    } catch (err) {
      console.error('[webhook] Failed to delete reservation by session id', session.id, err);
    }
  }

  return NextResponse.json({ received: true });
}

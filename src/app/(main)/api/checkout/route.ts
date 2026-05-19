import { NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { stripe } from '@/lib/stripe';
import { photographyPackages } from '@/data/photography';
import { db } from '@/db';
import { bookings, pendingReservations } from '@/db/schema';
import { and, eq, gt, lt } from 'drizzle-orm';
import {
  checkoutRequestSchema,
  validateBookingDateAgainstCalendar,
} from '@/lib/validation/booking';
import { fetchCalendarEventsForRange, SERVER_AVAILABILITY_TAG } from '@/lib/serverCalendar';

export async function POST(request: Request) {
  try {
    const rawBody = await request.json();

    // CR-03: Re-validate the entire body server-side. The client gates this,
    // but a direct curl can otherwise POST a Saturday at 3 AM in 2099.
    const parsed = checkoutRequestSchema.safeParse(rawBody);
    if (!parsed.success) {
      const issues = parsed.error.issues.map((i) => i.message).join('; ');
      return NextResponse.json(
        { error: `Invalid request: ${issues}` },
        { status: 400 }
      );
    }
    const { packageId, clientName, clientEmail, phone, notes, eventDate } = parsed.data;

    // Validate package — pulled from the static catalogue.
    const pkg = photographyPackages.find((p) => p.id === packageId);
    if (!pkg) {
      return NextResponse.json({ error: 'Invalid package' }, { status: 400 });
    }

    // CR-03: re-run weekday / window / business-hours / CalDAV-busy checks.
    const dateValidation = await validateBookingDateAgainstCalendar(
      eventDate,
      pkg.id,
      async (start, end) => {
        const events = await fetchCalendarEventsForRange(start, end);
        return events.map((e) => ({
          startTime: new Date(e.startTime),
          endTime: new Date(e.endTime),
        }));
      }
    );
    if (!dateValidation.ok) {
      return NextResponse.json(
        { error: dateValidation.reason },
        { status: 400 }
      );
    }

    // Clean up expired pending reservations BEFORE pre-checks so stale rows
    // don't block legitimate bookings (review CR-02 + WR-02).
    await db
      .delete(pendingReservations)
      .where(lt(pendingReservations.expiresAt, new Date()));

    // CR-02: Confirmed-booking pre-check. If a booking already exists for this
    // exact (package_id, event_date) we return 409 — the DB UNIQUE constraint
    // is the final backstop but a clean 409 saves the second user a Stripe trip.
    const existingBooking = await db
      .select({ id: bookings.id })
      .from(bookings)
      .where(
        and(
          eq(bookings.packageId, pkg.id),
          eq(bookings.eventDate, eventDate)
        )
      )
      .limit(1);
    if (existingBooking.length > 0) {
      return NextResponse.json(
        { error: 'That slot is already booked. Please choose another time.' },
        { status: 409 }
      );
    }

    // CR-02: Live pending-reservation pre-check. Another user might be mid-Stripe
    // for the exact same slot — block them. expires_at > NOW() = "still live".
    const livePending = await db
      .select({ id: pendingReservations.id })
      .from(pendingReservations)
      .where(
        and(
          eq(pendingReservations.packageId, pkg.id),
          eq(pendingReservations.requestedDate, eventDate),
          gt(pendingReservations.expiresAt, new Date())
        )
      )
      .limit(1);
    if (livePending.length > 0) {
      return NextResponse.json(
        {
          error:
            'Someone else is currently checking out for that slot. Please try again in a few minutes.',
        },
        { status: 409 }
      );
    }

    // Insert the pending reservation hold (30 min TTL). If two requests race
    // past the SELECTs above, the DB layer will still keep them honest at
    // booking-insert time via UNIQUE(package_id, event_date) on bookings.
    let reservation;
    try {
      [reservation] = await db
        .insert(pendingReservations)
        .values({
          packageId: pkg.id,
          clientEmail,
          requestedDate: eventDate,
          expiresAt: new Date(Date.now() + 30 * 60 * 1000),
        })
        .returning();
    } catch (err) {
      // Postgres unique-violation = SQLSTATE 23505. Translate to a clean 409.
      if (isUniqueViolation(err)) {
        return NextResponse.json(
          { error: 'That slot is already being booked. Please try another time.' },
          { status: 409 }
        );
      }
      throw err;
    }

    // Create Stripe Checkout session — same shape as before.
    const baseUrl =
      process.env.NEXT_PUBLIC_PHOTOGRAPHY_URL || 'http://localhost:3000';
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      customer_email: clientEmail,
      line_items: [
        {
          price_data: {
            currency: 'usd',
            unit_amount: pkg.depositInCents,
            product_data: {
              name: `${pkg.name} — Deposit`,
              description: 'Photography session deposit. Balance due on the day.',
            },
          },
          quantity: 1,
        },
      ],
      metadata: {
        packageId: String(pkg.id),
        packageName: pkg.name,
        clientName,
        clientEmail,
        clientPhone: phone || '',
        clientNotes: notes || '',
        eventDate: eventDate.toISOString(),
        reservationId: String(reservation.id),
        durationMinutes: String(pkg.durationMinutes),
      },
      success_url: `${baseUrl}/photography/book/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/photography/book?cancelled=true`,
    });

    // Link Stripe session to pending reservation
    await db
      .update(pendingReservations)
      .set({ stripeSessionId: session.id })
      .where(eq(pendingReservations.id, reservation.id));

    // WR-06: bust the server-availability cache so the next page render sees
    // the new hold immediately instead of waiting for the (now 2-minute) TTL.
    // Best-effort; failure here doesn't block the checkout response.
    try {
      // Next.js 16: second arg is required ('max' = invalidate all profiles).
      revalidateTag(SERVER_AVAILABILITY_TAG, 'max');
    } catch (err) {
      console.warn('[checkout] revalidateTag failed:', err);
    }

    return NextResponse.json({ url: session.url });
  } catch (error) {
    // Belt-and-suspenders: also translate unique-violation here in case it
    // escapes from somewhere unexpected.
    if (isUniqueViolation(error)) {
      return NextResponse.json(
        { error: 'That slot is already booked. Please choose another time.' },
        { status: 409 }
      );
    }
    console.error('[checkout] Error creating session:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}

/**
 * Detect a Postgres unique-constraint violation. Drizzle surfaces the underlying
 * driver error so we sniff for code '23505' or the canonical phrase from neon /
 * postgres.js. Conservative: we'd rather miss-classify a weird error as 500
 * than swallow a real bug as 409.
 */
function isUniqueViolation(err: unknown): boolean {
  if (!err || typeof err !== 'object') return false;
  const e = err as { code?: unknown; message?: unknown; cause?: unknown };
  if (typeof e.code === 'string' && e.code === '23505') return true;
  if (typeof e.message === 'string' && /duplicate key value|unique constraint/i.test(e.message)) {
    return true;
  }
  // Drizzle / neon often wrap the driver error in `.cause`.
  if (e.cause && typeof e.cause === 'object') {
    return isUniqueViolation(e.cause);
  }
  return false;
}

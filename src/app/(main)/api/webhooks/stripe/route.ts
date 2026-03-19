import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { stripe } from '@/lib/stripe';
import { db } from '@/db';
import { bookings, payments, pendingReservations } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { sendBookingConfirmationEmail, sendPhilipNotificationEmail } from '@/lib/email';

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

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const meta = session.metadata!;
    const paymentIntentId = session.payment_intent as string;

    // IDEMPOTENCY: check if booking already exists for this payment intent
    const existing = await db.select({ id: bookings.id })
      .from(bookings)
      .where(eq(bookings.stripePaymentIntentId, paymentIntentId))
      .limit(1);

    if (existing.length > 0) {
      console.log('[webhook] Booking already exists for payment intent:', paymentIntentId);
      return NextResponse.json({ received: true });
    }

    // Insert booking row
    const [booking] = await db.insert(bookings).values({
      packageId: parseInt(meta.packageId),
      clientName: meta.clientName,
      clientEmail: meta.clientEmail,
      clientPhone: meta.clientPhone || null,
      eventDate: new Date(meta.eventDate),
      stripePaymentIntentId: paymentIntentId,
      depositPaidInCents: session.amount_total ?? 0,
      status: 'confirmed',
      notes: meta.clientNotes || null,
    }).returning();

    // Insert payment row
    await db.insert(payments).values({
      bookingId: booking.id,
      stripePaymentIntentId: paymentIntentId,
      amountInCents: session.amount_total ?? 0,
      currency: session.currency ?? 'usd',
      status: 'succeeded',
    });

    // Delete pending reservation
    if (meta.reservationId) {
      await db.delete(pendingReservations)
        .where(eq(pendingReservations.id, parseInt(meta.reservationId)));
    }

    // Send confirmation email to client (with ICS attachment)
    await sendBookingConfirmationEmail({
      clientName: meta.clientName,
      clientEmail: meta.clientEmail,
      packageName: meta.packageName,
      eventDate: new Date(meta.eventDate),
      depositPaidInCents: session.amount_total ?? 0,
      durationMinutes: parseInt(meta.durationMinutes) || 60,
    });

    // Notify Philip
    await sendPhilipNotificationEmail({
      clientName: meta.clientName,
      clientEmail: meta.clientEmail,
      packageName: meta.packageName,
      eventDate: new Date(meta.eventDate),
      depositPaidInCents: session.amount_total ?? 0,
    });
  }

  return NextResponse.json({ received: true });
}

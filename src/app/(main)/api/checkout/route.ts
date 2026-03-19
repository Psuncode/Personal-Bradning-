import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { photographyPackages } from '@/data/photography';
import { db } from '@/db';
import { pendingReservations } from '@/db/schema';
import { eq, lt } from 'drizzle-orm';

export async function POST(request: Request) {
  try {
    const { packageId, clientName, clientEmail, phone, notes, eventDate } = await request.json();

    // Validate package
    const pkg = photographyPackages.find(p => p.id === packageId);
    if (!pkg) {
      return NextResponse.json({ error: 'Invalid package' }, { status: 400 });
    }

    // Validate required fields
    if (!clientName || !clientEmail || !eventDate) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Clean up expired pending reservations
    await db.delete(pendingReservations)
      .where(lt(pendingReservations.expiresAt, new Date()));

    // Create pending reservation (30-min expiry)
    const [reservation] = await db.insert(pendingReservations).values({
      packageId: pkg.id,
      clientEmail,
      requestedDate: new Date(eventDate),
      expiresAt: new Date(Date.now() + 30 * 60 * 1000),
    }).returning();

    // Create Stripe Checkout session
    const baseUrl = process.env.NEXT_PUBLIC_PHOTOGRAPHY_URL || 'http://localhost:3000';
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      customer_email: clientEmail,
      line_items: [{
        price_data: {
          currency: 'usd',
          unit_amount: pkg.depositInCents,
          product_data: {
            name: `${pkg.name} — Deposit`,
            description: 'Photography session deposit. Balance due on the day.',
          },
        },
        quantity: 1,
      }],
      metadata: {
        packageId: String(pkg.id),
        packageName: pkg.name,
        clientName,
        clientEmail,
        clientPhone: phone || '',
        clientNotes: notes || '',
        eventDate,
        reservationId: String(reservation.id),
        durationMinutes: String(pkg.durationMinutes),
      },
      success_url: `${baseUrl}/photography/book/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/photography/book?cancelled=true`,
    });

    // Link Stripe session to pending reservation
    await db.update(pendingReservations)
      .set({ stripeSessionId: session.id })
      .where(eq(pendingReservations.id, reservation.id));

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('[checkout] Error creating session:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}

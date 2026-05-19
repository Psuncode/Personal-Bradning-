import type { Metadata } from 'next';
import { stripe } from '@/lib/stripe';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { format } from 'date-fns-tz';
import { CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

export const metadata: Metadata = {
  title: 'Booking Confirmed | Philip Sun Photography',
};

export default async function BookingSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const params = await searchParams;
  const sessionId = params.session_id;

  if (!sessionId) {
    redirect('/photography/book');
  }

  let session;
  try {
    session = await stripe.checkout.sessions.retrieve(sessionId);
  } catch {
    redirect('/photography/book');
  }

  const meta = session.metadata!;
  const formattedDate = format(new Date(meta.eventDate), 'MMMM d, yyyy', { timeZone: 'America/Denver' });
  const formattedTime = format(new Date(meta.eventDate), 'h:mm a', { timeZone: 'America/Denver' });
  const formattedDeposit = `$${((session.amount_total ?? 0) / 100).toFixed(0)}`;

  return (
    <div className="py-24 px-6">
      <div className="max-w-lg mx-auto text-center">
        <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
        <h1 className="font-display text-4xl font-semibold text-[color:var(--color-ink)] mb-2">
          You&apos;re booked!
        </h1>
        <p className="text-[color:var(--color-ink-soft)] mb-8">
          A confirmation email with your calendar invite is on its way.
        </p>

        <Separator className="mb-8" />

        <div className="bg-[#F5F5F5] rounded-xl p-6 text-left">
          <div className="space-y-3">
            <div>
              <p className="text-sm text-[color:var(--color-ink-soft)]">Package</p>
              <p className="font-semibold">{meta.packageName}</p>
            </div>
            <div>
              <p className="text-sm text-[color:var(--color-ink-soft)]">Session Date</p>
              <p className="font-semibold">{formattedDate} at {formattedTime} (Mountain Time)</p>
            </div>
            <div>
              <p className="text-sm text-[color:var(--color-ink-soft)]">Deposit Paid</p>
              <p className="font-semibold tabular-nums">{formattedDeposit}</p>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <Link href="/photography">
            <Button variant="outline" className="border-[color:var(--color-ink)] text-[color:var(--color-ink)]">
              Back to Photography
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

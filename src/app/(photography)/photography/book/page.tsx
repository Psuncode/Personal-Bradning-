import type { Metadata } from 'next';
import { Suspense } from 'react';
import { getServerAvailability } from '@/lib/serverCalendar';
import { PhotographyBookingForm } from '@/components/booking/PhotographyBookingForm';
import { CheckCircle } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Book a Session | Philip Sun Photography',
  description:
    'Book your photography session — choose a package, pick a date, and pay a deposit to secure your spot.',
};

const howItWorks = [
  'Choose your package and preferred date',
  'Pay a small deposit to hold your spot',
  'Receive a confirmation email with an ICS invite',
  'Show up — I handle everything else',
];

export default async function BookingPage() {
  const availability = await getServerAvailability();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-6 lg:px-8 py-16">
        <div className="grid lg:grid-cols-[1fr_2fr] gap-12 items-start">

          {/* Left: context panel */}
          <div className="lg:sticky lg:top-24">
            <p className="text-xs font-medium tracking-widest text-gray-400 uppercase mb-3">
              Let's shoot
            </p>
            <h1 className="font-[family-name:var(--font-playfair)] text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Book a Session
            </h1>
            <p className="text-gray-500 text-sm leading-relaxed mb-8">
              Secure your date with a deposit. I photograph throughout Utah and
              am happy to travel for the right shoot.
            </p>

            <div>
              <p className="text-xs font-semibold tracking-widest text-gray-400 uppercase mb-4">
                How it works
              </p>
              <ol className="space-y-3">
                {howItWorks.map((step, i) => (
                  <li key={i} className="flex gap-3 items-start">
                    <span className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full bg-gray-900 text-white flex items-center justify-center text-xs font-semibold">
                      {i + 1}
                    </span>
                    <span className="text-sm text-gray-600 leading-snug">{step}</span>
                  </li>
                ))}
              </ol>
            </div>

            <div className="mt-8 rounded-xl border border-gray-200 bg-white p-5">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="size-4 text-green-600" />
                <span className="text-sm font-medium text-gray-900">Secure checkout</span>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed">
                Payment is processed by Stripe. Your deposit holds the date — the balance is
                due on the day of your session.
              </p>
            </div>
          </div>

          {/* Right: form */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 md:p-8">
            <Suspense
              fallback={
                <div className="animate-pulse space-y-4">
                  <div className="h-8 bg-gray-100 rounded-lg w-48" />
                  <div className="h-64 bg-gray-100 rounded-xl" />
                </div>
              }
            >
              <PhotographyBookingForm initialData={availability} />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
}

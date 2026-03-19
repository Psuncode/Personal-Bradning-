import type { Metadata } from 'next';
import { Suspense } from 'react';
import { getServerAvailability } from '@/lib/serverCalendar';
import { PhotographyBookingForm } from '@/components/booking/PhotographyBookingForm';

export const metadata: Metadata = {
  title: 'Book a Session | Philip Sun Photography',
  description:
    'Book your photography session — choose a package, pick a date, and pay a deposit to secure your spot.',
};

export default async function BookingPage() {
  const availability = await getServerAvailability();

  return (
    <div className="py-16 px-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="font-display text-4xl md:text-[36px] font-semibold text-byu-navy mb-8">
          Book a Session
        </h1>
        <Suspense fallback={<div className="animate-pulse h-64 bg-gray-100 rounded-xl" />}>
          <PhotographyBookingForm initialData={availability} />
        </Suspense>
      </div>
    </div>
  );
}

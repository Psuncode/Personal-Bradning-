import type { Metadata } from 'next';
import { photographyPackages } from '@/data/photography';

export const metadata: Metadata = {
  title: 'Pricing | Philip Sun Photography',
  description: 'Photography package pricing by Philip Sun — portraits, events, and landscapes.',
};

function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(0)}`;
}

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours} hour${hours > 1 ? 's' : ''}`;
}

export default function PricingPage() {
  return (
    <div className="py-16 px-6 md:px-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Pricing</h1>
        <p className="text-gray-600 mb-12 max-w-2xl">
          Transparent pricing for every session type. A deposit secures your booking date.
        </p>

        <div className="grid gap-8 md:grid-cols-3">
          {photographyPackages.map((pkg) => (
            <div
              key={pkg.id}
              className="border border-gray-200 rounded-2xl p-8 flex flex-col"
            >
              <h2 className="text-xl font-bold text-gray-900 mb-2">{pkg.name}</h2>
              <p className="text-gray-600 text-sm mb-6 flex-1">{pkg.description}</p>
              <div className="border-t border-gray-100 pt-6">
                <p className="text-3xl font-bold text-gray-900">{formatPrice(pkg.priceInCents)}</p>
                <p className="text-sm text-gray-500 mt-1">
                  {formatPrice(pkg.depositInCents)} deposit to book &middot; {formatDuration(pkg.durationMinutes)}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-gray-600">
            Ready to book?{' '}
            <a href="/contact" className="text-gray-900 font-medium underline hover:no-underline">
              Get in touch
            </a>{' '}
            to schedule your session.
          </p>
        </div>
      </div>
    </div>
  );
}

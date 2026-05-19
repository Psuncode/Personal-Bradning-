import type { Metadata } from 'next';
import Link from 'next/link';
import { photographyPackages } from '@/data/photography';

export const metadata: Metadata = {
  title: 'Photography Pricing | Philip Sun Photography',
  description: 'Simple pricing for couples and portrait sessions in Utah, with deposits, turnaround, and booking links.',
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
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Couples & Portrait Pricing</h1>
        <p className="text-gray-600 mb-12 max-w-2xl">
          Clear pricing for Utah couples and portrait sessions. Every package includes guided posing, edited images, and an online gallery.
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
                <p className="text-sm text-gray-500 mt-1">Turnaround: {pkg.turnaround}</p>
              </div>
              <Link
                href={`/photography/book?pkg=${pkg.slug}`}
                className="mt-6 block w-full text-center bg-[color:var(--color-ink)] text-[color:var(--color-paper)] py-3 px-4 rounded-lg font-medium hover:bg-[color:var(--color-accent)] transition-colors focus-visible:ring-2 focus-visible:ring-[color:var(--color-accent)] focus-visible:outline-none"
              >
                Book Now
              </Link>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-gray-600">
            All packages include a deposit to secure your date. Balance is due on the day of the shoot.
          </p>
        </div>
      </div>
    </div>
  );
}

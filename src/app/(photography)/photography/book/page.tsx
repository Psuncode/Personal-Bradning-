import type { Metadata } from 'next';
import { CalEmbed } from '@/components/cal-embed';
import { calLinkFor, siteConfig } from '@/data/site-config';

export const metadata: Metadata = {
  title: 'Book a Session | Philip Sun Photography',
  description:
    'Book your photography session — choose a package, pick a date, and pay a deposit to secure your spot.',
};

export default function BookingPage() {
  const calLink = calLinkFor(siteConfig.cal.photographyEventSlug);

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: 'var(--color-paper)' }}
    >
      <div className="mx-auto max-w-6xl px-6 pb-24 pt-16 lg:px-8">
        {/* Context strip — same shape as /meet so Cal.com's month_view
            layout gets full container width below. */}
        <header className="mb-10 max-w-2xl">
          <p
            className="mb-3 text-xs font-medium uppercase tracking-widest"
            style={{ color: 'var(--color-ink-soft)' }}
          >
            Let&apos;s shoot
          </p>
          <h1
            className="mb-4 font-[family-name:var(--font-playfair)] text-4xl font-bold md:text-5xl"
            style={{ color: 'var(--color-ink)' }}
          >
            Book a Couples or Portrait Session
          </h1>
          <p
            className="text-base leading-relaxed"
            style={{ color: 'var(--color-ink-soft)' }}
          >
            Pick a date and time below — Cal.com collects the deposit via
            Stripe and sends a calendar invite. Balance is due the day of your
            session.
          </p>
        </header>

        {/* Full-width Cal.com embed. month_view layout renders the date
            picker with the selected day's time slots in an adjacent panel
            on desktop, and stacks vertically on mobile. */}
        <div className="h-[min(85vh,800px)] w-full overflow-hidden rounded-2xl border border-[color:var(--color-rule)] bg-[color:var(--color-paper-elevated)]">
          <CalEmbed calLink={calLink} />
        </div>
      </div>
    </div>
  );
}

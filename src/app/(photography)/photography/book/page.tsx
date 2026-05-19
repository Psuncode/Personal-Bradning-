import type { Metadata } from 'next';
import { CheckCircle } from 'lucide-react';
import { CalEmbed } from '@/components/cal-embed';
import { calLinkFor, siteConfig } from '@/data/site-config';

export const metadata: Metadata = {
  title: 'Book a Session | Philip Sun Photography',
  description:
    'Book your photography session — choose a package, pick a date, and pay a deposit to secure your spot.',
};

const howItWorks = [
  'Pick a date and time',
  'Choose your package',
  'Pay the deposit (handled by Cal.com + Stripe)',
  "You'll receive a calendar invite and prep email from Cal.com",
];

export default function BookingPage() {
  const calLink = calLinkFor(siteConfig.cal.photographyEventSlug);

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: 'var(--color-paper)' }}
    >
      <div className="max-w-6xl mx-auto px-6 lg:px-8 py-16">
        <div className="grid lg:grid-cols-[1fr_2fr] gap-12 items-start">
          {/* Left: context panel */}
          <div className="lg:sticky lg:top-24">
            <p
              className="text-xs font-medium tracking-widest uppercase mb-3"
              style={{ color: 'var(--color-ink-soft)' }}
            >
              Let&apos;s shoot
            </p>
            <h1
              className="font-[family-name:var(--font-playfair)] text-3xl md:text-4xl font-bold mb-4"
              style={{ color: 'var(--color-ink)' }}
            >
              Book a Couples or Portrait Session
            </h1>
            <p
              className="text-sm leading-relaxed mb-8"
              style={{ color: 'var(--color-ink-soft)' }}
            >
              Choose your package, pick a date, and reserve your session. If
              scheduling gives you trouble, send an inquiry and I will follow
              up directly.
            </p>

            <div>
              <p
                className="text-xs font-semibold tracking-widest uppercase mb-4"
                style={{ color: 'var(--color-ink-soft)' }}
              >
                How it works
              </p>
              <ol className="space-y-3">
                {howItWorks.map((step, i) => (
                  <li key={i} className="flex gap-3 items-start">
                    <span
                      className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-semibold"
                      style={{
                        backgroundColor: 'var(--color-ink)',
                        color: 'var(--color-paper)',
                      }}
                    >
                      {i + 1}
                    </span>
                    <span
                      className="text-sm leading-snug"
                      style={{ color: 'var(--color-ink-soft)' }}
                    >
                      {step}
                    </span>
                  </li>
                ))}
              </ol>
            </div>

            <div
              className="mt-8 rounded-xl border p-5"
              style={{
                borderColor: 'var(--color-rule)',
                backgroundColor: 'var(--color-paper-elevated)',
              }}
            >
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle
                  className="size-4"
                  style={{ color: 'var(--color-ink-soft)' }}
                />
                <span
                  className="text-sm font-medium"
                  style={{ color: 'var(--color-ink)' }}
                >
                  Secure checkout
                </span>
              </div>
              <p
                className="text-xs leading-relaxed"
                style={{ color: 'var(--color-ink-soft)' }}
              >
                Scheduling and payment are handled by Cal.com with Stripe. Your
                deposit holds the date — the balance is due on the day of your
                session.
              </p>
            </div>
          </div>

          {/* Right: Cal.com embed */}
          <div
            className="rounded-2xl border p-2 md:p-4"
            style={{
              borderColor: 'var(--color-rule)',
              backgroundColor: 'var(--color-paper-elevated)',
              minHeight: '720px',
            }}
          >
            <CalEmbed calLink={calLink} />
          </div>
        </div>
      </div>
    </div>
  );
}

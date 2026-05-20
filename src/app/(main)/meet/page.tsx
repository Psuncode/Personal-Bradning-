import type { Metadata } from "next";
import { CheckCircle } from "lucide-react";
import { CalEmbed } from "@/components/cal-embed";
import { calLinkFor, siteConfig } from "@/data/site-config";

export const metadata: Metadata = {
  title: "Book a Call — Philip Sun",
  description: `Book a quick chat with ${siteConfig.name} — product, healthtech, and the boring parts of building things that hold up under scrutiny.`,
  alternates: { canonical: `${siteConfig.url}/meet` },
};

const howItWorks = [
  "Pick a date and time",
  "Confirm your email",
  "You'll get a calendar invite from Cal.com",
  "We'll meet over your preferred video tool",
];

export default function MeetPage() {
  const calLink = calLinkFor(siteConfig.cal.quickChatEventSlug);

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: "var(--color-paper)" }}
    >
      <div className="mx-auto max-w-6xl px-6 py-16 lg:px-8">
        <div className="grid items-start gap-12 lg:grid-cols-[1fr_2fr]">
          {/* Left: context panel */}
          <div className="lg:sticky lg:top-24">
            <p
              className="mb-3 text-xs font-medium uppercase tracking-widest"
              style={{ color: "var(--color-ink-soft)" }}
            >
              Let&apos;s talk
            </p>
            <h1
              className="mb-4 font-[family-name:var(--font-playfair)] text-3xl font-bold md:text-4xl"
              style={{ color: "var(--color-ink)" }}
            >
              Book a quick chat
            </h1>
            <p
              className="mb-8 text-sm leading-relaxed"
              style={{ color: "var(--color-ink-soft)" }}
            >
              Product, healthtech, side projects — whatever you want to dig
              into. If the scheduler gives you trouble, reach out on{" "}
              <a
                href={siteConfig.social?.linkedin ?? siteConfig.links.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="underline-offset-4 transition-[font-style] duration-150 hover:italic"
                style={{ color: "var(--color-ink)" }}
              >
                LinkedIn
              </a>{" "}
              and I&apos;ll follow up.
            </p>

            <div>
              <p
                className="mb-4 text-xs font-semibold uppercase tracking-widest"
                style={{ color: "var(--color-ink-soft)" }}
              >
                How it works
              </p>
              <ol className="space-y-3">
                {howItWorks.map((step, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle
                      aria-hidden
                      className="mt-0.5 size-4 shrink-0"
                      style={{ color: "var(--color-ink-soft)" }}
                    />
                    <span
                      className="text-sm leading-relaxed"
                      style={{ color: "var(--color-ink)" }}
                    >
                      {step}
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          </div>

          {/* Right: Cal.com embed */}
          <div className="h-[min(85vh,800px)] w-full overflow-hidden rounded-2xl border border-[color:var(--color-rule)] bg-[color:var(--color-paper-elevated)]">
            <CalEmbed calLink={calLink} />
          </div>
        </div>
      </div>
    </div>
  );
}

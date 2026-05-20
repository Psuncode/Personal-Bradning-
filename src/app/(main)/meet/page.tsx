import type { Metadata } from "next";
import { CalEmbed } from "@/components/cal-embed";
import { calLinkFor, siteConfig } from "@/data/site-config";

export const metadata: Metadata = {
  title: "Book a Call — Philip Sun",
  description: `Book a quick chat with ${siteConfig.name} — product, healthtech, and the boring parts of building things that hold up under scrutiny.`,
  alternates: { canonical: `${siteConfig.url}/meet` },
};

export default function MeetPage() {
  const calLink = calLinkFor(siteConfig.cal.quickChatEventSlug);

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: "var(--color-paper)" }}
    >
      <div className="mx-auto max-w-6xl px-6 pb-24 pt-16 lg:px-8">
        {/* Context strip — sits above the embed, not beside it. Lets Cal.com's
            column_view layout breathe at full container width. */}
        <header className="mb-10 max-w-2xl">
          <p
            className="mb-3 text-xs font-medium uppercase tracking-widest"
            style={{ color: "var(--color-ink-soft)" }}
          >
            Let&apos;s talk
          </p>
          <h1
            className="mb-4 font-[family-name:var(--font-playfair)] text-4xl font-bold md:text-5xl"
            style={{ color: "var(--color-ink)" }}
          >
            Book a quick chat
          </h1>
          <p
            className="text-base leading-relaxed"
            style={{ color: "var(--color-ink-soft)" }}
          >
            Product, healthtech, side projects — whatever you want to dig
            into. Pick a slot below; you&apos;ll get a calendar invite from
            Cal.com. If scheduling gives you trouble, reach out on{" "}
            <a
              href={siteConfig.social?.linkedin ?? siteConfig.links.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="underline-offset-4 transition-[font-style] duration-150 hover:italic"
              style={{ color: "var(--color-ink)" }}
            >
              LinkedIn
            </a>
            .
          </p>
        </header>

        {/* Full-width Cal.com embed. column_view layout shows the date picker
            on the left and time slots on the right within the iframe. */}
        <div className="h-[min(85vh,800px)] w-full overflow-hidden rounded-2xl border border-[color:var(--color-rule)] bg-[color:var(--color-paper-elevated)]">
          <CalEmbed calLink={calLink} />
        </div>
      </div>
    </div>
  );
}

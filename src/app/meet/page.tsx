import type { Metadata } from "next";
import { Container } from "@/components/layout/container";
import { SectionHeading } from "@/components/section-heading";
import { CalEmbed } from "@/components/cal-embed";
import { siteConfig } from "@/data/site-config";

export const metadata: Metadata = {
  title: "Book a Meeting",
  description: `Schedule a meeting with ${siteConfig.name}`,
};

export default function MeetPage() {
  return (
    <div className="pb-24 pt-12">
      <Container>
        <SectionHeading
          title="Book a Meeting"
          subtitle="Pick a time that works for you. I'll receive a notification and confirm."
        />

        {siteConfig.calLink ? (
          <div className="mx-auto max-w-4xl overflow-hidden rounded-xl border border-byu-sky/30 bg-white p-2 shadow-sm">
            <div className="min-h-[600px]">
              <CalEmbed calLink={siteConfig.calLink} />
            </div>
          </div>
        ) : (
          <div className="mx-auto max-w-lg rounded-xl border border-byu-sky/30 bg-white p-8 text-center shadow-sm">
            <p className="text-lg text-byu-dark-gray">
              Calendar booking is being set up. In the meantime, reach out
              directly:
            </p>
            <a
              href={siteConfig.links.email}
              className="mt-4 inline-block text-lg font-semibold text-byu-navy underline"
            >
              Send me an email
            </a>
          </div>
        )}
      </Container>
    </div>
  );
}

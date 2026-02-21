import type { Metadata } from "next";
import { Container } from "@/components/layout/container";
import { SectionHeading } from "@/components/section-heading";
import { siteConfig } from "@/data/site-config";
import { BookingForm } from "@/components/booking/BookingForm";

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
          subtitle="Select an available time slot to meet with me. All times are in Mountain Time (MT)."
        />

        <div className="mx-auto max-w-3xl rounded-xl border border-byu-sky/30 bg-white p-8 shadow-sm">
          <BookingForm />
        </div>

        <div className="mx-auto max-w-lg mt-12 text-center text-byu-dark-gray">
          <p className="text-sm">
            Can&apos;t find a time that works? Feel free to reach out on{" "}
            <a
              href={siteConfig.links.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="text-byu-blue hover:text-byu-navy transition-colors font-medium"
            >
              LinkedIn
            </a>
            .
          </p>
        </div>
      </Container>
    </div>
  );
}

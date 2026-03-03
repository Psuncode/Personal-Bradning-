import type { Metadata } from "next";
import { Container } from "@/components/layout/container";
import { SectionHeading } from "@/components/section-heading";
import { siteConfig } from "@/data/site-config";
import { BookingForm } from "@/components/booking/BookingForm";
import { getServerAvailability } from "@/lib/serverCalendar";

export const metadata: Metadata = {
  title: "Book a Meeting",
  description: `Schedule a meeting with ${siteConfig.name}`,
};

export default async function MeetPage() {
  const availability = await getServerAvailability();

  return (
    <div className="pb-24 pt-12">
      <Container>
        <SectionHeading
          title="Book a Meeting"
          subtitle="Select an available time slot to meet with me. All times are in Mountain Time (MT)."
        />

        <div className="mx-auto max-w-3xl rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
          <BookingForm initialData={availability} />
        </div>

        <div className="mx-auto max-w-lg mt-12 text-center text-gray-600">
          <p className="text-sm">
            Can&apos;t find a time that works? Feel free to reach out on{" "}
            <a
              href={siteConfig.links.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-700 hover:text-gray-900 transition-colors font-medium"
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

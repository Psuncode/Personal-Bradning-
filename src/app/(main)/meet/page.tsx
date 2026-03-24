import type { Metadata } from "next";
import { Container } from "@/components/layout/container";
import { SectionHeading } from "@/components/section-heading";
import { siteConfig } from "@/data/site-config";
import { BookingForm } from "@/components/booking/BookingForm";
import { getServerAvailability } from "@/lib/serverCalendar";

export const metadata: Metadata = {
  title: "Book a Call — Philip Sun",
  description: `Book a 30-minute call with ${siteConfig.name} — PM, healthcare founder, and photographer. Let's discuss opportunities, collaborations, or photography sessions.`,
};

export default async function MeetPage() {
  const availability = await getServerAvailability();

  return (
    <div className="pb-24 pt-12">
      <Container>
        <SectionHeading
          title="Book a Call"
          subtitle="Select an available time slot. All times are in Mountain Time (MT)."
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

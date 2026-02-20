import type { Metadata } from "next";
import { Container } from "@/components/layout/container";
import { SectionHeading } from "@/components/section-heading";
import { siteConfig } from "@/data/site-config";
import { Button } from "@/components/ui/button";

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
          subtitle="Let's connect and discuss opportunities, projects, or anything you'd like to chat about."
        />

        <div className="mx-auto max-w-lg rounded-xl border border-byu-sky/30 bg-white p-8 text-center shadow-sm">
          <div className="mb-6">
            <h3 className="mb-4 text-xl font-semibold text-byu-navy">
              Get in Touch
            </h3>
            <p className="mb-8 text-byu-dark-gray">
              The fastest way to reach me is through LinkedIn. Send me a direct message and I'll respond within 24 hours.
            </p>
          </div>

          <a
            href={siteConfig.links.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block"
          >
            <Button className="bg-byu-blue hover:bg-byu-navy">
              Message me on LinkedIn
            </Button>
          </a>

          <div className="mt-8 border-t border-byu-sky/30 pt-6">
            <p className="mb-4 text-sm text-byu-dark-gray">
              You can also explore my work:
            </p>
            <div className="flex justify-center gap-4">
              <a
                href={siteConfig.links.github}
                target="_blank"
                rel="noopener noreferrer"
                className="text-byu-blue hover:text-byu-navy transition-colors"
              >
                GitHub
              </a>
              <span className="text-byu-sky">/</span>
              <a
                href={siteConfig.links.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="text-byu-blue hover:text-byu-navy transition-colors"
              >
                LinkedIn
              </a>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}

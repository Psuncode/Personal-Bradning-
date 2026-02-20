"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Container } from "@/components/layout/container";
import { SectionHeading } from "@/components/section-heading";
import { SocialLinks } from "@/components/social-links";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/data/site-config";

export function ContactSection() {
  return (
    <section className="py-24">
      <Container>
        <SectionHeading
          title="Get In Touch"
          subtitle="Have a question or want to work together?"
        />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto max-w-md text-center"
        >
          <p className="text-lg text-byu-dark-gray/80">
            Feel free to reach out. I&apos;m always open to discussing new
            projects, creative ideas, or opportunities to be part of your vision.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Button asChild className="bg-byu-navy hover:bg-byu-blue">
              <Link href={siteConfig.links.email}>Say Hello</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="border-byu-navy text-byu-navy hover:bg-byu-navy hover:text-white"
            >
              <Link href="/meet">Book a Meeting</Link>
            </Button>
          </div>
          <div className="mt-8 flex justify-center">
            <SocialLinks />
          </div>
        </motion.div>
      </Container>
    </section>
  );
}

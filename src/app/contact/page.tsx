import type { Metadata } from "next";
import { ContactSection } from "@/components/sections/contact-section";

export const metadata: Metadata = {
  title: "Contact",
  description: "Connect with Philip Sun about PM roles, healthcare startups, and partnership opportunities",
};

export default function ContactPage() {
  return (
    <div className="pt-8">
      <ContactSection />
    </div>
  );
}

import { Hero } from "@/components/sections/hero";
import { CurrentFocus } from "@/components/sections/current-focus";
import { ProjectsGrid } from "@/components/sections/projects-grid";
import { FAQ } from "@/components/sections/faq";
import { ContactSection } from "@/components/sections/contact-section";

export default function HomePage() {
  return (
    <>
      <Hero />
      <CurrentFocus />
      <ProjectsGrid featured />
      <FAQ />
      <ContactSection />
    </>
  );
}

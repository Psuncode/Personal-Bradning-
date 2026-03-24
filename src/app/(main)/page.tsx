import { Hero } from "@/components/sections/hero";
import { CurrentFocus } from "@/components/sections/current-focus";
import { About } from "@/components/sections/about";
import { CaseStudies } from "@/components/sections/case-studies";
import { ContentGrid } from "@/components/sections/content-grid";

export default function HomePage() {
  return (
    <>
      <Hero />
      <CurrentFocus />
      <About />
      <CaseStudies />
      <ContentGrid />
    </>
  );
}

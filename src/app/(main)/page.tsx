import { Hero } from "@/components/sections/hero";
import { About } from "@/components/sections/about";
import { CaseStudies } from "@/components/sections/case-studies";
import { ContentGrid } from "@/components/sections/content-grid";

export default function HomePage() {
  return (
    <>
      <Hero />
      <About />
      <CaseStudies />
      <ContentGrid />
    </>
  );
}

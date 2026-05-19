import { Hero } from "@/components/sections/hero";
import { HeadlineProject } from "@/components/sections/headline-project";
import { SelectedWriting } from "@/components/sections/selected-writing";
import { ToolsGrid } from "@/components/sections/tools-grid";
import { Elsewhere } from "@/components/sections/elsewhere";

export default function HomePage() {
  return (
    <>
      <Hero />
      <HeadlineProject />
      <ToolsGrid />
      <SelectedWriting />
      <Elsewhere />
    </>
  );
}

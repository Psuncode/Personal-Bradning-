import type { Metadata } from "next";
import { ProjectsGrid } from "@/components/sections/projects-grid";

export const metadata: Metadata = {
  title: "Projects",
  description: "Projects built by Philip Sun",
};

export default function ProjectsPage() {
  return (
    <div className="pt-8">
      <ProjectsGrid />
    </div>
  );
}

import type { Metadata } from "next";
import { ProjectsGrid } from "@/components/sections/projects-grid";

export const metadata: Metadata = {
  title: "Projects",
  description: "Healthcare diagnostics, enterprise PM work, and AI tooling — things Philip Sun has shipped",
};

export default function ProjectsPage() {
  return (
    <div className="pt-8">
      <ProjectsGrid />
    </div>
  );
}

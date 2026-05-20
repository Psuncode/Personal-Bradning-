import type { Metadata } from "next";
import Link from "next/link";
import { siteConfig } from "@/data/site-config";
import { ProjectsGrid } from "@/components/sections/projects-grid";

export const metadata: Metadata = {
  title: "Projects",
  description:
    "Healthcare diagnostics, enterprise PM work, and AI tooling — things Philip Sun has shipped",
  alternates: { canonical: `${siteConfig.url}/projects` },
};

export default function ProjectsPage() {
  return (
    <div className="pt-8">
      <ProjectsGrid />
      <div className="editorial-shell pb-24">
        <p className="border-t border-[color:var(--color-rule)] pt-8 text-sm text-[color:var(--color-ink-soft)]">
          Looking for past employment specifically?{" "}
          <Link
            href="/work-history"
            className="text-[color:var(--color-ink)] underline-offset-4 transition-[font-style] duration-150 hover:italic"
          >
            See the work-history page
          </Link>
          .
        </p>
      </div>
    </div>
  );
}

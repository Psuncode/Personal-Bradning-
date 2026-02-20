import Link from "next/link";
import { Container } from "@/components/layout/container";
import { SectionHeading } from "@/components/section-heading";
import { ProjectCard } from "@/components/project-card";
import { Button } from "@/components/ui/button";
import { projects } from "@/data/projects";

interface ProjectsGridProps {
  featured?: boolean;
}

export function ProjectsGrid({ featured = false }: ProjectsGridProps) {
  const displayProjects = featured
    ? projects.filter((p) => p.featured).slice(0, 3)
    : projects;

  return (
    <section className="bg-byu-gray py-24">
      <Container>
        <SectionHeading
          title={featured ? "Featured Projects" : "All Projects"}
          subtitle="A selection of things I've built"
        />
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {displayProjects.map((project, index) => (
            <ProjectCard key={project.id} project={project} index={index} />
          ))}
        </div>
        {featured && (
          <div className="mt-12 text-center">
            <Button
              asChild
              variant="outline"
              className="border-byu-navy text-byu-navy hover:bg-byu-navy hover:text-white"
            >
              <Link href="/projects">View All Projects</Link>
            </Button>
          </div>
        )}
      </Container>
    </section>
  );
}

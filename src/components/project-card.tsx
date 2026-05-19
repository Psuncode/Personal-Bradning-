"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ExternalLink, Github } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Project } from "@/types";

interface ProjectCardProps {
  project: Project;
  index: number;
}

export function ProjectCard({ project, index }: ProjectCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <Card className="group h-full overflow-hidden border-[color:var(--color-rule)]/30 transition-all duration-300 hover:border-[color:var(--color-accent)] hover:shadow-lg hover:shadow-[color:var(--color-accent)]/10">
        <CardHeader>
          <CardTitle className="text-[color:var(--color-ink)]">{project.title}</CardTitle>
          <CardDescription>{project.description}</CardDescription>
        </CardHeader>

        <CardContent>
          {project.metrics && project.metrics.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-2">
              {project.metrics.map((metric) => (
                <Badge
                  key={metric}
                  className="bg-[color:var(--color-ink)]/10 text-[color:var(--color-ink)] border border-[color:var(--color-ink)]/20"
                >
                  {metric}
                </Badge>
              ))}
            </div>
          )}

          <div className="mb-4 flex flex-wrap gap-2">
            {project.techStack.map((tech) => (
              <Badge
                key={tech}
                variant="secondary"
                className="bg-[color:var(--color-rule)]/30 text-[color:var(--color-ink)]"
              >
                {tech}
              </Badge>
            ))}
          </div>

          <div className="flex gap-2">
            {project.githubUrl && (
              <Button asChild variant="outline" size="sm">
                <Link href={project.githubUrl} target="_blank" rel="noopener noreferrer">
                  <Github className="mr-1 size-4" /> Code
                </Link>
              </Button>
            )}
            {project.liveUrl && (
              <Button
                asChild
                size="sm"
                className="bg-[color:var(--color-ink)] hover:bg-[color:var(--color-accent)]"
              >
                <Link href={project.liveUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="mr-1 size-4" /> Live Demo
                </Link>
              </Button>
            )}
          </div>
          {project.slug && (
            <div className="mt-3">
              <Link
                href={`/projects/${project.slug}`}
                className="text-sm text-[color:var(--color-accent)] hover:text-[color:var(--color-ink)] underline underline-offset-2 transition-colors"
              >
                View Details →
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

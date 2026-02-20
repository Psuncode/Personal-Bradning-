"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, ExternalLink, Github } from "lucide-react";
import { Container } from "@/components/layout/container";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { Project } from "@/types";

interface ProjectDetailViewProps {
  project: Project;
}

function DetailSection({
  label,
  content,
  delay,
}: {
  label: string;
  content: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
    >
      <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-byu-light-blue">
        {label}
      </p>
      <p className="text-byu-dark-gray/90 leading-relaxed">{content}</p>
    </motion.div>
  );
}

export function ProjectDetailView({ project }: ProjectDetailViewProps) {
  const hasNarrative = project.problem || project.solution || project.results;

  return (
    <Container>
      {/* Back link */}
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-8"
      >
        <Link
          href="/projects"
          className="inline-flex items-center gap-1.5 text-sm text-byu-dark-gray/60 hover:text-byu-navy transition-colors"
        >
          <ArrowLeft className="size-4" />
          Back to Projects
        </Link>
      </motion.div>

      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-10 overflow-hidden rounded-2xl"
      >
        {project.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={project.image}
            alt={project.title}
            className="h-72 w-full object-cover"
          />
        ) : (
          <div className="flex h-64 items-center justify-center bg-gradient-to-br from-byu-navy via-byu-blue to-byu-navy">
            <h1 className="text-4xl font-bold text-white">{project.title}</h1>
          </div>
        )}
      </motion.div>

      {/* Title + description (when image is present) */}
      {project.image && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
          className="mb-6"
        >
          <h1 className="text-3xl font-bold text-byu-navy sm:text-4xl">
            {project.title}
          </h1>
        </motion.div>
      )}

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="mb-6 max-w-2xl text-lg text-byu-dark-gray/80 leading-relaxed"
      >
        {project.description}
      </motion.p>

      {/* Action buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15 }}
        className="mb-10 flex flex-wrap gap-3"
      >
        {project.githubUrl && (
          <Button asChild variant="outline" size="sm">
            <Link href={project.githubUrl} target="_blank" rel="noopener noreferrer">
              <Github className="mr-1.5 size-4" /> View Code
            </Link>
          </Button>
        )}
        {project.liveUrl && (
          <Button asChild size="sm" className="bg-byu-navy hover:bg-byu-blue">
            <Link href={project.liveUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="mr-1.5 size-4" /> Live Demo
            </Link>
          </Button>
        )}
      </motion.div>

      <Separator className="mb-10" />

      {/* Problem / Solution / Results */}
      {hasNarrative && (
        <div className="mb-12 grid gap-8 sm:grid-cols-1 lg:grid-cols-3">
          {project.problem && (
            <DetailSection label="The Problem" content={project.problem} delay={0} />
          )}
          {project.solution && (
            <DetailSection label="The Solution" content={project.solution} delay={0.1} />
          )}
          {project.results && (
            <DetailSection label="The Results" content={project.results} delay={0.2} />
          )}
        </div>
      )}

      {/* Metrics */}
      {project.metrics && project.metrics.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-12"
        >
          <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-byu-light-blue">
            Key Metrics
          </p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {project.metrics.map((metric, i) => (
              <Card key={i} className="border-byu-sky/30 bg-byu-sky/10 text-center">
                <CardContent className="pt-6 pb-5">
                  <p className="text-2xl font-bold text-byu-navy">{metric}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>
      )}

      {/* Tech stack */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="mb-12"
      >
        <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-byu-light-blue">
          Tech Stack
        </p>
        <div className="flex flex-wrap gap-2">
          {project.techStack.map((tech) => (
            <Badge
              key={tech}
              variant="secondary"
              className="bg-byu-sky/30 text-byu-navy"
            >
              {tech}
            </Badge>
          ))}
        </div>
      </motion.div>

      {/* Lessons learned */}
      {project.lessonsLearned && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="rounded-xl border border-byu-sky/30 bg-byu-sky/20 p-6"
        >
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-byu-light-blue">
            Lessons Learned
          </p>
          <p className="italic text-byu-dark-gray/80 leading-relaxed">
            &ldquo;{project.lessonsLearned}&rdquo;
          </p>
        </motion.div>
      )}
    </Container>
  );
}

"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { Project } from "@/types";

interface ProjectDetailViewProps {
  project: Project;
}

export function ProjectDetailView({ project }: ProjectDetailViewProps) {
  const hasNarrative = project.problem || project.solution || project.results;

  return (
    <div>
      {/* Dark hero */}
      <div className="bg-gray-900 text-white pt-16 pb-16 px-6 md:px-12">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="mb-8"
          >
            <Link
              href="/projects"
              className="inline-flex items-center gap-1.5 text-sm text-gray-300 hover:text-white transition-colors"
            >
              <ArrowLeft className="size-4" />
              Back to Projects
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <span className="inline-block px-3 py-1 bg-white/20 text-white rounded-full text-sm mb-6">
              {project.techStack[0]}
            </span>
            <h1 className="font-[family-name:var(--font-playfair)] text-4xl md:text-6xl text-white mb-4">
              {project.title}
            </h1>
            <p className="text-gray-300 text-lg italic mb-10 max-w-2xl">{project.description}</p>

            {project.metrics && project.metrics.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-10">
                {project.metrics.map((metric, i) => (
                  <div key={i} className="bg-white/10 rounded-xl p-4 text-center">
                    <p className="text-white font-semibold">{metric}</p>
                  </div>
                ))}
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              {project.techStack.map((tech) => (
                <span key={tech} className="px-3 py-1 bg-white/20 text-white rounded-full text-sm">
                  {tech}
                </span>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Content sections */}
      <div className="py-24 px-6 md:px-12">
        <div className="max-w-4xl mx-auto space-y-16">
          {hasNarrative && (
            <>
              {project.problem && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5 }}
                >
                  <h2 className="font-semibold uppercase tracking-wider text-sm text-gray-900 mb-4">
                    Problem / Challenge
                  </h2>
                  <p className="text-gray-600 leading-relaxed text-lg">{project.problem}</p>
                </motion.div>
              )}

              {project.solution && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                >
                  <h2 className="font-semibold uppercase tracking-wider text-sm text-gray-900 mb-4">
                    Solution / Approach
                  </h2>
                  <p className="text-gray-600 leading-relaxed text-lg">{project.solution}</p>
                </motion.div>
              )}

              {project.results && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <h2 className="font-semibold uppercase tracking-wider text-sm text-gray-900 mb-4">
                    Results / Outcomes
                  </h2>
                  <p className="text-gray-600 leading-relaxed text-lg">{project.results}</p>
                </motion.div>
              )}
            </>
          )}

          {/* Tech stack */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="font-semibold uppercase tracking-wider text-sm text-gray-900 mb-4">
              Tech Stack
            </h2>
            <div className="flex flex-wrap gap-2">
              {project.techStack.map((tech) => (
                <span key={tech} className="px-3 py-1 bg-gray-900 text-white rounded-full text-sm">
                  {tech}
                </span>
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
            >
              <h2 className="font-semibold uppercase tracking-wider text-sm text-gray-900 mb-4">
                Lessons Learned
              </h2>
              <blockquote className="bg-gray-50 rounded-2xl p-8 italic text-gray-700 leading-relaxed text-lg">
                &ldquo;{project.lessonsLearned}&rdquo;
              </blockquote>
            </motion.div>
          )}

          {/* CTA */}
          <div className="text-center border-t border-gray-200 pt-12">
            <p className="text-gray-600 mb-6">Want to learn more about this project?</p>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gray-900 text-white rounded-full hover:bg-gray-700 transition-colors font-medium"
            >
              Get in Touch
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

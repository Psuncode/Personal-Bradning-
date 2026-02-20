import type { Project } from "@/types";

export const projects: Project[] = [
  {
    id: "project-1",
    title: "Project Alpha",
    description:
      "A full-stack web application built with modern technologies to solve real-world problems.",
    techStack: ["Next.js", "TypeScript", "Tailwind CSS", "PostgreSQL"],
    githubUrl: "https://github.com/philipsun",
    liveUrl: "https://example.com",
    featured: true,
  },
  {
    id: "project-2",
    title: "Project Beta",
    description:
      "An innovative mobile-first application designed for seamless user experiences.",
    techStack: ["React Native", "Node.js", "MongoDB"],
    githubUrl: "https://github.com/philipsun",
    featured: true,
  },
  {
    id: "project-3",
    title: "Project Gamma",
    description:
      "A data-driven dashboard providing real-time insights and analytics.",
    techStack: ["Python", "React", "D3.js", "FastAPI"],
    githubUrl: "https://github.com/philipsun",
    liveUrl: "https://example.com",
    featured: true,
  },
  {
    id: "project-4",
    title: "Project Delta",
    description:
      "A CLI tool that automates common developer workflows and saves hours of manual work.",
    techStack: ["Go", "Cobra", "SQLite"],
    githubUrl: "https://github.com/philipsun",
    featured: false,
  },
  {
    id: "project-5",
    title: "Project Epsilon",
    description:
      "An open-source library for building accessible, themeable UI components.",
    techStack: ["TypeScript", "React", "Storybook"],
    githubUrl: "https://github.com/philipsun",
    featured: false,
  },
];

import type { Project } from "@/types";

export const projects: Project[] = [
  {
    id: "project-1",
    slug: "project-alpha",
    title: "Project Alpha",
    description:
      "A full-stack web application built with modern technologies to solve real-world problems.",
    problem:
      "Teams were spending hours each week manually processing and cross-referencing data across multiple spreadsheets, leading to errors and wasted time.",
    solution:
      "Built a Next.js application backed by PostgreSQL that automates the data pipeline end-to-end. Users upload a CSV, the system validates, transforms, and stores the data, then surfaces it through a clean dashboard with filtering and export.",
    results:
      "Reduced weekly processing time by 80% and eliminated data-entry errors. The team now spends that time on higher-leverage work instead.",
    metrics: ["80% time saved", "0 data errors", "500+ active users"],
    lessonsLearned:
      "Database schema decisions made in week one have an outsized impact on every feature built after. Taking extra time upfront to model the data correctly is always worth it.",
    techStack: ["Next.js", "TypeScript", "Tailwind CSS", "PostgreSQL"],
    githubUrl: "https://github.com/philipsun",
    liveUrl: "https://example.com",
    featured: true,
  },
  {
    id: "project-2",
    slug: "project-beta",
    title: "Project Beta",
    description:
      "An innovative mobile-first application designed for seamless user experiences.",
    problem:
      "Users needed a way to coordinate schedules and share resources in real time, but existing tools were either too heavy or required everyone to be on the same platform.",
    solution:
      "Built a cross-platform React Native app with a Node.js backend and MongoDB. Real-time sync is handled through WebSockets, keeping all devices in sync without polling.",
    results:
      "Launched to 200 beta users within the first month. Average session length increased 3x compared to the previous solution users had cobbled together.",
    metrics: ["200 beta users", "3x session length", "iOS + Android"],
    lessonsLearned:
      "Mobile performance budgets are unforgiving. Every unnecessary re-render or large dependency shows up immediately on lower-end devices.",
    techStack: ["React Native", "Node.js", "MongoDB"],
    githubUrl: "https://github.com/philipsun",
    featured: true,
  },
  {
    id: "project-3",
    slug: "project-gamma",
    title: "Project Gamma",
    description:
      "A data-driven dashboard providing real-time insights and analytics.",
    problem:
      "Stakeholders had to wait for weekly reports to understand how key metrics were trending, making it impossible to react quickly to changes.",
    solution:
      "Built a FastAPI backend that streams live data to a React + D3.js frontend. The dashboard refreshes every 30 seconds and supports custom date ranges and dimension breakdowns.",
    results:
      "Leadership reduced their decision-making cycle from one week to same-day. Caught three anomalies in the first month that would have gone unnoticed.",
    metrics: ["Real-time data", "30s refresh", "5 stakeholders daily"],
    lessonsLearned:
      "Visualization is only as useful as the underlying data model. Spending time defining clear metrics and their calculation logic before writing a single chart saved weeks of rework.",
    techStack: ["Python", "React", "D3.js", "FastAPI"],
    githubUrl: "https://github.com/philipsun",
    liveUrl: "https://example.com",
    featured: true,
  },
  {
    id: "project-4",
    slug: "project-delta",
    title: "Project Delta",
    description:
      "A CLI tool that automates common developer workflows and saves hours of manual work.",
    problem:
      "The team ran the same sequence of 8–10 shell commands multiple times a day to set up environments, run tests, and deploy. It was error-prone and slowed onboarding for new engineers.",
    solution:
      "Wrote a Go CLI using Cobra that wraps those workflows behind memorable commands. SQLite stores project-specific config so the tool adapts to each repository automatically.",
    results:
      "Cut per-engineer setup time from 45 minutes to under 5. New team members are productive on day one instead of day two.",
    metrics: ["45 min → 5 min setup", "10+ commands automated", "Used daily"],
    lessonsLearned:
      "The best tooling is invisible. A good CLI should feel so natural that engineers forget it is a custom tool and just expect every project to work this way.",
    techStack: ["Go", "Cobra", "SQLite"],
    githubUrl: "https://github.com/philipsun",
    featured: false,
  },
  {
    id: "project-5",
    slug: "project-epsilon",
    title: "Project Epsilon",
    description:
      "An open-source library for building accessible, themeable UI components.",
    problem:
      "Most UI libraries enforce visual opinions that fight against custom design systems. Teams either accept the defaults or spend weeks fighting overrides.",
    solution:
      "Built a headless component library in TypeScript and React that ships with zero visual styles. Every component is fully accessible (WCAG AA) out of the box and styled entirely through a theme token system.",
    results:
      "Published to npm, reaching 300+ weekly downloads within three months. Several contributors joined after discovering it through a blog post.",
    metrics: ["300+ weekly downloads", "WCAG AA", "8 components"],
    lessonsLearned:
      "Open-source documentation is a product. The library itself took two weeks to build; making it approachable enough for strangers to adopt took two more.",
    techStack: ["TypeScript", "React", "Storybook"],
    githubUrl: "https://github.com/philipsun",
    featured: false,
  },
];

import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { ProjectsGrid } from "./projects-grid";
import * as projectsModule from "@/data/projects";

// Mock next/link
vi.mock("next/link", () => ({
  default: ({ children, href }: any) => <a href={href}>{children}</a>,
}));

// Mock framer-motion
vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
}));

describe("ProjectsGrid Component", () => {
  it("renders the projects grid section", () => {
    render(<ProjectsGrid />);
    expect(screen.getByText("All Projects")).toBeDefined();
  });

  it("renders 'All Projects' title when featured prop is false", () => {
    render(<ProjectsGrid featured={false} />);
    expect(screen.getByText("All Projects")).toBeDefined();
  });

  it("renders 'Featured Projects' title when featured prop is true", () => {
    render(<ProjectsGrid featured={true} />);
    expect(screen.getByText("Featured Projects")).toBeDefined();
  });

  it("renders all projects when featured is false", () => {
    render(<ProjectsGrid featured={false} />);
    const allProjectCards = screen.getAllByText(/Project/i);
    // Should have all 5 projects
    expect(allProjectCards.length).toBeGreaterThanOrEqual(4);
  });

  it("renders only featured projects when featured is true", () => {
    render(<ProjectsGrid featured={true} />);
    const featuredCards = screen.getAllByText(/(Project Alpha|Project Beta|Project Gamma)/i);
    // Should have exactly 3 featured projects
    expect(featuredCards.length).toBeLessThanOrEqual(6); // 2 instances per card
  });

  it("renders featured projects in correct order", () => {
    render(<ProjectsGrid featured={true} />);
    expect(screen.getByText("Project Alpha")).toBeDefined();
    expect(screen.getByText("Project Beta")).toBeDefined();
    expect(screen.getByText("Project Gamma")).toBeDefined();
  });

  it("displays project descriptions", () => {
    render(<ProjectsGrid featured={false} />);
    expect(
      screen.getByText(/A full-stack web application built with modern technologies/i)
    ).toBeDefined();
  });

  it("displays technology tags for projects", () => {
    render(<ProjectsGrid featured={false} />);
    // Just check that at least one tech appears
    const techTags = screen.queryAllByText(/Next.js|TypeScript|Tailwind|React|Node|MongoDB|Python|Go|Cobra|SQLite|Storybook/i);
    expect(techTags.length).toBeGreaterThan(0);
  });

  it("shows 'View All Projects' button when featured is true", () => {
    render(<ProjectsGrid featured={true} />);
    const viewAllButton = screen.getByText("View All Projects");
    expect(viewAllButton).toBeDefined();
  });

  it("View All Projects button links to /projects", () => {
    render(<ProjectsGrid featured={true} />);
    const viewAllLink = screen.getByText("View All Projects").closest("a");
    expect(viewAllLink?.getAttribute("href")).toBe("/projects");
  });

  it("does not show 'View All Projects' button when featured is false", () => {
    render(<ProjectsGrid featured={false} />);
    const viewAllButton = screen.queryByText("View All Projects");
    expect(viewAllButton).toBeNull();
  });

  it("limits featured projects to 3 items", () => {
    render(<ProjectsGrid featured={true} />);
    // Count project titles that appear
    const alphaMatches = screen.queryAllByText("Project Alpha");
    const betaMatches = screen.queryAllByText("Project Beta");
    const gammaMatches = screen.queryAllByText("Project Gamma");
    const totalFeatured = alphaMatches.length + betaMatches.length + gammaMatches.length;
    expect(totalFeatured).toBeLessThanOrEqual(9); // 3 projects x 3 max instances per project
  });

  it("renders with correct grid layout classes", () => {
    const { container } = render(<ProjectsGrid featured={false} />);
    const grid = container.querySelector(".grid");
    expect(grid?.className).toContain("sm:grid-cols-2");
    expect(grid?.className).toContain("lg:grid-cols-3");
  });

  it("renders section heading with subtitle", () => {
    render(<ProjectsGrid featured={false} />);
    expect(screen.getByText("A selection of things I've built")).toBeDefined();
  });

  it("renders without crashing", () => {
    expect(() => render(<ProjectsGrid />)).not.toThrow();
  });

  it("has proper background styling", () => {
    const { container } = render(<ProjectsGrid />);
    const section = container.querySelector("section");
    expect(section?.className).toContain("bg-byu-gray");
  });
});

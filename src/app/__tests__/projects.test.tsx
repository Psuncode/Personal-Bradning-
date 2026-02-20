import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import ProjectsPage from "@/app/projects/page";

// Mock next/link
vi.mock("next/link", () => ({
  default: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

// Mock framer-motion
vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
}));

describe("Projects Page", () => {
  it("renders the projects page", () => {
    render(<ProjectsPage />);
    expect(screen.getByText("All Projects")).toBeDefined();
  });

  it("renders page heading", () => {
    render(<ProjectsPage />);
    const heading = screen.getByText("All Projects");
    expect(heading).toBeDefined();
  });

  it("renders all projects", () => {
    render(<ProjectsPage />);
    // Check for multiple project titles
    expect(screen.getByText("Project Alpha")).toBeDefined();
    expect(screen.getByText("Project Beta")).toBeDefined();
    expect(screen.getByText("Project Gamma")).toBeDefined();
  });

  it("displays more than 3 projects (all projects, not just featured)", () => {
    render(<ProjectsPage />);
    // Check that all 5 projects are rendered
    expect(screen.getByText("Project Alpha")).toBeDefined();
    expect(screen.getByText("Project Beta")).toBeDefined();
    expect(screen.getByText("Project Gamma")).toBeDefined();
    expect(screen.getByText("Project Delta")).toBeDefined();
    expect(screen.getByText("Project Epsilon")).toBeDefined();
  });

  it("renders project descriptions", () => {
    render(<ProjectsPage />);
    expect(
      screen.getByText(/A full-stack web application built with modern technologies/i)
    ).toBeDefined();
    expect(
      screen.getByText(/An innovative mobile-first application/i)
    ).toBeDefined();
  });

  it("displays tech stack for all projects", () => {
    render(<ProjectsPage />);
    expect(screen.getByText("Next.js")).toBeDefined();
    expect(screen.getByText("React Native")).toBeDefined();
    expect(screen.getByText("Python")).toBeDefined();
    expect(screen.getByText("Go")).toBeDefined();
  });

  it("renders project links", () => {
    render(<ProjectsPage />);
    const links = screen.getAllByRole("link");
    // Should have multiple project links (Code, Live Demo links)
    expect(links.length).toBeGreaterThan(0);
  });

  it("has no View All Projects button (already on all projects page)", () => {
    render(<ProjectsPage />);
    const viewAllButton = screen.queryByText("View All Projects");
    expect(viewAllButton).toBeNull();
  });

  it("renders with proper padding", () => {
    const { container } = render(<ProjectsPage />);
    const wrapper = container.firstChild;
    expect(wrapper?.className).toContain("pt-8");
  });

  it("displays grid layout for projects", () => {
    const { container } = render(<ProjectsPage />);
    const grid = container.querySelector(".grid");
    expect(grid?.className).toContain("sm:grid-cols-2");
    expect(grid?.className).toContain("lg:grid-cols-3");
  });

  it("renders section with subtitle", () => {
    render(<ProjectsPage />);
    expect(screen.getByText("A selection of things I've built")).toBeDefined();
  });

  it("renders without crashing", () => {
    expect(() => render(<ProjectsPage />)).not.toThrow();
  });

  it("displays both featured and non-featured projects", () => {
    render(<ProjectsPage />);
    // Project Alpha, Beta, Gamma are featured
    // Project Delta, Epsilon are not featured
    expect(screen.getByText("Project Delta")).toBeDefined();
    expect(screen.getByText("Project Epsilon")).toBeDefined();
  });

  it("shows all projects with their descriptions", () => {
    render(<ProjectsPage />);
    const descriptions = [
      "A full-stack web application",
      "An innovative mobile-first application",
      "A data-driven dashboard",
      "A CLI tool that automates",
      "An open-source library",
    ];
    descriptions.forEach((desc) => {
      expect(screen.getByText(new RegExp(desc))).toBeDefined();
    });
  });

  it("renders projects in grid with proper gap", () => {
    const { container } = render(<ProjectsPage />);
    const grid = container.querySelector(".grid.gap-8");
    expect(grid).toBeDefined();
  });
});

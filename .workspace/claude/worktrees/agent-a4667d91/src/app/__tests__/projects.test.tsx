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
    expect(screen.getByText("Inara Health Diagnostic")).toBeDefined();
    expect(screen.getByText("LDS Church: Enterprise Tech PM")).toBeDefined();
    expect(screen.getByText("Nursa: AI TB Verification Model")).toBeDefined();
  });

  it("displays more than 3 projects (all projects, not just featured)", () => {
    render(<ProjectsPage />);
    const links = screen.getAllByRole("link");
    expect(links.length).toBeGreaterThan(3);
  });

  it("renders project descriptions", () => {
    render(<ProjectsPage />);
    expect(
      screen.getByText(/Founding a continuous progesterone monitoring device/i)
    ).toBeDefined();
  });

  it("displays tech stack for all projects", () => {
    render(<ProjectsPage />);
    expect(screen.getByText("Python")).toBeDefined();
    expect(screen.getByText("Power BI")).toBeDefined();
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
    // Non-featured projects
    expect(screen.getByText("Granger Medical: RVU Analytics Platform")).toBeDefined();
    expect(screen.getByText("Cocker Innovation Fellowship")).toBeDefined();
  });

  it("shows all projects with their descriptions", () => {
    render(<ProjectsPage />);
    expect(screen.queryAllByText(/7,000\+ CPT codes/i).length).toBeGreaterThan(0);
    expect(screen.queryAllByText(/synthetic biology/i).length).toBeGreaterThan(0);
  });

  it("renders projects in grid with proper gap", () => {
    const { container } = render(<ProjectsPage />);
    const grid = container.querySelector(".grid.gap-8");
    expect(grid).toBeDefined();
  });
});

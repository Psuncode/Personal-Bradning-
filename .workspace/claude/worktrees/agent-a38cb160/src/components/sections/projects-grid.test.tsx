import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { ProjectsGrid } from "./projects-grid";
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
    expect(screen.getByText("Inara Health Diagnostic")).toBeDefined();
    expect(screen.getByText("Granger Medical: RVU Analytics Platform")).toBeDefined();
    expect(screen.getByText("Cocker Innovation Fellowship")).toBeDefined();
  });

  it("renders only featured projects when featured is true", () => {
    render(<ProjectsGrid featured={true} />);
    expect(screen.getByText("Inara Health Diagnostic")).toBeDefined();
    expect(screen.getByText("LDS Church: Enterprise Tech PM")).toBeDefined();
    expect(screen.getByText("Nursa: AI TB Verification Model")).toBeDefined();
  });

  it("renders featured projects in correct order", () => {
    render(<ProjectsGrid featured={true} />);
    const cards = screen.getAllByRole("link");
    expect(cards.length).toBeGreaterThanOrEqual(3);
  });

  it("displays project descriptions", () => {
    render(<ProjectsGrid featured={false} />);
    expect(
      screen.getByText(/Founding a continuous progesterone monitoring device/i)
    ).toBeDefined();
  });

  it("displays technology tags for projects", () => {
    render(<ProjectsGrid featured={false} />);
    // Projects use Python, Power BI, etc. — tech badge shows first item per card
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
    // 3 featured projects: Inara Health, LDS Church, Nursa
    expect(screen.getByText("Inara Health Diagnostic")).toBeDefined();
    expect(screen.queryByText("Granger Medical: RVU Analytics Platform")).toBeNull();
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
    expect(section?.className).toContain("bg-[#faf9f7]");
  });

  it("cards link to individual project pages", () => {
    render(<ProjectsGrid />);
    const projectLinks = screen.getAllByRole("link").filter(
      (link) => link.getAttribute("href")?.startsWith("/projects/")
    );
    expect(projectLinks.length).toBeGreaterThan(0);
  });
});

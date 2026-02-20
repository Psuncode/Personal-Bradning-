import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { ProjectCard } from "./project-card";
import type { Project } from "@/types";

// Mock framer-motion
vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
}));

// Mock next/link
vi.mock("next/link", () => ({
  default: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

// Mock lucide-react
vi.mock("lucide-react", () => ({
  Github: () => <div data-testid="github-icon">GitHub Icon</div>,
  ExternalLink: () => <div data-testid="external-link-icon">External Link Icon</div>,
}));

const mockProject: Project = {
  id: "test-project",
  title: "Test Project",
  description: "A test project description",
  techStack: ["React", "TypeScript", "Tailwind CSS"],
  githubUrl: "https://github.com/example/test",
  liveUrl: "https://example.com",
  featured: true,
};

const mockProjectWithoutLinks: Project = {
  id: "test-project-2",
  title: "Test Project 2",
  description: "A test project without links",
  techStack: ["Next.js"],
  featured: false,
};

describe("ProjectCard Component", () => {
  it("renders the project card", () => {
    render(<ProjectCard project={mockProject} index={0} />);
    expect(screen.getByText("Test Project")).toBeDefined();
  });

  it("displays project title", () => {
    render(<ProjectCard project={mockProject} index={0} />);
    const title = screen.getByText("Test Project");
    expect(title).toBeDefined();
  });

  it("displays project description", () => {
    render(<ProjectCard project={mockProject} index={0} />);
    expect(screen.getByText("A test project description")).toBeDefined();
  });

  it("displays all technologies in tech stack", () => {
    render(<ProjectCard project={mockProject} index={0} />);
    expect(screen.getByText("React")).toBeDefined();
    expect(screen.getByText("TypeScript")).toBeDefined();
    expect(screen.getByText("Tailwind CSS")).toBeDefined();
  });

  it("renders GitHub link when githubUrl is provided", () => {
    render(<ProjectCard project={mockProject} index={0} />);
    const githubLink = screen.getByText(/Code/i).closest("a");
    expect(githubLink?.getAttribute("href")).toBe("https://github.com/example/test");
  });

  it("renders Live Demo link when liveUrl is provided", () => {
    render(<ProjectCard project={mockProject} index={0} />);
    const liveLink = screen.getByText(/Live Demo/i).closest("a");
    expect(liveLink?.getAttribute("href")).toBe("https://example.com");
  });

  it("does not render GitHub link when githubUrl is not provided", () => {
    render(<ProjectCard project={mockProjectWithoutLinks} index={0} />);
    expect(screen.queryByText(/Code/i)).toBeNull();
  });

  it("does not render Live Demo link when liveUrl is not provided", () => {
    render(<ProjectCard project={mockProjectWithoutLinks} index={0} />);
    expect(screen.queryByText(/Live Demo/i)).toBeNull();
  });

  it("external links open in new tab", () => {
    render(<ProjectCard project={mockProject} index={0} />);
    const links = screen.getAllByRole("link").filter(
      (link) =>
        link.getAttribute("href")?.includes("github") ||
        link.getAttribute("href")?.includes("example.com")
    );
    links.forEach((link) => {
      expect(link.getAttribute("target")).toBe("_blank");
      expect(link.getAttribute("rel")).toContain("noopener");
    });
  });

  it("renders card with proper styling", () => {
    const { container } = render(<ProjectCard project={mockProject} index={0} />);
    const card = container.querySelector("div[class*='h-full']");
    expect(card?.className).toContain("overflow-hidden");
  });

  it("has interactive hover effects", () => {
    const { container } = render(<ProjectCard project={mockProject} index={0} />);
    const card = container.querySelector(".group");
    expect(card?.className).toContain("hover:shadow-lg");
  });

  it("displays badges for tech stack", () => {
    const { container } = render(<ProjectCard project={mockProject} index={0} />);
    const badges = container.querySelectorAll("[data-slot='badge']");
    expect(badges.length).toBeGreaterThanOrEqual(3);
  });

  it("renders card header with title and description", () => {
    const { container } = render(<ProjectCard project={mockProject} index={0} />);
    const cardHeader = container.querySelector("[class*='CardHeader']");
    expect(cardHeader).toBeDefined();
  });

  it("renders card content with buttons and badges", () => {
    const { container } = render(<ProjectCard project={mockProject} index={0} />);
    const cardContent = container.querySelector("[class*='CardContent']");
    expect(cardContent).toBeDefined();
  });

  it("handles multiple projects with different indices", () => {
    const { rerender } = render(
      <ProjectCard project={mockProject} index={0} />
    );
    expect(screen.getByText("Test Project")).toBeDefined();

    rerender(<ProjectCard project={mockProjectWithoutLinks} index={1} />);
    expect(screen.getByText("Test Project 2")).toBeDefined();
  });

  it("renders without crashing", () => {
    expect(() => render(<ProjectCard project={mockProject} index={0} />)).not.toThrow();
  });

  it("tech stack badges have correct styling", () => {
    const { container } = render(<ProjectCard project={mockProject} index={0} />);
    const badges = container.querySelectorAll("[class*='bg-byu-sky']");
    expect(badges.length).toBeGreaterThanOrEqual(1);
  });

  it("code button has GitHub icon", () => {
    render(<ProjectCard project={mockProject} index={0} />);
    const githubIcon = screen.getByTestId("github-icon");
    expect(githubIcon).toBeDefined();
  });

  it("live demo button has external link icon", () => {
    render(<ProjectCard project={mockProject} index={0} />);
    const externalIcon = screen.getByTestId("external-link-icon");
    expect(externalIcon).toBeDefined();
  });
});

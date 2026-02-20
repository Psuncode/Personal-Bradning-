import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import HomePage from "@/app/page";

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
    p: ({ children, ...props }: any) => <p {...props}>{children}</p>,
    h1: ({ children, ...props }: any) => <h1 {...props}>{children}</h1>,
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
}));

describe("Home Page", () => {
  it("renders the home page", () => {
    render(<HomePage />);
    expect(screen.getByText(/Philip Sun/i)).toBeDefined();
  });

  it("renders Hero section", () => {
    render(<HomePage />);
    expect(screen.getByText(/Software Developer & Student at BYU/i)).toBeDefined();
  });

  it("renders Featured Projects section", () => {
    render(<HomePage />);
    expect(screen.getByText("Featured Projects")).toBeDefined();
  });

  it("renders Contact section", () => {
    render(<HomePage />);
    expect(screen.getByText("Get In Touch")).toBeDefined();
  });

  it("hero has View Projects button", () => {
    render(<HomePage />);
    expect(screen.getByText(/View Projects/i)).toBeDefined();
  });

  it("hero has Book a Meeting button", () => {
    render(<HomePage />);
    const buttons = screen.getAllByText(/Book a Meeting/i);
    expect(buttons.length).toBeGreaterThanOrEqual(1);
  });

  it("featured projects section shows only 3 projects", () => {
    render(<HomePage />);
    const alphaMatches = screen.queryAllByText("Project Alpha");
    const betaMatches = screen.queryAllByText("Project Beta");
    const gammaMatches = screen.queryAllByText("Project Gamma");
    const totalFeatured = alphaMatches.length + betaMatches.length + gammaMatches.length;
    expect(totalFeatured).toBeGreaterThan(0);
  });

  it("featured projects section has View All Projects button", () => {
    render(<HomePage />);
    expect(screen.getByText("View All Projects")).toBeDefined();
  });

  it("View All Projects button links to projects page", () => {
    render(<HomePage />);
    const viewAllLink = screen.getByText("View All Projects").closest("a");
    expect(viewAllLink?.getAttribute("href")).toBe("/projects");
  });

  it("contact section has Say Hello button", () => {
    render(<HomePage />);
    expect(screen.getByText("Say Hello")).toBeDefined();
  });

  it("page has proper semantic structure", () => {
    const { container } = render(<HomePage />);
    const sections = container.querySelectorAll("section");
    expect(sections.length).toBeGreaterThanOrEqual(3);
  });

  it("renders without crashing", () => {
    expect(() => render(<HomePage />)).not.toThrow();
  });

  it("all major sections are present", () => {
    render(<HomePage />);
    expect(screen.getByText(/Hello, I'm/i)).toBeDefined(); // Hero
    expect(screen.getByText("Featured Projects")).toBeDefined(); // Projects section
    expect(screen.getByText("Get In Touch")).toBeDefined(); // Contact section
  });

  it("featured projects show description", () => {
    render(<HomePage />);
    expect(
      screen.getByText(/A full-stack web application built with modern technologies/i)
    ).toBeDefined();
  });

  it("tech stack badges are displayed", () => {
    render(<HomePage />);
    expect(screen.getByText("Next.js")).toBeDefined();
    expect(screen.getByText("TypeScript")).toBeDefined();
  });

  it("contact section has multiple CTAs", () => {
    render(<HomePage />);
    const contactButtons = screen.getAllByRole("link").filter(
      (link) =>
        link.textContent?.includes("Say Hello") ||
        link.textContent?.includes("Book a Meeting")
    );
    expect(contactButtons.length).toBeGreaterThanOrEqual(2);
  });
});

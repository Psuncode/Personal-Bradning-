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
  animate: {},
}));

describe("Home Page", () => {
  it("renders the home page", () => {
    render(<HomePage />);
    expect(screen.getByText(/Creative Thinker/i)).toBeDefined();
  });

  it("renders Hero section", () => {
    render(<HomePage />);
    expect(screen.getByText(/Product Manager specializing in Healthcare Technology/i)).toBeDefined();
  });

  it("renders About section", () => {
    render(<HomePage />);
    expect(screen.getByText(/Building healthcare solutions/i)).toBeDefined();
  });

  it("renders Featured Work section", () => {
    render(<HomePage />);
    expect(screen.getByText("Featured Work")).toBeDefined();
  });

  it("renders Projects & Thought Leadership section", () => {
    render(<HomePage />);
    expect(screen.getByText(/Projects.*Thought Leadership/i)).toBeDefined();
  });

  it("hero has Get in Touch button", () => {
    render(<HomePage />);
    expect(screen.getAllByText(/Get in Touch/i).length).toBeGreaterThanOrEqual(1);
  });

  it("hero has View Resume button", () => {
    render(<HomePage />);
    expect(screen.getAllByText(/View Resume/i).length).toBeGreaterThanOrEqual(1);
  });

  it("featured work section shows project cards", () => {
    render(<HomePage />);
    expect(screen.getAllByText(/Inara Health/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/LDS Church/i).length).toBeGreaterThan(0);
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
    expect(screen.getByText(/Creative Thinker/i)).toBeDefined(); // Hero
    expect(screen.getByText("Featured Work")).toBeDefined(); // CaseStudies
    expect(screen.getByText(/Projects.*Thought Leadership/i)).toBeDefined(); // ContentGrid
  });
});

import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { Hero } from "./hero";

// Mock framer-motion to avoid animation issues in tests
vi.mock("framer-motion", () => ({
  motion: {
    p: ({ children, ...props }: any) => <p {...props}>{children}</p>,
    h1: ({ children, ...props }: any) => <h1 {...props}>{children}</h1>,
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
}));

// Mock next/link
vi.mock("next/link", () => ({
  default: ({ children, href }: any) => <a href={href}>{children}</a>,
}));

describe("Hero Component", () => {
  it("renders the hero section", () => {
    render(<Hero />);
    expect(screen.getByText(/Hello, I'm/i)).toBeDefined();
  });

  it("renders the greeting text", () => {
    render(<Hero />);
    expect(screen.getByText(/Hello, I'm/i)).toBeDefined();
  });

  it("renders the name 'Philip Sun'", () => {
    render(<Hero />);
    expect(screen.getByText(/Philip Sun/i)).toBeDefined();
  });

  it("renders the subtitle", () => {
    render(<Hero />);
    expect(screen.getByText(/Software Developer & Student at BYU/i)).toBeDefined();
  });

  it("renders the description text", () => {
    render(<Hero />);
    expect(
      screen.getByText(
        /Building things that matter. Passionate about creating clean,\s*thoughtful software that solves real problems./i
      )
    ).toBeDefined();
  });

  it("renders View Projects button", () => {
    render(<Hero />);
    const viewProjectsBtn = screen.getByText(/View Projects/i);
    expect(viewProjectsBtn).toBeDefined();
  });

  it("renders Book a Meeting button", () => {
    render(<Hero />);
    const bookMeetingBtn = screen.getByText(/Book a Meeting/i);
    expect(bookMeetingBtn).toBeDefined();
  });

  it("has correct link for View Projects", () => {
    render(<Hero />);
    const viewProjectsLink = screen.getByText(/View Projects/i).closest("a");
    expect(viewProjectsLink?.getAttribute("href")).toBe("/projects");
  });

  it("has correct link for Book a Meeting", () => {
    render(<Hero />);
    const bookMeetingLink = screen.getByText(/Book a Meeting/i).closest("a");
    expect(bookMeetingLink?.getAttribute("href")).toBe("/meet");
  });

  it("renders with gradient background classes", () => {
    const { container } = render(<Hero />);
    const section = container.querySelector("section");
    expect(section?.className).toContain("bg-gradient-to-br");
  });

  it("applies min-height for responsive layout", () => {
    const { container } = render(<Hero />);
    const section = container.querySelector("section");
    expect(section?.className).toContain("min-h-[90vh]");
  });

  it("renders all CTA buttons as interactive elements", () => {
    render(<Hero />);
    const buttons = screen.getAllByRole("link");
    expect(buttons.length).toBeGreaterThanOrEqual(2);
  });

  it("contains text content in proper hierarchy", () => {
    const { container } = render(<Hero />);
    const heading = container.querySelector("h1");
    expect(heading?.textContent).toBe("Philip Sun");
  });

  it("renders without crashing with animations", () => {
    expect(() => render(<Hero />)).not.toThrow();
  });
});

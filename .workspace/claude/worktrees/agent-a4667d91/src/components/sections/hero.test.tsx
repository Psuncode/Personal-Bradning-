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
  animate: {},
}));

// Mock next/link
vi.mock("next/link", () => ({
  default: ({ children, href }: any) => <a href={href}>{children}</a>,
}));

describe("Hero Component", () => {
  it("renders the hero section", () => {
    render(<Hero />);
    expect(screen.getByText(/Creative Thinker/i)).toBeDefined();
  });

  it("renders the main heading", () => {
    render(<Hero />);
    expect(screen.getByText(/Creative Thinker\. Modern Builder\./i)).toBeDefined();
  });

  it("renders the subtitle description", () => {
    render(<Hero />);
    expect(screen.getByText(/Product Manager specializing in Healthcare Technology/i)).toBeDefined();
  });

  it("renders Get in Touch button", () => {
    render(<Hero />);
    expect(screen.getByText(/Get in Touch/i)).toBeDefined();
  });

  it("renders View Resume button", () => {
    render(<Hero />);
    expect(screen.getByText(/View Resume/i)).toBeDefined();
  });

  it("has correct link for Get in Touch", () => {
    render(<Hero />);
    const link = screen.getByText(/Get in Touch/i).closest("a");
    expect(link?.getAttribute("href")).toBe("/contact");
  });

  it("has correct link for View Resume", () => {
    render(<Hero />);
    const link = screen.getByText(/View Resume/i).closest("a");
    expect(link?.getAttribute("href")).toBe("/resume");
  });

  it("renders all CTA buttons as interactive elements", () => {
    render(<Hero />);
    const buttons = screen.getAllByRole("link");
    expect(buttons.length).toBeGreaterThanOrEqual(2);
  });

  it("renders with dark background", () => {
    const { container } = render(<Hero />);
    const section = container.querySelector("section");
    expect(section?.className).toContain("bg-[#0a0a0a]");
  });

  it("applies min-height for responsive layout", () => {
    const { container } = render(<Hero />);
    const section = container.querySelector("section");
    expect(section?.className).toContain("min-h-screen");
  });

  it("contains heading text in h1", () => {
    const { container } = render(<Hero />);
    const heading = container.querySelector("h1");
    expect(heading?.textContent).toContain("Creative Thinker");
  });

  it("renders without crashing with animations", () => {
    expect(() => render(<Hero />)).not.toThrow();
  });
});

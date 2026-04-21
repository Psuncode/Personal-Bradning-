import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { Hero } from "./hero";

vi.mock("framer-motion", () => ({
  motion: {
    p: ({ children, ...props }: any) => <p {...props}>{children}</p>,
    h1: ({ children, ...props }: any) => <h1 {...props}>{children}</h1>,
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  useReducedMotion: () => false,
}));

vi.mock("next/link", () => ({
  default: ({ children, href }: any) => <a href={href}>{children}</a>,
}));

describe("Hero Component", () => {
  it("renders the editorial kicker", () => {
    render(<Hero />);
    expect(screen.getByText("Philip Sun")).toBeDefined();
  });

  it("renders the new thesis-led headline", () => {
    render(<Hero />);
    expect(
      screen.getByText(/I build product strategy, operating leverage, and trust/i),
    ).toBeDefined();
  });

  it("renders supporting positioning copy", () => {
    render(<Hero />);
    expect(
      screen.getByText(/Product manager, founder, and selective builder across healthcare, systems, and craft/i),
    ).toBeDefined();
  });

  it("renders the primary and secondary CTAs", () => {
    render(<Hero />);
    expect(screen.getByText(/Book a Call/i)).toBeDefined();
    expect(screen.getByText(/View Resume/i)).toBeDefined();
  });

  it("links Book a Call to /meet", () => {
    render(<Hero />);
    expect(screen.getByText(/Book a Call/i).closest("a")?.getAttribute("href")).toBe("/meet");
  });

  it("links View Resume to /resume", () => {
    render(<Hero />);
    expect(screen.getByText(/View Resume/i).closest("a")?.getAttribute("href")).toBe("/resume");
  });

  it("does not use the old dark hero treatment", () => {
    const { container } = render(<Hero />);
    expect(container.querySelector("section")?.className).not.toContain("bg-[#0a0a0a]");
  });
});

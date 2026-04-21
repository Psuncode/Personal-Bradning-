import { afterEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { Hero } from "./hero";

const motionState = vi.hoisted(() => ({ reduceMotion: false }));

vi.mock("framer-motion", () => ({
  motion: {
    p: ({ children, initial, ...props }: any) => (
      <p data-initial={String(initial)} {...props}>
        {children}
      </p>
    ),
    h1: ({ children, initial, ...props }: any) => (
      <h1 data-initial={String(initial)} {...props}>
        {children}
      </h1>
    ),
    div: ({ children, initial, ...props }: any) => (
      <div data-initial={String(initial)} {...props}>
        {children}
      </div>
    ),
  },
  useReducedMotion: () => motionState.reduceMotion,
}));

vi.mock("next/link", () => ({
  default: ({ children, href }: any) => <a href={href}>{children}</a>,
}));

afterEach(() => {
  motionState.reduceMotion = false;
});

describe("Hero Component", () => {
  it("renders the editorial kicker and card copy", () => {
    render(<Hero />);

    expect(screen.getByText("Philip Sun")).toBeDefined();
    expect(screen.getByText("Current Positioning")).toBeDefined();
    expect(
      screen.getByText(/16M\+ users influenced across enterprise and healthcare systems/i),
    ).toBeDefined();
    expect(
      screen.getByText(/Open to the right full-time PM role where product judgment matters/i),
    ).toBeDefined();
  });

  it("renders the new thesis-led headline", () => {
    render(<Hero />);

    expect(
      screen.getByRole("heading", {
        name: /I build product strategy, operating leverage, and trust/i,
      }),
    ).toBeDefined();
  });

  it("supports the reduced-motion branch", () => {
    motionState.reduceMotion = true;

    const { container } = render(<Hero />);

    expect(container.querySelectorAll("[data-initial='false']").length).toBeGreaterThanOrEqual(3);
  });

  it("renders the primary and secondary CTAs", () => {
    render(<Hero />);

    expect(screen.getByText(/Book a Call/i).closest("a")?.getAttribute("href")).toBe("/meet");
    expect(screen.getByText(/View Resume/i).closest("a")?.getAttribute("href")).toBe("/resume");
  });

  it("does not use the old dark hero treatment", () => {
    const { container } = render(<Hero />);

    expect(container.querySelector("section")?.className).not.toContain("bg-[#0a0a0a]");
  });
});

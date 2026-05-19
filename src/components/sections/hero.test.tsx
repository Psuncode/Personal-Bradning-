import { afterEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import type { AnchorHTMLAttributes, HTMLAttributes, PropsWithChildren } from "react";
import { Hero } from "./hero";

type LinkProps = PropsWithChildren<
  { href: string } & AnchorHTMLAttributes<HTMLAnchorElement>
>;
type MotionProps<T extends HTMLElement> = PropsWithChildren<
  HTMLAttributes<T> & { initial?: unknown }
>;

const motionState = vi.hoisted(() => ({ reduceMotion: false }));

vi.mock("framer-motion", () => ({
  motion: {
    p: ({ children, initial, ...props }: MotionProps<HTMLParagraphElement>) => (
      <p data-initial={String(initial)} {...props}>
        {children}
      </p>
    ),
    h1: ({ children, initial, ...props }: MotionProps<HTMLHeadingElement>) => (
      <h1 data-initial={String(initial)} {...props}>
        {children}
      </h1>
    ),
    div: ({ children, initial, ...props }: MotionProps<HTMLDivElement>) => (
      <div data-initial={String(initial)} {...props}>
        {children}
      </div>
    ),
  },
  useReducedMotion: () => motionState.reduceMotion,
}));

vi.mock("next/link", () => ({
  default: ({ children, href, ...props }: LinkProps) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

afterEach(() => {
  motionState.reduceMotion = false;
});

describe("Hero Component", () => {
  it("renders the type-only H1 with name and Inara Health", () => {
    render(<Hero />);

    const h1 = screen.getByRole("heading", { level: 1 });
    expect(h1.textContent).toMatch(/Philip Sun/i);
    expect(h1.textContent).toMatch(/Inara Health/i);
  });

  it("renders the sub-copy paragraph", () => {
    render(<Hero />);

    expect(
      screen.getByText(
        /Healthcare operations, medtech, and the boring parts of building software that holds up under scrutiny/i,
      ),
    ).toBeDefined();
  });

  it("renders a single 'See Inara' text link pointing to /projects/inara-health", () => {
    render(<Hero />);

    const link = screen.getByText(/See Inara/i).closest("a");
    expect(link?.getAttribute("href")).toBe("/projects/inara-health");
  });

  it("does not render a 'Book a Call' CTA", () => {
    render(<Hero />);

    expect(screen.queryByText(/Book a Call/i)).toBeNull();
  });

  it("does not render the 'Current Positioning' card", () => {
    render(<Hero />);

    expect(screen.queryByText(/Current Positioning/i)).toBeNull();
  });

  it("does not render an image element", () => {
    const { container } = render(<Hero />);

    expect(container.querySelector("img")).toBeNull();
  });

  it("does not repeat the 'Philip Sun' eyebrow kicker outside the H1", () => {
    render(<Hero />);

    // The H1 contains the name; there should be no separate kicker paragraph.
    expect(screen.queryByText("Philip Sun", { selector: "p" })).toBeNull();
  });

  it("supports the reduced-motion branch on the H1", () => {
    motionState.reduceMotion = true;

    const { container } = render(<Hero />);

    const h1 = container.querySelector("h1");
    expect(h1?.getAttribute("data-initial")).toBe("false");
  });
});

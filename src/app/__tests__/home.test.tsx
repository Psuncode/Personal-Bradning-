import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import HomePage from "@/app/(main)/page";

vi.mock("next/link", () => ({
  default: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

vi.mock("framer-motion", () => ({
  motion: {
    p: ({ children, ...props }: any) => <p {...props}>{children}</p>,
    h1: ({ children, ...props }: any) => <h1 {...props}>{children}</h1>,
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  useReducedMotion: () => false,
}));

describe("Home Page", () => {
  it("renders the new hero thesis", () => {
    render(<HomePage />);
    expect(screen.getByText(/I build product strategy, operating leverage, and trust/i)).toBeDefined();
  });

  it("renders the current focus section", () => {
    render(<HomePage />);
    expect(screen.getByText(/Current Focus/i)).toBeDefined();
  });

  it("renders the about section", () => {
    render(<HomePage />);
    expect(screen.getByText(/I work at the intersection of product, healthcare, and craft/i)).toBeDefined();
  });

  it("renders the selected work section", () => {
    render(<HomePage />);
    expect(screen.getByText(/Selected Work/i)).toBeDefined();
  });

  it("renders the latest writing section", () => {
    render(<HomePage />);
    expect(screen.getByRole("heading", { name: /Latest Writing/i })).toBeDefined();
    expect(screen.getByText(/Notes, essays, and field reports on product, systems, and building well/i)).toBeDefined();
  });

  it("renders both hero CTAs", () => {
    render(<HomePage />);
    expect(screen.getAllByText(/Book a Call/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/View Resume/i).length).toBeGreaterThanOrEqual(1);
  });
});

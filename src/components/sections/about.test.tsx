import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { About } from "./about";

vi.mock("next/link", () => ({
  default: ({ children, href }: any) => <a href={href}>{children}</a>,
}));

vi.mock("next/image", () => ({
  default: ({ alt }: any) => <img alt={alt} />,
}));

describe("About", () => {
  it("renders the editorial heading", () => {
    render(<About />);
    expect(
      screen.getByText(/I work at the intersection of product, healthcare, and craft/i),
    ).toBeDefined();
  });

  it("renders the recruiting CTA copy", () => {
    render(<About />);
    expect(
      screen.getByText(/Open to full-time PM roles starting April 2026/i),
    ).toBeDefined();
  });

  it("renders the competencies section", () => {
    render(<About />);
    expect(screen.getByText(/Core Competencies/i)).toBeDefined();
  });
});

import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { About } from "./about";

vi.mock("next/link", () => ({
  default: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

vi.mock("next/image", () => ({
  default: ({ alt, src, sizes, fill, className, ...props }: any) => (
    <img
      alt={alt}
      src={typeof src === "string" ? src : src?.src}
      data-sizes={sizes}
      data-fill={fill ? "true" : "false"}
      className={className}
      {...props}
    />
  ),
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
    const cta = screen.getByRole("link", {
      name: /Open to full-time PM roles starting April 2026/i,
    });

    expect(cta).toHaveAttribute("href", "/meet");
  });

  it("renders the competencies section", () => {
    render(<About />);
    expect(screen.getByText(/Core Competencies/i)).toBeDefined();
  });

  it("renders the editorial image alt text", () => {
    render(<About />);

    expect(
      screen.getByAltText("Philip Sun workspace editorial portrait"),
    ).toBeDefined();
  });
});

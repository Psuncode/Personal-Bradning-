import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import type { AnchorHTMLAttributes, PropsWithChildren } from "react";
import { About } from "./about";

type LinkProps = PropsWithChildren<
  { href: string } & AnchorHTMLAttributes<HTMLAnchorElement>
>;
type ImageProps = {
  alt?: string;
  className?: string;
  fill?: boolean;
  sizes?: string;
  src?: string | { src?: string };
};

vi.mock("next/link", () => ({
  default: ({ children, href, ...props }: LinkProps) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

vi.mock("next/image", () => ({
  default: ({ alt = "", className, fill, sizes, src }: ImageProps) => (
    <div
      aria-label={alt || undefined}
      className={className}
      data-alt={alt}
      data-fill={fill ? "true" : "false"}
      data-sizes={sizes}
      data-src={typeof src === "string" ? src : src?.src}
      role="img"
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
      screen.getByRole("img", { name: "Philip Sun workspace editorial portrait" }),
    ).toBeDefined();
  });
});

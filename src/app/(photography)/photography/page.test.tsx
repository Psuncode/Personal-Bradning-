import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { AnchorHTMLAttributes, PropsWithChildren } from "react";
import PhotographyPage from "@/app/(photography)/photography/page";

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

describe("Photography Page", () => {
  it("renders Utah couples and portrait landing page content", () => {
    render(<PhotographyPage />);

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: /Utah Couples & Portrait Photographer/i,
      }),
    ).toBeDefined();
    expect(
      screen.getByText(/Serving Provo, Utah County, and Salt Lake City/i),
    ).toBeDefined();
    expect(screen.getAllByRole("link", { name: /Book a Session/i }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole("link", { name: /View Pricing/i }).length).toBeGreaterThan(0);
  });

  it("renders package durations in natural time units", () => {
    render(<PhotographyPage />);

    expect(screen.getByText("1h 15m session")).toBeDefined();
    expect(screen.getByText("1h session")).toBeDefined();
    expect(screen.getByText("1h 45m session")).toBeDefined();
  });
});

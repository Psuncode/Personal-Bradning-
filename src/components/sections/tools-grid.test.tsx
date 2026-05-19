import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { AnchorHTMLAttributes, ImgHTMLAttributes, PropsWithChildren } from "react";
import { ToolsGrid } from "./tools-grid";

type LinkProps = PropsWithChildren<
  { href: string } & AnchorHTMLAttributes<HTMLAnchorElement>
>;

vi.mock("next/link", () => ({
  default: ({ children, href, ...props }: LinkProps) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

vi.mock("next/image", () => ({
  default: ({ src, alt, ...props }: ImgHTMLAttributes<HTMLImageElement>) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={typeof src === "string" ? src : ""} alt={alt ?? ""} {...props} />
  ),
}));

describe("ToolsGrid", () => {
  it("renders both default tools (RVU Calculator and Stock Scanner)", () => {
    render(<ToolsGrid />);
    expect(screen.getByRole("heading", { name: /RVU Calculator/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /Stock Scanner/i })).toBeInTheDocument();
  });

  it("renders an 'Open ↗' link with the correct external href for each tool", () => {
    render(<ToolsGrid />);
    const links = screen.getAllByText(/Open ↗/);
    expect(links).toHaveLength(2);

    const rvu = links.find(
      (el) => el.closest("a")?.getAttribute("href") === "https://rvu.psunproduction.com/app/",
    );
    expect(rvu).toBeDefined();

    const stock = links.find(
      (el) => el.closest("a")?.getAttribute("href") === "https://trader.psunproduction.com/scanner",
    );
    expect(stock).toBeDefined();
  });

  it("opens external links in a new tab with rel noopener noreferrer", () => {
    render(<ToolsGrid />);
    const links = screen.getAllByText(/Open ↗/).map((el) => el.closest("a"));
    for (const link of links) {
      expect(link?.getAttribute("target")).toBe("_blank");
      expect(link?.getAttribute("rel")).toBe("noopener noreferrer");
    }
  });

  it("renders the TOOLS eyebrow", () => {
    render(<ToolsGrid />);
    expect(screen.getByText("TOOLS")).toBeInTheDocument();
  });

  it("falls back to a typographic plate when no thumbnail is provided", () => {
    render(<ToolsGrid />);
    // Both default tools omit thumbnails, so both plates should render.
    expect(screen.getAllByText(/↳ screenshot forthcoming/)).toHaveLength(2);
  });

  it("uses an internal-style → arrow for non-external tools", () => {
    render(
      <ToolsGrid
        tools={[
          {
            slug: "internal-thing",
            name: "Internal Thing",
            description: "Lives on this site.",
            href: "/internal-thing",
            external: false,
          },
        ]}
      />,
    );
    const link = screen.getByText(/Open →/).closest("a");
    expect(link?.getAttribute("href")).toBe("/internal-thing");
    expect(link?.getAttribute("target")).toBeNull();
  });
});

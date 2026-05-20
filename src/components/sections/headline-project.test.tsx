import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { AnchorHTMLAttributes, PropsWithChildren } from "react";
import { HeadlineProject } from "./headline-project";

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

describe("HeadlineProject", () => {
  it("renders the H2 with 'Inara Health'", () => {
    render(<HeadlineProject />);
    const h2 = screen.getByRole("heading", { level: 2 });
    expect(h2.textContent).toMatch(/Inara Health/i);
  });

  it("renders the 'Headline Project' eyebrow", () => {
    render(<HeadlineProject />);
    expect(screen.getByText(/Headline Project/)).toBeInTheDocument();
  });

  it("renders the 'Read the case study' link pointing to /projects/inara-health", () => {
    render(<HeadlineProject />);
    const link = screen.getByText(/Read the case study/i).closest("a");
    expect(link?.getAttribute("href")).toBe("/projects/inara-health");
  });

  it("renders the 'device render forthcoming' corner label on the plate", () => {
    render(<HeadlineProject />);
    expect(screen.getByText(/↳ device render forthcoming/)).toBeInTheDocument();
  });

  it("includes outcome metrics phrased as forthcoming", () => {
    render(<HeadlineProject />);
    // Body should gracefully acknowledge that metrics aren't ready yet —
    // the word "forthcoming" appears both in the plate label and in body.
    const matches = screen.getAllByText(/forthcoming/i);
    expect(matches.length).toBeGreaterThanOrEqual(2);
  });
});

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SitemapFooter } from "./sitemap-footer";
import { siteConfig } from "@/data/site-config";

describe("SitemapFooter", () => {
  it("renders all 4 column headers (WORK, WRITING, ELSEWHERE, CONTACT)", () => {
    render(<SitemapFooter />);
    expect(screen.getByRole("heading", { name: /work/i })).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /writing/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /elsewhere/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /contact/i }),
    ).toBeInTheDocument();
  });

  it("renders GitHub and LinkedIn as external links opening in new tab", () => {
    render(<SitemapFooter />);
    const github = screen.getByRole("link", { name: /github/i });
    const linkedin = screen.getByRole("link", { name: /linkedin/i });
    expect(github).toHaveAttribute("target", "_blank");
    expect(github).toHaveAttribute("rel", "noopener noreferrer");
    expect(linkedin).toHaveAttribute("target", "_blank");
    expect(linkedin).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("renders the email in the CONTACT column", () => {
    render(<SitemapFooter />);
    expect(screen.getByText(siteConfig.email)).toBeInTheDocument();
  });

  it("renders contentinfo landmark for accessibility", () => {
    render(<SitemapFooter />);
    expect(screen.getByRole("contentinfo")).toBeInTheDocument();
  });
});

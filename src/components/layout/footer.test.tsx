import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import type { AnchorHTMLAttributes, PropsWithChildren } from "react";
import { Footer } from "./footer";

type LinkProps = PropsWithChildren<
  { href: string } & AnchorHTMLAttributes<HTMLAnchorElement>
>;

// Mock next/link
vi.mock("next/link", () => ({
  default: ({ children, href, ...props }: LinkProps) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

describe("Footer Component", () => {
  it("renders the footer element", () => {
    render(<Footer />);
    const footer = screen.getByRole("contentinfo");
    expect(footer).toBeDefined();
  });

  it("renders the CTA heading", () => {
    render(<Footer />);
    expect(screen.getByText(/Let's work together/i)).toBeDefined();
  });

  it("renders footer description", () => {
    render(<Footer />);
    expect(screen.getByText(/PM roles in healthcare tech/i)).toBeDefined();
  });

  it("renders Book a Call button", () => {
    render(<Footer />);
    expect(screen.getByText("Book a Call")).toBeDefined();
  });

  it("Book a Call links to meet page", () => {
    render(<Footer />);
    const link = screen.getByText("Book a Call").closest("a");
    expect(link?.getAttribute("href")).toBe("/meet");
  });

  it("renders email link", () => {
    render(<Footer />);
    const emailLinks = screen.getAllByRole("link").filter(
      (link) => link.getAttribute("href")?.includes("mailto:")
    );
    expect(emailLinks.length).toBeGreaterThan(0);
  });

  it("GitHub link has correct href and attributes", () => {
    render(<Footer />);
    const githubLinks = screen.getAllByRole("link").filter(
      (link) =>
        link.getAttribute("href")?.includes("github") &&
        link.getAttribute("target") === "_blank"
    );
    expect(githubLinks.length).toBeGreaterThan(0);
  });

  it("LinkedIn link has correct href and attributes", () => {
    render(<Footer />);
    const linkedinLinks = screen.getAllByRole("link").filter(
      (link) =>
        link.getAttribute("href")?.includes("linkedin") &&
        link.getAttribute("target") === "_blank"
    );
    expect(linkedinLinks.length).toBeGreaterThan(0);
  });

  it("renders copyright text with current year", () => {
    render(<Footer />);
    const currentYear = new Date().getFullYear().toString();
    expect(screen.getByText(new RegExp(currentYear))).toBeDefined();
  });

  it("renders copyright notice text", () => {
    render(<Footer />);
    expect(screen.getByText(/All rights reserved/i)).toBeDefined();
  });

  it("footer has dark background styling", () => {
    const { container } = render(<Footer />);
    const footer = container.querySelector("footer");
    expect(footer?.className).toContain("bg-[#0a0a0a]");
  });

  it("footer has proper text color", () => {
    const { container } = render(<Footer />);
    const footer = container.querySelector("footer");
    expect(footer?.className).toContain("text-white");
  });

  it("renders grid layout for footer sections", () => {
    const { container } = render(<Footer />);
    const gridDiv = container.querySelector(".grid");
    expect(gridDiv?.className).toContain("md:grid-cols-2");
  });

  it("external social links open in new tab", () => {
    render(<Footer />);
    const socialLinks = screen.getAllByRole("link").filter(
      (link) =>
        (link.getAttribute("href")?.includes("github") ||
          link.getAttribute("href")?.includes("linkedin")) &&
        link.getAttribute("target") === "_blank"
    );
    socialLinks.forEach((link) => {
      expect(link.getAttribute("rel")).toContain("noopener");
      expect(link.getAttribute("rel")).toContain("noreferrer");
    });
  });

  it("renders without crashing", () => {
    expect(() => render(<Footer />)).not.toThrow();
  });
});

import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import type { AnchorHTMLAttributes, PropsWithChildren } from "react";
import { Footer } from "./footer";

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

describe("Footer Component", () => {
  it("renders the footer element", () => {
    render(<Footer />);
    const footer = screen.getByRole("contentinfo");
    expect(footer).toBeDefined();
  });

  it("renders the signature name", () => {
    render(<Footer />);
    expect(screen.getByText("Philip Sun")).toBeDefined();
  });

  it("renders portfolio + year colophon", () => {
    render(<Footer />);
    const year = new Date().getFullYear().toString();
    expect(screen.getByText(new RegExp(`Portfolio · ${year}`))).toBeDefined();
  });

  it("renders email link", () => {
    render(<Footer />);
    const emailLinks = screen.getAllByRole("link").filter(
      (link) => link.getAttribute("href")?.includes("mailto:")
    );
    expect(emailLinks.length).toBeGreaterThan(0);
  });

  it("GitHub link has correct attributes", () => {
    render(<Footer />);
    const githubLinks = screen.getAllByRole("link").filter(
      (link) =>
        link.getAttribute("href")?.includes("github") &&
        link.getAttribute("target") === "_blank"
    );
    expect(githubLinks.length).toBeGreaterThan(0);
  });

  it("LinkedIn link has correct attributes", () => {
    render(<Footer />);
    const linkedinLinks = screen.getAllByRole("link").filter(
      (link) =>
        link.getAttribute("href")?.includes("linkedin") &&
        link.getAttribute("target") === "_blank"
    );
    expect(linkedinLinks.length).toBeGreaterThan(0);
  });

  it("footer uses the cream paper background", () => {
    const { container } = render(<Footer />);
    const footer = container.querySelector("footer");
    expect(footer?.className).toContain("bg-[color:var(--color-paper)]");
  });

  it("footer uses ink text color", () => {
    const { container } = render(<Footer />);
    const footer = container.querySelector("footer");
    expect(footer?.className).toContain("text-[color:var(--color-ink)]");
  });

  it("renders three-column colophon grid layout", () => {
    const { container } = render(<Footer />);
    const gridDiv = container.querySelector(".grid");
    expect(gridDiv?.className).toContain("md:grid-cols-3");
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

  it("does not render legacy sales copy", () => {
    render(<Footer />);
    expect(screen.queryByText(/Let's work together/i)).toBeNull();
    expect(screen.queryByText(/Book a Call/i)).toBeNull();
  });

  it("renders without crashing", () => {
    expect(() => render(<Footer />)).not.toThrow();
  });
});

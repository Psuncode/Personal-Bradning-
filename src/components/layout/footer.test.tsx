import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { Footer } from "./footer";
import * as siteConfigModule from "@/data/site-config";

// Mock next/link
vi.mock("next/link", () => ({
  default: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

// Mock lucide-react
vi.mock("lucide-react", () => ({
  Github: () => <div data-testid="github-icon">GitHub Icon</div>,
  Linkedin: () => <div data-testid="linkedin-icon">LinkedIn Icon</div>,
  Mail: () => <div data-testid="mail-icon">Mail Icon</div>,
}));

describe("Footer Component", () => {
  it("renders the footer element", () => {
    render(<Footer />);
    const footer = screen.getByRole("contentinfo");
    expect(footer).toBeDefined();
  });

  it("renders the site name", () => {
    render(<Footer />);
    expect(screen.getByText("Philip Sun")).toBeDefined();
  });

  it("renders footer description", () => {
    render(<Footer />);
    expect(screen.getByText(/Software Developer & Student at BYU/i)).toBeDefined();
  });

  it("renders Links section heading", () => {
    render(<Footer />);
    expect(screen.getByText(/Links/i)).toBeDefined();
  });

  it("renders Connect section heading", () => {
    render(<Footer />);
    expect(screen.getByText(/Connect/i)).toBeDefined();
  });

  it("renders all quick navigation links", () => {
    render(<Footer />);
    expect(screen.getByText("Home")).toBeDefined();
    expect(screen.getByText("Projects")).toBeDefined();
    expect(screen.getByText("Book a Meeting")).toBeDefined();
    expect(screen.getByText("Contact")).toBeDefined();
  });

  it("quick links have correct hrefs", () => {
    render(<Footer />);
    const homeLink = screen.getByText("Home").closest("a");
    const projectsLink = screen.getByText("Projects").closest("a");
    const contactLink = screen.getByText("Contact").closest("a");

    expect(homeLink?.getAttribute("href")).toBe("/");
    expect(projectsLink?.getAttribute("href")).toBe("/projects");
    expect(contactLink?.getAttribute("href")).toBe("/contact");
  });

  it("renders social media links", () => {
    render(<Footer />);
    const links = screen.getAllByRole("link");
    expect(links.length).toBeGreaterThanOrEqual(7); // Nav links + social links
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

  it("email link has mailto href", () => {
    render(<Footer />);
    const emailLinks = screen.getAllByRole("link").filter(
      (link) =>
        link.getAttribute("href")?.includes("mailto:")
    );
    expect(emailLinks.length).toBeGreaterThan(0);
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
    expect(footer?.className).toContain("bg-byu-navy");
  });

  it("footer has proper text color", () => {
    const { container } = render(<Footer />);
    const footer = container.querySelector("footer");
    expect(footer?.className).toContain("text-white");
  });

  it("social links have aria-label for accessibility", () => {
    render(<Footer />);
    const links = screen.getAllByRole("link");
    const socialLinks = links.filter(
      (link) =>
        link.getAttribute("href")?.includes("github") ||
        link.getAttribute("href")?.includes("linkedin") ||
        link.getAttribute("href")?.includes("mailto")
    );
    socialLinks.forEach((link) => {
      expect(link.getAttribute("aria-label")).toBeTruthy();
    });
  });

  it("renders grid layout for footer sections", () => {
    const { container } = render(<Footer />);
    const gridDiv = container.querySelector(".grid");
    expect(gridDiv?.className).toContain("md:grid-cols-3");
  });

  it("renders without crashing", () => {
    expect(() => render(<Footer />)).not.toThrow();
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

  it("has proper padding and spacing", () => {
    const { container } = render(<Footer />);
    const footerContent = container.querySelector(".mx-auto");
    expect(footerContent?.className).toContain("py-12");
    expect(footerContent?.className).toContain("px-4");
  });
});

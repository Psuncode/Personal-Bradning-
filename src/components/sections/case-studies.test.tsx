import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import type { AnchorHTMLAttributes, PropsWithChildren } from "react";
import { projects } from "@/data/projects";
import { CaseStudies } from "./case-studies";

type LinkProps = PropsWithChildren<
  { href: string } & AnchorHTMLAttributes<HTMLAnchorElement>
>;
type ImageProps = { alt?: string };

vi.mock("next/link", () => ({
  default: ({ children, href, ...props }: LinkProps) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

vi.mock("next/image", () => ({
  default: ({ alt = "" }: ImageProps) => <div data-alt={alt} role="img" />,
}));

describe("CaseStudies", () => {
  it("renders the refined proof-section heading", () => {
    render(<CaseStudies />);

    expect(screen.getByText(/Selected Work/i)).toBeDefined();
    expect(
      screen.getByText(/A few cases where strategy met measurable execution/i),
    ).toBeDefined();
  });

  it("renders case study links", () => {
    render(<CaseStudies />);

    const featuredProjects = projects.filter((project) => project.featured);
    const links = screen.getAllByRole("link", { name: /View Full Case Study/i });

    expect(links).toHaveLength(featuredProjects.length);
    expect(links.map((link) => link.getAttribute("href"))).toEqual(
      featuredProjects.map((project) => `/projects/${project.slug}`),
    );
  });

  it("renders decorative gallery images with empty alt text", () => {
    const { container } = render(<CaseStudies />);

    expect(container.querySelectorAll('[data-alt=""]')).toHaveLength(6);
    expect(screen.queryByRole("img", { name: /visual \d/i })).toBeNull();
  });
});

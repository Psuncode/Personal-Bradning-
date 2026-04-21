import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { projects } from "@/data/projects";
import { CaseStudies } from "./case-studies";

vi.mock("next/link", () => ({
  default: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

vi.mock("next/image", () => ({
  default: ({ alt }: any) => <img alt={alt} />,
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

    expect(container.querySelectorAll('img[alt=""]')).toHaveLength(6);
    expect(screen.queryByAltText(/visual \d/i)).toBeNull();
  });
});

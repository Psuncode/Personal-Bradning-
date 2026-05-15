import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import type { AnchorHTMLAttributes, ImgHTMLAttributes, PropsWithChildren } from "react";
import { ProjectsGrid } from "./projects-grid";
import { projects } from "@/data/projects";

type LinkProps = PropsWithChildren<{ href: string } & AnchorHTMLAttributes<HTMLAnchorElement>>;

vi.mock("next/link", () => ({
  default: ({ children, href, ...props }: LinkProps) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

vi.mock("next/image", () => ({
  default: ({ src, alt, ...rest }: ImgHTMLAttributes<HTMLImageElement> & { src: string; alt: string }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} {...rest} />
  ),
}));

describe("ProjectsGrid", () => {
  it("renders all projects as editorial entries", () => {
    render(<ProjectsGrid />);
    projects.forEach((p) => {
      expect(screen.getByRole("heading", { name: p.title })).toBeInTheDocument();
    });
  });

  it("links each project to its slug", () => {
    render(<ProjectsGrid />);
    projects.forEach((p) => {
      const link = screen.getByRole("link", { name: new RegExp(p.title, "i") });
      expect(link).toHaveAttribute("href", `/projects/${p.slug ?? p.id}`);
    });
  });

  it("renders the editorial page header", () => {
    render(<ProjectsGrid />);
    expect(screen.getByRole("heading", { level: 1, name: "Projects" })).toBeInTheDocument();
  });

  it("renders numeral kickers per entry", () => {
    render(<ProjectsGrid />);
    expect(screen.getByText("01")).toBeInTheDocument();
    expect(screen.getByText("02")).toBeInTheDocument();
  });

  it("renders without crashing", () => {
    expect(() => render(<ProjectsGrid />)).not.toThrow();
  });
});

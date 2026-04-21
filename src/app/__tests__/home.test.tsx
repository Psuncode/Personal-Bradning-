import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import type { AnchorHTMLAttributes, HTMLAttributes, PropsWithChildren } from "react";
import HomePage from "@/app/(main)/page";
import { getAllPosts } from "@/lib/blog";
import { formatDate } from "@/lib/utils";

type LinkProps = PropsWithChildren<
  { href: string } & AnchorHTMLAttributes<HTMLAnchorElement>
>;
type MotionProps<T extends HTMLElement> = PropsWithChildren<HTMLAttributes<T>>;

vi.mock("next/link", () => ({
  default: ({ children, href, ...props }: LinkProps) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

vi.mock("framer-motion", () => ({
  motion: {
    p: ({ children, ...props }: MotionProps<HTMLParagraphElement>) => <p {...props}>{children}</p>,
    h1: ({ children, ...props }: MotionProps<HTMLHeadingElement>) => <h1 {...props}>{children}</h1>,
    div: ({ children, ...props }: MotionProps<HTMLDivElement>) => <div {...props}>{children}</div>,
  },
  useReducedMotion: () => false,
}));

describe("Home Page", () => {
  const [recentPost] = getAllPosts();

  it("renders the new hero thesis", () => {
    render(<HomePage />);
    expect(screen.getByText(/I build product strategy, operating leverage, and trust/i)).toBeDefined();
  });

  it("renders the current focus section", () => {
    render(<HomePage />);
    expect(screen.getByText(/Current Focus/i)).toBeDefined();
  });

  it("renders the about section", () => {
    render(<HomePage />);
    expect(screen.getByText(/I work at the intersection of product, healthcare, and craft/i)).toBeDefined();
  });

  it("renders the selected work section", () => {
    render(<HomePage />);
    expect(screen.getByText(/Selected Work/i)).toBeDefined();
  });

  it("renders the latest writing section", () => {
    render(<HomePage />);
    expect(screen.getByRole("heading", { name: /Latest Writing/i })).toBeDefined();
    expect(screen.getByText(/Notes, essays, and field reports on product, systems, and building well/i)).toBeDefined();
    expect(screen.getByRole("link", { name: /All posts/i })).toHaveAttribute("href", "/blog");

    const postLink = screen.getByRole("link", {
      name: new RegExp(recentPost.frontmatter.title, "i"),
    });

    expect(postLink).toHaveAttribute("href", `/blog/${recentPost.slug}`);
    expect(postLink).toHaveTextContent(formatDate(recentPost.frontmatter.date));
    expect(postLink).toHaveTextContent(recentPost.readingTime);
  });

  it("renders both hero CTAs", () => {
    render(<HomePage />);
    expect(screen.getAllByText(/Book a Call/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/View Resume/i).length).toBeGreaterThanOrEqual(1);
  });
});

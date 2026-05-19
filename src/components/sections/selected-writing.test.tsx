import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import type { AnchorHTMLAttributes, PropsWithChildren } from "react";
import type { BlogPost } from "@/types/blog";

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

const mockPosts: BlogPost[] = [
  {
    slug: "post-one",
    frontmatter: {
      title: "Post One Title",
      date: "2026-03-14",
      excerpt: "First post dek goes here.",
      tags: ["tag-a"],
      published: true,
    },
    readingTime: "3 min read",
    content: "",
  },
  {
    slug: "post-two",
    frontmatter: {
      title: "Post Two Title",
      date: "2026-02-10",
      excerpt: "Second post dek goes here.",
      tags: ["tag-b"],
      published: true,
    },
    readingTime: "5 min read",
    content: "",
  },
  {
    slug: "post-three",
    frontmatter: {
      title: "Post Three Title",
      date: "2026-01-20",
      excerpt: "Third post dek goes here.",
      tags: [],
      published: true,
    },
    readingTime: "2 min read",
    content: "",
  },
  {
    slug: "post-four-not-shown",
    frontmatter: {
      title: "Hidden Title",
      date: "2025-12-01",
      excerpt: "Should not render in default slice.",
      tags: [],
      published: true,
    },
    readingTime: "1 min read",
    content: "",
  },
];

vi.mock("@/lib/blog", () => ({
  getAllPosts: () => mockPosts,
}));

import { SelectedWriting } from "./selected-writing";

describe("SelectedWriting", () => {
  it("renders the SELECTED WRITING eyebrow", () => {
    render(<SelectedWriting />);
    expect(screen.getByText(/Selected Writing/i)).toBeDefined();
  });

  it("renders the first 3 posts by default and not the 4th", () => {
    render(<SelectedWriting />);
    expect(screen.getByText("Post One Title")).toBeDefined();
    expect(screen.getByText("Post Two Title")).toBeDefined();
    expect(screen.getByText("Post Three Title")).toBeDefined();
    expect(screen.queryByText("Hidden Title")).toBeNull();
  });

  it("renders the date and read-time meta for each post", () => {
    render(<SelectedWriting />);
    // Date is formatted like "March 14, 2026 · 3 min read"
    expect(screen.getByText(/3 min read/)).toBeDefined();
    expect(screen.getByText(/5 min read/)).toBeDefined();
    expect(screen.getByText(/2 min read/)).toBeDefined();
  });

  it("renders excerpts (deks) for each post", () => {
    render(<SelectedWriting />);
    expect(screen.getByText("First post dek goes here.")).toBeDefined();
    expect(screen.getByText("Second post dek goes here.")).toBeDefined();
    expect(screen.getByText("Third post dek goes here.")).toBeDefined();
  });

  it("post titles link to their /blog/<slug> page", () => {
    render(<SelectedWriting />);
    const title = screen.getByText("Post One Title");
    const link = title.closest("a");
    expect(link?.getAttribute("href")).toBe("/blog/post-one");
  });

  it("renders an 'All writing →' link to /blog", () => {
    render(<SelectedWriting />);
    const all = screen.getByText(/All writing/);
    expect(all.closest("a")?.getAttribute("href")).toBe("/blog");
  });

  it("does NOT render any <img> elements (no thumbnails)", () => {
    const { container } = render(<SelectedWriting />);
    const imgs = container.querySelectorAll("img");
    expect(imgs.length).toBe(0);
  });

  it("honors a custom limit prop", () => {
    render(<SelectedWriting limit={2} />);
    expect(screen.getByText("Post One Title")).toBeDefined();
    expect(screen.getByText("Post Two Title")).toBeDefined();
    expect(screen.queryByText("Post Three Title")).toBeNull();
  });
});

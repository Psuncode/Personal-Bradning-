import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { BlogCover } from "./blog-cover";
import type { BlogPost } from "@/types/blog";

vi.mock("next/image", () => ({
  default: (props: Record<string, unknown>) => (
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    <img {...(props as { src: string; alt: string; style?: React.CSSProperties })} />
  ),
}));

const basePost: BlogPost = {
  slug: "test-post",
  frontmatter: {
    title: "Test Post",
    date: "2026-01-01",
    excerpt: "",
    tags: [],
    published: true,
  },
  readingTime: "1 min",
  content: "",
  cover: { src: "/_blog-assets/test-post/cover.jpg", alt: "Cover photo" },
};

describe("BlogCover", () => {
  it("renders the title as an h1", () => {
    render(<BlogCover post={basePost} />);
    expect(
      screen.getByRole("heading", { level: 1, name: "Test Post" }),
    ).toBeInTheDocument();
  });

  it("renders the cover image with derived alt", () => {
    render(<BlogCover post={basePost} />);
    expect(screen.getByAltText("Cover photo")).toBeInTheDocument();
  });

  it("applies view-transition-name keyed by slug", () => {
    const { container } = render(<BlogCover post={basePost} />);
    const styled = Array.from(container.querySelectorAll("[style]")).find(
      (el) => el.getAttribute("style")?.includes("view-transition-name"),
    );
    expect(styled).toBeTruthy();
  });
});

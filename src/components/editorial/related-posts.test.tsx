import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { RelatedPosts } from "./related-posts";
import type { BlogPost } from "@/types/blog";

const make = (slug: string, tags: string[], date = "2026-01-01"): BlogPost => ({
  slug,
  readingTime: "2 min",
  frontmatter: { title: slug, date, excerpt: "", tags, published: true },
  content: "",
});

describe("RelatedPosts", () => {
  it("returns up to 2 posts sharing a tag, excluding the current", () => {
    const current = make("a", ["product"]);
    const all = [current, make("b", ["product"]), make("c", ["product"]), make("d", ["other"])];
    render(<RelatedPosts currentSlug="a" allPosts={all} />);
    expect(screen.getByRole("link", { name: /b/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /c/i })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /d/i })).toBeNull();
  });

  it("renders nothing when no posts share a tag", () => {
    const current = make("a", ["product"]);
    const all = [current, make("b", ["other"])];
    const { container } = render(<RelatedPosts currentSlug="a" allPosts={all} />);
    expect(container.firstChild).toBeNull();
  });
});

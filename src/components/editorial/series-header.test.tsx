import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SeriesHeader } from "./series-header";
import type { BlogPost } from "@/types/blog";

const mk = (slug: string, order: number): BlogPost => ({
  slug,
  frontmatter: {
    title: `Post ${slug}`,
    date: "2026-01-01",
    excerpt: "",
    tags: [],
    published: true,
    series: "Healthcare PM",
    seriesOrder: order,
  },
  readingTime: "1 min",
  content: "",
});

const all = [mk("a", 1), mk("b", 2), mk("c", 3)];

describe("SeriesHeader", () => {
  it("returns null when current post has no series", () => {
    const current: BlogPost = {
      ...mk("z", 1),
      frontmatter: { ...mk("z", 1).frontmatter, series: undefined },
    };
    const { container } = render(<SeriesHeader current={current} all={all} />);
    expect(container.firstChild).toBeNull();
  });

  it("renders the series name and position", () => {
    render(<SeriesHeader current={all[1]} all={all} />);
    expect(screen.getByText(/Healthcare PM/)).toBeInTheDocument();
    expect(screen.getByText(/2 of 3/)).toBeInTheDocument();
  });

  it("links to previous and next posts in the series", () => {
    render(<SeriesHeader current={all[1]} all={all} />);
    expect(screen.getByRole("link", { name: /Post a/i })).toHaveAttribute(
      "href",
      "/blog/a",
    );
    expect(screen.getByRole("link", { name: /Post c/i })).toHaveAttribute(
      "href",
      "/blog/c",
    );
  });
});

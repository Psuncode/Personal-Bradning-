import { describe, expect, it, vi } from "vitest";
import type { BlogPost } from "@/types/blog";

vi.mock("@/lib/blog", () => ({
  getAllPosts: (): BlogPost[] => [
    {
      slug: "a",
      frontmatter: {
        title: "A",
        date: "2026-01-01",
        excerpt: "",
        tags: ["pm"],
        published: true,
      },
      readingTime: "1 min",
      content: "",
    },
    {
      slug: "b",
      frontmatter: {
        title: "B",
        date: "2026-01-02",
        excerpt: "",
        tags: ["pm", "ai"],
        published: true,
      },
      readingTime: "1 min",
      content: "",
    },
    {
      slug: "c",
      frontmatter: {
        title: "C",
        date: "2026-01-03",
        excerpt: "",
        tags: ["photography"],
        published: true,
      },
      readingTime: "1 min",
      content: "",
    },
  ],
}));

import { generateStaticParams } from "./page";

describe("blog tag page", () => {
  it("generateStaticParams returns union of tags across posts", async () => {
    const params = await generateStaticParams();
    const tags = params.map((p: { tag: string }) => p.tag).sort();
    expect(tags).toEqual(["ai", "photography", "pm"]);
  });
});

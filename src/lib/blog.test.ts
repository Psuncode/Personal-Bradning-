import { describe, expect, it } from "vitest";
import { getAllPosts, getPostBySlug } from "./blog";

describe("blog discovery", () => {
  it("surfaces the published folder-based posts", () => {
    const posts = getAllPosts();
    const slugs = posts.map((p) => p.slug);
    expect(slugs).toContain("hello-world");
    expect(slugs).toContain("lessons-from-building");
    expect(slugs).toContain("photography-session-guide");
    // welcome is published: false — should NOT be in getAllPosts() output
    expect(slugs).not.toContain("welcome");
  });

  it("getPostBySlug returns even unpublished posts (for preview)", () => {
    const post = getPostBySlug("welcome");
    expect(post).not.toBeNull();
  });

  it("getPostBySlug returns a folder post", () => {
    const post = getPostBySlug("hello-world");
    expect(post).not.toBeNull();
    expect(post?.frontmatter.title).toMatch(/Hello World/i);
  });

  it("posts are sorted by date descending", () => {
    const posts = getAllPosts();
    for (let i = 0; i < posts.length - 1; i++) {
      const a = new Date(posts[i].frontmatter.date).getTime();
      const b = new Date(posts[i + 1].frontmatter.date).getTime();
      expect(a).toBeGreaterThanOrEqual(b);
    }
  });
});

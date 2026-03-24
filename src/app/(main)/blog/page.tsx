import type { Metadata } from "next";
import { getAllPosts } from "@/lib/blog";
import { BlogList } from "@/components/sections/blog-list";
import { siteConfig } from "@/data/site-config";

export const metadata: Metadata = {
  title: "Writing",
  description: "Thoughts on healthcare product management, building and shipping things, photography business, and lessons from founding.",
  alternates: {
    types: {
      "application/rss+xml": `${siteConfig.url}/feed.xml`,
    },
  },
};

export default function BlogPage() {
  const posts = getAllPosts();
  return (
    <div className="pt-8">
      <BlogList posts={posts} />
    </div>
  );
}

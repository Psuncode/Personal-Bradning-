import type { Metadata } from "next";
import { getAllPosts } from "@/lib/blog";
import { BlogList } from "@/components/sections/blog-list";

export const metadata: Metadata = {
  title: "Writing",
  description: "Thoughts on software, building things, and lessons learned along the way",
};

export default function BlogPage() {
  const posts = getAllPosts();
  return (
    <div className="pt-8">
      <BlogList posts={posts} />
    </div>
  );
}

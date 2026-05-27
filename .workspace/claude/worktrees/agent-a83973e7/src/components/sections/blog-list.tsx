"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Calendar, Clock } from "lucide-react";
import type { BlogPost } from "@/types/blog";

interface BlogListProps {
  posts: BlogPost[];
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function BlogList({ posts }: BlogListProps) {
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const allTags = Array.from(
    new Set(posts.flatMap((p) => p.frontmatter.tags))
  ).sort();

  const filtered = selectedTag
    ? posts.filter((p) => p.frontmatter.tags.includes(selectedTag))
    : posts;

  return (
    <section className="bg-[#faf9f7] py-24 px-6 md:px-12">
      <div className="max-w-4xl mx-auto">
        <div className="mb-12">
          <h1 className="font-[family-name:var(--font-playfair)] text-5xl md:text-6xl text-gray-900 mb-4">
            Writing
          </h1>
          <p className="text-gray-600 text-lg">
            Thoughts on software, building things, and lessons learned along the way
          </p>
        </div>

        {/* Tag filter pills */}
        {allTags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-10">
            <button
              onClick={() => setSelectedTag(null)}
              className={`rounded-full px-3 py-1 text-sm font-medium transition-colors ${
                selectedTag === null
                  ? "bg-gray-900 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              All
            </button>
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag === selectedTag ? null : tag)}
                className={`rounded-full px-3 py-1 text-sm font-medium transition-colors ${
                  selectedTag === tag
                    ? "bg-gray-900 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        )}

        {filtered.length === 0 ? (
          <p className="text-center text-gray-500">No posts yet. Check back soon.</p>
        ) : (
          <div className="space-y-6">
            {filtered.map((post, index) => (
              <motion.div
                key={post.slug}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.4, delay: index * 0.08 }}
              >
                <Link
                  href={`/blog/${post.slug}`}
                  className="block group bg-white border-2 border-gray-200 rounded-2xl p-8 hover:border-gray-900 hover:shadow-lg transition-all"
                >
                  <div className="flex flex-wrap gap-2 mb-4">
                    {post.frontmatter.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <h2 className="font-[family-name:var(--font-playfair)] text-3xl md:text-4xl text-gray-900 mb-3 group-hover:underline">
                    {post.frontmatter.title}
                  </h2>

                  <p className="text-gray-600 leading-relaxed mb-4">{post.frontmatter.excerpt}</p>

                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="size-3.5" />
                      {formatDate(post.frontmatter.date)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="size-3.5" />
                      {post.readingTime}
                    </span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

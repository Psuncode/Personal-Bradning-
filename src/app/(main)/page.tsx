import Link from "next/link";
import { Hero } from "@/components/sections/hero";
import { CurrentFocus } from "@/components/sections/current-focus";
import { About } from "@/components/sections/about";
import { CaseStudies } from "@/components/sections/case-studies";
import { ContentGrid } from "@/components/sections/content-grid";
import { getAllPosts } from "@/lib/blog";
import { formatDate } from "@/lib/utils";

export default function HomePage() {
  const recentPosts = getAllPosts().slice(0, 2);

  return (
    <>
      <Hero />
      <CurrentFocus />
      <About />
      <CaseStudies />
      <ContentGrid />
      {recentPosts.length > 0 && (
        <section className="bg-white py-24 px-6 md:px-12 border-t border-gray-100">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-10">
              <h2 className="font-[family-name:var(--font-playfair)] text-4xl text-gray-900">
                Latest Writing
              </h2>
              <Link href="/blog" className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">
                All posts →
              </Link>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              {recentPosts.map((post) => (
                <Link
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  className="group block bg-[#faf9f7] border-2 border-gray-200 rounded-2xl p-8 hover:border-gray-900 hover:shadow-lg transition-all"
                >
                  <div className="flex flex-wrap gap-2 mb-4">
                    {post.frontmatter.tags.slice(0, 2).map((tag) => (
                      <span key={tag} className="px-3 py-1 bg-white text-gray-600 rounded-full text-xs border border-gray-200">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <h3 className="font-[family-name:var(--font-playfair)] text-2xl text-gray-900 mb-3 group-hover:underline">
                    {post.frontmatter.title}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-2">
                    {post.frontmatter.excerpt}
                  </p>
                  <span className="text-xs text-gray-400">{formatDate(post.frontmatter.date)} · {post.readingTime}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}

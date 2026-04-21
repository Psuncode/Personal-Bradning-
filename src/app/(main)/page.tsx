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
        <section className="px-6 py-24 md:px-12">
          <div className="editorial-shell editorial-rule pt-10">
            <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="editorial-kicker mb-3">Latest Writing</p>
                <h2 className="font-[family-name:var(--font-playfair)] text-4xl text-[color:var(--color-ink)] md:text-5xl">
                  Latest Writing
                </h2>
                <p className="mt-3 max-w-2xl text-base leading-7 text-[color:var(--color-ink-soft)]">
                  Notes, essays, and field reports on product, systems, and building well.
                </p>
              </div>
              <Link href="/blog" className="text-sm font-medium uppercase tracking-[0.18em] text-[color:var(--color-accent)] transition-colors hover:text-[color:var(--color-ink)]">
                All posts →
              </Link>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              {recentPosts.map((post) => (
                <Link
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  className="editorial-card group block rounded-[1.75rem] p-8 transition-all hover:-translate-y-0.5"
                >
                  <div className="flex flex-wrap gap-2 mb-4">
                    {post.frontmatter.tags.slice(0, 2).map((tag) => (
                      <span key={tag} className="rounded-full border border-[color:var(--color-rule)] bg-[rgba(251,247,241,0.6)] px-3 py-1 text-xs uppercase tracking-[0.15em] text-[color:var(--color-ink-soft)]">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <h3 className="mb-3 font-[family-name:var(--font-playfair)] text-2xl text-[color:var(--color-ink)] group-hover:underline">
                    {post.frontmatter.title}
                  </h3>
                  <p className="mb-4 line-clamp-2 text-sm leading-7 text-[color:var(--color-ink-soft)]">
                    {post.frontmatter.excerpt}
                  </p>
                  <span className="text-xs uppercase tracking-[0.18em] text-[color:var(--color-accent)]">{formatDate(post.frontmatter.date)} · {post.readingTime}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}

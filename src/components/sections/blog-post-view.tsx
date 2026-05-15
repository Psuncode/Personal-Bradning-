import Link from "next/link";
import { ArrowLeft, Calendar, Clock } from "lucide-react";
import { Container } from "@/components/layout/container";
import { Separator } from "@/components/ui/separator";
import type { BlogPost } from "@/types/blog";
import type { MDXComponents } from "mdx/types";
import { formatDate } from "@/lib/utils";
import { RelatedPosts } from "@/components/editorial/related-posts";
import { BlogCover } from "@/components/editorial/blog-cover";
import { SeriesHeader } from "@/components/editorial/series-header";
import { Figure } from "@/components/mdx/figure";
import { FullBleed } from "@/components/mdx/full-bleed";
import { Gallery } from "@/components/mdx/gallery";
import { PullQuote } from "@/components/mdx/pull-quote";
import { TwoColumn } from "@/components/mdx/two-column";
import { Aside } from "@/components/mdx/aside";

interface BlogPostViewProps {
  post: BlogPost;
  Content: React.ComponentType;
  allPosts?: BlogPost[];
}

export function buildMdxComponents(slug: string): MDXComponents {
  return {
    h1: ({ children }) => (
      <h1 className="mt-10 mb-4 font-[family-name:var(--font-playfair)] text-3xl text-[color:var(--color-ink)]">
        {children}
      </h1>
    ),
    h2: ({ children }) => (
      <h2 className="mt-8 mb-3 font-[family-name:var(--font-playfair)] text-2xl text-[color:var(--color-ink)]">
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="mt-6 mb-2 text-xl font-semibold text-[color:var(--color-ink)]">
        {children}
      </h3>
    ),
    p: ({ children }) => (
      <p className="mb-5 leading-8 text-[color:var(--color-ink)]">{children}</p>
    ),
    a: ({ children, href }) => (
      <a
        href={href}
        className="text-[color:var(--color-accent)] underline underline-offset-4 hover:text-[color:var(--color-ink)] transition-colors"
      >
        {children}
      </a>
    ),
    code: ({ children }) => (
      <code className="rounded bg-[color:var(--color-paper-elevated)] px-1.5 py-0.5 font-mono text-sm text-[color:var(--color-ink)] border border-[color:var(--color-rule)]">
        {children}
      </code>
    ),
    pre: ({ children }) => (
      <pre className="my-6 overflow-x-auto rounded-xl bg-[#0a0a0a] p-4 font-mono text-sm text-gray-100">
        {children}
      </pre>
    ),
    blockquote: ({ children }) => (
      <blockquote className="my-6 border-l-2 border-[color:var(--color-accent)] pl-4 italic text-[color:var(--color-ink-soft)]">
        {children}
      </blockquote>
    ),
    ul: ({ children }) => (
      <ul className="mb-5 list-inside list-disc space-y-1.5 leading-8 text-[color:var(--color-ink)]">
        {children}
      </ul>
    ),
    ol: ({ children }) => (
      <ol className="mb-5 list-inside list-decimal space-y-1.5 leading-8 text-[color:var(--color-ink)]">
        {children}
      </ol>
    ),
    hr: () => <Separator className="my-10" />,
    Figure: (props: Omit<React.ComponentProps<typeof Figure>, "slug">) => (
      <Figure slug={slug} {...props} />
    ),
    FullBleed: (props: Omit<React.ComponentProps<typeof FullBleed>, "slug">) => (
      <FullBleed slug={slug} {...props} />
    ),
    Gallery: (props: Omit<React.ComponentProps<typeof Gallery>, "slug">) => (
      <Gallery slug={slug} {...props} />
    ),
    PullQuote,
    TwoColumn,
    Aside,
  };
}

export function BlogPostView({ post, Content, allPosts }: BlogPostViewProps) {
  return (
    <>
      {post.cover && <BlogCover post={post} />}
      {allPosts && <SeriesHeader current={post} all={allPosts} />}
      <Container>
        <div className="mb-8 pt-8">
          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 text-sm text-[color:var(--color-ink-soft)] hover:text-[color:var(--color-ink)] transition-colors"
          >
            <ArrowLeft className="size-4" />
            All Posts
          </Link>
        </div>

        <div className="mb-10 max-w-3xl">
          {post.cover ? (
            <p
              aria-hidden="true"
              className="editorial-display mb-4 font-[family-name:var(--font-playfair)] text-4xl md:text-5xl text-[color:var(--color-ink)] leading-tight"
            >
              {post.frontmatter.title}
            </p>
          ) : (
            <h1 className="editorial-display mb-4 font-[family-name:var(--font-playfair)] text-4xl md:text-5xl text-[color:var(--color-ink)] leading-tight">
              {post.frontmatter.title}
            </h1>
          )}
          <div className="mb-4 flex flex-wrap items-center gap-4 text-sm text-[color:var(--color-ink-soft)]">
            <span className="flex items-center gap-1.5">
              <Calendar className="size-4" />
              {formatDate(post.frontmatter.date)}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="size-4" />
              {post.readingTime}
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {post.frontmatter.tags.map((tag) => (
              <Link
                key={tag}
                href={`/blog/tag/${tag}`}
                className="px-3 py-1 border border-[color:var(--color-rule)] text-[color:var(--color-ink-soft)] text-xs uppercase tracking-[0.18em] hover:text-[color:var(--color-ink)] transition-colors"
              >
                {tag}
              </Link>
            ))}
          </div>
        </div>

        <Separator className="mb-10" />

        <article className="editorial-prose mx-auto max-w-2xl">
          <Content />
        </article>

        <div className="mx-auto max-w-2xl mt-16 border-t border-[color:var(--color-rule)] pt-10 text-center">
          <h3 className="font-[family-name:var(--font-playfair)] text-2xl text-[color:var(--color-ink)] mb-3">
            Want to discuss?
          </h3>
          <p className="text-[color:var(--color-ink-soft)] mb-6">
            Have thoughts on this post? I&apos;d love to hear from you.
          </p>
          <Link
            href="/meet"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[color:var(--color-ink)] text-[color:var(--color-paper-elevated)] rounded-full hover:bg-[color:var(--color-accent)] transition-colors font-medium text-sm"
          >
            Book a Call
          </Link>
        </div>
      </Container>

      {allPosts && allPosts.length > 1 && (
        <div className="mt-16">
          <RelatedPosts currentSlug={post.slug} allPosts={allPosts} />
        </div>
      )}
    </>
  );
}

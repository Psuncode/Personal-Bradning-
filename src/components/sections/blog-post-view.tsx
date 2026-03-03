import Link from "next/link";
import { ArrowLeft, Calendar, Clock } from "lucide-react";
import { Container } from "@/components/layout/container";
import { Separator } from "@/components/ui/separator";
import type { BlogPost } from "@/types/blog";
import type { MDXComponents } from "mdx/types";

interface BlogPostViewProps {
  post: BlogPost;
  Content: React.ComponentType;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export const mdxComponents: MDXComponents = {
  h1: ({ children }) => (
    <h1 className="mt-8 mb-4 text-3xl font-bold text-gray-900">{children}</h1>
  ),
  h2: ({ children }) => (
    <h2 className="mt-6 mb-3 text-2xl font-bold text-gray-900">{children}</h2>
  ),
  h3: ({ children }) => (
    <h3 className="mt-4 mb-2 text-xl font-semibold text-gray-900">{children}</h3>
  ),
  p: ({ children }) => (
    <p className="mb-4 leading-relaxed text-gray-600">{children}</p>
  ),
  a: ({ children, href }) => (
    <a href={href} className="text-gray-900 underline hover:text-gray-600 transition-colors">
      {children}
    </a>
  ),
  code: ({ children }) => (
    <code className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-sm text-gray-800">
      {children}
    </code>
  ),
  pre: ({ children }) => (
    <pre className="my-6 overflow-x-auto rounded-xl bg-gray-900 p-4 font-mono text-sm text-gray-100">
      {children}
    </pre>
  ),
  blockquote: ({ children }) => (
    <blockquote className="my-4 border-l-4 border-gray-300 pl-4 italic text-gray-600">
      {children}
    </blockquote>
  ),
  ul: ({ children }) => (
    <ul className="mb-4 list-inside list-disc space-y-1 text-gray-600">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="mb-4 list-inside list-decimal space-y-1 text-gray-600">
      {children}
    </ol>
  ),
  hr: () => <Separator className="my-8" />,
};

export function BlogPostView({ post, Content }: BlogPostViewProps) {
  return (
    <Container>
      {/* Back link */}
      <div className="mb-8">
        <Link
          href="/blog"
          className="inline-flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="size-4" />
          All Posts
        </Link>
      </div>

      {/* Post header */}
      <div className="mb-8 max-w-2xl">
        <h1 className="mb-4 text-3xl font-bold text-gray-900 sm:text-4xl leading-tight">
          {post.frontmatter.title}
        </h1>
        <div className="mb-4 flex flex-wrap items-center gap-4 text-sm text-gray-500">
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
            <span key={tag} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
              {tag}
            </span>
          ))}
        </div>
      </div>

      <Separator className="mb-10" />

      {/* Post content */}
      <article className="mx-auto max-w-2xl">
        <Content />
      </article>

      {/* CTA block */}
      <div className="mx-auto max-w-2xl mt-16 bg-gray-50 rounded-2xl p-8 text-center">
        <h3 className="font-[family-name:var(--font-playfair)] text-2xl text-gray-900 mb-3">
          Want to discuss?
        </h3>
        <p className="text-gray-600 mb-6">Have thoughts on this post? I&apos;d love to hear from you.</p>
        <Link
          href="/contact"
          className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-full hover:bg-gray-700 transition-colors font-medium text-sm"
        >
          Get in Touch
        </Link>
      </div>
    </Container>
  );
}

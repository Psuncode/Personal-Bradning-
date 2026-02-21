import Link from "next/link";
import { ArrowLeft, Calendar, Clock } from "lucide-react";
import { Container } from "@/components/layout/container";
import { Badge } from "@/components/ui/badge";
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
    <h1 className="mt-8 mb-4 text-3xl font-bold text-byu-navy">{children}</h1>
  ),
  h2: ({ children }) => (
    <h2 className="mt-6 mb-3 text-2xl font-bold text-byu-navy">{children}</h2>
  ),
  h3: ({ children }) => (
    <h3 className="mt-4 mb-2 text-xl font-semibold text-byu-navy">{children}</h3>
  ),
  p: ({ children }) => (
    <p className="mb-4 leading-relaxed text-byu-dark-gray">{children}</p>
  ),
  a: ({ children, href }) => (
    <a href={href} className="text-byu-blue underline hover:text-byu-navy transition-colors">
      {children}
    </a>
  ),
  code: ({ children }) => (
    <code className="rounded bg-byu-sky/30 px-1.5 py-0.5 font-mono text-sm text-byu-navy">
      {children}
    </code>
  ),
  pre: ({ children }) => (
    <pre className="my-6 overflow-x-auto rounded-xl bg-byu-navy p-4 font-mono text-sm text-byu-sky">
      {children}
    </pre>
  ),
  blockquote: ({ children }) => (
    <blockquote className="my-4 border-l-4 border-byu-light-blue pl-4 italic text-byu-dark-gray/80">
      {children}
    </blockquote>
  ),
  ul: ({ children }) => (
    <ul className="mb-4 list-inside list-disc space-y-1 text-byu-dark-gray">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="mb-4 list-inside list-decimal space-y-1 text-byu-dark-gray">
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
          className="inline-flex items-center gap-1.5 text-sm text-byu-dark-gray/60 hover:text-byu-navy transition-colors"
        >
          <ArrowLeft className="size-4" />
          All Posts
        </Link>
      </div>

      {/* Post header */}
      <div className="mb-8 max-w-2xl">
        <h1 className="mb-4 text-3xl font-bold text-byu-navy sm:text-4xl leading-tight">
          {post.frontmatter.title}
        </h1>
        <div className="mb-4 flex flex-wrap items-center gap-4 text-sm text-byu-dark-gray/60">
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
            <Badge key={tag} variant="secondary" className="bg-byu-sky/30 text-byu-navy">
              {tag}
            </Badge>
          ))}
        </div>
      </div>

      <Separator className="mb-10" />

      {/* Post content */}
      <article className="mx-auto max-w-2xl">
        <Content />
      </article>
    </Container>
  );
}

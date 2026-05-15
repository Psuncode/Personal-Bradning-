import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAllPosts, getPostBySlug } from "@/lib/blog";
import { BlogPostView, mdxComponents } from "@/components/sections/blog-post-view";
import { MDXRemote } from "next-mdx-remote/rsc";
import { siteConfig } from "@/data/site-config";

export function generateStaticParams() {
  return getAllPosts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return {};
  return {
    title: post.frontmatter.title,
    description: post.frontmatter.excerpt,
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const Content = async () => (
    <MDXRemote source={post.content} components={mdxComponents} />
  );

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.frontmatter.title,
    description: post.frontmatter.excerpt,
    datePublished: post.frontmatter.date,
    author: {
      "@type": "Person",
      name: "Philip Sun",
      url: siteConfig.url,
    },
    publisher: {
      "@type": "Person",
      name: "Philip Sun",
      url: siteConfig.url,
    },
  };

  const faqJsonLd = post.frontmatter.faq && post.frontmatter.faq.length > 0
    ? {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: post.frontmatter.faq.map((item) => ({
          "@type": "Question",
          name: item.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: item.answer,
          },
        })),
      }
    : null;

  const howToJsonLd = post.frontmatter.howTo
    ? {
        "@context": "https://schema.org",
        "@type": "HowTo",
        name: post.frontmatter.howTo.name,
        description: post.frontmatter.howTo.description,
        step: post.frontmatter.howTo.steps.map((step, index) => ({
          "@type": "HowToStep",
          position: index + 1,
          text: step,
        })),
      }
    : null;

  return (
    <div className="pb-24 pt-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {faqJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      )}
      {howToJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(howToJsonLd) }}
        />
      )}
      <BlogPostView post={post} Content={Content as React.ComponentType} allPosts={getAllPosts()} />
    </div>
  );
}

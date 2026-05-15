import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAllPosts } from "@/lib/blog";
import { EditorialPageHeader } from "@/components/editorial/editorial-page-header";
import { EditorialEntry } from "@/components/editorial/editorial-entry";
import { siteConfig } from "@/data/site-config";

export async function generateStaticParams() {
  const posts = getAllPosts();
  const tags = new Set<string>();
  posts.forEach((p) => p.frontmatter.tags.forEach((t) => tags.add(t)));
  return Array.from(tags).map((tag) => ({ tag }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ tag: string }>;
}): Promise<Metadata> {
  const { tag } = await params;
  return {
    title: `#${tag} — Writing`,
    description: `Posts tagged #${tag} on ${siteConfig.name}.`,
  };
}

export default async function BlogTagPage({
  params,
}: {
  params: Promise<{ tag: string }>;
}) {
  const { tag } = await params;
  const posts = getAllPosts().filter((p) => p.frontmatter.tags.includes(tag));
  if (posts.length === 0) notFound();

  return (
    <>
      <EditorialPageHeader
        kicker="Writing"
        title={`#${tag}`}
        sub={`Posts tagged #${tag}.`}
      />
      <div className="editorial-shell pb-24">
        {posts.map((post, i) => (
          <EditorialEntry
            key={post.slug}
            index={i}
            kicker={String(i + 1).padStart(2, "0")}
            title={post.frontmatter.title}
            description={post.frontmatter.excerpt}
            href={`/blog/${post.slug}`}
            cover={
              post.cover
                ? {
                    src: post.cover.src,
                    alt: post.cover.alt ?? post.frontmatter.title,
                  }
                : undefined
            }
          />
        ))}
      </div>
    </>
  );
}

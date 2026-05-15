import Image from "next/image";
import type { BlogPost } from "@/types/blog";

interface Props {
  post: BlogPost;
}

export function BlogCover({ post }: Props) {
  if (!post.cover) return null;
  const transitionName = `blog-cover-${post.slug}`;
  const alt = post.cover.alt ?? `${post.frontmatter.title} — cover image`;
  const blurProps = post.cover.blurDataURL
    ? { placeholder: "blur" as const, blurDataURL: post.cover.blurDataURL }
    : {};

  return (
    <header className="relative w-full aspect-[16/9] overflow-hidden">
      <Image
        src={post.cover.src}
        alt={alt}
        fill
        priority
        sizes="100vw"
        {...blurProps}
        style={{ objectFit: "cover", viewTransitionName: transitionName }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/55 to-transparent" />
      <div className="absolute inset-0 flex items-end p-6 md:p-12">
        <div>
          <h1 className="editorial-display font-[family-name:var(--font-playfair)] text-4xl md:text-6xl text-white leading-tight max-w-3xl">
            {post.frontmatter.title}
          </h1>
        </div>
      </div>
    </header>
  );
}

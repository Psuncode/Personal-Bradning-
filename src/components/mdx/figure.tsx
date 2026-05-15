import Image from "next/image";
import { resolveBlogAsset } from "@/lib/blog-assets";

interface FigureProps {
  slug: string;
  src: string;
  alt?: string;
  caption?: string;
  priority?: boolean;
  aspectRatio?: string;
}

export function Figure({
  slug,
  src,
  alt,
  caption,
  priority,
  aspectRatio = "16/9",
}: FigureProps) {
  const resolved = resolveBlogAsset(slug, src);
  const effectiveAlt = alt ?? "";

  return (
    <figure className="my-10">
      <div
        className="relative w-full overflow-hidden border border-[color:var(--color-rule)]"
        style={{ aspectRatio }}
      >
        <Image
          src={resolved.src}
          alt={effectiveAlt}
          fill
          sizes="(max-width: 768px) 100vw, 720px"
          priority={priority}
          placeholder={resolved.blurDataURL ? "blur" : undefined}
          blurDataURL={resolved.blurDataURL}
          className="object-cover"
        />
      </div>
      {caption && (
        <figcaption className="mt-3 text-sm leading-6 italic text-[color:var(--color-ink-soft)]">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}

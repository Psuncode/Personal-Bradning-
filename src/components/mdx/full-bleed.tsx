import Image from "next/image";
import { resolveBlogAsset } from "@/lib/blog-assets";

interface FullBleedProps {
  slug: string;
  src: string;
  alt?: string;
  caption?: string;
  aspectRatio?: string;
}

export function FullBleed({
  slug,
  src,
  alt = "",
  caption,
  aspectRatio = "21/9",
}: FullBleedProps) {
  const resolved = resolveBlogAsset(slug, src);
  return (
    <div className="my-14 not-prose">
      <div
        className="relative w-screen left-1/2 -translate-x-1/2 overflow-hidden"
        style={{ aspectRatio }}
      >
        <Image
          src={resolved.src}
          alt={alt}
          fill
          sizes="100vw"
          placeholder={resolved.blurDataURL ? "blur" : undefined}
          blurDataURL={resolved.blurDataURL}
          className="object-cover"
        />
      </div>
      {caption && (
        <p className="editorial-shell mt-3 text-sm leading-6 italic text-[color:var(--color-ink-soft)]">
          {caption}
        </p>
      )}
    </div>
  );
}

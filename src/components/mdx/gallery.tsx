import Image from "next/image";
import { resolveBlogAsset } from "@/lib/blog-assets";

interface GalleryImage {
  src: string;
  alt: string;
}

interface GalleryProps {
  slug: string;
  images: GalleryImage[];
  columns?: 2 | 3;
}

export function Gallery({ slug, images, columns = 2 }: GalleryProps) {
  const gridCols = columns === 3 ? "md:grid-cols-3" : "md:grid-cols-2";

  return (
    <div className={`my-10 grid grid-cols-1 gap-4 ${gridCols}`}>
      {images.map((img, i) => {
        const resolved = resolveBlogAsset(slug, img.src);
        const blurProps = resolved.blurDataURL
          ? { placeholder: "blur" as const, blurDataURL: resolved.blurDataURL }
          : {};
        return (
          <div
            key={i}
            className="relative aspect-[4/5] overflow-hidden border border-[color:var(--color-rule)]"
          >
            <Image
              src={resolved.src}
              alt={img.alt}
              fill
              sizes={`(max-width: 768px) 100vw, ${100 / columns}vw`}
              {...blurProps}
              className="object-cover"
            />
          </div>
        );
      })}
    </div>
  );
}

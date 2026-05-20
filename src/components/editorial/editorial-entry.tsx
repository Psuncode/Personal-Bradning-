import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface Props {
  index: number;
  title: string;
  description: string;
  href: string;
  kicker?: string;
  cover?: { src: string; alt: string };
  transitionName?: string;
}

export function EditorialEntry({ index, title, description, href, kicker, cover, transitionName }: Props) {
  const orientation = index % 2 === 0 ? "editorial-asym-left" : "editorial-asym-right";

  return (
    <article className="grid grid-cols-12 gap-6 py-16 border-t border-[color:var(--color-rule)] first:border-t-0">
      <div className={cn(orientation)}>
        <Link href={href} className="group block">
          {kicker && (
            <span className="block font-[family-name:var(--font-playfair)] text-3xl text-[color:var(--color-ink-soft)] mb-4">
              {kicker}
            </span>
          )}
          {cover && (
            <div className="relative aspect-[16/9] mb-6 overflow-hidden rounded-sm">
              <Image
                src={cover.src}
                alt={cover.alt}
                fill
                sizes="(max-width: 768px) 100vw, 66vw"
                style={transitionName ? { viewTransitionName: transitionName } : undefined}
                className="object-cover transition-transform duration-700 group-hover:scale-[1.02]"
              />
            </div>
          )}
          <h2 className="editorial-display font-[family-name:var(--font-playfair)] text-3xl md:text-4xl text-[color:var(--color-ink)] mb-3 group-hover:underline">
            {title}
          </h2>
          <p className="text-base leading-7 text-[color:var(--color-ink-soft)] max-w-xl">
            {description}
          </p>
        </Link>
      </div>
    </article>
  );
}

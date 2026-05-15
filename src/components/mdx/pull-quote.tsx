import type { ReactNode } from "react";

interface PullQuoteProps {
  children: ReactNode;
  attribution?: string;
}

export function PullQuote({ children, attribution }: PullQuoteProps) {
  return (
    <blockquote className="my-12 md:-ml-12 max-w-2xl">
      <p className="editorial-display font-[family-name:var(--font-playfair)] text-3xl italic leading-[1.2] text-[color:var(--color-ink)] md:text-4xl">
        {children}
      </p>
      {attribution && (
        <footer
          data-attribution
          className="mt-3 text-sm uppercase tracking-[0.22em] text-[color:var(--color-ink-soft)]"
        >
          — {attribution}
        </footer>
      )}
    </blockquote>
  );
}

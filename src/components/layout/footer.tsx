import { siteConfig } from "@/data/site-config";

export function Footer() {
  return (
    <footer
      id="contact"
      className="border-t border-[color:var(--color-rule)] bg-[color:var(--color-paper)] py-20 px-6 md:px-12 text-[color:var(--color-ink)]"
    >
      <div className="max-w-6xl mx-auto grid gap-12 md:grid-cols-3 items-start">
        <div>
          <p className="font-[family-name:var(--font-playfair)] text-3xl text-[color:var(--color-ink)]">
            Philip Sun
          </p>
          <p className="mt-1 text-xs uppercase tracking-[0.22em] text-[color:var(--color-ink-soft)]">
            Portfolio · {new Date().getFullYear()}
          </p>
        </div>
        <div className="text-sm space-y-3 text-[color:var(--color-ink-soft)]">
          <a
            href={siteConfig.links.email}
            className="block text-[color:var(--color-ink)] hover:text-[color:var(--color-accent)] transition-colors"
          >
            {siteConfig.email}
          </a>
          <div className="flex gap-5">
            <a
              href={siteConfig.links.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[color:var(--color-ink)] transition-colors"
            >
              LinkedIn
            </a>
            <a
              href={siteConfig.links.github}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[color:var(--color-ink)] transition-colors"
            >
              GitHub
            </a>
          </div>
        </div>
        <div className="text-xs leading-6 text-[color:var(--color-ink-soft)] md:text-right">
          Built with Next.js and Tailwind. Photography by Philip. Set in Playfair Display and Inter.
        </div>
      </div>
    </footer>
  );
}

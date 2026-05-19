import Link from "next/link";
import { siteConfig } from "@/data/site-config";

/**
 * SitemapFooter — designed sitemap footer per homepage-redesign-v2 spec.
 *
 * Replaces the older `Footer` component (Wave C will swap the layout import).
 * Server component; no client state. 4 columns + brand block + meta row.
 */
export function SitemapFooter() {
  const year = new Date().getFullYear();

  const columnHeader =
    "text-xs uppercase tracking-widest text-[color:var(--color-ink-soft)] mb-4";
  const columnLink =
    "text-sm text-[color:var(--color-ink)] hover:text-[color:var(--color-accent)] hover:underline transition-colors leading-loose";

  const githubUrl = siteConfig.social?.github ?? siteConfig.links.github;
  const linkedinUrl =
    siteConfig.social?.linkedin ?? siteConfig.links.linkedin;
  const photographyUrl =
    siteConfig.social?.photography ?? "https://photography.philipsun.com";
  const freelySweetUrl =
    siteConfig.social?.freelySweet ?? "https://freelysweet.com";

  return (
    <footer
      role="contentinfo"
      className="border-t border-[color:var(--color-rule)] bg-[color:var(--color-paper)] py-16 md:py-20 text-[color:var(--color-ink)]"
    >
      <div className="editorial-shell">
        <div className="grid gap-12 md:grid-cols-[1fr_2fr] items-start">
          {/* Brand block */}
          <div>
            <p className="font-[family-name:var(--font-playfair)] text-2xl text-[color:var(--color-ink)]">
              Philip Sun
            </p>
            <p className="mt-1 text-sm text-[color:var(--color-ink-soft)]">
              Provo, UT
            </p>
          </div>

          {/* 4-column sitemap */}
          <nav
            aria-label="Site footer"
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8"
          >
            <div>
              <h2 className={columnHeader}>Work</h2>
              <ul className="space-y-1">
                <li>
                  <Link href="/projects/inara-health" className={columnLink}>
                    Inara
                  </Link>
                </li>
                <li>
                  <Link href="/#tools" className={columnLink}>
                    Tools
                  </Link>
                </li>
                <li>
                  <Link href="/work-history" className={columnLink}>
                    Work history
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h2 className={columnHeader}>Writing</h2>
              <ul className="space-y-1">
                <li>
                  <Link href="/blog" className={columnLink}>
                    All posts
                  </Link>
                </li>
                <li>
                  <Link href="/blog" className={columnLink}>
                    Archive
                  </Link>
                </li>
                <li>
                  <Link href="/feed.xml" className={columnLink}>
                    RSS
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h2 className={columnHeader}>Elsewhere</h2>
              <ul className="space-y-1">
                <li>
                  <a
                    href={photographyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={columnLink}
                  >
                    Photography
                  </a>
                </li>
                <li>
                  <a
                    href={freelySweetUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={columnLink}
                  >
                    Freely Sweet
                  </a>
                </li>
                <li>
                  <a
                    href={githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={columnLink}
                  >
                    GitHub
                  </a>
                </li>
                <li>
                  <a
                    href={linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={columnLink}
                  >
                    LinkedIn
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h2 className={columnHeader}>Contact</h2>
              <ul className="space-y-1">
                <li>
                  <a href={siteConfig.links.email} className={columnLink}>
                    {siteConfig.email}
                  </a>
                </li>
                <li>
                  <Link href="/meet" className={columnLink}>
                    Book a call
                  </Link>
                </li>
              </ul>
            </div>
          </nav>
        </div>

        {/* Hairline rule + meta row */}
        <div className="mt-16 border-t border-[color:var(--color-rule)] pt-6">
          <p className="text-xs text-[color:var(--color-ink-soft)]">
            © {year} Philip Sun
          </p>
        </div>
      </div>
    </footer>
  );
}

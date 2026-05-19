import { siteConfig } from "@/data/site-config";

interface ElsewhereLink {
  label: string;
  /** Display string for the destination (the right-hand text of the row). */
  destination: string;
  /** Resolved URL the row links out to. */
  href: string;
}

function getLinks(): ElsewhereLink[] {
  const photography = siteConfig.social?.photography ?? "https://photography.philipsun.com";
  const freelySweet = siteConfig.social?.freelySweet ?? "https://freelysweet.com";
  const github = siteConfig.social?.github ?? "https://github.com/Psuncode";
  const linkedin = siteConfig.social?.linkedin ?? "https://www.linkedin.com/in/-philipsun/";

  // Strip protocol for display
  const display = (url: string) => url.replace(/^https?:\/\//, "").replace(/\/$/, "");

  return [
    { label: "Photography", destination: display(photography), href: photography },
    { label: "Freely Sweet", destination: display(freelySweet), href: freelySweet },
    { label: "GitHub", destination: "@Psuncode", href: github },
    { label: "LinkedIn", destination: "/in/philip-sun", href: linkedin },
  ];
}

/**
 * "Elsewhere" — quiet one-line strip on the homepage pointing to off-site
 * presences. Plain-text rows, no cards or thumbnails, italic on hover.
 */
export function Elsewhere() {
  const links = getLinks();

  return (
    <section className="editorial-shell py-24">
      <p className="mb-8 text-xs uppercase tracking-widest text-[color:var(--color-ink-soft)]">
        Elsewhere
      </p>

      <ul className="flex flex-col border-t border-[color:var(--color-rule)]">
        {links.map((link, i) => (
          <li
            key={link.label}
            className="border-b border-[color:var(--color-rule)]"
          >
            <a
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-baseline gap-6 py-6 transition-[font-style] duration-150 hover:italic md:gap-10 md:py-8"
            >
              <span className="w-10 shrink-0 font-[family-name:var(--font-playfair)] text-lg text-[color:var(--color-ink-soft)] tabular-nums md:text-xl">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="flex-1 font-[family-name:var(--font-playfair)] text-2xl text-[color:var(--color-ink)] md:text-3xl">
                {link.label}
              </span>
              <span className="hidden text-sm text-[color:var(--color-ink-soft)] sm:inline">
                {link.destination}
              </span>
              <span
                aria-hidden
                className="text-base text-[color:var(--color-ink-soft)] transition-transform duration-150 group-hover:translate-x-1"
              >
                &nbsp;&rarr;
              </span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}

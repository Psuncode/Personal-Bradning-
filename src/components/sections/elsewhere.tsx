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

      <ul className="flex flex-col leading-loose">
        {links.map((link) => (
          <li key={link.label} className="text-base text-[color:var(--color-ink-soft)]">
            <span className="text-[color:var(--color-ink)]">{link.label}</span>
            <span className="mx-3 text-[color:var(--color-ink-soft)]">&rarr;</span>
            <a
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[color:var(--color-ink-soft)] no-underline transition-[font-style,color] duration-150 hover:italic hover:text-[color:var(--color-accent)]"
            >
              {link.destination}
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}

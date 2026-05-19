/**
 * Curated set of currently-live tools featured on the homepage.
 *
 * Distinct from `src/data/projects.ts`, which lists past + present work for
 * the `/projects` catalogue (including past employment). This list is the
 * narrow "Tools" shelf — only things visitors can click and use right now.
 */

export type FeaturedProject = {
  slug: string;
  name: string;
  /** One-line description, roughly 10-15 words. */
  description: string;
  /** Internal `/path` or external `https://...` URL. */
  href: string;
  external: boolean;
  /** Optional thumbnail; if missing, the grid renders a typographic plate. */
  thumbnail?: { src: string; alt: string };
};

export const tools: FeaturedProject[] = [
  {
    slug: "rvu-calculator",
    name: "RVU Calculator",
    description:
      "Medicare RVU lookup + reimbursement analytics for clinics — actively used in production.",
    href: "https://rvu.psunproduction.com/app/",
    external: true,
  },
  {
    slug: "stock-scanner",
    name: "Stock Scanner",
    description:
      "Personal trading watchlist tool — momentum + fundamentals filters.",
    href: "https://trader.psunproduction.com/scanner",
    external: true,
  },
];

import type { Metadata } from "next";
import Link from "next/link";
import { EditorialPageHeader } from "@/components/editorial/editorial-page-header";
import { projects } from "@/data/projects";
import { siteConfig } from "@/data/site-config";

export const metadata: Metadata = {
  title: "Work history | Philip Sun",
  description: "Past employment and projects.",
  alternates: {
    canonical: `${siteConfig.url}/work-history`,
  },
};

/**
 * Editorialized one-line meta for each past-employment entry.
 * The `projects.ts` type doesn't carry role/company/year as structured
 * fields yet, so this map provides the meta line shown on the row.
 */
const META_BY_SLUG: Record<string, string> = {
  "lds-church-pm": "Product Management Intern · LDS Church · 2024",
  "nursa-ai-tb": "Data & Product Analytics Intern · Nursa · 2023",
  "granger-rvu-analytics":
    "Analytics & Operations Intern · Granger Medical · 2022–2023",
  "cocker-fellowship":
    "Cocker Innovation Fellow · Synthetic Biology Startup · 2023",
};

const YEAR_FOR_SORT: Record<string, number> = {
  "lds-church-pm": 2024,
  "nursa-ai-tb": 2023,
  "cocker-fellowship": 2023,
  "granger-rvu-analytics": 2022,
};

export default function WorkHistoryPage() {
  const entries = projects
    .filter((p) => p.slug !== "inara-health")
    .sort((a, b) => {
      const ay = YEAR_FOR_SORT[a.slug ?? ""] ?? 0;
      const by = YEAR_FOR_SORT[b.slug ?? ""] ?? 0;
      if (ay !== by) return by - ay;
      return a.title.localeCompare(b.title);
    });

  return (
    <main>
      <EditorialPageHeader
        title="Work history"
        sub="Past employment and projects."
      />

      <section className="editorial-shell pb-24 md:pb-32">
        <ul className="divide-y divide-[color:var(--color-rule)]">
          {entries.map((p) => {
            const meta = META_BY_SLUG[p.slug ?? ""] ?? "";
            return (
              <li key={p.slug} className="py-8">
                <h3 className="font-[family-name:var(--font-playfair)] text-2xl text-[color:var(--color-ink)] leading-snug">
                  <Link
                    href={`/projects/${p.slug}`}
                    className="hover:text-[color:var(--color-accent)] hover:underline transition-colors"
                  >
                    {p.title}
                  </Link>
                </h3>
                {meta && (
                  <p className="mt-2 text-sm text-[color:var(--color-ink-soft)]">
                    {meta}
                  </p>
                )}
                <p className="mt-3 text-base text-[color:var(--color-ink-soft)] max-w-[65ch]">
                  {p.description}
                </p>
              </li>
            );
          })}
        </ul>
      </section>
    </main>
  );
}

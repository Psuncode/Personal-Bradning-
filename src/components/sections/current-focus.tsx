import Link from "next/link";
import { Container } from "@/components/layout/container";
import { currentFocus } from "@/data/current-focus";

export function CurrentFocus() {
  return (
    <section className="border-y border-[color:var(--color-rule)] bg-[rgba(251,247,241,0.55)] py-20">
      <Container>
        <div className="mb-10 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="editorial-kicker mb-3">Current Focus</p>
            <h2 className="font-[family-name:var(--font-playfair)] text-4xl text-[color:var(--color-ink)] md:text-5xl">
              Signals from the desk.
            </h2>
          </div>
          <p className="max-w-xl text-sm leading-7 text-[color:var(--color-ink-soft)] md:text-base">
            A short view into what I am building, studying, and open to right now.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {currentFocus.map((item) => {
            const card = (
              <>
                <p className="editorial-kicker mb-5">{item.label}</p>
                <h3 className="mb-3 font-[family-name:var(--font-playfair)] text-2xl text-[color:var(--color-ink)]">
                  {item.heading}
                </h3>
                <p className="text-sm leading-7 text-[color:var(--color-ink-soft)]">
                  {item.body}
                </p>
                {item.href ? (
                  <span className="mt-6 inline-flex text-xs font-semibold uppercase tracking-[0.22em] text-[color:var(--color-accent)]">
                    Open the conversation
                  </span>
                ) : null}
              </>
            );

            return item.href ? (
              <Link
                key={item.label}
                href={item.href}
                className="editorial-card rounded-[1.5rem] p-6 transition-transform duration-300 hover:-translate-y-0.5"
              >
                {card}
              </Link>
            ) : (
              <div key={item.label} className="editorial-card rounded-[1.5rem] p-6">
                {card}
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}

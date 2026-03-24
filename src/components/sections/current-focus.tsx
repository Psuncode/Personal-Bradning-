import Link from "next/link";
import { Container } from "@/components/layout/container";
import { currentFocus } from "@/data/current-focus";

export function CurrentFocus() {
  return (
    <section className="border-b border-gray-100 bg-white py-24">
      <Container>
        <h2 className="mb-8 text-2xl font-bold text-gray-900">
          What I&apos;m Working On
        </h2>
        <div className="grid gap-6 sm:grid-cols-3">
          {currentFocus.map((item) => {
            const cardContent = (
              <>
                <span className="mb-3 inline-block rounded-full bg-gray-900 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-white">
                  {item.label}
                </span>
                <h3 className="mb-2 text-base font-semibold text-gray-900">
                  {item.heading}
                </h3>
                <p className="text-sm leading-relaxed text-gray-600">
                  {item.body}
                </p>
                {item.href && (
                  <span className="mt-4 inline-flex items-center text-xs font-medium text-gray-900">
                    Book a Call →
                  </span>
                )}
              </>
            );

            return item.href ? (
              <Link
                key={item.label}
                href={item.href}
                className="rounded-xl border border-gray-200 bg-white p-6 hover:border-gray-900 hover:shadow-sm transition-all flex flex-col"
              >
                {cardContent}
              </Link>
            ) : (
              <div
                key={item.label}
                className="rounded-xl border border-gray-200 bg-white p-6"
              >
                {cardContent}
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}

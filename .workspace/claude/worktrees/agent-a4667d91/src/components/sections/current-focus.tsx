import { Container } from "@/components/layout/container";
import { currentFocus } from "@/data/current-focus";

export function CurrentFocus() {
  return (
    <section className="border-b border-byu-sky/20 bg-white py-16">
      <Container>
        <h2 className="mb-8 text-2xl font-bold text-byu-navy">
          What I&apos;m Working On
        </h2>
        <div className="grid gap-6 sm:grid-cols-3">
          {currentFocus.map((item) => (
            <div
              key={item.label}
              className="rounded-xl border border-byu-sky/30 bg-gradient-to-br from-white to-byu-sky/10 p-6"
            >
              <span className="mb-3 inline-block rounded-full bg-byu-navy px-3 py-1 text-xs font-semibold uppercase tracking-wider text-byu-light-blue">
                {item.label}
              </span>
              <h3 className="mb-2 text-base font-semibold text-byu-navy">
                {item.heading}
              </h3>
              <p className="text-sm leading-relaxed text-gray-600">
                {item.body}
              </p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}

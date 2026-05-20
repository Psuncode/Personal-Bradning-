import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  photographyFaqs,
  photographyPackages,
  photographyTestimonials,
} from "@/data/photography";
import { safeJsonLd } from "@/lib/json-ld";

export const metadata: Metadata = {
  title: "Philip Sun Photography | Utah Couples & Portrait Photographer",
  description:
    "Utah couples and portrait photography by Philip Sun. Relaxed sessions for couples, graduates, and personal portraits in Provo, Utah County, and Salt Lake City.",
};

const reasonsToBook = [
  "No awkward posing or modeling experience required",
  "Guided direction so you know exactly what to do",
  "Fast turnaround and simple booking",
  "Student-friendly, transparent pricing",
];

const sessionSteps = [
  {
    title: "Pick your session",
    description:
      "Choose the package that fits your shoot, send over a couple of date options, and I will confirm the best plan.",
  },
  {
    title: "Get location and prep help",
    description:
      "I help with location ideas, timing, and outfit guidance so the session feels easy before you even show up.",
  },
  {
    title: "Shoot with clear direction",
    description:
      "During the session, I guide you through natural prompts and small adjustments so nothing feels stiff or confusing.",
  },
  {
    title: "Receive your gallery fast",
    description:
      "You get edited images with a straightforward delivery timeline and clear next steps for downloading and sharing.",
  },
];

function formatSessionDuration(durationMinutes: number) {
  const hours = Math.floor(durationMinutes / 60);
  const minutes = durationMinutes % 60;

  if (hours === 0) {
    return `${minutes}m session`;
  }

  if (minutes === 0) {
    return `${hours}h session`;
  }

  return `${hours}h ${minutes}m session`;
}

const photographerJsonLd = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "@id": "https://philipsun.com/photography",
  name: "Philip Sun Photography",
  description:
    "Utah couples and portrait photography for couples, graduates, and personal portraits in Provo, Utah County, and Salt Lake City.",
  url: "https://philipsun.com/photography",
  telephone: "",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Provo",
    addressRegion: "UT",
    addressCountry: "US",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: 40.2338,
    longitude: -111.6585,
  },
  priceRange: "$$",
  areaServed: ["Provo", "Utah County", "Salt Lake City"],
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Couples and Portrait Photography Packages",
    itemListElement: photographyPackages.map((pkg) => ({
      "@type": "Offer",
      name: pkg.name,
      description: pkg.description,
      url: `https://philipsun.com/photography/book?pkg=${pkg.slug}`,
    })),
  },
};

export default function PhotographyHome() {
  return (
    <div className="bg-white text-gray-900">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(photographerJsonLd) }}
      />

      <section
        aria-label="Utah night sky"
        className="relative h-[90vh] w-full overflow-hidden bg-black"
      >
        <Image
          src="/hero/utah-night-sky.jpg"
          alt=""
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
      </section>

      <section className="bg-[color:var(--color-paper)] px-6 py-20 lg:px-8">
        <div className="editorial-shell text-center">
          <p className="mb-4 text-xs uppercase tracking-[0.28em] text-[color:var(--color-ink-soft)]">
            Photography
          </p>
          <h2 className="font-[family-name:var(--font-playfair)] text-4xl leading-tight text-[color:var(--color-ink)] md:text-5xl">
            Philip Sun Photography
          </h2>
          <p className="mx-auto mt-5 max-w-[60ch] text-base leading-7 text-[color:var(--color-ink-soft)] md:text-lg">
            Photography by Philip Sun. Utah-based. Available for portrait, event,
            and commercial work.
          </p>
        </div>
      </section>

      <section className="bg-gray-50 px-6 py-20 lg:px-8">
        <div className="mx-auto max-w-6xl text-center">
          <p className="mb-2 text-xs font-medium uppercase tracking-widest text-gray-500">
            Portfolio
          </p>
          <h2 className="font-[family-name:var(--font-playfair)] text-3xl font-bold text-gray-900 md:text-4xl">
            See the work
          </h2>
          <p className="mx-auto mt-5 max-w-[60ch] text-base leading-7 text-gray-600">
            Full client galleries — couples, portraits, and event sessions — live on Pixieset.
          </p>
          <a
            href="https://psunproduction.pixieset.com"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 inline-flex items-center justify-center rounded-full border border-gray-900 px-6 py-3 text-sm font-medium text-gray-900 transition-colors hover:bg-gray-900 hover:text-white"
          >
            View full portfolio ↗
          </a>
        </div>
      </section>

      <section className="px-6 py-20 lg:px-8">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-widest text-gray-500">
              Experience
            </p>
            <h2 className="font-[family-name:var(--font-playfair)] text-3xl font-bold text-gray-900 md:text-4xl">
              Why Shoot With Me
            </h2>
            <p className="mt-5 max-w-2xl text-base leading-7 text-gray-600">
              The goal is simple: make your session feel calm, clear, and easy so
              you walk away with images that feel like a real version of you, not a
              forced performance.
            </p>
          </div>
          <div className="grid gap-4">
            {reasonsToBook.map((reason) => (
              <div
                key={reason}
                className="rounded-2xl border border-gray-200 bg-gray-50 px-5 py-5 text-sm font-medium text-gray-900 shadow-sm"
              >
                {reason}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-gray-50 px-6 py-20 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-10 flex items-end justify-between gap-6">
            <div>
              <p className="mb-2 text-xs font-medium uppercase tracking-widest text-gray-500">
                Packages
              </p>
              <h2 className="font-[family-name:var(--font-playfair)] text-3xl font-bold text-gray-900 md:text-4xl">
                Simple Pricing
              </h2>
            </div>
            <Link
              href="/photography/pricing"
              className="hidden text-sm font-medium text-gray-700 underline-offset-4 transition-colors hover:text-gray-900 hover:underline sm:inline-flex"
            >
              View Pricing
            </Link>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {photographyPackages.map((pkg) => (
              <div
                key={pkg.id}
                className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
              >
                <h3 className="text-lg font-semibold text-gray-900">{pkg.name}</h3>
                <p className="mt-3 text-3xl font-bold text-gray-900">
                  ${(pkg.priceInCents / 100).toFixed(0)}
                </p>
                <p className="mt-2 text-sm text-gray-500">
                  {formatSessionDuration(pkg.durationMinutes)}
                </p>
                <p className="mt-4 text-sm leading-6 text-gray-600">{pkg.description}</p>
                <p className="mt-3 text-sm text-gray-500">Turnaround: {pkg.turnaround}</p>
                <Link
                  href={`/photography/book?pkg=${pkg.slug}`}
                  className="mt-6 inline-flex w-full items-center justify-center rounded-full border border-gray-900 px-4 py-3 text-sm font-medium text-gray-900 transition-colors hover:bg-gray-900 hover:text-white"
                >
                  Book a Session
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-20 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <p className="mb-2 text-xs font-medium uppercase tracking-widest text-gray-500">
            Process
          </p>
          <h2 className="font-[family-name:var(--font-playfair)] text-3xl font-bold text-gray-900 md:text-4xl">
            What To Expect
          </h2>

          <div className="mt-10 grid gap-5 md:grid-cols-2">
            {sessionSteps.map((step, index) => (
              <div
                key={step.title}
                className="rounded-3xl border border-gray-200 px-6 py-6"
              >
                <p className="text-xs font-medium uppercase tracking-widest text-gray-500">
                  Step {index + 1}
                </p>
                <h3 className="mt-3 text-lg font-semibold text-gray-900">{step.title}</h3>
                <p className="mt-3 text-sm leading-6 text-gray-600">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-gray-50 px-6 py-20 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <p className="mb-2 text-xs font-medium uppercase tracking-widest text-gray-500">
            Testimonials
          </p>
          <h2 className="font-[family-name:var(--font-playfair)] text-3xl font-bold text-gray-900 md:text-4xl">
            What Clients Say
          </h2>

          <div className="mt-10 grid gap-4 md:grid-cols-2">
            {photographyTestimonials.map((testimonial) => (
              <figure
                key={testimonial.id}
                className="rounded-3xl border border-gray-200 bg-white px-6 py-6 shadow-sm"
              >
                <blockquote className="text-base leading-7 text-gray-700">
                  &ldquo;{testimonial.quote}&rdquo;
                </blockquote>
                <figcaption className="mt-4 text-sm font-semibold text-gray-900">
                  {testimonial.name}
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-20 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <p className="mb-2 text-xs font-medium uppercase tracking-widest text-gray-500">
            FAQ
          </p>
          <h2 className="font-[family-name:var(--font-playfair)] text-3xl font-bold text-gray-900 md:text-4xl">
            Questions Clients Usually Ask
          </h2>

          <div className="mt-10 grid gap-4">
            {photographyFaqs.map((item) => (
              <div
                key={item.question}
                className="rounded-3xl border border-gray-200 bg-white px-6 py-6 shadow-sm"
              >
                <h3 className="text-lg font-semibold text-gray-900">{item.question}</h3>
                <p className="mt-3 text-sm leading-6 text-gray-600">{item.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}

import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { galleryPhotos, photographyPackages } from "@/data/photography";

export const metadata: Metadata = {
  title: "Philip Sun Photography | Utah Couples & Portrait Photographer",
  description:
    "Utah couples and portrait photography by Philip Sun. Relaxed sessions for couples, graduates, and personal portraits in Provo, Utah County, and Salt Lake City.",
};

const featuredPhotos = galleryPhotos
  .filter((photo) => photo.category === "couples" || photo.category === "portrait")
  .slice(0, 5);

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

const faqs = [
  {
    question: "What kinds of sessions do you photograph?",
    answer:
      "Most bookings are for couples, graduation photos, headshots, and personal portraits. If your idea fits that lane, it is likely a good fit.",
  },
  {
    question: "Where do you shoot?",
    answer:
      "I regularly photograph sessions in Provo, across Utah County, and in Salt Lake City, with outdoor and simple urban locations depending on the look you want.",
  },
  {
    question: "What if we have never been in front of a camera before?",
    answer:
      "That is normal. My job is to guide pacing, positioning, and prompts so you never have to guess what to do next.",
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(photographerJsonLd) }}
      />

      <section className="relative overflow-hidden bg-gray-950 text-white">
        {featuredPhotos[0] && (
          <Image
            src={featuredPhotos[0].src}
            alt=""
            fill
            priority
            className="object-cover opacity-35"
            sizes="100vw"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-950 via-gray-950/90 to-gray-900/70" />

        <div className="relative mx-auto flex min-h-[82vh] max-w-6xl flex-col justify-end px-6 pb-20 pt-32 lg:px-8">
          <p className="mb-4 text-sm font-medium uppercase tracking-[0.2em] text-amber-200/85">
            Serving Provo, Utah County, and Salt Lake City
          </p>
          <h1 className="max-w-3xl font-[family-name:var(--font-playfair)] text-5xl font-bold leading-[1.05] text-white md:text-7xl">
            Utah Couples & Portrait Photographer
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-gray-200">
            Natural, guided photos for couples, graduates, and personal portraits
            that feel relaxed, personal, and actually look like you.
          </p>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/photography/book"
              className="inline-flex items-center justify-center rounded-full bg-white px-8 py-4 text-sm font-semibold text-gray-950 transition-colors hover:bg-gray-100"
            >
              Book a Session
            </Link>
            <Link
              href="/photography/pricing"
              className="inline-flex items-center justify-center rounded-full border border-white/25 px-8 py-4 text-sm font-medium text-white transition-colors hover:border-white/60 hover:bg-white/5"
            >
              View Pricing
            </Link>
          </div>
        </div>
      </section>

      {featuredPhotos.length > 0 && (
        <section className="bg-gray-50 px-6 py-20 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <div className="mb-10 flex items-end justify-between gap-6">
              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-widest text-gray-500">
                  Portfolio Highlights
                </p>
                <h2 className="font-[family-name:var(--font-playfair)] text-3xl font-bold text-gray-900 md:text-4xl">
                  Selected Couples & Portrait Sessions
                </h2>
              </div>
              <Link
                href="/photography/gallery"
                className="hidden text-sm font-medium text-gray-700 underline-offset-4 transition-colors hover:text-gray-900 hover:underline sm:inline-flex"
              >
                Browse Full Gallery
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
              <div className="relative col-span-2 aspect-[4/5] overflow-hidden rounded-2xl bg-gray-200 md:col-span-1 md:row-span-2">
                <Image
                  src={featuredPhotos[0].src}
                  alt={featuredPhotos[0].alt}
                  fill
                  className="object-cover transition-transform duration-700 hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              </div>
              {featuredPhotos.slice(1).map((photo) => (
                <div
                  key={photo.id}
                  className="relative aspect-square overflow-hidden rounded-2xl bg-gray-200"
                >
                  <Image
                    src={photo.src}
                    alt={photo.alt}
                    fill
                    className="object-cover transition-transform duration-700 hover:scale-105"
                    sizes="(max-width: 768px) 50vw, 25vw"
                  />
                </div>
              ))}
            </div>

            <div className="mt-6 text-center sm:hidden">
              <Link
                href="/photography/gallery"
                className="text-sm font-medium text-gray-700 underline underline-offset-4"
              >
                Browse Full Gallery
              </Link>
            </div>
          </div>
        </section>
      )}

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
            FAQ
          </p>
          <h2 className="font-[family-name:var(--font-playfair)] text-3xl font-bold text-gray-900 md:text-4xl">
            Questions Clients Usually Ask
          </h2>

          <div className="mt-10 grid gap-4">
            {faqs.map((item) => (
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

      <section className="bg-gray-950 px-6 py-24 text-center text-white lg:px-8">
        <div className="mx-auto max-w-3xl">
          <p className="mb-4 text-xs font-medium uppercase tracking-widest text-gray-500">
            Next Step
          </p>
          <h2 className="font-[family-name:var(--font-playfair)] text-4xl font-bold leading-tight md:text-5xl">
            Ready To Plan Your Session?
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-sm leading-7 text-gray-300">
            If you want couples photos, graduation portraits, or a personal
            session that feels straightforward from start to finish, book a date
            and I will help with the rest.
          </p>
          <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/photography/book"
              className="inline-flex items-center justify-center rounded-full bg-white px-8 py-4 text-sm font-semibold text-gray-950 transition-colors hover:bg-gray-100"
            >
              Book a Session
            </Link>
            <Link
              href="/photography/pricing"
              className="inline-flex items-center justify-center rounded-full border border-white/20 px-8 py-4 text-sm font-medium text-white transition-colors hover:border-white/60 hover:bg-white/5"
            >
              View Pricing
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

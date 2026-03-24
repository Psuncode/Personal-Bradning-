import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { photographyPackages, galleryPhotos } from "@/data/photography";
import { Camera, Sun, Users } from "lucide-react";

export const metadata: Metadata = {
  title: "Photography — Philip Sun",
  description: "Portraits, landscapes, and events photographed with intention in Utah and beyond. Book a session or explore the gallery.",
};

const specialties = [
  {
    icon: Users,
    title: "Portraits",
    description:
      "Individual and family portraits that capture genuine character — not just a pose.",
  },
  {
    icon: Sun,
    title: "Landscapes",
    description:
      "Utah's dramatic light and terrain, from the Wasatch peaks to canyon country.",
  },
  {
    icon: Camera,
    title: "Events",
    description:
      "Weddings, graduations, and milestones documented with care and discretion.",
  },
];

// Pick 5 featured photos from the gallery (first available)
const featuredPhotos = galleryPhotos.slice(0, 5);

const photographerJsonLd = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "@id": "https://philipsun.com/photography",
  name: "Philip Sun Photography",
  description: "Portraits, landscapes, and events photographed with intention in Utah and beyond.",
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
  areaServed: "Utah and surrounding states",
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Photography Packages",
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
    <div className="text-gray-900">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(photographerJsonLd) }}
      />
      {/* ── Hero ── */}
      <section className="relative min-h-[88vh] flex items-end bg-gray-950 overflow-hidden">
        {/* Background image tiled from first gallery photo */}
        {featuredPhotos[0] && (
          <Image
            src={featuredPhotos[0].src}
            alt=""
            fill
            priority
            className="object-cover opacity-50"
            sizes="100vw"
          />
        )}
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/40 to-transparent" />

        <div className="relative z-10 w-full max-w-6xl mx-auto px-6 lg:px-8 pb-20">
          <p className="text-sm font-medium tracking-[0.2em] text-gray-400 uppercase mb-4">
            Provo, Utah
          </p>
          <h1 className="font-[family-name:var(--font-playfair)] text-5xl md:text-7xl lg:text-8xl font-bold text-white leading-[1.05] mb-6 max-w-3xl">
            Light worth
            <br />
            <em className="not-italic text-gray-300">remembering.</em>
          </h1>
          <p className="text-lg text-gray-300 max-w-md mb-10 leading-relaxed">
            Portraits, landscapes, and events — photographed with intention in
            Utah and beyond.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/photography/book"
              className="inline-flex items-center justify-center px-8 py-4 bg-white text-gray-900 rounded-full font-semibold text-sm hover:bg-gray-100 transition-colors"
            >
              Book a Session
            </Link>
            <Link
              href="/photography/gallery"
              className="inline-flex items-center justify-center px-8 py-4 border border-white/30 text-white rounded-full font-medium text-sm hover:border-white/60 hover:bg-white/5 transition-colors"
            >
              View Gallery
            </Link>
          </div>
        </div>
      </section>

      {/* ── Featured work mosaic ── */}
      {featuredPhotos.length >= 4 && (
        <section className="py-20 px-6 lg:px-8 bg-gray-50">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-end justify-between mb-10">
              <div>
                <p className="text-xs font-medium tracking-widest text-gray-400 uppercase mb-2">
                  Selected Work
                </p>
                <h2 className="font-[family-name:var(--font-playfair)] text-3xl md:text-4xl font-bold text-gray-900">
                  Recent shoots
                </h2>
              </div>
              <Link
                href="/photography/gallery"
                className="hidden sm:inline-flex text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors underline-offset-4 hover:underline"
              >
                See all →
              </Link>
            </div>

            {/* Asymmetric 2+3 mosaic */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {/* Large left image */}
              <div className="col-span-2 md:col-span-1 md:row-span-2 relative aspect-[4/5] overflow-hidden rounded-xl bg-gray-200">
                {featuredPhotos[0] && (
                  <Image
                    src={featuredPhotos[0].src}
                    alt={featuredPhotos[0].alt}
                    fill
                    className="object-cover hover:scale-105 transition-transform duration-700"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                )}
              </div>
              {/* Right column: 2 rows of 2 */}
              {featuredPhotos.slice(1, 5).map((photo) => (
                <div
                  key={photo.id}
                  className="relative aspect-square overflow-hidden rounded-xl bg-gray-200"
                >
                  <Image
                    src={photo.src}
                    alt={photo.alt}
                    fill
                    className="object-cover hover:scale-105 transition-transform duration-700"
                    sizes="(max-width: 768px) 50vw, 25vw"
                  />
                </div>
              ))}
            </div>

            <div className="mt-6 sm:hidden text-center">
              <Link
                href="/photography/gallery"
                className="text-sm font-medium text-gray-600 underline underline-offset-4"
              >
                See all photos →
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ── Specialties ── */}
      <section className="py-20 px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <p className="text-xs font-medium tracking-widest text-gray-400 uppercase mb-2">
            What I shoot
          </p>
          <h2 className="font-[family-name:var(--font-playfair)] text-3xl md:text-4xl font-bold text-gray-900 mb-12">
            Specialties
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            {specialties.map(({ icon: Icon, title, description }) => (
              <div key={title} className="group">
                <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center mb-4 group-hover:bg-gray-900 transition-colors duration-300">
                  <Icon className="size-5 text-gray-700 group-hover:text-white transition-colors duration-300" />
                </div>
                <h3 className="font-semibold text-lg text-gray-900 mb-2">{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing teaser ── */}
      <section className="py-20 px-6 lg:px-8 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-xs font-medium tracking-widest text-gray-400 uppercase mb-2">
                Packages
              </p>
              <h2 className="font-[family-name:var(--font-playfair)] text-3xl md:text-4xl font-bold text-gray-900">
                Simple pricing
              </h2>
            </div>
            <Link
              href="/photography/pricing"
              className="hidden sm:inline-flex text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors underline-offset-4 hover:underline"
            >
              Full details →
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {photographyPackages.map((pkg) => (
              <div
                key={pkg.id}
                className="bg-white rounded-2xl p-6 border border-gray-200 hover:border-gray-400 hover:shadow-md transition-all duration-300"
              >
                <h3 className="font-semibold text-gray-900 mb-1">{pkg.name}</h3>
                <p className="text-2xl font-bold text-gray-900 mb-1">
                  ${(pkg.depositInCents / 100).toFixed(0)}
                  <span className="text-sm font-normal text-gray-500 ml-1">deposit</span>
                </p>
                <p className="text-sm text-gray-500 mb-4">
                  {pkg.durationMinutes >= 60
                    ? `${pkg.durationMinutes / 60}h session`
                    : `${pkg.durationMinutes}min session`}
                </p>
                <p className="text-sm text-gray-600 mb-6 leading-relaxed">
                  {pkg.description}
                </p>
                <Link
                  href={`/photography/book?pkg=${pkg.slug}`}
                  className="block text-center py-2.5 px-4 rounded-full border border-gray-900 text-sm font-medium text-gray-900 hover:bg-gray-900 hover:text-white transition-colors duration-200"
                >
                  Book now
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA band ── */}
      <section className="py-24 px-6 lg:px-8 bg-gray-950 text-white text-center">
        <p className="text-xs font-medium tracking-widest text-gray-500 uppercase mb-4">
          Let's work together
        </p>
        <h2 className="font-[family-name:var(--font-playfair)] text-4xl md:text-5xl font-bold mb-6 max-w-xl mx-auto leading-tight">
          Ready to create something lasting?
        </h2>
        <p className="text-gray-400 mb-10 max-w-md mx-auto text-sm leading-relaxed">
          Sessions fill up fast. Secure your date with a deposit and I'll handle
          the rest.
        </p>
        <Link
          href="/photography/book"
          className="inline-flex items-center px-8 py-4 bg-white text-gray-900 rounded-full font-semibold text-sm hover:bg-gray-100 transition-colors"
        >
          Book a Session
        </Link>
      </section>
    </div>
  );
}

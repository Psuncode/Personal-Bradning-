import type { Metadata } from "next";
import { Globe, Factory, Handshake, Ruler, Package, Building2, ArrowRight } from "lucide-react";
import { siteConfig } from "@/data/site-config";

export const metadata: Metadata = {
  title: "B2B Products — Philip Sun Global Trading",
  description: "Commercial-grade water filtration (Puno Filter) and smart home technology (Smart Sync) for designers, architects, and global distributors. Inquire about wholesale and partnership opportunities.",
};

export default function EcommerceHome() {
  return (
    <div className="bg-[#F8FAFC]">
      {/* SECTION 1 — Header / Nav */}
      <header className="sticky top-0 z-50 bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <span className="text-base font-semibold text-[color:var(--color-ink)]">Philip Sun — Global Trading</span>
          <a
            href={`mailto:${siteConfig.email}`}
            className="bg-[color:var(--color-ink)] text-[color:var(--color-paper)] px-5 py-2 rounded-lg text-sm font-medium hover:bg-[color:var(--color-accent)] transition-colors focus-visible:ring-2 focus-visible:ring-[color:var(--color-accent)] focus-visible:outline-none"
          >
            Contact to Inquire
          </a>
        </div>
      </header>

      {/* SECTION 2 — Hero */}
      <section className="py-24 md:py-32 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <p className="text-sm font-mono text-[color:var(--color-accent)] uppercase tracking-widest mb-6">
            B2B · Global Wholesale
          </p>
          <h1
            className="font-bold text-[color:var(--color-ink)] mb-6 leading-tight"
            style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)", fontFamily: "var(--font-playfair, serif)" }}
          >
            Global-Grade Products.<br />
            Direct from Manufacturer.
          </h1>
          <p className="text-xl text-slate-600 mb-10 max-w-2xl">
            We source and distribute commercial water filtration and smart home systems to buyers,
            specifiers, and distributors worldwide. No retail. Direct deals only.
          </p>
          <div className="flex flex-wrap gap-4">
            <a
              href={`mailto:${siteConfig.email}`}
              className="bg-[color:var(--color-ink)] text-[color:var(--color-paper)] px-8 py-4 rounded-lg text-base font-medium hover:bg-[color:var(--color-accent)] transition-colors focus-visible:ring-2 focus-visible:ring-[color:var(--color-accent)] focus-visible:outline-none"
            >
              Contact to Inquire
            </a>
            <a
              href="#products"
              className="text-[color:var(--color-accent)] text-base font-medium underline-offset-2 hover:underline flex items-center gap-1 py-4"
            >
              View Products <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </a>
          </div>
        </div>
      </section>

      {/* SECTION 3 — Trust Bar */}
      <section className="py-10 border-y border-slate-100 bg-slate-50">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex flex-col items-start gap-2">
            <Globe className="w-6 h-6 text-[color:var(--color-accent)]" aria-hidden="true" />
            <p className="font-semibold text-[color:var(--color-ink)]">Global Distribution</p>
            <p className="text-sm text-slate-500">Shipping to buyers in North America, Europe, and Asia-Pacific</p>
          </div>
          <div className="flex flex-col items-start gap-2">
            <Factory className="w-6 h-6 text-[color:var(--color-accent)]" aria-hidden="true" />
            <p className="font-semibold text-[color:var(--color-ink)]">Direct Sourcing</p>
            <p className="text-sm text-slate-500">Chinese manufacturers with verified quality standards</p>
          </div>
          <div className="flex flex-col items-start gap-2">
            <Handshake className="w-6 h-6 text-[color:var(--color-accent)]" aria-hidden="true" />
            <p className="font-semibold text-[color:var(--color-ink)]">Deal-Based Pricing</p>
            <p className="text-sm text-slate-500">All pricing negotiated directly — no hidden markups</p>
          </div>
        </div>
      </section>

      {/* SECTION 4 — Products */}
      <section id="products" className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-[color:var(--color-ink)] mb-3">Our Product Lines</h2>
          <p className="text-lg text-slate-600 mb-12">
            Two complementary businesses serving B2B buyers in filtration and smart home markets.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Puno Filter card */}
            <div className="rounded-xl bg-white shadow-sm border border-slate-200 motion-safe:hover:shadow-md motion-safe:hover:scale-[1.01] transition-all duration-150 flex flex-col min-h-[420px]">
              <div className="h-1.5 bg-[color:var(--color-ink)] rounded-t-xl" />
              <div className="p-8 flex flex-col flex-1">
                <h3 className="text-2xl font-bold text-[color:var(--color-ink)] mb-1">Puno Filter</h3>
                <p className="text-base font-medium text-slate-500 mb-4">Commercial Water Filtration Systems</p>
                <p className="text-base text-slate-700 leading-relaxed flex-1">
                  Industrial and commercial-grade water filtration systems sourced from verified Chinese
                  manufacturers. We supply large-scale filtration solutions to buyers across North America,
                  Europe, and Asia-Pacific — distributed globally on a B2B wholesale basis.
                </p>
                <div className="flex flex-wrap gap-2 mt-6 mb-6">
                  {["Commercial Grade", "B2B Wholesale", "Global Distribution"].map((tag) => (
                    <span key={tag} className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-[color:var(--color-rule)] text-[color:var(--color-ink)]">
                      {tag}
                    </span>
                  ))}
                </div>
                <a
                  href={`mailto:${siteConfig.email}?subject=Puno Filter Inquiry`}
                  className="text-[color:var(--color-accent)] font-medium hover:underline inline-flex items-center gap-1 focus-visible:ring-2 focus-visible:ring-[color:var(--color-accent)] focus-visible:outline-none rounded"
                >
                  Inquire about Puno Filter <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </a>
              </div>
            </div>

            {/* Smart Sync card */}
            <div className="rounded-xl bg-white shadow-sm border border-slate-200 motion-safe:hover:shadow-md motion-safe:hover:scale-[1.01] transition-all duration-150 flex flex-col min-h-[420px]">
              <div className="h-1.5 bg-[color:var(--color-accent)] rounded-t-xl" />
              <div className="p-8 flex flex-col flex-1">
                <h3 className="text-2xl font-bold text-[color:var(--color-ink)] mb-1">Smart Sync</h3>
                <p className="text-base font-medium text-slate-500 mb-4">Smart Home Systems &amp; Automation</p>
                <p className="text-base text-slate-700 leading-relaxed flex-1">
                  Smart home technology — cameras, automation controllers, and home integration systems —
                  sourced from Chinese manufacturers and positioned for the professional specification market.
                  Ideal for interior designers, architects, and specifiers equipping residential and
                  commercial projects.
                </p>
                <div className="flex flex-wrap gap-2 mt-6 mb-6">
                  {["Smart Home", "Designer Spec", "Professional Grade"].map((tag) => (
                    <span key={tag} className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-[color:var(--color-rule)] text-[color:var(--color-ink)]">
                      {tag}
                    </span>
                  ))}
                </div>
                <a
                  href={`mailto:${siteConfig.email}?subject=Smart Sync Inquiry`}
                  className="text-[color:var(--color-accent)] font-medium hover:underline inline-flex items-center gap-1 focus-visible:ring-2 focus-visible:ring-[color:var(--color-accent)] focus-visible:outline-none rounded"
                >
                  Inquire about Smart Sync <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 5 — Who We Serve */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-[color:var(--color-ink)] mb-3">Who We Work With</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-10">
            <div className="p-6 rounded-xl border border-slate-200 bg-white">
              <Ruler className="w-10 h-10 text-[color:var(--color-accent)] mb-4" aria-hidden="true" />
              <h3 className="text-lg font-semibold text-[color:var(--color-ink)]">Architects &amp; Designers</h3>
              <p className="text-sm text-slate-600 leading-relaxed mt-2">
                Specifying smart home systems for residential and commercial projects. Get product specs
                and pricing direct.
              </p>
            </div>
            <div className="p-6 rounded-xl border border-slate-200 bg-white">
              <Package className="w-10 h-10 text-[color:var(--color-accent)] mb-4" aria-hidden="true" />
              <h3 className="text-lg font-semibold text-[color:var(--color-ink)]">Distributors &amp; Wholesalers</h3>
              <p className="text-sm text-slate-600 leading-relaxed mt-2">
                Looking to carry filtration or smart home products in your market. Let&apos;s discuss
                volume terms.
              </p>
            </div>
            <div className="p-6 rounded-xl border border-slate-200 bg-white">
              <Building2 className="w-10 h-10 text-[color:var(--color-accent)] mb-4" aria-hidden="true" />
              <h3 className="text-lg font-semibold text-[color:var(--color-ink)]">Commercial Buyers</h3>
              <p className="text-sm text-slate-600 leading-relaxed mt-2">
                Procurement for large-scale facilities and commercial properties. Custom arrangement
                available.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 6 — How It Works */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-[color:var(--color-ink)] mb-3">Simple Process. Direct Deals.</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-10">
            <div className="flex flex-col gap-3">
              <span className="text-5xl font-bold text-[color:var(--color-accent)]">01</span>
              <h3 className="text-xl font-semibold text-[color:var(--color-ink)]">Send an inquiry</h3>
              <p className="text-sm text-slate-600">
                Email Philip directly with your product interest and quantity requirements.
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <span className="text-5xl font-bold text-[color:var(--color-accent)]">02</span>
              <h3 className="text-xl font-semibold text-[color:var(--color-ink)]">Discuss terms</h3>
              <p className="text-sm text-slate-600">
                Pricing, MOQ, shipping, and timeline are negotiated directly — no middlemen.
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <span className="text-5xl font-bold text-[color:var(--color-accent)]">03</span>
              <h3 className="text-xl font-semibold text-[color:var(--color-ink)]">Ship globally</h3>
              <p className="text-sm text-slate-600">
                Products ship from manufacturer to your destination. All logistics coordinated.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 7 — Contact CTA */}
      <section className="py-20 bg-[color:var(--color-ink)]">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold text-[color:var(--color-paper)]">Ready to source at scale?</h2>
          <p className="text-lg text-[color:var(--color-rule)] mt-4 max-w-xl mx-auto">
            Get in touch and Philip will respond within 24 hours to discuss your requirements.
          </p>
          <a
            href={`mailto:${siteConfig.email}`}
            className="inline-flex items-center gap-2 mt-8 bg-[color:var(--color-paper)] text-[color:var(--color-ink)] px-8 py-4 rounded-lg font-semibold hover:bg-[color:var(--color-paper-elevated)] transition-colors focus-visible:ring-2 focus-visible:ring-[color:var(--color-paper)] focus-visible:outline-none"
          >
            Contact Philip <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </a>
        </div>
      </section>

      {/* SECTION 8 — Footer */}
      <footer className="py-8 border-t border-slate-200 bg-white">
        <p className="text-sm text-slate-500 text-center">
          Philip Sun &middot; Global Trading &nbsp;|&nbsp; &copy; {new Date().getFullYear()} &nbsp;|&nbsp; ecommerce.philipsun.com
        </p>
      </footer>
    </div>
  );
}

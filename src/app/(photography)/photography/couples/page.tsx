import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Utah Couples Photography | Philip Sun Photography",
  description:
    "Couples photography in Provo, Utah County, and Salt Lake City for engagements, anniversaries, and natural everyday sessions.",
};

export default function CouplesPhotographyPage() {
  return (
    <div className="bg-white px-6 py-20 text-gray-900 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-gray-500">
          Couples Photography
        </p>
        <h1 className="mt-4 font-[family-name:var(--font-playfair)] text-4xl font-bold md:text-5xl">
          Utah Couples Photography
        </h1>
        <p className="mt-6 text-lg leading-8 text-gray-600">
          I photograph engagements, anniversaries, and everyday couples sessions
          across Provo, Utah County, and Salt Lake City with guided direction and
          relaxed prompts.
        </p>

        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/photography/book?pkg=couples-session"
            className="inline-flex items-center justify-center rounded-full bg-gray-950 px-8 py-4 text-sm font-semibold text-white transition-colors hover:bg-gray-800"
          >
            Book a Couples Session
          </Link>
          <Link
            href="/photography"
            className="inline-flex items-center justify-center rounded-full border border-gray-300 px-8 py-4 text-sm font-medium text-gray-900 transition-colors hover:border-gray-400 hover:bg-gray-50"
          >
            Back to Photography
          </Link>
        </div>
      </div>
    </div>
  );
}

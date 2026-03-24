import type { Metadata } from "next";
import { Inter, Geist_Mono, Playfair_Display } from "next/font/google";
import "../globals.css";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { siteConfig } from "@/data/site-config";
import { roles, education } from "@/data/resume";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const playfairDisplay = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["700", "800"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.title,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  openGraph: {
    title: siteConfig.title,
    description: siteConfig.description,
    url: siteConfig.url,
    siteName: siteConfig.name,
    locale: "en_US",
    type: "website",
    images: [{ url: `${siteConfig.url}/og`, width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.title,
    description: siteConfig.description,
    images: [`${siteConfig.url}/og`],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const founderRole = roles.find((r) => r.company === "Inara Health Diagnostic");
  const pmRole = roles.find((r) => r.title.includes("Product Manager"));

  const personJsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: siteConfig.name,
    url: siteConfig.url,
    jobTitle: "Product Manager & Founder",
    email: siteConfig.email,
    alumniOf: {
      "@type": "EducationalOrganization",
      name: education[0]?.school ?? "Brigham Young University",
    },
    sameAs: [siteConfig.links.linkedin, siteConfig.links.github],
    knowsAbout: [
      "Product Management",
      "Healthcare Operations",
      "Hardware Product Development",
      "Founding",
      "Photography",
      "Entrepreneurship",
      "Ecommerce",
      "BYU Marriott School",
    ],
    hasOccupation: [
      {
        "@type": "Occupation",
        name: pmRole?.title ?? "Product Manager",
      },
      {
        "@type": "Occupation",
        name: founderRole?.title ?? "Founder & CEO",
        occupationalCategory: "Medical Device Startup",
      },
      {
        "@type": "Occupation",
        name: "Photographer",
      },
      {
        "@type": "Occupation",
        name: "Entrepreneur",
        occupationalCategory: "B2B Ecommerce",
      },
    ],
  };

  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${geistMono.variable} ${playfairDisplay.variable} min-h-screen flex flex-col font-sans antialiased`}
      >
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[9999] focus:px-4 focus:py-2 focus:bg-gray-900 focus:text-white focus:rounded-lg focus:text-sm focus:font-medium"
        >
          Skip to content
        </a>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
        />
        <Navbar />
        <main id="main-content" className="flex-1">{children}</main>
        <Footer />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}

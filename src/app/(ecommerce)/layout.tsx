import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Philip Sun — Global Trading | B2B Product Sourcing",
  description:
    "Philip Sun sources and distributes commercial water filtration (Puno Filter) and smart home technology (Smart Sync) to B2B buyers, architects, designers, and distributors worldwide.",
};

export default function EcommerceLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} min-h-screen flex flex-col font-sans antialiased bg-[#F8FAFC]`}>
        <main className="flex-1">{children}</main>
      </body>
    </html>
  );
}

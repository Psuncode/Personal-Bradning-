import type { Metadata } from "next";
import { Inter } from "next/font/google";

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
    <div className={`${inter.variable} flex flex-col flex-1 bg-[#F8FAFC]`}>
      <main className="flex-1">{children}</main>
    </div>
  );
}

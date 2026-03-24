import type { Metadata } from "next";
import Link from "next/link";
import { PhotographyNav } from "@/components/photography/PhotographyNav";
import "../globals.css";

export const metadata: Metadata = {
  title: "Philip Sun Photography",
  description: "Professional photography by Philip Sun — portraits, events, and landscapes.",
};

export default function PhotographyLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen flex flex-col font-sans antialiased bg-white">
        <PhotographyNav />
        <main className="flex-1">{children}</main>
        <footer className="border-t border-gray-100 py-8 px-6 text-center text-sm text-gray-400">
          © {new Date().getFullYear()} Philip Sun Photography
        </footer>
      </body>
    </html>
  );
}

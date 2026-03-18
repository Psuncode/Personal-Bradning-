import type { Metadata } from "next";
import Link from "next/link";
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
    <html lang="en">
      <body className="min-h-screen flex flex-col font-sans antialiased">
        <nav className="border-b border-gray-200 px-6 py-4">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <Link href="/" className="text-lg font-bold text-gray-900">
              Philip Sun Photography
            </Link>
            <div className="flex items-center gap-6 text-sm font-medium text-gray-700">
              <Link href="/gallery" className="hover:text-gray-900 transition-colors">Gallery</Link>
              <Link href="/pricing" className="hover:text-gray-900 transition-colors">Pricing</Link>
            </div>
          </div>
        </nav>
        <main className="flex-1">{children}</main>
      </body>
    </html>
  );
}

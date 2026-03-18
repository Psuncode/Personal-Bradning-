import type { Metadata } from "next";
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
        <main className="flex-1">{children}</main>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import "../globals.css";

export const metadata: Metadata = {
  title: "Philip Sun — Ecommerce",
  description: "Ecommerce ventures by Philip Sun.",
};

export default function EcommerceLayout({
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

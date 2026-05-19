import type { Metadata, Viewport } from "next";
import "./globals.css";
import { siteConfig } from "@/data/site-config";

// Root layout. Owns the only `<html>`/`<body>` in the tree so that
// nested route-group layouts ((main), (ecommerce), (photography))
// do not produce duplicated chrome / hydration warnings.
//
// Group layouts attach their own font variables and chrome via wrapper
// `<div>`s instead of re-declaring `<html>`/`<body>`.

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
};

// Next.js 16 no longer auto-injects a viewport meta tag, so we have to
// declare it explicitly. `themeColor` matches the editorial paper bg
// (`--color-paper`) so mobile chrome tints to the same cream.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#f4efe6",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen flex flex-col font-sans antialiased">
        {children}
      </body>
    </html>
  );
}

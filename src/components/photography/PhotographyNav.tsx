"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/photography", label: "Home", exact: true },
  { href: "/photography/gallery", label: "Gallery" },
  { href: "/photography/pricing", label: "Pricing" },
  { href: "/photography/book", label: "Book a Session" },
];

export function PhotographyNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6 lg:px-8">
        {/* Wordmark */}
        <Link
          href="/photography"
          className="font-[family-name:var(--font-playfair)] text-xl tracking-tight text-gray-900 hover:text-gray-600 transition-colors"
        >
          Philip Sun
          <span className="ml-2 text-xs font-sans font-medium tracking-widest text-gray-400 uppercase">
            Photography
          </span>
        </Link>

        {/* Desktop links */}
        <ul className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => {
            const active = isActive(link.href, link.exact);
            return (
              <li key={link.href}>
                {link.label === "Book a Session" ? (
                  <Link
                    href={link.href}
                    className="ml-4 inline-flex items-center px-4 py-2 rounded-full bg-gray-900 text-white text-sm font-medium hover:bg-gray-700 transition-colors"
                  >
                    Book a Session
                  </Link>
                ) : (
                  <Link
                    href={link.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "px-3 py-2 rounded-md text-sm transition-colors",
                      active
                        ? "text-gray-900 font-medium"
                        : "text-gray-500 hover:text-gray-900"
                    )}
                  >
                    {link.label}
                  </Link>
                )}
              </li>
            );
          })}
        </ul>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2 text-gray-600 hover:text-gray-900 transition-colors"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Close menu" : "Open menu"}
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-gray-100 bg-white px-6 pb-4">
          <nav className="flex flex-col gap-1 pt-2">
            {navLinks.map((link) => {
              const active = isActive(link.href, link.exact);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                    link.label === "Book a Session"
                      ? "mt-2 text-center bg-gray-900 text-white hover:bg-gray-700"
                      : active
                      ? "text-gray-900 bg-gray-50"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>
      )}
    </header>
  );
}

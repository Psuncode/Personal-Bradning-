"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/projects", label: "Projects" },
  { href: "/blog", label: "Writing" },
  { href: "/resume", label: "Resume" },
  { href: "/meet", label: "Meet" },
  { href: "/contact", label: "Contact" },
];

export function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6 lg:px-8">
        <Link
          href="/"
          className="font-[family-name:var(--font-playfair)] text-2xl hover:text-gray-600 transition-colors"
        >
          Philip Sun
        </Link>

        {/* Desktop navigation */}
        <ul className="hidden items-center gap-6 md:flex">
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                aria-current={pathname === link.href ? "page" : undefined}
                className={cn(
                  "text-sm transition-colors",
                  pathname === link.href
                    ? "text-black font-medium"
                    : "text-gray-600 hover:text-black"
                )}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Mobile navigation */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon" className="text-gray-700 hover:bg-gray-100">
              <Menu className="size-5" />
              <span className="sr-only">Open menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-64 bg-white border-gray-200">
            <SheetTitle className="text-gray-900">Navigation</SheetTitle>
            <nav className="mt-8 flex flex-col gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  aria-current={pathname === link.href ? "page" : undefined}
                  className={cn(
                    "rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    pathname === link.href
                      ? "text-black bg-gray-100"
                      : "text-gray-600 hover:text-black hover:bg-gray-50"
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </SheetContent>
        </Sheet>
      </nav>
    </header>
  );
}

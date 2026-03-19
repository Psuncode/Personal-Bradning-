"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, ChevronDown, ChevronUp } from "lucide-react";
import { useState, useRef, useEffect } from "react";
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

const businessLinks = [
  { href: "/photography", label: "Photography" },
  { href: "/ecommerce", label: "Ecommerce" },
];

export function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [businessOpen, setBusinessOpen] = useState(false);
  const [businessMobileOpen, setBusinessMobileOpen] = useState(false);
  const businessRef = useRef<HTMLLIElement>(null);

  const isBusinessActive =
    pathname.startsWith("/photography") || pathname.startsWith("/ecommerce");

  // Close desktop dropdown on outside click
  useEffect(() => {
    function handleMouseDown(e: MouseEvent) {
      if (
        businessRef.current &&
        !businessRef.current.contains(e.target as Node)
      ) {
        setBusinessOpen(false);
      }
    }
    document.addEventListener("mousedown", handleMouseDown);
    return () => document.removeEventListener("mousedown", handleMouseDown);
  }, []);

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
          {/* Projects link */}
          <li>
            <Link
              href="/projects"
              aria-current={pathname === "/projects" ? "page" : undefined}
              className={cn(
                "text-sm transition-colors",
                pathname === "/projects"
                  ? "text-black font-medium"
                  : "text-gray-600 hover:text-black"
              )}
            >
              Projects
            </Link>
          </li>

          {/* Business dropdown */}
          <li className="relative" ref={businessRef}>
            <button
              type="button"
              onClick={() => setBusinessOpen((prev) => !prev)}
              className={cn(
                "flex items-center gap-1 text-sm transition-colors",
                isBusinessActive
                  ? "text-black font-medium"
                  : "text-gray-600 hover:text-black"
              )}
              aria-expanded={businessOpen}
              aria-haspopup="true"
            >
              Business
              <ChevronDown className="size-3.5" />
            </button>
            {businessOpen && (
              <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-md shadow-md py-1 min-w-[160px] z-50">
                {businessLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setBusinessOpen(false)}
                    aria-current={pathname === link.href ? "page" : undefined}
                    className={cn(
                      "block px-4 py-2 text-sm transition-colors",
                      pathname === link.href
                        ? "text-black font-medium bg-gray-50"
                        : "text-gray-600 hover:text-black hover:bg-gray-50"
                    )}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            )}
          </li>

          {/* Remaining flat links */}
          {navLinks.slice(1).map((link) => (
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
              {/* Projects */}
              <Link
                href="/projects"
                onClick={() => setOpen(false)}
                aria-current={pathname === "/projects" ? "page" : undefined}
                className={cn(
                  "rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  pathname === "/projects"
                    ? "text-black bg-gray-100"
                    : "text-gray-600 hover:text-black hover:bg-gray-50"
                )}
              >
                Projects
              </Link>

              {/* Business expandable section */}
              <div>
                <button
                  type="button"
                  onClick={() => setBusinessMobileOpen((prev) => !prev)}
                  className={cn(
                    "flex w-full items-center justify-between rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    isBusinessActive
                      ? "text-black bg-gray-100"
                      : "text-gray-600 hover:text-black hover:bg-gray-50"
                  )}
                  aria-expanded={businessMobileOpen}
                >
                  Business
                  {businessMobileOpen ? (
                    <ChevronUp className="size-3.5" />
                  ) : (
                    <ChevronDown className="size-3.5" />
                  )}
                </button>
                {businessMobileOpen && (
                  <div className="mt-1 flex flex-col gap-1">
                    {businessLinks.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => {
                          setOpen(false);
                          setBusinessMobileOpen(false);
                        }}
                        aria-current={pathname === link.href ? "page" : undefined}
                        className={cn(
                          "rounded-md pl-6 pr-3 py-2 text-sm font-medium transition-colors",
                          pathname === link.href
                            ? "text-black bg-gray-100"
                            : "text-gray-600 hover:text-black hover:bg-gray-50"
                        )}
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* Remaining flat links */}
              {navLinks.slice(1).map((link) => (
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

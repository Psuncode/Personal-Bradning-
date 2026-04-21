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

const venturesLabel = "Ventures";
const venturesMenuId = "ventures-menu";
const venturesTriggerId = "ventures-trigger";

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
  const businessButtonRef = useRef<HTMLButtonElement>(null);
  const businessRef = useRef<HTMLLIElement>(null);

  const isBusinessRouteActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  const isBusinessActive = businessLinks.some(({ href }) =>
    isBusinessRouteActive(href),
  );

  useEffect(() => {
    function handleMouseDown(e: MouseEvent) {
      if (
        businessRef.current &&
        !businessRef.current.contains(e.target as Node)
      ) {
        setBusinessOpen(false);
      }
    }

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setBusinessOpen(false);
        businessButtonRef.current?.focus();
      }
    }

    if (!businessOpen) {
      return;
    }

    document.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [businessOpen]);

  const linkBase =
    "text-sm transition-colors";
  const linkMuted =
    "text-[color:var(--color-ink-soft)] hover:text-[color:var(--color-ink)]";
  const linkActive = "text-[color:var(--color-ink)] font-medium";
  const surfacePanel =
    "border border-[color:var(--color-rule)] bg-[color:var(--color-paper-elevated)]";

  return (
    <header className="sticky top-0 z-50 border-b border-[color:var(--color-rule)] bg-[rgba(251,247,241,0.86)] backdrop-blur-md">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6 lg:px-8">
        <Link
          href="/"
          className="font-[family-name:var(--font-playfair)] text-2xl text-[color:var(--color-ink)] transition-colors hover:text-[color:var(--color-accent)]"
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
                linkBase,
                pathname === "/projects" ? linkActive : linkMuted,
              )}
            >
              Projects
            </Link>
          </li>

          {/* Ventures dropdown */}
          <li className="relative" ref={businessRef}>
            <button
              type="button"
              onClick={() => setBusinessOpen((prev) => !prev)}
              className={cn(
                "flex items-center gap-1 text-sm transition-colors",
                isBusinessActive
                  ? linkActive
                  : linkMuted,
              )}
              aria-expanded={businessOpen}
              aria-haspopup="menu"
              aria-controls={venturesMenuId}
              id={venturesTriggerId}
              ref={businessButtonRef}
            >
              {venturesLabel}
              <ChevronDown className="size-3.5" />
            </button>
            {businessOpen && (
              <div
                className={cn(
                  "absolute left-0 top-full z-50 mt-2 min-w-[180px] rounded-2xl py-2 shadow-[0_18px_40px_rgba(32,28,26,0.08)]",
                  surfacePanel,
                )}
                id={venturesMenuId}
                role="menu"
                aria-labelledby={venturesTriggerId}
              >
                {businessLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setBusinessOpen(false)}
                    aria-current={isBusinessRouteActive(link.href) ? "page" : undefined}
                    role="menuitem"
                    className={cn(
                      "block px-4 py-2 text-sm transition-colors",
                      isBusinessRouteActive(link.href)
                        ? "bg-[rgba(95,47,42,0.08)] font-medium text-[color:var(--color-ink)]"
                        : "text-[color:var(--color-ink-soft)] hover:bg-[rgba(95,47,42,0.04)] hover:text-[color:var(--color-ink)]",
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
              {link.href === "/meet" ? (
                <Link
                  href={link.href}
                  aria-current={pathname === link.href ? "page" : undefined}
                  className="inline-flex items-center rounded-full bg-[color:var(--color-ink)] px-4 py-1.5 text-sm font-medium text-[color:var(--color-paper-elevated)] transition-colors hover:bg-[color:var(--color-accent)]"
                >
                  Book a Call
                </Link>
              ) : (
                <Link
                  href={link.href}
                  aria-current={pathname === link.href ? "page" : undefined}
                  className={cn(
                    linkBase,
                    pathname === link.href ? linkActive : linkMuted,
                  )}
                >
                  {link.label}
                </Link>
              )}
            </li>
          ))}
        </ul>

        {/* Mobile navigation */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              className="text-[color:var(--color-ink-soft)] hover:bg-[rgba(95,47,42,0.04)] hover:text-[color:var(--color-ink)]"
            >
              <Menu className="size-5" />
              <span className="sr-only">Open menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent
            side="right"
            className="w-64 border-[color:var(--color-rule)] bg-[color:var(--color-paper-elevated)]"
          >
            <SheetTitle className="text-[color:var(--color-ink)]">
              Navigation
            </SheetTitle>
            <nav className="mt-8 flex flex-col gap-2">
              {/* Projects */}
              <Link
                href="/projects"
                onClick={() => setOpen(false)}
                aria-current={pathname === "/projects" ? "page" : undefined}
                className={cn(
                  "rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  pathname === "/projects"
                    ? "bg-[rgba(95,47,42,0.08)] text-[color:var(--color-ink)]"
                    : "text-[color:var(--color-ink-soft)] hover:bg-[rgba(95,47,42,0.04)] hover:text-[color:var(--color-ink)]",
                )}
              >
                Projects
              </Link>

              {/* Ventures expandable section */}
              <div>
                <button
                  type="button"
                  onClick={() => setBusinessMobileOpen((prev) => !prev)}
                  className={cn(
                    "flex w-full items-center justify-between rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    isBusinessActive
                      ? "bg-[rgba(95,47,42,0.08)] text-[color:var(--color-ink)]"
                      : "text-[color:var(--color-ink-soft)] hover:bg-[rgba(95,47,42,0.04)] hover:text-[color:var(--color-ink)]",
                  )}
                  aria-expanded={businessMobileOpen}
                >
                  {venturesLabel}
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
                        aria-current={isBusinessRouteActive(link.href) ? "page" : undefined}
                        className={cn(
                          "rounded-md pl-6 pr-3 py-2 text-sm font-medium transition-colors",
                          isBusinessRouteActive(link.href)
                            ? "bg-[rgba(95,47,42,0.08)] text-[color:var(--color-ink)]"
                            : "text-[color:var(--color-ink-soft)] hover:bg-[rgba(95,47,42,0.04)] hover:text-[color:var(--color-ink)]",
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
                link.href === "/meet" ? (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    aria-current={pathname === link.href ? "page" : undefined}
                    className="rounded-full bg-[color:var(--color-ink)] px-4 py-2 text-center text-sm font-medium text-[color:var(--color-paper-elevated)] transition-colors hover:bg-[color:var(--color-accent)]"
                  >
                    Book a Call
                  </Link>
                ) : (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    aria-current={isBusinessRouteActive(link.href) ? "page" : undefined}
                    className={cn(
                      "rounded-md px-3 py-2 text-sm font-medium transition-colors",
                      pathname === link.href
                        ? "bg-[rgba(95,47,42,0.08)] text-[color:var(--color-ink)]"
                        : "text-[color:var(--color-ink-soft)] hover:bg-[rgba(95,47,42,0.04)] hover:text-[color:var(--color-ink)]",
                    )}
                  >
                    {link.label}
                  </Link>
                )
              ))}
            </nav>
          </SheetContent>
        </Sheet>
      </nav>
    </header>
  );
}

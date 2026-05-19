// src/proxy.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { unsealData } from "iron-session";
import { sessionOptions, type SessionData } from "@/lib/session";

// SUBDOMAINS maps subdomain name to the internal URL path prefix used for routing.
// Each subdomain gets a dedicated path prefix (e.g. /photography) so that route groups
// do not conflict at the same URL — (main)/page.tsx owns "/" while
// (photography)/photography/page.tsx owns "/photography".
const SUBDOMAINS: Record<string, string> = {
  photography: "/photography",
  ecommerce: "/ecommerce",
};

export async function proxy(request: NextRequest) {
  // Use host header if available (production), fall back to nextUrl.host (test environment)
  const hostname = request.headers.get("host") ?? request.nextUrl.host ?? "";

  // Strip port for local dev (e.g. "photography.localhost:3000" -> "photography.localhost")
  const hostWithoutPort = hostname.split(":")[0];

  // Admin guard runs FIRST — before host-based early returns — so /admin is
  // protected on preview deployments (*.vercel.app) and localhost too, not
  // just on the production apex. Closes 01-REVIEW.md CR-01.
  //
  // We unseal the iron-session cookie via `unsealData` (edge-safe, no Node
  // built-ins) and check `isLoggedIn`. Presence-only checks pass any non-empty
  // cookie value, which is why 02-REVIEW.md CR-04 flagged the old behavior.
  if (
    request.nextUrl.pathname.startsWith("/admin") &&
    !request.nextUrl.pathname.startsWith("/admin/login")
  ) {
    const sealed = request.cookies.get(sessionOptions.cookieName)?.value;
    let isLoggedIn = false;
    if (sealed && sessionOptions.password) {
      try {
        const data = await unsealData<SessionData>(sealed, {
          password: sessionOptions.password,
        });
        isLoggedIn = data?.isLoggedIn === true;
      } catch {
        // Tampered, expired, or otherwise unsealable cookie — treat as unauthenticated.
        isLoggedIn = false;
      }
    }
    if (!isLoggedIn) {
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("from", request.nextUrl.pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Preview deployments on .vercel.app — pass through without rewriting
  if (hostWithoutPort.endsWith(".vercel.app")) {
    return NextResponse.next();
  }

  // Localhost — pass through (subdomain routing not needed for local dev in Phase 1)
  if (hostWithoutPort.endsWith(".localhost") || hostWithoutPort === "localhost") {
    return NextResponse.next();
  }

  // Main domain — no rewrite needed
  const mainDomain = process.env.NEXT_PUBLIC_DOMAIN ?? "philipsun.com";
  if (hostWithoutPort === mainDomain || hostWithoutPort === `www.${mainDomain}`) {
    return NextResponse.next();
  }

  // Extract subdomain: "photography.philipsun.com" -> "photography"
  const subdomain = hostWithoutPort.split(".")[0];
  const routeGroupPath = SUBDOMAINS[subdomain];

  if (!routeGroupPath) {
    return NextResponse.next();
  }

  // Rewrite to internal path: photography.philipsun.com/ -> /photography
  // photography.philipsun.com/gallery -> /photography/gallery
  const url = request.nextUrl.clone();
  url.pathname =
    routeGroupPath + (request.nextUrl.pathname === "/" ? "" : request.nextUrl.pathname);
  return NextResponse.rewrite(url);
}

export const config = {
  matcher: [
    // Run on all paths except Next.js internals and static assets
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};

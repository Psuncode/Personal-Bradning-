// src/proxy.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// SUBDOMAINS maps subdomain name to the internal URL path prefix used for routing.
// Each subdomain gets a dedicated path prefix (e.g. /photography) so that route groups
// do not conflict at the same URL — (main)/page.tsx owns "/" while
// (photography)/photography/page.tsx owns "/photography".
const SUBDOMAINS: Record<string, string> = {
  photography: "/photography",
  ecommerce: "/ecommerce",
};

export function proxy(request: NextRequest) {
  // Use host header if available (production), fall back to nextUrl.host (test environment)
  const hostname = request.headers.get("host") ?? request.nextUrl.host ?? "";

  // Strip port for local dev (e.g. "photography.localhost:3000" -> "photography.localhost")
  const hostWithoutPort = hostname.split(":")[0];

  // Preview deployments on .vercel.app — pass through without rewriting
  if (hostWithoutPort.endsWith(".vercel.app")) {
    return NextResponse.next();
  }

  // Localhost — pass through (subdomain routing not needed for local dev in Phase 1)
  if (hostWithoutPort.endsWith(".localhost") || hostWithoutPort === "localhost") {
    return NextResponse.next();
  }

  // Admin guard: redirect /admin to /admin/login if no session cookie present.
  // Checks cookie presence only (edge-safe) — full session validation happens in the page.
  if (
    request.nextUrl.pathname.startsWith('/admin') &&
    !request.nextUrl.pathname.startsWith('/admin/login')
  ) {
    const adminSession = request.cookies.get('admin_session');
    if (!adminSession?.value) {
      const loginUrl = new URL('/admin/login', request.url);
      loginUrl.searchParams.set('from', request.nextUrl.pathname);
      return NextResponse.redirect(loginUrl);
    }
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

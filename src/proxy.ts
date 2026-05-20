// src/proxy.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { unsealData } from "iron-session";
import { isSessionValid, sessionOptions, type SessionData } from "@/lib/session";

// SUBDOMAINS maps subdomain name to the internal URL path prefix used for routing.
// Each subdomain gets a dedicated path prefix (e.g. /photography) so that route groups
// do not conflict at the same URL — (main)/page.tsx owns "/" while
// (photography)/photography/page.tsx owns "/photography".
const SUBDOMAINS: Record<string, string> = {
  photography: "/photography",
  ecommerce: "/ecommerce",
};

export async function proxy(request: NextRequest) {
  // Use host header if available (production), fall back to nextUrl.host (test environment).
  // Lowercase + strip port so we always compare canonical host strings (DNS is
  // case-insensitive; `Photography.Philipsun.COM:443` and `photography.philipsun.com`
  // should route the same way).
  const rawHostname = request.headers.get("host") ?? request.nextUrl.host ?? "";
  const hostWithoutPort = rawHostname.split(":")[0].toLowerCase();

  // Admin guard runs FIRST — before host-based early returns — so /admin is
  // protected on preview deployments (*.vercel.app) and localhost too, not
  // just on the production apex. Closes 01-REVIEW.md CR-01.
  //
  // We unseal the iron-session cookie via `unsealData` (edge-safe, no Node
  // built-ins) and run it through `isSessionValid()` which enforces both
  // `isLoggedIn === true` AND a matching `sessionVersion`. This makes the
  // SESSION_VERSION env-var kill switch (CR-03) effective at the edge —
  // bumping it instantly revokes every previously-sealed cookie on the next
  // request, rather than waiting for the admin route handler to re-check.
  // Presence-only checks pass any non-empty cookie value, which is why
  // 02-REVIEW.md CR-04 flagged the old behavior.
  if (
    request.nextUrl.pathname.startsWith("/admin") &&
    !request.nextUrl.pathname.startsWith("/admin/login")
  ) {
    const sealed = request.cookies.get(sessionOptions.cookieName)?.value;
    let valid = false;
    if (sealed && sessionOptions.password) {
      try {
        const data = await unsealData<SessionData>(sealed, {
          password: sessionOptions.password,
        });
        valid = isSessionValid(data ?? { isLoggedIn: false });
      } catch {
        // Tampered, expired, or otherwise unsealable cookie — treat as unauthenticated.
        valid = false;
      }
    }
    if (!valid) {
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

  // Extract subdomain by stripping the main-domain suffix explicitly. Closes
  // 01-REVIEW.md WR-01. The naive split(".")[0] returned "www" for
  // www.photography.philipsun.com and matched "staging" out of
  // staging.photography.philipsun.com — both bugs. Now we require an exact
  // single-level subdomain of `mainDomain`.
  if (!hostWithoutPort.endsWith(`.${mainDomain}`)) {
    return NextResponse.next();
  }
  const subdomain = hostWithoutPort.slice(0, -(mainDomain.length + 1));
  // Reject deep subdomains (staging.photography.philipsun.com) and the
  // accidental "www" host that shouldn't be in SUBDOMAINS but might collide.
  if (!subdomain || subdomain.includes(".")) {
    return NextResponse.next();
  }
  const routeGroupPath = SUBDOMAINS[subdomain];

  if (!routeGroupPath) {
    return NextResponse.next();
  }

  // Rewrite to internal path: photography.philipsun.com/ -> /photography
  // photography.philipsun.com/pricing -> /photography/pricing
  // (The /gallery subpath rewrites generically too and is then caught by the
  // 301 redirect in next.config.ts that points it at Pixieset.)
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

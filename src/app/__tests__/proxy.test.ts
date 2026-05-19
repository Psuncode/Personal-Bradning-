// src/app/__tests__/proxy.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { isRewrite, getRewrittenUrl } from "next/experimental/testing/server";
import { sealData } from "iron-session";
import { proxy } from "@/proxy";
import { sessionOptions } from "@/lib/session";

// iron-session requires a >=32 char password; use a stable value across tests.
const TEST_SESSION_SECRET = "0123456789abcdef0123456789abcdef";

describe("proxy subdomain routing", () => {
  beforeEach(() => {
    vi.stubEnv("NEXT_PUBLIC_DOMAIN", "philipsun.com");
    vi.stubEnv("SESSION_SECRET", TEST_SESSION_SECRET);
    // sessionOptions reads process.env.SESSION_SECRET at module load. Re-pin
    // the password here so the proxy unseal call matches the seal in our tests
    // even if module load happened before the env stub.
    sessionOptions.password = TEST_SESSION_SECRET;
  });

  describe("photography subdomain", () => {
    it("rewrites photography.philipsun.com/ to /photography", async () => {
      const request = new NextRequest("https://photography.philipsun.com/");
      const response = await proxy(request);
      expect(isRewrite(response)).toBe(true);
      expect(getRewrittenUrl(response)).toContain("/photography");
    });

    it("rewrites photography.philipsun.com/gallery to /photography/gallery", async () => {
      const request = new NextRequest("https://photography.philipsun.com/gallery");
      const response = await proxy(request);
      expect(isRewrite(response)).toBe(true);
      expect(getRewrittenUrl(response)).toContain("/photography/gallery");
    });
  });

  describe("ecommerce subdomain", () => {
    it("rewrites ecommerce.philipsun.com/ to /ecommerce", async () => {
      const request = new NextRequest("https://ecommerce.philipsun.com/");
      const response = await proxy(request);
      expect(isRewrite(response)).toBe(true);
      expect(getRewrittenUrl(response)).toContain("/ecommerce");
    });
  });

  describe("main domain pass-through", () => {
    it("does not rewrite philipsun.com", async () => {
      const request = new NextRequest("https://philipsun.com/");
      const response = await proxy(request);
      expect(isRewrite(response)).toBe(false);
    });

    it("does not rewrite www.philipsun.com", async () => {
      const request = new NextRequest("https://www.philipsun.com/");
      const response = await proxy(request);
      expect(isRewrite(response)).toBe(false);
    });
  });

  describe("preview deployment pass-through", () => {
    it("does not rewrite .vercel.app URLs", async () => {
      const request = new NextRequest("https://philipsun-com-git-main.vercel.app/");
      const response = await proxy(request);
      expect(isRewrite(response)).toBe(false);
    });

    it("does not rewrite preview URLs even if they contain subdomain keywords", async () => {
      const request = new NextRequest(
        "https://philipsun-com-photography-feature.vercel.app/"
      );
      const response = await proxy(request);
      expect(isRewrite(response)).toBe(false);
    });
  });

  describe("localhost pass-through", () => {
    it("does not rewrite localhost", async () => {
      const request = new NextRequest("http://localhost:3000/");
      const response = await proxy(request);
      expect(isRewrite(response)).toBe(false);
    });

    it("does not rewrite photography.localhost", async () => {
      const request = new NextRequest("http://photography.localhost:3000/");
      const response = await proxy(request);
      expect(isRewrite(response)).toBe(false);
    });
  });

  describe("unknown subdomain pass-through", () => {
    it("does not rewrite unknown subdomains", async () => {
      const request = new NextRequest("https://staging.philipsun.com/");
      const response = await proxy(request);
      expect(isRewrite(response)).toBe(false);
    });
  });

  describe("admin route protection — CRM-02 / CR-01 / CR-04", () => {
    it("redirects /admin to /admin/login when no admin_session cookie", async () => {
      const request = new NextRequest("https://philipsun.com/admin");
      const response = await proxy(request);

      // Should be a redirect (302/307), not a pass-through
      expect(response.status).toBeGreaterThanOrEqual(300);
      expect(response.status).toBeLessThan(400);
      expect(response.headers.get("location")).toContain("/admin/login");
    });

    it("does not redirect /admin/login (avoids redirect loop)", async () => {
      const request = new NextRequest("https://philipsun.com/admin/login");
      const response = await proxy(request);

      // Should pass through (200, not redirect)
      expect(response.headers.get("location")).toBeNull();
    });

    it("passes through /admin when admin_session cookie is a valid sealed isLoggedIn=true session", async () => {
      const sealed = await sealData(
        { isLoggedIn: true, sessionVersion: "1" },
        { password: TEST_SESSION_SECRET }
      );
      const request = new NextRequest("https://philipsun.com/admin", {
        headers: {
          cookie: `admin_session=${sealed}`,
        },
      });
      const response = await proxy(request);

      // Valid session — should not redirect
      expect(response.headers.get("location")).toBeNull();
    });

    it("redirects /admin when sealed cookie sessionVersion does not match SESSION_VERSION env — CR-03 kill switch", async () => {
      // Cookie was sealed under SESSION_VERSION=1, but the env was rotated to 2.
      // The edge guard must invalidate the stale cookie immediately rather than
      // waiting for the admin page route handler to re-check.
      vi.stubEnv("SESSION_VERSION", "2");
      const sealed = await sealData(
        { isLoggedIn: true, sessionVersion: "1" },
        { password: TEST_SESSION_SECRET }
      );
      const request = new NextRequest("https://philipsun.com/admin", {
        headers: {
          cookie: `admin_session=${sealed}`,
        },
      });
      const response = await proxy(request);

      expect(response.status).toBeGreaterThanOrEqual(300);
      expect(response.status).toBeLessThan(400);
      expect(response.headers.get("location")).toContain("/admin/login");
    });

    it("redirects /admin when sealed cookie has no sessionVersion field (pre-kill-switch cookie) — CR-03", async () => {
      // Cookies minted before CR-03 landed don't have a sessionVersion. They
      // must be rejected so users get a fresh, version-stamped session on next
      // login.
      const sealed = await sealData(
        { isLoggedIn: true },
        { password: TEST_SESSION_SECRET }
      );
      const request = new NextRequest("https://philipsun.com/admin", {
        headers: {
          cookie: `admin_session=${sealed}`,
        },
      });
      const response = await proxy(request);

      expect(response.headers.get("location")).toContain("/admin/login");
    });

    it("redirects /admin when admin_session cookie is a bogus non-sealed value (bypass attempt)", async () => {
      // CR-04: a presence-only check would let this pass. Real unseal must reject.
      const request = new NextRequest("https://philipsun.com/admin", {
        headers: {
          cookie: "admin_session=not-a-real-sealed-blob",
        },
      });
      const response = await proxy(request);

      expect(response.status).toBeGreaterThanOrEqual(300);
      expect(response.status).toBeLessThan(400);
      expect(response.headers.get("location")).toContain("/admin/login");
    });

    it("redirects /admin when admin_session seals isLoggedIn=false", async () => {
      const sealed = await sealData(
        { isLoggedIn: false },
        { password: TEST_SESSION_SECRET }
      );
      const request = new NextRequest("https://philipsun.com/admin", {
        headers: {
          cookie: `admin_session=${sealed}`,
        },
      });
      const response = await proxy(request);

      expect(response.headers.get("location")).toContain("/admin/login");
    });

    it("protects /admin on *.vercel.app preview deployments — CR-01", async () => {
      // Before the fix, the .vercel.app early-return ran before the admin
      // guard, leaving /admin wide open on previews.
      const request = new NextRequest(
        "https://philipsun-com-git-feature.vercel.app/admin"
      );
      const response = await proxy(request);

      expect(response.headers.get("location")).toContain("/admin/login");
    });

    it("protects /admin on localhost — CR-01", async () => {
      // Same bypass existed on local dev.
      const request = new NextRequest("http://localhost:3000/admin");
      const response = await proxy(request);

      expect(response.headers.get("location")).toContain("/admin/login");
    });
  });

  describe("photography subdomain deep paths — SUB-02", () => {
    it("rewrites photography.philipsun.com/pricing to /photography/pricing", async () => {
      const request = new NextRequest("https://photography.philipsun.com/pricing");
      const response = await proxy(request);
      expect(isRewrite(response)).toBe(true);
      expect(getRewrittenUrl(response)).toContain("/photography/pricing");
    });
  });

  describe("robust host parsing — WR-01", () => {
    it("passes through deep subdomains instead of routing them as the first label", async () => {
      // Before the fix, split(".")[0] would yield "staging" and the proxy
      // would happily look it up in SUBDOMAINS (here: miss → pass through, but
      // for staging.photography.philipsun.com the bug was real).
      const request = new NextRequest(
        "https://staging.photography.philipsun.com/"
      );
      const response = await proxy(request);
      expect(isRewrite(response)).toBe(false);
    });

    it("ignores www.* as a subdomain even if accidentally hit", async () => {
      const request = new NextRequest("https://www.photography.philipsun.com/");
      const response = await proxy(request);
      // www.photography.philipsun.com has two labels before the main domain,
      // so it must NOT rewrite to /photography.
      expect(isRewrite(response)).toBe(false);
    });

    it("treats hostnames case-insensitively", async () => {
      // DNS is case-insensitive; routing must match.
      const request = new NextRequest(
        "https://PHOTOGRAPHY.philipsun.com/gallery"
      );
      const response = await proxy(request);
      expect(isRewrite(response)).toBe(true);
      expect(getRewrittenUrl(response)).toContain("/photography/gallery");
    });

    it("does not rewrite hosts that don't end in the main domain", async () => {
      const request = new NextRequest("https://photography.example.com/");
      const response = await proxy(request);
      expect(isRewrite(response)).toBe(false);
    });
  });
});

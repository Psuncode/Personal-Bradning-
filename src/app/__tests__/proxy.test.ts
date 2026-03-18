// src/app/__tests__/proxy.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { isRewrite, getRewrittenUrl } from "next/experimental/testing/server";
import { proxy } from "@/proxy";

describe("proxy subdomain routing", () => {
  beforeEach(() => {
    vi.stubEnv("NEXT_PUBLIC_DOMAIN", "philipsun.com");
  });

  describe("photography subdomain", () => {
    it("rewrites photography.philipsun.com/ to /photography", () => {
      const request = new NextRequest("https://photography.philipsun.com/");
      const response = proxy(request);
      expect(isRewrite(response)).toBe(true);
      expect(getRewrittenUrl(response)).toContain("/photography");
    });

    it("rewrites photography.philipsun.com/gallery to /photography/gallery", () => {
      const request = new NextRequest("https://photography.philipsun.com/gallery");
      const response = proxy(request);
      expect(isRewrite(response)).toBe(true);
      expect(getRewrittenUrl(response)).toContain("/photography/gallery");
    });
  });

  describe("ecommerce subdomain", () => {
    it("rewrites ecommerce.philipsun.com/ to /ecommerce", () => {
      const request = new NextRequest("https://ecommerce.philipsun.com/");
      const response = proxy(request);
      expect(isRewrite(response)).toBe(true);
      expect(getRewrittenUrl(response)).toContain("/ecommerce");
    });
  });

  describe("main domain pass-through", () => {
    it("does not rewrite philipsun.com", () => {
      const request = new NextRequest("https://philipsun.com/");
      const response = proxy(request);
      expect(isRewrite(response)).toBe(false);
    });

    it("does not rewrite www.philipsun.com", () => {
      const request = new NextRequest("https://www.philipsun.com/");
      const response = proxy(request);
      expect(isRewrite(response)).toBe(false);
    });
  });

  describe("preview deployment pass-through", () => {
    it("does not rewrite .vercel.app URLs", () => {
      const request = new NextRequest("https://philipsun-com-git-main.vercel.app/");
      const response = proxy(request);
      expect(isRewrite(response)).toBe(false);
    });

    it("does not rewrite preview URLs even if they contain subdomain keywords", () => {
      const request = new NextRequest(
        "https://philipsun-com-photography-feature.vercel.app/"
      );
      const response = proxy(request);
      expect(isRewrite(response)).toBe(false);
    });
  });

  describe("localhost pass-through", () => {
    it("does not rewrite localhost", () => {
      const request = new NextRequest("http://localhost:3000/");
      const response = proxy(request);
      expect(isRewrite(response)).toBe(false);
    });

    it("does not rewrite photography.localhost", () => {
      const request = new NextRequest("http://photography.localhost:3000/");
      const response = proxy(request);
      expect(isRewrite(response)).toBe(false);
    });
  });

  describe("unknown subdomain pass-through", () => {
    it("does not rewrite unknown subdomains", () => {
      const request = new NextRequest("https://staging.philipsun.com/");
      const response = proxy(request);
      expect(isRewrite(response)).toBe(false);
    });
  });

  describe("admin route protection — CRM-02", () => {
    it("redirects /admin to /admin/login when no admin_session cookie", () => {
      const request = new NextRequest("https://philipsun.com/admin");
      const response = proxy(request);

      // Should be a redirect (302/307), not a pass-through
      expect(response.status).toBeGreaterThanOrEqual(300);
      expect(response.status).toBeLessThan(400);
      expect(response.headers.get("location")).toContain("/admin/login");
    });

    it("does not redirect /admin/login (avoids redirect loop)", () => {
      const request = new NextRequest("https://philipsun.com/admin/login");
      const response = proxy(request);

      // Should pass through (200, not redirect)
      expect(response.headers.get("location")).toBeNull();
    });

    it("passes through /admin when admin_session cookie is present", () => {
      const request = new NextRequest("https://philipsun.com/admin", {
        headers: {
          cookie: "admin_session=some-sealed-value",
        },
      });
      const response = proxy(request);

      // Should not redirect — passes through to the page
      expect(response.headers.get("location")).toBeNull();
    });
  });

  describe("photography subdomain deep paths — SUB-02", () => {
    it("rewrites photography.philipsun.com/pricing to /photography/pricing", () => {
      const request = new NextRequest("https://photography.philipsun.com/pricing");
      const response = proxy(request);
      expect(isRewrite(response)).toBe(true);
      expect(getRewrittenUrl(response)).toContain("/photography/pricing");
    });
  });
});

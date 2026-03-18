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
});

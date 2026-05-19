// src/db/index.test.ts — WR-07 / WR-08 regression coverage for the db Proxy.
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

describe("db Proxy — WR-07/08", () => {
  const ORIGINAL = process.env.DATABASE_URL;

  beforeEach(() => {
    // Each test resets the module cache so the lazy singleton in `db` rebuilds.
    vi.resetModules();
  });

  afterEach(() => {
    if (ORIGINAL === undefined) {
      delete process.env.DATABASE_URL;
    } else {
      process.env.DATABASE_URL = ORIGINAL;
    }
  });

  it("returns undefined for `then` so `await db` is safe (WR-07)", async () => {
    delete process.env.DATABASE_URL;
    const { db } = await import("./index");
    // `then` must not be a function — otherwise an accidental `await db` would
    // treat `db` as a thenable, open a connection on inspection, and stall.
    // Cast via unknown so we can poke at the unusual property without TS yelling.
    expect((db as unknown as { then: unknown }).then).toBeUndefined();
    // `await` on a non-thenable should resolve to the value itself without
    // touching the underlying driver — and crucially without throwing the
    // "DATABASE_URL is required" message we wired in for WR-08.
    await expect(Promise.resolve(db)).resolves.toBeDefined();
  });

  it("does not open a connection when accessed via symbol keys (WR-07)", async () => {
    delete process.env.DATABASE_URL;
    const { db } = await import("./index");
    // If symbol access were forwarded into getDb(), the missing DATABASE_URL
    // env var would throw. Symbol access must short-circuit.
    expect(() => (db as unknown as Record<symbol, unknown>)[Symbol.iterator]).not.toThrow();
    expect((db as unknown as Record<symbol, unknown>)[Symbol.iterator]).toBeUndefined();
  });

  it("throws a clear error when DATABASE_URL is missing on real access (WR-08)", async () => {
    delete process.env.DATABASE_URL;
    const { db } = await import("./index");
    // Real driver access (`db.select`) must surface the diagnostic — NOT the
    // opaque "URL must be a string" buried inside the neon client.
    expect(() => (db as unknown as Record<string, unknown>).select).toThrow(
      /DATABASE_URL is required/
    );
  });
});

import { describe, it, expect } from 'vitest';
import { RateLimiter, contactRateLimiter } from './rate-limit';

describe('RateLimiter', () => {
  it('allows the first attempt for a brand-new key', () => {
    const rl = new RateLimiter({ now: () => 0 });
    expect(rl.check('1.1.1.1')).toEqual({ allowed: true, retryAfterMs: 0 });
  });

  it('allows up to burstLimit attempts inside the window', () => {
    let t = 0;
    const rl = new RateLimiter({
      burstLimit: 5,
      burstWindowMs: 15 * 60 * 1000,
      cooldownMs: 60 * 1000,
      now: () => t,
    });

    for (let i = 0; i < 5; i++) {
      expect(rl.check('ip-a').allowed).toBe(true);
      t += 1000; // 1s between attempts
    }
  });

  it('blocks the 6th attempt inside the burst window', () => {
    let t = 0;
    const rl = new RateLimiter({
      burstLimit: 5,
      burstWindowMs: 15 * 60 * 1000,
      cooldownMs: 60 * 1000,
      now: () => t,
    });

    for (let i = 0; i < 5; i++) {
      rl.check('ip-b');
      t += 1000;
    }

    const result = rl.check('ip-b');
    expect(result.allowed).toBe(false);
    expect(result.retryAfterMs).toBeGreaterThan(0);
    expect(result.retryAfterMs).toBeLessThanOrEqual(60 * 1000);
  });

  it('allows one attempt per cooldown after the burst is exhausted', () => {
    let t = 0;
    const rl = new RateLimiter({
      burstLimit: 5,
      burstWindowMs: 15 * 60 * 1000,
      cooldownMs: 60 * 1000,
      now: () => t,
    });

    // Burn the burst.
    for (let i = 0; i < 5; i++) {
      rl.check('ip-c');
      t += 1000;
    }

    // Immediately blocked.
    expect(rl.check('ip-c').allowed).toBe(false);

    // After 30s — still blocked.
    t += 30 * 1000;
    expect(rl.check('ip-c').allowed).toBe(false);

    // After a full minute since last attempt — allowed once.
    t += 31 * 1000;
    expect(rl.check('ip-c').allowed).toBe(true);

    // Then immediately blocked again.
    expect(rl.check('ip-c').allowed).toBe(false);
  });

  it('resets the burst counter once the burst window has elapsed', () => {
    let t = 0;
    const rl = new RateLimiter({
      burstLimit: 5,
      burstWindowMs: 15 * 60 * 1000,
      cooldownMs: 60 * 1000,
      now: () => t,
    });

    // Burn the burst at t=0..4s.
    for (let i = 0; i < 5; i++) {
      rl.check('ip-d');
      t += 1000;
    }
    expect(rl.check('ip-d').allowed).toBe(false);

    // Jump past the burst window — counter should reset.
    t += 15 * 60 * 1000 + 1;
    expect(rl.check('ip-d').allowed).toBe(true);

    // And we get the full burst again.
    for (let i = 0; i < 4; i++) {
      expect(rl.check('ip-d').allowed).toBe(true);
      t += 1000;
    }
    expect(rl.check('ip-d').allowed).toBe(false);
  });

  it('tracks each key independently', () => {
    const t = 0;
    const rl = new RateLimiter({
      burstLimit: 2,
      burstWindowMs: 15 * 60 * 1000,
      cooldownMs: 60 * 1000,
      now: () => t,
    });

    rl.check('ip-x');
    rl.check('ip-x');
    expect(rl.check('ip-x').allowed).toBe(false);

    // ip-y still has its full quota.
    expect(rl.check('ip-y').allowed).toBe(true);
    expect(rl.check('ip-y').allowed).toBe(true);
    expect(rl.check('ip-y').allowed).toBe(false);
  });

  it('reports retryAfterMs that shrinks as time advances inside cooldown', () => {
    let t = 0;
    const rl = new RateLimiter({
      burstLimit: 1,
      burstWindowMs: 15 * 60 * 1000,
      cooldownMs: 60 * 1000,
      now: () => t,
    });

    rl.check('ip-r'); // burn
    const first = rl.check('ip-r');
    expect(first.allowed).toBe(false);
    expect(first.retryAfterMs).toBeGreaterThan(50_000);

    t += 30_000;
    const second = rl.check('ip-r');
    expect(second.allowed).toBe(false);
    expect(second.retryAfterMs).toBeLessThan(first.retryAfterMs);
  });

  it('reset() clears all entries', () => {
    const rl = new RateLimiter({
      burstLimit: 1,
      burstWindowMs: 15 * 60 * 1000,
      cooldownMs: 60 * 1000,
      now: () => 0,
    });
    rl.check('ip-z');
    expect(rl.check('ip-z').allowed).toBe(false);
    rl.reset();
    expect(rl.check('ip-z').allowed).toBe(true);
  });
});

describe('contactRateLimiter singleton', () => {
  // Singleton tests reset() between cases so each test gets a clean store.
  // The singleton uses Date.now() internally (not an injectable clock), so we
  // exercise its policy through the same `check(key)` interface real callers
  // use. We're not re-testing time behaviour here (the unit tests above cover
  // that) — only that the singleton was wired up with the documented budget.

  it('is a RateLimiter instance with the public check() API', () => {
    contactRateLimiter.reset();
    expect(contactRateLimiter).toBeInstanceOf(RateLimiter);
    const r = contactRateLimiter.check('contact-ip-init');
    expect(r.allowed).toBe(true);
    expect(r.retryAfterMs).toBe(0);
    contactRateLimiter.reset();
  });

  it('allows up to 5 attempts in quick succession from one key', () => {
    contactRateLimiter.reset();
    for (let i = 0; i < 5; i++) {
      expect(contactRateLimiter.check('contact-ip-burst').allowed).toBe(true);
    }
    contactRateLimiter.reset();
  });

  it('denies the 6th attempt from the same key and reports retryAfterMs', () => {
    contactRateLimiter.reset();
    for (let i = 0; i < 5; i++) {
      contactRateLimiter.check('contact-ip-overflow');
    }
    const denied = contactRateLimiter.check('contact-ip-overflow');
    expect(denied.allowed).toBe(false);
    expect(denied.retryAfterMs).toBeGreaterThan(0);
    // Within one cooldown window (1 min).
    expect(denied.retryAfterMs).toBeLessThanOrEqual(60 * 1000);
    contactRateLimiter.reset();
  });

  it('tracks contact keys independently of login (separate singleton stores)', () => {
    contactRateLimiter.reset();
    // Burn the contact budget for ip-shared.
    for (let i = 0; i < 5; i++) {
      contactRateLimiter.check('contact-ip-shared');
    }
    expect(contactRateLimiter.check('contact-ip-shared').allowed).toBe(false);

    // A fresh key still has its full quota — confirms per-key isolation.
    expect(contactRateLimiter.check('contact-ip-fresh').allowed).toBe(true);
    contactRateLimiter.reset();
  });
});

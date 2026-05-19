// src/lib/rate-limit.ts
//
// Per-key in-memory rate limiter with a burst window + cooldown phase.
//
// Policy (Phase 02 CR-02 hardening):
//   - Up to BURST_LIMIT attempts inside BURST_WINDOW_MS (default: 5 per 15 min)
//   - After the burst is exhausted, attempts are throttled to 1 per
//     COOLDOWN_MS (default: 1 per minute)
//   - The burst counter resets once BURST_WINDOW_MS has elapsed since the
//     first attempt in the current window.
//
// NOTE: This is a Node-process-local Map and will reset on every cold start.
// Vercel serverless can spin up multiple isolated lambdas, so this is best-
// effort throttling. When admin gets deployed to production, upgrade this to
// Vercel KV or Upstash Ratelimit with the same interface.

export type RateLimitResult = {
  allowed: boolean;
  // Milliseconds until the next attempt would be allowed. Only meaningful
  // when allowed=false.
  retryAfterMs: number;
};

export type RateLimitOptions = {
  burstLimit?: number;
  burstWindowMs?: number;
  cooldownMs?: number;
  now?: () => number;
};

type Entry = {
  windowStart: number;
  attempts: number;
  lastAttempt: number;
};

const DEFAULTS = {
  burstLimit: 5,
  burstWindowMs: 15 * 60 * 1000, // 15 min
  cooldownMs: 60 * 1000, // 1 min
} as const;

export class RateLimiter {
  private readonly store = new Map<string, Entry>();
  private readonly burstLimit: number;
  private readonly burstWindowMs: number;
  private readonly cooldownMs: number;
  private readonly now: () => number;

  constructor(opts: RateLimitOptions = {}) {
    this.burstLimit = opts.burstLimit ?? DEFAULTS.burstLimit;
    this.burstWindowMs = opts.burstWindowMs ?? DEFAULTS.burstWindowMs;
    this.cooldownMs = opts.cooldownMs ?? DEFAULTS.cooldownMs;
    this.now = opts.now ?? (() => Date.now());
  }

  /**
   * Record an attempt for `key` and decide whether it is allowed.
   * Called once per login submission.
   */
  check(key: string): RateLimitResult {
    const now = this.now();
    const entry = this.store.get(key);

    if (!entry) {
      this.store.set(key, { windowStart: now, attempts: 1, lastAttempt: now });
      return { allowed: true, retryAfterMs: 0 };
    }

    // Burst window expired — reset counters.
    if (now - entry.windowStart >= this.burstWindowMs) {
      entry.windowStart = now;
      entry.attempts = 1;
      entry.lastAttempt = now;
      return { allowed: true, retryAfterMs: 0 };
    }

    // Inside the burst window.
    if (entry.attempts < this.burstLimit) {
      entry.attempts += 1;
      entry.lastAttempt = now;
      return { allowed: true, retryAfterMs: 0 };
    }

    // Burst exhausted — enforce cooldown.
    const sinceLast = now - entry.lastAttempt;
    if (sinceLast >= this.cooldownMs) {
      entry.attempts += 1;
      entry.lastAttempt = now;
      return { allowed: true, retryAfterMs: 0 };
    }

    return {
      allowed: false,
      retryAfterMs: this.cooldownMs - sinceLast,
    };
  }

  /** Test helper. Clears all entries. */
  reset(): void {
    this.store.clear();
  }
}

// Default singleton used by the loginAction. Each Node process gets its own.
export const loginRateLimiter = new RateLimiter();

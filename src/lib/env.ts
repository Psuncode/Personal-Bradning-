// src/lib/env.ts
//
// Tiered env-var registry for the Wave 7a payment / contact / email surfaces.
//
// Three tiers, three helpers — pick by *when* the variable must be present:
//
//   1. requireBuildEnv(name)   — value must exist when the calling module
//      loads. Use for vars that must be present for the page graph to compile
//      or for the server bundle to even import (e.g. SESSION_SECRET length is
//      enforced at module-load by iron-session config).
//
//   2. requireRuntimeEnv(name) — value is resolved + cached on first call.
//      Use for lazy-singleton secrets (Stripe key, Resend key, DB URL) so the
//      build doesn't crash if the secret is only present at runtime in
//      preview/production environments.
//
//   3. optionalEnv(name, default) — never throws; returns the supplied default
//      when unset. Use for tunables with sane defaults (SESSION_VERSION,
//      NODE_ENV) and for "fall back to siteConfig" cases where the caller
//      decides what to do with an unset value.
//
// When adding a new var:
//   - decide the tier first (build-required, runtime-required, optional)
//   - add it to KNOWN_ENV_VARS below so it's grep-able from one file
//   - import the matching helper in the consumer
//   - never `process.env.X!` — that is what these helpers exist to replace

/**
 * Centralised registry of every env var the app reads, grouped by tier.
 * Pure documentation/grep-aid — the helpers below do not consult this list.
 */
export const KNOWN_ENV_VARS = {
  BUILD_TIME_REQUIRED: ['SESSION_SECRET', 'NEXT_PUBLIC_PHOTOGRAPHY_URL'] as const,
  RUNTIME_REQUIRED: [
    'STRIPE_SECRET_KEY',
    'STRIPE_WEBHOOK_SECRET',
    'RESEND_API_KEY',
    'DATABASE_URL',
    'DATABASE_URL_UNPOOLED',
    'ADMIN_PASSWORD',
  ] as const,
  OPTIONAL_WITH_DEFAULT: {
    SESSION_VERSION: '1',
    BOOKING_NOTIFICATION_EMAIL: null,
    NODE_ENV: 'development',
  } as const,
} as const;

// Lazy cache for `requireRuntimeEnv`. Keyed by var name, value is the resolved
// string. Repeated calls skip the process.env lookup entirely — matters for
// hot paths like webhook handlers that may resolve the same secret per request.
const runtimeCache = new Map<string, string>();

function missingMessage(name: string): string {
  return `${name} environment variable is required (set in .env.local for dev, or Vercel project settings for preview/production)`;
}

/**
 * Read an env var that MUST be set when the calling module is loaded.
 *
 * Throws an Error with an actionable message if the variable is missing or an
 * empty string. Empty-string is treated as missing because Vercel and most
 * `.env` parsers happily round-trip `FOO=` to `''`, which is almost never
 * what the caller wants.
 */
export function requireBuildEnv(name: string): string {
  const raw = process.env[name];
  if (raw == null || raw === '') {
    throw new Error(missingMessage(name));
  }
  return raw;
}

/**
 * Read an env var lazily — does NOT throw until the helper is called, and
 * caches the resolved value for subsequent calls.
 *
 * Use this for any secret or config that is only needed at request time so
 * the build does not crash when the secret is unavailable (e.g. local
 * development without a Stripe key, or `next build` running before secrets
 * are wired into a preview environment).
 */
export function requireRuntimeEnv(name: string): string {
  const cached = runtimeCache.get(name);
  if (cached !== undefined) return cached;

  const raw = process.env[name];
  if (raw == null || raw === '') {
    throw new Error(missingMessage(name));
  }
  runtimeCache.set(name, raw);
  return raw;
}

/**
 * Read an env var with a default fallback. Never throws.
 *
 * Empty strings count as "unset" — same rationale as `requireBuildEnv`.
 */
export function optionalEnv(name: string, defaultValue: string): string {
  const raw = process.env[name];
  if (raw == null || raw === '') return defaultValue;
  return raw;
}

/**
 * Test-only escape hatch: clears the runtime cache so a test can re-stub an
 * env var and call `requireRuntimeEnv` again with the new value. Not for
 * production use — exported with a `__` prefix to discourage import in app
 * code.
 */
export function __resetEnvCache(): void {
  runtimeCache.clear();
}

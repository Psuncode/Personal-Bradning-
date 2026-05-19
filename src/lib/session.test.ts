import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { currentSessionVersion, isSessionValid } from './session';

describe('currentSessionVersion', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('defaults to "1" when SESSION_VERSION is unset', () => {
    vi.stubEnv('SESSION_VERSION', '');
    expect(currentSessionVersion()).toBe('1');
  });

  it('returns the value of SESSION_VERSION when set', () => {
    vi.stubEnv('SESSION_VERSION', '42');
    expect(currentSessionVersion()).toBe('42');
  });
});

describe('isSessionValid', () => {
  beforeEach(() => {
    vi.stubEnv('SESSION_VERSION', '3');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('returns false when isLoggedIn is false', () => {
    expect(isSessionValid({ isLoggedIn: false, sessionVersion: '3' })).toBe(false);
  });

  it('returns false when sessionVersion is missing', () => {
    expect(isSessionValid({ isLoggedIn: true })).toBe(false);
  });

  it('returns false when sessionVersion is stale', () => {
    expect(isSessionValid({ isLoggedIn: true, sessionVersion: '2' })).toBe(false);
  });

  it('returns true when both flags match', () => {
    expect(isSessionValid({ isLoggedIn: true, sessionVersion: '3' })).toBe(true);
  });

  it('treats env bump as instant revocation', () => {
    expect(isSessionValid({ isLoggedIn: true, sessionVersion: '3' })).toBe(true);
    vi.stubEnv('SESSION_VERSION', '4');
    expect(isSessionValid({ isLoggedIn: true, sessionVersion: '3' })).toBe(false);
  });
});

describe('SESSION_SECRET validation (WR-02)', () => {
  // Next 16 ships `NODE_ENV` as a read-only literal on `ProcessEnv`, so raw
  // `process.env.NODE_ENV = ...` no longer typechecks. `vi.stubEnv` is the
  // Vitest-blessed escape hatch — it mutates the runtime env while keeping
  // the static type happy. Closes the post-Wave-7a `tsc --noEmit` regression
  // flagged in R1.
  afterEach(() => {
    vi.resetModules();
    vi.unstubAllEnvs();
  });

  it('throws at module load when SESSION_SECRET is missing in non-test environments', async () => {
    vi.resetModules();
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('SESSION_SECRET', '');
    await expect(import('./session')).rejects.toThrow(/SESSION_SECRET/);
  });

  it('throws at module load when SESSION_SECRET is shorter than 32 chars', async () => {
    vi.resetModules();
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('SESSION_SECRET', 'tooshort');
    await expect(import('./session')).rejects.toThrow(/at least 32 characters/);
  });

  it('accepts a ≥32 char SESSION_SECRET in non-test environments', async () => {
    vi.resetModules();
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('SESSION_SECRET', 'x'.repeat(32));
    const mod = await import('./session');
    expect(mod.sessionOptions.password).toBe('x'.repeat(32));
  });

  it('skips strict validation in test environments to support vi.stubEnv', async () => {
    vi.resetModules();
    vi.stubEnv('NODE_ENV', 'test');
    vi.stubEnv('SESSION_SECRET', '');
    const mod = await import('./session');
    expect(mod.sessionOptions.password).toBe('');
  });

  it('surfaces the tiered env-registry diagnostic when SESSION_SECRET is missing', async () => {
    // Wave 7a integration: session.ts now resolves SESSION_SECRET through
    // `requireBuildEnv`, so a missing var produces the standardised message
    // ("environment variable is required (set in .env.local for dev, or Vercel
    // project settings for preview/production)") instead of the old ad-hoc
    // wording. Pinning the phrasing keeps the developer-facing guidance
    // consistent across the three migrated modules.
    vi.resetModules();
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('SESSION_SECRET', '');
    await expect(import('./session')).rejects.toThrow(
      /SESSION_SECRET environment variable is required.*\.env\.local.*Vercel project settings/s
    );
  });
});

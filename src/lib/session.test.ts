import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { currentSessionVersion, isSessionValid } from './session';

describe('currentSessionVersion', () => {
  const original = process.env.SESSION_VERSION;
  afterEach(() => {
    if (original === undefined) delete process.env.SESSION_VERSION;
    else process.env.SESSION_VERSION = original;
  });

  it('defaults to "1" when SESSION_VERSION is unset', () => {
    delete process.env.SESSION_VERSION;
    expect(currentSessionVersion()).toBe('1');
  });

  it('returns the value of SESSION_VERSION when set', () => {
    process.env.SESSION_VERSION = '42';
    expect(currentSessionVersion()).toBe('42');
  });
});

describe('isSessionValid', () => {
  beforeEach(() => {
    process.env.SESSION_VERSION = '3';
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
    process.env.SESSION_VERSION = '4';
    expect(isSessionValid({ isLoggedIn: true, sessionVersion: '3' })).toBe(false);
  });
});

describe('SESSION_SECRET validation (WR-02)', () => {
  const originalNodeEnv = process.env.NODE_ENV;
  const originalSecret = process.env.SESSION_SECRET;

  afterEach(() => {
    vi.resetModules();
    if (originalNodeEnv === undefined) delete process.env.NODE_ENV;
    else process.env.NODE_ENV = originalNodeEnv;
    if (originalSecret === undefined) delete process.env.SESSION_SECRET;
    else process.env.SESSION_SECRET = originalSecret;
  });

  it('throws at module load when SESSION_SECRET is missing in non-test environments', async () => {
    vi.resetModules();
    process.env.NODE_ENV = 'production';
    delete process.env.SESSION_SECRET;
    await expect(import('./session')).rejects.toThrow(/SESSION_SECRET/);
  });

  it('throws at module load when SESSION_SECRET is shorter than 32 chars', async () => {
    vi.resetModules();
    process.env.NODE_ENV = 'production';
    process.env.SESSION_SECRET = 'tooshort';
    await expect(import('./session')).rejects.toThrow(/at least 32 characters/);
  });

  it('accepts a ≥32 char SESSION_SECRET in non-test environments', async () => {
    vi.resetModules();
    process.env.NODE_ENV = 'production';
    process.env.SESSION_SECRET = 'x'.repeat(32);
    const mod = await import('./session');
    expect(mod.sessionOptions.password).toBe('x'.repeat(32));
  });

  it('skips strict validation in test environments to support vi.stubEnv', async () => {
    vi.resetModules();
    process.env.NODE_ENV = 'test';
    delete process.env.SESSION_SECRET;
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
    process.env.NODE_ENV = 'production';
    delete process.env.SESSION_SECRET;
    await expect(import('./session')).rejects.toThrow(
      /SESSION_SECRET environment variable is required.*\.env\.local.*Vercel project settings/s
    );
  });
});

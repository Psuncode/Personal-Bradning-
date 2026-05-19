// src/lib/env.test.ts
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  __resetEnvCache,
  optionalEnv,
  requireBuildEnv,
  requireRuntimeEnv,
} from './env';

describe('requireBuildEnv', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('throws a clear error naming the var when missing', () => {
    vi.stubEnv('SOME_BUILD_VAR', '');
    expect(() => requireBuildEnv('SOME_BUILD_VAR')).toThrow(/SOME_BUILD_VAR/);
  });

  it('throws when the value is an empty string', () => {
    vi.stubEnv('EMPTY_BUILD_VAR', '');
    expect(() => requireBuildEnv('EMPTY_BUILD_VAR')).toThrow(
      /EMPTY_BUILD_VAR environment variable is required/
    );
  });

  it('mentions where to set the var in the error message', () => {
    vi.stubEnv('SOMETHING_MISSING', '');
    expect(() => requireBuildEnv('SOMETHING_MISSING')).toThrow(/\.env\.local/);
    expect(() => requireBuildEnv('SOMETHING_MISSING')).toThrow(/Vercel/);
  });

  it('returns the value when set', () => {
    vi.stubEnv('PRESENT_BUILD_VAR', 'hello');
    expect(requireBuildEnv('PRESENT_BUILD_VAR')).toBe('hello');
  });
});

describe('requireRuntimeEnv', () => {
  beforeEach(() => {
    __resetEnvCache();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    __resetEnvCache();
  });

  it('lazy-evaluates — module load alone does not throw', () => {
    // Module is already imported up top with no env stubbed; if it threw at
    // load, this file wouldn't have parsed. Sanity-check by asserting the
    // helper itself only throws when *called*.
    vi.stubEnv('LAZY_VAR', '');
    expect(() => requireRuntimeEnv('LAZY_VAR')).toThrow(/LAZY_VAR/);
  });

  it('caches subsequent calls so process.env is read once', () => {
    vi.stubEnv('CACHED_VAR', 'first-value');
    expect(requireRuntimeEnv('CACHED_VAR')).toBe('first-value');

    // Mutate process.env behind the helper's back — cached value should win.
    vi.stubEnv('CACHED_VAR', 'second-value');
    expect(requireRuntimeEnv('CACHED_VAR')).toBe('first-value');
  });

  it('throws a clear error when missing', () => {
    vi.stubEnv('MISSING_RUNTIME', '');
    expect(() => requireRuntimeEnv('MISSING_RUNTIME')).toThrow(
      /MISSING_RUNTIME environment variable is required/
    );
  });

  it('returns the value when set', () => {
    vi.stubEnv('PRESENT_RUNTIME', 'abc');
    expect(requireRuntimeEnv('PRESENT_RUNTIME')).toBe('abc');
  });
});

describe('optionalEnv', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('returns the default when unset', () => {
    vi.stubEnv('UNSET_OPTIONAL', '');
    expect(optionalEnv('UNSET_OPTIONAL', 'fallback')).toBe('fallback');
  });

  it('returns the default when set to empty string', () => {
    vi.stubEnv('EMPTY_OPTIONAL', '');
    expect(optionalEnv('EMPTY_OPTIONAL', 'fallback')).toBe('fallback');
  });

  it('returns the value when set', () => {
    vi.stubEnv('SET_OPTIONAL', 'real-value');
    expect(optionalEnv('SET_OPTIONAL', 'fallback')).toBe('real-value');
  });
});

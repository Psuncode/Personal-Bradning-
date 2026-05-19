import { describe, it, expect, beforeEach, afterEach } from 'vitest';
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

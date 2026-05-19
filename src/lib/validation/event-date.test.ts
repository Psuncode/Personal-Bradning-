// src/lib/validation/event-date.test.ts
import { describe, expect, it } from 'vitest';
import { normalizeEventDate } from './event-date';

describe('normalizeEventDate', () => {
  it('normalizes a Date at noon UTC to midnight UTC of the same day', () => {
    const input = new Date('2026-08-15T12:00:00Z');
    const out = normalizeEventDate(input);
    expect(out.toISOString()).toBe('2026-08-15T00:00:00.000Z');
  });

  it('normalizes an ISO string with mid-day time to UTC midnight', () => {
    const out = normalizeEventDate('2026-08-15T15:30:00Z');
    expect(out.toISOString()).toBe('2026-08-15T00:00:00.000Z');
  });

  it('uses the UTC calendar day when the input has a timezone offset', () => {
    // 2026-08-15 22:00 in -08:00 is 2026-08-16 06:00 UTC. Per the contract
    // we collapse to the UTC calendar day, so this should be Aug 16.
    const out = normalizeEventDate('2026-08-15T22:00:00-08:00');
    expect(out.toISOString()).toBe('2026-08-16T00:00:00.000Z');
  });

  it('is idempotent', () => {
    const once = normalizeEventDate('2026-08-15T15:30:00Z');
    const twice = normalizeEventDate(once);
    expect(twice.getTime()).toBe(once.getTime());
    expect(twice.toISOString()).toBe('2026-08-15T00:00:00.000Z');
  });

  it('throws TypeError on an unparseable string', () => {
    expect(() => normalizeEventDate('not-a-date')).toThrow(TypeError);
  });

  it('throws TypeError on an invalid Date instance', () => {
    expect(() => normalizeEventDate(new Date('not-a-date'))).toThrow(TypeError);
  });

  it('produces clean UTC midnight across a US DST boundary in March', () => {
    // DST in US/Eastern began 2026-03-08. An eastern-time midnight on the
    // DST-jump day still maps to a single UTC calendar day — we should not
    // see drift to the prior/next day from the DST hour skip.
    const out = normalizeEventDate('2026-03-08T05:00:00Z');
    expect(out.toISOString()).toBe('2026-03-08T00:00:00.000Z');
    expect(out.getUTCHours()).toBe(0);
    expect(out.getUTCMinutes()).toBe(0);
    expect(out.getUTCSeconds()).toBe(0);
    expect(out.getUTCMilliseconds()).toBe(0);
  });

  it('produces clean UTC midnight across a US DST boundary in November', () => {
    // DST in US/Eastern ended 2026-11-01.
    const out = normalizeEventDate('2026-11-01T07:30:00Z');
    expect(out.toISOString()).toBe('2026-11-01T00:00:00.000Z');
  });
});

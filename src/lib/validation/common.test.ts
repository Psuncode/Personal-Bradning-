// src/lib/validation/common.test.ts
import { describe, expect, it } from 'vitest';
import {
  CONTROL_CHARS,
  Email,
  boundedString,
  optionalTrimmed,
  requiredTrimmedString,
} from './common';

describe('CONTROL_CHARS', () => {
  it('matches ASCII control characters', () => {
    expect(CONTROL_CHARS.test('\x00')).toBe(true);
    expect(CONTROL_CHARS.test('\x07')).toBe(true);
    expect(CONTROL_CHARS.test('\x1f')).toBe(true);
    expect(CONTROL_CHARS.test('\x7f')).toBe(true);
    expect(CONTROL_CHARS.test('hello\nworld')).toBe(true);
    expect(CONTROL_CHARS.test('hello\tworld')).toBe(true);
  });

  it('does not match printable characters', () => {
    expect(CONTROL_CHARS.test('hello world')).toBe(false);
    expect(CONTROL_CHARS.test('foo@bar.com')).toBe(false);
    expect(CONTROL_CHARS.test('Émigré 2026!')).toBe(false);
  });
});

describe('Email', () => {
  it('rejects malformed addresses', () => {
    expect(Email.safeParse('not-an-email').success).toBe(false);
    expect(Email.safeParse('foo@').success).toBe(false);
    expect(Email.safeParse('@bar.com').success).toBe(false);
    expect(Email.safeParse('').success).toBe(false);
  });

  it('accepts a valid address', () => {
    const result = Email.safeParse('person@example.com');
    expect(result.success).toBe(true);
  });
});

describe('requiredTrimmedString', () => {
  const schema = requiredTrimmedString('Name');

  it('rejects empty string with field-named message', () => {
    const r = schema.safeParse('');
    expect(r.success).toBe(false);
    if (!r.success) {
      expect(r.error.issues[0]?.message).toBe('Name is required.');
    }
  });

  it('rejects whitespace-only input', () => {
    const r = schema.safeParse('   ');
    expect(r.success).toBe(false);
    if (!r.success) {
      expect(r.error.issues[0]?.message).toBe('Name is required.');
    }
  });

  it('accepts and trims valid input', () => {
    const r = schema.safeParse('  Philip  ');
    expect(r.success).toBe(true);
    if (r.success) expect(r.data).toBe('Philip');
  });
});

describe('optionalTrimmed', () => {
  it('returns undefined for empty string', () => {
    const r = optionalTrimmed.safeParse('');
    expect(r.success).toBe(true);
    if (r.success) expect(r.data).toBeUndefined();
  });

  it('returns undefined for whitespace-only', () => {
    const r = optionalTrimmed.safeParse('   \t\n  ');
    expect(r.success).toBe(true);
    if (r.success) expect(r.data).toBeUndefined();
  });

  it('returns undefined when omitted entirely', () => {
    const r = optionalTrimmed.safeParse(undefined);
    expect(r.success).toBe(true);
    if (r.success) expect(r.data).toBeUndefined();
  });

  it('returns trimmed value for valid input', () => {
    const r = optionalTrimmed.safeParse('  hello  ');
    expect(r.success).toBe(true);
    if (r.success) expect(r.data).toBe('hello');
  });
});

describe('boundedString', () => {
  const schema = boundedString(10, 'Subject');

  it('rejects values over the cap with field-named message', () => {
    const r = schema.safeParse('x'.repeat(11));
    expect(r.success).toBe(false);
    if (!r.success) {
      expect(r.error.issues[0]?.message).toBe(
        'Subject must be 10 characters or fewer.'
      );
    }
  });

  it('returns undefined for empty string', () => {
    const r = schema.safeParse('');
    expect(r.success).toBe(true);
    if (r.success) expect(r.data).toBeUndefined();
  });

  it('returns trimmed value within the cap', () => {
    const r = schema.safeParse('  hi  ');
    expect(r.success).toBe(true);
    if (r.success) expect(r.data).toBe('hi');
  });
});

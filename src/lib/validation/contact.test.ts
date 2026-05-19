import { describe, it, expect } from 'vitest';
import {
  contactFormSchema,
  normalizeReferer,
  extractContactPayload,
  CONTACT_LIMITS,
} from './contact';

describe('contactFormSchema', () => {
  // Happy path
  it('accepts a well-formed submission', () => {
    const result = contactFormSchema.safeParse({
      name: 'Test User',
      email: 'test@example.com',
      subject: 'Hi',
      message: 'Hello there',
      utm_source: 'linkedin',
      utm_medium: 'social',
      utm_campaign: 'spring2026',
      referer: 'https://example.com/post',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe('Test User');
      expect(result.data.email).toBe('test@example.com');
      expect(result.data.utm_source).toBe('linkedin');
    }
  });

  it('treats subject + utm fields as optional when omitted', () => {
    const result = contactFormSchema.safeParse({
      name: 'Test User',
      email: 'test@example.com',
      message: 'Hello there',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.subject).toBeUndefined();
      expect(result.data.utm_source).toBeUndefined();
    }
  });

  it('treats empty-string optionals as undefined', () => {
    const result = contactFormSchema.safeParse({
      name: 'Test User',
      email: 'test@example.com',
      message: 'Hello there',
      subject: '   ',
      utm_source: '',
      utm_medium: '',
      utm_campaign: '',
      referer: '',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.subject).toBeUndefined();
      expect(result.data.utm_source).toBeUndefined();
      expect(result.data.referer).toBeUndefined();
    }
  });

  // WR-04: email format
  it('WR-04: rejects an invalid email format', () => {
    const result = contactFormSchema.safeParse({
      name: 'Test User',
      email: 'not-an-email',
      message: 'Hello there',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const flat = result.error.flatten();
      expect(flat.fieldErrors.email?.[0]).toMatch(/valid email/i);
    }
  });

  // WR-05: message length cap
  it('WR-05: rejects messages longer than the cap', () => {
    const result = contactFormSchema.safeParse({
      name: 'Test User',
      email: 'test@example.com',
      message: 'a'.repeat(CONTACT_LIMITS.message + 1),
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const flat = result.error.flatten();
      expect(flat.fieldErrors.message?.[0]).toMatch(/5000/);
    }
  });

  it('WR-05: accepts a message exactly at the cap', () => {
    const result = contactFormSchema.safeParse({
      name: 'Test User',
      email: 'test@example.com',
      message: 'a'.repeat(CONTACT_LIMITS.message),
    });
    expect(result.success).toBe(true);
  });

  // Name cap
  it('rejects names longer than the cap', () => {
    const result = contactFormSchema.safeParse({
      name: 'a'.repeat(CONTACT_LIMITS.name + 1),
      email: 'test@example.com',
      message: 'Hello there',
    });
    expect(result.success).toBe(false);
  });

  it('rejects empty/whitespace-only name', () => {
    const result = contactFormSchema.safeParse({
      name: '   ',
      email: 'test@example.com',
      message: 'Hello there',
    });
    expect(result.success).toBe(false);
  });

  it('rejects empty/whitespace-only message', () => {
    const result = contactFormSchema.safeParse({
      name: 'Test User',
      email: 'test@example.com',
      message: '     ',
    });
    expect(result.success).toBe(false);
  });

  // WR-06: UTM caps + bogus content
  it('WR-06: rejects utm_source longer than the cap', () => {
    const result = contactFormSchema.safeParse({
      name: 'Test User',
      email: 'test@example.com',
      message: 'Hello there',
      utm_source: 'a'.repeat(CONTACT_LIMITS.utm + 1),
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const flat = result.error.flatten();
      expect(flat.fieldErrors.utm_source?.[0]).toMatch(/200/);
    }
  });

  it('WR-06: rejects utm_medium with control characters', () => {
    const result = contactFormSchema.safeParse({
      name: 'Test User',
      email: 'test@example.com',
      message: 'Hello there',
      utm_medium: 'social\n\nDROP TABLE',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const flat = result.error.flatten();
      expect(flat.fieldErrors.utm_medium?.[0]).toMatch(/invalid/i);
    }
  });

  it('WR-06: applies the cap to all three utm fields', () => {
    const long = 'a'.repeat(CONTACT_LIMITS.utm + 5);
    const result = contactFormSchema.safeParse({
      name: 'Test User',
      email: 'test@example.com',
      message: 'Hello there',
      utm_source: long,
      utm_medium: long,
      utm_campaign: long,
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const flat = result.error.flatten();
      expect(flat.fieldErrors.utm_source).toBeDefined();
      expect(flat.fieldErrors.utm_medium).toBeDefined();
      expect(flat.fieldErrors.utm_campaign).toBeDefined();
    }
  });

  // WR-01: referer cap
  it('WR-01: rejects referer longer than the cap when passed through schema', () => {
    const result = contactFormSchema.safeParse({
      name: 'Test User',
      email: 'test@example.com',
      message: 'Hello there',
      referer: 'https://example.com/' + 'a'.repeat(CONTACT_LIMITS.referer),
    });
    expect(result.success).toBe(false);
  });
});

describe('normalizeReferer (WR-01)', () => {
  it('returns undefined for null / empty', () => {
    expect(normalizeReferer(null)).toBeUndefined();
    expect(normalizeReferer(undefined)).toBeUndefined();
    expect(normalizeReferer('')).toBeUndefined();
    expect(normalizeReferer('    ')).toBeUndefined();
  });

  it('passes through short referers unchanged (after trim)', () => {
    expect(normalizeReferer('  https://example.com/x  ')).toBe('https://example.com/x');
  });

  it('truncates referers longer than the cap', () => {
    const giant = 'https://example.com/' + 'a'.repeat(CONTACT_LIMITS.referer + 500);
    const out = normalizeReferer(giant);
    expect(out).toBeDefined();
    expect(out!.length).toBe(CONTACT_LIMITS.referer);
  });
});

describe('extractContactPayload', () => {
  it('pulls expected fields from FormData', () => {
    const fd = new FormData();
    fd.set('name', 'Test User');
    fd.set('email', 'test@example.com');
    fd.set('message', 'Hello');
    fd.set('utm_source', 'linkedin');
    const payload = extractContactPayload(fd, 'https://example.com/x');
    expect(payload).toMatchObject({
      name: 'Test User',
      email: 'test@example.com',
      message: 'Hello',
      utm_source: 'linkedin',
      referer: 'https://example.com/x',
    });
  });

  it('truncates an over-long referer before it reaches the schema (WR-01)', () => {
    const fd = new FormData();
    fd.set('name', 'Test User');
    fd.set('email', 'test@example.com');
    fd.set('message', 'Hello');
    const giant = 'r'.repeat(CONTACT_LIMITS.referer + 1000);
    const payload = extractContactPayload(fd, giant);
    expect(typeof payload.referer).toBe('string');
    expect((payload.referer as string).length).toBe(CONTACT_LIMITS.referer);
  });

  it('round-trips a full payload through extract -> schema', () => {
    const fd = new FormData();
    fd.set('name', 'Test User');
    fd.set('email', 'test@example.com');
    fd.set('subject', 'Hi');
    fd.set('message', 'Hello');
    fd.set('utm_source', 'linkedin');
    fd.set('utm_medium', 'social');
    fd.set('utm_campaign', 'spring');
    const payload = extractContactPayload(fd, 'https://example.com/');
    const parsed = contactFormSchema.safeParse(payload);
    expect(parsed.success).toBe(true);
  });
});

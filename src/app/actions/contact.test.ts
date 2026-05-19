import { describe, it, expect, vi, beforeEach } from 'vitest';
import { contactRateLimiter } from '@/lib/rate-limit';

// Mock the database module
const mockInsert = vi.fn().mockReturnValue({
  values: vi.fn().mockResolvedValue(undefined),
});
vi.mock('@/db', () => ({
  db: {
    insert: (...args: unknown[]) => mockInsert(...args),
  },
}));

vi.mock('@/db/schema', () => ({
  contacts: Symbol('contacts-table'),
}));

// Mock next/headers. The action reads BOTH 'referer' and 'x-forwarded-for';
// the default implementation returns a referer-shaped value for everything,
// matching the original test expectations. Individual tests can override
// `mockHeadersGet.mockImplementation(...)` to return per-header values.
const mockHeadersGet = vi.fn();
vi.mock('next/headers', () => ({
  headers: vi.fn().mockResolvedValue({
    get: (...args: unknown[]) => mockHeadersGet(...args),
  }),
}));

describe('saveContact Server Action', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockHeadersGet.mockReturnValue('https://google.com/search?q=philip+sun');
    // Clear the contact rate-limiter store between tests — the singleton
    // persists across the file otherwise and 5 calls in would start failing.
    contactRateLimiter.reset();
  });

  it('inserts contact with all required fields', async () => {
    const { saveContact } = await import('@/app/actions/contact');

    const formData = new FormData();
    formData.set('name', 'Test User');
    formData.set('email', 'test@example.com');
    formData.set('subject', 'Test Subject');
    formData.set('message', 'Hello there');
    formData.set('utm_source', 'linkedin');
    formData.set('utm_medium', 'social');
    formData.set('utm_campaign', 'spring2026');

    const result = await saveContact({ success: false }, formData);

    expect(result.success).toBe(true);
    expect(mockInsert).toHaveBeenCalled();

    // Verify the values passed to insert include UTM fields (CRM-03)
    const valuesCall = mockInsert.mock.results[0]?.value.values;
    expect(valuesCall).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Test User',
        email: 'test@example.com',
        message: 'Hello there',
        utmSource: 'linkedin',
        utmMedium: 'social',
        utmCampaign: 'spring2026',
      })
    );
  });

  it('captures HTTP referer from headers (CRM-03)', async () => {
    const { saveContact } = await import('@/app/actions/contact');

    const formData = new FormData();
    formData.set('name', 'Test User');
    formData.set('email', 'test@example.com');
    formData.set('message', 'Hello there');

    await saveContact({ success: false }, formData);

    // Verify headers().get('referer') was called
    expect(mockHeadersGet).toHaveBeenCalledWith('referer');

    // Verify referrer value was passed to insert
    const valuesCall = mockInsert.mock.results[0]?.value.values;
    expect(valuesCall).toHaveBeenCalledWith(
      expect.objectContaining({
        referrer: 'https://google.com/search?q=philip+sun',
      })
    );
  });

  it('returns error when required fields are missing', async () => {
    const { saveContact } = await import('@/app/actions/contact');

    const formData = new FormData();
    formData.set('name', '');
    formData.set('email', '');
    formData.set('message', '');

    const result = await saveContact({ success: false }, formData);

    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
    expect(result.fieldErrors).toBeDefined();
    expect(mockInsert).not.toHaveBeenCalled();
  });

  // WR-04: email format
  it('WR-04: returns a field error on invalid email format', async () => {
    const { saveContact } = await import('@/app/actions/contact');

    const formData = new FormData();
    formData.set('name', 'Test User');
    formData.set('email', 'not-an-email');
    formData.set('message', 'Hello there');

    const result = await saveContact({ success: false }, formData);

    expect(result.success).toBe(false);
    expect(result.fieldErrors?.email?.[0]).toMatch(/valid email/i);
    expect(mockInsert).not.toHaveBeenCalled();
  });

  // WR-05: message length cap
  it('WR-05: returns a field error when the message exceeds 5000 chars', async () => {
    const { saveContact } = await import('@/app/actions/contact');

    const formData = new FormData();
    formData.set('name', 'Test User');
    formData.set('email', 'test@example.com');
    formData.set('message', 'a'.repeat(5001));

    const result = await saveContact({ success: false }, formData);

    expect(result.success).toBe(false);
    expect(result.fieldErrors?.message?.[0]).toMatch(/5000/);
    expect(mockInsert).not.toHaveBeenCalled();
  });

  // WR-06: UTM caps
  it('WR-06: rejects over-long UTM values', async () => {
    const { saveContact } = await import('@/app/actions/contact');

    const formData = new FormData();
    formData.set('name', 'Test User');
    formData.set('email', 'test@example.com');
    formData.set('message', 'Hello there');
    formData.set('utm_source', 'a'.repeat(201));

    const result = await saveContact({ success: false }, formData);

    expect(result.success).toBe(false);
    expect(result.fieldErrors?.utm_source?.[0]).toMatch(/200/);
    expect(mockInsert).not.toHaveBeenCalled();
  });

  // WR-01: truncate over-long referer rather than reject the submission
  it('WR-01: truncates a giant referer header before storing', async () => {
    const giant = 'https://example.com/' + 'a'.repeat(5000);
    mockHeadersGet.mockReturnValue(giant);

    const { saveContact } = await import('@/app/actions/contact');

    const formData = new FormData();
    formData.set('name', 'Test User');
    formData.set('email', 'test@example.com');
    formData.set('message', 'Hello there');

    const result = await saveContact({ success: false }, formData);

    expect(result.success).toBe(true);
    const valuesCall = mockInsert.mock.results[0]?.value.values;
    const passed = valuesCall.mock.calls[0]?.[0];
    expect(typeof passed.referrer).toBe('string');
    expect(passed.referrer.length).toBeLessThanOrEqual(2000);
  });

  // WR-03: even with hostile typing on the client, server validates before insert
  it('WR-03: returns errors instead of inserting when input shape is invalid', async () => {
    const { saveContact } = await import('@/app/actions/contact');

    const formData = new FormData();
    // Missing required `name` entirely
    formData.set('email', 'test@example.com');
    formData.set('message', 'Hello there');

    const result = await saveContact({ success: false }, formData);

    expect(result.success).toBe(false);
    expect(result.fieldErrors).toBeDefined();
    expect(mockInsert).not.toHaveBeenCalled();
  });

  // CRM #8: rate-limit denial short-circuits before Zod parse + DB insert.
  it('CRM-8: returns structured rate-limit error after the burst is exhausted', async () => {
    const { saveContact } = await import('@/app/actions/contact');

    // Make x-forwarded-for stable so all 6 attempts share one rate-limit bucket.
    mockHeadersGet.mockImplementation((name: string) => {
      if (name === 'x-forwarded-for') return '203.0.113.42';
      if (name === 'referer') return 'https://example.com/contact';
      return null;
    });

    const makeFormData = () => {
      const fd = new FormData();
      fd.set('name', 'Test User');
      fd.set('email', 'test@example.com');
      fd.set('message', 'Hello there');
      return fd;
    };

    // First 5 attempts succeed (burst budget).
    for (let i = 0; i < 5; i++) {
      const ok = await saveContact({ success: false }, makeFormData());
      expect(ok.success).toBe(true);
    }

    // 6th is denied — DB insert MUST NOT fire on this call.
    const insertCallsBefore = mockInsert.mock.calls.length;
    const denied = await saveContact({ success: false }, makeFormData());

    expect(denied.success).toBe(false);
    expect(denied.error).toMatch(/too many requests/i);
    expect(denied.fieldErrors).toEqual({});
    expect(mockInsert.mock.calls.length).toBe(insertCallsBefore);
  });

  // CRM #18: ContactFormFieldErrors is a mapped type over the schema — keys
  // line up with schema field names and validation errors still surface.
  it('CRM-18: mapped-type field errors are keyed by schema field names', async () => {
    const { saveContact } = await import('@/app/actions/contact');

    const formData = new FormData();
    formData.set('name', ''); // required → field error on `name`
    formData.set('email', 'not-an-email'); // → field error on `email`
    formData.set('message', ''); // required → field error on `message`

    const result = await saveContact({ success: false }, formData);

    expect(result.success).toBe(false);
    expect(result.fieldErrors).toBeDefined();
    expect(Array.isArray(result.fieldErrors?.name)).toBe(true);
    expect(Array.isArray(result.fieldErrors?.email)).toBe(true);
    expect(Array.isArray(result.fieldErrors?.message)).toBe(true);
    expect(result.fieldErrors?.email?.[0]).toMatch(/valid email/i);
  });
});

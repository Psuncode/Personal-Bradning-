import { describe, it, expect, vi, beforeEach } from 'vitest';

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

// Mock next/headers
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
});

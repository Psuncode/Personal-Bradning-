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
    expect(mockInsert).not.toHaveBeenCalled();
  });
});

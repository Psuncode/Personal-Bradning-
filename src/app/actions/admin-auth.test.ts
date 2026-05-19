import { describe, it, expect, vi, beforeEach } from 'vitest';

// ----- Mocks -----

const mockHeadersGet = vi.fn<(name: string) => string | null>();
vi.mock('next/headers', () => ({
  headers: vi.fn().mockResolvedValue({
    get: (name: string) => mockHeadersGet(name),
  }),
}));

const redirectMock = vi.fn((path: string) => {
  // Mirror next/navigation: redirect throws to abort rendering. Tests catch.
  throw new Error(`__REDIRECT__:${path}`);
});
vi.mock('next/navigation', () => ({
  redirect: (path: string) => redirectMock(path),
}));

const mockSession = {
  isLoggedIn: false as boolean,
  sessionVersion: undefined as string | undefined,
  save: vi.fn().mockResolvedValue(undefined),
  destroy: vi.fn(),
};
vi.mock('@/lib/session', async () => {
  const actual = await vi.importActual<typeof import('@/lib/session')>(
    '@/lib/session'
  );
  return {
    ...actual,
    getSession: vi.fn().mockImplementation(async () => mockSession),
  };
});

// Reset the rate limiter between tests via its exported singleton.
import { loginRateLimiter } from '@/lib/rate-limit';

describe('loginAction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    loginRateLimiter.reset();
    mockSession.isLoggedIn = false;
    mockSession.sessionVersion = undefined;
    mockHeadersGet.mockImplementation((name: string) =>
      name === 'x-forwarded-for' ? '203.0.113.10' : null
    );
    process.env.ADMIN_PASSWORD = 'correct-horse-battery-staple';
    process.env.SESSION_VERSION = '1';
  });

  it('rejects empty password with a friendly error (no crash)', async () => {
    const { loginAction } = await import('./admin-auth');
    const fd = new FormData();
    const result = await loginAction({}, fd);
    expect(result.error).toBe('Password is required.');
  });

  it('rejects non-string password (File payload) without crashing', async () => {
    const { loginAction } = await import('./admin-auth');
    const fd = new FormData();
    fd.set('password', new File(['hello'], 'x.txt', { type: 'text/plain' }));
    const result = await loginAction({}, fd);
    expect(result.error).toBe('Password is required.');
  });

  it('rejects an incorrect password without setting a session', async () => {
    const { loginAction } = await import('./admin-auth');
    const fd = new FormData();
    fd.set('password', 'definitely-wrong');
    const result = await loginAction({}, fd);
    expect(result.error).toBe('Invalid password.');
    expect(mockSession.save).not.toHaveBeenCalled();
  });

  it('rejects when submitted password is a prefix of the real one (length-safe)', async () => {
    const { loginAction } = await import('./admin-auth');
    const fd = new FormData();
    fd.set('password', 'correct'); // prefix of the real password
    const result = await loginAction({}, fd);
    expect(result.error).toBe('Invalid password.');
  });

  it('mints a session stamped with the current SESSION_VERSION on success', async () => {
    const { loginAction } = await import('./admin-auth');
    const fd = new FormData();
    fd.set('password', 'correct-horse-battery-staple');

    await expect(loginAction({}, fd)).rejects.toThrow(/__REDIRECT__:\/admin/);
    expect(mockSession.isLoggedIn).toBe(true);
    expect(mockSession.sessionVersion).toBe('1');
    expect(mockSession.save).toHaveBeenCalledTimes(1);
  });

  it('honors a bumped SESSION_VERSION on subsequent logins', async () => {
    process.env.SESSION_VERSION = '7';
    const { loginAction } = await import('./admin-auth');
    const fd = new FormData();
    fd.set('password', 'correct-horse-battery-staple');

    await expect(loginAction({}, fd)).rejects.toThrow(/__REDIRECT__:\/admin/);
    expect(mockSession.sessionVersion).toBe('7');
  });

  it('returns a config error when ADMIN_PASSWORD is missing', async () => {
    delete process.env.ADMIN_PASSWORD;
    const { loginAction } = await import('./admin-auth');
    const fd = new FormData();
    fd.set('password', 'anything');
    const result = await loginAction({}, fd);
    expect(result.error).toBe('Server configuration error.');
  });

  it('rate-limits a single IP after 5 failed attempts in the burst window', async () => {
    const { loginAction } = await import('./admin-auth');

    for (let i = 0; i < 5; i++) {
      const fd = new FormData();
      fd.set('password', `wrong-${i}`);
      const r = await loginAction({}, fd);
      expect(r.error).toBe('Invalid password.');
    }

    const fd = new FormData();
    fd.set('password', 'wrong-6');
    const sixth = await loginAction({}, fd);
    expect(sixth.error).toMatch(/Too many attempts/);
  });

  it('tracks rate limit per x-forwarded-for IP independently', async () => {
    const { loginAction } = await import('./admin-auth');

    // Burn ip A.
    mockHeadersGet.mockImplementation((name) =>
      name === 'x-forwarded-for' ? '1.1.1.1' : null
    );
    for (let i = 0; i < 5; i++) {
      const fd = new FormData();
      fd.set('password', 'wrong');
      await loginAction({}, fd);
    }
    const fdA = new FormData();
    fdA.set('password', 'wrong');
    expect((await loginAction({}, fdA)).error).toMatch(/Too many attempts/);

    // ip B has its own quota.
    mockHeadersGet.mockImplementation((name) =>
      name === 'x-forwarded-for' ? '2.2.2.2' : null
    );
    const fdB = new FormData();
    fdB.set('password', 'wrong');
    expect((await loginAction({}, fdB)).error).toBe('Invalid password.');
  });

  it('parses the left-most entry in a comma-separated x-forwarded-for chain', async () => {
    const { loginAction } = await import('./admin-auth');

    mockHeadersGet.mockImplementation((name) =>
      name === 'x-forwarded-for' ? '9.9.9.9, 10.0.0.1, 172.16.0.1' : null
    );
    for (let i = 0; i < 5; i++) {
      const fd = new FormData();
      fd.set('password', 'wrong');
      await loginAction({}, fd);
    }
    const fd = new FormData();
    fd.set('password', 'wrong');
    expect((await loginAction({}, fd)).error).toMatch(/Too many attempts/);

    // A different left-most IP — still in its quota.
    mockHeadersGet.mockImplementation((name) =>
      name === 'x-forwarded-for' ? '9.9.9.10, 10.0.0.1' : null
    );
    const fd2 = new FormData();
    fd2.set('password', 'wrong');
    expect((await loginAction({}, fd2)).error).toBe('Invalid password.');
  });
});

describe('logoutAction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSession.isLoggedIn = true;
    mockSession.sessionVersion = '1';
  });

  it('destroys the session and redirects to /admin/login', async () => {
    const { logoutAction } = await import('./admin-auth');
    await expect(logoutAction()).rejects.toThrow(/__REDIRECT__:\/admin\/login/);
    expect(mockSession.destroy).toHaveBeenCalled();
  });
});

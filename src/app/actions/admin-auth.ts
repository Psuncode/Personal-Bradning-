'use server';

import { timingSafeEqual } from 'node:crypto';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { z } from 'zod';

import { currentSessionVersion, getSession } from '@/lib/session';
import { loginRateLimiter } from '@/lib/rate-limit';

// Server Action CSRF is enforced by Next 16's encrypted action IDs (same-
// origin only). See Next docs — no manual CSRF token is required for the
// login form.

export type LoginFormState = {
  error?: string;
};

// Schema rejects non-string / empty submissions before we ever touch the
// password compare. Closes the WR-03 `as string` foot-gun for this action.
const LoginSchema = z.object({
  password: z.string().min(1).max(1024),
});

/**
 * Best-effort client key for rate-limiting. Uses the left-most entry in
 * x-forwarded-for (the original client IP per Vercel/most proxies). Falls
 * back to a generic key in environments where the header is missing —
 * better to throttle everyone collectively than to leave the action
 * unbounded.
 */
function getClientKey(forwardedFor: string | null): string {
  if (!forwardedFor) return 'unknown-client';
  const first = forwardedFor.split(',')[0]?.trim();
  return first && first.length > 0 ? first : 'unknown-client';
}

/** Constant-time password compare. Returns false on any length mismatch. */
function passwordsMatch(submitted: string, expected: string): boolean {
  const a = Buffer.from(submitted, 'utf8');
  const b = Buffer.from(expected, 'utf8');
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export async function loginAction(
  _prev: LoginFormState,
  formData: FormData
): Promise<LoginFormState> {
  // 1. Per-IP rate limit. 5 attempts per 15 min, then 1 per minute.
  //    In-memory Map — see src/lib/rate-limit.ts; upgrade to Vercel KV /
  //    Upstash when admin moves to production traffic.
  const hdrs = await headers();
  const clientKey = getClientKey(hdrs.get('x-forwarded-for'));
  const gate = loginRateLimiter.check(clientKey);
  if (!gate.allowed) {
    const seconds = Math.max(1, Math.ceil(gate.retryAfterMs / 1000));
    return {
      error: `Too many attempts. Try again in ${seconds}s.`,
    };
  }

  // 2. Input validation. Empty / non-string submissions short-circuit here.
  const parsed = LoginSchema.safeParse({
    password: formData.get('password'),
  });
  if (!parsed.success) {
    return { error: 'Password is required.' };
  }
  const { password } = parsed.data;

  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) {
    console.error('ADMIN_PASSWORD env var not set');
    return { error: 'Server configuration error.' };
  }

  // 3. Constant-time password comparison (CR-01).
  if (!passwordsMatch(password, adminPassword)) {
    return { error: 'Invalid password.' };
  }

  // 4. Mint a fresh session stamped with the current SESSION_VERSION (CR-03).
  const session = await getSession();
  session.isLoggedIn = true;
  session.sessionVersion = currentSessionVersion();
  await session.save();

  redirect('/admin');
}

export async function logoutAction(): Promise<void> {
  const session = await getSession();
  session.destroy();
  redirect('/admin/login');
}

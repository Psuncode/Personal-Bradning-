// src/lib/session.ts
import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';

export interface SessionData {
  isLoggedIn: boolean;
  // Stamped on every fresh login. Compared against env SESSION_VERSION
  // (default "1") on every session read — when the env var is bumped, every
  // previously-issued cookie becomes stale and the user is logged out on
  // their next request. Acts as a no-DB kill switch per 02-REVIEW.md CR-03.
  sessionVersion?: string;
}

export const sessionOptions = {
  password: process.env.SESSION_SECRET!,
  cookieName: 'admin_session',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax' as const,
    maxAge: 60 * 60 * 24 * 7, // 7 days
  },
};

/** The version every newly-minted session is stamped with. */
export function currentSessionVersion(): string {
  return process.env.SESSION_VERSION ?? '1';
}

/**
 * Returns true if the session cookie is fully valid:
 * - isLoggedIn === true
 * - sessionVersion matches the current SESSION_VERSION env var
 *
 * Use this everywhere instead of bare `session.isLoggedIn` so that bumping
 * SESSION_VERSION instantly revokes leaked or stolen cookies.
 */
export function isSessionValid(session: Pick<SessionData, 'isLoggedIn' | 'sessionVersion'>): boolean {
  return session.isLoggedIn === true && session.sessionVersion === currentSessionVersion();
}

export async function getSession() {
  const cookieStore = await cookies();
  return getIronSession<SessionData>(cookieStore, sessionOptions);
}

// src/lib/session.ts
import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { optionalEnv, requireBuildEnv } from './env';

export interface SessionData {
  isLoggedIn: boolean;
  // Stamped on every fresh login. Compared against env SESSION_VERSION
  // (default "1") on every session read — when the env var is bumped, every
  // previously-issued cookie becomes stale and the user is logged out on
  // their next request. Acts as a no-DB kill switch per 02-REVIEW.md CR-03.
  sessionVersion?: string;
}

/**
 * Resolve SESSION_SECRET once at module load and fail fast on misconfig.
 *
 * iron-session requires a password ≥32 chars to produce safely-sealed cookies;
 * shorter values silently weaken sealing strength. Routing presence through
 * `requireBuildEnv` (Wave 7a tiered env registry) centralizes the "missing
 * env var" error message so callers see the same actionable guidance
 * everywhere; the length check stays local because it's iron-session-specific.
 *
 * In test runs we skip the strict check — `proxy.test.ts` and friends stub
 * SESSION_SECRET dynamically via `vi.stubEnv` after this module has loaded and
 * also reassign `sessionOptions.password`, so a hard throw here would race
 * those setups. Closes 02-REVIEW.md WR-02.
 */
function resolveSessionSecret(): string {
  if (optionalEnv('NODE_ENV', 'development') === 'test') {
    return process.env.SESSION_SECRET ?? '';
  }
  const secret = requireBuildEnv('SESSION_SECRET');
  if (secret.length < 32) {
    throw new Error(
      'SESSION_SECRET environment variable must be set and at least 32 characters long'
    );
  }
  return secret;
}

export const sessionOptions = {
  password: resolveSessionSecret(),
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
  return optionalEnv('SESSION_VERSION', '1');
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

---
status: complete
phase: 02
phase_name: content-and-crm
files_reviewed:
  - next.config.ts
  - src/app/(main)/admin/LogoutButton.tsx
  - src/app/(main)/admin/login/page.tsx
  - src/app/(main)/admin/page.tsx
  - src/app/(photography)/layout.tsx
  - src/app/(photography)/photography/gallery/GalleryGrid.test.tsx
  - src/app/(photography)/photography/gallery/GalleryGrid.tsx
  - src/app/(photography)/photography/gallery/page.tsx
  - src/app/(photography)/photography/page.tsx
  - src/app/(photography)/photography/pricing/page.test.tsx
  - src/app/(photography)/photography/pricing/page.tsx
  - src/app/__tests__/proxy.test.ts
  - src/app/actions/admin-auth.ts
  - src/app/actions/contact.test.ts
  - src/app/actions/contact.ts
  - src/components/booking/BookingForm.test.tsx
  - src/components/booking/BookingForm.tsx
  - src/components/sections/contact-section.tsx
  - src/components/sections/hero.tsx
  - src/data/photography.ts
  - src/data/site-config.ts
  - src/db/index.ts
  - src/lib/session.ts
  - src/proxy.ts
depth: standard
findings_summary:
  critical: 4
  warning: 9
  info: 7
  total: 20
generated_at: 2026-05-19
---

# Phase 02 — Content & CRM Code Review

Scope: photography subdomain (gallery + pricing), contact-form Server Action (CRM-01), admin route with iron-session (CRM-02), UTM/referer capture (CRM-03). The phase touches auth, DB writes, form handling — the highest attack-surface code in the codebase so far.

The four Critical findings all live in the auth/contact attack surface and should be fixed before this branch ships to production behind a real `ADMIN_PASSWORD`.

---

## Critical findings

### CR-01 — Plain-text password comparison vulnerable to timing attack
**File:** `src/app/actions/admin-auth.ts:26`
**Severity:** Critical
**Issue:** The admin password check uses JavaScript `!==`, which short-circuits on the first byte difference. An attacker who can measure response timing can recover the password one character at a time. Server Actions over HTTP add network noise that makes this harder, but `loginAction` runs on a low-latency edge/serverless path, and there is no rate limiting (see CR-02), so an attacker can burn millions of probes.
**Impact:** Full admin compromise — once `admin_session` is sealed, the admin sees every contact submission (PII: name, email, message, referrer, UTM source).
**Fix:** Use a constant-time comparison and (better) hash the password at rest. Minimal patch:
```ts
import { timingSafeEqual } from 'node:crypto';
const a = Buffer.from(password);
const b = Buffer.from(adminPassword);
if (a.length !== b.length || !timingSafeEqual(a, b)) {
  return { error: 'Invalid password.' };
}
```
Longer-term: store a bcrypt/argon2 hash in `ADMIN_PASSWORD_HASH` and compare with the library's verify function. Same fix applies for rotating `SESSION_SECRET`.

### CR-02 — No rate limiting on `loginAction` enables brute force
**File:** `src/app/actions/admin-auth.ts:10-35`
**Severity:** Critical
**Issue:** `loginAction` accepts unlimited submissions per IP/session. Combined with CR-01 (no constant-time compare) and CR-04 (presence-only cookie check in the proxy), an attacker can run an offline-style brute force directly against the production endpoint.
**Impact:** Password-strength-bound time-to-compromise of the admin dashboard. Even with a strong password, a stuffing list will eventually try the literal password if it ever leaked elsewhere.
**Fix:** Add per-IP rate limiting in front of the action — Upstash Ratelimit, Vercel KV with a sliding window, or a `lastAttempt` cookie + exponential backoff. Minimum bar: lock to 5 attempts per IP per 15 min, log the 6th to `console.warn` and return a generic 429-equivalent.

### CR-03 — Admin page does not enforce any per-user authorization; cookie unsealing is the only gate
**File:** `src/app/(main)/admin/page.tsx:12-28`
**Severity:** Critical
**Issue:** `AdminPage` checks `session.isLoggedIn` and then unconditionally `SELECT * FROM contacts`/`bookings`. There is no notion of admin identity — anyone who can produce a valid iron-session cookie with `{isLoggedIn: true}` gets every row. Iron-session sealing makes that hard, but: (a) `SESSION_SECRET` rotation is not documented (see WR-02); (b) if `SESSION_SECRET` ever leaks into a public commit or build log, every minted cookie remains valid indefinitely — there is no revocation, no `sessionVersion`, no per-user check.
**Impact:** Full PII dump (name, email, message body, IP-proxy via referer, UTM source) and booking PII (name, email, deposit amount, Stripe PaymentIntent IDs). GDPR/CCPA-relevant data.
**Fix:** Two layers: (1) add a `sessionVersion` field to `SessionData`, store the expected version in `process.env.ADMIN_SESSION_VERSION`, and reject sessions whose version is stale — bumping the env var becomes the kill switch for all live sessions; (2) for the longer-term multi-admin case, attach a user id to the session and gate visibility through a `is_admin` flag in a `users` table. Also drop `SELECT *` in favor of explicit columns so future PII additions (phone, IP) don't auto-leak.

### CR-04 — Proxy admin guard accepts any non-empty cookie value
**File:** `src/proxy.ts:33-43`
**Severity:** Critical
**Issue:** The middleware-style proxy only checks `adminSession?.value` truthiness before passing `/admin` requests through. The proxy is edge-safe by design (it can't unseal the iron-session cookie there), and `AdminPage` does re-verify on the Node runtime — so this is **defense in depth** not the sole gate. But the test at `src/app/__tests__/proxy.test.ts:108-118` codifies "any string cookie value passes," which is misleading documentation of intent and will lull future readers (or AI agents) into trusting the proxy as auth. The risk: someone in a future phase routes `/admin/api/*` through the proxy and assumes the cookie has been validated.
**Impact:** Latent escalation path — turns into a real bypass the moment any admin-scoped API or RSC fetch is added without its own `session.isLoggedIn` check.
**Fix:** (a) Rename the comment from "Admin guard" to "Login-redirect optimization (full validation happens in the page)"; (b) require the cookie value to be at least a plausible iron-session length (~64+ chars of base64) so empty/garbage cookies still get redirected; (c) add a top-level rule in any future `/admin/api/*` handlers that calls `getSession()` first — do not let middleware imply authentication.

---

## Warning findings

### WR-01 — `referer` is captured into the DB unsanitized and trusted as analytics signal
**File:** `src/app/actions/contact.ts:25-27,37`
**Severity:** Warning
**Issue:** The HTTP `Referer` header is attacker-controlled (any client can set it to anything, including up to ~8 KB of arbitrary text or a credential-bearing URL from a previous tab). It is stored unbounded into `contacts.referrer` (text column, no length cap — see `src/db/schema.ts:21`).
**Impact:** (1) Storage abuse — a malicious bot can dump megabytes per submission. (2) PII spillover — referer can contain session tokens or query strings from upstream sites (e.g., reset links). (3) Admin page (`page.tsx:80`) renders `contact.referrer` inside a `<td>` with `truncate` but no URL validation — fine for XSS since React escapes text, but a future "click the referrer" link would be exploit-friendly.
**Fix:** Cap to ~512 chars and validate it parses as a URL before storing: `try { new URL(referer); } catch { referer = null; }`. Add a max-length check to all string fields in this action (name/email/subject/message) too; currently a single submission can store unlimited text.

### WR-02 — `SESSION_SECRET` enforced with non-null assertion and no minimum length check
**File:** `src/lib/session.ts:10`
**Severity:** Warning
**Issue:** `password: process.env.SESSION_SECRET!` will silently produce `password: undefined` if the env var is missing, then `iron-session` will throw at request time with a confusing message. iron-session also requires ≥32 chars; a short secret silently produces weak sealing.
**Impact:** Deploy-time misconfig surfaces as runtime 500s for users hitting any admin route. Worse, a 31-char secret may seal but with reduced strength.
**Fix:**
```ts
const secret = process.env.SESSION_SECRET;
if (!secret || secret.length < 32) {
  throw new Error('SESSION_SECRET must be set and ≥32 chars');
}
```
Run this once at module load, not on every request. Also document a rotation runbook (today: bump the env var, all existing cookies invalidate — fine because there's only one admin).

### WR-03 — `(formData.get('password') as string)` lies about the type
**File:** `src/app/actions/admin-auth.ts:14`, `src/app/actions/contact.ts:16-19,34-36`
**Severity:** Warning
**Issue:** `FormData.get()` returns `FormDataEntryValue | null` (string | File | null). The `as string` cast silently lets a `File` (e.g., from a crafted multipart submission) bypass the empty check on line 16 because `File` is truthy. Drizzle would then try to insert a `File` object into a text column, which throws an opaque error — caught by the generic catch on `contact.ts:40` and reported as "Something went wrong."
**Impact:** Type-safety hole that masks real bugs. Low exploitability today (the form renders text inputs only) but the cast pattern will get copy-pasted into Phase 03's booking form, where file uploads (signed contracts?) are plausible.
**Fix:** Use a tiny helper:
```ts
function getString(fd: FormData, key: string): string {
  const v = fd.get(key);
  return typeof v === 'string' ? v : '';
}
```
or validate with Zod — `z.object({name: z.string().min(1).max(200), email: z.string().email().max(254), ...}).parse(Object.fromEntries(formData))`. This also gives free email-format validation, which the action currently lacks (line 21 only checks emptiness).

### WR-04 — No email-format validation on contact submissions
**File:** `src/app/actions/contact.ts:21`
**Severity:** Warning
**Issue:** The required-field check is `if (!name || !email || !message)` — an `email` value of `"x"` or `"<script>"` passes the server-side check. The HTML `type="email"` on the client (`contact-section.tsx:164`) is bypassed by any non-browser caller.
**Impact:** Garbage rows in `contacts` table; can't reliably reply to senders; spam vector (a bot can submit "name=spam-msg-1, email=victim@x.com" to forward messages).
**Fix:** Add a regex or, better, Zod (see WR-03). Combine with WR-05 (length limits).

### WR-05 — Unbounded message length on contact form
**File:** `src/app/actions/contact.ts:19,29-38`; schema at `src/db/schema.ts:11-22`
**Severity:** Warning
**Issue:** `message` is a Postgres `text` column with no application-level cap. A 10 MB POST will be accepted (subject to Next.js body limit defaults).
**Impact:** Resource exhaustion (DB row size, admin page render time, network egress when admin loads the dashboard).
**Fix:** Cap to 5 000 chars in the action; add a `maxLength={5000}` to the textarea (`contact-section.tsx:188-194`) so the UX surfaces the limit. Same cap on `name` (200), `email` (254 RFC max), `subject` (200), `utm_*` (100 each).

### WR-06 — UTM hidden inputs render attacker-controlled URL params back into the DOM
**File:** `src/components/sections/contact-section.tsx:15-30,139-141`
**Severity:** Warning
**Issue:** `useState(() => new URLSearchParams(window.location.search))` reads `utm_*` and injects them as `value=` on hidden inputs. React escapes these, so this is **not** an XSS vector — but the value is round-tripped to the DB without any length or character check and ends up rendered in `AdminPage` (`page.tsx:79`). A crafted link `https://philipsun.com/contact?utm_source=<huge-string>` becomes a DB-bloat / admin-noise vector.
**Impact:** Same as WR-05 / WR-01 — storage abuse and admin-noise.
**Fix:** Cap UTM values on read: `params.get('utm_source')?.slice(0, 100) ?? ''`. Reject non-printable characters.

### WR-07 — `db.insert` proxy stringifies the schema-typed client into a Proxy and breaks Drizzle type narrowing
**File:** `src/db/index.ts:20-24`
**Severity:** Warning
**Issue:** The lazy-`db` is `new Proxy({} as DrizzleClient, ...)` — the cast lies about the runtime shape. The Proxy's `get` handler returns whatever `getDb()` exposes, but TS sees `DrizzleClient` even before initialization, so `db.transaction` etc. will type-check at edit time but fail at the boundary if `DATABASE_URL` is missing at request time (the `!` on line 14 will throw `TypeError: undefined is not a string`). There's no early-fail.
**Impact:** Misconfigured preview deploys present as opaque 500s. Also: the schema generic is lost through the Proxy — relational queries (`db.query.contacts.findMany()`) won't autocomplete. Phase 03's booking flow will hit this.
**Fix:** Either (a) drop the Proxy and accept a `getDb()` call site at every action, or (b) keep the Proxy but assert `DATABASE_URL` at module load:
```ts
if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is required');
```
Also re-export `db.query` explicitly through a getter so the schema-relational types survive.

### WR-08 — `BookingForm` and `pricing/page.tsx` still reference deprecated `byu-*` color classes
**File:** `src/components/booking/BookingForm.tsx:231,239,243,265,270,276,306,321,...`; `src/app/(photography)/photography/pricing/page.tsx:47`
**Severity:** Warning
**Issue:** Per `CLAUDE.md`, `byu-*` colors are deprecated and should be replaced with editorial tokens (`--color-ink`, `--color-accent`, etc.) when files are touched. Tailwind 4 with no `tailwind.config.ts` means `bg-byu-navy`/`text-byu-navy` resolve to nothing — these elements render with no background, no border tint, no text-color override.
**Impact:** Pricing page CTA button and the entire calendar widget render with broken styling (default browser button look on cream paper). Verified by absence of any `byu-*` definition in `globals.css`.
**Fix:** Replace every `byu-navy` → `[color:var(--color-ink)]`, `byu-blue`/`byu-sky` → `[color:var(--color-accent)]` / `[color:var(--color-rule)]`, `byu-dark-gray` → `[color:var(--color-ink-soft)]`. This is the Phase 02 scope's biggest visible bug — the photography pricing CTA is genuinely invisible-looking right now.

### WR-09 — Photography subdomain `<html>` element duplicates the root layout's `<html>`
**File:** `src/app/(photography)/layout.tsx:16-23`
**Severity:** Warning
**Issue:** Next 16 App Router emits `<html>` from the root layout. When a route-group layout also returns `<html><body>...`, Next will warn at runtime ("Multiple roots") if the photography routes are ever rendered without the subdomain rewrite (e.g., direct `/photography/gallery` hits, which happen for SEO crawls and the sitemap). Whether the rewrite happens or not, both layouts render their own `<html>`.
**Impact:** Hydration warnings in dev; potential duplicate `<head>` / metadata collisions; `suppressHydrationWarning` here is a band-aid.
**Fix:** Either drop the `<html>`/`<body>` wrappers from the photography layout (rely on the root layout) or set up a parallel root via Next 16's "default" pattern so only one root renders for the subdomain route group. Easier path: convert photography layout to a regular nested layout returning a `<div>`.

---

## Info findings

### IN-01 — `contact-section.tsx` server-side branch dead-codes UTM read
**File:** `src/components/sections/contact-section.tsx:15-30`
**Severity:** Info
**Issue:** The component is `'use client'`, so `typeof window === 'undefined'` is only briefly true during the first SSR pass. The empty-string fallback is then immediately overwritten on hydration — but because `useState(initializer)` only runs once on mount, the server pass actually serializes empty strings into the hidden inputs and the client never re-reads `window.location.search` after hydration. UTM capture works only because hydration discards the server HTML and the client effect runs the initializer fresh on mount. Subtle — confirm with a test that posts from a UTM-bearing URL.
**Impact:** Either it works (likely) or UTM never captures (silently). Worth a vitest test against `window.location.search` mock.
**Fix:** Move UTM read into a `useEffect` after mount, or accept it via a `searchParams` prop from a server component.

### IN-02 — `referer` header may be `null` in some Next 16 paths; current code is correct but undocumented
**File:** `src/app/actions/contact.ts:26`
**Severity:** Info
**Issue:** `referer` is correctly defaulted to `null` if missing. Good. Worth a comment that mentions iOS Safari and some privacy-mode browsers strip Referer entirely.
**Fix:** Add a one-line comment for future readers.

### IN-03 — `LogoutButton` server action runs on every render of admin page without CSRF token; relies on Next's built-in Server Action CSRF protection
**File:** `src/app/(main)/admin/LogoutButton.tsx`; `src/app/actions/admin-auth.ts:37-41`
**Severity:** Info
**Issue:** Next.js 16 Server Actions have origin/host CSRF protection built in (the encrypted action-id requires same-origin). Worth being explicit in a comment so future contributors don't add manual CSRF tokens redundantly — or worse, remove them.
**Fix:** Comment in `admin-auth.ts` referencing "Server Action CSRF is enforced by Next 16's encrypted action IDs — see Next docs."

### IN-04 — `siteConfig.email` and `siteConfig.links.email` are duplicative
**File:** `src/data/site-config.ts:8-13`
**Severity:** Info
**Issue:** `email` and `links.email` both encode the same address; the latter is `mailto:`-prefixed. Two sources of truth means the next email change will miss one.
**Fix:** Derive `links.email` from `email`: `email: \`mailto:\${email}\``. Or drop `links.email` and let consumers wrap.

### IN-05 — `proxy.ts` redirects with `from=` query param but `/admin/login` never reads it
**File:** `src/proxy.ts:39-41`; `src/app/(main)/admin/login/page.tsx`
**Severity:** Info
**Issue:** The proxy attaches `?from=<original path>` but the login page (and `loginAction` which hardcodes `redirect('/admin')`) never honors it. Dead parameter.
**Fix:** Either remove the parameter from the proxy, or thread it into `loginAction` as a hidden input and `redirect(formData.get('from') as string ?? '/admin')` with strict same-origin path validation.

### IN-06 — `GalleryGrid` filter does not preserve URL state; deep links to `?category=portrait` not supported
**File:** `src/app/(photography)/photography/gallery/GalleryGrid.tsx:9-17`
**Severity:** Info
**Issue:** Filter state is component-local. Sharing a portrait-only gallery view is impossible. Minor SEO miss: no per-category indexable URL.
**Fix:** Use `useSearchParams` + `useRouter().push(?category=portrait, {scroll: false})`. Or split into `/photography/gallery/[category]/page.tsx` for SEO.

### IN-07 — Admin dashboard renders `contact.referrer` and `contact.email` without copy/click utilities
**File:** `src/app/(main)/admin/page.tsx:77-80`
**Severity:** Info
**Issue:** Pure UX. The admin will want to click-to-mailto on `contact.email` and probably copy the message body. Today it's read-only text in a `truncate` cell.
**Fix:** Wrap email in `<a href={\`mailto:\${contact.email}\`}>`. Optional: an expandable row for the full message.

---

## Summary

Phase 02 ships the right surface area but the auth path needs hardening before this branch goes near a real admin password. The four Critical items (timing-safe compare, rate limit, session-version kill switch, proxy-cookie semantics doc) are the gating fixes. The Warning cluster around input validation (WR-01, WR-03, WR-04, WR-05, WR-06) all point at the same missing abstraction: **a Zod schema layer for every Server Action**. Adopting one would close five findings at once and pay dividends in Phase 03's booking action.

The `byu-*` color regression (WR-08) is the most user-visible bug — the photography pricing CTA renders with no styling on cream paper.

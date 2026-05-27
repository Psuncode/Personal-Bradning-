# Vercel Deployment Readiness Review

**Branch:** `feat/blog-system-v2`
**Scope:** `next.config.ts`, `package.json` (scripts, engines), `.vercel/project.json`, env-var documentation, ISR/SSG config, edge runtime usage, image optimization, security headers.
**Skill applied:** `.agents/skills/deploy-to-vercel/SKILL.md` (v3.0.0, vercel)
**Trigger:** preview build was failing on missing `SESSION_SECRET` (just fixed). Reviewing for similar latent failure modes before more preview deploys go red.

---

## TL;DR

The project is **already in the skill's "best long-term state"**: `.vercel/project.json` is present (`orgId=team_rDsVFP3YZGCFah52s08efBls`, `projectName=web`), a git remote exists, and CI runs `lint + vitest + next build` on every PR. Future deploys should go through `git push` (option 1 in the skill), not a CLI `vercel deploy`.

The recently-fixed `SESSION_SECRET` blow-up is symptomatic of a broader gap: **the project mixes two valid env-var patterns (lazy-singleton vs fail-fast)** without being explicit about which env vars are required to *build* vs only required to *serve a runtime request*. Documentation and Vercel's project settings should be reconciled with the actual code patterns so preview builds stop tripping on this.

No source edits were made. Issues are prioritized below.

---

## 1. Build-time vs runtime env-var pattern audit

This is the single most important section, because it's the root cause of the `SESSION_SECRET` regression.

The project has three patterns in flight today. They are individually fine, but the inconsistency is the bug surface.

### Pattern A — fail-fast at module load (build-breaker)

- `src/lib/session.ts:28-39` — `resolveSessionSecret()` runs at module import. Throws if `SESSION_SECRET` is missing or `< 32` chars, **except** when `NODE_ENV === 'test'`.
- Because `next build` imports every server module that's reachable from any route (to type-check, tree-shake, and prerender), this throws during `next build` itself if `SESSION_SECRET` is unset in the build env. This is exactly the failure the user just fixed.

### Pattern B — lazy singleton with `process.env.X!` at first use (runtime-only)

- `src/lib/stripe.ts:13-21` — `_stripe` constructed only on first `getStripe()` call.
- `src/lib/email.ts:9-14` — same for Resend.
- `src/db/index.ts:12-29` — `getDb()` with an actionable error string instead of a bare bang.

These do **not** break `next build`. They only blow up on first request to the route that needs them. Good for build-time, but means a misconfigured prod env produces a 500 on the first booking attempt rather than a deploy failure.

### Pattern C — optional with sensible defaults

- `src/proxy.ts:71` — `NEXT_PUBLIC_DOMAIN ?? "philipsun.com"`
- `src/lib/session.ts:54` — `SESSION_VERSION ?? '1'`
- `src/app/(main)/api/checkout/route.ts:131` — `NEXT_PUBLIC_PHOTOGRAPHY_URL || 'http://localhost:3000'` (this default is **wrong in production** — see issue 4.3 below)

### Recommendation

Decide explicitly, per env var, which pattern applies, and document it. The fix that just landed for `SESSION_SECRET` is a one-off; the same class of failure could re-occur with `STRIPE_WEBHOOK_SECRET`, `ADMIN_PASSWORD`, etc., if any of those ever migrate to pattern A.

A practical rubric:

| Env var | Current pattern | Required at build? | Required at runtime? | Recommendation |
|---|---|---|---|---|
| `SESSION_SECRET` | A (fail-fast) | **Yes (today)** | Yes | Either keep A and ensure it's set in **every Vercel env (Preview + Production)**, OR switch to lazy and only validate inside `getSession()`. The middleware (`src/proxy.ts`) already needs it at edge runtime per request, so lazy is feasible. |
| `ADMIN_PASSWORD` | B (read inline at action) | No | Only on admin login | Fine as-is. Document. |
| `DATABASE_URL` | B (lazy + good error) | No | Yes for DB queries | Fine. |
| `DATABASE_URL_UNPOOLED` | B (drizzle-kit only) | No | No (migrations only) | Fine. Document that it never needs to be in Vercel runtime env. |
| `STRIPE_SECRET_KEY` | B (lazy `!`) | No | Yes for checkout/webhook | Fine, but the `!` will surface as opaque "Invalid API Key" if missing — consider adding the same actionable-error wrapper as `db/index.ts`. |
| `STRIPE_WEBHOOK_SECRET` | B (inline `!`) | No | Yes for webhook | Same: add a clearer error. |
| `RESEND_API_KEY` | B (lazy `!`) | No | Yes for email | Same: clearer error. |
| `BOOKING_NOTIFICATION_EMAIL` | C (optional, falls back to `siteConfig.email`) | No | No | Fine. |
| `NEXT_PUBLIC_DOMAIN` | C (default) | No | Yes for proxy routing | Fine. |
| `NEXT_PUBLIC_PHOTOGRAPHY_URL` | C (default) | **Should be yes for prod** | Yes | See issue 4.3 — the localhost default is a footgun in production. |
| `SESSION_VERSION` | C (default `'1'`) | No | Yes (kill switch) | Fine. |
| `ICAL_USERNAME` / `ICAL_PASSWORD` / `ICAL_SERVER` / `ICAL_CALENDAR_ID` | B (read at call site) | No | Yes for `/api/calendar` | Fine, but **not documented in `.env.local.example`** — issue 2.1. |
| `BLOB_READ_WRITE_TOKEN` | (Vercel-managed, used by Vercel Blob SDK implicitly) | No | Only if uploading | Auto-injected by Vercel integration. Document. |

---

## 2. Env-var documentation completeness

### 2.1 — `.env.local.example` is missing several documented vars (major)

`.env.local.example` declares: `DATABASE_URL`, `DATABASE_URL_UNPOOLED`, `NEXT_PUBLIC_DOMAIN`, `ADMIN_PASSWORD`, `SESSION_SECRET`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `NEXT_PUBLIC_PHOTOGRAPHY_URL`, `RESEND_API_KEY`.

But the codebase also reads:

- `SESSION_VERSION` (`src/lib/session.ts:54`) — the kill-switch documented in security review CR-03. **Not in `.env.local.example`.**
- `BOOKING_NOTIFICATION_EMAIL` (`src/lib/email.ts:62`, `:180`) — operator-rotatable notification address. **Not in `.env.local.example`.**
- `ICAL_USERNAME`, `ICAL_PASSWORD`, `ICAL_SERVER`, `ICAL_CALENDAR_ID` (`src/lib/serverCalendar.ts:44-47`) — required for the `/api/calendar` route to return real availability instead of empty events. **Not in `.env.local.example`.** Without these, the booking flow on a fresh Vercel preview shows fake availability.
- `BLOB_READ_WRITE_TOKEN` (present in committed-but-gitignored `.env.local`) — Vercel-managed for Vercel Blob. Worth a comment-line so future devs know it's auto-injected.
- `VERCEL_OIDC_TOKEN` (present in `.env.local`) — auto-injected by Vercel locally for OIDC-authenticated SDK calls. No source code reads it directly; harmless. No action needed.

### 2.2 — Local `.env.local` does **not** have everything the app needs (info)

`.env.local` on disk has only `BLOB_READ_WRITE_TOKEN`, `DATABASE_URL`, `DATABASE_URL_UNPOOLED`, `VERCEL_OIDC_TOKEN`. Missing locally: `SESSION_SECRET`, `ADMIN_PASSWORD`, `STRIPE_*`, `RESEND_API_KEY`, `NEXT_PUBLIC_DOMAIN`, `NEXT_PUBLIC_PHOTOGRAPHY_URL`, `ICAL_*`, `BOOKING_NOTIFICATION_EMAIL`, `SESSION_VERSION`.

This means `npm run dev` from this checkout **cannot complete an admin login, a Stripe checkout, a webhook signature verify, an email send, or a real calendar lookup**. That's expected (those are secrets), but worth flagging if anyone tries to repro a Vercel build locally.

### 2.3 — Recommendation: add an explicit Vercel-env checklist (minor)

Add a `docs/operations/VERCEL_ENV.md` (or expand `.env.local.example` comments) that lists each var with three columns: *required in Preview env? required in Production env? auto-injected by integration?* This prevents the next regression from missing-var-in-preview.

---

## 3. `next.config.ts` review

### 3.1 — Image `remotePatterns` is narrow but plausibly incomplete (minor)

Currently allows:
- `**.public.blob.vercel-storage.com/**` — Vercel Blob CDN
- `images.unsplash.com/**`

Audit of `<Image src=…>` calls under `src/` finds:
- All blog cover/MDX images go through `resolveBlogAsset()` → `/public/_blog-assets/…` (local, no remote pattern needed).
- All photography gallery items currently use `/photography/*.svg` placeholders.
- `src/data/photography.ts:7` comment says `// Full Vercel Blob URL` — once real photos land they will use the configured Vercel Blob host, so this is correct.

**No action required today.** But once any third-party CDN (e.g., a CMS, S3) is added, the pattern list must be extended *before* the image lands, or `next/image` will 400.

### 3.2 — Security headers (good)

`headers()` applies four sensible defaults (`X-Frame-Options: SAMEORIGIN`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy: camera=(), microphone=(), geolocation=()`) to every route.

Gaps to consider when the booking flow goes live:
- **No `Strict-Transport-Security`.** Vercel serves the HSTS header on the apex domain automatically when a custom domain is attached, but adding `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload` here makes the policy explicit and survives a Vercel-side default change.
- **No `Content-Security-Policy`.** The Stripe Checkout redirect avoids inline-script CSP concerns, but Cal.com's embed (`@calcom/embed-react`) on `/meet` will need a `frame-src https://cal.com` allowance once you add a CSP. Document this in a follow-up rather than blocking deploy.
- **`X-Frame-Options: SAMEORIGIN` blocks Cal.com from iframing your pages** — but the relationship is reversed (you iframe Cal.com), so this is fine.

No change required for current scope.

### 3.3 — Missing Next 16 config knobs to consider (info)

Nothing missing is *breaking*, but worth knowing:
- No explicit `output: 'standalone'` — fine on Vercel (they handle it).
- No `experimental.serverActions` config — Server Actions are stable in 16; default is fine.
- No `serverExternalPackages` for `@neondatabase/serverless` — not required because it's ESM-safe, but if you ever see Next trying to bundle it for edge runtime, add it here.

---

## 4. ISR / SSG / edge runtime configuration

### 4.1 — Runtime declarations are correct (good)

- `src/app/(main)/og/route.tsx` → `runtime = "edge"` ✓ (pure `ImageResponse`, no fs reads)
- `src/app/(main)/blog/[slug]/og/route.tsx` → `runtime = "nodejs"` ✓ (needs `getPostBySlug` which reads `content/blog/` filesystem at request time)
- `src/app/(main)/feed.xml/route.ts` → `dynamic = "force-static"` ✓ (RSS doesn't need per-request data)
- The proxy at `src/proxy.ts` runs at the Next.js edge per request — uses `unsealData` from `iron-session` which is edge-safe (no Node built-ins).

### 4.2 — `generateStaticParams` is wired everywhere it should be (good)

- `/projects/[slug]` — static params from `projects.ts`
- `/blog/[slug]` — static params from `getAllPosts()`
- `/blog/tag/[tag]` — static params from union of tags

These all prerender at build, so the only thing the runtime needs is the per-post OG card (nodejs) and the calendar/checkout/webhook routes. Good.

### 4.3 — `NEXT_PUBLIC_PHOTOGRAPHY_URL` default is dangerous in production (major)

`src/app/(main)/api/checkout/route.ts:131`:
```ts
const baseUrl = process.env.NEXT_PUBLIC_PHOTOGRAPHY_URL || 'http://localhost:3000';
```

If this env var is missing in a Vercel preview or production deploy, **Stripe will redirect successful payments to `http://localhost:3000/...`**. That's a real money-on-the-table footgun. Two safer alternatives:

1. **Fail fast** at module load (Pattern A) so the build/deploy explicitly catches it.
2. **Fall back to `VERCEL_URL`** (Vercel auto-injects this on every deploy: `https://<deployment-hash>.vercel.app`) when in a Vercel env, and only fall back to `localhost` in genuine local dev (`process.env.VERCEL ? \`https://\${process.env.VERCEL_URL}\` : 'http://localhost:3000'`). Note that `VERCEL_URL` doesn't include `https://`.

Recommended: option 1 for production, since wrong-host redirects on Stripe success are a worse-than-500 failure mode (silent revenue loss).

### 4.4 — Webhook route should pin runtime (minor)

`src/app/(main)/api/webhooks/stripe/route.ts` does not declare `runtime`, so it gets Next's default (nodejs in Next 16). That's correct because `stripe.webhooks.constructEvent` needs Node's crypto.

But it relies on the raw request body via `request.text()` — which is fine in Next 16 App Router, but worth a one-line comment that **edge runtime would break signature verification** so a future "let's edge-ify everything" refactor doesn't silently break.

Also no `maxDuration` declared. Stripe expects webhook responses within 30s; Vercel's default function timeout on Hobby is 10s and Pro 60s. For a webhook that issues two Resend emails and several DB writes, consider `export const maxDuration = 30` to be safe across plans.

### 4.5 — Calendar route should pin runtime (minor)

`src/app/(main)/api/calendar/route.ts` uses `tsdav` to hit iCloud CalDAV. `tsdav` depends on Node-native APIs (XML parsing, etc.) — should not run on edge. Same recommendation: add `export const runtime = "nodejs"` for explicitness, and `maxDuration = 15` for safety, since CalDAV round-trips can be slow.

---

## 5. `.vercel/project.json` and linking

```json
{
  "projectId": "prj_rdyRbln8ddsxYpGUe60wlUwjazkE",
  "orgId": "team_rDsVFP3YZGCFah52s08efBls",
  "projectName": "web"
}
```

- File is in `.gitignore` (correctly) — checked.
- Project name is `web`, which differs from the package.json name (`philip-sun-website`). Harmless, but worth knowing for `vercel ls` lookups.
- `orgId` is a team, so future CLI calls from this directory should `--scope team_rDsVFP3YZGCFah52s08efBls` (or let `.vercel/project.json` pick it up automatically).

The skill explicitly says: with a linked project + git remote, **always prefer `git push` over `vercel deploy`** for preview deploys. The CI workflow doesn't deploy from CI (it only verifies), so Vercel's git integration handles preview builds on push. Correct setup.

`DEPLOY_TO_VERCEL.sh` at repo root is a stale bootstrap script from the initial setup — it runs `gh repo create` and prints manual Vercel-dashboard instructions. Now that linking is done, **the file can be deleted** (or moved to `docs/operations/`). Not a deploy blocker.

---

## 6. Build pipeline

### 6.1 — `prebuild` hook (good)

`package.json` runs `tsx scripts/build-blog-assets.ts` before every `next build` and `next dev` start. This populates `public/_blog-assets/<slug>/` and generates `__blur.json` LQIP placeholders. The output dir is gitignored — only the source images under `content/blog/<slug>/` are in git.

Important consequence: **Vercel must run `npm run build`, not `npx next build`** (the default Vercel Next.js detection does the former, so this is fine — but if a future Vercel config override is added, this must be preserved).

### 6.2 — Node version pinning is missing (minor)

`package.json` has **no `engines` field**. Vercel will default to its current Node version (currently 22). The CI workflow uses `node 20`. This drift is not currently breaking anything, but it means:
- A native module that ships prebuilt binaries (`sharp`, `@neondatabase/serverless`) could behave differently between local-CI (Node 20) and Vercel (Node 22).
- Adding `"engines": { "node": ">=20.0.0 <23.0.0" }` (or whatever matches CI) makes the contract explicit.

Recommendation: pin to whatever Vercel's current LTS default is and match CI to it.

### 6.3 — CI excludes "carve-out" tests (known)

The CI workflow's vitest step excludes `home/about/case-studies/current-focus.test.tsx` per the CLAUDE.md known-carve-outs. This is correct and documented. Worth knowing that Vercel's build does **not** run vitest at all — only `next build`. So a failing test that CI catches won't block a Vercel deploy. The build itself remains the deploy gate.

---

## 7. Issues summary (prioritized)

### Critical
- None blocking immediate deploy (the `SESSION_SECRET` fix already shipped).

### Major
1. **`NEXT_PUBLIC_PHOTOGRAPHY_URL` localhost fallback in production** — silent Stripe redirect to localhost on missing env var. (§4.3)
2. **`.env.local.example` missing `SESSION_VERSION`, `BOOKING_NOTIFICATION_EMAIL`, `ICAL_*`** — undocumented required vars become Vercel-config drift. (§2.1)
3. **Mixed build-time vs runtime env-var validation patterns are not documented** — the `SESSION_SECRET` failure will reoccur with the next var that adopts Pattern A unless explicitly mapped. (§1)

### Minor
4. **No `runtime` / `maxDuration` declarations on `/api/webhooks/stripe` and `/api/calendar`** — relies on Next defaults; should be explicit. (§4.4, §4.5)
5. **No `engines` field in `package.json`** — Node version drift between CI (20) and Vercel (22). (§6.2)
6. **Stripe / Resend `process.env.X!` bangs** — produce opaque errors when missing; `db/index.ts` has the right shape to copy. (§1)
7. **Stale `DEPLOY_TO_VERCEL.sh`** — pre-link bootstrap script that's no longer relevant. (§5)

### Suggestions
8. Add `Strict-Transport-Security` header to `next.config.ts` for explicitness. (§3.2)
9. Plan a CSP rollout (Cal.com `frame-src`, Stripe checkout redirect, Vercel Blob `img-src`) before the first paid traffic. (§3.2)
10. Document Vercel-managed env vars (`BLOB_READ_WRITE_TOKEN`, `VERCEL_OIDC_TOKEN`, `VERCEL_URL`) in a new `docs/operations/VERCEL_ENV.md`. (§2.3)

---

## 8. Deploy readiness verdict

**Ready to deploy via `git push`** (skill's preferred path: linked + git remote → option 1). The just-shipped `SESSION_SECRET` fix unblocks preview builds. The major items above are not blockers for getting a preview URL — but item 4.3 (`NEXT_PUBLIC_PHOTOGRAPHY_URL` localhost fallback) is a blocker for **production traffic** on the photography subdomain, since paying customers would be redirected to localhost on success. Address before flipping production DNS for `photography.philipsun.com`.

For the next preview deploy:
1. Verify the Vercel project has `SESSION_SECRET` set on **both Preview and Production** environments (not just Production).
2. Verify `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET` / `RESEND_API_KEY` are set on Preview if the booking flow needs to be exercised against test-mode Stripe.
3. Verify `ICAL_*` are set on Preview if `/meet` availability needs to render real data.

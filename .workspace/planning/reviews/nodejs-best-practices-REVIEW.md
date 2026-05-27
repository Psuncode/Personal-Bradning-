# Node.js Best Practices Review — philip-sun-website

**Date:** 2026-05-19
**Scope:** `package.json`, `tsconfig.json`, `next.config.ts`, `scripts/build-blog-assets.ts`, top-level config (`vercel.json`, `eslint.config.mjs`, `vitest.config.ts`, `drizzle.config.ts`, `postcss.config.mjs`)
**Lens:** `.agents/skills/nodejs-best-practices/SKILL.md`
**Runtime in use:** Node v22.22.0 (local). No pin in repo.

---

## TL;DR

The project is a modern Next.js 16 + React 19 app on a sensible ESM/TypeScript foundation. The biggest concerns are **dependency hygiene** (23 `npm audit` vulnerabilities — 10 moderate / 13 high), **no engines field or Node version pin**, and **a couple of stale direct dependencies that block the audit fixes** (most notably `drizzle-kit@0.31.x` pulling in legacy `@esbuild-kit/*` and `next@16.1.6` shipping vulnerable `postcss`). The build-blog-assets script also uses sync `fs` APIs and a `rmSync` step that wipes assets before regenerating — fine for a prebuild, but worth flagging.

Severity legend: **CRITICAL** (security/data-loss) · **HIGH** (likely to bite soon) · **MEDIUM** (correctness/maintainability) · **LOW** (style/polish).

---

## 1. Dependency hygiene & audit findings

### npm audit summary (23 vulns: 10 moderate, 13 high; 0 critical)

| Severity | Package | Direct? | Why it's here | Fix |
|---|---|---|---|---|
| **HIGH** | `next` `<16.2.6` (postcss XSS via unescaped `</style>`, GHSA-qx2v-qp2m-jg93) | yes | `next: "16.1.6"` exact | Bump to `next@16.2.6` (non-major; `eslint-config-next` follows) |
| **HIGH** | `drizzle-orm` `<0.45.2` | yes | `^0.45.1` (caret won't reach because patch is already 0.45.2; cache stale) | Re-install / bump to `^0.45.2` |
| **MOD** | `drizzle-kit` `0.31.10` → vulnerable `@esbuild-kit/{core-utils,esm-loader}` → `esbuild <=0.24.2` | yes | drizzle-kit 0.31.x is on the deprecated `@esbuild-kit` chain | `drizzle-kit@0.18.1`(!) is what audit suggests but that's a regression — instead bump to the latest `drizzle-kit` line that uses `tsx`/modern esbuild (≥ 0.32). Verify against `drizzle-orm` peer. |
| **MOD** | `ws` `8.0.0 – 8.20.0` (uninitialized memory disclosure, GHSA-58qx-3vcg-4xpx) | yes | `"ws": "^8.20.0"` in devDeps (used by tsdav/jsdom) | Bump to `^8.20.1`. Also: see §6 — `ws` should arguably not be a direct dependency. |
| **HIGH** | `@hono/node-server`, `hono`, `path-to-regexp`, `express-rate-limit`, `fast-uri`, `flatted`, `picomatch`, `minimatch`, `rollup`, `undici`, `vite` | transitive | Pulled in via `vitest`/`@vitest/ui`/`@vercel/*`/`shadcn` toolchain | `npm audit fix` resolves all (no major bumps required) |
| **MOD** | `ajv`, `brace-expansion`, `ip-address`, `postcss`, `yaml` | transitive | Same as above | `npm audit fix` |

**Recommended remediation order (non-breaking first):**

1. `npm install` to pick up `drizzle-orm@0.45.2`, `ws@8.20.1`, etc. (caret-compatible).
2. `npm install next@16.2.6 eslint-config-next@16.2.6` — sweeps the postcss XSS and is a patch bump within the 16.x line.
3. `npm audit fix` for the transitive cluster (vitest/rollup/vite/undici).
4. Major bump for `drizzle-kit` (separate PR; verify migration generation still works). Don't accept the audit's "downgrade to 0.18.1" suggestion — that's not really a fix.

### Outdated but **not** vulnerable (consider tracking)

- `@vercel/analytics 1.6.1 → 2.0.1` (major).
- `react-day-picker 9.13.2 → 10.0.1` (major, check API).
- `stripe 20.4.1 → 22.1.1` (two majors behind; matters when you actually wire Stripe).
- `lucide-react 0.574 → 1.16` (zero-major scheme done; check tree-shaking).
- `shadcn 3.8.5 → 4.7.0` (devDep, manual).
- `typescript 5.9.3 → 6.0.3` (major; do separately).
- `eslint 9.39.4 → 10.4.0` (major; will likely need a config tweak).
- `jsdom 28 → 29`, `@vitejs/plugin-react 5 → 6`, `@vercel/analytics`, `lucide-react`, `react-day-picker` — track but not urgent.

Routine recommendation: add `npm outdated` + `npm audit --production` to a weekly task or Dependabot/Renovate. Right now neither is configured.

---

## 2. Engines field & Node version pin — **MISSING**

`package.json` has **no `engines`** field, and the repo has **no `.nvmrc` / `.node-version`**. Vercel will silently pick its default; teammates have no signal.

**Action:** add an `engines` field matching what `next@16` supports (Node ≥ 20.9 / ≥ 22 LTS preferred):

```json
"engines": { "node": ">=22.0.0 <23" }
```

…plus a `.nvmrc` file (`22`). The skill calls this out under "deployment target" as a first-class decision.

---

## 3. npm scripts

Current:

```json
"dev": "next dev",
"prebuild": "tsx scripts/build-blog-assets.ts",
"build": "next build",
"start": "next start",
"lint": "eslint",
"test": "vitest"
```

Notes:

- **GOOD**: `prebuild` hook is the canonical npm lifecycle event — clean.
- **MEDIUM**: `dev` does **not** run the blog-asset pipeline, but `CLAUDE.md` claims it does ("runs before every `next build` and `next dev` start"). The `predev` hook is missing. Either add `"predev": "tsx scripts/build-blog-assets.ts"` or correct the docs. Right now a fresh checkout running `npm run dev` ships without blur placeholders / `_blog-assets/`.
- **LOW**: No `"typecheck": "tsc --noEmit"` script. CI doesn't gate types except through Next's build; a separate `typecheck` would catch the carve-out test errors early.
- **LOW**: `lint` invokes `eslint` with no path; relies on ESLint flat-config defaults to find files. Fine, but `eslint .` is more explicit.
- **LOW**: No `format` script (Prettier isn't in the repo). Out of scope, just noting.

---

## 4. Semver discipline (deps vs devDeps placement)

### Likely **misplaced** packages

| Package | Currently | Should be | Why |
|---|---|---|---|
| `@testing-library/dom` | `dependencies` | `devDependencies` | Test-only library; never imported at runtime. |
| `ws` | `devDependencies` | (probably none) | Not imported anywhere in `src/`. If it's a transitive helper for `tsdav`, it should be removed entirely and let `tsdav` resolve its own. Direct dep adds a CVE attack surface (§1) for no app code. |

### Semver style

- `next` and `react`/`react-dom` are **pinned exact** (`16.1.6`, `19.2.3`). That's intentional and reasonable for framework alignment, but it means you must bump them manually for security patches — exactly what's biting you with the postcss XSS now.
- Most other deps use `^` — standard.
- `eslint-config-next: "16.1.6"` is also pinned exact and should track `next` in lockstep.

**Recommendation:** keep `next` pinned but add a Renovate/Dependabot rule to PR Next patch releases automatically. Otherwise this same audit finding will recur every release cycle.

### peerDependency concerns

None directly declared. The Drizzle ecosystem has a `drizzle-orm ↔ drizzle-kit` peer relationship that you're satisfying loosely; when you bump `drizzle-kit`, check the peer range.

---

## 5. ESM vs CJS consistency

- `package.json` has **no `"type": "module"`**, so the project is implicitly **CommonJS** at the runtime contract level.
- But: `next.config.ts`, `eslint.config.mjs`, `postcss.config.mjs`, `vitest.config.ts`, `drizzle.config.ts`, and `scripts/build-blog-assets.ts` are all written as **ESM** (`import` syntax). Next + tsx + Vitest each handle this transparently, so it works — but the package is in a quasi-state.

**Recommendation:** since 100% of source is ESM-style and the runtime is Node 22 + Next 16, set `"type": "module"` explicitly. Test the prebuild and any leftover `.js` configs after the flip. This makes the intent legible per the skill's §2 "Module System Decision."

If you'd rather not flip it, at least normalize: leaving it implicit means every `.ts` config relies on bundler-resolution heuristics, which has bitten projects on Node 22 upgrades.

---

## 6. `scripts/build-blog-assets.ts` review

Strengths:

- Single-purpose, well-scoped, idempotent.
- Skips dotfiles and `_` prefixes; copies non-MDX only; co-locates blur JSON.
- Documented in CLAUDE.md + AUTHORING.md.

Concerns (skill §5 "Avoiding event-loop blocking"):

- **MEDIUM** — All file I/O is **synchronous** (`fs.rmSync`, `readdirSync`, `readFileSync`, `copyFileSync`, `writeFileSync`). The skill calls out "Never use sync methods in production." This is a build script, not a request handler, so the rule bends — but with 30+ blog posts each containing several images, switching to `fs/promises` + `Promise.all` per post would parallelize blur generation (plaiceholder is the slow part) and meaningfully shorten `prebuild`.
- **MEDIUM** — `fs.rmSync(outRoot, { recursive: true, force: true })` wipes `public/_blog-assets/` unconditionally on every dev start / build. That's fine because the dir is gitignored, but during long incremental dev loops you re-pay the blur-generation cost on every restart. Consider a content-hash cache (`__blur.json` keyed by file mtime/sha) — there's an old commit (`9b6b7b0 fix(blog-v2): bypass blur cache outside production`) hinting this was already a friction point.
- **LOW** — No input validation on `entry.name`. Path-traversal isn't a real risk here (input is local FS), but using `path.resolve` + a check that the resolved path stays under `blogDir` would defend against symlink shenanigans if the content dir ever becomes user-controlled.
- **LOW** — `getPlaiceholder(buffer)` errors are caught and logged but the build still succeeds with a partial `__blur.json`. That silently degrades. Consider: opt-in `STRICT_BLOG_ASSETS=1` for CI that exits non-zero.
- **LOW** — The CLI detection `process.argv[1].endsWith("build-blog-assets.ts")` is brittle. `import.meta.url === pathToFileURL(process.argv[1]).href` is the modern ESM idiom.

---

## 7. `next.config.ts` review

- Security headers are sensible (`X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`). Good baseline per skill §7.
- **MISSING** — No `Strict-Transport-Security` header (Vercel sets it at the edge in practice, but explicit is better — `max-age=63072000; includeSubDomains; preload`).
- **MISSING** — No `Content-Security-Policy`. For a portfolio site with embedded Cal.com, Vercel analytics, and Stripe-eventually, a CSP is worth designing. Not a launch blocker; tracking item.
- `images.remotePatterns` is correctly scoped to two hostnames — good.
- No `experimental` flags, no `output: "standalone"` — fine for Vercel.

---

## 8. `tsconfig.json` review

- `"strict": true` ✓ (skill §3 testability).
- `"target": "ES2017"` — outdated for Node 22 + modern browsers. With Next 16 / React 19 in the runtime, you could safely raise to `ES2022`. (Next compiles independently, but the target affects type-checking and downlevel iteration.)
- `"module": "esnext"`, `"moduleResolution": "bundler"` — correct for Next 16.
- `"incremental": true` ✓.
- `paths: { "@/*": ["./src/*"] }` ✓.

**LOW** — Consider adding `"noUncheckedIndexedAccess": true` and `"exactOptionalPropertyTypes": true` for stronger types. May surface fixes but worth it for a Zod-heavy codebase.

---

## 9. Architecture & async patterns (lens check)

Project is a Next.js App Router app — controller/service/repo separation (skill §3) doesn't apply 1:1, but the equivalents are:

- **Routes/Server Components** = controller layer ✓ (validated via Zod at boundaries — `zod ^4.4.3` is present).
- **`src/lib/*Service.ts`** = service layer ✓ (`availabilityService`, `icalendarService`, `icsService`).
- **`src/db/`** (via drizzle) = repository layer ✓.

Async patterns: nothing in the reviewed scope looks problematic. The build script is the only place where Promise.all-style parallelism would matter (§6).

---

## 10. Action items (prioritized)

### Do this week

1. **Patch the audit set** — `npm install next@16.2.6 eslint-config-next@16.2.6 && npm audit fix`. Verifies cleanly because all but `drizzle-kit` are non-major fixes. Confirm with `npm audit` → expect 0–3 remaining (just `drizzle-kit`).
2. **Add `engines`** field (`>=22.0.0 <23`) and `.nvmrc` (`22`).
3. **Move `@testing-library/dom`** to `devDependencies`.
4. **Remove `ws` from direct deps** (or document why it's needed). If kept, bump to `^8.20.1`.
5. **Fix the `predev` gap** — either add the prebuild hook to dev or correct CLAUDE.md.

### Do this month

6. **Bump `drizzle-kit`** to a version off the `@esbuild-kit/*` chain (a separate PR with migration smoke test).
7. **Set `"type": "module"`** in `package.json` and verify all configs still parse.
8. **Add `typecheck` script** + wire to CI to catch the carve-out test TS errors when their owning branches reland.
9. **Add Dependabot or Renovate** config — at minimum security updates for `next`, `react*`, `drizzle*`.

### Track / nice-to-have

10. Raise `tsconfig.target` to `ES2022`; consider `noUncheckedIndexedAccess`.
11. Parallelize / cache `build-blog-assets.ts` blur generation.
12. Design a CSP for `next.config.ts`.
13. Replace `process.argv[1].endsWith(...)` CLI check with `import.meta.url` idiom.

---

## What looks good (don't break it)

- ESLint flat config with explicit ignore set for `.workspace/`, `.claude/`, etc. — clean.
- Vitest config is minimal and correct (jsdom + alias mirrors tsconfig).
- Vercel.json is intentionally minimal — defers to Next defaults. Good.
- Zod is already at v4 — validation library choice matches skill §6 ("Zod: TypeScript first, inference").
- Strict TS, ESM-style configs, and a clean separation between source and build artifacts.

---

*Generated for `feat/blog-system-v2` branch context, against current package-lock.json (regenerated 2026-05-19).*

# Bash Defensive Patterns Review

**Scope reviewed:**
- `scripts/build-blog-assets.ts` (the `prebuild` hook, tsx-executed)
- `scripts/build-blog-assets.test.ts`
- `.github/workflows/ci.yml`
- `package.json` (inline npm scripts)
- `DEPLOY_TO_VERCEL.sh` (the only first-party `.sh` outside `.workspace/`)

The skill's defensive-Bash lens is applied analogously to TypeScript build scripts: error trapping = try/catch + non-zero exit, `set -u` = strict types + explicit validation, quoting = path-traversal containment, idempotency = stale-state cleanup, `set -o pipefail` = awaited async chains.

Severity legend: CRITICAL / MAJOR / MINOR / NIT.

---

## 1. `scripts/build-blog-assets.ts`

The script is short, single-purpose, and run at trusted build time on fully-trusted local content. That said, several defensive gaps would matter once the blog directory becomes contributor-driven or the script is reused outside `prebuild`.

### 1.1 CRITICAL — none

No bugs that would corrupt user data or break a green CI today. The pipeline is idempotent for the happy path and the tests cover stale-asset eviction.

### 1.2 MAJOR — Destructive `rmSync` of `_blog-assets` is not scoped or validated

```ts
const outRoot = path.join(publicDir, "_blog-assets");
fs.rmSync(outRoot, { recursive: true, force: true });
```

`publicDir` is taken from `opts.publicDir ?? path.join(process.cwd(), "public")`. If a future caller passes a wrong path (e.g. `publicDir: "/"` due to a misconfigured env var or argv parsing bug), this becomes `rm -rf /_blog-assets` — harmless in that exact case, but the pattern is fragile. The Bash equivalent would be `rm -rf -- "$publicDir/_blog-assets"` without guarding `$publicDir`.

**Recommended defenses (parallel to skill Pattern 7 "Safe File Operations"):**
- Assert `outRoot` is a descendant of `process.cwd()` (or of the resolved `publicDir`) before deleting:
  ```ts
  const resolvedOut = path.resolve(outRoot);
  const resolvedPublic = path.resolve(publicDir);
  if (!resolvedOut.startsWith(resolvedPublic + path.sep)) {
    throw new Error(`Refusing to rm outside publicDir: ${resolvedOut}`);
  }
  ```
- Validate the basename is exactly `_blog-assets` so a fat-finger refactor cannot widen the blast radius.

### 1.3 MAJOR — No path-traversal containment when mirroring files

```ts
const src = path.join(postDir, file.name);
const dest = path.join(outDir, file.name);
fs.copyFileSync(src, dest);
```

`fs.readdirSync(... withFileTypes: true)` returns names verbatim from the filesystem. On macOS/Linux a filename can legitimately contain `..` — `fs.readdir` itself never yields `..`, but symlinks inside `postDir` pointing outside the post can cause `copyFileSync` to read arbitrary files into `public/_blog-assets/<slug>/`, leaking secrets into the deployed build. This corresponds to the skill's variable-quoting + input-validation guidance.

**Recommended defenses:**
- `if (file.isSymbolicLink()) continue;` (or follow but resolve and assert the realpath is inside `postDir`).
- After computing `dest`, assert `path.resolve(dest).startsWith(path.resolve(outDir) + path.sep)`.

### 1.4 MAJOR — Asset pipeline silently no-ops if `content/blog/` is absent

```ts
if (!fs.existsSync(blogDir)) return;
```

Before this early return runs, `outRoot` has already been deleted. So a missing/renamed `content/blog/` results in `public/_blog-assets/` being wiped and **no diagnostic** — `next build` then renders posts with broken `__blur.json` lookups. This violates the skill's "validate all inputs" + structured-logging principles.

**Recommended defenses:**
- Reverse the order: validate inputs first, only `rmSync` after validation passes.
- Emit a `console.warn` (or throw) when `blogDir` is missing so CI fails loudly instead of producing a corrupt build artefact.

### 1.5 MAJOR — Sequential `await getPlaiceholder` in a `for…of` loop with no concurrency cap and no per-post failure isolation

The inner loop awaits sharp/plaiceholder serially. That's fine for correctness but means a single hang on one image stalls the entire build with no timeout. There's also no upper bound on file size before reading into a `Buffer` (skill Pattern 7: validate inputs, guard against pathological cases).

**Recommended defenses:**
- `fs.statSync(src).size` guard (e.g. skip + warn if > 50 MB).
- Optional: `Promise.all` per post with a small concurrency limit; or wrap the `getPlaiceholder` call in a timeout.

### 1.6 MINOR — Atomic-write semantics for `__blur.json` are missing

```ts
fs.writeFileSync(path.join(outDir, "__blur.json"), JSON.stringify(blurMap, null, 2));
```

If `prebuild` is interrupted (Ctrl-C during `next dev`), `__blur.json` can be left partially written and subsequent `JSON.parse` reads crash. Skill Pattern 7's `atomic_write` recommends writing to a temp path then renaming. `fs.writeFileSync` is atomic at the syscall level on POSIX for short writes but not guaranteed across signals during multi-page JSON serialisation.

**Recommended defense:**
```ts
const tmp = `${final}.tmp-${process.pid}`;
fs.writeFileSync(tmp, body);
fs.renameSync(tmp, final);
```

### 1.7 MINOR — Entry-point detection is brittle

```ts
if (process.argv[1] && process.argv[1].endsWith("build-blog-assets.ts")) { ... }
```

This breaks under bundlers, `tsx` watch wrappers, or if the script is symlinked. The defensive form mirrors skill Pattern 1 (safe script-dir detection):
```ts
import { fileURLToPath } from "node:url";
if (process.argv[1] === fileURLToPath(import.meta.url)) { ... }
```
(or use ESM `import.meta.main` once available).

### 1.8 MINOR — Error messages dropped to `console.warn` without aggregating failure count

A post with 20 corrupt images logs 20 warnings, the build still goes "green", and nobody notices the blur cache is empty. Aggregate counts + an opt-in `BLOG_ASSETS_STRICT=1` env var (parallel to skill Pattern 10 dry-run/env-toggle) would let CI elevate warnings to errors.

### 1.9 NIT — No structured logging (timestamps, levels)

Skill Pattern 5 recommends `[ts] LEVEL: msg`. The current `[blog-assets] done` / `console.warn` style is fine for a local script; consider matching it across the codebase if more build steps are added.

---

## 2. `scripts/build-blog-assets.test.ts`

### 2.1 MAJOR — Fixture path collides with `process.cwd()` and is **not** in `.gitignore`

```ts
const FIXTURE_ROOT = path.join(process.cwd(), "tmp-asset-fixture");
```

The skill's Pattern 3 mandates `mktemp -d` + EXIT trap. This test instead creates a sibling directory in the repo root. Risks:
- If `afterAll` doesn't run (interrupted Vitest, crash), `tmp-asset-fixture/` is left in the working tree and will show up in `git status`.
- Two concurrent `vitest` invocations (e.g. `--ui` plus CI) collide.
- The path is not in `.gitignore`, so a forgotten leftover can be `git add -A`'d (the CLAUDE.md already warns against that).

**Recommended defense:** swap to `fs.mkdtempSync(path.join(os.tmpdir(), "blog-assets-"))`.

### 2.2 MINOR — `beforeAll` deletes fixture root unconditionally

If a developer happens to have a real `tmp-asset-fixture/` for any reason, it's wiped. Same path-validation concern as 1.2.

---

## 3. `.github/workflows/ci.yml`

Overall this is a tight, defensively-configured workflow — `concurrency` group is set, `permissions: contents: read` follows least-privilege, and `cache: 'npm'` is keyed by `package-lock.json` automatically. A few hardening opportunities:

### 3.1 MAJOR — Actions are not pinned to commit SHAs

```yaml
uses: actions/checkout@v4
uses: actions/setup-node@v4
```

Mutable tags can be re-pointed by a compromised maintainer. GitHub's own security guidance for workflows recommends pinning third-party actions to a full commit SHA, optionally annotated `# v4.1.7`. For first-party `actions/*` the risk is lower, but pinning is still the defensive choice (mirrors skill principle "validate all inputs" applied to supply chain).

### 3.2 MAJOR — `npm run build` runs `prebuild` which runs `tsx scripts/build-blog-assets.ts` with **no** error trap or timeout

If `getPlaiceholder` hangs (see 1.5) the job sits until GitHub's 6-hour default timeout. Add `timeout-minutes: 15` to the `verify` job (cheap, skill Pattern 6 analogue).

### 3.3 MAJOR — Node version is a floating major (`node-version: 20`)

Skill's "Document requirements / list dependencies and minimum versions": pin to a specific minor (e.g. `20.18.x`) or, better, add a `.nvmrc` / `package.json#engines.node` and read it via `node-version-file: .nvmrc`. Today CI Node and local Node can drift.

### 3.4 MINOR — `cache: 'npm'` without an explicit cache-dependency-path

If a future contributor adds a workspace `package-lock.json` (e.g. for a docs sub-package), the cache key silently changes meaning. Defensively set `cache-dependency-path: package-lock.json`.

### 3.5 MINOR — `npm ci` is fine but no `--ignore-scripts` and no `npm audit signatures`

This codebase pulls `sharp`, `plaiceholder`, `next`, `tsx`, etc., all of which legitimately run install scripts, so `--ignore-scripts` is impractical here. Worth documenting as a conscious trade-off. Optionally add `npm audit signatures` as a non-blocking job.

### 3.6 MINOR — The exclude glob in the test step uses brace expansion that **only works because GitHub uses bash**

```yaml
run: npm run test -- --exclude '**/{home,about,case-studies,current-focus}.test.tsx'
```

This is fine on `runs-on: ubuntu-latest`, but if the matrix is ever expanded to `windows-latest`, the brace expansion silently degrades into a literal string and the carve-out files start failing CI. Recommend repeating `--exclude` four times, or moving the exclude into `vitest.config.ts` for portability (skill principle: prefer explicit, portable forms).

### 3.7 MINOR — No `pull_request` filter on paths

Every doc-only PR runs lint + test + build. Not a defensive issue per se, but a defensive cost-control: scope `paths-ignore: ['**.md', 'docs/**']` to avoid the build wiping `_blog-assets/` on `tmp-asset-fixture/` style collisions during heavy contributor activity.

### 3.8 NIT — No `secrets:` referenced (good). But `GITHUB_TOKEN` is implicitly available with `contents: read` — verify no future step adds `npm publish` or `gh` calls without re-scoping permissions per-job.

---

## 4. `package.json` scripts

### 4.1 MINOR — `prebuild` runs unconditionally even for non-blog builds

`tsx scripts/build-blog-assets.ts` runs before `next build` always. There's no `--skip-blog-assets` escape hatch (skill Pattern 10 dry-run/env-toggle). For a docs-only commit this is harmless; for emergency hot-fix builds it adds tens of seconds. Optional: gate on `if [ -z "$SKIP_BLOG_ASSETS" ]`.

### 4.2 NIT — No `engines` field

Pair with §3.3: add `"engines": { "node": ">=20.18 <21" }` so a Node 18 developer fails fast at `npm install` rather than mid-build.

### 4.3 NIT — No `prepare` / `prepush` hook to run lint/test locally

Optional Husky integration. Skill principle: "test error paths" — catch them before CI.

---

## 5. `DEPLOY_TO_VERCEL.sh`

This is a one-shot manual onboarding script, but several skill patterns apply:

### 5.1 MAJOR — `set -e` only; missing `-u` and `-o pipefail`

```bash
set -e
```

Should be `set -Eeuo pipefail` (skill Pattern 1).  The script reads `GITHUB_USER=$(gh api user -q '.login')` without checking failure — if `gh` returns empty/error, the script proceeds with `GITHUB_USER=""` and prints `https://github.com//personal-website`. With `set -u` and a `: "${GITHUB_USER:?gh user lookup failed}"` guard this fails loudly.

### 5.2 MAJOR — No `trap` / cleanup, no logging helpers

The script makes irreversible side effects (creates a GitHub repo, force-pushes) but has no `trap ERR` to surface where it failed (skill Pattern 2 / 5).

### 5.3 MAJOR — Repository name is hardcoded and not parameterised

```bash
REPO_NAME="personal-website"
```

No argument parsing (skill Pattern 4) and no dry-run support (skill Pattern 10). Re-running this on a different machine that already has a `personal-website` repo under a different owner takes the "exists" branch and skips the push silently.

### 5.4 MINOR — `gh repo create --push` with no remote URL check

If `origin` already points elsewhere, `--remote=origin` errors out. Defensive form: `git remote get-url origin >/dev/null 2>&1 && git remote remove origin || true`, then create.

### 5.5 MINOR — Heavy use of emoji in user-facing output

Cosmetic, not a defect, but the CLAUDE.md repo convention discourages emoji in tool output.

### 5.6 NIT — Three duplicate worktree copies under `.workspace/claude/worktrees/`

`DEPLOY_TO_VERCEL.sh` exists in three agent worktrees as well as the repo root. If `auto-commit.sh` ever stages from a worktree these could drift. Out of scope but worth flagging.

---

## 6. Cross-cutting observations

- **No secrets surfaced** in any reviewed file. `.env*` is gitignored, CI doesn't reference repository secrets, `siteConfig` is public data.
- **Idempotency** of the blog-assets pipeline is verified by an existing test (good — directly satisfies skill Pattern 8). The destructive `rmSync` is the price; once §1.2 + §1.3 are addressed it's a fully defensive idempotent build.
- **Subprocess invocation** in TypeScript: none (no `child_process` / `execSync` in scope), so the classic shell-injection vector is absent.
- **File/permission ops**: all `fs.*` use absolute paths derived from `process.cwd()` — no `chmod`, no `chown`, no setuid concerns.
- **`tmp-asset-fixture`** is the one path-hygiene issue worth fixing soon; everything else is hardening, not a live defect.

---

## Prioritised remediation list

1. (MAJOR, §1.2 + §1.3) Validate `outRoot` is inside `publicDir`; skip symlinked entries; assert `dest` stays inside `outDir`.
2. (MAJOR, §1.4) Move the `existsSync(blogDir)` check **before** the `rmSync`, and warn loudly when blog dir is missing.
3. (MAJOR, §2.1) Move the test fixture to `os.tmpdir()`.
4. (MAJOR, §3.1 + §3.2 + §3.3) Pin GitHub actions to SHAs, add `timeout-minutes`, pin Node minor via `.nvmrc` or `engines`.
5. (MAJOR, §5.1) `set -Eeuo pipefail` + `: "${GITHUB_USER:?...}"` in `DEPLOY_TO_VERCEL.sh`.
6. (MINOR, §1.5 / §1.6) File-size guard + atomic `__blur.json` write.
7. (MINOR, §3.6) Make the vitest exclude portable (config file or repeated `--exclude`).
8. (NIT, §1.7 / §4.2) Use `import.meta.url` entry-point detection; add `engines.node`.

No file edits made per task instruction.

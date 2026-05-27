# TypeScript Advanced Types — Codebase Review

**Scope:** `src/types/`, all `.ts`/`.tsx` in `src/`
**Date:** 2026-05-19
**Branch:** `feat/blog-system-v2`
**tsconfig:** `strict: true` (good baseline)

This review applies the lens from `.agents/skills/typescript-advanced-types/SKILL.md`: discriminated unions, template literals, conditional types, generic constraints, branded types, narrowing, Zod inference, exhaustiveness checks, and readonly discipline.

The codebase is in unusually good shape — no `: any`, no `@ts-ignore`/`@ts-expect-error`, no `@ts-nocheck`, and Zod schemas are inferred via `z.infer` (good). Findings below are improvements, not regressions.

---

## Summary

| Severity | Count | Headline |
|---|---|---|
| Major | 4 | `process.env.X!` non-null assertions on secrets; ad-hoc cover-image discriminated union; missing exhaustiveness checks in route-handler switches; `as ContactFormFieldErrors` discards Zod's typed errors |
| Minor | 7 | Could-be-branded IDs (slug, packageId, bookingId, stripePaymentIntentId); duplicate `TimeSlot` definition; redundant `as TimeSlot[]`; loose `Record<string, string>` for SUBDOMAINS; non-readonly arrays in `src/data/*`; `as React.ComponentType` widens MDX content; loose JSON map type in `blog-assets.ts` |
| Suggestions | 6 | Template literal types for asset paths and route groups; conditional types for Zod transforms; `satisfies` over `as const` casts; deeper `Readonly` for static catalogues; key remapping for field-errors; assertion functions for env var resolution |

No findings touch the test-file carve-outs called out in `CLAUDE.md`.

---

## Major Findings

### M1 — Non-null assertions on environment secrets

**Files:**
- `src/lib/stripe.ts:15` — `new Stripe(process.env.STRIPE_SECRET_KEY!, …)`
- `src/lib/email.ts:11` — `new Resend(process.env.RESEND_API_KEY!)`
- `src/app/(main)/api/webhooks/stripe/route.ts:80` — `stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)`

**Issue:** Each `!` silently allows `undefined` to flow into a third-party constructor that then throws an opaque "X is not a string" at first runtime invocation. `src/lib/session.ts` already does this correctly with a `resolveSessionSecret()` helper that fails fast with a typed error — that helper is the model.

**Lens applied:** Assertion functions / type guards instead of non-null assertions (SKILL §"Assertion Functions", §"Common Pitfalls").

**Suggested pattern (not a patch):**
```ts
function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`${name} must be set`);
  return v; // narrowed to string
}
// usage: new Stripe(requireEnv('STRIPE_SECRET_KEY'), …)
```
The comment in `src/lib/session.ts:18-19` literally calls this out as the foot-gun to avoid — three other call sites still wear it.

---

### M2 — `CoverImage.layout` is a discriminated-union opportunity

**File:** `src/types/index.ts:1-6`

```ts
export interface CoverImage {
  src: string;
  alt: string;
  focalPoint?: "center" | "top" | "bottom";
  layout: "overlay" | "beside";
}
```

`focalPoint` only makes sense for `layout: "overlay"` (the full-bleed variant). `<ProjectCover>` (`src/components/editorial/project-cover.tsx`) branches on `layout` and silently ignores `focalPoint` in the `beside` arm. Today nothing prevents a `{ layout: "beside", focalPoint: "top" }` value from being authored — it typechecks and silently does nothing.

**Lens applied:** Discriminated unions (SKILL §"Pattern 6: Discriminated Unions").

**Suggested shape:**
```ts
type CoverImage =
  | { src: string; alt: string; layout: "overlay"; focalPoint?: "center" | "top" | "bottom" }
  | { src: string; alt: string; layout: "beside" };
```
This also makes `ProjectCover` switch arms exhaustively typed instead of conditionally reading an optional that's only meaningful in one branch.

---

### M3 — Missing exhaustiveness checks (`never`) at switch sinks

**Files:**
- `src/app/(main)/api/webhooks/stripe/route.ts:87-101` — `if/else if` chain over `event.type` with no compile-time guarantee that a new `Stripe.Event` type variant is handled. New Stripe event types added in the SDK type union silently fall through to the catch-all "received: true" without a typechecker nudge.
- `src/db/schema.ts:17-31` — `bookingStatus` and `paymentStatus` pgEnums are duplicated as string unions only implicitly via Drizzle. Any consumer that switches on the runtime status string lacks an `assertNever` sink.

**Lens applied:** Exhaustiveness via `never` (SKILL §"Pattern 6").

**Suggested pattern (not a patch):**
```ts
function assertNever(x: never): never { throw new Error(`Unhandled: ${String(x)}`); }
// at the tail of the if-chain:
const _exhaustive: never = event.type; // typechecks today because Stripe.Event union is open;
// but the same pattern on bookingStatus/paymentStatus would catch a new enum member.
```
For the Stripe handler the practical move is a typed `Record<Stripe.Event['type'], Handler>` so new types announce themselves at compile time.

---

### M4 — `as ContactFormFieldErrors` discards Zod's inferred error shape

**File:** `src/app/actions/contact.ts:58`

```ts
const fieldErrors = parsed.error.flatten().fieldErrors as ContactFormFieldErrors;
```

`ContactFormFieldErrors` is hand-maintained next to `contactFormSchema`. If you add a field to the schema, this cast silently keeps shipping the old `ContactFormFieldErrors` shape and the UI loses the new error key with zero TypeScript warning.

**Lens applied:** Zod inference + mapped types (SKILL §"Mapped Types" and §"Pattern 5").

**Suggested pattern:**
```ts
type ContactFormFieldErrors = {
  [K in keyof ContactFormInput]?: string[];
};
// or rely on z.inferFlattenedErrors<typeof contactFormSchema>
```
Then drop the cast — `flatten().fieldErrors` will type-fit the mapped type by construction.

The same pattern would clean up `src/components/sections/contact-section.tsx:136`:
```ts
(Object.entries(state.fieldErrors) as [string, string[] | undefined][])
```

---

## Minor Findings

### m1 — Brandable IDs

Several string/number IDs would benefit from nominal "branded" types to prevent cross-wiring at compile time:

- `slug: string` on `BlogPost`, `Project` (`src/types/blog.ts:27`, `src/types/index.ts:18`) — any string can be passed to `getPostBySlug(slug)` today, including `project.slug`.
- `packageId: number` (validated in `src/lib/validation/booking.ts:48` and consumed in `src/app/(main)/api/checkout/route.ts:31`).
- `stripePaymentIntentId: string` (`src/db/schema.ts:104`).
- `bookings.id`, `payments.id`, etc.

**Lens:** SKILL §"Best Practices" + branded type pattern:
```ts
type Brand<T, B> = T & { readonly __brand: B };
type Slug = Brand<string, "Slug">;
type PackageId = Brand<number, "PackageId">;
```

Low cost for new code, high payoff in route handlers where `clientId`/`packageId`/`reservationId` flow side-by-side as plain `number`.

---

### m2 — Duplicate `TimeSlot` interface

- `src/lib/availabilityService.ts:9` — canonical `TimeSlot`
- `src/components/booking/PhotographyBookingForm.tsx:31` — re-declared locally, same shape

Then at line 251:
```ts
setAvailableSlots(slots as TimeSlot[]);
```
The cast exists only because the two `TimeSlot`s are nominally different declarations even though their shapes are identical. Importing the type from `availabilityService` removes both the duplicate and the cast.

---

### m3 — `SUBDOMAINS: Record<string, string>` loses the literal-union benefit

**File:** `src/proxy.ts:11`

```ts
const SUBDOMAINS: Record<string, string> = {
  photography: "/photography",
  ecommerce: "/ecommerce",
};
```

**Lens:** template literal + key narrowing (SKILL §"Template Literal Types").

**Suggested:**
```ts
const SUBDOMAINS = {
  photography: "/photography",
  ecommerce: "/ecommerce",
} as const satisfies Record<string, `/${string}`>;

type Subdomain = keyof typeof SUBDOMAINS;
```
Buys you a `Subdomain` literal union to use in tests/typed routes and constrains values to start with `/`.

---

### m4 — Static catalogues not deeply `readonly`

**Files:**
- `src/data/projects.ts` — `projects: Project[]`
- `src/data/photography.ts:51` — `photoCategories: { value: PhotoCategory; label: string }[]`
- `src/data/site-config.ts` — `siteConfig` is a mutable object literal

These are runtime-frozen-by-convention data tables. `readonly Project[]` (or `as const` for `siteConfig`) would prevent accidental mutation downstream and would make `siteConfig.links` a literal-typed map (which feeds `Person` JSON-LD and metadata).

**Lens:** SKILL §"Common Pitfalls #5: Forgetting readonly modifiers".

`siteConfig as const` would also surface a real bug today: `email: "ps324@byu.edu"` ends up as `string`, so a future typo in a `siteConfig.email` reader (`src/components/sections/contact-section.tsx:148`) wouldn't be a literal mismatch.

---

### m5 — `Content as React.ComponentType` widens the MDX render boundary

**File:** `src/app/(main)/blog/[slug]/page.tsx:122`

```ts
<BlogPostView post={post} Content={Content as React.ComponentType} allPosts={getAllPosts()} />
```

The MDX `Content` it's casting from is typed by `next-mdx-remote` / its caller as a more specific component. The cast erases the prop type. Importing `MDXContent` (or the matching type) from the MDX loader avoids the cast and keeps the prop boundary honest.

---

### m6 — `Record<string, string>` for the blur map

**File:** `src/lib/blog-assets.ts:11,21,24`

The blur map keys are known asset filenames per slug. Today the key type is `string`, so `blur[cleaned]` returns `string | undefined` without distinguishing "no such asset" from "asset exists, no blur". With folder discovery already enumerated at build time (`scripts/build-blog-assets.ts`), the map could be typed as a per-slug `Record<KnownAsset<Slug>, string>` — overkill for current scale, but a template-literal helper:

```ts
type BlurMap = Record<`./${string}` | string, string>;
```
…or a tagged shape would communicate intent. Low priority.

---

### m7 — `parsed.error.flatten().fieldErrors` field-by-field traversal in contact-section.tsx

**File:** `src/components/sections/contact-section.tsx:136`

The `as [string, string[] | undefined][]` cast is a workaround for `Object.entries` typing. A typed helper:
```ts
function typedEntries<T extends object>(o: T): Array<{ [K in keyof T]: [K, T[K]] }[keyof T]> {
  return Object.entries(o) as Array<{ [K in keyof T]: [K, T[K]] }[keyof T]>;
}
```
…removes the cast at the call site and is reusable across other field-error iterators.

---

## Suggestions (no defect, just upgrades)

### s1 — `satisfies` over `as const` for `sitemap.ts`

`src/app/sitemap.ts:12,19,40` use `changeFrequency: "monthly" as const`. These are repeated against a known `MetadataRoute.Sitemap` shape — using `satisfies MetadataRoute.Sitemap[number]` on each entry would assert structural fit while preserving literal types.

### s2 — Template literal type for blog asset paths

The `resolveBlogAsset(slug, relPath)` API in `src/lib/blog-assets.ts` accepts any `string`. The convention in MDX is `./image.png`. A template literal:
```ts
type RelAsset = `./${string}` | `https://${string}` | `http://${string}` | `/${string}`;
```
…would catch a stray "image.png" (no leading `./`) at the call site instead of producing a broken URL at runtime.

### s3 — Conditional type for "validated booking input"

`validateBookingDate`'s `ValidationResult` is already a clean discriminated union (`{ ok: true } | { ok: false; reason: string }`). One step further: extract a `Branded<Date, "ValidBookingDate">` so any path that received a `ValidBookingDate` is statically known to have passed validation. The same idea applies to `passwordsMatch` returning `password is AdminPassword`.

### s4 — Deeper `Readonly` for `BOOKING_LIMITS` / `CONTACT_LIMITS`

Both `as const` already (`src/lib/validation/booking.ts:37` and `src/lib/validation/contact.ts:4`). Good. The objects that consume them (e.g. `ValidateBookingDateOptions`) could be `Readonly<>` to communicate that callers shouldn't mutate the options bag.

### s5 — Key remapping for `LoginFormState` / `ContactFormState`

These two `error / fieldErrors` shapes are structurally identical. A generic `FormState<T>` mapped type would let admin-auth, booking, and contact share one type and one `firstFieldError` helper.

### s6 — `assertNever` helper

Add a single `src/lib/assertNever.ts` and place it at the tails of:
- `src/app/(main)/api/webhooks/stripe/route.ts` if the Stripe event-type union ever narrows to a closed enum (today it's open — see M3)
- Any future booking-status / payment-status switch.

---

## What's already excellent (keep doing this)

- `src/lib/session.ts` — env-resolution with a real `Error` throw, no `!`.
- `src/lib/validation/booking.ts` — `ValidationResult` as a clean discriminated union; `z.NEVER` used correctly in the `eventDate` transform.
- `src/lib/validation/contact.ts:79` — `z.infer<typeof contactFormSchema>` for the input type instead of redeclaring.
- `src/db/schema.ts` — Postgres `pgEnum` for `bookingStatus` and `paymentStatus` puts the literal sets at the schema layer.
- `src/lib/blog.ts:72` — narrow intersection on `frontmatter` (`& { coverAlt?: string }`) instead of a cast to a wider type.
- `src/app/layout.tsx`, `src/app/(main)/layout.tsx` etc. — `Readonly<{ children: React.ReactNode }>` on layout props.
- `src/components/booking/PhotographyBookingForm.tsx:29` — `type BookingStep = 1 | 2 | 3 | 4` is a textbook literal-union state machine input.
- `src/db/index.ts` — symbol/`then` short-circuits in the Proxy show real awareness of structural typing edge cases.

---

## Files referenced

- `/Users/philipsun/Documents/personal websit/src/types/index.ts`
- `/Users/philipsun/Documents/personal websit/src/types/blog.ts`
- `/Users/philipsun/Documents/personal websit/src/lib/stripe.ts`
- `/Users/philipsun/Documents/personal websit/src/lib/email.ts`
- `/Users/philipsun/Documents/personal websit/src/lib/session.ts`
- `/Users/philipsun/Documents/personal websit/src/lib/blog.ts`
- `/Users/philipsun/Documents/personal websit/src/lib/blog-assets.ts`
- `/Users/philipsun/Documents/personal websit/src/lib/rate-limit.ts`
- `/Users/philipsun/Documents/personal websit/src/lib/validation/booking.ts`
- `/Users/philipsun/Documents/personal websit/src/lib/validation/contact.ts`
- `/Users/philipsun/Documents/personal websit/src/lib/availabilityService.ts`
- `/Users/philipsun/Documents/personal websit/src/lib/icalendarService.ts`
- `/Users/philipsun/Documents/personal websit/src/lib/serverCalendar.ts`
- `/Users/philipsun/Documents/personal websit/src/db/index.ts`
- `/Users/philipsun/Documents/personal websit/src/db/schema.ts`
- `/Users/philipsun/Documents/personal websit/src/proxy.ts`
- `/Users/philipsun/Documents/personal websit/src/app/actions/contact.ts`
- `/Users/philipsun/Documents/personal websit/src/app/actions/admin-auth.ts`
- `/Users/philipsun/Documents/personal websit/src/app/(main)/api/webhooks/stripe/route.ts`
- `/Users/philipsun/Documents/personal websit/src/app/(main)/api/checkout/route.ts`
- `/Users/philipsun/Documents/personal websit/src/app/(main)/blog/[slug]/page.tsx`
- `/Users/philipsun/Documents/personal websit/src/app/(main)/projects/[slug]/page.tsx`
- `/Users/philipsun/Documents/personal websit/src/app/sitemap.ts`
- `/Users/philipsun/Documents/personal websit/src/components/booking/PhotographyBookingForm.tsx`
- `/Users/philipsun/Documents/personal websit/src/components/sections/contact-section.tsx`
- `/Users/philipsun/Documents/personal websit/src/data/photography.ts`
- `/Users/philipsun/Documents/personal websit/src/data/site-config.ts`

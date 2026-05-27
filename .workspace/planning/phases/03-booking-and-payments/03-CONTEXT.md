# Phase 3: Booking and Payments - Context

**Gathered:** 2026-03-19
**Status:** Ready for planning

<domain>
## Phase Boundary

A photography client can complete the full booking flow — package selection, date/time from live CalDAV availability, Stripe deposit payment — and receive a branded confirmation email with an ICS calendar invite. Booking confirmation is triggered server-side via Stripe webhook (idempotent). The `/meet` Cal.com flow is NOT touched by this phase.

</domain>

<decisions>
## Implementation Decisions

### Booking entry point
- Dedicated page at `photography.philipsun.com/book` (i.e., `/photography/book` route)
- `?pkg=portrait` (or other slug) URL param pre-selects the package; client can change via dropdown before proceeding
- "Book Now" button on each pricing card links to `/photography/book?pkg={slug}`
- Build a NEW `PhotographyBookingForm` component (`src/components/booking/PhotographyBookingForm.tsx`) — do not extend or modify the existing `BookingForm` used on `/meet`
- Steps: Package selection → Date picker → Time slot → Client details → Stripe Checkout (hosted redirect)

### Post-payment experience
- Stripe `success_url` → `/photography/book/success` — dedicated success page showing: package name, date/time, deposit amount paid
- Stripe `cancel_url` → `/photography/book?cancelled=true` — returns to the booking form with a message: "Payment was cancelled — your slot is still available"
- Philip receives an email notification to `siteConfig.email` when a booking is confirmed (triggered by Stripe webhook, not client redirect)
- Booking also appears in `/admin` dashboard

### Confirmation email to client
- Triggered server-side by Stripe webhook (idempotent — retried webhooks must not send duplicate emails)
- Tone: warm, photographer voice — feels like Philip wrote it, not a generic booking system
- Format: HTML email with light BYU navy branding (not over-designed)
- Content (all kept concise):
  1. Booking details: package name, date/time, deposit amount paid
  2. ICS calendar invite attachment
  3. Short prep tips paragraph (what to wear, arrive early, etc.)
  4. Location follow-up note ("I'll follow up with exact location details")
  5. Philip's direct contact info so client can reach him with questions

### Email service
- Provider: **Resend** (REST API, free tier, Next.js-native)
- From address: `bookings@photography.psunproduction.com`
- Resend domain verification required for `psunproduction.com` (or `photography.psunproduction.com` subdomain) — add SPF/DKIM DNS records during phase setup
- New env var: `RESEND_API_KEY` (add to Vercel + `.env.local.example`)

### Bug fixes (in scope for this phase)
- **BUG-01**: Fix CalDAV availability — phantom slots must not appear when a blocking calendar event exists. Fix lives in `src/lib/serverCalendar.ts` / `src/lib/availabilityService.ts`
- **BUG-03**: Replace `loadedMonths.add(monthKey)` Set mutation in `BookingForm.tsx` with proper immutable state update (create new Set, don't mutate). NOTE: Fix in `BookingForm` (for /meet) even though Phase 3 builds a new form — both share the same bug pattern

### Claude's Discretion
- Exact ICS attachment implementation with Resend (inline vs base64 attachment)
- Pending reservation cleanup strategy (expired rows in `pending_reservations`)
- Exact HTML email template markup
- Stripe webhook signature verification implementation detail

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Database schema
- `src/db/schema.ts` — All 5 tables: `bookings`, `payments`, `packages`, `inquiries`, `pending_reservations` — column names, types, constraints

### Existing booking infrastructure
- `src/components/booking/BookingForm.tsx` — Existing multi-step form (date/time/details) — reuse calendar/slot logic patterns, fix BUG-03 here
- `src/lib/availabilityService.ts` — Slot generation (9 AM–5 PM Mountain, 30-min slots, weekday-only) — BUG-01 fix here
- `src/lib/icalendarService.ts` — CalDAV event fetching (iCloud) — BUG-01 investigation starts here
- `src/lib/serverCalendar.ts` — Server-side availability (used for SSR pre-load) — BUG-01 fix likely here
- `src/lib/icsService.ts` — ICS file generation (already works — reuse for email attachment)
- `src/app/(main)/api/calendar/route.ts` — Calendar API route

### Photography data
- `src/data/photography.ts` — `photographyPackages` array with id, name, description, priceInCents, depositInCents, durationMinutes
- `src/app/(photography)/photography/pricing/page.tsx` — Pricing page (needs "Book Now" buttons added)

### Config and routing
- `src/data/site-config.ts` — `siteConfig.email`, `siteConfig.name`, `siteConfig.url`
- `src/proxy.ts` — Subdomain middleware routing (photography subdomain → /photography path)
- `src/app/(photography)/layout.tsx` — Photography subdomain layout

### Requirements
- `.planning/REQUIREMENTS.md` — PHOTO-03, PHOTO-04, BUG-01, BUG-03 acceptance criteria

No external specs — requirements fully captured in decisions above and REQUIREMENTS.md.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `BookingForm.tsx` calendar rendering + slot logic: Extract/reuse the `renderCalendar()` and slot-loading useEffect patterns in the new `PhotographyBookingForm`
- `icsService.ts` `generateICSContent()`: Already works — reuse directly for email ICS attachment
- `src/lib/session.ts` + `src/app/actions/admin-auth.ts`: Admin auth pattern established — no changes needed for Phase 3
- `src/db/index.ts`: Lazy Neon connection established — import `db` directly, tables from `schema.ts`
- `src/components/ui/button.tsx`, `badge.tsx`, `separator.tsx`: shadcn/ui components — use for booking form UI

### Established Patterns
- Server Actions (`src/app/actions/contact.ts`): Pattern for DB writes — use same pattern for `createBooking` action
- `useActionState` (React 19): Used in contact form and admin login — use for form submission states in booking flow
- Integer cents: All monetary values stored as integers (already enforced in schema and pricing page)
- `drizzle-kit generate + migrate` (never push): Migration pattern is locked — generate migration files for any schema changes
- Stripe Checkout hosted redirect: No inline card form — redirect to Stripe, handle webhook for confirmation

### Integration Points
- New route: `src/app/(photography)/photography/book/page.tsx` — booking form page
- New route: `src/app/(photography)/photography/book/success/page.tsx` — post-payment success
- New API route: `src/app/api/webhooks/stripe/route.ts` — Stripe webhook handler (booking creation + email trigger)
- New API route or Server Action: Create Stripe Checkout session
- Photography pricing page (`pricing/page.tsx`): Add "Book Now" links to each package card
- Admin page (`src/app/(main)/admin/page.tsx`): Extend to show bookings table alongside contacts

</code_context>

<specifics>
## Specific Ideas

- From email address: `bookings@photography.psunproduction.com` (Resend domain verification on psunproduction.com)
- The booking flow URL structure: `/photography/book?pkg={packageSlug}` → pre-selects package
- Success page URL: `/photography/book/success`
- Cancel returns to: `/photography/book?cancelled=true`
- Philip's notification email goes to `siteConfig.email`

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 03-booking-and-payments*
*Context gathered: 2026-03-19*

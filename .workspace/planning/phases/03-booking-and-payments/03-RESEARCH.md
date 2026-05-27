# Phase 3: Booking and Payments - Research

**Researched:** 2026-03-19
**Domain:** Stripe Checkout, CalDAV availability, Resend transactional email, Neon/Drizzle bookings, iron-session, Next.js App Router webhooks
**Confidence:** HIGH (all critical integrations verified against official docs and existing codebase)

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Dedicated booking page at `/photography/book` (`?pkg=portrait` pre-selects package; client can change via dropdown)
- Build a NEW `PhotographyBookingForm` component (`src/components/booking/PhotographyBookingForm.tsx`) — do not extend or modify the existing `BookingForm` used on `/meet`
- Steps: Package selection → Date picker → Time slot → Client details → Stripe Checkout (hosted redirect)
- Stripe `success_url` → `/photography/book/success` — dedicated success page showing package name, date/time, deposit amount paid
- Stripe `cancel_url` → `/photography/book?cancelled=true` — returns to booking form with message
- Philip receives email notification to `siteConfig.email` triggered by Stripe webhook, not client redirect
- Booking appears in `/admin` dashboard
- Confirmation email triggered server-side by Stripe webhook (idempotent — retried webhooks must not send duplicate emails)
- Email tone: warm, photographer voice; HTML email with light BYU navy branding
- Email content: booking details, ICS calendar invite attachment, prep tips, location follow-up note, Philip's contact info
- Email provider: **Resend** (from address: `bookings@photography.psunproduction.com`)
- Resend domain verification required for `psunproduction.com` — add SPF/DKIM DNS records during phase setup
- New env var: `RESEND_API_KEY` (add to Vercel + `.env.local.example`)
- **BUG-01**: Fix CalDAV availability — phantom slots must not appear. Fix lives in `src/lib/serverCalendar.ts` / `src/lib/availabilityService.ts`
- **BUG-03**: Replace `loadedMonths.add(monthKey)` Set mutation in `BookingForm.tsx` with proper immutable state update (create new Set). Fix in `BookingForm` (for /meet) even though Phase 3 builds a new form.

### Claude's Discretion
- Exact ICS attachment implementation with Resend (inline vs base64 attachment)
- Pending reservation cleanup strategy (expired rows in `pending_reservations`)
- Exact HTML email template markup
- Stripe webhook signature verification implementation detail

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope.
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| PHOTO-03 | Visitor can complete a multi-step photography booking flow: package selection → date/time picker → client info → Stripe deposit payment | Stripe Checkout `price_data` inline sessions, metadata embedding, `checkout.session.completed` webhook, `pending_reservations` slot hold |
| PHOTO-04 | Client automatically receives a booking confirmation email with an ICS calendar invite after successful payment | Resend SDK `attachments` with base64 ICS content, `generateICSContent()` already exists in `icsService.ts`, webhook-triggered sending |
| BUG-01 | CalDAV availability service fixed so slots are not shown as available when the calendar has a blocking event | All-day event DTEND exclusive boundary (RFC 5545), ical.js `ICAL.Event` already used in `serverCalendar.ts`, the bug is in `hasConflict`/`getAvailableSlots` event filtering not all-day-aware |
| BUG-03 | `loadedMonths` Set mutation in `BookingForm.tsx` replaced with proper state management | React immutable state pattern: `setLoadedMonths(prev => new Set([...prev, monthKey]))` — line 126 of `BookingForm.tsx` |
</phase_requirements>

---

## Summary

Phase 3 wires together four independent technical subsystems: a new multi-step booking form with Stripe Checkout redirect, a server-side Stripe webhook handler that idempotently creates bookings and sends confirmation email, a Resend-powered transactional email with ICS attachment, and two targeted bug fixes (CalDAV phantom slots and React Set mutation). The existing codebase already has the heavy lifting done: `icsService.ts` generates ICS, `serverCalendar.ts` fetches CalDAV events via tsdav + ical.js, `session.ts` has the iron-session pattern, and `schema.ts` has all five tables including `pending_reservations`. No new infrastructure is needed — this phase assembles existing pieces.

The CalDAV bug (BUG-01) stems from all-day events in iCalendar RFC 5545: a single-day all-day event has `DTSTART:DATE:20260320` and `DTEND:DATE:20260321` (DTEND is exclusive — the day AFTER the event). When `ical.js` calls `.toJSDate()` on this DTEND, it produces midnight of the next day as a timestamp. The `getAvailableSlots()` half-open interval check `event.endTime > currentTime` then sees the blocking event's endTime as midnight of the next morning, which still overlaps all slots on the actual event day — so that part works. The real phantom-slot bug is more likely in the server-side `busyDates` computation: the day-range filter `new Date(e.endTime) > dayStart && new Date(e.startTime) < dayEnd` uses `startOfDay`/`endOfDay` of UTC-based dates while the slot generator works in Mountain Time. If `toJSDate()` returns UTC midnight, a Mountain Time day's `startOfDay` may not align — the event may not be matched to the right day bucket.

The Stripe idempotency strategy is to check for an existing booking row with `stripePaymentIntentId` matching `session.payment_intent` before inserting. Stripe's documented approach is to log processed event IDs; the schema already has `stripe_payment_intent_id UNIQUE` on the `bookings` table, which provides a database-level idempotency guarantee in addition to application-level checks.

**Primary recommendation:** Use `price_data` inline pricing (no pre-created Stripe Price objects), embed all booking context in session `metadata` (client name, email, package ID, event date ISO string), and verify idempotency via the existing UNIQUE constraint on `bookings.stripe_payment_intent_id`.

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `stripe` | 20.4.1 (verified 2026-03-19) | Stripe Checkout session creation + webhook verification | Official Stripe Node SDK; `constructEventAsync` for App Router |
| `resend` | 6.9.4 (verified 2026-03-19) | Transactional email with ICS attachment | REST-based, Next.js-native, free tier, already decided |
| `iron-session` | 8.0.4 (already installed) | Session cookie to pass booking context to success page | Already in project; `getIronSession(cookieStore, opts)` pattern established |
| `drizzle-orm` | 0.45.1 (already installed) | DB writes for bookings + payments | Already in project; `db.insert(bookings).values(...)` pattern |
| `ics` | 3.8.1 (already installed) | ICS calendar file generation | `generateICSContent()` already implemented in `icsService.ts` |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `tsdav` | 2.1.8 (already installed) | CalDAV event fetching | BUG-01 investigation — `fetchCalendarObjects` with `timeRange` |
| `ical.js` | 2.2.1 (already installed) | ICS parsing, timezone-aware event start/end | BUG-01 fix — `ICAL.Event.startDate.isDate` for all-day detection |
| `date-fns` | 4.1.0 (already installed) | Date arithmetic | Slot generation, month boundaries |
| `date-fns-tz` | 3.2.0 (already installed) | Mountain Time conversions | `toZonedTime`, `fromZonedTime` in `availabilityService.ts` |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Resend | Nodemailer + SMTP | Nodemailer needs an SMTP server; Resend is REST-only, simpler in serverless |
| `price_data` inline | Pre-created Stripe Price IDs | Price IDs require setup in Stripe dashboard per package; `price_data` keeps all config in code |
| DB idempotency via UNIQUE constraint | Event ID log table | Separate events table requires schema migration; UNIQUE on `stripe_payment_intent_id` is already in schema |

**Installation (new packages only):**
```bash
npm install stripe resend
```

Stripe and Resend are NOT currently in `package.json` — they must be installed.

**Version verification (run before writing PLAN):**
```bash
npm view stripe version    # 20.4.1 as of 2026-03-19
npm view resend version    # 6.9.4 as of 2026-03-19
```

---

## Architecture Patterns

### Recommended Project Structure (new files only)
```
src/
├── app/
│   ├── (photography)/photography/book/
│   │   ├── page.tsx                    # Booking form page (Server Component wrapper)
│   │   └── success/
│   │       └── page.tsx                # Success page (reads session cookie)
│   ├── api/
│   │   ├── webhooks/stripe/
│   │   │   └── route.ts                # Stripe webhook handler (raw body, idempotent)
│   │   └── checkout/
│   │       └── route.ts                # POST: create Stripe Checkout session
├── components/booking/
│   └── PhotographyBookingForm.tsx      # New multi-step form (DO NOT modify BookingForm.tsx)
├── lib/
│   └── stripe.ts                       # Singleton stripe client
└── emails/
    └── BookingConfirmation.tsx         # Resend React email template (optional, or HTML string)
```

### Pattern 1: Stripe Checkout Session Creation (Server Action or API Route)
**What:** Create a Checkout session server-side with `price_data` inline pricing and embed all booking context in `metadata`. Redirect client to `session.url`.

**When to use:** "Proceed to Payment" button in step 4 of `PhotographyBookingForm`

```typescript
// src/app/api/checkout/route.ts
// Source: https://docs.stripe.com/api/checkout/sessions/create
import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: Request) {
  const { packageId, clientName, clientEmail, eventDate, phone, notes } = await request.json();

  // Look up package from photographyPackages (or DB)
  const pkg = photographyPackages.find(p => p.id === packageId);
  if (!pkg) return NextResponse.json({ error: 'Invalid package' }, { status: 400 });

  // Create pending reservation row first (30-min expiry)
  const reservation = await db.insert(pendingReservations).values({
    packageId,
    clientEmail,
    requestedDate: new Date(eventDate),
    expiresAt: new Date(Date.now() + 30 * 60 * 1000),
  }).returning();

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    customer_email: clientEmail,
    line_items: [{
      price_data: {
        currency: 'usd',
        unit_amount: pkg.depositInCents,   // deposit only, not full price
        product_data: {
          name: `${pkg.name} — Deposit`,
          description: `Photography session deposit. Balance due on the day.`,
        },
      },
      quantity: 1,
    }],
    metadata: {
      packageId: String(packageId),
      packageName: pkg.name,
      clientName,
      clientEmail,
      clientPhone: phone || '',
      eventDate,           // ISO string, max 500 chars — fits dates easily
      reservationId: String(reservation[0].id),
    },
    success_url: `${process.env.NEXT_PUBLIC_PHOTOGRAPHY_URL}/photography/book/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_PHOTOGRAPHY_URL}/photography/book?cancelled=true`,
  });

  // Update reservation with Stripe session ID
  await db.update(pendingReservations)
    .set({ stripeSessionId: session.id })
    .where(eq(pendingReservations.id, reservation[0].id));

  return NextResponse.json({ url: session.url });
}
```

### Pattern 2: Stripe Webhook Handler (Idempotent, Raw Body)
**What:** Listen for `checkout.session.completed`, create booking row, send confirmation email. Use `request.text()` for raw body — NOT `request.json()`.

**When to use:** `src/app/api/webhooks/stripe/route.ts`

```typescript
// Source: https://docs.stripe.com/webhooks
// Source: https://docs.stripe.com/checkout/fulfillment
export async function POST(request: Request) {
  const body = await request.text();  // RAW — required for signature verification
  const sig = request.headers.get('stripe-signature')!;

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const meta = session.metadata!;

    // IDEMPOTENCY: check if booking already exists for this payment intent
    const existing = await db.select()
      .from(bookings)
      .where(eq(bookings.stripePaymentIntentId, session.payment_intent as string))
      .limit(1);

    if (existing.length > 0) {
      return NextResponse.json({ received: true }); // already processed
    }

    // Insert booking (stripePaymentIntentId has UNIQUE constraint — DB-level guard)
    const [booking] = await db.insert(bookings).values({
      packageId: parseInt(meta.packageId),
      clientName: meta.clientName,
      clientEmail: meta.clientEmail,
      clientPhone: meta.clientPhone || null,
      eventDate: new Date(meta.eventDate),
      stripePaymentIntentId: session.payment_intent as string,
      depositPaidInCents: session.amount_total ?? 0,
      status: 'confirmed',
    }).returning();

    // Insert payment record
    await db.insert(payments).values({
      bookingId: booking.id,
      stripePaymentIntentId: session.payment_intent as string,
      amountInCents: session.amount_total ?? 0,
      currency: session.currency ?? 'usd',
      status: 'succeeded',
    });

    // Delete pending reservation (slot is now confirmed)
    if (meta.reservationId) {
      await db.delete(pendingReservations)
        .where(eq(pendingReservations.id, parseInt(meta.reservationId)));
    }

    // Send confirmation email (also idempotent — if booking insert succeeded, email fires once)
    await sendBookingConfirmationEmail({
      clientName: meta.clientName,
      clientEmail: meta.clientEmail,
      packageName: meta.packageName,
      eventDate: new Date(meta.eventDate),
      depositPaidInCents: session.amount_total ?? 0,
    });

    // Notify Philip
    await sendPhilipNotificationEmail({ booking, packageName: meta.packageName });
  }

  return NextResponse.json({ received: true });
}
```

### Pattern 3: Resend Email with ICS Attachment
**What:** Send HTML email with ICS file as base64 attachment using Resend SDK.

**When to use:** Inside webhook handler after booking confirmed.

```typescript
// Source: https://resend.com/docs/dashboard/emails/attachments
import { Resend } from 'resend';
import { generateICSContent } from '@/lib/icsService';  // already exists

const resend = new Resend(process.env.RESEND_API_KEY!);

async function sendBookingConfirmationEmail(opts: {
  clientName: string;
  clientEmail: string;
  packageName: string;
  eventDate: Date;
  depositPaidInCents: number;
}) {
  const icsContent = generateICSContent({
    title: `Photography Session — ${opts.packageName}`,
    description: `Your photography session with Philip Sun.`,
    startTime: opts.eventDate,
    endTime: new Date(opts.eventDate.getTime() + 60 * 60 * 1000), // 1hr placeholder
    organizer: { name: siteConfig.name, email: 'bookings@photography.psunproduction.com' },
    attendee: { name: opts.clientName, email: opts.clientEmail },
  });

  // Resend attachment: content is base64 string or Buffer
  const icsBase64 = Buffer.from(icsContent).toString('base64');

  await resend.emails.send({
    from: 'Philip Sun Photography <bookings@photography.psunproduction.com>',
    to: opts.clientEmail,
    subject: `Your session is confirmed — ${opts.packageName}`,
    html: buildConfirmationEmailHtml(opts),
    attachments: [
      {
        filename: 'session.ics',
        content: icsBase64,          // base64 string
        // content_type inferred from filename (.ics → text/calendar)
        // For Outlook compatibility, explicitly set:
        content_type: 'text/calendar; method=REQUEST',
      },
    ],
  });
}
```

### Pattern 4: BUG-03 Fix — Immutable Set State
**What:** Replace direct Set mutation with functional state update that creates a new Set.

**Where:** `src/components/booking/BookingForm.tsx` line 126

```typescript
// BEFORE (BUG — mutates state without triggering re-render):
loadedMonths.add(monthKey);

// AFTER (CORRECT — creates new Set, triggers React re-render):
setLoadedMonths(prev => new Set([...prev, monthKey]));
```

**Requires:** Change `const [loadedMonths] = useState` to `const [loadedMonths, setLoadedMonths] = useState`

### Pattern 5: BUG-01 Fix — CalDAV All-Day Event Phantom Slots
**What:** All-day events in iCalendar RFC 5545 use `VALUE=DATE` for DTSTART/DTEND. DTEND is exclusive (day after the event). When `ical.js` converts a DATE-type DTEND to a JS Date via `.toJSDate()`, it produces UTC midnight, which may not align with Mountain Time day boundaries used by `getAvailableSlots()`.

**Root cause in `serverCalendar.ts`:** The `busyDates` computation filters events using `startOfDay(day)` / `endOfDay(day)` from `date-fns`, which operates in local time (Node.js timezone, likely UTC on Vercel). If an all-day event ends at `2026-03-21T00:00:00Z` (March 21 midnight UTC = March 20 at 6 PM Mountain), the filter `new Date(e.endTime) > dayStart` will still include this event for March 20 — meaning it SHOULD block March 20 slots. The bug is more subtle: the event's `startTime` may be `2026-03-20T00:00:00Z` (UTC midnight), which in Mountain Time is March 19 at 6 PM. So the event may be bucketed to the WRONG day in Mountain Time terms.

**Fix approach:** Use `date-fns-tz` `toZonedTime` when computing day buckets in `serverCalendar.ts` — convert the event start/end times to Mountain Time before comparing against day boundaries. Use `format(day, 'yyyy-MM-dd', { timeZone: 'America/Denver' })` consistently (already done for `busyDates` formatting, but NOT for the dayStart/dayEnd filter).

```typescript
// Source: existing serverCalendar.ts pattern + RFC 5545
// In _fetchServerAvailability, replace startOfDay/endOfDay with timezone-aware versions:
import { toZonedTime } from 'date-fns-tz';

const TIMEZONE = 'America/Denver';

// For each day in the range:
const dayInMT = toZonedTime(day, TIMEZONE);
const dayStartMT = startOfDay(dayInMT);  // midnight in Mountain Time as a local Date
const dayEndMT = endOfDay(dayInMT);

// Then convert event times to Mountain Time before comparing:
const dayEvents = events.filter(e => {
  const eventEndMT = toZonedTime(new Date(e.endTime), TIMEZONE);
  const eventStartMT = toZonedTime(new Date(e.startTime), TIMEZONE);
  return eventEndMT > dayStartMT && eventStartMT < dayEndMT;
});
```

**Alternative simpler approach:** Use `date-fns-tz`'s `format(day, 'yyyy-MM-dd', { timeZone: TIMEZONE })` to get the Mountain Time date string, then compare event start/end date strings similarly — avoids JS Date comparison entirely for the all-day case.

### Anti-Patterns to Avoid

- **Don't call `request.json()` in the Stripe webhook route** — this parses the body and destroys the raw bytes needed for `constructEvent`. Always use `request.text()`.
- **Don't trust the success_url redirect for booking creation** — clients can close their browser before reaching `/book/success`. Only create bookings in the webhook.
- **Don't use `price_id` unless a Stripe Price object already exists** — use `price_data` for inline pricing to keep all config in code.
- **Don't send confirmation email from the success page** — the page may load multiple times (refresh, back-button). Email only from webhook.
- **Don't store sensitive data (PII beyond what's needed) in Stripe metadata** — Stripe metadata is not encrypted at rest.
- **Don't mutate React state Sets directly** — `Set.add()` mutates in place and React's `===` check won't detect the change, causing stale renders (this is BUG-03).

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Webhook signature verification | Custom HMAC check | `stripe.webhooks.constructEvent(body, sig, secret)` | Handles timestamp tolerance window, v1 scheme, timing-safe comparison |
| ICS file generation | Custom RFC 5554 formatter | `ics` lib + existing `generateICSContent()` in `icsService.ts` | RFC compliance, timezone encoding, attendee properties |
| Transactional email delivery | Custom SMTP | `resend` SDK | SPF/DKIM handled by Resend, delivery infrastructure, React email templates |
| Booking idempotency | Custom event log table | UNIQUE constraint on `bookings.stripe_payment_intent_id` (already in schema) | Schema already enforces at DB level; supplemented by application-level check |
| Calendar availability generation | Custom slot calculator | `getAvailableSlots()` in `availabilityService.ts` (already exists) | Already tested, handles weekends, slot duration, boundary math |
| Multi-step form state | Redux/Zustand | React `useState` + step enum | Form state is local; over-engineering with global store for a linear wizard |

**Key insight:** The largest risk in this phase is the Stripe webhook plumbing — raw body, signature verification, and idempotency. Don't deviate from the `request.text()` + `constructEvent` pattern. The existing codebase already has ICS generation, CalDAV fetching, and slot calculation — Phase 3 assembles rather than rebuilds.

---

## Common Pitfalls

### Pitfall 1: Stripe Webhook Body Parsing
**What goes wrong:** Calling `await request.json()` before `constructEvent()` returns a `400 No signatures found` or `WebhookSignatureVerificationError`.
**Why it happens:** Next.js App Router does NOT parse the body automatically, but calling `.json()` reads the stream and prevents `.text()` from getting the raw bytes. The stream can only be consumed once.
**How to avoid:** Always call `const body = await request.text()` as the FIRST line of the webhook POST handler. Never call `.json()` in the webhook route.
**Warning signs:** `stripe.webhooks.constructEvent` throwing `TypeError: No signatures found matching the expected signature for payload`.

### Pitfall 2: Duplicate Booking on Webhook Retry
**What goes wrong:** Stripe retries webhooks on 5xx or timeout. Without idempotency check, a second webhook fires a second DB insert and second confirmation email.
**Why it happens:** Stripe guarantees at-least-once delivery, not exactly-once.
**How to avoid:** Two-layer defense: (1) application-level `SELECT` before `INSERT`, (2) DB-level `UNIQUE` constraint on `stripe_payment_intent_id` catches race conditions. The `payments` table also has a UNIQUE constraint on `stripe_payment_intent_id`.
**Warning signs:** Client reports receiving duplicate confirmation emails; admin shows two bookings for same date.

### Pitfall 3: All-Day CalDAV Event Timezone Mismatch (BUG-01)
**What goes wrong:** An all-day blocking event (e.g., "Out of office — March 20") still shows slots as available on March 20.
**Why it happens:** `ical.js` converts `DTSTART;VALUE=DATE:20260320` to `2026-03-20T00:00:00.000Z` (UTC midnight). In Mountain Time (UTC-6 or UTC-7), this is March 19 at 5 PM or 6 PM. `startOfDay(day)` without timezone awareness uses UTC, so the event may be bucketed to March 19 instead of March 20.
**How to avoid:** Use `date-fns-tz` `toZonedTime` when computing day buckets in `_fetchServerAvailability`. Convert both the calendar day and the event times to Mountain Time before filtering.
**Warning signs:** Slots appear on days with all-day blocking events; BUG-01 acceptance criteria fails.

### Pitfall 4: `?pkg=` Pre-Selection and Package Dropdown Sync
**What goes wrong:** `?pkg=portrait` pre-selects a package in state, but the dropdown shows "Select a package" because it's a controlled component initialized to empty string.
**Why it happens:** `useSearchParams()` in Next.js App Router is available client-side; must initialize form state from the param value, not empty string.
**How to avoid:** In `PhotographyBookingForm`, read `useSearchParams().get('pkg')`, find matching package by a `slug` field, and initialize `selectedPackage` state with it. The `photographyPackages` array currently has no `slug` field — either add one (e.g., `'portrait-session'`) or match by lowercased name.

### Pitfall 5: Resend Domain Not Verified
**What goes wrong:** `resend.emails.send()` returns `403 Domain not verified` or email goes to spam.
**Why it happens:** Resend requires SPF + DKIM DNS records before the `from` domain can send.
**How to avoid:** Wave 0 setup task: add Resend domain verification DNS records for `psunproduction.com` (or `photography.psunproduction.com`) before any email sending is tested.
**Warning signs:** Resend dashboard shows `Domain: Unverified`; emails fail to send or land in spam.

### Pitfall 6: Success Page Reads Stale or Missing Session Cookie
**What goes wrong:** `/photography/book/success` shows blank booking details because the iron-session cookie was not set before the Stripe redirect.
**Why it happens:** The Stripe redirect happens in the browser — iron-session cookie must be set server-side before the redirect, in the checkout session creation route.
**How to avoid:** In the `/api/checkout` POST handler, after creating the Stripe session, write booking context to iron-session and set the cookie. The success page then reads from session. Alternatively, use `session_id={CHECKOUT_SESSION_ID}` in the success URL and call `stripe.checkout.sessions.retrieve(session_id)` server-side on the success page to get booking details without a session cookie.

**Recommended approach for success page data:** Pass `?session_id={CHECKOUT_SESSION_ID}` in `success_url` (Stripe substitutes the real session ID) and retrieve session details server-side on the success page. This avoids iron-session entirely for the success page and is simpler. Iron-session is still useful if you want to preserve form state for a cancelled flow.

---

## Code Examples

Verified patterns from official sources and existing codebase:

### Stripe Singleton Client
```typescript
// src/lib/stripe.ts
// Pattern consistent with Stripe docs + existing session.ts singleton pattern
import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-01-27.acacia',   // latest stable — verify with: stripe.apiVersion
  typescript: true,
});
```

### Resend Attachment with ICS Content Type
```typescript
// Source: https://resend.com/docs/dashboard/emails/attachments
// Attachment content is base64 string; content_type explicitly set for Outlook compatibility
attachments: [
  {
    filename: 'session.ics',
    content: Buffer.from(icsContent).toString('base64'),
    content_type: 'text/calendar; method=REQUEST',
  },
],
```

### Drizzle Idempotent Booking Insert
```typescript
// Source: existing schema.ts + drizzle-orm patterns
// stripePaymentIntentId has UNIQUE constraint — insert will throw on duplicate
// Application-level check first (avoids uncaught DB error):
const [existing] = await db.select({ id: bookings.id })
  .from(bookings)
  .where(eq(bookings.stripePaymentIntentId, paymentIntentId))
  .limit(1);

if (existing) return; // idempotent exit

const [booking] = await db.insert(bookings).values({ ... }).returning();
```

### BUG-03 Fix (Exact Diff)
```typescript
// BookingForm.tsx — change these two lines:

// Line 60 — add setLoadedMonths to destructuring:
const [loadedMonths, setLoadedMonths] = useState<Set<string>>(() => { ... });

// Line 126 — replace mutation with functional update:
// BEFORE: loadedMonths.add(monthKey);
// AFTER:
setLoadedMonths(prev => new Set([...prev, monthKey]));
```

### Pending Reservation Cleanup (Discretion Area)
```typescript
// Cleanup strategy: inline in any route that reads pending_reservations
// Delete expired rows before inserting new ones or checking conflicts
await db.delete(pendingReservations)
  .where(lt(pendingReservations.expiresAt, new Date()));
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Pages Router `req.body` for webhooks | App Router `request.text()` for raw body | Next.js 13 App Router | Must use `request.text()` not `request.json()` in webhook route |
| Separate Stripe Price objects required | `price_data` inline in Checkout session | Stripe Checkout API | No Stripe dashboard setup needed per package |
| `stripe.webhooks.constructEvent` (sync) | `stripe.webhooks.constructEventAsync` (async) | Stripe Node SDK v10+ | Use async version in async route handlers |
| `iron-session` v6 `withIronSessionApiRoute` | `iron-session` v8 `getIronSession(cookies(), opts)` | iron-session v8 (2023) | Must use `cookies()` from `next/headers` — already done in existing `session.ts` |

**Deprecated/outdated:**
- `next-iron-session` package: replaced by `iron-session` v8 — project already uses v8
- Pages Router `/api/stripe/webhook` with `bodyParser: false` config export: not needed in App Router — App Router route handlers don't parse body automatically

---

## Open Questions

1. **Package `slug` field for `?pkg=` URL param**
   - What we know: `photographyPackages` in `photography.ts` has `id` (integer) and `name` (string) but no `slug` field
   - What's unclear: Should the URL param use numeric ID (`?pkg=1`) or a slug string (`?pkg=portrait-session`)?
   - Recommendation: Add a `slug` field to the `Package` interface and `photographyPackages` array in `photography.ts` (e.g., `portrait-session`, `event-coverage`, `landscape-half-day`). Keep it in the static data file, not in the DB. The URL is client-facing and slug is more readable.

2. **Success page booking data source**
   - What we know: Stripe passes `{CHECKOUT_SESSION_ID}` in success_url; session can be retrieved server-side
   - What's unclear: Should success page use iron-session cookie (set during checkout creation) or Stripe session retrieve?
   - Recommendation: Use `stripe.checkout.sessions.retrieve(session_id)` on the success page — no iron-session required for success page, simpler, and avoids cookie lifetime issues. Iron-session remains only for admin auth.

3. **Photography subdomain URL in checkout session**
   - What we know: `success_url` and `cancel_url` need the full URL (`https://photography.philipsun.com/...`)
   - What's unclear: Is `NEXT_PUBLIC_PHOTOGRAPHY_URL` env var already defined?
   - Recommendation: Add `NEXT_PUBLIC_PHOTOGRAPHY_URL=https://photography.philipsun.com` to env vars. For local dev, use `http://localhost:3000`. The checkout session creation route should use this env var.

4. **`photographyPackages` as DB lookup vs static data**
   - What we know: Schema has a `packages` table; `photography.ts` has hardcoded packages with matching fields
   - What's unclear: Should the checkout route look up packages from the DB `packages` table or from `photographyPackages` static array?
   - Recommendation: Use the static `photographyPackages` array from `photography.ts` for the checkout session creation (faster, no DB round-trip). The DB `packages` table is for admin/CRM reporting. The webhook handler can use `meta.packageId` to match the static array.

---

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest 4.0.18 + React Testing Library 16.3.2 |
| Config file | `vitest.config.ts` (project root) |
| Quick run command | `npx vitest run src/app/__tests__/booking.test.tsx` |
| Full suite command | `npx vitest run` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| PHOTO-03 | `PhotographyBookingForm` renders step 1 (package select) | unit | `npx vitest run src/app/__tests__/booking.test.tsx` | ❌ Wave 0 |
| PHOTO-03 | `PhotographyBookingForm` advances steps correctly (package → date → time → details) | unit | `npx vitest run src/app/__tests__/booking.test.tsx` | ❌ Wave 0 |
| PHOTO-03 | `?pkg=portrait-session` pre-selects package in form state | unit | `npx vitest run src/app/__tests__/booking.test.tsx` | ❌ Wave 0 |
| PHOTO-04 | `sendBookingConfirmationEmail` called after `checkout.session.completed` | unit | `npx vitest run src/app/__tests__/webhook.test.ts` | ❌ Wave 0 |
| PHOTO-04 | Webhook handler is idempotent (duplicate event does not insert twice) | unit | `npx vitest run src/app/__tests__/webhook.test.ts` | ❌ Wave 0 |
| BUG-01 | `getAvailableSlots` returns no slots for a day with an all-day blocking event | unit | `npx vitest run src/app/__tests__/availability.test.ts` | ❌ Wave 0 |
| BUG-01 | Mountain-Time date bucket correctly assigns events near day boundaries | unit | `npx vitest run src/app/__tests__/availability.test.ts` | ❌ Wave 0 |
| BUG-03 | Month navigation in `BookingForm` does not re-fetch an already-loaded month | unit | `npx vitest run src/app/__tests__/booking-form.test.tsx` | ❌ Wave 0 |

### Sampling Rate
- **Per task commit:** `npx vitest run src/app/__tests__/` (all test files, < 30s)
- **Per wave merge:** `npx vitest run` (full suite)
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `src/app/__tests__/booking.test.tsx` — covers PHOTO-03: PhotographyBookingForm step render + navigation + `?pkg=` pre-selection
- [ ] `src/app/__tests__/webhook.test.ts` — covers PHOTO-04: webhook handler idempotency + email trigger
- [ ] `src/app/__tests__/availability.test.ts` — covers BUG-01: all-day event slot blocking + Mountain Time bucketing
- [ ] `src/app/__tests__/booking-form.test.tsx` — covers BUG-03: Set immutability in `BookingForm` month navigation

---

## Sources

### Primary (HIGH confidence)
- [Stripe Checkout Session Create API](https://docs.stripe.com/api/checkout/sessions/create) — `price_data`, `metadata`, `success_url`, `cancel_url` fields
- [Stripe Webhooks Verification](https://docs.stripe.com/webhooks) — `constructEventAsync`, `Stripe-Signature` header, `request.text()` requirement
- [Stripe Checkout Fulfillment](https://docs.stripe.com/checkout/fulfillment) — `checkout.session.completed` event, idempotency pattern
- [Stripe Metadata](https://docs.stripe.com/metadata) — 50 key-value pairs max, 40-char keys, 500-char values
- [Resend Attachments Dashboard](https://resend.com/docs/dashboard/emails/attachments) — `content`, `filename`, `content_type` fields; 40MB limit
- Existing codebase: `src/lib/serverCalendar.ts`, `src/lib/availabilityService.ts`, `src/lib/icsService.ts`, `src/db/schema.ts`, `src/lib/session.ts` — verified by direct inspection
- `npm view stripe version` / `npm view resend version` — package versions verified 2026-03-19
- RFC 5545 §3.6.1 via iCalendar.org — DTEND exclusive boundary for all-day events

### Secondary (MEDIUM confidence)
- [Resend ICS GitHub Issue #198](https://github.com/resend/resend-node/issues/198) — `content_type: 'text/calendar; method=REQUEST'` needed for Outlook compatibility
- [Next.js App Router Stripe webhook `request.text()` pattern](https://medium.com/@gragson.john/stripe-checkout-and-webhook-in-a-next-js-15-2025-925d7529855e) — verified by multiple community sources and Stripe docs
- [iron-session v8 App Router pattern](https://github.com/renchris/app-router-iron-session) — consistent with existing `src/lib/session.ts` implementation

### Tertiary (LOW confidence)
- Community guidance on Resend ICS `content_type` for Outlook — needs testing; Gmail likely works with `text/calendar` alone

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — stripe and resend npm versions verified; all other packages already installed
- Architecture: HIGH — Stripe API verified via official docs; Resend attachment format verified via docs; webhook raw body pattern verified by multiple authoritative sources
- Pitfalls: HIGH — webhook body parsing (verified), idempotency (official Stripe docs), BUG-01 root cause (verified against RFC 5545 + ical.js source), BUG-03 (verified by reading BookingForm.tsx source)
- Resend ICS Outlook compatibility: MEDIUM — GitHub issue suggests `text/calendar; method=REQUEST`; cannot verify without testing

**Research date:** 2026-03-19
**Valid until:** 2026-04-19 (Stripe and Resend APIs are stable; 30-day window safe)

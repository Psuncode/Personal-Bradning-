# Photography Landing Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reposition `/photography` into an SEO-first couples-and-portraits landing page, repair the booking path, and add the first supporting SEO page.

**Architecture:** Keep the existing photography route group and booking infrastructure, but narrow the content model and page composition around one service offer: Utah couples and portraits. Implement the funnel in layers: update shared photography data first, rewrite the landing page and supporting route metadata next, then harden the booking flow and add credibility content before shipping one child SEO page.

**Tech Stack:** Next.js App Router, React Server Components, TypeScript, Vitest, Testing Library, Lucide React

---

## File Structure

### Modify

- `src/data/photography.ts`
  - Replace broad package/gallery positioning with couples-and-portraits-first data that can power the landing page, pricing page, gallery, and future SEO page.
- `src/app/(photography)/photography/page.tsx`
  - Rewrite the landing page into a service funnel with SEO copy, curated proof, pricing snapshot, process, FAQ, and CTA hierarchy.
- `src/app/(photography)/photography/pricing/page.tsx`
  - Align pricing copy and package emphasis with couples + portraits instead of broad photography categories.
- `src/app/(photography)/photography/gallery/page.tsx`
  - Keep gallery broad, but reposition it as archive/supporting proof rather than the main service promise.
- `src/app/(photography)/photography/book/page.tsx`
  - Align booking page copy with the landing page promise and add fallback inquiry messaging if availability/payment issues occur.
- `src/components/booking/PhotographyBookingForm.tsx`
  - Repair package selection defaults, date/time/error states, and couples-and-portraits package presentation.
- `src/app/sitemap.ts`
  - Add the supporting SEO page once implemented.

### Create

- `src/app/(photography)/photography/page.test.tsx`
  - Assert the landing page renders the new H1, local-service copy, and CTA hierarchy.
- `src/app/(photography)/photography/book/page.test.tsx`
  - Assert the booking page exposes the new context and fallback copy.
- `src/app/(photography)/photography/couples/page.tsx`
  - Add the first supporting SEO page linked from the hub.
- `src/app/(photography)/photography/couples/page.test.tsx`
  - Assert the supporting page renders distinct, non-thin couples-focused content.

### Test Existing

- `src/app/__tests__/booking.test.tsx`
  - Update package assumptions and add failure-state coverage for the booking flow.
- `src/app/(photography)/photography/pricing/page.test.tsx`
  - Keep package-data assertions aligned with the new photography data model.

---

### Task 1: Narrow The Photography Data Model

**Files:**
- Modify: `src/data/photography.ts`
- Modify: `src/app/(photography)/photography/pricing/page.test.tsx`

- [ ] **Step 1: Write the failing data test for couples-and-portraits-first packages**

Add this test block to `src/app/(photography)/photography/pricing/page.test.tsx`:

```tsx
it('prioritizes couples and portrait packages for the funnel', async () => {
  const { photographyPackages } = await import('@/data/photography');

  const slugs = photographyPackages.map((pkg) => pkg.slug);

  expect(slugs).toContain('couples-session');
  expect(slugs).toContain('portrait-session');
  expect(slugs).not.toContain('landscape-half-day');
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/app/(photography)/photography/pricing/page.test.tsx`
Expected: FAIL because `couples-session` does not exist and `landscape-half-day` is still present.

- [ ] **Step 3: Update the photography data to match the new service focus**

Replace the package portion of `src/data/photography.ts` with this structure:

```ts
export type PhotoCategory = 'couples' | 'portrait' | 'event' | 'landscape';

export interface Package {
  id: number;
  name: string;
  slug: string;
  description: string;
  priceInCents: number;
  depositInCents: number;
  durationMinutes: number;
  category: 'couples' | 'portrait';
  turnaround: string;
  featured?: boolean;
}

export const photographyPackages: Package[] = [
  {
    id: 1,
    slug: 'couples-session',
    name: 'Couples Session',
    description: 'A relaxed outdoor session for engagements, anniversaries, and just-because photos.',
    priceInCents: 32500,
    depositInCents: 10000,
    durationMinutes: 75,
    category: 'couples',
    turnaround: '7-10 days',
    featured: true,
  },
  {
    id: 2,
    slug: 'portrait-session',
    name: 'Portrait Session',
    description: 'Guided portraits for seniors, headshots, graduation, and personal branding.',
    priceInCents: 25000,
    depositInCents: 7500,
    durationMinutes: 60,
    category: 'portrait',
    turnaround: '7-10 days',
  },
  {
    id: 3,
    slug: 'extended-portrait-session',
    name: 'Extended Portrait Session',
    description: 'Extra time for outfit changes, multiple nearby locations, and a larger final gallery.',
    priceInCents: 42500,
    depositInCents: 12500,
    durationMinutes: 105,
    category: 'portrait',
    turnaround: '7-10 days',
  },
];
```

- [ ] **Step 4: Add curated gallery categories that support the new landing page**

Update the category exports in `src/data/photography.ts` to this shape:

```ts
export const photoCategories: { value: PhotoCategory; label: string }[] = [
  { value: 'couples', label: 'Couples' },
  { value: 'portrait', label: 'Portraits' },
  { value: 'event', label: 'Events' },
  { value: 'landscape', label: 'Landscapes' },
];
```

Also update any gallery seed objects that currently use `portrait` but are intended for couples so the landing page can filter featured work cleanly.

- [ ] **Step 5: Run the data tests to verify they pass**

Run: `npm test -- src/app/(photography)/photography/pricing/page.test.tsx`
Expected: PASS with all package assertions green.

- [ ] **Step 6: Commit**

```bash
git add src/data/photography.ts src/app/(photography)/photography/pricing/page.test.tsx
git commit -m "feat: refocus photography data on couples and portraits"
```

---

### Task 2: Rewrite `/photography` Into The Service Landing Page

**Files:**
- Modify: `src/app/(photography)/photography/page.tsx`
- Create: `src/app/(photography)/photography/page.test.tsx`

- [ ] **Step 1: Write the failing landing-page test**

Create `src/app/(photography)/photography/page.test.tsx` with:

```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import PhotographyPage from '@/app/(photography)/photography/page';

vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: any) => <a href={href} {...props}>{children}</a>,
}));

vi.mock('next/image', () => ({
  default: ({ alt, ...props }: any) => <img alt={alt} {...props} />,
}));

describe('Photography landing page', () => {
  it('renders Utah couples and portrait positioning with the primary CTAs', () => {
    render(<PhotographyPage />);

    expect(screen.getByRole('heading', { level: 1, name: /Utah Couples & Portrait Photographer/i })).toBeDefined();
    expect(screen.getByText(/Serving Provo, Utah County, and Salt Lake City/i)).toBeDefined();
    expect(screen.getByRole('link', { name: /Book a Session/i })).toBeDefined();
    expect(screen.getByRole('link', { name: /View Pricing/i })).toBeDefined();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/app/(photography)/photography/page.test.tsx`
Expected: FAIL because the current page uses broad photography copy and does not render the new heading or local copy.

- [ ] **Step 3: Replace the page metadata and hero with SEO-first copy**

Update the top of `src/app/(photography)/photography/page.tsx` to:

```tsx
export const metadata: Metadata = {
  title: 'Philip Sun Photography | Utah Couples & Portrait Photographer',
  description:
    'Utah couples and portrait photography by Philip Sun. Relaxed sessions for couples, graduates, and personal portraits in Provo, Utah County, and Salt Lake City.',
};
```

Replace the current hero heading and subcopy with:

```tsx
<p className="text-sm font-medium tracking-[0.2em] text-gray-400 uppercase mb-4">
  Serving Provo, Utah County, and Salt Lake City
</p>
<h1 className="font-[family-name:var(--font-playfair)] text-5xl md:text-7xl font-bold text-white leading-[1.05] mb-6 max-w-4xl">
  Utah Couples & Portrait Photographer
</h1>
<p className="text-lg text-gray-300 max-w-2xl mb-10 leading-relaxed">
  Natural, guided photos for couples, graduates, and personal portraits that feel relaxed,
  personal, and actually look like you.
</p>
```

- [ ] **Step 4: Replace broad specialty sections with funnel sections**

In `src/app/(photography)/photography/page.tsx`, remove the `specialties` section and replace it with these sections in order:

```tsx
// Selected Work
// Why Work With Me
// Pricing Snapshot
// Process
// FAQ
// Final CTA
```

Use these section headings and copy anchors:

```tsx
<h2>Selected Couples & Portrait Sessions</h2>
<h2>Why Shoot With Me</h2>
<h2>Simple Pricing</h2>
<h2>What To Expect</h2>
<h2>Questions Clients Usually Ask</h2>
<h2>Ready To Plan Your Session?</h2>
```

For the “Why Shoot With Me” bullets, include:

```tsx
[
  'No awkward posing or modeling experience required',
  'Guided direction so you know exactly what to do',
  'Fast turnaround and simple booking',
  'Student-friendly, transparent pricing',
]
```

- [ ] **Step 5: Keep gallery breadth secondary, not primary**

Within the landing page, filter featured work to couples and portrait categories only:

```tsx
const featuredPhotos = galleryPhotos.filter(
  (photo) => photo.category === 'couples' || photo.category === 'portrait'
).slice(0, 5);
```

Keep the gallery CTA, but relabel any broad copy so the full archive reads as a supporting route:

```tsx
<Link href="/photography/gallery">Browse Full Gallery</Link>
```

- [ ] **Step 6: Run landing-page test and a focused route smoke test**

Run:
- `npm test -- src/app/(photography)/photography/page.test.tsx`
- `npm test -- src/app/__tests__/home.test.tsx`

Expected:
- photography landing page test PASS
- main homepage tests remain PASS

- [ ] **Step 7: Commit**

```bash
git add src/app/(photography)/photography/page.tsx src/app/(photography)/photography/page.test.tsx
git commit -m "feat: turn photography page into couples portrait landing page"
```

---

### Task 3: Align Pricing And Gallery With The New Funnel

**Files:**
- Modify: `src/app/(photography)/photography/pricing/page.tsx`
- Modify: `src/app/(photography)/photography/gallery/page.tsx`

- [ ] **Step 1: Update pricing page metadata and copy**

In `src/app/(photography)/photography/pricing/page.tsx`, replace metadata and intro copy with:

```tsx
export const metadata: Metadata = {
  title: 'Photography Pricing | Philip Sun Photography',
  description: 'Simple pricing for couples and portrait sessions in Utah, with deposits, turnaround, and booking links.',
};
```

```tsx
<h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Couples & Portrait Pricing</h1>
<p className="text-gray-600 mb-12 max-w-2xl">
  Clear pricing for Utah couples and portrait sessions. Every package includes guided posing,
  edited images, and an online gallery.
</p>
```

- [ ] **Step 2: Add turnaround and qualifying copy to the package cards**

Inside the pricing card rendering, add:

```tsx
<p className="text-sm text-gray-500 mt-2">Turnaround: {pkg.turnaround}</p>
```

Keep the “Book Now” link pointing to `/photography/book?pkg=${pkg.slug}`.

- [ ] **Step 3: Reposition the gallery as the archive**

In `src/app/(photography)/photography/gallery/page.tsx`, update metadata and intro copy to:

```tsx
export const metadata: Metadata = {
  title: 'Photography Gallery | Philip Sun Photography',
  description: 'Browse couples, portraits, events, and landscape photography by Philip Sun.',
};
```

```tsx
<p className="text-xs font-medium tracking-widest text-gray-400 uppercase mb-3">
  Full Archive
</p>
<h1 className="font-[family-name:var(--font-playfair)] text-4xl md:text-5xl font-bold text-gray-900 mb-3">
  Photography Gallery
</h1>
<p className="text-gray-500 max-w-xl text-sm leading-relaxed">
  Couples and portraits are the main focus of the photography experience, with selected event and
  landscape work collected here as part of the broader archive.
</p>
```

- [ ] **Step 4: Run focused route tests**

Run:
- `npm test -- src/app/(photography)/photography/pricing/page.test.tsx`

Expected:
- PASS with pricing data still valid after the content changes

- [ ] **Step 5: Commit**

```bash
git add src/app/(photography)/photography/pricing/page.tsx src/app/(photography)/photography/gallery/page.tsx
git commit -m "feat: align photography pricing and gallery with landing funnel"
```

---

### Task 4: Repair The Booking Flow And Fallback States

**Files:**
- Modify: `src/components/booking/PhotographyBookingForm.tsx`
- Modify: `src/app/(photography)/photography/book/page.tsx`
- Modify: `src/app/__tests__/booking.test.tsx`
- Create: `src/app/(photography)/photography/book/page.test.tsx`

- [ ] **Step 1: Add a failing booking-page copy test**

Create `src/app/(photography)/photography/book/page.test.tsx`:

```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import BookingPage from '@/app/(photography)/photography/book/page';

vi.mock('@/lib/serverCalendar', () => ({
  getServerAvailability: vi.fn().mockResolvedValue({ events: [], error: null }),
}));

vi.mock('@/components/booking/PhotographyBookingForm', () => ({
  PhotographyBookingForm: () => <div>Mock Booking Form</div>,
}));

describe('Photography booking page', () => {
  it('frames the booking flow around couples and portrait sessions', async () => {
    const Page = await BookingPage();
    render(Page);

    expect(screen.getByRole('heading', { level: 1, name: /Book a Couples or Portrait Session/i })).toBeDefined();
    expect(screen.getByText(/If scheduling gives you trouble, send an inquiry and I will follow up directly/i)).toBeDefined();
  });
});
```

- [ ] **Step 2: Add failing booking-form coverage for the new packages and error state**

Append this test to `src/app/__tests__/booking.test.tsx`:

```tsx
it('shows couples session as an available package and exposes recovery copy when calendar loading fails', async () => {
  const calendar = await import('@/lib/icalendarService');
  (calendar.fetchICloudEvents as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error('calendar down'));

  render(
    <PhotographyBookingForm
      initialData={{ events: [], error: 'calendar failed' } as any}
    />
  );

  expect(screen.getByText('Couples Session')).toBeDefined();
  expect(screen.getByText(/busy days may not appear blocked/i)).toBeDefined();
});
```

- [ ] **Step 3: Run booking tests to verify they fail**

Run:
- `npm test -- src/app/__tests__/booking.test.tsx`
- `npm test -- src/app/(photography)/photography/book/page.test.tsx`

Expected:
- FAIL because the package set and booking-page copy do not match the new funnel yet

- [ ] **Step 4: Update booking page copy and add fallback inquiry messaging**

In `src/app/(photography)/photography/book/page.tsx`, replace the title and intro copy with:

```tsx
<h1 className="font-[family-name:var(--font-playfair)] text-3xl md:text-4xl font-bold text-gray-900 mb-4">
  Book a Couples or Portrait Session
</h1>
<p className="text-gray-500 text-sm leading-relaxed mb-8">
  Choose your package, pick a date, and reserve your session. If scheduling gives you trouble,
  send an inquiry and I will follow up directly.
</p>
```

Update the `howItWorks` array to:

```tsx
const howItWorks = [
  'Choose a couples or portrait package',
  'Pick a date and preferred time',
  'Pay the deposit to reserve your session',
  'Receive confirmation and planning details',
];
```

- [ ] **Step 5: Repair the booking form assumptions**

In `src/components/booking/PhotographyBookingForm.tsx`, update the package and error presentation so it:

```tsx
// shows the couples-focused package list from the new data model
// preserves URL-based preselection with ?pkg=couples-session
// keeps the warning banner visible when initialData.error exists
// renders a fallback sentence below the warning:
// "If this calendar looks wrong, send an inquiry and I will confirm availability manually."
```

Add the fallback sentence near the existing `calendarError` UI with:

```tsx
<p className="mt-2 text-xs text-amber-700">
  If this calendar looks wrong, send an inquiry and I will confirm availability manually.
</p>
```

- [ ] **Step 6: Run booking tests to verify they pass**

Run:
- `npm test -- src/app/__tests__/booking.test.tsx`
- `npm test -- src/app/(photography)/photography/book/page.test.tsx`

Expected:
- PASS with updated copy, packages, and error-state messaging

- [ ] **Step 7: Commit**

```bash
git add src/components/booking/PhotographyBookingForm.tsx src/app/(photography)/photography/book/page.tsx src/app/__tests__/booking.test.tsx src/app/(photography)/photography/book/page.test.tsx
git commit -m "fix: repair photography booking flow messaging and package states"
```

---

### Task 5: Add Credibility Copy To Support SEO And Conversion

**Files:**
- Modify: `src/app/(photography)/photography/page.tsx`
- Modify: `src/data/photography.ts`

- [ ] **Step 1: Add structured testimonial and FAQ content to shared data**

Extend `src/data/photography.ts` with:

```ts
export const photographyTestimonials = [
  {
    name: 'Couples Client',
    quote: 'He made us feel comfortable right away and the photos looked natural instead of stiff.',
  },
  {
    name: 'Portrait Client',
    quote: 'The direction was clear, the turnaround was fast, and the final gallery was exactly what I needed.',
  },
];

export const photographyFaqs = [
  {
    question: 'Where do you shoot in Utah?',
    answer: 'Most sessions happen in Provo, Utah County, and Salt Lake City, with location planning based on the look you want.',
  },
  {
    question: 'Do you help with posing?',
    answer: 'Yes. Every session is guided, so you do not need modeling experience to get relaxed, natural photos.',
  },
  {
    question: 'How long does it take to get the photos back?',
    answer: 'Most couples and portrait sessions are delivered within 7 to 10 days through an online gallery.',
  },
];
```

- [ ] **Step 2: Render testimonials and FAQs on the landing page**

In `src/app/(photography)/photography/page.tsx`, render:

```tsx
<section aria-labelledby="testimonials-heading">
  <h2 id="testimonials-heading">What Clients Say</h2>
</section>

<section aria-labelledby="faq-heading">
  <h2 id="faq-heading">Questions Clients Usually Ask</h2>
</section>
```

Map `photographyTestimonials` and `photographyFaqs` into these sections instead of hardcoding copy in the page component.

- [ ] **Step 3: Run the landing-page test suite**

Run:
- `npm test -- src/app/(photography)/photography/page.test.tsx`

Expected:
- PASS with the landing page still rendering the required positioning and CTA content

- [ ] **Step 4: Commit**

```bash
git add src/data/photography.ts src/app/(photography)/photography/page.tsx
git commit -m "feat: add photography testimonials and faq content"
```

---

### Task 6: Ship The First Supporting SEO Page

**Files:**
- Create: `src/app/(photography)/photography/couples/page.tsx`
- Create: `src/app/(photography)/photography/couples/page.test.tsx`
- Modify: `src/app/(photography)/photography/page.tsx`
- Modify: `src/app/sitemap.ts`

- [ ] **Step 1: Write the failing test for the supporting page**

Create `src/app/(photography)/photography/couples/page.test.tsx`:

```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import CouplesPhotographyPage from '@/app/(photography)/photography/couples/page';

vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: any) => <a href={href} {...props}>{children}</a>,
}));

describe('Couples photography page', () => {
  it('renders distinct couples-focused local SEO copy', () => {
    render(<CouplesPhotographyPage />);

    expect(screen.getByRole('heading', { level: 1, name: /Utah Couples Photography/i })).toBeDefined();
    expect(screen.getByText(/engagements, anniversaries, and everyday couples sessions/i)).toBeDefined();
    expect(screen.getByRole('link', { name: /Book a Couples Session/i })).toBeDefined();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/app/(photography)/photography/couples/page.test.tsx`
Expected: FAIL because the supporting page does not exist yet.

- [ ] **Step 3: Create the supporting page**

Create `src/app/(photography)/photography/couples/page.tsx` with:

```tsx
import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Utah Couples Photography | Philip Sun Photography',
  description:
    'Couples photography in Provo, Utah County, and Salt Lake City for engagements, anniversaries, and natural everyday sessions.',
};

export default function CouplesPhotographyPage() {
  return (
    <div className="py-16 px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <p className="text-xs font-medium tracking-widest text-gray-400 uppercase mb-3">
          Couples Photography
        </p>
        <h1 className="font-[family-name:var(--font-playfair)] text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          Utah Couples Photography
        </h1>
        <p className="text-gray-600 leading-relaxed mb-8">
          I photograph engagements, anniversaries, and everyday couples sessions across Provo,
          Utah County, and Salt Lake City with guided direction and relaxed prompts.
        </p>
        <div className="flex gap-3">
          <Link href="/photography/book?pkg=couples-session">Book a Couples Session</Link>
          <Link href="/photography">Back to Photography</Link>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Link the hub page to the supporting page and add sitemap coverage**

In `src/app/(photography)/photography/page.tsx`, add a supporting internal link:

```tsx
<Link href="/photography/couples" className="text-sm font-medium text-gray-600 underline underline-offset-4">
  Looking specifically for couples sessions?
</Link>
```

In `src/app/sitemap.ts`, add:

```ts
{
  url: `${siteConfig.url}/photography/couples`,
  lastModified: new Date(),
  changeFrequency: 'monthly',
  priority: 0.7,
},
```

- [ ] **Step 5: Run supporting-page tests**

Run:
- `npm test -- src/app/(photography)/photography/couples/page.test.tsx`
- `npm test -- src/app/(photography)/photography/page.test.tsx`

Expected:
- PASS with the child page live and linked from the hub

- [ ] **Step 6: Commit**

```bash
git add src/app/(photography)/photography/couples/page.tsx src/app/(photography)/photography/couples/page.test.tsx src/app/(photography)/photography/page.tsx src/app/sitemap.ts
git commit -m "feat: add couples photography support page"
```

---

### Task 7: Final Verification

**Files:**
- No code changes expected

- [ ] **Step 1: Run the focused photography test suite**

Run:

```bash
npm test -- src/app/(photography)/photography/page.test.tsx src/app/(photography)/photography/book/page.test.tsx src/app/(photography)/photography/couples/page.test.tsx src/app/(photography)/photography/pricing/page.test.tsx src/app/__tests__/booking.test.tsx
```

Expected:
- PASS with no failing route or booking tests

- [ ] **Step 2: Run the broader smoke tests that touch adjacent navigation**

Run:

```bash
npm test -- src/app/__tests__/home.test.tsx src/components/layout/navbar.test.tsx
```

Expected:
- PASS with the main site navigation still intact

- [ ] **Step 3: Build the app**

Run:

```bash
npm run build
```

Expected:
- Next.js production build succeeds without route or metadata errors

- [ ] **Step 4: Review diff and commit**

Run:

```bash
git status --short
git diff -- src/data/photography.ts src/app/(photography)/photography/page.tsx src/app/(photography)/photography/pricing/page.tsx src/app/(photography)/photography/gallery/page.tsx src/app/(photography)/photography/book/page.tsx src/components/booking/PhotographyBookingForm.tsx src/app/sitemap.ts src/app/(photography)/photography/page.test.tsx src/app/(photography)/photography/book/page.test.tsx src/app/(photography)/photography/couples/page.tsx src/app/(photography)/photography/couples/page.test.tsx src/app/__tests__/booking.test.tsx src/app/(photography)/photography/pricing/page.test.tsx
```

Expected:
- only the planned photography funnel files are changed

- [ ] **Step 5: Commit**

```bash
git add src/data/photography.ts src/app/(photography)/photography/page.tsx src/app/(photography)/photography/pricing/page.tsx src/app/(photography)/photography/gallery/page.tsx src/app/(photography)/photography/book/page.tsx src/components/booking/PhotographyBookingForm.tsx src/app/sitemap.ts src/app/(photography)/photography/page.test.tsx src/app/(photography)/photography/book/page.test.tsx src/app/(photography)/photography/couples/page.tsx src/app/(photography)/photography/couples/page.test.tsx src/app/__tests__/booking.test.tsx src/app/(photography)/photography/pricing/page.test.tsx
git commit -m "feat: ship photography landing page seo funnel"
```

---

## Self-Review

### Spec Coverage

- Landing-page repositioning: covered by Task 2
- Pricing and gallery alignment: covered by Task 3
- Booking-flow repair and fallback: covered by Task 4
- Credibility upgrades: covered by Task 5
- First SEO support page: covered by Task 6
- Verification and build confidence: covered by Task 7

### Placeholder Scan

- No `TBD`, `TODO`, or deferred implementation language remains in task steps
- Each code-changing task includes explicit file paths, code snippets, and verification commands

### Type Consistency

- `PhotoCategory` is expanded before route code depends on `couples`
- package slug `couples-session` is introduced in Task 1 before later tasks link to `/photography/book?pkg=couples-session`
- `turnaround`, `photographyTestimonials`, and `photographyFaqs` are defined in shared data before later page tasks consume them

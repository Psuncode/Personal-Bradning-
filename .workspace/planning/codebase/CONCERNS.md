# Codebase Concerns

**Analysis Date:** 2026-03-17

## Tech Debt

**Loose type declarations in tests:**
- Issue: Multiple test files use `any` type for mocked component props, reducing type safety in test code
- Files: `src/app/__tests__/home.test.tsx`, `src/app/__tests__/meet.test.tsx`, `src/app/__tests__/projects.test.tsx`, `src/app/__tests__/contact.test.tsx`, `src/components/sections/hero.test.tsx`, `src/components/sections/projects-grid.test.tsx`, `src/components/sections/contact-section.test.tsx`, `src/components/project-card.test.tsx`, `src/components/layout/navbar.test.tsx`, `src/components/layout/footer.test.tsx`, `src/components/section-heading.test.tsx`
- Impact: Mocked modules and component props bypass TypeScript's type checking, making tests less reliable for catching type-related bugs
- Fix approach: Replace `any` with proper TypeScript interfaces for mocked components, e.g., `React.ComponentType<{ children: React.ReactNode; href?: string }>`

**Untyped calendar data in BookingForm:**
- Issue: `availableSlots` and `selectedSlot` use generic `any` type instead of proper `TimeSlot` interface
- Files: `src/components/booking/BookingForm.tsx` (lines 39, 45, 150)
- Impact: Props and state lack type safety, making it difficult to refactor or debug slot selection logic
- Fix approach: Import `TimeSlot` interface from `src/lib/availabilityService.ts` and apply strict typing throughout the component

**Unused export in motion-wrapper:**
- Issue: `src/components/motion-wrapper.tsx` exports components that are not imported elsewhere in the codebase
- Files: `src/components/motion-wrapper.tsx`
- Impact: Dead code increases cognitive load during maintenance; unclear if exports are reserved for future features
- Fix approach: Document intent or remove unused exports; if reserved, add a comment explaining planned use

## Known Bugs

**State mutation risk in BookingForm:**
- Symptoms: The `loadedMonths` Set is mutated directly in the useEffect (line 125), which could cause unexpected behavior if the state update doesn't trigger a re-render
- Files: `src/components/booking/BookingForm.tsx` (line 125: `loadedMonths.add(monthKey)`)
- Trigger: Navigate to a new month after the initial render; the Set is updated without triggering state change
- Workaround: Currently works because the component re-renders on other state changes, but is fragile
- Fix approach: Convert `loadedMonths` to a state variable with `useState<Set<string>>` and create a new Set on each update, or use a different tracking mechanism

**Hardcoded organizer email in BookingForm:**
- Symptoms: Email field shows "ps324@byu.edu" hardcoded in multiple places (lines 173, 196)
- Files: `src/components/booking/BookingForm.tsx`
- Trigger: Every booking confirmation includes this email
- Impact: Not portable; requires code change if email changes
- Fix approach: Move email to `siteConfig` data file and import from `src/data/site-config.ts`

## Security Considerations

**Calendar credentials at risk:**
- Risk: Environment variables `ICAL_USERNAME`, `ICAL_PASSWORD`, `ICAL_SERVER`, `ICAL_CALENDAR_ID` are used in server-side code
- Files: `src/lib/serverCalendar.ts` (lines 33-36), `src/app/api/calendar/route.ts`
- Current mitigation: Stored as environment variables (not in code), server-side only access via Next.js API route
- Recommendations:
  - Document that these must be set in deployment environment
  - Consider adding rate limiting to `/api/calendar` endpoint to prevent credential abuse
  - Add request validation to ensure startDate/endDate are reasonable ranges (current code doesn't validate range bounds)

**Unvalidated date ranges in calendar API:**
- Risk: The calendar API accepts arbitrary `startDate` and `endDate` without validation
- Files: `src/app/api/calendar/route.ts` (lines 6-13)
- Current mitigation: Basic null checks only
- Recommendations:
  - Add validation to prevent queries outside 6-month window
  - Validate that startDate < endDate
  - Return 400 for invalid ranges

**Form submission via mailto fallback:**
- Risk: Contact form falls back to `mailto:` link when Formspree ID not configured; email/message data exposed in URL
- Files: `src/components/sections/contact-section.tsx` (line 27)
- Current mitigation: Fallback only triggers if env var not set
- Recommendations: Add explicit warning in comments that Formspree ID should be configured in production; consider removing mailto fallback in production builds

**Dynamic ICS content generation:**
- Risk: ICS file contains user-provided description field without sanitization
- Files: `src/components/booking/BookingForm.tsx` (line 170), `src/lib/icsService.ts`
- Current mitigation: ICS format is relatively safe, but multiline descriptions could theoretically be crafted maliciously
- Recommendations: Sanitize or truncate user description before including in ICS file

## Performance Bottlenecks

**Monthly calendar data accumulation:**
- Problem: BookingForm accumulates events from all fetched months in a single `monthEvents` array without cleanup
- Files: `src/components/booking/BookingForm.tsx` (lines 49-55, 117-124)
- Cause: Over a long user session viewing many months, the array grows indefinitely; React re-renders all downstream components when monthEvents changes
- Improvement path: Implement a windowed approach—only keep events for current month + next/prev month; discard older ones; or paginate fetches with memoization

**Calendar fetch triggers on every month navigation:**
- Problem: useEffect dependency on `loadedMonths` (a Set) causes the effect to re-run even if the same month is viewed twice
- Files: `src/components/booking/BookingForm.tsx` (line 136)
- Cause: Sets are reference types; new Set instances cause effect to re-trigger
- Improvement path: Use Set as plain state variable OR convert to string array for dependency tracking

**Unused calendar utilities:**
- Problem: `src/lib/icalendarService.ts` exports `parseICSEvent()`, `hasConflict()`, and `getCalendarDateRange()` that are not used
- Files: `src/lib/icalendarService.ts` (lines 50-94)
- Impact: Dead code increases bundle size slightly; suggests incomplete migration from old approach
- Improvement path: Remove or document if these are reserved for future booking system enhancements

## Fragile Areas

**BookingForm multi-step state machine:**
- Files: `src/components/booking/BookingForm.tsx` (entire component, 490 lines)
- Why fragile: Complex state management across 8 separate useState calls; manual step transitions; no validation between steps
- Safe modification: Document each step's invariants; add type-safe state guards; consider useReducer for complex transitions
- Test coverage: Only smoke tests exist (render checks); no step-to-step flow tests or edge case validation

**Calendar API error handling:**
- Files: `src/app/api/calendar/route.ts`, `src/lib/serverCalendar.ts`, `src/components/booking/BookingForm.tsx`
- Why fragile: Three layers of promise chains; errors at any layer could silently fail or propagate inconsistently
- Symptoms: Calendar unavailable shows a warning but booking form still allows date selection (line 309-312); user may not realize dates are unvalidated
- Safe modification: Standardize error propagation; add explicit error states at each layer; disable date picker entirely if calendar fails

**Timezone handling across date-fns and native Date:**
- Files: `src/lib/availabilityService.ts`, `src/components/booking/BookingForm.tsx`, `src/lib/serverCalendar.ts`
- Why fragile: Mixing `date-fns-tz` (timezone-aware) with native Date (UTC) operations; potential for off-by-one-day errors during DST transitions
- Trigger: Booking during daylight saving time changes (March/November)
- Safe modification: Centralize all timezone conversions to one utility module; add tests for DST boundary dates

## Scaling Limits

**Single-endpoint calendar fetching:**
- Current capacity: Fetches up to 3 months of calendar data on page load (line 140 in serverCalendar.ts: `addMonths(now, 2)`)
- Limit: If a user has 200+ calendar events in a month, the parsing loop (lines 95-131) could become slow
- Scaling path: Implement server-side filtering to only return events relevant to 9 AM–5 PM Mountain Time; add pagination if needed

**No caching beyond 15-minute window:**
- Current behavior: Calendar data cached for 15 minutes (line 185: `revalidate: 900`)
- Impact: High calendar load if many users check availability simultaneously
- Scaling path: Implement longer cache + invalidation strategy; consider reading from iCloud less frequently and using client-side state

## Dependencies at Risk

**`tsdav` - CalDAV client library:**
- Risk: Single-purpose dependency with lower maintenance velocity compared to more popular libraries
- Impact: If tsdav breaks or is abandoned, the entire booking system fails
- Alternative: Consider `caldav` package or direct HTTP CalDAV implementation if tsdav becomes unmaintained
- Current status: v2.1.8 is recent; monitor for security advisories

**`ical.js` - iCalendar parser:**
- Risk: Has known timezone handling quirks (visible in comments at lines 20-28); parser could throw on unusual event formats
- Impact: A single malformed calendar event from iCloud could crash the booking page
- Alternative: Use a more robust parser or add try-catch at the component level
- Current status: v2.2.1 is stable; wrapped in error handling

**`@calcom/embed-react` - Cal.com integration:**
- Risk: External widget injection; depends on Cal.com's infrastructure
- Impact: If Cal.com is down, `/meet` page loads but embed fails silently
- Mitigation: Already has fallback UI (Cal.com doesn't render, but booking form still works)
- Note: Separate from custom booking system; creates redundant functionality

## Missing Critical Features

**No user data persistence:**
- Problem: Booking form does not save data server-side; user must download ICS or manually email confirmation
- Blocks: Cannot build admin panel to view bookings; no booking history for user
- Impact: Bookings are not tracked; no way to prevent double-booking across sessions
- Priority: Medium—currently acceptable for portfolio site with low booking volume

**No email confirmation endpoint:**
- Problem: "Email Confirmation" button uses `mailto:` link instead of API call
- Blocks: Cannot reliably send booking confirmations; user must have email client configured
- Recommendation: Implement `/api/send-confirmation` endpoint with a mail service (SendGrid, Resend, Mailgun)

**No admin interface:**
- Problem: No way to view bookings, edit availability, or block dates without modifying code
- Blocks: Calendar must be manually maintained in iCloud; no UI for managing blocked times
- Recommendation: Build admin dashboard if booking volume increases

## Test Coverage Gaps

**BookingForm component:**
- What's not tested: Step transitions, form validation, ICS generation, calendar event filtering logic
- Files: `src/components/booking/BookingForm.tsx` (490 lines)
- Risk: Step-to-step flows could break silently; form submission logic untested
- Priority: High—this is the core feature

**Calendar API error scenarios:**
- What's not tested: Network failures, malformed iCloud responses, timezone edge cases (DST, international timezones)
- Files: `src/app/api/calendar/route.ts`, `src/lib/serverCalendar.ts`
- Risk: Edge case errors would surface in production
- Priority: High

**Availability service:**
- What's not tested: Boundary conditions (exactly 9 AM start, exactly 5 PM end), weekend detection, slot overlap detection
- Files: `src/lib/availabilityService.ts` (120 lines)
- Risk: Off-by-one errors in slot calculation could go unnoticed
- Priority: Medium—core logic needs validation

**Contact form:**
- What's not tested: Formspree integration, error states, mailto fallback
- Files: `src/components/sections/contact-section.tsx`
- Risk: Form submission failure would not be caught in CI
- Priority: Medium

---

*Concerns audit: 2026-03-17*

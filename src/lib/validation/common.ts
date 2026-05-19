// src/lib/validation/common.ts
//
// Shared Zod helpers extracted from `contact.ts` and `booking.ts` so consumers
// (contact, booking, webhook) can import from one place. The semantics of each
// helper match the inline versions currently duplicated across those files —
// see the matching tests in `common.test.ts` for the exact contract.
//
// Wave 7a foundation module. Migrating consumers happens in parallel agents
// after this lands.

import { z } from 'zod';

/**
 * Matches ASCII control characters (0x00–0x1F + 0x7F). Reject signal for
 * obviously-bogus or injected free-form values (UTMs, phone numbers, names).
 */
export const CONTROL_CHARS = /[\x00-\x1f\x7f]/;

/**
 * Zod v4 email schema, ready to use. Consumers can chain `.max(...)` and
 * `.transform(...)` as needed; the default error message comes from Zod.
 *
 * Use the factory pattern (call `Email()`) only when you need to customise
 * the message — most callers just `z.email(...)` directly. Re-exporting here
 * for symmetry with the other helpers.
 */
export const Email = z.email();

/**
 * Builds a "required, trimmed" string schema for the given field. Mirrors the
 * pattern used in `contact.ts` for `name` and `message`:
 *   - rejects empty
 *   - trims surrounding whitespace
 *   - re-checks non-empty after trim (so '   ' fails)
 *
 * The error message names the field for nicer client-side display.
 */
export function requiredTrimmedString(fieldName: string) {
  const message = `${fieldName} is required.`;
  return z
    .string()
    .min(1, { message })
    .transform((v) => v.trim())
    .refine((v) => v.length > 0, { message });
}

/**
 * Optional trimmed string. Returns `undefined` for empty or whitespace-only
 * input, returns the trimmed value otherwise. Matches the `optionalTrimmed`
 * helper inlined in `contact.ts` (minus the `.max(...)` cap — pair this with
 * `boundedString` if you also need a length cap).
 */
export const optionalTrimmed = z
  .string()
  .optional()
  .transform((v) => {
    if (v == null) return undefined;
    const trimmed = v.trim();
    return trimmed.length > 0 ? trimmed : undefined;
  });

/**
 * Builds a length-capped, trimmed string schema. Returns the trimmed value or
 * `undefined` when empty — same convenience shape as `optionalTrimmed` but
 * with a max-length guard up front. The error message names the field.
 */
export function boundedString(max: number, fieldName: string) {
  return z
    .string()
    .max(max, { message: `${fieldName} must be ${max} characters or fewer.` })
    .transform((v) => v.trim())
    .transform((v) => (v.length === 0 ? undefined : v))
    .optional();
}

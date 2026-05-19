import { z } from 'zod';

// Length caps, kept in module-level constants so tests can reference them.
export const CONTACT_LIMITS = {
  name: 200,
  email: 320, // RFC 5321 practical maximum for an email address
  subject: 300,
  message: 5000,
  utm: 200,
  referer: 2000,
} as const;

// Reject ASCII control characters (incl. newlines/tabs) — a common signal
// of an obviously bogus or injected UTM value.
const CONTROL_CHARS = /[\x00-\x1f\x7f]/;

// Helper: trims, then treats empty as undefined so `.optional()` works cleanly.
const optionalTrimmed = (max: number) =>
  z
    .string()
    .max(max)
    .transform((v) => v.trim())
    .transform((v) => (v.length === 0 ? undefined : v))
    .optional();

// UTM values: cap length and reject anything containing control chars.
const utmField = z
  .string()
  .max(CONTACT_LIMITS.utm, { message: `Must be ${CONTACT_LIMITS.utm} characters or fewer.` })
  .refine((v) => !CONTROL_CHARS.test(v), {
    message: 'Contains invalid characters.',
  })
  .transform((v) => v.trim())
  .transform((v) => (v.length === 0 ? undefined : v))
  .optional();

export const contactFormSchema = z.object({
  name: z
    .string()
    .min(1, { message: 'Name is required.' })
    .max(CONTACT_LIMITS.name, {
      message: `Name must be ${CONTACT_LIMITS.name} characters or fewer.`,
    })
    .transform((v) => v.trim())
    .refine((v) => v.length > 0, { message: 'Name is required.' }),

  email: z
    .email({ message: 'Please enter a valid email address.' })
    .max(CONTACT_LIMITS.email, {
      message: `Email must be ${CONTACT_LIMITS.email} characters or fewer.`,
    })
    .transform((v) => v.trim()),

  subject: optionalTrimmed(CONTACT_LIMITS.subject),

  message: z
    .string()
    .min(1, { message: 'Message is required.' })
    .max(CONTACT_LIMITS.message, {
      message: `Message must be ${CONTACT_LIMITS.message} characters or fewer.`,
    })
    .transform((v) => v.trim())
    .refine((v) => v.length > 0, { message: 'Message is required.' }),

  utm_source: utmField,
  utm_medium: utmField,
  utm_campaign: utmField,

  referer: z
    .string()
    .max(CONTACT_LIMITS.referer, {
      message: `Referer must be ${CONTACT_LIMITS.referer} characters or fewer.`,
    })
    .transform((v) => v.trim())
    .transform((v) => (v.length === 0 ? undefined : v))
    .optional(),
});

export type ContactFormInput = z.infer<typeof contactFormSchema>;

/**
 * Coerce a (possibly raw) referer header into something the schema will accept.
 * Truncates to the configured cap so we never blow up the row over a giant
 * incoming header value (WR-01).
 */
export function normalizeReferer(raw: string | null | undefined): string | undefined {
  if (raw == null) return undefined;
  const trimmed = raw.trim();
  if (trimmed.length === 0) return undefined;
  return trimmed.slice(0, CONTACT_LIMITS.referer);
}

/**
 * Pull contact-form-shaped data out of a FormData instance. Kept here (instead
 * of inside the action) so unit tests can exercise it directly.
 */
export function extractContactPayload(
  formData: FormData,
  referer: string | null | undefined
): Record<string, unknown> {
  const get = (key: string) => {
    const v = formData.get(key);
    return typeof v === 'string' ? v : undefined;
  };
  return {
    name: get('name') ?? '',
    email: get('email') ?? '',
    subject: get('subject'),
    message: get('message') ?? '',
    utm_source: get('utm_source'),
    utm_medium: get('utm_medium'),
    utm_campaign: get('utm_campaign'),
    referer: normalizeReferer(referer),
  };
}

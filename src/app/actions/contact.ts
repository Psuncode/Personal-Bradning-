'use server';

import type { z } from 'zod';
import { db } from '@/db';
import { contacts } from '@/db/schema';
import { headers } from 'next/headers';
import { contactRateLimiter } from '@/lib/rate-limit';
import {
  contactFormSchema,
  extractContactPayload,
} from '@/lib/validation/contact';

// Derive the field-error map directly from the Zod schema so the type can
// never drift from the runtime shape. Adding/renaming a field in
// `contactFormSchema` immediately surfaces here at compile time.
export type ContactFormFieldErrors = Partial<
  Record<keyof z.infer<typeof contactFormSchema>, string[]>
>;

export type ContactFormState = {
  success: boolean;
  error?: string;
  fieldErrors?: ContactFormFieldErrors;
};

// Pick the first field-level message we find, in a sensible display order.
function firstFieldError(errors: ContactFormFieldErrors): string | undefined {
  const order: (keyof ContactFormFieldErrors)[] = [
    'name',
    'email',
    'subject',
    'message',
    'utm_source',
    'utm_medium',
    'utm_campaign',
    'referer',
  ];
  for (const key of order) {
    const msg = errors[key]?.[0];
    if (msg) return msg;
  }
  return undefined;
}

/**
 * Best-effort client key for rate-limiting. Uses the left-most entry in
 * x-forwarded-for (the original client IP per Vercel/most proxies). Falls
 * back to a generic key when the header is missing — better to throttle
 * everyone collectively than to leave the action unbounded.
 */
function getClientKey(forwardedFor: string | null): string {
  if (!forwardedFor) return 'unknown-client';
  const first = forwardedFor.split(',')[0]?.trim();
  return first && first.length > 0 ? first : 'unknown-client';
}

export async function saveContact(
  _prev: ContactFormState,
  formData: FormData
): Promise<ContactFormState> {
  const headersList = await headers();

  // 1. Per-IP rate limit. Same policy as login (5/15min burst, then 1/min).
  //    Runs BEFORE Zod parse so we never spend cycles validating abusive
  //    traffic. See src/lib/rate-limit.ts re: horizontal-scale ceiling.
  const clientKey = getClientKey(headersList.get('x-forwarded-for'));
  const gate = contactRateLimiter.check(clientKey);
  if (!gate.allowed) {
    return {
      success: false,
      error: 'Too many requests. Try again later.',
      fieldErrors: {},
    };
  }

  const referer = headersList.get('referer');
  const payload = extractContactPayload(formData, referer);
  const parsed = contactFormSchema.safeParse(payload);

  if (!parsed.success) {
    const fieldErrors: ContactFormFieldErrors = parsed.error.flatten().fieldErrors;
    return {
      success: false,
      error:
        firstFieldError(fieldErrors) ??
        'Some of your input was invalid. Please check the form and try again.',
      fieldErrors,
    };
  }

  const data = parsed.data;

  try {
    await db.insert(contacts).values({
      name: data.name,
      email: data.email,
      subject: data.subject ?? null,
      message: data.message,
      utmSource: data.utm_source ?? null,
      utmMedium: data.utm_medium ?? null,
      utmCampaign: data.utm_campaign ?? null,
      referrer: data.referer ?? null,
    });
    return { success: true };
  } catch (err) {
    console.error('saveContact error:', err);
    return { success: false, error: 'Something went wrong. Please try again.' };
  }
}

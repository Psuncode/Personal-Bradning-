'use server';

import { db } from '@/db';
import { contacts } from '@/db/schema';
import { headers } from 'next/headers';
import {
  contactFormSchema,
  extractContactPayload,
} from '@/lib/validation/contact';

export type ContactFormFieldErrors = {
  name?: string[];
  email?: string[];
  subject?: string[];
  message?: string[];
  utm_source?: string[];
  utm_medium?: string[];
  utm_campaign?: string[];
  referer?: string[];
};

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

export async function saveContact(
  _prev: ContactFormState,
  formData: FormData
): Promise<ContactFormState> {
  const headersList = await headers();
  const referer = headersList.get('referer');

  const payload = extractContactPayload(formData, referer);
  const parsed = contactFormSchema.safeParse(payload);

  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors as ContactFormFieldErrors;
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

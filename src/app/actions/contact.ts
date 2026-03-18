'use server';

import { db } from '@/db';
import { contacts } from '@/db/schema';
import { headers } from 'next/headers';

export type ContactFormState = {
  success: boolean;
  error?: string;
};

export async function saveContact(
  _prev: ContactFormState,
  formData: FormData
): Promise<ContactFormState> {
  const name = (formData.get('name') as string)?.trim();
  const email = (formData.get('email') as string)?.trim();
  const subject = (formData.get('subject') as string)?.trim();
  const message = (formData.get('message') as string)?.trim();

  if (!name || !email || !message) {
    return { success: false, error: 'Name, email, and message are required.' };
  }

  const headersList = await headers();
  const referer = headersList.get('referer') ?? null;

  try {
    await db.insert(contacts).values({
      name,
      email,
      subject: subject || null,
      message,
      utmSource: (formData.get('utm_source') as string) || null,
      utmMedium: (formData.get('utm_medium') as string) || null,
      utmCampaign: (formData.get('utm_campaign') as string) || null,
      referrer: referer,
    });
    return { success: true };
  } catch (err) {
    console.error('saveContact error:', err);
    return { success: false, error: 'Something went wrong. Please try again.' };
  }
}

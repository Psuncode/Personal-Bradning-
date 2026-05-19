import { Resend } from 'resend';
import { generateICSContent } from '@/lib/icsService';
import { siteConfig } from '@/data/site-config';
import { format } from 'date-fns-tz';
import { addMinutes } from 'date-fns';
import { requireRuntimeEnv } from '@/lib/env';

// Lazy singleton — avoids Resend throwing at build time when RESEND_API_KEY is
// not set. `requireRuntimeEnv` defers the env lookup until first call and
// throws an actionable error if the key is missing — matches the pattern in
// `lib/stripe.ts` and `lib/session.ts`.
let _resend: Resend | undefined;
function getResend(): Resend {
  if (!_resend) {
    _resend = new Resend(requireRuntimeEnv('RESEND_API_KEY'));
  }
  return _resend;
}

const FROM_ADDRESS = 'Philip Sun Photography <bookings@photography.psunproduction.com>';
const TIMEZONE = 'America/Denver';

// Lightweight RFC-5322-ish email validator — catches obvious garbage before
// we burn a Resend API call on it. Not a perfect parser, deliberately.
// Matches: local@domain.tld with at least one dot in the domain.
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmailAddress(value: unknown): value is string {
  return typeof value === 'string' && value.length <= 254 && EMAIL_REGEX.test(value.trim());
}

export class InvalidEmailRecipientError extends Error {
  constructor(public recipient: unknown) {
    super(`Invalid recipient email address: ${JSON.stringify(recipient)}`);
    this.name = 'InvalidEmailRecipientError';
  }
}

/**
 * HTML-escape user-supplied strings before interpolating them into email
 * markup. Resend renders HTML as-is; without escaping, a `clientName` like
 * `Jane" onclick="..."` or `<img src=x onerror=...>` can corrupt the template
 * or — in less strict email clients — open up link/image injection.
 *
 * See WR-04 in .planning/phases/03-booking-and-payments/03-REVIEW.md.
 */
export function escapeHtml(value: unknown): string {
  if (value == null) return '';
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Resolve the operator notification recipient. Prefers an explicit env var so
 * the address can be rotated without a redeploy; falls back to siteConfig.email
 * for local dev. Returns null when no valid address is configured so callers
 * can skip the Resend call instead of throwing into the Stripe webhook.
 *
 * See WR-07 in .planning/phases/03-booking-and-payments/03-REVIEW.md.
 */
export function getNotificationRecipient(): string | null {
  const fromEnv = process.env.BOOKING_NOTIFICATION_EMAIL?.trim();
  if (fromEnv && isValidEmailAddress(fromEnv)) return fromEnv;
  if (isValidEmailAddress(siteConfig.email)) return siteConfig.email;
  return null;
}

export interface BookingEmailOpts {
  clientName: string;
  clientEmail: string;
  packageName: string;
  eventDate: Date;
  depositPaidInCents: number;
  durationMinutes?: number;
}

export async function sendBookingConfirmationEmail(opts: BookingEmailOpts) {
  const { clientName, clientEmail, packageName, eventDate, depositPaidInCents, durationMinutes = 60 } = opts;

  if (!isValidEmailAddress(clientEmail)) {
    throw new InvalidEmailRecipientError(clientEmail);
  }

  const endTime = addMinutes(eventDate, durationMinutes);
  const formattedDate = format(eventDate, 'MMMM d, yyyy', { timeZone: TIMEZONE });
  const formattedTime = format(eventDate, 'h:mm a', { timeZone: TIMEZONE });
  const formattedDeposit = `$${(depositPaidInCents / 100).toFixed(0)}`;

  // Generate ICS calendar invite
  const icsContent = generateICSContent({
    title: `Photography Session — ${packageName}`,
    description: `Your photography session with ${siteConfig.name}.`,
    startTime: eventDate,
    endTime,
    organizer: { name: siteConfig.name, email: 'bookings@photography.psunproduction.com' },
    attendee: { name: clientName, email: clientEmail },
  });

  const icsBase64 = Buffer.from(icsContent).toString('base64');

  // WR-04: every user-controlled value is HTML-escaped before interpolation.
  // Static strings (siteConfig.name, formattedDate/Time) are escaped too for
  // consistency — they're cheap and protect against future config changes.
  const safeClientName = escapeHtml(clientName);
  const safePackageName = escapeHtml(packageName);
  const safeFormattedDate = escapeHtml(formattedDate);
  const safeFormattedTime = escapeHtml(formattedTime);
  const safeFormattedDeposit = escapeHtml(formattedDeposit);
  const safeSiteEmail = escapeHtml(siteConfig.email);
  const safeSiteName = escapeHtml(siteConfig.name);

  // Build HTML email body — warm, photographer voice, light BYU navy branding
  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px 24px;">
      <div style="border-bottom: 3px solid #002E5D; padding-bottom: 16px; margin-bottom: 24px;">
        <h1 style="color: #002E5D; font-size: 24px; margin: 0;">You're booked!</h1>
      </div>

      <p style="color: #4A4A4A; font-size: 16px; line-height: 1.6;">
        Hey ${safeClientName}, thanks for booking with me! I'm looking forward to our session together.
      </p>

      <div style="background: #F5F5F5; border-radius: 12px; padding: 24px; margin: 24px 0;">
        <p style="margin: 0 0 8px; color: #4A4A4A; font-size: 14px;"><strong>Package:</strong> ${safePackageName}</p>
        <p style="margin: 0 0 8px; color: #4A4A4A; font-size: 14px;"><strong>Date:</strong> ${safeFormattedDate}</p>
        <p style="margin: 0 0 8px; color: #4A4A4A; font-size: 14px;"><strong>Time:</strong> ${safeFormattedTime} (Mountain Time)</p>
        <p style="margin: 0; color: #4A4A4A; font-size: 14px;"><strong>Deposit Paid:</strong> ${safeFormattedDeposit}</p>
      </div>

      <h2 style="color: #002E5D; font-size: 18px; margin-top: 24px;">Before the shoot</h2>
      <p style="color: #4A4A4A; font-size: 16px; line-height: 1.6;">
        Wear something you feel great in — solid colors photograph best. Plan to arrive a few minutes early so we can chat through the vision before we start. If you have any outfit changes, bring them along.
      </p>

      <p style="color: #4A4A4A; font-size: 16px; line-height: 1.6;">
        I'll follow up closer to the date with exact location details and any last-minute notes.
      </p>

      <div style="border-top: 1px solid #E5E5E5; margin-top: 32px; padding-top: 16px;">
        <p style="color: #4A4A4A; font-size: 14px; line-height: 1.6;">
          Questions? Reach me directly at <a href="mailto:${safeSiteEmail}" style="color: #002E5D;">${safeSiteEmail}</a>
        </p>
        <p style="color: #4A4A4A; font-size: 14px;">— ${safeSiteName}</p>
      </div>
    </div>
  `;

  await getResend().emails.send({
    from: FROM_ADDRESS,
    to: clientEmail,
    subject: `Your session is confirmed — ${packageName}`,
    html,
    attachments: [
      {
        filename: 'session.ics',
        content: icsBase64,
        contentType: 'text/calendar; method=REQUEST',
      },
    ],
  });
}

export interface NotificationOpts {
  clientName: string;
  clientEmail: string;
  packageName: string;
  eventDate: Date;
  depositPaidInCents: number;
}

export async function sendPhilipNotificationEmail(opts: NotificationOpts) {
  const { clientName, clientEmail, packageName, eventDate, depositPaidInCents } = opts;

  // WR-07: recipient prefers BOOKING_NOTIFICATION_EMAIL (rotatable without
  // redeploy) and falls back to siteConfig.email. Throws if neither is valid
  // so the webhook's manual-followup logger surfaces the misconfiguration.
  const recipient = getNotificationRecipient();
  if (!recipient) {
    throw new InvalidEmailRecipientError(
      process.env.BOOKING_NOTIFICATION_EMAIL ?? siteConfig.email,
    );
  }

  const formattedDate = format(eventDate, 'MMMM d, yyyy h:mm a', { timeZone: TIMEZONE });
  const formattedDeposit = `$${(depositPaidInCents / 100).toFixed(0)}`;

  // WR-04: HTML-escape every user-controlled value.
  const safeClientName = escapeHtml(clientName);
  const safeClientEmail = escapeHtml(clientEmail);
  const safePackageName = escapeHtml(packageName);
  const safeFormattedDate = escapeHtml(formattedDate);
  const safeFormattedDeposit = escapeHtml(formattedDeposit);

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; padding: 24px;">
      <h2 style="color: #002E5D;">New Photography Booking</h2>
      <p><strong>Client:</strong> ${safeClientName} (${safeClientEmail})</p>
      <p><strong>Package:</strong> ${safePackageName}</p>
      <p><strong>Date:</strong> ${safeFormattedDate} (Mountain Time)</p>
      <p><strong>Deposit:</strong> ${safeFormattedDeposit}</p>
    </div>
  `;

  await getResend().emails.send({
    from: FROM_ADDRESS,
    to: recipient,
    subject: `New booking: ${clientName} — ${packageName}`,
    html,
  });
}

import { Resend } from 'resend';
import { generateICSContent } from '@/lib/icsService';
import { siteConfig } from '@/data/site-config';
import { format } from 'date-fns-tz';
import { addMinutes } from 'date-fns';

// Lazy singleton — avoids Resend throwing at build time when RESEND_API_KEY is not set.
let _resend: Resend | undefined;
function getResend(): Resend {
  if (!_resend) {
    _resend = new Resend(process.env.RESEND_API_KEY!);
  }
  return _resend;
}

// TODO: switch to bookings@photography.psunproduction.com after verifying domain in Resend
const FROM_ADDRESS = 'Philip Sun Photography <onboarding@resend.dev>';
const TIMEZONE = 'America/Denver';

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

  // Build HTML email body — warm, photographer voice, light BYU navy branding
  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px 24px;">
      <div style="border-bottom: 3px solid #002E5D; padding-bottom: 16px; margin-bottom: 24px;">
        <h1 style="color: #002E5D; font-size: 24px; margin: 0;">You're booked!</h1>
      </div>

      <p style="color: #4A4A4A; font-size: 16px; line-height: 1.6;">
        Hey ${clientName}, thanks for booking with me! I'm looking forward to our session together.
      </p>

      <div style="background: #F5F5F5; border-radius: 12px; padding: 24px; margin: 24px 0;">
        <p style="margin: 0 0 8px; color: #4A4A4A; font-size: 14px;"><strong>Package:</strong> ${packageName}</p>
        <p style="margin: 0 0 8px; color: #4A4A4A; font-size: 14px;"><strong>Date:</strong> ${formattedDate}</p>
        <p style="margin: 0 0 8px; color: #4A4A4A; font-size: 14px;"><strong>Time:</strong> ${formattedTime} (Mountain Time)</p>
        <p style="margin: 0; color: #4A4A4A; font-size: 14px;"><strong>Deposit Paid:</strong> ${formattedDeposit}</p>
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
          Questions? Reach me directly at <a href="mailto:${siteConfig.email}" style="color: #002E5D;">${siteConfig.email}</a>
        </p>
        <p style="color: #4A4A4A; font-size: 14px;">— ${siteConfig.name}</p>
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
  const formattedDate = format(eventDate, 'MMMM d, yyyy h:mm a', { timeZone: TIMEZONE });
  const formattedDeposit = `$${(depositPaidInCents / 100).toFixed(0)}`;

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; padding: 24px;">
      <h2 style="color: #002E5D;">New Photography Booking</h2>
      <p><strong>Client:</strong> ${clientName} (${clientEmail})</p>
      <p><strong>Package:</strong> ${packageName}</p>
      <p><strong>Date:</strong> ${formattedDate} (Mountain Time)</p>
      <p><strong>Deposit:</strong> ${formattedDeposit}</p>
    </div>
  `;

  await getResend().emails.send({
    from: FROM_ADDRESS,
    to: siteConfig.email,
    subject: `New booking: ${clientName} — ${packageName}`,
    html,
  });
}

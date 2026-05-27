import { createEvent, type EventAttributes } from 'ics';

interface ICSEventOptions {
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  organizer?: { name: string; email: string };
  attendee?: { name: string; email: string };
}

export function generateICSContent(options: ICSEventOptions): string {
  const { title, description, startTime, endTime, organizer, attendee } = options;

  // Convert dates to ICS format
  const toICSDate = (date: Date): [number, number, number, number, number] => {
    return [
      date.getFullYear(),
      date.getMonth() + 1,
      date.getDate(),
      date.getHours(),
      date.getMinutes(),
    ];
  };

  const eventAttributes: EventAttributes = {
    title,
    description: description || '',
    start: toICSDate(startTime),
    end: toICSDate(endTime),
    organizer: organizer ? { name: organizer.name, email: organizer.email } : undefined,
    attendees: attendee
      ? [{ name: attendee.name, email: attendee.email, partstat: 'NEEDS-ACTION' }]
      : undefined,
  };

  const { error, value } = createEvent(eventAttributes);

  if (error) {
    throw new Error(`Failed to generate ICS: ${error}`);
  }

  return value || '';
}

export function downloadICS(content: string, filename: string = 'meeting.ics'): void {
  if (typeof window === 'undefined') return; // Server-side safety check

  const blob = new Blob([content], { type: 'text/calendar' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function getEmailBody(meetingDetails: {
  title: string;
  date: string;
  time: string;
  organizer: string;
  organizerEmail: string;
}): string {
  return `Hi ${meetingDetails.organizer},

This is to confirm your meeting request:

Meeting: ${meetingDetails.title}
Date & Time: ${meetingDetails.date} at ${meetingDetails.time} (Mountain Time)
With: Philip Sun (${meetingDetails.organizerEmail})

Please find the calendar file attached to add this to your calendar.

Best regards,
Philip Sun`;
}

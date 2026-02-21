import { addDays } from 'date-fns';

export interface CalendarEvent {
  title: string;
  startTime: Date;
  endTime: Date;
  summary?: string;
}

/**
 * Fetches calendar events from iCloud via the backend API
 */
export async function fetchICloudEvents(
  startDate: Date,
  endDate: Date
): Promise<CalendarEvent[]> {
  try {
    const response = await fetch('/api/calendar', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch calendar events: ${response.statusText}`);
    }

    const data = await response.json();
    
    // Convert string dates back to Date objects
    return (data.events || []).map((event: any) => ({
      ...event,
      startTime: new Date(event.startTime),
      endTime: new Date(event.endTime),
    }));
  } catch (error) {
    console.error('Error fetching calendar events:', error);
    return [];
  }
}

/**
 * Formats a date range for calendar queries
 */
export function getCalendarDateRange(startDate: Date, numDays: number = 30) {
  const end = addDays(startDate, numDays);
  return {
    start: startDate,
    end,
    startISO: startDate.toISOString(),
    endISO: end.toISOString(),
  };
}

/**
 * Checks if an event overlaps with a time range
 */
export function hasConflict(
  event: CalendarEvent,
  startTime: Date,
  endTime: Date
): boolean {
  return event.startTime < endTime && event.endTime > startTime;
}

/**
 * Parses ICS event data into CalendarEvent
 */
export function parseICSEvent(vevent: any): CalendarEvent | null {
  try {
    const summary = vevent.summary?.value || '';
    const dtstart = vevent.dtstart?.value;
    const dtend = vevent.dtend?.value;

    if (!dtstart || !dtend) {
      return null;
    }

    return {
      title: summary,
      startTime: new Date(dtstart),
      endTime: new Date(dtend),
      summary,
    };
  } catch (error) {
    console.error('Error parsing ICS event:', error);
    return null;
  }
}

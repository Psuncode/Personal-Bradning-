import { DAVClient } from 'tsdav';
import ICAL from 'ical.js';
import { unstable_cache } from 'next/cache';
import { startOfMonth, endOfMonth, addMonths, addDays, startOfDay, endOfDay } from 'date-fns';
import { format } from 'date-fns-tz';
import { getAvailableSlots } from '@/lib/availabilityService';

export interface SerializedEvent {
  title: string;
  startTime: string; // ISO 8601
  endTime: string;   // ISO 8601
}

export interface ServerAvailabilityResult {
  events: SerializedEvent[];
  busyDates: string[]; // "yyyy-MM-dd" strings for fully-booked workdays
  error?: string;
}

/**
 * Fetches raw calendar events from iCloud CalDAV for the given date range.
 * Used by both the API route and getServerAvailability.
 *
 * Fixes vs. the old route.ts:
 *   1. Calls client.login() before any CalDAV operations.
 *   2. Registers VTIMEZONE definitions so ICAL.Event resolves TZID refs correctly.
 *   3. Uses ICAL.Event (not raw property access) for timezone-aware start/end dates.
 */
export async function fetchCalendarEventsForRange(
  startDate: Date,
  endDate: Date
): Promise<SerializedEvent[]> {
  const username = process.env.ICAL_USERNAME;
  const password = process.env.ICAL_PASSWORD;
  const server = process.env.ICAL_SERVER || 'https://caldav.icloud.com';
  const calendarId = process.env.ICAL_CALENDAR_ID;

  if (!username || !password || !calendarId) {
    console.log('Calendar not configured — returning empty events');
    return [];
  }

  console.log(`[calendar] Connecting to ${server} as ${username}`);

  const client = new DAVClient({
    serverUrl: server,
    credentials: { username, password },
    authMethod: 'Basic',
  });

  // Fix 1: must call login() before fetchCalendars()
  await client.login();
  console.log('[calendar] Logged in');

  const calendars = await client.fetchCalendars();
  console.log(`[calendar] Found ${calendars?.length ?? 0} calendars`);

  if (!calendars || calendars.length === 0) {
    console.warn('[calendar] No calendars found');
    return [];
  }

  calendars.forEach((cal: any, i: number) => {
    console.log(`  [${i}] ${cal.displayName || cal.url}`);
  });

  // Find target calendar by ID match, fall back to first
  const targetCalendar =
    (calendars as any[]).find((cal) => {
      const url = String(cal.url || '');
      const name = String(cal.displayName || '');
      return url.includes(calendarId) || name.includes(calendarId);
    }) ?? calendars[0];

  console.log(
    `[calendar] Using: ${(targetCalendar as any).displayName || (targetCalendar as any).url}`
  );

  const calendarObjects = await client.fetchCalendarObjects({
    calendar: targetCalendar,
    timeRange: {
      start: startDate.toISOString(),
      end: endDate.toISOString(),
    },
  });

  console.log(`[calendar] Fetched ${calendarObjects?.length ?? 0} objects`);

  if (!calendarObjects || calendarObjects.length === 0) {
    return [];
  }

  const events: SerializedEvent[] = [];

  for (const obj of calendarObjects) {
    if (!obj.data) continue;
    try {
      const jcalData = ICAL.parse(obj.data);
      const vcalendar = new ICAL.Component(jcalData);

      // Fix 2a: register VTIMEZONE definitions so ICAL.Event can resolve TZID references
      for (const vtimezone of vcalendar.getAllSubcomponents('vtimezone')) {
        const tzid = vtimezone.getFirstPropertyValue('tzid') as string;
        if (tzid) {
          try {
            ICAL.TimezoneService.register(
              new ICAL.Timezone({ component: vtimezone, tzid })
            );
          } catch {
            // Already registered — safe to ignore
          }
        }
      }

      // Fix 2b: use ICAL.Event for timezone-aware startDate/endDate
      for (const vevent of vcalendar.getAllSubcomponents('vevent')) {
        try {
          const icalEvent = new ICAL.Event(vevent);
          events.push({
            title: icalEvent.summary || 'Event',
            startTime: icalEvent.startDate.toJSDate().toISOString(),
            endTime: icalEvent.endDate.toJSDate().toISOString(),
          });
        } catch (err) {
          console.error('[calendar] Error parsing VEVENT:', err);
        }
      }
    } catch (err) {
      console.error('[calendar] Error parsing calendar object:', err);
    }
  }

  console.log(`[calendar] Parsed ${events.length} events`);
  return events;
}

async function _fetchServerAvailability(): Promise<ServerAvailabilityResult> {
  const now = new Date();
  const start = startOfMonth(now);
  const end = endOfMonth(addMonths(now, 2));

  let events: SerializedEvent[];
  try {
    events = await fetchCalendarEventsForRange(start, end);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[calendar] Server availability fetch failed:', message);
    return { events: [], busyDates: [], error: message };
  }

  // Pre-compute which workdays are fully booked
  const busyDates: string[] = [];
  let day = start;

  while (day <= end) {
    const dayStart = startOfDay(day);
    const dayEnd = endOfDay(day);
    const dayEvents = events
      .filter(
        (e) => new Date(e.endTime) > dayStart && new Date(e.startTime) < dayEnd
      )
      .map((e) => ({
        startTime: new Date(e.startTime),
        endTime: new Date(e.endTime),
      }));

    // getAvailableSlots returns [] for weekends too, so no separate weekend check needed
    if (getAvailableSlots(day, dayEvents).length === 0) {
      busyDates.push(format(day, 'yyyy-MM-dd', { timeZone: 'America/Denver' }));
    }

    day = addDays(day, 1);
  }

  return { events, busyDates };
}

/**
 * Server-side availability for the current month + next 2 months.
 * Cached for 15 minutes so page refreshes don't hit iCloud on every request.
 */
export const getServerAvailability = unstable_cache(
  _fetchServerAvailability,
  ['server-calendar-availability'],
  { revalidate: 900 }
);

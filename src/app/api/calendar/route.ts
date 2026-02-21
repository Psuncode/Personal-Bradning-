import { NextRequest, NextResponse } from 'next/server';
import { DAVClient } from 'tsdav';
import ICAL from 'ical.js';

interface CalendarEvent {
  title: string;
  startTime: string;
  endTime: string;
}

/**
 * Parse ICS event data from iCal.js component
 */
function parseICALEvent(component: any): CalendarEvent | null {
  try {
    const summary = component.getFirstPropertyValue('summary') || 'Event';
    const dtstart = component.getFirstPropertyValue('dtstart');
    const dtend = component.getFirstPropertyValue('dtend');

    if (!dtstart || !dtend) {
      return null;
    }

    // Convert to ISO string
    const startTime = dtstart instanceof ICAL.Time 
      ? dtstart.toJSDate().toISOString()
      : new Date(dtstart).toISOString();
    
    const endTime = dtend instanceof ICAL.Time
      ? dtend.toJSDate().toISOString()
      : new Date(dtend).toISOString();

    return {
      title: String(summary),
      startTime,
      endTime,
    };
  } catch (error) {
    console.error('Error parsing ICAL event:', error);
    return null;
  }
}

/**
 * Fetch calendar events from iCloud CalDAV
 */
async function fetchCalendarEvents(
  startDate: Date,
  endDate: Date
): Promise<CalendarEvent[]> {
  const username = process.env.ICAL_USERNAME;
  const password = process.env.ICAL_PASSWORD;
  const server = process.env.ICAL_SERVER || 'https://caldav.icloud.com';
  const calendarId = process.env.ICAL_CALENDAR_ID;

  if (!username || !password || !calendarId) {
    console.log('Calendar not configured, returning empty events');
    return [];
  }

  try {
    console.log(`Connecting to ${server} as ${username}`);
    console.log(`Looking for calendar: ${calendarId}`);

    // Create client with proper authentication
    const client = new DAVClient({
      serverUrl: server,
      credentials: {
        username,
        password,
      },
      authMethod: 'Basic',
    });

    // Fetch calendars
    console.log('Fetching calendars...');
    let calendars;
    
    try {
      calendars = await client.fetchCalendars();
      console.log(`Successfully fetched ${calendars?.length || 0} calendars`);
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      console.error('Failed to fetch calendars:', msg);
      
      // If authentication fails, provide helpful error message
      if (msg.includes('no account') || msg.includes('401') || msg.includes('Unauthorized')) {
        console.error('Authentication failed. Please verify:');
        console.error('  1. iCloud email (ICAL_USERNAME) is correct');
        console.error('  2. App-specific password (ICAL_PASSWORD) is correct');
        console.error('  3. Calendar ID (ICAL_CALENDAR_ID) exists');
        throw new Error('iCloud authentication failed - check credentials');
      }
      
      throw error;
    }
    
    if (!calendars || calendars.length === 0) {
      console.warn('No calendars found');
      return [];
    }

    // Log available calendars for debugging
    calendars.forEach((cal: any, idx: number) => {
      const name = cal.displayName || cal.url || 'Unnamed';
      console.log(`  [${idx}] ${name}`);
    });

    // Find the target calendar
    let targetCalendar = calendars[0];
    
    // Try to find calendar by ID or name
    const matchingCalendar = calendars.find((cal: any) => {
      const calUrl = String(cal.url || '');
      const calName = String(cal.displayName || '');
      const calResourceType = String((cal as any).resourcetype || '');
      
      return (
        calUrl.includes(calendarId) || 
        calName.includes(calendarId) ||
        calResourceType.includes('calendar')
      );
    });

    if (matchingCalendar) {
      targetCalendar = matchingCalendar;
      console.log(`Using matched calendar: ${(targetCalendar as any).displayName || (targetCalendar as any).url}`);
    } else {
      console.log(`No exact match for ${calendarId}, using first calendar`);
    }

    // Fetch calendar objects within date range
    const startISO = startDate.toISOString();
    const endISO = endDate.toISOString();
    console.log(`Fetching events from ${startISO} to ${endISO}`);
    
    const calendarObjects = await client.fetchCalendarObjects({
      calendar: targetCalendar,
      timeRange: {
        start: startISO,
        end: endISO,
      },
    });

    if (!calendarObjects || calendarObjects.length === 0) {
      console.log('No events found in date range');
      return [];
    }

    // Parse calendar objects to events
    const events: CalendarEvent[] = [];
    
    for (const obj of calendarObjects) {
      try {
        if (!obj.data) {
          console.warn('Calendar object has no data');
          continue;
        }
        
        // Parse ICS data
        const jcalData = ICAL.parse(obj.data);
        const component = new ICAL.Component(jcalData);
        
        // Get VEVENT components
        const veventComponents = component.getAllSubcomponents('vevent');
        
        for (const vevent of veventComponents) {
          const event = parseICALEvent(vevent);
          if (event) {
            events.push(event);
          }
        }
      } catch (error) {
        console.error('Error parsing calendar object:', error);
        // Continue with next object
      }
    }

    console.log(`Successfully fetched ${events.length} events from ${calendarObjects.length} objects`);
    return events;
  } catch (error) {
    console.error('Error fetching calendar events:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`CalDAV error: ${errorMessage}`);
  }
}

export async function POST(request: NextRequest) {
  try {
    const { startDate, endDate } = await request.json();

    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: 'Missing startDate or endDate' },
        { status: 400 }
      );
    }

    // Fetch events from iCloud
    const events = await fetchCalendarEvents(
      new Date(startDate),
      new Date(endDate)
    );

    return NextResponse.json({
      success: true,
      events,
      dateRange: {
        start: startDate,
        end: endDate,
      },
      eventCount: events.length,
    });
  } catch (error) {
    console.error('API error:', error);
    
    // Return detailed error for debugging
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return NextResponse.json(
      {
        error: 'Failed to fetch calendar events',
        message: errorMessage,
        details: process.env.NODE_ENV === 'development' ? String(error) : undefined,
      },
      { status: 500 }
    );
  }
}

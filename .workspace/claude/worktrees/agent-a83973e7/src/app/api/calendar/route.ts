import { NextRequest, NextResponse } from 'next/server';
import { fetchCalendarEventsForRange } from '@/lib/serverCalendar';

export async function POST(request: NextRequest) {
  try {
    const { startDate, endDate } = await request.json();

    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: 'Missing startDate or endDate' },
        { status: 400 }
      );
    }

    const events = await fetchCalendarEventsForRange(
      new Date(startDate),
      new Date(endDate)
    );

    return NextResponse.json({
      success: true,
      events,
      eventCount: events.length,
      dateRange: { start: startDate, end: endDate },
    });
  } catch (error) {
    console.error('[calendar API] Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch calendar events',
        message: error instanceof Error ? error.message : String(error),
        details: process.env.NODE_ENV === 'development' ? String(error) : undefined,
      },
      { status: 500 }
    );
  }
}

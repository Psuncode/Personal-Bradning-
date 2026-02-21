import { toZonedTime, fromZonedTime, format } from 'date-fns-tz';
import { startOfDay, endOfDay, addMinutes, isBefore, isAfter, differenceInMinutes } from 'date-fns';

const TIMEZONE = 'America/Denver';
const WORK_START_HOUR = 9;
const WORK_END_HOUR = 17; // 5 PM
const SLOT_DURATION_MINUTES = 30;

interface TimeSlot {
  startTime: Date;
  endTime: Date;
  display: string;
}

interface BookedEvent {
  startTime: Date;
  endTime: Date;
}

export function getAvailableSlots(
  date: Date,
  bookedEvents: BookedEvent[] = []
): TimeSlot[] {
  // Convert to mountain time
  const zonedDate = toZonedTime(date, TIMEZONE);
  const dayOfWeek = zonedDate.getDay();

  // Check if it's a weekday (Monday = 1, Friday = 5)
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    return []; // No slots on weekends
  }

  // Create work day boundaries
  const dayStart = fromZonedTime(
    new Date(
      zonedDate.getFullYear(),
      zonedDate.getMonth(),
      zonedDate.getDate(),
      WORK_START_HOUR,
      0,
      0
    ),
    TIMEZONE
  );

  const dayEnd = fromZonedTime(
    new Date(
      zonedDate.getFullYear(),
      zonedDate.getMonth(),
      zonedDate.getDate(),
      WORK_END_HOUR,
      0,
      0
    ),
    TIMEZONE
  );

  const slots: TimeSlot[] = [];
  let currentTime = dayStart;

  // Generate all possible 30-minute slots
  while (isBefore(currentTime, dayEnd)) {
    const slotEnd = addMinutes(currentTime, SLOT_DURATION_MINUTES);

    // Check if this slot conflicts with any booked events
    const isBooked = bookedEvents.some(
      (event) =>
        (isAfter(currentTime, event.startTime) && isBefore(currentTime, event.endTime)) ||
        (isAfter(slotEnd, event.startTime) && isBefore(slotEnd, event.endTime)) ||
        (isBefore(currentTime, event.startTime) && isAfter(slotEnd, event.endTime))
    );

    if (!isBooked) {
      const zonedStart = toZonedTime(currentTime, TIMEZONE);
      slots.push({
        startTime: currentTime,
        endTime: slotEnd,
        display: format(zonedStart, 'h:mm a', { timeZone: TIMEZONE }),
      });
    }

    currentTime = slotEnd;
  }

  return slots;
}

export function getNextAvailableSlot(
  bookedEvents: BookedEvent[] = []
): TimeSlot | null {
  let checkDate = new Date();

  // Check next 30 days for available slots
  for (let i = 0; i < 30; i++) {
    const slots = getAvailableSlots(checkDate, bookedEvents);
    if (slots.length > 0) {
      return slots[0]; // Return first available slot
    }
    checkDate = addMinutes(checkDate, 24 * 60); // Next day
  }

  return null;
}

export function isWorkDay(date: Date): boolean {
  const dayOfWeek = date.getDay();
  return dayOfWeek !== 0 && dayOfWeek !== 6; // Not weekend
}

export function getAvailableDays(startDate: Date, numDays: number = 30): Date[] {
  const days: Date[] = [];
  let currentDate = startDate;

  while (days.length < numDays) {
    if (isWorkDay(currentDate)) {
      days.push(new Date(currentDate));
    }
    currentDate = addMinutes(currentDate, 24 * 60);
  }

  return days;
}

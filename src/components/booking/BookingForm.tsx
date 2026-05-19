'use client';

import { useState, useEffect, useMemo } from 'react';
import { siteConfig } from '@/data/site-config';
import { Button } from '@/components/ui/button';
import { getAvailableSlots, type TimeSlot } from '@/lib/availabilityService';
import { generateICSContent, downloadICS } from '@/lib/icsService';
import { fetchICloudEvents, type CalendarEvent } from '@/lib/icalendarService';
import { format } from 'date-fns-tz';
import type { ServerAvailabilityResult } from '@/lib/serverCalendar';
import {
  startOfMonth,
  endOfMonth,
  startOfDay,
  endOfDay,
  addDays,
  addMonths,
  getDaysInMonth,
  isBefore,
  isToday,
  getDay,
} from 'date-fns';

interface BookingFormProps {
  onBooking?: (data: {
    name: string;
    email: string;
    date: Date;
    time: string;
    description: string;
  }) => void;
  initialData?: ServerAvailabilityResult;
}

type FormStep = 'date' | 'time' | 'details' | 'confirmation';

export function BookingForm({ onBooking, initialData }: BookingFormProps) {
  const [step, setStep] = useState<FormStep>('date');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    description: '',
  });
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [icsContent, setIcsContent] = useState<string>('');

  // Initialize events from server-pre-loaded data immediately — no fetch needed on first render
  const [monthEvents, setMonthEvents] = useState<CalendarEvent[]>(() =>
    initialData?.events?.map((e) => ({
      title: e.title,
      startTime: new Date(e.startTime),
      endTime: new Date(e.endTime),
    })) ?? []
  );

  // Track which months we already have events for.
  // Initialized from the 3 months covered by initialData so the per-month effect skips them.
  const [loadedMonths, setLoadedMonths] = useState<Set<string>>(() => {
    const set = new Set<string>();
    if (initialData?.events?.length) {
      const now = new Date();
      for (let i = 0; i < 3; i++) {
        set.add(format(startOfMonth(addMonths(now, i)), 'yyyy-MM'));
      }
    }
    return set;
  });

  const [currentMonth, setCurrentMonth] = useState<Date>(startOfMonth(new Date()));
  const [isLoadingMonth, setIsLoadingMonth] = useState(false);
  const [calendarError, setCalendarError] = useState<string | null>(
    initialData?.error
      ? 'Could not load calendar availability — some busy days may not be grayed out.'
      : null
  );

  const today = new Date();
  const todayMonth = startOfMonth(today);
  const maxMonth = addMonths(todayMonth, 2);

  // Derived: busy dates for the currently viewed month.
  // Automatically recomputes whenever the viewed month or event data changes.
  const busyDates = useMemo(() => {
    const busy = new Set<string>();
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    let day = start;
    while (day <= end) {
      const dayStart = startOfDay(day);
      const dayEnd = endOfDay(day);
      const dayEvs = monthEvents.filter(
        (e) => e.endTime > dayStart && e.startTime < dayEnd
      );
      if (getAvailableSlots(day, dayEvs).length === 0) {
        busy.add(format(day, 'yyyy-MM-dd'));
      }
      day = addDays(day, 1);
    }
    return busy;
  }, [currentMonth, monthEvents]);

  // Per-month fetch: fires when the user navigates to a new month.
  // Skips months already covered by initialData (or previously fetched).
  useEffect(() => {
    const monthKey = format(currentMonth, 'yyyy-MM');
    if (loadedMonths.has(monthKey)) return; // already have this month's data

    const load = async () => {
      setIsLoadingMonth(true);
      const start = startOfMonth(currentMonth);
      const end = endOfMonth(currentMonth);
      try {
        const events = await fetchICloudEvents(start, end);
        setCalendarError(null);
        // Append events for the new month, keeping other months' events intact
        setMonthEvents((prev) => {
          const notThisMonth = prev.filter(
            (e) =>
              e.endTime.getTime() <= start.getTime() ||
              e.startTime.getTime() >= end.getTime()
          );
          return [...notThisMonth, ...events];
        });
        setLoadedMonths(prev => new Set([...prev, monthKey]));
      } catch (error) {
        console.error('Error loading month availability:', error);
        setCalendarError(
          'Could not load calendar availability — some busy days may not be grayed out.'
        );
      } finally {
        setIsLoadingMonth(false);
      }
    };
    load();
  }, [currentMonth, loadedMonths]);

  const handleDateSelect = (date: Date) => {
    const dayStart = startOfDay(date);
    const dayEnd = endOfDay(date);
    const dayEvents = monthEvents.filter(
      (e) => e.endTime > dayStart && e.startTime < dayEnd
    );
    const slots = getAvailableSlots(date, dayEvents);
    setAvailableSlots(slots);
    setSelectedDate(date);
    setStep('time');
  };

  const handleTimeSelect = (slot: TimeSlot) => {
    setSelectedSlot(slot);
    setStep('details');
  };

  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleConfirmBooking = () => {
    if (!selectedDate || !selectedSlot || !formData.name || !formData.email) {
      alert('Please fill in all required fields');
      return;
    }

    const ics = generateICSContent({
      title: 'Meeting with Philip Sun',
      description: formData.description || 'Scheduled meeting',
      startTime: selectedSlot.startTime,
      endTime: selectedSlot.endTime,
      organizer: { name: siteConfig.name, email: siteConfig.email },
      attendee: { name: formData.name, email: formData.email },
    });

    setIcsContent(ics);

    if (onBooking) {
      onBooking({ ...formData, date: selectedDate, time: selectedSlot.display });
    }

    setStep('confirmation');
  };

  const handleDownloadICS = () => {
    if (icsContent) {
      downloadICS(icsContent, `meeting-${format(selectedDate!, 'yyyy-MM-dd')}.ics`);
    }
  };

  const handleEmailBooking = () => {
    if (formData.email && selectedDate && selectedSlot) {
      const subject = encodeURIComponent('Meeting Confirmation with Philip Sun');
      const body = encodeURIComponent(
        `Hi ${formData.name},\n\nYour meeting has been scheduled:\n\nDate: ${format(selectedDate, 'MMMM d, yyyy')}\nTime: ${selectedSlot.display} (Mountain Time)\nWith: ${siteConfig.name} (${siteConfig.email})\n\nPlease find the ICS file attached to add this to your calendar.\n\nBest regards,\n${siteConfig.name}`
      );
      window.location.href = `mailto:${formData.email}?subject=${subject}&body=${body}`;
    }
  };

  const renderCalendar = () => {
    const firstDay = startOfMonth(currentMonth);
    const daysInMonth = getDaysInMonth(currentMonth);
    const startOffset = getDay(firstDay); // 0=Sunday … 6=Saturday

    const dayHeaders = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
    const cells = [];

    // Empty cells before day 1
    for (let i = 0; i < startOffset; i++) {
      cells.push(<div key={`empty-${i}`} />);
    }

    // Day cells
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), d);
      const dateKey = format(date, 'yyyy-MM-dd');
      const dayOfWeek = date.getDay();
      const isPast = isBefore(date, startOfDay(today));
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      const isBusy = busyDates.has(dateKey);
      const isSelected = selectedDate?.toDateString() === date.toDateString();
      const isTodayDate = isToday(date);

      const isDisabled = isPast || isWeekend || isBusy;

      let cellClass = 'p-2 rounded-lg text-sm font-medium transition-colors ';
      if (isSelected) {
        cellClass += 'bg-[color:var(--color-ink)] text-[color:var(--color-paper)] ';
      } else if (isDisabled) {
        if (isBusy && !isPast && !isWeekend) {
          cellClass += 'text-gray-400 bg-gray-50 cursor-not-allowed ';
        } else {
          cellClass += 'text-gray-300 cursor-not-allowed ';
        }
      } else {
        cellClass += 'text-[color:var(--color-ink)] hover:bg-[color:var(--color-rule)]/40 cursor-pointer ';
      }

      if (isTodayDate && !isSelected) {
        cellClass += 'ring-1 ring-[color:var(--color-ink)] ';
      }

      cells.push(
        <button
          key={d}
          disabled={isDisabled}
          onClick={() => !isDisabled && handleDateSelect(date)}
          className={cellClass}
        >
          {d}
        </button>
      );
    }

    return (
      <div className="space-y-3">
        {/* Month navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setCurrentMonth((prev) => addMonths(prev, -1))}
            disabled={currentMonth.getTime() <= todayMonth.getTime()}
            className="p-2 rounded-lg text-[color:var(--color-ink)] hover:bg-[color:var(--color-rule)]/40 disabled:text-gray-300 disabled:cursor-not-allowed transition-colors"
            aria-label="Previous month"
          >
            ←
          </button>
          <span className="font-semibold text-[color:var(--color-ink)]">
            {format(currentMonth, 'MMMM yyyy')}
          </span>
          <button
            onClick={() => setCurrentMonth((prev) => addMonths(prev, 1))}
            disabled={currentMonth.getTime() >= maxMonth.getTime()}
            className="p-2 rounded-lg text-[color:var(--color-ink)] hover:bg-[color:var(--color-rule)]/40 disabled:text-gray-300 disabled:cursor-not-allowed transition-colors"
            aria-label="Next month"
          >
            →
          </button>
        </div>

        {/* Day-of-week headers + day cells */}
        <div className="grid grid-cols-7 gap-1 text-center">
          {dayHeaders.map((h) => (
            <div key={h} className="text-xs font-medium text-gray-500 py-1">
              {h}
            </div>
          ))}
          {cells}
        </div>

        {isLoadingMonth && (
          <p className="text-center text-sm text-gray-500 pt-1">
            Loading availability…
          </p>
        )}
      </div>
    );
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {step === 'date' && (
        <div className="space-y-6">
          <h3 className="text-2xl font-semibold text-[color:var(--color-ink)]">Select a Date</h3>
          <p className="text-[color:var(--color-ink-soft)]">
            Choose a weekday (Monday – Friday) to meet. All times are in Mountain Time.
          </p>
          {calendarError && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-3 text-sm text-yellow-700">
              ⚠ {calendarError}
            </div>
          )}
          {renderCalendar()}
        </div>
      )}

      {step === 'time' && selectedDate && (
        <div className="space-y-6">
          <h3 className="text-2xl font-semibold text-[color:var(--color-ink)]">Select a Time</h3>
          <p className="text-[color:var(--color-ink-soft)]">
            {format(selectedDate, 'MMMM d, yyyy')} – Available slots (Mountain Time):
          </p>

          <div className="grid grid-cols-3 gap-2">
            {availableSlots.length > 0 ? (
              availableSlots.map((slot, idx) => (
                <button
                  key={idx}
                  onClick={() => handleTimeSelect(slot)}
                  className={`p-3 rounded-lg border-2 transition-colors font-medium ${
                    selectedSlot === slot
                      ? 'border-[color:var(--color-ink)] bg-[color:var(--color-ink)] text-[color:var(--color-paper)]'
                      : 'border-[color:var(--color-rule)] hover:border-[color:var(--color-ink)] text-[color:var(--color-ink)]'
                  }`}
                >
                  {slot.display}
                </button>
              ))
            ) : (
              <p className="col-span-3 text-[color:var(--color-ink-soft)]">
                No available slots for this day
              </p>
            )}
          </div>

          <div className="flex gap-4">
            <Button
              onClick={() => setStep('date')}
              variant="outline"
              className="border-[color:var(--color-ink)] text-[color:var(--color-ink)]"
            >
              Back
            </Button>
            <Button
              onClick={() => setStep('details')}
              disabled={!selectedSlot}
              className="bg-[color:var(--color-ink)] text-[color:var(--color-paper)] hover:bg-[color:var(--color-accent)]"
            >
              Continue
            </Button>
          </div>
        </div>
      )}

      {step === 'details' && (
        <div className="space-y-6">
          <h3 className="text-2xl font-semibold text-[color:var(--color-ink)]">Your Details</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[color:var(--color-ink)] mb-2">
                Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleFormChange}
                placeholder="Your name"
                className="w-full px-4 py-2 border border-[color:var(--color-rule)] rounded-lg focus:outline-none focus:border-[color:var(--color-ink)]"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[color:var(--color-ink)] mb-2">
                Email *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleFormChange}
                placeholder="your@email.com"
                className="w-full px-4 py-2 border border-[color:var(--color-rule)] rounded-lg focus:outline-none focus:border-[color:var(--color-ink)]"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[color:var(--color-ink)] mb-2">
                Description (Optional)
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleFormChange}
                placeholder="What would you like to discuss?"
                rows={4}
                className="w-full px-4 py-2 border border-[color:var(--color-rule)] rounded-lg focus:outline-none focus:border-[color:var(--color-ink)]"
              />
            </div>
          </div>
          <div className="flex gap-4">
            <Button
              onClick={() => setStep('time')}
              variant="outline"
              className="border-[color:var(--color-ink)] text-[color:var(--color-ink)]"
            >
              Back
            </Button>
            <Button
              onClick={handleConfirmBooking}
              className="bg-[color:var(--color-ink)] text-[color:var(--color-paper)] hover:bg-[color:var(--color-accent)]"
            >
              Confirm Booking
            </Button>
          </div>
        </div>
      )}

      {step === 'confirmation' && (
        <div className="space-y-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <h3 className="text-2xl font-semibold text-green-700 mb-4">
              ✓ Booking Confirmed
            </h3>
            <div className="space-y-3 text-[color:var(--color-ink-soft)] mb-6">
              <p>
                <strong>Name:</strong> {formData.name}
              </p>
              <p>
                <strong>Email:</strong> {formData.email}
              </p>
              <p>
                <strong>Date:</strong>{' '}
                {selectedDate ? format(selectedDate, 'MMMM d, yyyy') : ''}
              </p>
              <p>
                <strong>Time:</strong> {selectedSlot?.display} (Mountain Time)
              </p>
              {formData.description && (
                <p>
                  <strong>Notes:</strong> {formData.description}
                </p>
              )}
            </div>
          </div>

          <div className="flex gap-4">
            <Button
              onClick={handleDownloadICS}
              className="bg-[color:var(--color-ink)] text-[color:var(--color-paper)] hover:bg-[color:var(--color-accent)]"
            >
              Download Calendar File (ICS)
            </Button>
            <Button
              onClick={handleEmailBooking}
              variant="outline"
              className="border-[color:var(--color-ink)] text-[color:var(--color-ink)]"
            >
              Email Confirmation
            </Button>
          </div>

          <Button
            onClick={() => {
              setStep('date');
              setSelectedDate(null);
              setSelectedSlot(null);
              setFormData({ name: '', email: '', description: '' });
            }}
            variant="outline"
            className="w-full border-[color:var(--color-ink)] text-[color:var(--color-ink)]"
          >
            Book Another Meeting
          </Button>
        </div>
      )}
    </div>
  );
}

'use client';

/**
 * @deprecated Photography bookings now use the Cal.com embed at
 * `/photography/book` (see `src/components/cal-embed.tsx` and
 * `siteConfig.cal` in `src/data/site-config.ts`). Cal.com handles
 * scheduling + Stripe deposit collection on the free tier.
 *
 * This custom form is preserved for reference and as a fallback if we
 * outgrow Cal.com — the matching `/api/checkout` and
 * `/api/webhooks/stripe` routes remain functional. Do not wire this
 * component back into any user-facing page without a migration plan.
 */
import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { photographyPackages, type Package } from '@/data/photography';
import { getAvailableSlots } from '@/lib/availabilityService';
import { fetchICloudEvents, type CalendarEvent } from '@/lib/icalendarService';
import type { ServerAvailabilityResult } from '@/lib/serverCalendar';
import { format } from 'date-fns-tz';
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
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── Types ────────────────────────────────────────────────────────────────────

type BookingStep = 1 | 2 | 3 | 4;

interface TimeSlot {
  startTime: Date;
  endTime: Date;
  display: string;
}

interface PhotographyBookingFormProps {
  initialData?: ServerAvailabilityResult;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(0)}`;
}

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours} hour${hours > 1 ? 's' : ''}`;
}

const STEP_NAMES: Record<BookingStep, string> = {
  1: 'Package',
  2: 'Date',
  3: 'Time',
  4: 'Details',
};

// ─── Step Indicator ───────────────────────────────────────────────────────────

function StepIndicator({ currentStep }: { currentStep: BookingStep }) {
  const steps: BookingStep[] = [1, 2, 3, 4];
  return (
    <nav aria-label="Booking progress" className="flex items-center mb-8">
      {steps.map((s, idx) => {
        const isCompleted = s < currentStep;
        const isCurrent = s === currentStep;
        return (
          <div key={s} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center">
              <span className="sr-only">
                {isCompleted
                  ? `Step ${s}: ${STEP_NAMES[s]} — complete`
                  : isCurrent
                  ? `Step ${s}: ${STEP_NAMES[s]} — current`
                  : `Step ${s}: ${STEP_NAMES[s]}`}
              </span>
              <div
                aria-current={isCurrent ? 'step' : undefined}
                aria-label={
                  isCompleted
                    ? `Step ${s}: ${STEP_NAMES[s]} — complete`
                    : undefined
                }
                className={cn(
                  'w-7 h-7 rounded-full flex items-center justify-center text-sm font-semibold transition-colors',
                  isCompleted && 'bg-[color:var(--color-ink)] text-[color:var(--color-paper)]',
                  isCurrent && 'bg-[color:var(--color-accent)] text-[color:var(--color-paper)] ring-2 ring-[color:var(--color-ink)]/30',
                  !isCompleted && !isCurrent && 'bg-gray-200 text-gray-500'
                )}
              >
                {s}
              </div>
              <span className="text-xs mt-1 text-gray-500 hidden sm:block">
                {STEP_NAMES[s]}
              </span>
            </div>
            {idx < steps.length - 1 && (
              <div
                className={cn(
                  'flex-1 h-px mx-2',
                  s < currentStep ? 'bg-[color:var(--color-ink)]' : 'bg-gray-200'
                )}
              />
            )}
          </div>
        );
      })}
    </nav>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function PhotographyBookingForm({ initialData }: PhotographyBookingFormProps) {
  const searchParams = useSearchParams();
  const sessionPackages = useMemo(
    () => photographyPackages.filter((pkg) => pkg.category === 'couples' || pkg.category === 'portrait'),
    []
  );

  // ── State ──────────────────────────────────────────────────────────────────
  const [step, setStep] = useState<BookingStep>(1);
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    notes: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  // ── Calendar State ─────────────────────────────────────────────────────────
  const [monthEvents, setMonthEvents] = useState<CalendarEvent[]>(() =>
    initialData?.events?.map((e) => ({
      title: e.title,
      startTime: new Date(e.startTime),
      endTime: new Date(e.endTime),
    })) ?? []
  );

  // BUG-03 fix: use functional update so loadedMonths participates in React state
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
      ? 'Could not load calendar availability — some busy days may not appear blocked.'
      : null
  );
  const availabilityWarning = calendarError;

  const today = new Date();
  const todayMonth = startOfMonth(today);
  const maxMonth = addMonths(todayMonth, 2);

  // ── URL param pre-selection ────────────────────────────────────────────────
  useEffect(() => {
    const pkgSlug = searchParams.get('pkg');
    if (pkgSlug) {
      const found = sessionPackages.find((p) => p.slug === pkgSlug);
      if (found) {
        setSelectedPackage(found);
      }
    }
  }, [searchParams, sessionPackages]);

  // ── Cancelled payment banner ───────────────────────────────────────────────
  const isCancelled = searchParams.get('cancelled') === 'true';

  // ── Busy dates memo ────────────────────────────────────────────────────────
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

  // ── Per-month fetch ────────────────────────────────────────────────────────
  useEffect(() => {
    const monthKey = format(currentMonth, 'yyyy-MM');
    if (loadedMonths.has(monthKey)) return;

    const load = async () => {
      setIsLoadingMonth(true);
      const start = startOfMonth(currentMonth);
      const end = endOfMonth(currentMonth);
      try {
        const events = await fetchICloudEvents(start, end);
        setCalendarError(null);
        setMonthEvents((prev) => {
          const notThisMonth = prev.filter(
            (e) =>
              e.endTime.getTime() <= start.getTime() ||
              e.startTime.getTime() >= end.getTime()
          );
          return [...notThisMonth, ...events];
        });
        // BUG-03: use functional update, not mutation
        setLoadedMonths((prev) => new Set([...prev, monthKey]));
      } catch (error) {
        console.error('Error loading month availability:', error);
        setCalendarError(
          'Could not load calendar availability — some busy days may not appear blocked.'
        );
      } finally {
        setIsLoadingMonth(false);
      }
    };
    load();
  }, [currentMonth, loadedMonths]);

  // ── Handlers ───────────────────────────────────────────────────────────────

  const handleDateSelect = (date: Date) => {
    const dayStart = startOfDay(date);
    const dayEnd = endOfDay(date);
    const dayEvents = monthEvents.filter(
      (e) => e.endTime > dayStart && e.startTime < dayEnd
    );
    const slots = getAvailableSlots(date, dayEvents);
    setAvailableSlots(slots as TimeSlot[]);
    setSelectedDate(date);
    setSelectedSlot(null);
    setStep(3);
  };

  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const validateField = (name: string, value: string): string | null => {
    if (name === 'name') {
      if (!value.trim() || value.trim().length < 2) return 'Please enter your name.';
    }
    if (name === 'email') {
      if (!value.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()))
        return 'Please enter a valid email address.';
    }
    return null;
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const error = validateField(name, value);
    if (error) {
      setErrors((prev) => ({ ...prev, [name]: error }));
    }
  };

  const handleProceedToPayment = async () => {
    const nameError = validateField('name', formData.name);
    const emailError = validateField('email', formData.email);
    const fieldErrors: Record<string, string> = {};
    if (nameError) fieldErrors['name'] = nameError;
    if (emailError) fieldErrors['email'] = emailError;

    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors);
      const firstKey = Object.keys(fieldErrors)[0];
      const el = document.querySelector<HTMLElement>(`[name="${firstKey}"]`);
      el?.focus();
      return;
    }

    if (!selectedPackage || !selectedSlot) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          packageId: selectedPackage.id,
          clientName: formData.name,
          clientEmail: formData.email,
          phone: formData.phone,
          notes: formData.notes,
          eventDate: selectedSlot.startTime.toISOString(),
        }),
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const data = await res.json();
      window.location.href = data.url;
    } catch (err) {
      console.error('Checkout error:', err);
      setSubmitError(
        'Something went wrong with payment. Your spot is still open — try again or contact Philip directly.'
      );
      setIsSubmitting(false);
    }
  };

  // ── Calendar render ────────────────────────────────────────────────────────

  const renderCalendar = () => {
    const firstDay = startOfMonth(currentMonth);
    const daysInMonth = getDaysInMonth(currentMonth);
    const startOffset = getDay(firstDay);

    const dayHeaders = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
    const cells: React.ReactNode[] = [];

    for (let i = 0; i < startOffset; i++) {
      cells.push(<div key={`empty-${i}`} />);
    }

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
          aria-disabled={isDisabled ? 'true' : undefined}
          onClick={() => !isDisabled && handleDateSelect(date)}
          className={cellClass}
        >
          {d}
        </button>
      );
    }

    return (
      <div className="space-y-3">
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

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="w-full">
      {/* Cancelled payment banner */}
      {isCancelled && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-3 text-sm text-yellow-800 mb-6">
          Payment was cancelled. Your slot is not reserved until checkout is completed, so please review your details and start a new payment attempt when you&apos;re ready.
        </div>
      )}

      {/* Step indicator */}
      <StepIndicator currentStep={step} />

      {/* Step 1 — Package Selection */}
      {step === 1 && (
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold text-[color:var(--color-ink)]">Choose Your Package</h2>

          {availabilityWarning && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-3 text-sm text-yellow-800 space-y-1">
              <p>{availabilityWarning}</p>
              <p>If this calendar looks wrong, send an inquiry and I will confirm availability manually.</p>
            </div>
          )}

          <div className="space-y-4">
            {sessionPackages.map((pkg) => {
              const isSelected = selectedPackage?.id === pkg.id;
              return (
                <button
                  key={pkg.id}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => setSelectedPackage(pkg)}
                  className={cn(
                    'w-full text-left border rounded-xl p-6 cursor-pointer transition-all duration-150',
                    'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--color-accent)]',
                    isSelected
                      ? 'border-[color:var(--color-ink)] ring-2 ring-[color:var(--color-ink)]/20'
                      : 'border-gray-200 hover:border-[color:var(--color-accent)] hover:shadow-sm'
                  )}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="text-base font-semibold text-[color:var(--color-ink)]">{pkg.name}</h3>
                      <p className="text-sm text-gray-600 mt-1">{pkg.description}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-lg font-semibold text-[color:var(--color-ink)] tabular-nums">
                        {formatPrice(pkg.priceInCents)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-4">
                    <Badge variant="secondary">
                      {formatDuration(pkg.durationMinutes)}
                    </Badge>
                    <Badge variant="outline">
                      {formatPrice(pkg.depositInCents)} deposit
                    </Badge>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="flex justify-end">
            <Button
              onClick={() => setStep(2)}
              disabled={selectedPackage === null}
              className={cn(
                'bg-[color:var(--color-ink)] text-[color:var(--color-paper)] hover:bg-[color:var(--color-accent)]',
                selectedPackage === null && 'opacity-50 cursor-not-allowed'
              )}
            >
              Continue
            </Button>
          </div>
        </div>
      )}

      {/* Step 2 — Date Selection */}
      {step === 2 && (
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold text-[color:var(--color-ink)]">Select a Date</h2>
          <p className="text-gray-600">
            Choose a weekday for your session. All times are Mountain Time.
          </p>

          {availabilityWarning && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-3 text-sm text-yellow-800 space-y-1">
              <p>{availabilityWarning}</p>
              <p>If this calendar looks wrong, send an inquiry and I will confirm availability manually.</p>
            </div>
          )}

          {renderCalendar()}

          <div className="flex justify-between">
            <Button
              onClick={() => setStep(1)}
              variant="outline"
              className="border-[color:var(--color-ink)] text-[color:var(--color-ink)]"
            >
              Back
            </Button>
          </div>
        </div>
      )}

      {/* Step 3 — Time Slot Selection */}
      {step === 3 && (
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold text-[color:var(--color-ink)]">Pick a Time</h2>
          {selectedDate && (
            <p className="text-gray-600">
              {format(selectedDate, 'MMMM d, yyyy', { timeZone: 'America/Denver' })} — Mountain Time
            </p>
          )}

          {availableSlots.length > 0 ? (
            <div className="grid grid-cols-3 gap-2">
              {availableSlots.map((slot, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedSlot(slot)}
                  className={cn(
                    'p-3 rounded-lg border-2 transition-colors font-medium text-sm',
                    selectedSlot === slot
                      ? 'border-[color:var(--color-ink)] bg-[color:var(--color-ink)] text-[color:var(--color-paper)]'
                      : 'border-[color:var(--color-rule)] hover:border-[color:var(--color-ink)] text-[color:var(--color-ink)]'
                  )}
                >
                  {slot.display}
                </button>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">
              No available times on this day. Try a different date.
            </p>
          )}

          <div className="flex justify-between">
            <Button
              onClick={() => setStep(2)}
              variant="outline"
              className="border-[color:var(--color-ink)] text-[color:var(--color-ink)]"
            >
              Back
            </Button>
            <Button
              onClick={() => setStep(4)}
              disabled={selectedSlot === null}
              className={cn(
                'bg-[color:var(--color-ink)] text-[color:var(--color-paper)] hover:bg-[color:var(--color-accent)]',
                selectedSlot === null && 'opacity-50 cursor-not-allowed'
              )}
            >
              Continue
            </Button>
          </div>
        </div>
      )}

      {/* Step 4 — Client Details */}
      {step === 4 && (
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold text-[color:var(--color-ink)]">Your Details</h2>

          {/* Booking summary */}
          {selectedPackage && selectedDate && selectedSlot && (
            <div className="bg-gray-50 rounded-xl p-4 text-sm space-y-1">
              <p>
                <span className="font-medium text-[color:var(--color-ink)]">Package:</span>{' '}
                {selectedPackage.name}
              </p>
              <p>
                <span className="font-medium text-[color:var(--color-ink)]">Date:</span>{' '}
                {format(selectedDate, 'MMMM d, yyyy', { timeZone: 'America/Denver' })}
              </p>
              <p>
                <span className="font-medium text-[color:var(--color-ink)]">Time:</span>{' '}
                {selectedSlot.display} (Mountain Time)
              </p>
              <p>
                <span className="font-medium text-[color:var(--color-ink)]">Deposit:</span>{' '}
                {formatPrice(selectedPackage.depositInCents)}
              </p>
            </div>
          )}

          <div className="space-y-4">
            {/* Name */}
            <div>
              <label
                htmlFor="booking-name"
                className="block text-sm font-medium text-[color:var(--color-ink)] mb-1"
              >
                Your Name{' '}
                <span aria-hidden="true">*</span>
                <span className="sr-only">required</span>
              </label>
              <input
                id="booking-name"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleFormChange}
                onBlur={handleBlur}
                placeholder="Jane Smith"
                className="w-full px-4 py-2 border border-[color:var(--color-rule)] rounded-lg focus:outline-none focus:border-[color:var(--color-ink)] text-base"
                required
              />
              {errors.name && (
                <p role="alert" className="text-sm text-red-600 mt-1">
                  {errors.name}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="booking-email"
                className="block text-sm font-medium text-[color:var(--color-ink)] mb-1"
              >
                Email Address{' '}
                <span aria-hidden="true">*</span>
                <span className="sr-only">required</span>
              </label>
              <input
                id="booking-email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleFormChange}
                onBlur={handleBlur}
                placeholder="jane@example.com"
                className="w-full px-4 py-2 border border-[color:var(--color-rule)] rounded-lg focus:outline-none focus:border-[color:var(--color-ink)] text-base"
                required
              />
              {errors.email && (
                <p role="alert" className="text-sm text-red-600 mt-1">
                  {errors.email}
                </p>
              )}
            </div>

            {/* Notes */}
            <div>
              <label
                htmlFor="booking-notes"
                className="block text-sm font-medium text-[color:var(--color-ink)] mb-1"
              >
                Notes (optional)
              </label>
              <textarea
                id="booking-notes"
                name="notes"
                value={formData.notes}
                onChange={handleFormChange}
                placeholder="Shoot goals, preferred location, or anything else to know"
                rows={4}
                className="w-full px-4 py-2 border border-[color:var(--color-rule)] rounded-lg focus:outline-none focus:border-[color:var(--color-ink)] text-base"
              />
            </div>
          </div>

          <p className="text-sm text-gray-500">
            Deposit secures your date. Balance due on the day of the shoot.
          </p>

          {submitError && (
            <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">
              {submitError}
            </div>
          )}

          <div className="flex justify-between">
            <Button
              onClick={() => setStep(3)}
              variant="outline"
              className="border-[color:var(--color-ink)] text-[color:var(--color-ink)]"
            >
              Back
            </Button>
            <Button
              onClick={handleProceedToPayment}
              disabled={isSubmitting}
              className="bg-[color:var(--color-ink)] text-[color:var(--color-paper)] hover:bg-[color:var(--color-accent)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin mr-2 h-4 w-4" />
                  Processing…
                </>
              ) : (
                'Proceed to Payment'
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

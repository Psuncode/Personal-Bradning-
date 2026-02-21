'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { getAvailableSlots, getAvailableDays, isWorkDay } from '@/lib/availabilityService';
import { generateICSContent, downloadICS } from '@/lib/icsService';
import { format } from 'date-fns-tz';

const TIMEZONE = 'America/Denver';

interface BookingFormProps {
  onBooking?: (data: {
    name: string;
    email: string;
    date: Date;
    time: string;
    description: string;
  }) => void;
}

type FormStep = 'date' | 'time' | 'details' | 'confirmation';

export function BookingForm({ onBooking }: BookingFormProps) {
  const [step, setStep] = useState<FormStep>('date');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    description: '',
  });
  const [availableSlots, setAvailableSlots] = useState<any[]>([]);
  const [icsContent, setIcsContent] = useState<string>('');

  const handleDateSelect = (date: Date) => {
    if (isWorkDay(date)) {
      setSelectedDate(date);
      const slots = getAvailableSlots(date);
      setAvailableSlots(slots);
      setStep('time');
    }
  };

  const handleTimeSelect = (slot: any) => {
    setSelectedSlot(slot);
    setStep('details');
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleConfirmBooking = () => {
    if (!selectedDate || !selectedSlot || !formData.name || !formData.email) {
      alert('Please fill in all required fields');
      return;
    }

    // Generate ICS content
    const eventTitle = 'Meeting with Philip Sun';
    const ics = generateICSContent({
      title: eventTitle,
      description: formData.description || 'Scheduled meeting',
      startTime: selectedSlot.startTime,
      endTime: selectedSlot.endTime,
      organizer: {
        name: 'Philip Sun',
        email: 'ps324@byu.edu',
      },
      attendee: {
        name: formData.name,
        email: formData.email,
      },
    });

    setIcsContent(ics);

    if (onBooking) {
      onBooking({
        ...formData,
        date: selectedDate,
        time: selectedSlot.display,
      });
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
        `Hi ${formData.name},\n\nYour meeting has been scheduled:\n\nDate: ${format(selectedDate, 'MMMM d, yyyy')}\nTime: ${selectedSlot.display} (Mountain Time)\nWith: Philip Sun (ps324@byu.edu)\n\nPlease find the ICS file attached to add this to your calendar.\n\nBest regards,\nPhilip Sun`
      );
      window.location.href = `mailto:${formData.email}?subject=${subject}&body=${body}`;
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {step === 'date' && (
        <div className="space-y-6">
          <h3 className="text-2xl font-semibold text-byu-navy">Select a Date</h3>
          <p className="text-byu-dark-gray">
            Choose a weekday (Monday - Friday) to meet.
          </p>
          <div className="grid grid-cols-7 gap-2">
            {getAvailableDays(new Date(), 30).slice(0, 35).map((date) => (
              <button
                key={date.toISOString()}
                onClick={() => handleDateSelect(date)}
                className={`p-3 rounded-lg border-2 transition-colors text-sm font-medium ${
                  selectedDate?.toDateString() === date.toDateString()
                    ? 'border-byu-navy bg-byu-navy text-white'
                    : 'border-byu-sky/30 hover:border-byu-navy text-byu-navy'
                }`}
              >
                {format(date, 'd')}
              </button>
            ))}
          </div>
          <div className="text-center">
            {selectedDate && (
              <p className="text-byu-dark-gray mb-4">
                Selected: {format(selectedDate, 'MMMM d, yyyy')}
              </p>
            )}
          </div>
        </div>
      )}

      {step === 'time' && selectedDate && (
        <div className="space-y-6">
          <h3 className="text-2xl font-semibold text-byu-navy">Select a Time</h3>
          <p className="text-byu-dark-gray">
            {format(selectedDate, 'MMMM d, yyyy')} - Available slots (Mountain Time):
          </p>
          <div className="grid grid-cols-3 gap-2">
            {availableSlots.length > 0 ? (
              availableSlots.map((slot, idx) => (
                <button
                  key={idx}
                  onClick={() => handleTimeSelect(slot)}
                  className={`p-3 rounded-lg border-2 transition-colors font-medium ${
                    selectedSlot === slot
                      ? 'border-byu-navy bg-byu-navy text-white'
                      : 'border-byu-sky/30 hover:border-byu-navy text-byu-navy'
                  }`}
                >
                  {slot.display}
                </button>
              ))
            ) : (
              <p className="col-span-3 text-byu-dark-gray">No available slots for this day</p>
            )}
          </div>
          <div className="flex gap-4">
            <Button
              onClick={() => setStep('date')}
              variant="outline"
              className="border-byu-navy text-byu-navy"
            >
              Back
            </Button>
            <Button
              onClick={() => setStep('details')}
              disabled={!selectedSlot}
              className="bg-byu-navy hover:bg-byu-blue"
            >
              Continue
            </Button>
          </div>
        </div>
      )}

      {step === 'details' && (
        <div className="space-y-6">
          <h3 className="text-2xl font-semibold text-byu-navy">Your Details</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-byu-navy mb-2">Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleFormChange}
                placeholder="Your name"
                className="w-full px-4 py-2 border border-byu-sky/30 rounded-lg focus:outline-none focus:border-byu-navy"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-byu-navy mb-2">Email *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleFormChange}
                placeholder="your@email.com"
                className="w-full px-4 py-2 border border-byu-sky/30 rounded-lg focus:outline-none focus:border-byu-navy"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-byu-navy mb-2">Description (Optional)</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleFormChange}
                placeholder="What would you like to discuss?"
                rows={4}
                className="w-full px-4 py-2 border border-byu-sky/30 rounded-lg focus:outline-none focus:border-byu-navy"
              />
            </div>
          </div>
          <div className="flex gap-4">
            <Button
              onClick={() => setStep('time')}
              variant="outline"
              className="border-byu-navy text-byu-navy"
            >
              Back
            </Button>
            <Button
              onClick={handleConfirmBooking}
              className="bg-byu-navy hover:bg-byu-blue"
            >
              Confirm Booking
            </Button>
          </div>
        </div>
      )}

      {step === 'confirmation' && (
        <div className="space-y-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <h3 className="text-2xl font-semibold text-green-700 mb-4">✓ Booking Confirmed</h3>
            <div className="space-y-3 text-byu-dark-gray mb-6">
              <p><strong>Name:</strong> {formData.name}</p>
              <p><strong>Email:</strong> {formData.email}</p>
              <p><strong>Date:</strong> {selectedDate ? format(selectedDate, 'MMMM d, yyyy') : ''}</p>
              <p><strong>Time:</strong> {selectedSlot?.display} (Mountain Time)</p>
              {formData.description && (
                <p><strong>Notes:</strong> {formData.description}</p>
              )}
            </div>
          </div>

          <div className="flex gap-4">
            <Button
              onClick={handleDownloadICS}
              className="bg-byu-blue hover:bg-byu-navy"
            >
              Download Calendar File (ICS)
            </Button>
            <Button
              onClick={handleEmailBooking}
              variant="outline"
              className="border-byu-navy text-byu-navy"
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
            className="w-full border-byu-navy text-byu-navy"
          >
            Book Another Meeting
          </Button>
        </div>
      )}
    </div>
  );
}

import { useState } from 'react';

export function MeetPage() {
  const [selectedDate, setSelectedDate] = useState<number | null>(7);

  // Generate calendar dates for demo purposes
  const calendarDates = [
    [2, 3, 4, 5, 6, 9, 10],
    [11, 12, 13, 16, 17, 18, 19],
    [20, 23, 24, 25, 26, 27, 30],
    [31, 1, 2, 3, 6, 7, 8],
    [9, 10]
  ];

  return (
    <div className="min-h-screen bg-white pt-32 pb-24 px-6 md:px-12">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="font-['Playfair_Display'] text-4xl md:text-5xl text-gray-900 mb-4">
            Book a Meeting
          </h1>
          <p className="font-['Inter'] text-gray-600 max-w-2xl mx-auto">
            Select an available time slot to meet with me. All times are in Mountain Time (MT).
          </p>
        </div>

        {/* Calendar Section */}
        <div className="bg-white rounded-2xl border border-gray-200 p-8 md:p-12 mb-8">
          <div className="mb-8">
            <h2 className="font-['Inter'] text-2xl font-semibold text-gray-900 mb-3">
              Select a Date
            </h2>
            <p className="font-['Inter'] text-gray-600">
              Choose a weekday (Monday - Friday) to meet. All times are in Mountain Time.
            </p>
          </div>

          {/* Calendar Grid */}
          <div className="space-y-4">
            {calendarDates.map((week, weekIndex) => (
              <div key={weekIndex} className="grid grid-cols-7 gap-4">
                {week.map((date, dateIndex) => (
                  <button
                    key={`${weekIndex}-${dateIndex}`}
                    onClick={() => setSelectedDate(date)}
                    className={`
                      h-14 flex items-center justify-center rounded-lg font-['Inter'] text-lg
                      transition-all
                      ${selectedDate === date
                        ? 'border-2 border-gray-900 bg-white text-gray-900'
                        : 'border border-gray-200 bg-white text-gray-700 hover:border-gray-400'
                      }
                    `}
                  >
                    {date}
                  </button>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Footer Message */}
        <div className="text-center">
          <p className="font-['Inter'] text-gray-600">
            Can't find a time that works? Feel free to reach out on{' '}
            <a 
              href="https://www.linkedin.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-[#0077B5] hover:underline"
            >
              LinkedIn
            </a>
            .
          </p>
        </div>

        {/* Implementation Note */}
        <div className="mt-12 p-6 bg-blue-50 border border-blue-200 rounded-xl">
          <h3 className="font-['Inter'] font-semibold text-gray-900 mb-3">
            📅 To Activate Calendar Booking
          </h3>
          <div className="font-['Inter'] text-sm text-gray-700 space-y-2">
            <p className="mb-3">
              To enable live booking functionality, integrate with a calendar service:
            </p>
            
            <div className="space-y-3">
              <div className="pl-4">
                <p className="font-semibold mb-1">Option 1: Calendly (Recommended)</p>
                <ol className="list-decimal list-inside space-y-1 text-gray-600 pl-2">
                  <li>Sign up at <a href="https://calendly.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">calendly.com</a></li>
                  <li>Create your event type</li>
                  <li>Get your scheduling link</li>
                  <li>Install: <code className="bg-gray-100 px-2 py-1 rounded">npm install react-calendly</code></li>
                  <li>Add to this page: <code className="bg-gray-100 px-2 py-1 rounded">&lt;InlineWidget url="your-calendly-link" /&gt;</code></li>
                </ol>
              </div>

              <div className="pl-4">
                <p className="font-semibold mb-1">Option 2: Cal.com (Open Source)</p>
                <p className="text-gray-600 pl-2">Similar to Calendly, free and self-hostable alternative</p>
              </div>

              <div className="pl-4">
                <p className="font-semibold mb-1">Option 3: Google Calendar Appointment Slots</p>
                <p className="text-gray-600 pl-2">Free with Google Workspace, embed directly</p>
              </div>
            </div>

            <p className="mt-4 pt-4 border-t border-blue-300">
              <strong>For now:</strong> Visitors can email you at{' '}
              <a href="mailto:ps324@byu.edu" className="text-blue-600 hover:underline">
                ps324@byu.edu
              </a>
              {' '}or message you on LinkedIn to schedule.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

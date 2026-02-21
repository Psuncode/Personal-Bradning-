# Apple iCloud Calendar Integration Setup Guide

## Overview
Your booking system is now set up to integrate with your personal iCloud calendar. This guide walks you through configuring it.

## Prerequisites
- Apple iCloud account with calendar enabled
- App-specific password (for security)
- Calendar identifier

## Step 1: Generate App-Specific Password

1. Go to [Apple ID Account](https://appleid.apple.com/)
2. Click "Security"
3. Under "App-Specific Passwords", click "Generate password"
4. Select "Other App" and type "Booking System"
5. Apple will generate a password like: `xxxx-xxxx-xxxx-xxxx`
6. Copy and save this password

## Step 2: Find Your Calendar ID

1. Go to [iCloud.com](https://www.icloud.com/)
2. Sign in to your iCloud account
3. Open Calendar
4. Right-click on your calendar name (in the left sidebar)
5. Select "Share Settings" or look for settings
6. Look for the calendar URL or ID
   - Usually formatted like: `philip.sun@icloud.com`
   - Or a UUID like: `A1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6@icloud.com`

## Step 3: Configure Environment Variables

Create a `.env.local` file in your project root:

```env
ICAL_USERNAME=your-icloud@icloud.com
ICAL_PASSWORD=xxxx-xxxx-xxxx-xxxx
ICAL_CALENDAR_ID=your-calendar-id
ICAL_SERVER=https://caldav.icloud.com
```

### Example:
```env
ICAL_USERNAME=philip.sun@icloud.com
ICAL_PASSWORD=wxyz-abcd-efgh-ijkl
ICAL_CALENDAR_ID=philip.sun@icloud.com
ICAL_SERVER=https://caldav.icloud.com
```

## Step 4: Verify Configuration

1. Start the development server: `npm run dev`
2. Visit `/meet`
3. Select a date
4. The system should fetch your calendar events
5. You'll see error messages in the console if credentials are incorrect

## Step 5: Deploy to Vercel (if using Vercel)

1. Go to your Vercel project settings
2. Add environment variables:
   - `ICAL_USERNAME`
   - `ICAL_PASSWORD`
   - `ICAL_CALENDAR_ID`
   - `ICAL_SERVER`
3. Redeploy your project

## Troubleshooting

### "Calendar credentials not configured" error
- Check that all environment variables are set correctly
- Verify `.env.local` file exists (for local development)
- For Vercel, check Project Settings > Environment Variables

### "Failed to fetch calendar events" error
- Verify app-specific password is correct
- Check iCloud calendar ID is correct
- Ensure iCloud account has calendar enabled
- Check that CalDAV is enabled in iCloud settings

### No events showing up
- Verify calendar ID points to the right calendar
- Check that events are actually scheduled in iCloud Calendar
- Look at browser console for detailed error messages

## How It Works

1. User selects a date on `/meet`
2. Frontend calls `/api/calendar` endpoint
3. Backend authenticates to iCloud CalDAV using credentials
4. Backend fetches events for that date
5. Frontend removes booked times from available slots
6. User only sees actually free 30-minute slots
7. 9 AM - 5 PM Mountain Time, Monday-Friday only

## Security Notes

- **Never** commit `.env.local` to git (already in .gitignore)
- App-specific passwords are safer than regular passwords
- Credentials are stored server-side, never exposed to frontend
- API endpoint validates all date inputs

## Future Enhancements

- [ ] Add tsdav library for direct CalDAV integration
- [ ] Support multiple calendars
- [ ] Add timezone handling for different user locations
- [ ] Cache calendar events for 15 minutes
- [ ] Add rate limiting to API endpoint
- [ ] Support recurring event exceptions
- [ ] Add email notifications for bookings

## Testing with Mock Data

While credentials are not configured, the system returns mock data:
- One "Team Standup" event 9-10 AM
- All other slots shown as available
- Perfect for testing the booking flow

## Related Files

- `/api/calendar/route.ts` - Backend API endpoint
- `/lib/icalendarService.ts` - Calendar utilities
- `/components/booking/BookingForm.tsx` - Frontend integration
- `/lib/availabilityService.ts` - Slot calculation logic

## Support

For issues with iCloud Calendar setup, visit:
- [Apple iCloud Help](https://support.apple.com/icloud)
- [CalDAV Documentation](https://en.wikipedia.org/wiki/CalDAV)

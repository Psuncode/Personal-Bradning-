# Apple iCloud Calendar Integration Setup

This guide helps you connect your Apple Calendar to the booking system for real availability.

## Current Status

The booking system supports:
- ✅ Multi-step booking UI with date and time selection
- ✅ 30-minute availability slots
- ✅ ICS file generation for calendar invites
- ✅ Backend CalDAV integration (awaiting credentials)

## Setup Instructions

### Step 1: Create App-Specific Password

1. Go to [appleid.apple.com](https://appleid.apple.com)
2. Click "Security" → "App-Specific Passwords"
3. Click the "+" icon and generate a password for "Website Booking"
4. Apple will give you a 16-character password (e.g., `xzzv-upns-bzmz-ibep`)
5. Keep this password secure - it's different from your iCloud password

### Step 2: Find Your Calendar Information

**iCloud Email:**
- This is your iCloud email address (e.g., `name@icloud.com`)
- Should be the same as your iCloud login

**Calendar ID:**
- Open the Calendar app on macOS or iOS
- Right-click your calendar → "Get Info"
- You should see an email-style identifier
- Could be a username format (e.g., `name@icloud.com`) or UUID
- Note: If you use a family calendar, use the primary calendar email

### Step 3: Configure Environment Variables

Create or update `.env.local` in your project root:

```bash
ICAL_USERNAME=your-icloud@icloud.com
ICAL_PASSWORD=xxxx-xxxx-xxxx-xxxx
ICAL_CALENDAR_ID=your-calendar-id
ICAL_SERVER=https://caldav.icloud.com
```

### Step 4: Test the Connection

1. Start the development server: `npm run dev`
2. Navigate to the "/meet" page
3. Select a date - it should attempt to fetch real events
4. Check the browser console and server logs for errors

## Troubleshooting

### "iCloud authentication failed - check credentials"

This means the CalDAV server rejected the credentials. Check:

1. **Is your app-specific password correct?**
   - Make sure you copied the entire password without spaces
   - It should be 16 characters in format: `xxxx-xxxx-xxxx-xxxx`
   - Don't use your regular iCloud password

2. **Is the password active?**
   - Go to appleid.apple.com → Security
   - Check if the password is listed as active
   - If not, regenerate a new one

3. **Is your iCloud email correct?**
   - Should match your actual iCloud email (ends with @icloud.com)
   - Not a forwarding email or alias

4. **Do you have CalDAV enabled?**
   - Some iCloud accounts have CalDAV disabled
   - Check Settings → iCloud → Calendar is enabled
   - You may need to enable "Calendars" in the iCloud settings

### "No calendars found"

1. Verify you have at least one calendar in iCloud
2. The calendar should be visible in the Calendar app
3. Try using your iCloud email as the calendar ID first

### Events not showing up

1. Make sure the calendar ID is correct
2. Check that events are within the selected date range
3. Look at server logs: `tail -f /tmp/server.log`

## Server Logs

When debugging, check the server output for detailed logs:

```bash
npm run dev
# Look for messages like:
# - "Connecting to https://caldav.icloud.com as..."
# - "Fetching calendars..."
# - "Using calendar: ..."
# - "Fetching events from..."
```

## API Response Format

The `/api/calendar` endpoint returns:

```json
{
  "success": true,
  "events": [
    {
      "title": "Meeting",
      "startTime": "2026-02-21T14:00:00.000Z",
      "endTime": "2026-02-21T15:00:00.000Z"
    }
  ],
  "dateRange": {
    "start": "2026-02-21T00:00:00Z",
    "end": "2026-02-28T00:00:00Z"
  },
  "eventCount": 1
}
```

## Contact Information

Email: ps324@byu.edu

For booking inquiries and technical support, please use the contact form or send an email.

## Additional Resources

- [Apple Support: App-Specific Passwords](https://support.apple.com/en-us/105056)
- [iCloud CalDAV Support](https://support.apple.com/en-us/119195)
- [WebDAV/CalDAV Documentation](https://caldav.icloud.com/)

# Google Calendar Integration

This document explains how to use the Google Calendar integration to fetch events and birthdays.

## Setup

1. **Environment Variables**: The `NEXT_PUBLIC_GOOGLE_CLIENT_ID` is already configured in `.env`

2. **Google Cloud Console Setup**:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Enable the Google Calendar API
   - Configure OAuth consent screen
   - Add authorized JavaScript origins (e.g., `http://localhost:9002`)
   - Add authorized redirect URIs

## Usage

### Server-Side (API Routes)

The integration provides two API endpoints:

#### Fetch Events
```typescript
GET /api/calendar/events
Headers: Authorization: Bearer {access_token}
Query params:
  - timeMin: ISO date string (optional)
  - timeMax: ISO date string (optional)
  - maxResults: number (optional)
```

#### Fetch Birthdays
```typescript
GET /api/calendar/birthdays
Headers: Authorization: Bearer {access_token}
Query params:
  - timeMin: ISO date string (optional)
  - timeMax: ISO date string (optional)
  - maxResults: number (optional)
```

### Client-Side (React Hook)

Use the `useGoogleCalendar` hook:

```typescript
import { useGoogleCalendar } from '@/hooks/useGoogleCalendar';
import { signInWithGoogle } from '@/lib/google-auth';

function MyComponent() {
  const { events, birthdays, loading, error, fetchEvents, fetchBirthdays } = useGoogleCalendar();
  
  const handleAuth = async () => {
    const token = await signInWithGoogle();
    await fetchEvents(token);
    await fetchBirthdays(token);
  };
  
  return (
    <button onClick={handleAuth}>Connect Calendar</button>
  );
}
```

### Direct Service Usage

For server-side operations:

```typescript
import { GoogleCalendarService } from '@/lib/google-calendar';

const service = new GoogleCalendarService(accessToken);

// Fetch events
const events = await service.fetchEvents({
  timeMin: new Date(),
  maxResults: 10,
});

// Fetch birthdays
const birthdays = await service.fetchBirthdays({
  timeMin: new Date(),
  maxResults: 10,
});

// List all calendars
const calendars = await service.listCalendars();
```

## Example Component

See `src/components/calendar/GoogleCalendarExample.tsx` for a complete working example.

## Features

- ✅ OAuth 2.0 authentication
- ✅ Fetch events from primary calendar
- ✅ Fetch birthdays from contacts calendar
- ✅ Fetch events from any calendar
- ✅ List all user calendars
- ✅ TypeScript support
- ✅ React hooks for easy integration
- ✅ Server-side API routes

## API Reference

### CalendarEvent Interface

```typescript
interface CalendarEvent {
  id: string;
  summary: string;
  description?: string;
  start: {
    dateTime?: string;
    date?: string;
  };
  end: {
    dateTime?: string;
    date?: string;
  };
  location?: string;
  attendees?: Array<{
    email: string;
    displayName?: string;
    responseStatus?: string;
  }>;
}
```

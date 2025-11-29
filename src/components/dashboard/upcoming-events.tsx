'use client';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { useCurrency } from '@/contexts/currency-context';
import { Calendar as CalendarIcon } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '../ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';

// Type declaration for Google Identity Services
declare global {
  interface Window {
    google: any;
  }
  const google: any;
}

// A simple regex to find amounts in event titles (e.g., "$50", "€120", "150 INR")
const amountRegex = /(?:USD|EUR|INR|\$|€|₹)\s*(\d+(?:\.\d{1,2})?)/i;

const parseAmountFromTitle = (title: string): number | null => {
  const match = title.match(amountRegex);
  if (match && match[1]) {
    return parseFloat(match[1]);
  }
  return null;
};

export function UpcomingEvents() {
  const { formatCurrency } = useCurrency();
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [needsAuth, setNeedsAuth] = useState(false);
  const { user, idToken, accessToken, loading: authLoading } = useAuth();

  const requestCalendarAccess = async () => {
    try {
      setLoading(true);
      setError(null);
      setNeedsAuth(false);

      // Request calendar access using Google Identity Services
      const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
      if (!clientId) {
        throw new Error('Google Client ID not configured');
      }

      // Load Google Identity Services if not already loaded
      if (!window.google) {
        await new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.src = 'https://accounts.google.com/gsi/client';
          script.async = true;
          script.defer = true;
          script.onload = resolve;
          script.onerror = reject;
          document.body.appendChild(script);
        });
      }

      // Request access token
      const client = google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: 'https://www.googleapis.com/auth/calendar.readonly',
        callback: async (response: any) => {
          if (response.access_token) {
            sessionStorage.setItem('google-access-token', response.access_token);
            // Fetch events with the new token
            await fetchEventsWithToken(response.access_token);
          } else {
            setError('Failed to get calendar access');
            setLoading(false);
          }
        },
      });

      client.requestAccessToken();
    } catch (e) {
      console.error('Error requesting calendar access:', e);
      setError('Failed to request calendar access');
      setLoading(false);
    }
  };

  const fetchEventsWithToken = async (token: string) => {
    try {
      const calendarResponse = await fetch('/api/google/calendar-events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessToken: token }),
      });

      if (!calendarResponse.ok) {
        const errorData = await calendarResponse.json();
        if (calendarResponse.status === 401) {
          setNeedsAuth(true);
          setError('Calendar access expired. Please reconnect.');
        } else {
          throw new Error(errorData.error || 'Failed to fetch calendar events');
        }
        return;
      }

      const data = await calendarResponse.json();
      console.log('Fetched events:', data.events);
      setEvents(data.events || []);
      setNeedsAuth(false);
    } catch (e) {
      console.error('Error fetching events:', e);
      setError('Failed to fetch calendar events.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Wait until authentication is fully resolved
    if (authLoading) {
      return;
    }

    if (!user || !idToken) {
      setLoading(false);
      return;
    }

    const fetchEvents = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!accessToken) {
          console.log('No access token found, needs authentication');
          setNeedsAuth(true);
          setLoading(false);
          return;
        }

        await fetchEventsWithToken(accessToken);
      } catch (e) {
        console.error('Error in fetchEvents:', e);
        setError('Failed to fetch calendar events.');
        setLoading(false);
      }
    };

    fetchEvents();
  }, [user, idToken, accessToken, authLoading]);

  const renderEvents = () => {
    // The component's own loading state should be used for skeletons
    if (loading) {
      return Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
          <Skeleton className="h-6 w-20" />
        </div>
      ));
    }

    if (error || needsAuth) {
      return (
        <div className="text-center space-y-4 pt-4">
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button onClick={requestCalendarAccess} variant="outline">
            Connect Google Calendar
          </Button>
        </div>
      );
    }

    // After loading, if we're not authenticated (e.g. token expired), show a message
    if (!user) {
      return (
        <p className="text-sm text-center text-muted-foreground pt-4">
          Sign in to see your upcoming events.
        </p>
      );
    }

    if (events.length === 0) {
      return (
        <p className="text-sm text-center text-muted-foreground pt-4">
          No upcoming events found in your calendar.
        </p>
      );
    }

    return events.map((event) => {
      const amount = parseAmountFromTitle(event.summary);
      const isBill = !!amount || /due|bill|payment/i.test(event.summary);
      const eventDate = event.start.dateTime || event.start.date;

      return (
        <div key={event.id} className="flex items-center gap-4">
          <div className="p-3 bg-muted rounded-full">
            <CalendarIcon className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="grid gap-1 flex-1">
            <p className="text-sm font-medium leading-none">{event.summary}</p>
            <p className="text-sm text-muted-foreground">
              {new Date(eventDate).toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'short',
                day: 'numeric',
              })}
            </p>
          </div>
          {isBill && (
            <Badge variant={amount ? 'destructive' : 'outline'}>
              {amount ? `Bill: ${formatCurrency(amount)}` : 'Bill'}
            </Badge>
          )}
        </div>
      );
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upcoming Bills & Events</CardTitle>
        <CardDescription>Heads up! These are coming soon.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">{renderEvents()}</CardContent>
    </Card>
  );
}

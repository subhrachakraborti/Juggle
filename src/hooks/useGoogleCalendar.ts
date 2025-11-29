import { useState, useCallback } from 'react';
import { CalendarEvent } from '@/lib/google-calendar';

export function useGoogleCalendar() {
    const [events, setEvents] = useState<CalendarEvent[]>([]);
    const [birthdays, setBirthdays] = useState<CalendarEvent[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchEvents = useCallback(async (accessToken: string, options?: {
        timeMin?: Date;
        timeMax?: Date;
        maxResults?: number;
    }) => {
        setLoading(true);
        setError(null);

        try {
            const params = new URLSearchParams();
            if (options?.timeMin) params.append('timeMin', options.timeMin.toISOString());
            if (options?.timeMax) params.append('timeMax', options.timeMax.toISOString());
            if (options?.maxResults) params.append('maxResults', options.maxResults.toString());

            const response = await fetch(`/api/calendar/events?${params}`, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                },
            });

            if (!response.ok) {
                throw new Error('Failed to fetch events');
            }

            const data = await response.json();
            setEvents(data.events);
            return data.events;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Unknown error';
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchBirthdays = useCallback(async (accessToken: string, options?: {
        timeMin?: Date;
        timeMax?: Date;
        maxResults?: number;
    }) => {
        setLoading(true);
        setError(null);

        try {
            const params = new URLSearchParams();
            if (options?.timeMin) params.append('timeMin', options.timeMin.toISOString());
            if (options?.timeMax) params.append('timeMax', options.timeMax.toISOString());
            if (options?.maxResults) params.append('maxResults', options.maxResults.toString());

            const response = await fetch(`/api/calendar/birthdays?${params}`, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                },
            });

            if (!response.ok) {
                throw new Error('Failed to fetch birthdays');
            }

            const data = await response.json();
            setBirthdays(data.birthdays);
            return data.birthdays;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Unknown error';
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        events,
        birthdays,
        loading,
        error,
        fetchEvents,
        fetchBirthdays,
    };
}

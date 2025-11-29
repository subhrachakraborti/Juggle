'use client';

import { useState } from 'react';
import { signInWithGoogle } from '@/lib/google-auth';
import { useGoogleCalendar } from '@/hooks/useGoogleCalendar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export function GoogleCalendarExample() {
    const [accessToken, setAccessToken] = useState<string | null>(null);
    const { events, birthdays, loading, error, fetchEvents, fetchBirthdays } = useGoogleCalendar();

    const handleSignIn = async () => {
        try {
            const token = await signInWithGoogle();
            setAccessToken(token);
        } catch (err) {
            console.error('Failed to sign in:', err);
        }
    };

    const handleFetchEvents = async () => {
        if (!accessToken) return;

        try {
            await fetchEvents(accessToken, {
                timeMin: new Date(),
                maxResults: 10,
            });
        } catch (err) {
            console.error('Failed to fetch events:', err);
        }
    };

    const handleFetchBirthdays = async () => {
        if (!accessToken) return;

        try {
            await fetchBirthdays(accessToken, {
                timeMin: new Date(),
                maxResults: 10,
            });
        } catch (err) {
            console.error('Failed to fetch birthdays:', err);
        }
    };

    return (
        <div className="space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle>Google Calendar Integration</CardTitle>
                    <CardDescription>
                        Connect your Google Calendar to view events and birthdays
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {!accessToken ? (
                        <Button onClick={handleSignIn}>
                            Sign in with Google
                        </Button>
                    ) : (
                        <div className="space-y-2">
                            <p className="text-sm text-green-600">✓ Connected to Google Calendar</p>
                            <div className="flex gap-2">
                                <Button onClick={handleFetchEvents} disabled={loading}>
                                    Fetch Events
                                </Button>
                                <Button onClick={handleFetchBirthdays} disabled={loading}>
                                    Fetch Birthdays
                                </Button>
                            </div>
                        </div>
                    )}

                    {error && (
                        <p className="text-sm text-red-600">Error: {error}</p>
                    )}
                </CardContent>
            </Card>

            {events.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Upcoming Events</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-2">
                            {events.map((event) => (
                                <li key={event.id} className="border-b pb-2">
                                    <p className="font-medium">{event.summary}</p>
                                    <p className="text-sm text-muted-foreground">
                                        {event.start.dateTime
                                            ? new Date(event.start.dateTime).toLocaleString()
                                            : event.start.date}
                                    </p>
                                    {event.description && (
                                        <p className="text-sm">{event.description}</p>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>
            )}

            {birthdays.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Upcoming Birthdays</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-2">
                            {birthdays.map((birthday) => (
                                <li key={birthday.id} className="border-b pb-2">
                                    <p className="font-medium">{birthday.summary}</p>
                                    <p className="text-sm text-muted-foreground">
                                        {birthday.start.date}
                                    </p>
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}

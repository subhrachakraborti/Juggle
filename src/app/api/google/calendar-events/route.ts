import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';

export async function POST(request: NextRequest) {
    try {
        const { accessToken } = await request.json();

        if (!accessToken) {
            return NextResponse.json({ error: 'Missing accessToken' }, { status: 400 });
        }

        const oauthClient = new google.auth.OAuth2();
        oauthClient.setCredentials({
            access_token: accessToken,
        });

        const calendar = google.calendar({ version: 'v3', auth: oauthClient });

        const res = await calendar.events.list({
            calendarId: 'primary',
            timeMin: new Date().toISOString(),
            maxResults: 15,
            singleEvents: true,
            orderBy: 'startTime',
        });

        const events = res.data.items || [];

        const formattedEvents = events.map((event) => ({
            id: event.id || 'unknown-id',
            summary: event.summary || 'No Title',
            start: {
                dateTime: event.start?.dateTime,
                date: event.start?.date,
            },
        }));

        console.log(`Fetched ${formattedEvents.length} calendar events`);

        return NextResponse.json({ events: formattedEvents });
    } catch (error: any) {
        console.error('Error fetching calendar events:', error.response?.data || error.message);

        if (error.response?.data?.error?.code === 401) {
            return NextResponse.json(
                { error: 'Calendar authentication failed. Please sign in again.' },
                { status: 401 }
            );
        }

        return NextResponse.json(
            { error: 'Failed to fetch calendar events', details: error.message },
            { status: 500 }
        );
    }
}

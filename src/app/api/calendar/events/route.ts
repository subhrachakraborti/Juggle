import { NextRequest, NextResponse } from 'next/server';
import { GoogleCalendarService } from '@/lib/google-calendar';

export async function GET(request: NextRequest) {
    try {
        const authHeader = request.headers.get('authorization');

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json(
                { error: 'Missing or invalid authorization header' },
                { status: 401 }
            );
        }

        const accessToken = authHeader.substring(7);
        const calendarService = new GoogleCalendarService(accessToken);

        const searchParams = request.nextUrl.searchParams;
        const timeMin = searchParams.get('timeMin');
        const timeMax = searchParams.get('timeMax');
        const maxResults = searchParams.get('maxResults');

        const events = await calendarService.fetchEvents({
            timeMin: timeMin ? new Date(timeMin) : undefined,
            timeMax: timeMax ? new Date(timeMax) : undefined,
            maxResults: maxResults ? parseInt(maxResults) : undefined,
        });

        return NextResponse.json({ events });
    } catch (error) {
        console.error('Error in calendar events API:', error);
        return NextResponse.json(
            { error: 'Failed to fetch calendar events' },
            { status: 500 }
        );
    }
}

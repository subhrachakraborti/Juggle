import { google } from 'googleapis';

export interface CalendarEvent {
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

export class GoogleCalendarService {
    private calendar;

    constructor(accessToken: string) {
        const oauth2Client = new google.auth.OAuth2();
        oauth2Client.setCredentials({ access_token: accessToken });

        this.calendar = google.calendar({ version: 'v3', auth: oauth2Client });
    }

    /**
     * Fetch events from the user's primary calendar
     */
    async fetchEvents(options?: {
        timeMin?: Date;
        timeMax?: Date;
        maxResults?: number;
    }): Promise<CalendarEvent[]> {
        try {
            const response = await this.calendar.events.list({
                calendarId: 'primary',
                timeMin: (options?.timeMin || new Date()).toISOString(),
                timeMax: options?.timeMax?.toISOString(),
                maxResults: options?.maxResults || 100,
                showDeleted: false,
                singleEvents: true,
                orderBy: 'startTime',
            });

            return (response.data.items || []) as CalendarEvent[];
        } catch (error) {
            console.error('Error fetching calendar events:', error);
            throw error;
        }
    }

    /**
     * Fetch birthdays from the contacts calendar
     */
    async fetchBirthdays(options?: {
        timeMin?: Date;
        timeMax?: Date;
        maxResults?: number;
    }): Promise<CalendarEvent[]> {
        try {
            const response = await this.calendar.events.list({
                calendarId: 'addressbook#contacts@group.v.calendar.google.com',
                timeMin: (options?.timeMin || new Date()).toISOString(),
                timeMax: options?.timeMax?.toISOString(),
                maxResults: options?.maxResults || 100,
                showDeleted: false,
                singleEvents: true,
                orderBy: 'startTime',
            });

            return (response.data.items || []) as CalendarEvent[];
        } catch (error) {
            console.error('Error fetching birthdays:', error);
            throw error;
        }
    }

    /**
     * Fetch events from a specific calendar
     */
    async fetchEventsFromCalendar(
        calendarId: string,
        options?: {
            timeMin?: Date;
            timeMax?: Date;
            maxResults?: number;
        }
    ): Promise<CalendarEvent[]> {
        try {
            const response = await this.calendar.events.list({
                calendarId,
                timeMin: (options?.timeMin || new Date()).toISOString(),
                timeMax: options?.timeMax?.toISOString(),
                maxResults: options?.maxResults || 100,
                showDeleted: false,
                singleEvents: true,
                orderBy: 'startTime',
            });

            return (response.data.items || []) as CalendarEvent[];
        } catch (error) {
            console.error(`Error fetching events from calendar ${calendarId}:`, error);
            throw error;
        }
    }

    /**
     * List all calendars for the user
     */
    async listCalendars() {
        try {
            const response = await this.calendar.calendarList.list();
            return response.data.items || [];
        } catch (error) {
            console.error('Error listing calendars:', error);
            throw error;
        }
    }
}

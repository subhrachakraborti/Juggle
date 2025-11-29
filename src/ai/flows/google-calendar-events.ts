'use server';

import { google, Auth } from 'googleapis';
import { z } from 'zod';
import { getAuth as getAdminAuth } from 'firebase-admin/auth';
import { headers } from 'next/headers';
import { getFirebaseAdmin } from '@/firebase/admin';

const CalendarEventSchema = z.array(
  z.object({
    id: z.string(),
    summary: z.string().optional().nullable(),
    start: z.object({
      dateTime: z.string().optional().nullable(),
      date: z.string().optional().nullable(),
    }),
  })
);
export type ListCalendarEventsOutput = z.infer<typeof CalendarEventSchema>;


async function getDecodedToken(idToken?: string, accessToken?: string) {
  getFirebaseAdmin();

  if (!idToken || !accessToken) {
    try {
      const allHeaders = await headers();
      idToken = idToken || allHeaders.get('Authorization')?.replace('Bearer ', '') || undefined;
      accessToken = accessToken || allHeaders.get('X-Goog-Auth-User-Token') || undefined;
    } catch (e) {
    }
  }

  if (!idToken) {
    throw new Error('User is not authenticated. No Authorization header found.');
  }
  if (!accessToken) {
    throw new Error('User is not authenticated. No Access Token header found.');
  }

  try {
    const decodedToken = await getAdminAuth().verifyIdToken(idToken);
    return { decodedToken, accessToken };
  } catch (error) {
    console.error('Error verifying ID token:', error);
    throw new Error('Invalid authentication token.');
  }
}

export async function listCalendarEvents(idToken?: string, accessToken?: string): Promise<ListCalendarEventsOutput> {
  try {
    const { decodedToken, accessToken: token } = await getDecodedToken(idToken, accessToken);
    console.log('Fetching calendar for user:', decodedToken.uid);

    const oauthClient = new Auth.OAuth2Client();
    oauthClient.setCredentials({
      access_token: token,
    });

    const calendar = google.calendar({ version: 'v3', auth: oauthClient });
    const res = await calendar.events.list({
      calendarId: 'primary',
      timeMin: new Date().toISOString(),
      maxResults: 15,
      singleEvents: true,
      orderBy: 'startTime',
    });

    const events = res.data.items;
    if (!events || events.length === 0) {
      return [];
    }

    return events.map((event) => ({
      id: event.id || 'unknown-id',
      summary: event.summary || 'No Title',
      start: {
        dateTime: event.start?.dateTime,
        date: event.start?.date,
      },
    }));
  } catch (error: any) {
    console.error('Error fetching calendar events:', error.response?.data || error.message);
    if (error.response?.data?.error?.code === 401) {
      console.warn("Google Calendar authentication failed. The user may need to re-grant permission.");
    }
    return [];
  }
}

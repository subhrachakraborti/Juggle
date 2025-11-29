export const GOOGLE_SCOPES = [
    'https://www.googleapis.com/auth/calendar.readonly',
    'https://www.googleapis.com/auth/calendar.events.readonly',
];

export interface GoogleAuthResponse {
    access_token: string;
    expires_in: number;
    scope: string;
    token_type: string;
}

/**
 * Initialize Google OAuth and get access token
 * This uses the Google Identity Services library
 */
export function initGoogleAuth(clientId: string): Promise<GoogleAuthResponse> {
    return new Promise((resolve, reject) => {
        if (typeof window === 'undefined') {
            reject(new Error('Google Auth can only be initialized in the browser'));
            return;
        }

        // Load the Google Identity Services library
        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;

        script.onload = () => {
            const client = google.accounts.oauth2.initTokenClient({
                client_id: clientId,
                scope: GOOGLE_SCOPES.join(' '),
                callback: (response: GoogleAuthResponse) => {
                    if (response.access_token) {
                        resolve(response);
                    } else {
                        reject(new Error('Failed to get access token'));
                    }
                },
                error_callback: (error: any) => {
                    reject(error);
                },
            });

            client.requestAccessToken();
        };

        script.onerror = () => {
            reject(new Error('Failed to load Google Identity Services'));
        };

        document.body.appendChild(script);
    });
}

/**
 * Sign in with Google and get access token
 */
export async function signInWithGoogle(): Promise<string> {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

    if (!clientId) {
        throw new Error('Google Client ID is not configured');
    }

    const response = await initGoogleAuth(clientId);
    return response.access_token;
}

// Type declaration for Google Identity Services
declare global {
    interface Window {
        google: any;
    }
    const google: any;
}

import { NextRequest, NextResponse } from 'next/server';
import { PlaidApi, Configuration, PlaidEnvironments, Products, CountryCode } from 'plaid';
import { jwtDecode } from 'jwt-decode';

const configuration = new Configuration({
    basePath: PlaidEnvironments[process.env.PLAID_ENV || 'sandbox'],
    baseOptions: {
        headers: {
            'PLAID-CLIENT-ID': process.env.NEXT_PUBLIC_PLAID_CLIENT_ID,
            'PLAID-SECRET': process.env.PLAID_SECRET,
        },
    },
});

const plaidClient = new PlaidApi(configuration);

export async function POST(request: NextRequest) {
    try {
        // Check if Plaid credentials are configured
        if (!process.env.NEXT_PUBLIC_PLAID_CLIENT_ID || !process.env.PLAID_SECRET) {
            console.error('Plaid credentials not configured');
            return NextResponse.json(
                { error: 'Plaid is not configured. Please add PLAID_CLIENT_ID and PLAID_SECRET to your environment variables.' },
                { status: 500 }
            );
        }

        const authHeader = request.headers.get('Authorization');
        if (!authHeader) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const idToken = authHeader.replace('Bearer ', '');
        const decodedToken: { user_id: string } = jwtDecode(idToken);
        const userId = decodedToken.user_id;

        const tokenResponse = await plaidClient.linkTokenCreate({
            user: { client_user_id: userId },
            client_name: 'Juggle',
            products: [Products.Transactions],
            country_codes: [CountryCode.Us],
            language: 'en',
            webhook: 'https://webhook.example.com',
        });

        return NextResponse.json({ link_token: tokenResponse.data.link_token });
    } catch (error: any) {
        console.error('Error creating link token:', error);
        const errorMessage = error.response?.data?.error_message || error.message || 'Unknown error';
        return NextResponse.json(
            { error: 'Failed to create link token', details: errorMessage },
            { status: 500 }
        );
    }
}

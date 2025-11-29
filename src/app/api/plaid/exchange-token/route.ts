import { NextRequest, NextResponse } from 'next/server';
import { PlaidApi, Configuration, PlaidEnvironments } from 'plaid';

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
        console.log('Exchange token endpoint called');

        const body = await request.json();
        const { public_token } = body;
        console.log('Received public_token:', public_token ? 'present' : 'missing');

        if (!public_token) {
            console.error('Missing public_token in request body');
            return NextResponse.json({ error: 'Missing public_token' }, { status: 400 });
        }

        console.log('Calling Plaid API to exchange token...');
        const response = await plaidClient.itemPublicTokenExchange({
            public_token,
        });

        const accessToken = response.data.access_token;
        const itemId = response.data.item_id;
        console.log('Token exchanged successfully, itemId:', itemId);

        return NextResponse.json({
            success: true,
            accessToken,
            itemId
        });
    } catch (error: any) {
        console.error('Error exchanging public token:', error);
        console.error('Error details:', {
            message: error.message,
            response: error.response?.data,
        });
        return NextResponse.json(
            {
                error: 'Failed to exchange token',
                details: error.message,
                plaidError: error.response?.data
            },
            { status: 500 }
        );
    }
}

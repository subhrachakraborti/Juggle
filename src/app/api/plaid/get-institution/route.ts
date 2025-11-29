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
        const { accessToken } = await request.json();

        if (!accessToken) {
            return NextResponse.json({ error: 'Missing accessToken' }, { status: 400 });
        }

        const itemResponse = await plaidClient.itemGet({
            access_token: accessToken,
        });
        const institutionId = itemResponse.data.item.institution_id;

        let institutionName = 'Unknown Bank';
        if (institutionId) {
            try {
                const institutionResponse = await plaidClient.institutionsGetById({
                    institution_id: institutionId,
                    country_codes: ['US' as any],
                });
                institutionName = institutionResponse.data.institution.name;
            } catch (e) {
                console.error('Error fetching institution:', e);
            }
        }

        const accountsResponse = await plaidClient.accountsGet({
            access_token: accessToken,
        });

        const accounts = accountsResponse.data.accounts.map((acc) => ({
            id: acc.account_id,
            name: acc.name,
            officialName: acc.official_name,
            type: acc.type,
            subtype: acc.subtype,
            mask: acc.mask,
            balance: acc.balances.current,
        }));

        return NextResponse.json({
            institutionName,
            accounts,
        });
    } catch (error: any) {
        console.error('Error fetching institution:', error.response?.data || error.message);
        return NextResponse.json(
            { error: 'Failed to fetch institution', details: error.message },
            { status: 500 }
        );
    }
}

import { NextRequest, NextResponse } from 'next/server';
import { PlaidApi, Configuration, PlaidEnvironments, TransactionsSyncRequest } from 'plaid';
import { getFirebaseAdmin } from '@/firebase/admin';
import { getFirestore } from 'firebase-admin/firestore';
import { jwtDecode } from 'jwt-decode';

getFirebaseAdmin();
const db = getFirestore();

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

export async function GET(request: NextRequest) {
    try {
        const authHeader = request.headers.get('Authorization');
        if (!authHeader) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const idToken = authHeader.replace('Bearer ', '');
        const decodedToken: { user_id: string } = jwtDecode(idToken);
        const userId = decodedToken.user_id;

        const plaidItemDoc = await db.collection('plaid_items').doc(userId).get();

        if (!plaidItemDoc.exists) {
            return NextResponse.json({ error: 'No Plaid account connected' }, { status: 404 });
        }

        const plaidItem = plaidItemDoc.data();
        const accessToken = plaidItem?.accessToken;
        const itemId = plaidItem?.itemId;

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

        let cursor = plaidItem?.cursor || null;
        let transactions: any[] = [];
        let hasMore = true;

        console.log(`Fetching transactions for user ${userId}, cursor: ${cursor}`);

        while (hasMore) {
            const syncRequest: TransactionsSyncRequest = {
                access_token: accessToken,
                cursor: cursor || undefined,
            };
            const response = await plaidClient.transactionsSync(syncRequest);
            const data = response.data;

            transactions = transactions.concat(data.added);
            hasMore = data.has_more;
            cursor = data.next_cursor;
        }

        console.log(`Fetched ${transactions.length} transactions from Plaid`);

        return NextResponse.json({
            accounts,
            transactions,
            cursor,
            institutionName,
            itemId,
        });
    } catch (error: any) {
        console.error('Error fetching transactions from Plaid:', error.response?.data || error.message);
        return NextResponse.json(
            { error: 'Failed to fetch transactions', details: error.message },
            { status: 500 }
        );
    }
}

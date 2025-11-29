import { NextRequest, NextResponse } from 'next/server';
import { PlaidApi, Configuration, PlaidEnvironments, TransactionsSyncRequest } from 'plaid';

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
        const { accessToken, cursor } = await request.json();

        if (!accessToken) {
            return NextResponse.json({ error: 'Missing accessToken' }, { status: 400 });
        }

        let currentCursor = cursor || null;
        let allAdded: any[] = [];
        let allModified: any[] = [];
        let allRemoved: any[] = [];
        let hasMore = true;

        console.log(`Fetching transactions, initial cursor: ${currentCursor}`);

        while (hasMore) {
            const syncRequest: TransactionsSyncRequest = {
                access_token: accessToken,
                cursor: currentCursor || undefined,
            };
            const response = await plaidClient.transactionsSync(syncRequest);
            const data = response.data;

            console.log(`Sync iteration: added=${data.added.length}, modified=${data.modified.length}, removed=${data.removed.length}, has_more=${data.has_more}`);

            allAdded = allAdded.concat(data.added);
            allModified = allModified.concat(data.modified);
            allRemoved = allRemoved.concat(data.removed);
            hasMore = data.has_more;
            currentCursor = data.next_cursor;
        }

        const transactions = [...allAdded, ...allModified];

        console.log(`Sync complete: ${allAdded.length} added, ${allModified.length} modified, ${allRemoved.length} removed. Total: ${transactions.length}`);

        return NextResponse.json({
            transactions,
            cursor: currentCursor,
            stats: {
                added: allAdded.length,
                modified: allModified.length,
                removed: allRemoved.length,
                total: transactions.length,
            },
        });
    } catch (error: any) {
        console.error('Error syncing transactions:', error.response?.data || error.message);
        return NextResponse.json(
            { error: 'Failed to sync transactions', details: error.message },
            { status: 500 }
        );
    }
}

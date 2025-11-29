import { NextRequest, NextResponse } from 'next/server';
import { PlaidApi, Configuration, PlaidEnvironments, TransactionsSyncRequest, Transaction as PlaidSdkTransaction, RemovedTransaction } from 'plaid';
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

async function processTransactions(
    userId: string,
    added: PlaidSdkTransaction[],
    modified: PlaidSdkTransaction[],
    removed: RemovedTransaction[]
) {
    const batch = db.batch();

    added.forEach((tx) => {
        const docRef = db.collection('users').doc(userId).collection('transactions').doc(tx.transaction_id);
        batch.set(docRef, tx);
    });

    modified.forEach((tx) => {
        const docRef = db.collection('users').doc(userId).collection('transactions').doc(tx.transaction_id);
        batch.update(docRef, tx as any);
    });

    removed.forEach((tx) => {
        const docRef = db.collection('users').doc(userId).collection('transactions').doc(tx.transaction_id);
        batch.delete(docRef);
    });

    await batch.commit();
    console.log(`Processed ${added.length} added, ${modified.length} modified, ${removed.length} removed transactions.`);
}

export async function POST(request: NextRequest) {
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
        let cursor = plaidItem?.cursor || null;
        let added: PlaidSdkTransaction[] = [];
        let modified: PlaidSdkTransaction[] = [];
        let removed: RemovedTransaction[] = [];
        let hasMore = true;

        console.log(`Starting transaction sync for user ${userId}, cursor: ${cursor}`);

        while (hasMore) {
            const syncRequest: TransactionsSyncRequest = {
                access_token: plaidItem?.accessToken,
                cursor: cursor || undefined,
            };
            const response = await plaidClient.transactionsSync(syncRequest);
            const data = response.data;

            added = added.concat(data.added);
            modified = modified.concat(data.modified);
            removed = removed.concat(data.removed);
            hasMore = data.has_more;
            cursor = data.next_cursor;
        }

        console.log(`Sync complete: ${added.length} added, ${modified.length} modified, ${removed.length} removed`);

        await processTransactions(userId, added, modified, removed);

        const plaidItemRef = db.collection('plaid_items').doc(userId);
        await plaidItemRef.update({ cursor: cursor });

        return NextResponse.json({ success: true, added: added.length, modified: modified.length, removed: removed.length });
    } catch (error: any) {
        console.error('Error syncing transactions:', error.response?.data || error.message);
        return NextResponse.json(
            { error: 'Failed to sync transactions', details: error.message },
            { status: 500 }
        );
    }
}

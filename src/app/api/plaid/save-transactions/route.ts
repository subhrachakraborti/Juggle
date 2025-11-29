import { NextRequest, NextResponse } from 'next/server';
import { getFirebaseAdmin } from '@/firebase/admin';
import { getFirestore } from 'firebase-admin/firestore';
import { jwtDecode } from 'jwt-decode';

getFirebaseAdmin();
const db = getFirestore();

export async function POST(request: NextRequest) {
    try {
        const authHeader = request.headers.get('Authorization');
        if (!authHeader) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const idToken = authHeader.replace('Bearer ', '');
        const decodedToken: { user_id: string } = jwtDecode(idToken);
        const userId = decodedToken.user_id;

        const { transactions, cursor } = await request.json();

        if (!transactions || !Array.isArray(transactions)) {
            return NextResponse.json({ error: 'Invalid transactions data' }, { status: 400 });
        }

        const batch = db.batch();

        transactions.forEach((tx: any) => {
            const docRef = db
                .collection('users')
                .doc(userId)
                .collection('transactions')
                .doc(tx.transaction_id);
            batch.set(docRef, tx);
        });

        await batch.commit();

        if (cursor) {
            const plaidItemRef = db.collection('plaid_items').doc(userId);
            await plaidItemRef.update({ cursor });
        }

        console.log(`Saved ${transactions.length} transactions to Firestore for user ${userId}`);

        return NextResponse.json({
            success: true,
            saved: transactions.length,
        });
    } catch (error: any) {
        console.error('Error saving transactions:', error);
        return NextResponse.json(
            { error: 'Failed to save transactions', details: error.message },
            { status: 500 }
        );
    }
}

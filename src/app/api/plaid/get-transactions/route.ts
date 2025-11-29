import { NextRequest, NextResponse } from 'next/server';
import { getFirebaseAdmin } from '@/firebase/admin';
import { getFirestore } from 'firebase-admin/firestore';
import { jwtDecode } from 'jwt-decode';

getFirebaseAdmin();
const db = getFirestore();

export async function GET(request: NextRequest) {
    try {
        const authHeader = request.headers.get('Authorization');
        if (!authHeader) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const idToken = authHeader.replace('Bearer ', '');
        const decodedToken: { user_id: string } = jwtDecode(idToken);
        const userId = decodedToken.user_id;

        const transactionsRef = db.collection('users').doc(userId).collection('transactions');
        const snapshot = await transactionsRef.orderBy('date', 'desc').get();

        if (snapshot.empty) {
            return NextResponse.json({ transactions: [] });
        }

        const transactions = snapshot.docs.map((doc) => doc.data());

        return NextResponse.json({ transactions });
    } catch (error: any) {
        console.error('Error fetching transactions:', error);
        return NextResponse.json(
            { error: 'Failed to fetch transactions', details: error.message },
            { status: 500 }
        );
    }
}

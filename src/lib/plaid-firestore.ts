import { getFirestore, doc, setDoc, collection, getDocs, query, orderBy, updateDoc, writeBatch, getDoc } from 'firebase/firestore';
import { getApp } from 'firebase/app';

const db = getFirestore(getApp());

export async function savePlaidItem(userId: string, accessToken: string, itemId: string, institutionName?: string) {
    const plaidItemRef = doc(db, 'plaid_items', userId);
    await setDoc(plaidItemRef, {
        userId,
        accessToken,
        itemId,
        cursor: null,
        institutionName: institutionName || null,
        createdAt: new Date(),
    });

    const userRef = doc(db, 'users', userId);
    await setDoc(userRef, { isPlaidConnected: true }, { merge: true });
}

export async function updatePlaidItemInstitution(userId: string, institutionName: string) {
    const plaidItemRef = doc(db, 'plaid_items', userId);
    await updateDoc(plaidItemRef, { institutionName });
}

export async function getPlaidItem(userId: string) {
    const plaidItemRef = doc(db, 'plaid_items', userId);
    const docSnap = await getDoc(plaidItemRef);

    if (!docSnap.exists()) {
        return null;
    }

    return docSnap.data();
}

export async function saveTransactions(userId: string, transactions: any[]) {
    const batch = writeBatch(db);

    transactions.forEach((tx) => {
        const txRef = doc(db, 'users', userId, 'transactions', tx.transaction_id);
        batch.set(txRef, tx);
    });

    await batch.commit();
}

export async function updatePlaidCursor(userId: string, cursor: string) {
    const plaidItemRef = doc(db, 'plaid_items', userId);
    await updateDoc(plaidItemRef, { cursor });
}

export async function getStoredTransactions(userId: string): Promise<any[]> {
    const transactionsRef = collection(db, 'users', userId, 'transactions');
    const q = query(transactionsRef, orderBy('date', 'desc'));
    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => doc.data());
}

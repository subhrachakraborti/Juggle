import {
  PlaidApi,
  Configuration,
  PlaidEnvironments,
  Products,
  CountryCode,
  TransactionsSyncRequest,
  RemovedTransaction,
  Transaction as PlaidSdkTransaction,
} from 'plaid';
import { getFirebaseAdmin } from '@/firebase/admin';
import { headers } from 'next/headers';
import { type PlaidTransaction } from '@/lib/types';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
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

async function getUserId(idToken?: string): Promise<string> {
  if (!idToken) {
    try {
      const allHeaders = await headers();
      idToken = allHeaders.get('Authorization')?.replace('Bearer ', '') || undefined;
    } catch (e) {
    }
  }

  if (!idToken) {
    throw new Error('User is not authenticated. No Authorization header found.');
  }

  try {
    const decodedToken: { user_id: string } = jwtDecode(idToken);
    return decodedToken.user_id;
  } catch (error: any) {
    console.error('Error decoding ID token:', error);
    throw new Error(`Invalid authentication token: ${error.message || 'Unknown error'}`);
  }
}

async function getPlaidItem(idToken?: string): Promise<{ accessToken: string; cursor: string | null } | null> {
  const userId = await getUserId(idToken);
  const docRef = db.collection('plaid_items').doc(userId);
  const doc = await docRef.get();

  if (!doc.exists) {
    return null;
  }
  const data = doc.data();
  return {
    accessToken: data?.accessToken,
    cursor: data?.cursor || null,
  };
}


export async function createLinkToken(idToken?: string): Promise<string> {
  const userId = await getUserId(idToken);

  const tokenResponse = await plaidClient.linkTokenCreate({
    user: { client_user_id: userId },
    client_name: 'Juggle',
    products: [Products.Transactions],
    country_codes: [CountryCode.Us],
    language: 'en',
    webhook: 'https://webhook.example.com',
  });

  return tokenResponse.data.link_token;
}

export async function exchangePublicToken(
  publicToken: string,
  idToken?: string
): Promise<{ success: boolean }> {
  const userId = await getUserId(idToken);

  try {
    const response = await plaidClient.itemPublicTokenExchange({
      public_token: publicToken,
    });

    const accessToken = response.data.access_token;
    const itemId = response.data.item_id;

    const plaidItemRef = db.collection('plaid_items').doc(userId);
    await plaidItemRef.set({
      userId,
      accessToken,
      itemId,
      cursor: null,
      createdAt: FieldValue.serverTimestamp(),
    });

    const userRef = db.collection('users').doc(userId);
    await userRef.set({ isPlaidConnected: true }, { merge: true });

    await syncTransactions(idToken);

    return { success: true };
  } catch (error) {
    console.error('Error exchanging public token:', error);
    return { success: false };
  }
}

async function processTransactions(
  userId: string,
  added: PlaidSdkTransaction[],
  modified: PlaidSdkTransaction[],
  removed: RemovedTransaction[]
) {
  const batch = db.batch();

  added.forEach(tx => {
    const docRef = db.collection('users').doc(userId).collection('transactions').doc(tx.transaction_id);
    batch.set(docRef, tx);
  });

  modified.forEach(tx => {
    const docRef = db.collection('users').doc(userId).collection('transactions').doc(tx.transaction_id);
    batch.update(docRef, tx as any);
  });

  removed.forEach(tx => {
    const docRef = db.collection('users').doc(userId).collection('transactions').doc(tx.transaction_id);
    batch.delete(docRef);
  });

  await batch.commit();
  console.log(`Processed ${added.length} added, ${modified.length} modified, and ${removed.length} removed transactions.`);
}


export async function syncTransactions(idToken?: string): Promise<{ success: boolean }> {
  const userId = await getUserId(idToken);
  const plaidItem = await getPlaidItem(idToken);

  if (!plaidItem) {
    console.error("No Plaid item found for user, cannot sync transactions.");
    return { success: false };
  }

  let cursor = plaidItem.cursor;
  let added: PlaidSdkTransaction[] = [];
  let modified: PlaidSdkTransaction[] = [];
  let removed: RemovedTransaction[] = [];
  let hasMore = true;

  try {
    console.log(`Starting transaction sync for user ${userId}, cursor: ${cursor}`);

    while (hasMore) {
      const request: TransactionsSyncRequest = {
        access_token: plaidItem.accessToken,
        cursor: cursor || undefined,
      };
      const response = await plaidClient.transactionsSync(request);
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

    return { success: true };

  } catch (error: any) {
    console.error('Error syncing transactions:', error.response?.data || error.message);
    return { success: false };
  }
}


export async function getTransactions(idToken?: string): Promise<PlaidTransaction[]> {
  const userId = await getUserId(idToken);
  const transactionsRef = db.collection('users').doc(userId).collection('transactions');
  const snapshot = await transactionsRef.orderBy('date', 'desc').get();

  if (snapshot.empty) {
    return [];
  }

  return snapshot.docs.map(doc => doc.data() as PlaidTransaction);
}

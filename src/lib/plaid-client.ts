import { type PlaidTransaction } from './types';

export async function createLinkToken(idToken: string): Promise<string> {
    const response = await fetch('/api/plaid/create-link-token', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${idToken}`,
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create link token');
    }

    const data = await response.json();
    return data.link_token;
}

export async function exchangePublicToken(
    publicToken: string
): Promise<{ success: boolean; accessToken: string; itemId: string }> {
    console.log('Calling exchange token API...');

    const response = await fetch('/api/plaid/exchange-token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ public_token: publicToken }),
    });

    console.log('Exchange token response status:', response.status);

    if (!response.ok) {
        const error = await response.json();
        console.error('Exchange token error:', error);
        throw new Error(error.details || error.error || 'Failed to exchange token');
    }

    const result = await response.json();
    console.log('Exchange token success:', result);
    return result;
}

export async function syncTransactions(idToken: string): Promise<{ success: boolean }> {
    const response = await fetch('/api/plaid/sync-transactions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${idToken}`,
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to sync transactions');
    }

    return await response.json();
}

export async function getTransactions(idToken: string): Promise<PlaidTransaction[]> {
    const response = await fetch('/api/plaid/get-transactions', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${idToken}`,
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch transactions');
    }

    const data = await response.json();
    return data.transactions;
}

export async function fetchTransactionsFromPlaid(idToken: string): Promise<{
    accounts: any[];
    transactions: PlaidTransaction[];
    cursor: string;
}> {
    const response = await fetch('/api/plaid/fetch-transactions', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${idToken}`,
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch transactions from Plaid');
    }

    return await response.json();
}

export async function saveTransactionsToFirestore(
    idToken: string,
    transactions: any[],
    cursor: string
): Promise<{ success: boolean; saved: number }> {
    const response = await fetch('/api/plaid/save-transactions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${idToken}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ transactions, cursor }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save transactions');
    }

    return await response.json();
}

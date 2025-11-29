'use client';

import { useState, useEffect, useCallback } from 'react';
import { usePlaidLink } from 'react-plaid-link';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Transactions as TransactionsTable } from '@/components/dashboard/transactions';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, PlusCircle, RefreshCw, Trash2 } from 'lucide-react';
import {
  createLinkToken,
  exchangePublicToken,
} from '@/lib/plaid-client';
import { type PlaidTransaction } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/useAuth';
import { useDoc } from '@/firebase';

export default function TransactionsPage() {
  const { user, idToken, loading: authLoading } = useAuth();
  const { data: userProfile, loading: userProfileLoading } = useDoc<any>(
    user ? `users/${user.uid}` : ''
  );

  const [searchTerm, setSearchTerm] = useState('');
  const [linkToken, setLinkToken] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<PlaidTransaction[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [fetchedData, setFetchedData] = useState<{ transactions: any[]; cursor: string } | null>(null);
  const [connectedAccount, setConnectedAccount] = useState<any>(null);
  const [isRemoving, setIsRemoving] = useState(false);

  const isPlaidConnected = userProfile?.isPlaidConnected === true;

  const fetchTransactions = useCallback(async () => {
    if (!user || !isPlaidConnected) {
      setLoadingData(false);
      return;
    }
    setLoadingData(true);
    try {
      const { getStoredTransactions } = await import('@/lib/plaid-firestore');
      const fetchedTransactions = await getStoredTransactions(user.uid);
      setTransactions(fetchedTransactions as PlaidTransaction[]);
    } catch (e) {
      console.error('Error fetching transactions:', e);
      setError('Could not load your transactions.');
    } finally {
      setLoadingData(false);
    }
  }, [user, isPlaidConnected]);

  const fetchConnectedAccount = useCallback(async () => {
    if (!user || !isPlaidConnected) return;
    try {
      const { getPlaidItem } = await import('@/lib/plaid-firestore');
      const plaidItem = await getPlaidItem(user.uid);
      if (plaidItem) {
        setConnectedAccount(plaidItem);
      }
    } catch (e) {
      console.error('Error fetching connected account:', e);
    }
  }, [user, isPlaidConnected]);

  useEffect(() => {
    if (authLoading || userProfileLoading) return;

    const initPage = async () => {
      if (!user || !idToken) {
        setLoadingData(false);
        return;
      }

      try {
        const token = await createLinkToken(idToken);
        setLinkToken(token);
      } catch (e: any) {
        console.error('Error creating link token:', e);
        const errorMsg = e.message || 'Could not initialize Plaid. Please refresh the page.';
        setError(errorMsg);
      }

      if (isPlaidConnected) {
        fetchTransactions();
        fetchConnectedAccount();
      } else {
        setLoadingData(false);
      }
    };
    initPage();
  }, [user, idToken, authLoading, isPlaidConnected, userProfileLoading, fetchTransactions, fetchConnectedAccount]);

  const onSuccess = useCallback(async (public_token: string) => {
    if (!user) return;
    setLoadingData(true);
    setError(null);
    try {
      const result = await exchangePublicToken(public_token);
      if (result.success) {
        const { savePlaidItem } = await import('@/lib/plaid-firestore');
        await savePlaidItem(user.uid, result.accessToken, result.itemId);

        window.location.reload();
      } else {
        setError('Failed to connect your account. Please try again.');
        setLoadingData(false);
      }
    } catch (e: any) {
      console.error('Error exchanging public token:', e);
      setError(e.message || 'Failed to connect your account. Please try again.');
      setLoadingData(false);
    }
  }, [user]);

  const { open, ready } = usePlaidLink({
    token: linkToken,
    onSuccess,
  });

  const handleFetchFromPlaid = async () => {
    if (!user) return;
    setIsFetching(true);
    setError(null);
    try {
      const { getPlaidItem } = await import('@/lib/plaid-firestore');
      const plaidItem = await getPlaidItem(user.uid);

      if (!plaidItem) {
        setError('No Plaid account connected');
        setIsFetching(false);
        return;
      }

      const institutionResponse = await fetch('/api/plaid/get-institution', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessToken: plaidItem.accessToken }),
      });

      if (!institutionResponse.ok) {
        throw new Error('Failed to fetch institution info');
      }

      const institutionData = await institutionResponse.json();
      setAccounts(institutionData.accounts);

      const transactionsResponse = await fetch('/api/plaid/sync-plaid-transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accessToken: plaidItem.accessToken,
          cursor: plaidItem.cursor,
        }),
      });

      if (!transactionsResponse.ok) {
        throw new Error('Failed to fetch transactions');
      }

      const transactionsData = await transactionsResponse.json();
      setFetchedData({
        transactions: transactionsData.transactions,
        cursor: transactionsData.cursor,
      });

      if (institutionData.institutionName) {
        const { updatePlaidItemInstitution } = await import('@/lib/plaid-firestore');
        await updatePlaidItemInstitution(user.uid, institutionData.institutionName);
        await fetchConnectedAccount();
      }

      setError(null);
    } catch (e: any) {
      console.error('Error fetching from Plaid:', e);
      setError(e.message || 'Failed to fetch transactions from Plaid.');
    } finally {
      setIsFetching(false);
    }
  };

  const handleSaveToFirestore = async () => {
    if (!user || !fetchedData) return;
    setIsSaving(true);
    setError(null);
    try {
      const { saveTransactions, updatePlaidCursor } = await import('@/lib/plaid-firestore');
      await saveTransactions(user.uid, fetchedData.transactions);
      await updatePlaidCursor(user.uid, fetchedData.cursor);
      await fetchTransactions();
      setFetchedData(null);
      setError(null);
    } catch (e: any) {
      console.error('Error saving transactions:', e);
      setError(e.message || 'Failed to save transactions.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemoveAccount = async () => {
    if (!user) return;
    setIsRemoving(true);
    setError(null);
    try {
      const { doc, deleteDoc, collection, getDocs, writeBatch } = await import('firebase/firestore');
      const { getFirestore } = await import('firebase/firestore');
      const { getApp } = await import('firebase/app');
      const db = getFirestore(getApp());

      await deleteDoc(doc(db, 'plaid_items', user.uid));

      const transactionsRef = collection(db, 'users', user.uid, 'transactions');
      const snapshot = await getDocs(transactionsRef);
      const batch = writeBatch(db);
      snapshot.docs.forEach((docSnap) => {
        batch.delete(docSnap.ref);
      });
      await batch.commit();

      const { setDoc } = await import('firebase/firestore');
      await setDoc(doc(db, 'users', user.uid), { isPlaidConnected: false }, { merge: true });

      setConnectedAccount(null);
      setTransactions([]);
      setAccounts([]);
      window.location.reload();
    } catch (e: any) {
      console.error('Error removing account:', e);
      setError(e.message || 'Failed to remove account.');
    } finally {
      setIsRemoving(false);
    }
  };

  const filteredTransactions = transactions.filter((transaction) =>
    transaction.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const adaptedTransactions = filteredTransactions.map((t) => ({
    id: t.transaction_id,
    name: t.name,
    amount: -t.amount,
    type: t.amount < 0 ? 'income' : ('expense' as 'income' | 'expense'),
    date: t.date,
    category: t.category?.[0] || 'Other',
    icon: Search,
  }));

  const showLoading = authLoading || userProfileLoading || loadingData;

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div>
            <CardTitle>Transactions</CardTitle>
            <CardDescription>
              A complete history of your income and expenses from your
              connected accounts.
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search transactions..."
                className="w-full sm:w-[250px] lg:w-[300px] pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                disabled={!isPlaidConnected}
              />
            </div>
            {isPlaidConnected && (
              <Button onClick={handleFetchFromPlaid} disabled={isFetching || showLoading} variant="outline">
                <RefreshCw className={`mr-2 h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
                {isFetching ? 'Fetching...' : 'Fetch Transactions'}
              </Button>
            )}
            <Button
              onClick={() => open()}
              disabled={!ready || showLoading || !user}
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              {isPlaidConnected ? 'Connect New' : 'Connect Account'}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {!showLoading && isPlaidConnected && connectedAccount && (
          <div className="mb-6 p-4 border rounded-lg bg-primary/5">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-sm text-muted-foreground mb-1">Connected Account</h3>
                <p className="font-medium text-lg">
                  {connectedAccount.institutionName || 'Bank Account'}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Connected on {connectedAccount.createdAt?.toDate?.()?.toLocaleDateString() || 'Recently'}
                </p>
                {!connectedAccount.institutionName && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Click "Fetch Transactions" to load bank name
                  </p>
                )}
              </div>
              <Button
                onClick={handleRemoveAccount}
                disabled={isRemoving}
                variant="destructive"
                size="sm"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                {isRemoving ? 'Removing...' : 'Remove Account'}
              </Button>
            </div>
          </div>
        )}
        {showLoading && (
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        )}
        {!showLoading && error && (
          <div className="text-center py-10">
            <p className="text-destructive">{error}</p>
          </div>
        )}
        {!showLoading && fetchedData && (
          <div className="mb-6 p-4 border rounded-lg bg-muted/50">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <h3 className="font-semibold text-lg">Fetched from Plaid</h3>
                {connectedAccount?.institutionName && (
                  <p className="text-sm font-medium text-primary mt-1">
                    {connectedAccount.institutionName}
                  </p>
                )}
                {accounts.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {accounts.map((acc) => (
                      <p key={acc.id} className="text-sm text-muted-foreground">
                        {acc.officialName || acc.name} ({acc.type}) - Balance: ${acc.balance?.toFixed(2)}
                      </p>
                    ))}
                  </div>
                )}
                <p className="text-sm text-muted-foreground mt-2">
                  {fetchedData.transactions.length} transactions ready to save
                </p>
                {fetchedData.transactions.length === 0 && (
                  <div className="mt-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded">
                    <p className="text-sm text-yellow-800 dark:text-yellow-200">
                      <strong>No transactions found.</strong> This is normal for new Plaid Sandbox accounts.
                      In Sandbox mode, you may need to wait a few minutes or try reconnecting with a different test bank.
                      In production, real transactions will appear here.
                    </p>
                  </div>
                )}
              </div>
              {fetchedData.transactions.length > 0 && (
                <Button onClick={handleSaveToFirestore} disabled={isSaving}>
                  {isSaving ? 'Saving...' : 'Save Transactions'}
                </Button>
              )}
            </div>
          </div>
        )}
        {!showLoading && !error && !isPlaidConnected && (
          <div className="text-center py-10">
            <h3 className="text-lg font-semibold">No bank account connected</h3>
            <p className="text-muted-foreground text-sm mt-2">
              Please connect a bank account to see your transactions.
            </p>
            <Button
              className="mt-4"
              onClick={() => open()}
              disabled={!ready || showLoading || !user}
            >
              Connect a Bank Account
            </Button>
          </div>
        )}
        {!showLoading &&
          !error &&
          isPlaidConnected &&
          adaptedTransactions.length > 0 && (
            <TransactionsTable
              transactions={adaptedTransactions}
              showViewAll={false}
            />
          )}
        {!showLoading &&
          !error &&
          isPlaidConnected &&
          adaptedTransactions.length === 0 && (
            <div className="text-center py-10">
              <h3 className="text-lg font-semibold">No transactions yet</h3>
              <p className="text-muted-foreground text-sm mt-2">
                It can take a few minutes for transactions to appear after connecting an account. Try syncing.
              </p>
            </div>
          )}
      </CardContent>
    </Card>
  );
}

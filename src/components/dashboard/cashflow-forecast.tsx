'use client';

import { useState, useEffect } from 'react';
import {
  forecastCashFlow,
  type ForecastCashFlowOutput,
} from '@/ai/flows/personalized-cash-flow-projection';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Wand2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { CashflowChart } from './cashflow-chart';
import { useAuth } from '@/hooks/useAuth';

import { useFirestore, useDoc } from '@/firebase';
import { doc, setDoc } from 'firebase/firestore';

export function CashflowForecast() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ForecastCashFlowOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { user, idToken, accessToken } = useAuth();
  const firestore = useFirestore();

  const { data: savedForecast, loading: forecastLoading } = useDoc<ForecastCashFlowOutput>(
    user ? `cash_flow_projections/${user.uid}` : ''
  );

  const { data: userProfile } = useDoc<any>(user ? `users/${user.uid}` : '');
  const isPlaidConnected = userProfile?.isPlaidConnected === true;

  useEffect(() => {
    if (savedForecast) {
      setResult(savedForecast);
    }
  }, [savedForecast]);

  const handleForecast = async () => {
    if (!user || !firestore) {
      setError('You must be signed in to generate a forecast.');
      return;
    }
    if (!isPlaidConnected) {
      setError('Please connect a bank account first on the Transactions page.');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const { getStoredTransactions } = await import('@/lib/plaid-firestore');
      const transactions = await getStoredTransactions(user.uid);

      // Fetch calendar events
      let calendarEvents: any[] = [];
      if (accessToken) {
        try {
          const calendarResponse = await fetch('/api/google/calendar-events', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ accessToken }),
          });
          if (calendarResponse.ok) {
            const data = await calendarResponse.json();
            calendarEvents = data.events || [];
          }
        } catch (e) {
          console.error('Error fetching calendar events:', e);
        }
      }

      const financialData = {
        transactionHistory: JSON.stringify(transactions),
        calendarEvents: JSON.stringify(calendarEvents),
      }

      const forecastResult = await forecastCashFlow(financialData);
      setResult(forecastResult);

      // Save result to Firestore
      const docRef = doc(firestore, 'cash_flow_projections', user.uid);
      await setDoc(docRef, {
        ...forecastResult,
        userId: user.uid,
        createdAt: new Date().toISOString()
      }, { merge: true });

    } catch (e) {
      setError('Failed to generate forecast. Please try again.');
      console.error(e);
    }
    setLoading(false);
  };

  const pageLoading = loading || forecastLoading;

  return (
    <Card>
      <CardHeader>
        <CardTitle>AI-Powered Forecast</CardTitle>
        <CardDescription>
          Let&apos;s look ahead. Based on your transactions and calendar,
          here&apos;s what your cash flow might look like.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {pageLoading && !result && (
          <div className="space-y-3">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
          </div>
        )}
        {error && <p className="text-destructive text-sm">{error}</p>}
        {result && result.projectionData ? (
          <div className="space-y-6">
            <CashflowChart data={result.projectionData} />
            <div className="text-sm text-foreground/80 italic border-l-2 border-primary pl-4 py-2">
              <p className="font-semibold text-foreground mb-2">AI Analysis:</p>
              &quot;{result.forecast}&quot;
            </div>
          </div>
        ) : (
          !pageLoading && !error && (
            <div className="text-sm text-center text-muted-foreground py-8">
              {!isPlaidConnected
                ? "Please connect a bank account on the Transactions page to generate a forecast."
                : "Click the button to generate your personalized cash flow forecast."
              }
            </div>
          )
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={handleForecast} disabled={pageLoading || !isPlaidConnected}>
          <Wand2 className="mr-2 h-4 w-4" />
          {pageLoading ? 'Analyzing...' : result ? 'Regenerate Forecast' : 'Generate Forecast'}
        </Button>
      </CardFooter>
    </Card>
  );
}

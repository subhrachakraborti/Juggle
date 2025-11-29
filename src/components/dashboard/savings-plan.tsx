'use client';

import { useState, useEffect } from 'react';
import {
  generateSavingsPlan,
  type SavingsPlanOutput,
  type SavingsPlanInput,
} from '@/ai/flows/ai-generated-savings-plan';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PiggyBank } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useCurrency } from '@/contexts/currency-context';
import { useAuth } from '@/hooks/useAuth';

import { useFirestore, useDoc } from '@/firebase';
import { doc, setDoc } from 'firebase/firestore';

export function SavingsPlan() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SavingsPlanOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { formatCurrency } = useCurrency();
  const { user, idToken, accessToken } = useAuth();
  const firestore = useFirestore();

  const { data: savedPlan, loading: planLoading } = useDoc<SavingsPlanOutput>(
    user ? `savings_plans/${user.uid}` : ''
  );

  const { data: userProfile } = useDoc<any>(user ? `users/${user.uid}` : '');
  const isPlaidConnected = userProfile?.isPlaidConnected === true;

  useEffect(() => {
    if (savedPlan) {
      setResult(savedPlan);
    }
  }, [savedPlan]);

  const handleGenerate = async () => {
    if (!idToken || !user || !firestore) {
      setError('You must be signed in to generate a plan.');
      return;
    }
    if (!isPlaidConnected) {
      setError('Please connect a bank account first on the Transactions page.');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
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

      // Basic analysis to feed the AI
      const income = transactions.filter(t => t.amount < 0).reduce((sum, t) => sum - t.amount, 0);
      const expenses = transactions.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0);
      const upcomingCommitments = calendarEvents.map(e => `${e.summary} on ${e.start.date || e.start.dateTime}`).join(', ');
      const pastFinancialBehavior = `User has ${transactions.length} transactions. Recent income: ${income.toFixed(2)}. Recent expenses: ${expenses.toFixed(2)}.`;

      const input: SavingsPlanInput = {
        income: income,
        expenses: expenses,
        upcomingCommitments: upcomingCommitments || 'No upcoming calendar events.',
        pastFinancialBehavior: pastFinancialBehavior,
      };

      const planResult = await generateSavingsPlan(input);
      setResult(planResult);

      const docRef = doc(firestore, 'savings_plans', user.uid);
      await setDoc(docRef, {
        ...planResult,
        userId: user.uid,
        createdAt: new Date().toISOString()
      }, { merge: true });

    } catch (e: any) {
      const errorMessage = e?.message || 'Failed to generate savings plan. Please try again.';
      setError(errorMessage);
      console.error('Savings plan generation error:', e);
    }
    setLoading(false);
  };

  const pageLoading = loading || planLoading;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Personalized Savings Plan</CardTitle>
        <CardDescription>
          Need a plan to tackle future expenses? Let&apos;s create one.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {pageLoading && !result && (
          <div className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
            <Skeleton className="h-10 w-2/5" />
          </div>
        )}
        {error && <p className="text-destructive text-sm">{error}</p>}
        {result ? (
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-sm">Projected Shortfall</h4>
              <p className="text-2xl font-bold font-headline text-destructive">
                {formatCurrency(result.projectedShortfall)}
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-sm">Your Plan</h4>
              <p className="text-sm text-muted-foreground">
                {result.savingsPlan}
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-sm">Recommendations</h4>
              <p className="text-sm text-muted-foreground">
                {result.recommendations}
              </p>
            </div>
          </div>
        ) : (
          !pageLoading && !error && (
            <div className="text-center text-sm text-muted-foreground pt-4">
              {!isPlaidConnected
                ? "Please connect a bank account on the Transactions page to generate a plan."
                : "Click \"Generate Plan\" to get AI-powered recommendations."
              }
            </div>
          )
        )}
      </CardContent>
      <CardFooter className="flex flex-col items-start gap-2 border-t px-6 pt-6">
        <Button onClick={handleGenerate} disabled={pageLoading || !isPlaidConnected}>
          <PiggyBank className="mr-2 h-4 w-4" />
          {loading ? 'Generating...' : 'Generate Plan'}
        </Button>
        {result && (
          <Button
            variant="link"
            className="p-0 h-auto text-muted-foreground"
            onClick={handleGenerate}
            disabled={pageLoading || !isPlaidConnected}
          >
            Regenerate Plan
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}

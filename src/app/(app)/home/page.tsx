'use client';
import { MetricCard } from '@/components/dashboard/metric-card';
import {
  ArrowDown,
  ArrowUp,
  DollarSign,
  Wallet,
  TrendingUp,
  PiggyBank,
  Calendar,
  ArrowRight,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

import { type PlaidTransaction } from '@/lib/types';
import { useEffect, useState, useCallback } from 'react';
import { useDoc } from '@/firebase';
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function Dashboard() {
  const { user, idToken, loading: authLoading } = useAuth();
  const [transactions, setTransactions] = useState<PlaidTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const { data: userProfile, loading: userProfileLoading } = useDoc<any>(
    user ? `users/${user.uid}` : ''
  );
  const isPlaidConnected = userProfile?.isPlaidConnected === true;

  const getHeaders = useCallback(() => {
    if (!idToken) return {};
    return { Authorization: `Bearer ${idToken}` };
  }, [idToken]);

  useEffect(() => {
    if (authLoading || userProfileLoading) return;
    if (!user || !isPlaidConnected) {
      setLoading(false);
      return;
    }

    const fetchTransactions = async () => {
      setLoading(true);
      try {
        const { getStoredTransactions } = await import('@/lib/plaid-firestore');
        const fetchedTransactions = await getStoredTransactions(user.uid);
        if (fetchedTransactions) {
          setTransactions(fetchedTransactions);
        }
      } catch (error) {
        console.error('Failed to fetch transactions for dashboard', error);
      } finally {
        setLoading(false);
      }
    };
    fetchTransactions();
  }, [user, authLoading, userProfileLoading, isPlaidConnected]);

  const metrics = transactions.reduce(
    (acc, t) => {
      if (t.amount < 0) {
        acc.incomeThisMonth -= t.amount;
      } else {
        acc.spendingThisMonth += t.amount;
      }
      acc.currentBalance -= t.amount;
      return acc;
    },
    {
      currentBalance: 0,
      incomeThisMonth: 0,
      spendingThisMonth: 0,
    }
  );

  const savingsThisMonth = metrics.incomeThisMonth - metrics.spendingThisMonth;
  const pageLoading = loading || authLoading || userProfileLoading;

  return (
    <div className="grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-2">
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
        <MetricCard
          title="Current Balance"
          amount={metrics.currentBalance}
          description={pageLoading ? 'Loading...' : 'Based on transactions'}
          icon={Wallet}
        />
        <MetricCard
          title="Income this month"
          amount={metrics.incomeThisMonth}
          description={pageLoading ? 'Loading...' : 'From connected accounts'}
          icon={ArrowDown}
          iconColor="text-green-600 dark:text-green-500"
        />
        <MetricCard
          title="Spending this month"
          amount={metrics.spendingThisMonth}
          description={pageLoading ? 'Loading...' : 'From connected accounts'}
          icon={ArrowUp}
          iconColor="text-red-600 dark:text-red-500"
        />
        <MetricCard
          title="Savings"
          amount={savingsThisMonth > 0 ? savingsThisMonth : 0}
          description={pageLoading ? 'Loading...' : 'Income minus spending'}
          icon={DollarSign}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-xl">
              <TrendingUp /> Projections
            </CardTitle>
            <CardDescription>
              View your AI-powered cash flow forecast and get personalized
              recommendations.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button asChild className="w-full">
              <Link href="/projections">
                View Forecast <ArrowRight className="ml-2" />
              </Link>
            </Button>
          </CardFooter>
        </Card>
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-xl">
              <PiggyBank /> Savings Plans
            </CardTitle>
            <CardDescription>
              Create and manage personalized savings plans to reach your
              financial goals.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button asChild className="w-full">
              <Link href="/projections">
                Create a Plan <ArrowRight className="ml-2" />
              </Link>
            </Button>
          </CardFooter>
        </Card>
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-xl">
              <Calendar /> Upcoming Events
            </CardTitle>
            <CardDescription>
              See your upcoming bills and financial commitments from your
              connected calendar.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button asChild className="w-full">
              <Link href="/events">
                View Events <ArrowRight className="ml-2" />
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

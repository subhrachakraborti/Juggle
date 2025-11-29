'use client';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { type Transaction } from '@/lib/data';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { useCurrency } from '@/contexts/currency-context';
import { ArrowRightLeft, Car, Gift, Home, Plane, Shirt, ShoppingCart, Utensils } from 'lucide-react';

type TransactionsProps = {
  transactions?: Transaction[];
  showViewAll?: boolean;
};

// A helper to map category to an icon
const getIconForCategory = (category: string) => {
  switch (category.toLowerCase()) {
    case 'food & drink':
    case 'food and drink':
    case 'restaurants':
      return Utensils;
    case 'shopping':
      return Shirt;
    case 'transport':
    case 'travel':
      return Car;
    case 'freelance':
      return ArrowRightLeft;
    case 'groceries':
      return ShoppingCart;
    case 'rent':
      return Home;
    default:
      return ArrowRightLeft;
  }
}

export function Transactions({
  transactions = [],
  showViewAll = true,
}: TransactionsProps) {
  const { formatCurrency } = useCurrency();

  return (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Transaction</TableHead>
              <TableHead className="hidden sm:table-cell">Category</TableHead>
              <TableHead className="hidden sm:table-cell">Date</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((transaction) => {
              const Icon = getIconForCategory(transaction.category);
              return (
              <TableRow key={transaction.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-muted rounded-full">
                      <Icon className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="font-medium">{transaction.name}</div>
                  </div>
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  <Badge variant="outline">{transaction.category}</Badge>
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  {new Date(transaction.date).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                  })}
                </TableCell>
                <TableCell
                  className={cn(
                    'text-right font-medium',
                    transaction.type === 'income'
                      ? 'text-green-600 dark:text-green-500'
                      : ''
                  )}
                >
                  {transaction.type === 'income' ? '+' : ''}
                  {formatCurrency(Math.abs(transaction.amount))}
                </TableCell>
              </TableRow>
            )})}
          </TableBody>
        </Table>
  );
}

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';
import { useCurrency } from '@/contexts/currency-context';

type MetricCardProps = {
  title: string;
  amount: number;
  description: string;
  icon: LucideIcon;
  iconColor?: string;
};

export function MetricCard({
  title,
  amount,
  description,
  icon: Icon,
  iconColor,
}: MetricCardProps) {
  const { formatCurrency } = useCurrency();
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={cn('h-4 w-4 text-muted-foreground', iconColor)} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold font-headline">{formatCurrency(amount)}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}

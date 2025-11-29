'use client';

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { useCurrency } from '@/contexts/currency-context';
import { useMemo } from 'react';

type ChartData = {
  date: string;
  balance: number;
};

const chartConfig = {
  balance: {
    label: 'Balance',
    color: 'hsl(var(--primary))',
  },
};

export function CashflowChart({ data }: { data: ChartData[] }) {
  const { formatCurrency } = useCurrency();

  const formattedData = useMemo(() => {
    return data.map((item) => ({
      ...item,
      date: new Date(item.date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      }),
    }));
  }, [data]);

  if (!data || data.length === 0) {
    return null;
  }

  return (
    <ChartContainer config={chartConfig} className="h-48 w-full">
      <AreaChart
        accessibilityLayer
        data={formattedData}
        margin={{
          left: 12,
          right: 12,
        }}
      >
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="date"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          tickFormatter={(value) => value.slice(0, 6)}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          tickFormatter={(value) => formatCurrency(value).replace(/(\.00|₹|,)/g, '')}
        />
        <ChartTooltip
          cursor={false}
          content={
            <ChartTooltipContent
              labelFormatter={(label, payload) => {
                return payload[0]?.payload.date || label;
              }}
              formatter={(value) => formatCurrency(Number(value))}
              indicator="dot"
            />
          }
        />
        <Area
          dataKey="balance"
          type="natural"
          fill="var(--color-balance)"
          fillOpacity={1}
          stroke="var(--color-balance)"
          stackId="a"
        />
      </AreaChart>
    </ChartContainer>
  );
}

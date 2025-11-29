'use client';

import { useCurrency } from '@/contexts/currency-context';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function CurrencySwitcher() {
  const { currency, setCurrency } = useCurrency();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="w-20">
          {currency}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuRadioGroup
          value={currency}
          onValueChange={(value) => setCurrency(value as any)}
        >
          <DropdownMenuRadioItem value="INR">INR</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="USD">USD</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="EUR">EUR</DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

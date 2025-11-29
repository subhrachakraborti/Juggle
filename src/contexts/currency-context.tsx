'use client';

import { createContext, useContext, useState, useMemo, type ReactNode } from 'react';

type Currency = 'INR' | 'USD' | 'EUR';

const exchangeRates = {
  USD: { INR: 88.65, EUR: 0.92, USD: 1 },
  INR: { INR: 1, USD: 1 / 88.65, EUR: 1 / 102.15 },
  EUR: { INR: 102.15, USD: 1.15, EUR: 1 },
};

type CurrencyContextType = {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  formatCurrency: (amount: number, fromCurrency?: Currency) => string;
};

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrency] = useState<Currency>('INR');

  const formatCurrency = (amount: number, fromCurrency: Currency = 'USD') => {
    const convertedAmount = amount * (exchangeRates[fromCurrency] as any)[currency];

    // Use appropriate locale based on currency
    const locale = currency === 'INR' ? 'en-IN' : currency === 'EUR' ? 'en-GB' : 'en-US';

    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(convertedAmount);
  };


  const value = useMemo(() => ({
    currency,
    setCurrency,
    formatCurrency,
  }), [currency]);

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
}

import {
  ArrowRightLeft,
  Car,
  Gift,
  Home as HomeIcon,
  Plane,
  Shirt,
  ShoppingCart,
  Utensils,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export type Transaction = {
  id: string;
  name: string;
  amount: number; // Amount in USD
  type: 'income' | 'expense';
  date: string;
  category: string;
  icon: LucideIcon;
};

export const transactions: Transaction[] = [
  // This mock data is now only for fallback/display purposes.
  // Real data is fetched from Plaid.
];

export type CalendarEvent = {
  id: string;
  title: string;
  date: string;
  type: 'bill' | 'event';
  amount?: number; // Amount in USD
  icon: LucideIcon;
};

export const calendarEvents: CalendarEvent[] = [
  // This mock data is now only for fallback/display purposes.
  // Real data is fetched from Google Calendar.
];

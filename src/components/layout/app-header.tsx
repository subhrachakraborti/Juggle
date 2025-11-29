'use client';

import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowRightLeft,
  TrendingUp,
  Calendar,
  Home
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { usePathname } from 'next/navigation';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useAuth } from '@/hooks/useAuth';
import { CurrencySwitcher } from './currency-switcher';

export const navItems = [
  { href: '/home', icon: Home, label: 'Home' },
  { href: '/transactions', icon: ArrowRightLeft, label: 'Transactions' },
  { href: '/projections', icon: TrendingUp, label: 'Projections' },
  { href: '/events', icon: Calendar, label: 'Events' },
];

export function AppHeader() {
  const { user, signOut } = useAuth();
  const pathname = usePathname();
  const avatar = PlaceHolderImages.find((p) => p.id === 'user-avatar');

  const currentPage = navItems.find((item) => item.href === pathname);
  const pageTitle = currentPage ? currentPage.label : 'Dashboard';

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
      <div className="sm:hidden">
        <h1 className="font-semibold text-lg">{pageTitle}</h1>
      </div>
      <div className="ml-auto flex items-center gap-4">
        <CurrencySwitcher />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="overflow-hidden rounded-full"
            >
              <Image
                src={user?.photoURL ?? avatar?.imageUrl ?? 'https://picsum.photos/seed/user-avatar/64/64'}
                width={36}
                height={36}
                alt="Avatar"
                className="overflow-hidden rounded-full"
                data-ai-hint="user portrait"
              />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>{user?.displayName ?? 'My Account'}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/settings">Settings</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/support">Support</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={signOut}>Logout</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

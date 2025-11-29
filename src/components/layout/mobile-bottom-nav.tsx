'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { navItems } from './app-header';
import { cn } from '@/lib/utils';
import { Wallet } from 'lucide-react';

export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <div className="sm:hidden fixed bottom-0 left-0 z-50 w-full h-16 bg-background border-t">
      <div className="grid h-full max-w-lg grid-cols-4 mx-auto font-medium">
        {navItems.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className={cn(
              'inline-flex flex-col items-center justify-center px-5 hover:bg-gray-50 dark:hover:bg-gray-800 group',
              pathname === item.href
                ? 'text-primary'
                : 'text-muted-foreground'
            )}
          >
            {item.href === '/home' ? (
              <Wallet className="w-5 h-5 mb-1" />
            ) : (
              <item.icon className="w-5 h-5 mb-1" />
            )}
            <span className="text-xs">{item.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}

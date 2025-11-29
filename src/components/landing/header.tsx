'use client';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';

export function Header() {
  const { signInWithGoogle, loading } = useAuth();
  return (
    <header className="p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2">
          <div className="p-3 bg-primary rounded-full">
            <Image
              src="/icon.webp"
              alt="Juggle"
              width={24}
              height={24}
              className="h-6 w-6"
            />
          </div>
          <h1 className="text-xl font-bold font-headline">Juggle</h1>
        </Link>
        <nav className="flex gap-4 items-center">
          <Button onClick={signInWithGoogle} disabled={loading} variant="outline">
            {loading ? 'Signing In...' : 'Sign In with Google'}
          </Button>
        </nav>
      </div>
    </header>
  );
}

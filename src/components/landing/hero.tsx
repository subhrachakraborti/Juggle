'use client';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { useAuth } from '@/hooks/useAuth';

export function Hero() {
  const { signInWithGoogle, loading } = useAuth();
  return (
    <section className="container mx-auto px-4 py-16 text-center">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl md:text-6xl font-bold font-headline mb-4">
          Stop juggling finances. Start living.
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground mb-8">
          Juggle is the smart, AI-powered app that helps you manage your money,
          predict cash flow, and save for your goals effortlessly.
        </p>
        <div className="flex justify-center gap-4">
          <Button size="lg" onClick={signInWithGoogle} disabled={loading} variant="outline">
            Get Started for Free
          </Button>
        </div>
      </div>
      <div className="mt-12">
        <Image
          src="https://picsum.photos/seed/finance-dashboard/1200/800"
          alt="Juggle app dashboard"
          width={1200}
          height={800}
          className="rounded-lg shadow-2xl"
          data-ai-hint="finance app dashboard"
        />
      </div>
    </section>
  );
}

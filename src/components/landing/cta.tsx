'use client';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';

export function CTA() {
  const { signInWithGoogle, loading } = useAuth();
  return (
    <section className="bg-primary/5">
      <div className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-3xl md:text-4xl font-bold font-headline mb-4">
          Ready to take control of your finances?
        </h2>
        <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
          Sign up for Juggle today and experience a new way to manage your money. It&apos;s free to get started.
        </p>
        <Button size="lg" onClick={signInWithGoogle} disabled={loading} variant="outline">
          {loading ? 'Signing in...' : 'Sign In with Google'}
        </Button>
      </div>
    </section>
  );
}

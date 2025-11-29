'use client';

import { FirebaseProvider } from './provider';
import type { ReactNode } from 'react';

// This is a client-side only wrapper that includes the FirebaseProvider.
// It ensures that Firebase is initialized only on the client.
export function FirebaseClientProvider({ children }: { children: ReactNode }) {
  return <FirebaseProvider>{children}</FirebaseProvider>;
}

'use client';

import {
  createContext,
  useContext,
  useMemo,
  type ReactNode,
} from 'react';
import { initializeFirebase } from './index';
import type { FirebaseApp } from 'firebase/app';
import type { Auth } from 'firebase/auth';
import type { Firestore } from 'firebase/firestore';

// Define the context shape
type FirebaseContextType = {
  app: FirebaseApp;
  auth: Auth;
  firestore: Firestore;
};

// Create the context with an initial undefined value
const FirebaseContext = createContext<FirebaseContextType | undefined>(
  undefined
);

// Define the provider component
export function FirebaseProvider({ children }: { children: ReactNode }) {
  const instances = useMemo(() => {
    // Initialize Firebase and get the instances.
    // This function should handle singleton logic to avoid re-initialization.
    return initializeFirebase();
  }, []);

  return (
    <FirebaseContext.Provider value={instances}>
      {children}
    </FirebaseContext.Provider>
  );
}

// Custom hook to use the Firebase context
export function useFirebase() {
  const context = useContext(FirebaseContext);
  if (context === undefined) {
    throw new Error('useFirebase must be used within a FirebaseProvider');
  }
  return context;
}

// Hooks for specific instances
export function useFirebaseApp() {
  return useFirebase().app;
}

export function useAuth() {
  return useFirebase().auth;
}

export function useFirestore() {
  return useFirebase().firestore;
}

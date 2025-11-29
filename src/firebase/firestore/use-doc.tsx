'use client';
import { useState, useEffect, useMemo } from 'react';
import {
  onSnapshot,
  doc,
  type DocumentData,
  type DocumentReference,
} from 'firebase/firestore';
import { useFirestore } from '@/firebase';

export function useDoc<T>(
  path: string | null | undefined
): { data: T | null; loading: boolean; error: Error | null } {
  const firestore = useFirestore();
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const memoizedDocRef = useMemo(() => {
    if (!firestore || !path) return null;
    try {
        return doc(firestore, path) as DocumentReference<T>;
    } catch (e) {
        console.error("Error creating doc reference in useDoc:", e);
        setError(e as Error);
        return null;
    }
  }, [firestore, path]);

  useEffect(() => {
    // If the path is empty or the ref couldn't be created, don't do anything
    if (!memoizedDocRef) {
      setLoading(false);
      setData(null);
      return;
    }
    
    setLoading(true);

    const unsubscribe = onSnapshot(
      memoizedDocRef,
      (docSnapshot) => {
        if (docSnapshot.exists()) {
          setData({ id: docSnapshot.id, ...docSnapshot.data() } as T);
        } else {
          setData(null);
        }
        setLoading(false);
      },
      (err) => {
        console.error(err);
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [memoizedDocRef]);

  return { data, loading, error };
}

'use client';
import { useState, useEffect, useMemo } from 'react';
import {
  onSnapshot,
  query,
  collection,
  where,
  getDocs,
  type DocumentData,
  type Query,
  type CollectionReference,
} from 'firebase/firestore';
import { useFirestore } from '@/firebase';

export function useCollection<T>(
  path: string | null | undefined,
  uid?: string
): { data: T[]; loading: boolean; error: Error | null } {
  const firestore = useFirestore();
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const memoizedQuery = useMemo(() => {
    if (!firestore || !path) return null;
    try {
        let q: Query | CollectionReference = collection(firestore, path);
        if (uid) {
            q = query(q, where('uid', '==', uid));
        }
        return q;
    } catch (e) {
        console.error("Error creating query in useCollection:", e);
        setError(e as Error);
        return null;
    }
  }, [firestore, path, uid]);

  useEffect(() => {
    if (!memoizedQuery) {
      setLoading(false);
      setData([]);
      return;
    }

    setLoading(true);

    const unsubscribe = onSnapshot(
      memoizedQuery,
      (querySnapshot) => {
        const docs = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as T[];
        setData(docs);
        setLoading(false);
      },
      (err) => {
        console.error(err);
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [memoizedQuery]);

  return { data, loading, error };
}

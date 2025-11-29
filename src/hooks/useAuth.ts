'use client';

import {
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  onIdTokenChanged,
  getAdditionalUserInfo,
  type UserCredential
} from 'firebase/auth';
import { useFirebase, useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';

export function useAuth() {
  const { auth } = useFirebase();
  const { user, loading: userLoading } = useUser();
  const router = useRouter();
  const [idToken, setIdToken] = useState<string | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [tokenLoading, setTokenLoading] = useState(true);

  useEffect(() => {
    if (!auth) {
      setTokenLoading(false);
      return;
    }

    const unsubscribe = onIdTokenChanged(auth, async (user) => {
      if (user) {
        try {
          const token = await user.getIdToken();
          setIdToken(token);
          // Try to retrieve access token from session storage, if not available, re-auth might be needed
          const storedToken = sessionStorage.getItem('google-access-token');
          if (storedToken) {
            setAccessToken(storedToken);
          }
        } catch (e) {
          console.error("Error getting ID token:", e);
          setIdToken(null);
          setAccessToken(null);
        }
      } else {
        setIdToken(null);
        setAccessToken(null);
        sessionStorage.removeItem('google-access-token');
      }
      setTokenLoading(false);
    });

    return () => unsubscribe();
  }, [auth]);

  const handleSignIn = useCallback(async (credential: UserCredential) => {
    const additionalInfo = getAdditionalUserInfo(credential);
    if (additionalInfo?.providerId === 'google.com') {
      const token = (credential.credential as any)?.accessToken;
      if (token) {
        setAccessToken(token);
        sessionStorage.setItem('google-access-token', token);
      }
    }
    router.push('/home');
  }, [router]);

  const signInWithGoogle = async () => {
    if (!auth) return;
    setTokenLoading(true);
    const provider = new GoogleAuthProvider();
    provider.addScope('https://www.googleapis.com/auth/calendar.readonly');
    try {
      const credential = await signInWithPopup(auth, provider);
      await handleSignIn(credential);
    } catch (error) {
      console.error('Error signing in with Google:', error);
      setTokenLoading(false);
    }
  };

  const signOut = async () => {
    if (!auth) return;
    await firebaseSignOut(auth);
    sessionStorage.removeItem('google-access-token');
    setAccessToken(null);
    setIdToken(null);
    router.push('/');
  };

  const loading = userLoading || tokenLoading;

  return { user, idToken, accessToken, loading, signInWithGoogle, signOut };
}

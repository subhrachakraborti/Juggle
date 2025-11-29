'use client';

import {
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  onIdTokenChanged,
  getAdditionalUserInfo,
  type UserCredential,
  type OAuthCredential
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

  const handleSignIn = useCallback(async (credential: UserCredential) => {
    const additionalInfo = getAdditionalUserInfo(credential);
    if (additionalInfo?.providerId === 'google.com') {
      const oauthCredential = GoogleAuthProvider.credentialFromResult(credential);
      const token = oauthCredential?.accessToken;
      if (token) {
        setAccessToken(token);
        sessionStorage.setItem('google-access-token', token);
      }
    }
    router.push('/home');
  }, [router]);

  useEffect(() => {
    if (!auth) {
      setTokenLoading(false);
      return;
    }

    // Check for redirect result on mount
    const checkRedirectResult = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result) {
          await handleSignIn(result);
        }
      } catch (error) {
        console.error('Error handling redirect result:', error);
      }
    };
    checkRedirectResult();

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
  }, [auth, handleSignIn]);

  const signInWithGoogle = async () => {
    if (!auth) return;
    setTokenLoading(true);
    const provider = new GoogleAuthProvider();
    provider.addScope('https://www.googleapis.com/auth/calendar.readonly');
    try {
      await signInWithRedirect(auth, provider);
      // User will be redirected, no need to handle result here
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

import { signInWithCustomToken } from 'firebase/auth';
import { useRouter } from 'next/router';
import { signIn, useSession } from 'next-auth/react';
import { useEffect, useMemo, useState } from 'react';

import { auth } from '@/lib/firebase/client';

export const useLogin = (needToSignin = false) => {
  const router = useRouter();
  const { status } = useSession();
  const [idToken, setIdToken] = useState<string | null>(null);
  const [firebaseLoggedIn, setFirebaseLoggedIn] = useState(false);
  const liffLoggedIn = useMemo(() => idToken !== null, [idToken]);
  const authLoggedIn = useMemo(() => status === 'authenticated', [status]);
  const isLoggedIn = useMemo(
    () => liffLoggedIn && authLoggedIn && firebaseLoggedIn,
    [authLoggedIn, firebaseLoggedIn, liffLoggedIn]
  );

  const [liffLoading, setLiffLoading] = useState(true);
  const [firebaseLoading, setFirebaseLoading] = useState(true);
  const authLoading = useMemo(() => status === 'loading', [status]);

  const isLoading = useMemo(
    () => liffLoading && firebaseLoading && authLoading,
    [authLoading, firebaseLoading, liffLoading]
  );

  useEffect(() => {
    if (liffLoggedIn) return;

    setLiffLoading(true);
    import('@line/liff').then(({ liff }) => {
      liff
        .init({ liffId: process.env.NEXT_PUBLIC_LIFF_ID as string })
        .then(() => {
          if (!liff.isLoggedIn()) {
            if (needToSignin) router.push(`/signin?redirect=${router.asPath}`);
            else liff.login({ redirectUri: router.asPath });
            return;
          }

          setIdToken(liff.getIDToken());
          setLiffLoading(false);
        })
        .catch((err: any) => {
          console.error({ err });
        });
    });
  }, [liffLoggedIn, needToSignin, router]);

  useEffect(() => {
    if (!liffLoggedIn) return;

    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setFirebaseLoggedIn(true);
        setFirebaseLoading(false);
      } else {
        setFirebaseLoading(true);
        // 作成したapiにidトークンをpost
        fetch('/api/verify', {
          body: JSON.stringify({
            idToken: idToken,
          }),
          headers: {
            'Content-Type': 'application/json',
          },
          method: 'POST',
        }).then((response) => {
          response.text().then((data) => {
            // 返ってきたカスタムトークンでFirebase authにログイン
            signInWithCustomToken(auth, data).then(() => {
              setFirebaseLoading(false);
              setFirebaseLoggedIn(true);
            });
          });
        });
      }
    });

    return () => unsubscribe();
  }, [idToken, liffLoggedIn]);

  useEffect(() => {
    if (!liffLoggedIn) return;

    if (status === 'unauthenticated') {
      signIn('credentials', { callbackUrl: router.asPath, idToken });
    }
  }, [status, idToken, router.asPath, liffLoggedIn]);

  console.log('LoggedIn: ', authLoggedIn, firebaseLoggedIn, liffLoggedIn);
  console.log('Loading: ', authLoading, firebaseLoading, liffLoading);

  return {
    authLoggedIn,
    firebaseLoggedIn,
    isLoading,
    isLoggedIn,
    liffLoggedIn,
  };
};

import { signInWithCustomToken } from 'firebase/auth';
import { useRouter } from 'next/router';
import { signIn, useSession } from 'next-auth/react';
import { useEffect, useMemo, useState } from 'react';

import { auth } from '@/lib/firebase/client';

export const useLogin = (needToSignin = false) => {
  const router = useRouter();
  const { status } = useSession();
  const [liffIdToken, setLiffIdToken] = useState<string | null>(null);
  const [firebaseIdToken, setFirebaseIdToken] = useState<string | null>(null);
  const [firebaseLoggedIn, setFirebaseLoggedIn] = useState(false);
  const [liffLoggedIn, setLiffLoggedIn] = useState(false);
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
            setLiffLoggedIn(false);
            if (needToSignin) router.push(`/signin?redirect=${router.asPath}`);
            else liff.login();
            return;
          }

          setLiffIdToken(liff.getIDToken());
          setLiffLoggedIn(true);
          setLiffLoading(false);
        })
        .catch((err: any) => {
          console.error({ err });
        });
    });
  }, [liffLoggedIn, needToSignin, router]);

  useEffect(() => {
    if (liffIdToken === null) return;

    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        user.getIdToken().then((idToken) => {
          setFirebaseLoggedIn(true);
          setFirebaseIdToken(idToken);
          setFirebaseLoading(false);
        });
      } else {
        setFirebaseLoading(true);
        // 作成したapiにidトークンをpost
        console.log('token', liffIdToken);
        fetch('/api/verify', {
          body: JSON.stringify({
            idToken: liffIdToken,
          }),
          headers: {
            'Content-Type': 'application/json',
          },
          method: 'POST',
        })
          .then((response) => {
            console.log(response);
            response.text().then((data) => {
              console.log(data);

              // 返ってきたカスタムトークンでFirebase authにログイン
              signInWithCustomToken(auth, data)
                .then((response) => {
                  console.log(response.user);
                  response.user.getIdToken().then((idToken) => {
                    setFirebaseIdToken(idToken);
                    setFirebaseLoading(false);
                  });
                })
                .catch((e) => console.log(e));
            });
          })
          .catch((e) => {
            console.log(e);
          });
      }
    });

    return () => unsubscribe();
  }, [firebaseIdToken, liffIdToken, liffLoggedIn]);

  useEffect(() => {
    if (liffIdToken === null || firebaseIdToken === null) return;

    if (status === 'unauthenticated') {
      signIn('credentials', { callbackUrl: router.asPath, firebaseIdToken });
    }
  }, [status, firebaseIdToken, router.asPath, liffIdToken]);

  console.log('LoggedIn: ', liffLoggedIn, firebaseLoggedIn, authLoggedIn);
  console.log('Loading: ', liffLoading, firebaseLoading, authLoading);

  return {
    authLoggedIn,
    firebaseLoggedIn,
    isLoading,
    isLoggedIn,
    liffLoggedIn,
  };
};

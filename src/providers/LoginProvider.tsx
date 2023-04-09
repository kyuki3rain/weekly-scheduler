import { useRouter } from 'next/router';
import { signIn, useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';

import Loading from '@/components/Loading';
import { auth } from '@/lib/firebase/client';

type Props = {
  children: React.ReactNode;
};

export default function LoginProvider({ children }: Props) {
  const router = useRouter();
  const { status } = useSession();
  const [isLoggedin, setIsLoggedin] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(function (user) {
      if (user) {
        setIsLoggedin(true);
        if (status === 'unauthenticated') {
          user.getIdToken().then((idToken) => {
            signIn('credentials', { callbackUrl: router.asPath, idToken });
          });
        }
      } else {
        setIsLoggedin(false);
        router.push(`/signin?redirect=${router.asPath}`);
      }
    });
    return () => unsubscribe();
  }, [router, status]);

  if (status === 'loading' || !isLoggedin) return <Loading></Loading>;

  return <>{children}</>;
}

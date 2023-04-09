import { useRouter } from 'next/router';
import { signIn, useSession } from 'next-auth/react';
import { useEffect } from 'react';

import { auth } from '@/lib/firebase/client';

type Props = {
  children: React.ReactNode;
};

export default function LoginProvider({ children }: Props) {
  const router = useRouter();
  const { status } = useSession();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(function (user) {
      if (user) {
        if (status === 'unauthenticated')
          user.getIdToken().then((idToken) => {
            signIn('credentials', { callbackUrl: router.asPath, idToken });
          });
      } else {
        router.push(`/signin?redirect=${router.asPath}`);
      }
    });
    return () => unsubscribe();
  }, [router, status]);

  return <>{children}</>;
}

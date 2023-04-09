import { GoogleAuthProvider, onAuthStateChanged } from 'firebase/auth';
import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import { signIn } from 'next-auth/react';
import { useEffect } from 'react';

import Loading from '@/components/Loading';
import StyledFirebaseAuth from '@/components/StyledFirebaseAuth';
import { auth } from '@/lib/firebase/client';

type Props = {
  redirect: string;
};

export default function Home({ redirect }: Props) {
  const router = useRouter();

  const uiConfig = {
    signInFlow: 'popup',
    signInOptions: [GoogleAuthProvider.PROVIDER_ID],
    signInSuccessUrl: router.asPath,
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        user.getIdToken().then((idToken) => {
          signIn('credentials', { callbackUrl: redirect, idToken });
        });
      }
    });
    return () => unsubscribe();
  }, [redirect]);

  if (auth.currentUser) return <Loading></Loading>;

  return (
    <div>
      ログインが必要です
      <StyledFirebaseAuth uiConfig={uiConfig} firebaseAuth={auth} />
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const redirect = context.query?.redirect;
  if (typeof redirect !== 'string' || redirect === '') {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      redirect,
    },
  };
};

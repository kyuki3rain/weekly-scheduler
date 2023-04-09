import { GoogleAuthProvider, onAuthStateChanged } from 'firebase/auth';
import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import { signIn } from 'next-auth/react';
import { useEffect, useState } from 'react';

import Loading from '@/components/Loading';
import StyledFirebaseAuth from '@/components/StyledFirebaseAuth';
import { auth } from '@/lib/firebase/client';

type Props = {
  redirect: string;
};

export default function Home({ redirect }: Props) {
  const router = useRouter();
  const [isLoggedin, setIsLoggedin] = useState(true);

  const uiConfig = {
    signInFlow: 'popup',
    signInOptions: [GoogleAuthProvider.PROVIDER_ID],
    signInSuccessUrl: '/signin?redirect=' + redirect,
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsLoggedin(true);
        user.getIdToken().then((idToken) => {
          signIn('credentials', { callbackUrl: redirect, idToken });
        });
      } else {
        setIsLoggedin(false);
      }
    });
    return () => unsubscribe();
  }, [redirect]);

  if (isLoggedin) return <Loading></Loading>;

  return (
    <div>
      ログインが必要です
      <StyledFirebaseAuth uiConfig={uiConfig} firebaseAuth={auth} />
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const redirect = context.query?.redirect;
  if (
    redirect === undefined ||
    typeof redirect !== 'string' ||
    redirect === ''
  ) {
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

import { signOut as firebaseSignOut } from 'firebase/auth';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { signOut, useSession } from 'next-auth/react';

import Loading from '@/components/Loading';
import { auth } from '@/lib/firebase/client';
import LoginProvider from '@/providers/LoginProvider';

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  if (status === 'loading') return <Loading />;

  if (session) {
    return (
      <LoginProvider>
        Signed in as {session?.user?.name} <br />
        <button
          onClick={() => {
            firebaseSignOut(auth).then(() => {
              signOut();
            });
          }}
        >
          Sign out
        </button>
      </LoginProvider>
    );
  }

  return (
    <LoginProvider>
      Not signed in <br />
      <Link href={`/signin?redirect=${router.asPath}`}>sign in</Link>
    </LoginProvider>
  );
}

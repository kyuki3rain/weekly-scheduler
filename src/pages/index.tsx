import { signIn, signOut, useSession } from 'next-auth/react';

import Loading from '@/components/Loading';

export default function Home() {
  const { data: session, status } = useSession();

  if (status === 'loading') return <Loading />;

  if (session) {
    return (
      <>
        Signed in as {session?.user?.name} <br />
        <button onClick={() => signOut()}>Sign out</button>
      </>
    );
  }

  return (
    <>
      Not signed in <br />
      <button onClick={() => signIn()}>Sign in</button>
    </>
  );
}

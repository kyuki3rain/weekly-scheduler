import { signIn, useSession } from 'next-auth/react';
import { useEffect } from 'react';

import Loading from '@/components/Loading';

type Props = {
  children: React.ReactNode;
};

export default function UserProvider({ children }: Props) {
  const { status } = useSession();

  useEffect(() => {
    if (status === 'unauthenticated') signIn();
  }, [status]);

  if (status === 'loading') return <Loading />;

  return <>{children}</>;
}

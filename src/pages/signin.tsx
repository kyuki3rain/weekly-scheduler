import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

import Loading from '@/components/Loading';
import { useLogin } from '@/hooks/useLogin';

type Props = {
  redirect: string;
};

export default function Home({ redirect }: Props) {
  const { isLoading, isLoggedIn } = useLogin(false);
  const router = useRouter();

  useEffect(() => {
    if (isLoggedIn) router.push(redirect);
  }, [isLoggedIn, redirect, router]);

  if (isLoggedIn) return <div>ログイン完了しました</div>;

  if (isLoading) return <Loading></Loading>;

  return (
    <div>
      <div>未ログイン</div>
      <button onClick={() => router.reload()}>リロード</button>
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

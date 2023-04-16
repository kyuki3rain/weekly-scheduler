import { GetServerSideProps } from 'next';

import Loading from '@/components/Loading';
import { useLogin } from '@/hooks/useLogin';

type Props = {
  redirect: string;
};

export default function Home({ redirect }: Props) {
  const { isLoading, isLoggedIn } = useLogin(false);

  if (isLoggedIn) return <div>ログイン完了しました</div>;

  if (isLoading) return <Loading></Loading>;

  return <div>未ログイン</div>;
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

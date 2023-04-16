import Loading from '@/components/Loading';
import { useLogin } from '@/hooks/useLogin';

type Props = {
  children: React.ReactNode;
};

export default function LoginProvider({ children }: Props) {
  const { isLoggedIn } = useLogin(true);

  if (!isLoggedIn) return <Loading></Loading>;

  return <>{children}</>;
}

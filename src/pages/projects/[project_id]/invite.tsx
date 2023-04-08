import { doc, setDoc } from 'firebase/firestore';
import { Timestamp } from 'firebase-admin/firestore';
import { DateTime } from 'luxon';
import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import { getSession } from 'next-auth/react';
import { useState } from 'react';

import Loading from '@/components/Loading';
import { db as adminDB } from '@/lib/firebase/admin';
import { db as clientDB } from '@/lib/firebase/client';

type Props = {
  project_id: string;
  user_id: string;
};

export default function Home({ project_id, user_id }: Props) {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  if (loading) <Loading />;

  return (
    <div className="mx-auto flex h-screen w-80 flex-col justify-center">
      <div className="mb-4 text-center text-xl">名前を入力してください</div>
      <div className="flex">
        <input
          type="text"
          className="flex-1"
          value={name}
          onChange={(e) => setName(e.currentTarget.value)}
        />
        <button
          type="button"
          className=" ml-2 rounded-lg bg-blue-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 "
          onClick={() => {
            setLoading(true);
            const userRef = doc(
              clientDB,
              'projects',
              project_id,
              'users',
              user_id
            );
            setDoc(userRef, { name }).then(() => {
              setLoading(false);
              router.push(`/projects/${project_id}`);
            });
          }}
        >
          決定
        </button>
      </div>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getSession(context);
  if (!session?.user) {
    return { props: {} };
  }

  const project_id = context.params?.project_id;
  if (typeof project_id !== 'string' || project_id === '') {
    return {
      notFound: true,
    };
  }

  const token = context.query?.token;
  if (typeof token !== 'string' || token === '') {
    return {
      notFound: true,
    };
  }

  const tokenRef = adminDB
    .collection('projects')
    .doc(project_id)
    .collection('tokens')
    .doc(token);
  const snapshot = await tokenRef.get();
  const expiredAt: Timestamp | undefined = snapshot.data()?.expiredAt;

  if (!expiredAt) {
    return {
      notFound: true,
    };
  }

  if (DateTime.now().toMillis() > expiredAt.toMillis()) {
    return {
      notFound: true,
    };
  }

  const userRef = adminDB
    .collection('projects')
    .doc(project_id)
    .collection('users')
    .doc(session.user.id);
  await userRef.set({ name: '' });

  return {
    props: {
      project_id,
      user_id: session.user.id,
    },
  };
};

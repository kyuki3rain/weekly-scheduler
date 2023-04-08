import { DateTime } from 'luxon';
import { GetServerSideProps } from 'next';
import { getSession } from 'next-auth/react';
import { useMemo } from 'react';

import DayCard from '@/components/DayCard';
import Loading from '@/components/Loading';
import Modal from '@/components/Modal';
import useFetchTerms from '@/hooks/useFetchTerms';
import { db } from '@/lib/firebase/admin';

export type User = {
  id: string;
  name: string;
};

type Props = {
  project_id: string;
  users: User[];
};

export default function Home({ project_id, users }: Props) {
  const week = useMemo(() => {
    const today = DateTime.now().startOf('day');
    return [...Array(7)].map((_, i) => {
      return today.plus({ days: i });
    });
  }, []);
  const { loading, terms } = useFetchTerms(project_id, week);

  if (loading) return <Loading />;

  return (
    <>
      <div className="flex flex-row flex-wrap justify-center">
        {week.map((day) => (
          <DayCard
            day={day}
            terms={terms}
            users={users}
            project_id={project_id}
            key={day.toISODate()}
          ></DayCard>
        ))}
      </div>
      <Modal />
    </>
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

  const usersRef = db
    .collection('projects')
    .doc(project_id)
    .collection('users');
  const snapshots = await usersRef.get();
  const users = snapshots.docs.map((doc) => ({
    id: doc.id,
    name: doc.data()?.name ?? '',
  }));

  if (
    users.length === 0 ||
    !users.map((user) => user.id).includes(session.user.id)
  ) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      project_id,
      users,
    },
  };
};

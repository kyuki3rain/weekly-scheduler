import { DateTime } from 'luxon';
import { GetServerSideProps } from 'next';
import { useMemo } from 'react';

import DayCard from '@/components/DayCard';
import Loading from '@/components/Loading';
import Modal from '@/components/Modal';
import useFetchTerms from '@/hooks/useFetchTerms';
import { db } from '@/lib/firebase/admin';

type Props = {
  project_id: string;
  user_ids: string[];
};

export default function Home({ project_id, user_ids }: Props) {
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
            user_ids={user_ids}
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
  const users = await usersRef.get();
  const user_ids = users.docs.map((doc) => doc.id);

  if (user_ids.length === 0) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      project_id,
      user_ids,
    },
  };
};

import { useAtom } from 'jotai';
import { DateTime } from 'luxon';
import { GetServerSideProps } from 'next';
import { getSession } from 'next-auth/react';
import { useEffect, useMemo } from 'react';

import { adminTermConverter, Term } from '@/@types/term';
import DayCard from '@/components/DayCard';
import Modal from '@/components/Modal';
import { db } from '@/lib/firebase/admin';
import LoginProvider from '@/providers/LoginProvider';
import { Terms, termsAtom, UserTerms } from '@/states/terms';

export type User = {
  id: string;
  name: string;
  terms: Term[];
};

type Props = {
  project_id: string;
  terms: Term[];
  users: User[];
};

export default function Home({ project_id, terms: termArray, users }: Props) {
  const [terms, setTerms] = useAtom(termsAtom);

  const week = useMemo(() => {
    const today = DateTime.now().startOf('day');
    return [...Array(7)].map((_, i) => {
      return today.plus({ days: i });
    });
  }, []);

  useEffect(() => {
    setTerms((prev) => {
      termArray.forEach((term) => {
        const userTerms: UserTerms = prev.get(term.date) ?? new Map();
        const termMap: Terms = userTerms.get(term.user_id) ?? new Map();
        termMap.set(term.term, term);
        userTerms.set(term.user_id, termMap);
        prev.set(term.date, userTerms);
      });

      return new Map(prev);
    });
  }, [setTerms, termArray]);

  return (
    <LoginProvider>
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
    </LoginProvider>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getSession(context);
  if (!session?.user) {
    return {
      redirect: {
        destination: `/signin?redirect=${context.resolvedUrl}`,
        permanent: true,
      },
    };
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
  const users = snapshots.docs
    .map((doc) => ({
      id: doc.id,
      name: doc.data()?.name ?? '',
    }))
    .flatMap((user) => (user.name === '' ? [] : [user]));

  if (
    users.length === 0 ||
    !users.map((user) => user.id).includes(session.user.uid)
  ) {
    return {
      notFound: true,
    };
  }

  const today = DateTime.now().startOf('day');
  const weekKey = [...Array(7)].map((_, i) => {
    return today.plus({ days: i }).toISODate();
  });

  const termRef = db
    .collectionGroup('terms')
    .where('project_id', '==', project_id)
    .where('date', 'in', weekKey)
    .withConverter<Term>(adminTermConverter);

  let terms: Term[] = [];
  const snapshot = await termRef.get();

  snapshot.forEach((doc) => {
    terms.push(doc.data());
  });

  return {
    props: {
      project_id,
      terms,
      users,
    },
  };
};

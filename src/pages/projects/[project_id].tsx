import { DateTime } from 'luxon';
import { GetServerSideProps } from 'next';
import { useMemo } from 'react';

import Loading from '@/components/Loading';
import useFetchTerms from '@/hooks/useFetchTerms';
import { db } from '@/lib/firebase/admin';
import { when } from '@/lib/firebase/match';
import { toTermText } from '@/types/term';

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
      <h1>Project View</h1>
      {week.map((day) => {
        const dayKey = day.toISODate();
        if (!dayKey) return;

        const userTerms = terms.get(dayKey);

        return (
          <div className="mx-auto mb-10 w-4/5 sm:w-full" key={dayKey}>
            <div className="flex-row text-center">{dayKey}</div>
            <div className="flex flex-row">
              <div className="flex-1 text-center">ユーザー名</div>
              {[...Array(3)].map((_, i) => (
                <div className="flex-1 text-center" key={i}>
                  {toTermText(i)}
                </div>
              ))}
            </div>
            {user_ids.map((user_id) => {
              const terms = userTerms?.get(user_id);
              return (
                <div className="flex flex-row" key={`${dayKey}-${user_id}`}>
                  <div className="flex-1 text-center">{user_id}</div>
                  {[...Array(3)].map((_, i) => {
                    const term = terms?.get(i);
                    const status =
                      (term &&
                        when(term.status)
                          .on(
                            (v) => v > 0,
                            () => '〇'
                          )
                          .on(
                            (v) => v === 0,
                            () => '△'
                          )
                          .on(
                            (v) => v < 0,
                            () => '×'
                          )
                          .otherwise(() => undefined)) ??
                      '?';
                    return (
                      <div
                        className="flex-1 text-center"
                        key={`${dayKey}-${user_id}-${toTermText(i)}`}
                      >
                        <div>{status}</div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        );
      })}
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

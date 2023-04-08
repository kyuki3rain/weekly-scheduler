import { collectionGroup, getDocs, query, where } from 'firebase/firestore';
import { useAtom } from 'jotai';
import { DateTime } from 'luxon';
import { useCallback, useEffect, useState } from 'react';

import { db } from '@/lib/firebase/client';
import { Terms, termsAtom, UserTerms } from '@/states/terms';
import { termConverter } from '@/types/term';

export default function useFetchTerms(project_id: string, week: DateTime[]) {
  const [terms, setTerms] = useAtom(termsAtom);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchTerm = useCallback(async () => {
    const weekKey = week.map((d) => d.toISODate());

    const termQuery = query(
      collectionGroup(db, 'terms'),
      where('project_id', '==', project_id),
      where('date', 'in', weekKey)
    ).withConverter(termConverter);

    getDocs(termQuery).then((snapshot) => {
      snapshot.forEach((doc) => {
        console.log(doc.id, ' => ', doc.data());
        setTerms((prev) => {
          const term = doc.data();
          const userTerms: UserTerms = prev.get(term.date) ?? new Map();
          const termMap: Terms = userTerms.get(term.user_id) ?? new Map();
          termMap.set(term.term, term);
          userTerms.set(term.user_id, termMap);
          return prev.set(term.date, userTerms);
        });
      });
      setLoading(false);
    });
  }, [project_id, setTerms, week]);

  useEffect(() => {
    fetchTerm();
  }, [fetchTerm]);

  return { loading, terms };
}

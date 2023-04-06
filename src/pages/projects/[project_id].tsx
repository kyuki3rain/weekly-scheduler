import { collectionGroup, getDocs, query, where } from 'firebase/firestore';
import { DateTime } from 'luxon';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

import { db } from '@/lib/firebase/client';

export default function Home() {
  const [terms, setTerms] = useState([]);

  const router = useRouter();
  const { project_id } = router.query;

  useEffect(() => {
    if (!project_id || project_id === '') return;

    const today = DateTime.now().startOf('day');
    const week = [...Array(7)].map((_, i) => {
      return today.plus({ days: i }).toFormat('yyyy-MM-dd');
    });

    const termQuery = query(
      collectionGroup(db, 'terms'),
      where('project_id', '==', project_id),
      where('date', 'in', week)
    );

    getDocs(termQuery).then((snapshot) => {
      snapshot.forEach((doc) => {
        console.log(doc.id, ' => ', doc.data());
      });
    });
  }, [project_id]);

  return (
    <>
      <h1>Project View</h1>
    </>
  );
}

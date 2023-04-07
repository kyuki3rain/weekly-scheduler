import { FirestoreDataConverter } from 'firebase/firestore';

export const termTypes = ['朝', '昼', '夜'] as const;
export type TermType = (typeof termTypes)[number];

export type Term = {
  date: string;
  project_id: string;
  status: number;
  term: number;
  user_id: string;
};

export const termConverter: FirestoreDataConverter<Term> = {
  fromFirestore: (snapshot, options) => {
    const data = snapshot.data(options);

    return {
      date: data.date,
      project_id: data.project_id,
      status: data.status,
      term: data.term,
      user_id: data.user_id,
    };
  },
  toFirestore: (term: Term) => {
    return {
      date: term.date,
      project_id: term.project_id,
      status: term.status,
      term: term.term,
      user_id: term.user_id,
    };
  },
};

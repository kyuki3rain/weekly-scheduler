import { FirestoreDataConverter } from 'firebase/firestore';

export type TermType = 'breakfast' | 'lunch' | 'dinner';

export const toTermType = (term: number): TermType => {
  switch (term) {
    case 0:
      return 'breakfast';
    case 1:
      return 'lunch';
    case 2:
      return 'dinner';
    default:
      return 'breakfast';
  }
};

export const toTermText = (term: number) => {
  switch (term) {
    case 0:
      return '朝';
    case 1:
      return '昼';
    case 2:
      return '夜';
    default:
      return '朝';
  }
};

export const fromTermType = (term: TermType): number => {
  switch (term) {
    case 'breakfast':
      return 0;
    case 'lunch':
      return 1;
    case 'dinner':
      return 2;
    default:
      return 0;
  }
};

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

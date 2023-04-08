import { atom } from 'jotai';

import { Term } from '@/types/term';

export type Terms = Map<number, Term>;
export type UserTerms = Map<string, Terms>;
export type DateTerms = Map<string, UserTerms>;

export const termsAtom = atom<DateTerms>(new Map());

import { atom } from 'jotai';

type TermTypeModalParams = {
  date: string;
  project_id: string;
  status?: number;
  term: number;
  user_id: string;
};

type TermTypeModal = {
  open: boolean;
  params?: TermTypeModalParams;
};

export const TermTypeModalAtom = atom<TermTypeModal>({
  open: false,
});

export const getTermTypeModalOpenAtom = atom(
  (get) => get(TermTypeModalAtom).open
);
export const getTermTypeModalPramsAtom = atom(
  (get) => get(TermTypeModalAtom).params
);

export const setTermTypeModalOpenAtom = atom(
  null,
  (get, set, params: TermTypeModalParams) => {
    set(TermTypeModalAtom, { open: true, params });
  }
);

export const setTermTypeModalCloseAtom = atom(null, (get, set) => {
  set(TermTypeModalAtom, { open: false, params: undefined });
});

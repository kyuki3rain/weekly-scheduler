import { doc, setDoc } from 'firebase/firestore';
import { useAtomValue, useSetAtom } from 'jotai';
import { useCallback, useEffect, useState } from 'react';
import { FiCircle, FiTriangle } from 'react-icons/fi';
import { RxCross1 } from 'react-icons/rx';

import Loading from '@/components/Loading';
import { db } from '@/lib/firebase/client';
import { Terms, termsAtom, UserTerms } from '@/states/terms';
import {
  getTermTypeModalOpenAtom,
  getTermTypeModalPramsAtom,
  setTermTypeModalCloseAtom,
} from '@/states/termTypeModal';
import { termConverter, termTypeKeys } from '@/@types/term';

const Modal = () => {
  const isOpen = useAtomValue(getTermTypeModalOpenAtom);

  if (!isOpen) return <></>;

  return <ModalView />;
};

const ModalView = () => {
  const close = useSetAtom(setTermTypeModalCloseAtom);
  const params = useAtomValue(getTermTypeModalPramsAtom);
  const [loading, setLoading] = useState(false);
  const setTerms = useSetAtom(termsAtom);

  const setTerm = useCallback(
    (status: number) => {
      if (!params) return;

      setLoading(true);
      setDoc(
        doc(
          db,
          'projects',
          params.project_id,
          'users',
          params.user_id,
          'dates',
          params.date,
          'terms',
          termTypeKeys[params.term]
        ).withConverter(termConverter),
        { ...params, status }
      ).then(() => {
        setLoading(false);
        setTerms((prev) => {
          const userTerms: UserTerms = prev.get(params.date) ?? new Map();
          const termMap: Terms = userTerms.get(params.user_id) ?? new Map();
          termMap.set(params.term, { ...params, status });
          userTerms.set(params.user_id, termMap);
          return new Map(prev.set(params.date, userTerms));
        });
        close();
      });
    },
    [close, params, setTerms]
  );

  useEffect(() => {
    if (!params) close();
  }, [close, params]);

  if (!params) return <></>;

  if (loading) return <Loading></Loading>;

  return (
    <div className="fixed left-0 top-0 block h-full w-full">
      <div
        className="fixed left-0 top-0 h-full w-full bg-black opacity-50"
        onClick={(e) => {
          e.stopPropagation();
          close();
        }}
        onKeyDown={(e) => {
          e.stopPropagation();
          close();
        }}
      />
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-md bg-white p-4">
        <div className="flex flex-row">
          <button
            type="button"
            className="mx-2 inline-flex items-center rounded-lg border border-blue-700 p-4 text-center text-sm font-medium text-blue-700 hover:bg-blue-700 hover:text-white  focus:outline-none focus:ring-4 focus:ring-blue-300"
            onClick={(e) => {
              e.stopPropagation();
              if (params.status && params.status > 0) close();
              else setTerm(1);
            }}
          >
            <FiCircle className="h-12 w-12" />
            <span className="sr-only">いる</span>
          </button>
          <button
            type="button"
            className="mx-2 inline-flex items-center rounded-lg border border-blue-700 p-4 text-center text-sm font-medium text-blue-700 hover:bg-blue-700 hover:text-white  focus:outline-none focus:ring-4 focus:ring-blue-300"
            onClick={(e) => {
              e.stopPropagation();
              if (params.status && params.status === 0) close();
              else setTerm(0);
            }}
          >
            <FiTriangle className="h-12 w-12" />
            <span className="sr-only">わからない</span>
          </button>
          <button
            type="button"
            className="mx-2 inline-flex items-center rounded-lg border border-blue-700 p-4 text-center text-sm font-medium text-blue-700 hover:bg-blue-700 hover:text-white  focus:outline-none focus:ring-4 focus:ring-blue-300"
            onClick={(e) => {
              e.stopPropagation();
              if (params.status && params.status < 0) close();
              else setTerm(-1);
            }}
          >
            <RxCross1 className="h-12 w-12" />
            <span className="sr-only">いらない</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;

import { useSetAtom } from 'jotai';

import { when } from '@/lib/firebase/match';
import { setTermTypeModalOpenAtom } from '@/states/termTypeModal';

type Props = {
  term: {
    date: string;
    project_id: string;
    status?: number;
    term: number;
    user_id: string;
  };
};

export default function Status({ term }: Props) {
  const open = useSetAtom(setTermTypeModalOpenAtom);

  const status =
    term?.status !== undefined &&
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
      .otherwise(() => false);

  if (status === false) return <div onClick={() => open(term)}>?</div>;

  return <div onClick={() => open(term)}>{status}</div>;
}

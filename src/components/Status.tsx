import { when } from '@/lib/firebase/match';

type Props = {
  statusNum?: number;
};

export default function Status({ statusNum }: Props) {
  const status =
    statusNum !== undefined &&
    when(statusNum)
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

  if (status === false) return <div>?</div>;

  return <div>{status}</div>;
}

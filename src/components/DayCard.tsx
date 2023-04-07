import { DateTime } from 'luxon';

import Status from '@/components/Status';
import { DateTerms } from '@/hooks/useFetchTerms';
import { termTypes } from '@/types/term';

type Props = {
  day: DateTime;
  terms: DateTerms;
  user_ids: string[];
};

export default function DayCard({ day, terms, user_ids }: Props) {
  const dayKey = day.toISODate();
  if (!dayKey) return <></>;

  const userTerms = terms.get(dayKey);

  return (
    <div className="m-4">
      <div className="block max-w-sm rounded-lg border border-gray-200 bg-white p-4 shadow">
        <div className="mb-4 text-center text-2xl">{dayKey}</div>
        <div className="flex flex-row">
          <div className="w-64 flex-1 text-center">ユーザー名</div>
          {termTypes.map((termType) => (
            <div className="flex-1 text-center" key={`${dayKey}-${termType}`}>
              {termType}
            </div>
          ))}
        </div>
        {user_ids.map((user_id) => {
          const terms = userTerms?.get(user_id);
          return (
            <div className="flex flex-row" key={`${dayKey}-${user_id}`}>
              <div className="w-1/4 flex-1 break-words text-center">
                {user_id}
              </div>
              {termTypes.map((termType, i) => {
                const term = terms?.get(i);
                return (
                  <div
                    className="my-auto flex-1 text-center"
                    key={`${dayKey}-${user_id}-${termType}`}
                  >
                    <Status statusNum={term?.status}></Status>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}

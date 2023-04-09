import { DateTime, Settings } from 'luxon';

import { termTypes } from '@/@types/term';
import Status from '@/components/Status';
import { User } from '@/pages/projects/[project_id]';
import { DateTerms } from '@/states/terms';

type Props = {
  day: DateTime;
  project_id: string;
  terms: DateTerms;
  users: User[];
};

Settings.defaultLocale = 'ja'; // 言語設定が必要です。

export default function DayCard({ day, project_id, terms, users }: Props) {
  const dayKey = day.toISODate();
  if (!dayKey) return <></>;

  const userTerms = terms.get(dayKey);

  return (
    <div className="m-4">
      <div className="block max-w-sm rounded-lg border border-gray-200 bg-white p-4 shadow">
        <div className="mb-4 text-center text-2xl">{`${dayKey}(${day.weekdayShort})`}</div>
        <div className="flex flex-row">
          <div className="w-64 flex-1 text-center">ユーザー名</div>
          {termTypes.map((termType) => (
            <div className="flex-1 text-center" key={`${dayKey}-${termType}`}>
              {termType}
            </div>
          ))}
        </div>
        {users.map((user) => {
          const terms = userTerms?.get(user.id);
          return (
            <div className="flex flex-row" key={`${dayKey}-${user.id}`}>
              <div className="w-1/4 flex-1 break-words text-center">
                {user.name}
              </div>
              {termTypes.map((termType, i) => {
                const term = terms?.get(i);
                return (
                  <div
                    className="my-auto flex-1 text-center"
                    key={`${dayKey}-${user.id}-${termType}`}
                  >
                    <Status
                      term={{
                        ...term,
                        date: dayKey,
                        project_id,
                        term: i,
                        user_id: user.id,
                      }}
                    ></Status>
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

'use client';

import Link from 'next/link';
import { shiftIsoWeek, type IsoWeek } from '@/lib/dates';

export function WeekNav({
  current,
  isCurrentWeek,
}: {
  current: IsoWeek;
  isCurrentWeek: boolean;
}) {
  const href = ({ year, week }: IsoWeek) => `/planner?y=${year}&w=${week}`;

  return (
    <div className="flex items-center gap-2">
      <Link
        href={href(shiftIsoWeek(current, -1))}
        aria-label="Previous week"
        className="btn-ghost px-3 py-2"
      >
        ←
      </Link>
      {!isCurrentWeek && (
        <Link href="/planner" className="btn-ghost px-3 py-2 text-sm">
          Today
        </Link>
      )}
      <Link
        href={href(shiftIsoWeek(current, 1))}
        aria-label="Next week"
        className="btn-ghost px-3 py-2"
      >
        →
      </Link>
    </div>
  );
}

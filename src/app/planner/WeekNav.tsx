'use client';

import Link from 'next/link';
import { shiftIsoWeek, type IsoWeek } from '@/lib/dates';
import { IconChevronLeft, IconChevronRight } from '@/components/icons';

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
        className="btn-ghost w-11 px-0"
      >
        <IconChevronLeft size={16} />
      </Link>
      {!isCurrentWeek && (
        <Link href="/planner" className="btn-ghost text-xs">
          Today
        </Link>
      )}
      <Link
        href={href(shiftIsoWeek(current, 1))}
        aria-label="Next week"
        className="btn-ghost w-11 px-0"
      >
        <IconChevronRight size={16} />
      </Link>
    </div>
  );
}

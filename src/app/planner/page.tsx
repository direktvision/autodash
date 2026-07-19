import { getItemsForWeek, getSettings } from '@/lib/queries';
import { currentIsoWeek, formatWeekRange, weeksInIsoYear } from '@/lib/dates';
import { PageHeader } from '@/components/ui';
import { WeekNav } from './WeekNav';
import { AddSlot } from './AddSlot';
import { PlannerList } from './PlannerList';

export const dynamic = 'force-dynamic';

export default async function PlannerPage({
  searchParams,
}: {
  searchParams: Promise<{ y?: string; w?: string }>;
}) {
  const params = await searchParams;
  const fallback = currentIsoWeek();

  // Validate rather than trust the query string — a bad ?w=99 would otherwise
  // produce a nonsense week range.
  const parsedYear = Number(params.y);
  const year =
    Number.isInteger(parsedYear) && parsedYear >= 2020 && parsedYear <= 2100
      ? parsedYear
      : fallback.year;

  const parsedWeek = Number(params.w);
  const week =
    Number.isInteger(parsedWeek) &&
    parsedWeek >= 1 &&
    parsedWeek <= weeksInIsoYear(year)
      ? parsedWeek
      : fallback.week;

  const current = { year, week };
  const [items, settings] = await Promise.all([
    getItemsForWeek(current),
    getSettings(),
  ]);

  const target = settings.weekly_target;
  const onTarget = items.length >= target;

  return (
    <>
      <PageHeader
        title={`Week ${week}`}
        subtitle={formatWeekRange(current)}
        action={<WeekNav current={current} isCurrentWeek={
          year === fallback.year && week === fallback.week
        } />}
      />

      <div className="card mb-6 flex items-center justify-between p-4 sm:p-5">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-faint">
            Planned this week
          </p>
          <p className="display tnum mt-1.5 text-3xl leading-none">
            <span className={onTarget ? 'text-gold' : 'text-bone'}>
              {items.length}
            </span>
            <span className="text-faint"> / {target}</span>
          </p>
        </div>
        <div className="flex items-end gap-1.5" aria-hidden>
          {Array.from({ length: Math.max(target, items.length) }, (_, i) => (
            <span
              key={i}
              className={`w-[3px] rounded-full transition-all duration-300 ${
                i < items.length ? 'h-9 bg-gold' : 'h-5 bg-white/[0.09]'
              }`}
            />
          ))}
        </div>
      </div>

      <PlannerList items={items} />

      <div className="mt-4">
        <AddSlot week={current} />
      </div>
    </>
  );
}

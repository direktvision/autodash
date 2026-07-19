import Link from 'next/link';
import {
  getItemsForWeek,
  getNextFilmingDay,
  getWeekStats,
  getSettings,
} from '@/lib/queries';
import {
  currentIsoWeek,
  shiftIsoWeek,
  formatWeekRange,
  formatDayLabel,
  todayIso,
} from '@/lib/dates';
import {
  ContentCard,
  EmptyState,
  PageHeader,
  SectionTitle,
  StatusBadge,
} from '@/components/ui';
import { PRODUCTION_LABEL, type ContentItem, type ProductionLevel } from '@/lib/types';
import { OnSiteDays } from './OnSiteDays';

export const dynamic = 'force-dynamic';

const nf = new Intl.NumberFormat('en-GB');

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="card p-4 sm:p-5">
      <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-faint">
        {label}
      </p>
      <p className="display tnum mt-1.5 text-[2rem] leading-none text-bone sm:text-4xl">
        {value}
      </p>
    </div>
  );
}

export default async function Home() {
  const week = currentIsoWeek();
  const lastWeek = shiftIsoWeek(week, -1);

  const [items, filming, stats, settings] = await Promise.all([
    getItemsForWeek(week),
    getNextFilmingDay(),
    getWeekStats(lastWeek),
    getSettings(),
  ]);

  const target = settings.weekly_target;
  const today = todayIso();

  // Group the filming-day work by how much setup it needs.
  const byLevel = new Map<ProductionLevel, ContentItem[]>();
  for (const item of filming.scheduled) {
    const list = byLevel.get(item.production_level) ?? [];
    list.push(item);
    byLevel.set(item.production_level, list);
  }

  const avg = stats.posts ? Math.round(stats.views / stats.posts) : 0;

  return (
    <>
      <PageHeader
        title={`Week ${week.week}`}
        subtitle={formatWeekRange(week)}
        action={
          <Link href="/planner" className="btn-ghost">
            Open planner
          </Link>
        }
      />

      {/* This week ---------------------------------------------------------- */}
      <section className="mb-10">
        <SectionTitle
          aside={
            <span className="tnum text-[13px] text-muted">
              <span className={items.length >= target ? 'text-gold' : 'text-bone'}>
                {items.length}
              </span>
              <span className="text-faint"> / {target} planned</span>
            </span>
          }
        >
          This week
        </SectionTitle>

        {items.length === 0 ? (
          <EmptyState
            message="Nothing planned this week yet."
            hint="Promote an idea from the bank, or add a slot in the planner."
          />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
              <ContentCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </section>

      {/* Next filming day --------------------------------------------------- */}
      <section className="mb-10">
        <SectionTitle aside={<OnSiteDays days={settings.on_site_days} />}>
          Next filming day
          {filming.date && (
            <span className="ml-3 text-lg text-gold">
              {filming.date === today ? 'Today' : formatDayLabel(filming.date)}
            </span>
          )}
        </SectionTitle>

        {filming.scheduled.length === 0 && filming.unscheduled.length === 0 ? (
          <EmptyState message="Nothing waiting to be filmed." />
        ) : (
          <div className="card divide-y divide-white/[0.06]">
            {[...byLevel.entries()].map(([level, group]) => (
              <div key={level} className="p-4 sm:p-5">
                <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.14em] text-gold-dim">
                  {PRODUCTION_LABEL[level]}
                </p>
                <ul className="space-y-2.5">
                  {group.map((item) => (
                    <li key={item.id}>
                      <Link
                        href={`/content/${item.id}`}
                        className="group flex items-center justify-between gap-3"
                      >
                        <span className="text-sm text-bone transition-colors group-hover:text-gold-bright">
                          {item.title}
                        </span>
                        <StatusBadge status={item.status} />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            {filming.unscheduled.length > 0 && (
              <div className="p-4 sm:p-5">
                <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.14em] text-faint">
                  Undated backlog
                </p>
                <ul className="space-y-2.5">
                  {filming.unscheduled.slice(0, 6).map((item) => (
                    <li key={item.id}>
                      <Link
                        href={`/content/${item.id}`}
                        className="group flex items-center justify-between gap-3"
                      >
                        <span className="text-sm text-muted transition-colors group-hover:text-bone">
                          {item.title}
                        </span>
                        <StatusBadge status={item.status} />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Last week's numbers ------------------------------------------------ */}
      <section>
        <SectionTitle
          aside={
            <span className="text-[13px] text-faint">week {lastWeek.week}</span>
          }
        >
          Last week
        </SectionTitle>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat label="Views" value={nf.format(stats.views)} />
          <Stat label="Engagement" value={nf.format(stats.engagement)} />
          <Stat label="Posted" value={String(stats.posts)} />
          <Stat label="Avg / post" value={nf.format(avg)} />
        </div>
      </section>
    </>
  );
}

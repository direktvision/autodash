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
import { ContentCard, EmptyState, PageHeader, StatusBadge } from '@/components/ui';
import { PRODUCTION_LABEL, type ContentItem, type ProductionLevel } from '@/lib/types';
import { OnSiteDays } from './OnSiteDays';

export const dynamic = 'force-dynamic';

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="card p-4">
      <p className="text-xs uppercase tracking-wider text-muted">{label}</p>
      <p className="display mt-1 text-3xl text-bone">{value}</p>
    </div>
  );
}

const nf = new Intl.NumberFormat('en-GB');

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
          <Link href="/planner" className="btn-ghost text-sm">
            Open planner
          </Link>
        }
      />

      {/* This week ---------------------------------------------------------- */}
      <section className="mb-8">
        <div className="mb-3 flex items-baseline justify-between">
          <h2 className="display text-xl">This week</h2>
          <span className="text-sm text-muted">
            <span className={items.length >= target ? 'text-gold' : 'text-bone'}>
              {items.length}
            </span>{' '}
            / {target} planned
          </span>
        </div>

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
      <section className="mb-8">
        <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="display text-xl">
            Next filming day
            {filming.date && (
              <span className="ml-2 text-base text-gold">
                {filming.date === today ? 'Today' : formatDayLabel(filming.date)}
              </span>
            )}
          </h2>
          <OnSiteDays days={settings.on_site_days} />
        </div>

        {filming.scheduled.length === 0 && filming.unscheduled.length === 0 ? (
          <EmptyState message="Nothing waiting to be filmed." />
        ) : (
          <div className="card divide-y divide-white/10">
            {[...byLevel.entries()].map(([level, group]) => (
              <div key={level} className="p-4">
                <p className="mb-2 text-xs uppercase tracking-wider text-gold-dim">
                  {PRODUCTION_LABEL[level]}
                </p>
                <ul className="space-y-2">
                  {group.map((item) => (
                    <li key={item.id}>
                      <Link
                        href={`/content/${item.id}`}
                        className="flex items-center justify-between gap-3 hover:text-gold"
                      >
                        <span className="text-sm">{item.title}</span>
                        <StatusBadge status={item.status} />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            {filming.unscheduled.length > 0 && (
              <div className="p-4">
                <p className="mb-2 text-xs uppercase tracking-wider text-faint">
                  Undated backlog
                </p>
                <ul className="space-y-2">
                  {filming.unscheduled.slice(0, 6).map((item) => (
                    <li key={item.id}>
                      <Link
                        href={`/content/${item.id}`}
                        className="flex items-center justify-between gap-3 text-muted hover:text-gold"
                      >
                        <span className="text-sm">{item.title}</span>
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
        <h2 className="display mb-3 text-xl">
          Last week <span className="text-base text-muted">· week {lastWeek.week}</span>
        </h2>
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

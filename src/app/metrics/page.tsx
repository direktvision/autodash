import Link from 'next/link';
import { getItemsWithMetrics } from '@/lib/queries';
import { PageHeader, EmptyState, PillarBadge } from '@/components/ui';
import { formatShort } from '@/lib/dates';
import {
  PILLARS,
  PILLAR_LABEL,
  PLATFORMS,
  PLATFORM_LABEL,
  type Pillar,
  type Platform,
} from '@/lib/types';

export const dynamic = 'force-dynamic';

const nf = new Intl.NumberFormat('en-GB');

function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="card p-4 sm:p-5">
      <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-faint">
        {label}
      </p>
      <p className="display tnum mt-1.5 text-[2rem] leading-none text-bone sm:text-4xl">
        {value}
      </p>
      {hint && <p className="mt-1.5 text-xs text-faint">{hint}</p>}
    </div>
  );
}

export default async function MetricsPage({
  searchParams,
}: {
  searchParams: Promise<{
    pillar?: string;
    platform?: string;
    from?: string;
    to?: string;
  }>;
}) {
  const params = await searchParams;
  const pillar = PILLARS.includes(params.pillar as Pillar)
    ? (params.pillar as Pillar)
    : undefined;
  const platform = PLATFORMS.includes(params.platform as Platform)
    ? (params.platform as Platform)
    : undefined;

  const items = await getItemsWithMetrics({
    pillar,
    platform,
    from: params.from,
    to: params.to,
  });

  const totalViews = items.reduce((s, i) => s + i.totalViews, 0);
  const avgViews = items.length ? Math.round(totalViews / items.length) : 0;

  // Best pillar by total views, not post count — one breakout beats three duds.
  const byPillar = new Map<Pillar, number>();
  for (const item of items) {
    byPillar.set(item.pillar, (byPillar.get(item.pillar) ?? 0) + item.totalViews);
  }
  const best = [...byPillar.entries()].sort((a, b) => b[1] - a[1])[0];

  const href = (next: Record<string, string | undefined>) => {
    const q = new URLSearchParams();
    const merged = { pillar, platform, from: params.from, to: params.to, ...next };
    for (const [k, v] of Object.entries(merged)) if (v) q.set(k, v);
    const s = q.toString();
    return s ? `/metrics?${s}` : '/metrics';
  };

  const chip = (active: boolean) =>
    active ? 'chip-active' : 'chip';

  return (
    <>
      <PageHeader
        title="Performance"
        subtitle={`${items.length} posted item${items.length === 1 ? '' : 's'}`}
      />

      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Stat label="Total views" value={nf.format(totalViews)} />
        <Stat label="Avg / post" value={nf.format(avgViews)} />
        <Stat
          label="Best pillar"
          value={best ? PILLAR_LABEL[best[0]] : '—'}
          hint={best ? `${nf.format(best[1])} views` : undefined}
        />
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        <Link href="/metrics" className={chip(!pillar && !platform)}>
          All
        </Link>
        {PILLARS.map((p) => (
          <Link
            key={p}
            href={href({ pillar: pillar === p ? undefined : p })}
            className={chip(pillar === p)}
          >
            {PILLAR_LABEL[p]}
          </Link>
        ))}
        <span className="w-px self-stretch bg-white/10" />
        {PLATFORMS.map((p) => (
          <Link
            key={p}
            href={href({ platform: platform === p ? undefined : p })}
            className={chip(platform === p)}
          >
            {PLATFORM_LABEL[p]}
          </Link>
        ))}
      </div>

      {items.length === 0 ? (
        <EmptyState
          message="No metrics logged yet."
          hint="Mark an item as posted, then log its numbers on the item page."
        />
      ) : (
        /* Table scrolls inside its own container so the page never scrolls
           sideways on a phone. */
        <div className="card overflow-x-auto">
          <table className="w-full min-w-[560px] text-sm">
            <thead>
              <tr className="border-b border-white/10 text-left text-xs uppercase tracking-wider text-muted">
                <th className="px-4 py-3 font-normal">Title</th>
                <th className="px-4 py-3 font-normal">Pillar</th>
                <th className="px-4 py-3 text-right font-normal">Views</th>
                <th className="px-4 py-3 text-right font-normal">Engagement</th>
                <th className="px-4 py-3 text-right font-normal">Posted</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr
                  key={item.id}
                  className="border-b border-white/5 last:border-0 hover:bg-white/[0.02]"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/content/${item.id}`}
                      className="text-bone hover:text-gold"
                    >
                      {item.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <PillarBadge pillar={item.pillar} />
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums text-bone">
                    {nf.format(item.totalViews)}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums text-muted">
                    {nf.format(item.totalEngagement)}
                  </td>
                  <td className="px-4 py-3 text-right text-xs text-faint">
                    {item.scheduled_post_date
                      ? formatShort(item.scheduled_post_date)
                      : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

import { getBankItems } from '@/lib/queries';
import { currentIsoWeek } from '@/lib/dates';
import { PageHeader, EmptyState } from '@/components/ui';
import { BankForm } from './BankForm';
import { BankList } from './BankList';
import { PILLARS, PILLAR_LABEL, PRIORITIES, PRIORITY_LABEL } from '@/lib/types';
import type { Pillar, Priority } from '@/lib/types';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function BankPage({
  searchParams,
}: {
  searchParams: Promise<{ pillar?: string; priority?: string }>;
}) {
  const params = await searchParams;
  const pillar = PILLARS.includes(params.pillar as Pillar)
    ? (params.pillar as Pillar)
    : undefined;
  const priority = PRIORITIES.includes(params.priority as Priority)
    ? (params.priority as Priority)
    : undefined;

  const items = await getBankItems({ pillar, priority });
  const week = currentIsoWeek();

  const filterHref = (next: { pillar?: string; priority?: string }) => {
    const q = new URLSearchParams();
    const p = next.pillar ?? pillar;
    const pr = next.priority ?? priority;
    if (p) q.set('pillar', p);
    if (pr) q.set('priority', pr);
    const s = q.toString();
    return s ? `/bank?${s}` : '/bank';
  };

  return (
    <>
      <PageHeader
        title="Content bank"
        subtitle={`${items.length} idea${items.length === 1 ? '' : 's'} waiting`}
      />

      <BankForm />

      <div className="mb-4 mt-8 flex flex-wrap gap-2">
        <Link
          href="/bank"
          className={!pillar && !priority ? 'chip-active' : 'chip'}
        >
          All
        </Link>
        {PILLARS.map((p) => (
          <Link
            key={p}
            href={pillar === p ? filterHref({ pillar: '' }) : filterHref({ pillar: p })}
            className={pillar === p ? 'chip-active' : 'chip'}
          >
            {PILLAR_LABEL[p]}
          </Link>
        ))}
        <span className="w-px self-stretch bg-white/10" />
        {PRIORITIES.map((p) => (
          <Link
            key={p}
            href={
              priority === p ? filterHref({ priority: '' }) : filterHref({ priority: p })
            }
            className={priority === p ? 'chip-active' : 'chip'}
          >
            {PRIORITY_LABEL[p]}
          </Link>
        ))}
      </div>

      {items.length === 0 ? (
        <EmptyState
          message="No ideas here yet."
          hint="Use the + button to capture one from anywhere."
        />
      ) : (
        <BankList items={items} week={week} />
      )}
    </>
  );
}

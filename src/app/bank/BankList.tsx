'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { deleteBankItem, promoteBankItem } from '@/lib/actions';
import { PillarBadge } from '@/components/ui';
import { PRIORITY_LABEL, type BankItem, type Priority } from '@/lib/types';
import { formatWeekRange, shiftIsoWeek, type IsoWeek } from '@/lib/dates';

const PRIORITY_STYLE: Record<Priority, string> = {
  high: 'text-pillar-conversion',
  medium: 'text-muted',
  low: 'text-faint',
};

export function BankList({ items, week }: { items: BankItem[]; week: IsoWeek }) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const nextWeek = shiftIsoWeek(week, 1);

  function promote(id: string, target: IsoWeek) {
    setBusy(id);
    setError(null);
    startTransition(async () => {
      try {
        const newId = await promoteBankItem(id, target);
        router.push(`/content/${newId}`);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Could not promote.');
        setBusy(null);
      }
    });
  }

  function remove(id: string) {
    setBusy(id);
    startTransition(async () => {
      try {
        await deleteBankItem(id);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Could not delete.');
      } finally {
        setBusy(null);
      }
    });
  }

  return (
    <>
      {error && <p className="mb-3 text-sm text-pillar-conversion">{error}</p>}

      <ul className="space-y-2">
        {items.map((item) => {
          const promoted = Boolean(item.promoted_to_item_id);
          return (
            <li
              key={item.id}
              className={`card p-4 ${promoted ? 'opacity-60' : ''}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="font-medium text-bone">{item.title}</h3>
                  {item.description && (
                    <p className="mt-1 text-sm text-muted">{item.description}</p>
                  )}
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <PillarBadge pillar={item.pillar} />
                    <span className={`text-xs ${PRIORITY_STYLE[item.priority]}`}>
                      {PRIORITY_LABEL[item.priority]}
                    </span>
                    {promoted && (
                      <Link
                        href={`/content/${item.promoted_to_item_id}`}
                        className="text-xs text-gold hover:underline"
                      >
                        → in planner
                      </Link>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => remove(item.id)}
                  disabled={busy === item.id}
                  aria-label={`Delete ${item.title}`}
                  className="shrink-0 rounded-lg px-2 py-1 text-muted transition-colors hover:bg-white/5 hover:text-pillar-conversion"
                >
                  ✕
                </button>
              </div>

              {!promoted && (
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    onClick={() => promote(item.id, week)}
                    disabled={busy === item.id}
                    className="rounded-lg border border-gold/30 bg-gold/10 px-3 py-1.5 text-xs text-gold transition-colors hover:bg-gold/20 disabled:opacity-40"
                  >
                    {busy === item.id ? 'Promoting…' : `This week · ${formatWeekRange(week)}`}
                  </button>
                  <button
                    onClick={() => promote(item.id, nextWeek)}
                    disabled={busy === item.id}
                    className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-muted transition-colors hover:text-bone disabled:opacity-40"
                  >
                    Next week
                  </button>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </>
  );
}

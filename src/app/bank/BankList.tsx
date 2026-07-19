'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { deleteBankItem, promoteBankItem } from '@/lib/actions';
import { PillarBadge } from '@/components/ui';
import { PRIORITY_LABEL, type BankItem, type Priority } from '@/lib/types';
import { formatWeekRange, shiftIsoWeek, type IsoWeek } from '@/lib/dates';
import { IconTrash } from '@/components/icons';

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

      <ul className="space-y-2.5">
        {items.map((item) => {
          const promoted = Boolean(item.promoted_to_item_id);
          return (
            <li
              key={item.id}
              className={`card card-hover p-4 ${promoted ? 'opacity-60' : ''}`}
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
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-faint transition-colors hover:bg-white/[0.04] hover:text-pillar-conversion"
                >
                  <IconTrash size={14} />
                </button>
              </div>

              {!promoted && (
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    onClick={() => promote(item.id, week)}
                    disabled={busy === item.id}
                    className="inline-flex min-h-9 items-center rounded-lg border border-gold/30 bg-gold/[0.08] px-3 text-xs font-medium text-gold transition-all duration-200 hover:bg-gold/[0.15] active:scale-[0.98] disabled:opacity-40"
                  >
                    {busy === item.id ? 'Promoting…' : `This week · ${formatWeekRange(week)}`}
                  </button>
                  <button
                    onClick={() => promote(item.id, nextWeek)}
                    disabled={busy === item.id}
                    className="inline-flex min-h-9 items-center rounded-lg border border-white/[0.08] px-3 text-xs text-muted transition-all duration-200 hover:border-white/[0.16] hover:text-bone active:scale-[0.98] disabled:opacity-40"
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

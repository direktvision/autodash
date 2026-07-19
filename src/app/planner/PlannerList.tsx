'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { updateItem } from '@/lib/actions';
import { PillarBadge, PillarBar, PlatformIcons, EmptyState } from '@/components/ui';
import { STATUSES, STATUS_LABEL, type ContentItem, type ContentStatus } from '@/lib/types';
import { formatShort } from '@/lib/dates';

/** Inline status change without leaving the week view. */
function StatusSelect({ item }: { item: ContentItem }) {
  const [status, setStatus] = useState<ContentStatus>(item.status);
  const [pending, startTransition] = useTransition();

  function change(next: ContentStatus) {
    const previous = status;
    setStatus(next); // optimistic
    startTransition(async () => {
      try {
        await updateItem(item.id, { status: next });
      } catch {
        setStatus(previous); // roll back on failure
      }
    });
  }

  return (
    <select
      value={status}
      onChange={(e) => change(e.target.value as ContentStatus)}
      disabled={pending}
      aria-label={`Status for ${item.title}`}
      className="min-h-9 rounded-lg border border-white/[0.08] bg-noir-well px-2.5 text-xs text-bone transition-colors focus:border-gold/40 focus:outline-none"
    >
      {STATUSES.map((s) => (
        <option key={s} value={s} className="bg-noir-card">
          {STATUS_LABEL[s]}
        </option>
      ))}
    </select>
  );
}

export function PlannerList({ items }: { items: ContentItem[] }) {
  if (items.length === 0) {
    return (
      <EmptyState
        message="Nothing planned for this week yet."
        hint="Add a slot below, or promote an idea from the bank."
      />
    );
  }

  return (
    <ul className="space-y-2.5">
      {items.map((item) => (
        <li key={item.id} className="card card-hover relative overflow-hidden p-4 pl-5">
          <PillarBar pillar={item.pillar} />
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <PillarBadge pillar={item.pillar} />
              <Link
                href={`/content/${item.id}`}
                className="mt-1.5 block font-medium text-bone transition-colors hover:text-gold-bright"
              >
                {item.title}
              </Link>
              {item.segment && (
                <p className="mt-0.5 text-xs italic text-gold-dim">{item.segment}</p>
              )}
              <div className="mt-2.5 flex flex-wrap items-center gap-3 text-[11px] text-faint">
                <PlatformIcons platforms={item.platforms} />
                {item.scheduled_post_date && (
                  <span className="tnum text-muted">
                    posts {formatShort(item.scheduled_post_date)}
                  </span>
                )}
                {item.filming_date && (
                  <span className="tnum">film {formatShort(item.filming_date)}</span>
                )}
              </div>
            </div>
            <StatusSelect item={item} />
          </div>
        </li>
      ))}
    </ul>
  );
}

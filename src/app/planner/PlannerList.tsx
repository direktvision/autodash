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
      className="rounded-lg border border-white/10 bg-white/[0.03] px-2 py-1 text-xs text-bone focus:border-gold/50 focus:outline-none"
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
    <ul className="space-y-2">
      {items.map((item) => (
        <li key={item.id} className="card relative overflow-hidden p-4 pl-5">
          <PillarBar pillar={item.pillar} />
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <Link
                href={`/content/${item.id}`}
                className="font-medium text-bone hover:text-gold"
              >
                {item.title}
              </Link>
              {item.segment && (
                <p className="mt-0.5 text-xs text-gold-dim">{item.segment}</p>
              )}
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <PillarBadge pillar={item.pillar} />
                <PlatformIcons platforms={item.platforms} />
                {item.scheduled_post_date && (
                  <span className="text-xs text-muted">
                    posts {formatShort(item.scheduled_post_date)}
                  </span>
                )}
                {item.filming_date && (
                  <span className="text-xs text-faint">
                    film {formatShort(item.filming_date)}
                  </span>
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

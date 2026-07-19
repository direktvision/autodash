'use client';

import { useState, useTransition } from 'react';
import { logMetrics } from '@/lib/actions';
import {
  PLATFORMS,
  PLATFORM_LABEL,
  type Metric,
  type Platform,
} from '@/lib/types';

const FIELDS = [
  { key: 'views', label: 'Views' },
  { key: 'likes', label: 'Likes' },
  { key: 'comments', label: 'Comments' },
  { key: 'shares', label: 'Shares' },
  { key: 'saves', label: 'Saves' },
] as const;

type FieldKey = (typeof FIELDS)[number]['key'];
type Draft = Record<FieldKey, string>;

const EMPTY: Draft = { views: '', likes: '', comments: '', shares: '', saves: '' };

function toDraft(metric?: Metric): Draft {
  if (!metric) return EMPTY;
  return {
    views: String(metric.views ?? ''),
    likes: String(metric.likes ?? ''),
    comments: String(metric.comments ?? ''),
    shares: metric.shares == null ? '' : String(metric.shares),
    saves: metric.saves == null ? '' : String(metric.saves),
  };
}

function PlatformRow({
  itemId,
  platform,
  existing,
}: {
  itemId: string;
  platform: Platform;
  existing?: Metric;
}) {
  const [draft, setDraft] = useState<Draft>(() => toDraft(existing));
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function save() {
    setError(null);
    startTransition(async () => {
      try {
        await logMetrics({
          content_item_id: itemId,
          platform,
          views: Number(draft.views) || 0,
          likes: Number(draft.likes) || 0,
          comments: Number(draft.comments) || 0,
          shares: draft.shares === '' ? null : Number(draft.shares),
          saves: draft.saves === '' ? null : Number(draft.saves),
        });
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Could not log metrics.');
      }
    });
  }

  return (
    <div className="border-t border-white/10 px-4 py-4 first:border-t-0">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-medium text-bone">
          {PLATFORM_LABEL[platform]}
        </h3>
        {saved && <span className="text-xs text-emerald-400">Logged</span>}
      </div>

      <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
        {FIELDS.map((f) => (
          <label key={f.key} className="block">
            <span className="mb-1 block text-[10px] uppercase tracking-wider text-faint">
              {f.label}
            </span>
            <input
              type="number"
              inputMode="numeric"
              min={0}
              value={draft[f.key]}
              onChange={(e) => setDraft({ ...draft, [f.key]: e.target.value })}
              placeholder="0"
              className="field px-2 py-1.5 text-sm"
            />
          </label>
        ))}
      </div>

      <button
        onClick={save}
        disabled={pending}
        className="btn-ghost mt-3 w-full py-2 text-sm sm:w-auto"
      >
        {pending ? 'Saving…' : existing ? 'Update' : 'Log'}
      </button>

      {error && <p className="mt-2 text-sm text-pillar-conversion">{error}</p>}
    </div>
  );
}

export function MetricsPanel({
  itemId,
  platforms,
  existing,
}: {
  itemId: string;
  platforms: Platform[];
  existing: Metric[];
}) {
  // Fall back to all platforms when none are selected, so metrics are never
  // impossible to log just because the item's platforms were left blank.
  const targets = platforms.length ? platforms : PLATFORMS;

  return (
    <div className="card overflow-hidden">
      {targets.map((p) => (
        <PlatformRow
          key={p}
          itemId={itemId}
          platform={p}
          existing={existing.find((m) => m.platform === p)}
        />
      ))}
    </div>
  );
}

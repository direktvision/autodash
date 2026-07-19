'use client';

import { useState, useTransition } from 'react';
import { updateItem } from '@/lib/actions';
import {
  PILLARS,
  PILLAR_LABEL,
  PLATFORMS,
  PLATFORM_LABEL,
  PRODUCTION_LEVELS,
  PRODUCTION_LABEL,
  STATUSES,
  STATUS_LABEL,
  type ContentItem,
  type ContentStatus,
  type Pillar,
  type Platform,
  type ProductionLevel,
  type Segment,
} from '@/lib/types';

export function MetaEditor({
  item,
  segments,
}: {
  item: ContentItem;
  segments: Segment[];
}) {
  const [draft, setDraft] = useState(item);
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  function patch(next: Partial<ContentItem>) {
    const previous = draft;
    const merged = { ...draft, ...next };
    setDraft(merged);
    setError(null);
    startTransition(async () => {
      try {
        await updateItem(item.id, next);
      } catch (e) {
        setDraft(previous);
        setError(e instanceof Error ? e.message : 'Could not save.');
      }
    });
  }

  function togglePlatform(p: Platform) {
    const next = draft.platforms.includes(p)
      ? draft.platforms.filter((x) => x !== p)
      : [...draft.platforms, p];
    patch({ platforms: next });
  }

  return (
    <div className="card p-4 sm:p-5">
      <input
        value={draft.title}
        onChange={(e) => setDraft({ ...draft, title: e.target.value })}
        onBlur={(e) => {
          if (e.target.value !== item.title) patch({ title: e.target.value });
        }}
        className="w-full bg-transparent text-2xl font-medium text-bone outline-none placeholder:text-faint"
        placeholder="Untitled"
      />

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <div>
          <span className="label">Pillar</span>
          <div className="flex gap-2">
            {PILLARS.map((p) => (
              <button
                key={p}
                onClick={() => patch({ pillar: p as Pillar })}
                className={`flex-1 rounded-xl border px-2 py-2 text-xs transition-colors ${
                  draft.pillar === p
                    ? 'border-gold/50 bg-gold/10 text-gold'
                    : 'border-white/10 text-muted hover:text-bone'
                }`}
              >
                {PILLAR_LABEL[p]}
              </button>
            ))}
          </div>
        </div>

        <div>
          <span className="label">Status</span>
          <select
            value={draft.status}
            onChange={(e) => patch({ status: e.target.value as ContentStatus })}
            className="field"
          >
            {STATUSES.map((s) => (
              <option key={s} value={s} className="bg-noir-card">
                {STATUS_LABEL[s]}
              </option>
            ))}
          </select>
        </div>

        {/* Segments only apply to the docuseries pillar. */}
        {draft.pillar === 'vlog' && (
          <div>
            <span className="label">Segment</span>
            <select
              value={draft.segment ?? ''}
              onChange={(e) => patch({ segment: e.target.value || null })}
              className="field"
            >
              <option value="" className="bg-noir-card">
                — none —
              </option>
              {segments.map((s) => (
                <option key={s.id} value={s.name} className="bg-noir-card">
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        )}

        <div>
          <span className="label">Production level</span>
          <select
            value={draft.production_level}
            onChange={(e) =>
              patch({ production_level: e.target.value as ProductionLevel })
            }
            className="field"
          >
            {PRODUCTION_LEVELS.map((p) => (
              <option key={p} value={p} className="bg-noir-card">
                {PRODUCTION_LABEL[p]}
              </option>
            ))}
          </select>
        </div>

        <div className="sm:col-span-2">
          <span className="label">Platforms</span>
          <div className="flex gap-2">
            {PLATFORMS.map((p) => (
              <button
                key={p}
                onClick={() => togglePlatform(p)}
                className={`flex-1 rounded-xl border px-2 py-2 text-xs transition-colors ${
                  draft.platforms.includes(p)
                    ? 'border-gold/50 bg-gold/10 text-gold'
                    : 'border-white/10 text-muted hover:text-bone'
                }`}
              >
                {PLATFORM_LABEL[p]}
              </button>
            ))}
          </div>
        </div>

        <div>
          <span className="label">Filming date</span>
          <input
            type="date"
            value={draft.filming_date ?? ''}
            onChange={(e) => patch({ filming_date: e.target.value || null })}
            className="field"
          />
        </div>

        <div>
          <span className="label">Post date</span>
          <input
            type="date"
            value={draft.scheduled_post_date ?? ''}
            onChange={(e) =>
              patch({ scheduled_post_date: e.target.value || null })
            }
            className="field"
          />
          <p className="mt-1 text-xs text-faint">
            Sets the planner week automatically.
          </p>
        </div>
      </div>

      {error && <p className="mt-3 text-sm text-pillar-conversion">{error}</p>}
    </div>
  );
}

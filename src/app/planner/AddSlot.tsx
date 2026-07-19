'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { createItem } from '@/lib/actions';
import { PILLARS, PILLAR_LABEL, type Pillar } from '@/lib/types';
import type { IsoWeek } from '@/lib/dates';

export function AddSlot({ week }: { week: IsoWeek }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [pillar, setPillar] = useState<Pillar>('vlog');
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setError(null);
    startTransition(async () => {
      try {
        const id = await createItem({
          title,
          pillar,
          year: week.year,
          week_number: week.week,
        });
        router.push(`/content/${id}`);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Could not create slot.');
      }
    });
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full rounded-2xl border border-dashed border-white/15 py-4 text-sm text-muted transition-colors hover:border-gold/40 hover:text-gold"
      >
        + Add slot to week {week.week}
      </button>
    );
  }

  return (
    <form onSubmit={submit} className="card p-4">
      <input
        autoFocus
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={(e) => e.key === 'Escape' && setOpen(false)}
        placeholder="Working title…"
        className="field"
      />

      <div className="mt-3 flex gap-2">
        {PILLARS.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => setPillar(p)}
            className={`flex-1 rounded-xl border px-2 py-2 text-xs transition-colors ${
              pillar === p
                ? 'border-gold/50 bg-gold/10 text-gold'
                : 'border-white/10 text-muted hover:text-bone'
            }`}
          >
            {PILLAR_LABEL[p]}
          </button>
        ))}
      </div>

      {error && <p className="mt-3 text-sm text-pillar-conversion">{error}</p>}

      <div className="mt-3 flex gap-2">
        <button type="submit" disabled={pending || !title.trim()} className="btn-primary flex-1">
          {pending ? 'Creating…' : 'Create & open'}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="btn-ghost">
          Cancel
        </button>
      </div>
    </form>
  );
}

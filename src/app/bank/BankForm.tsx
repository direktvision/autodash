'use client';

import { useState, useTransition } from 'react';
import { createBankItem } from '@/lib/actions';
import {
  PILLARS,
  PILLAR_LABEL,
  PRIORITIES,
  PRIORITY_LABEL,
  type Pillar,
  type Priority,
} from '@/lib/types';

export function BankForm() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [pillar, setPillar] = useState<Pillar>('vlog');
  const [priority, setPriority] = useState<Priority>('medium');
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setError(null);
    startTransition(async () => {
      try {
        await createBankItem({ title, pillar, description, priority });
        setTitle('');
        setDescription('');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Could not save.');
      }
    });
  }

  return (
    <form onSubmit={submit} className="card p-4 sm:p-5">
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="New idea…"
        className="field"
      />
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Optional detail — the angle, the hook, who's in it."
        rows={2}
        className="field mt-3 resize-y"
      />

      <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex flex-1 gap-2">
          {PILLARS.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPillar(p)}
              className={pillar === p ? 'tile-active' : 'tile'}
            >
              {PILLAR_LABEL[p]}
            </button>
          ))}
        </div>

        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value as Priority)}
          className="field sm:w-44"
        >
          {PRIORITIES.map((p) => (
            <option key={p} value={p} className="bg-noir-card">
              {PRIORITY_LABEL[p]} priority
            </option>
          ))}
        </select>

        <button
          type="submit"
          disabled={pending || !title.trim()}
          className="btn-primary sm:w-auto"
        >
          {pending ? 'Adding…' : 'Add idea'}
        </button>
      </div>

      {error && <p className="mt-3 text-sm text-pillar-conversion">{error}</p>}
    </form>
  );
}

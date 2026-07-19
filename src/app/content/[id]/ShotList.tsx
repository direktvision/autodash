'use client';

import { useState, useTransition } from 'react';
import { saveShotList } from '@/lib/actions';
import type { ShotListItem } from '@/lib/types';
import { IconCheck, IconArrowUp, IconArrowDown, IconClose } from '@/components/icons';

/**
 * Reordering uses up/down buttons rather than drag-and-drop: this gets used
 * one-handed on a phone at the dealership, where drag targets are unreliable.
 */
export function ShotList({
  itemId,
  initial,
}: {
  itemId: string;
  initial: ShotListItem[];
}) {
  const [shots, setShots] = useState<ShotListItem[]>(initial);
  const [text, setText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  function commit(next: ShotListItem[]) {
    const previous = shots;
    setShots(next);
    setError(null);
    startTransition(async () => {
      try {
        await saveShotList(itemId, next);
      } catch (e) {
        setShots(previous);
        setError(e instanceof Error ? e.message : 'Could not save shot list.');
      }
    });
  }

  function add(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    commit([
      ...shots,
      { id: crypto.randomUUID(), text: text.trim(), done: false },
    ]);
    setText('');
  }

  function toggle(id: string) {
    commit(shots.map((s) => (s.id === id ? { ...s, done: !s.done } : s)));
  }

  function remove(id: string) {
    commit(shots.filter((s) => s.id !== id));
  }

  function move(index: number, delta: number) {
    const target = index + delta;
    if (target < 0 || target >= shots.length) return;
    const next = [...shots];
    [next[index], next[target]] = [next[target], next[index]];
    commit(next);
  }

  const done = shots.filter((s) => s.done).length;

  return (
    <div className="card p-4">
      {shots.length > 0 && (
        <p className="mb-3 text-xs text-muted">
          {done} of {shots.length} shot{shots.length === 1 ? '' : 's'} captured
        </p>
      )}

      <ul className="space-y-1">
        {shots.map((shot, i) => (
          <li
            key={shot.id}
            className="group flex items-center gap-2 rounded-xl px-2 py-2 hover:bg-white/[0.03]"
          >
            <button
              onClick={() => toggle(shot.id)}
              role="checkbox"
              aria-checked={shot.done}
              aria-label={shot.text}
              className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-all duration-200 ${
                shot.done
                  ? 'border-gold bg-gold text-noir'
                  : 'border-white/[0.18] hover:border-gold/50'
              }`}
            >
              {shot.done && <IconCheck size={12} />}
            </button>

            <span
              className={`flex-1 text-sm ${
                shot.done ? 'text-faint line-through' : 'text-bone'
              }`}
            >
              {shot.text}
            </span>

            <span className="flex shrink-0 items-center">
              <button
                onClick={() => move(i, -1)}
                disabled={i === 0}
                aria-label="Move up"
                className="flex h-8 w-8 items-center justify-center rounded-lg text-faint transition-colors hover:bg-white/[0.04] hover:text-bone disabled:opacity-20"
              >
                <IconArrowUp size={13} />
              </button>
              <button
                onClick={() => move(i, 1)}
                disabled={i === shots.length - 1}
                aria-label="Move down"
                className="flex h-8 w-8 items-center justify-center rounded-lg text-faint transition-colors hover:bg-white/[0.04] hover:text-bone disabled:opacity-20"
              >
                <IconArrowDown size={13} />
              </button>
              <button
                onClick={() => remove(shot.id)}
                aria-label={`Remove ${shot.text}`}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-faint transition-colors hover:bg-white/[0.04] hover:text-pillar-conversion"
              >
                <IconClose size={13} />
              </button>
            </span>
          </li>
        ))}
      </ul>

      <form onSubmit={add} className="mt-3 flex gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Add a shot…"
          className="field flex-1"
        />
        <button type="submit" disabled={!text.trim()} className="btn-ghost px-4">
          Add
        </button>
      </form>

      {error && <p className="mt-3 text-sm text-pillar-conversion">{error}</p>}
    </div>
  );
}

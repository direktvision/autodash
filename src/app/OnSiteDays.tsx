'use client';

import { useState, useTransition } from 'react';
import { updateOnSiteDays } from '@/lib/actions';
import { WEEKDAY_SHORT } from '@/lib/dates';

/** Inline editor for which weekdays you're at TA Auto. ISO: 1 = Mon … 7 = Sun. */
export function OnSiteDays({ days }: { days: number[] }) {
  const [editing, setEditing] = useState(false);
  const [selected, setSelected] = useState<number[]>(days);
  const [, startTransition] = useTransition();

  function toggle(day: number) {
    const next = selected.includes(day)
      ? selected.filter((d) => d !== day)
      : [...selected, day].sort((a, b) => a - b);

    const previous = selected;
    setSelected(next);
    startTransition(async () => {
      try {
        await updateOnSiteDays(next);
      } catch {
        setSelected(previous);
      }
    });
  }

  if (!editing) {
    return (
      <button
        onClick={() => setEditing(true)}
        className="text-xs text-faint transition-colors hover:text-gold"
      >
        On-site: {selected.map((d) => WEEKDAY_SHORT[d - 1]).join(' · ') || 'not set'}
        <span className="ml-1">edit</span>
      </button>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-1">
      {WEEKDAY_SHORT.map((label, i) => {
        const day = i + 1;
        const on = selected.includes(day);
        return (
          <button
            key={day}
            onClick={() => toggle(day)}
            aria-pressed={on}
            className={`rounded-md px-2 py-1 text-xs transition-colors ${
              on ? 'bg-gold/15 text-gold' : 'text-faint hover:text-bone'
            }`}
          >
            {label}
          </button>
        );
      })}
      <button
        onClick={() => setEditing(false)}
        className="ml-1 text-xs text-muted hover:text-bone"
      >
        done
      </button>
    </div>
  );
}

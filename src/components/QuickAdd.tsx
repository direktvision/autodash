'use client';

import { useState, useTransition } from 'react';
import { createBankItem } from '@/lib/actions';
import { PILLARS, PILLAR_LABEL, type Pillar } from '@/lib/types';

/**
 * Floating idea capture, mounted globally in the layout.
 * Writes straight to the content bank — no week, no commitment.
 */
export function QuickAdd() {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [pillar, setPillar] = useState<Pillar>('vlog');
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function submit() {
    if (!title.trim()) return;
    setError(null);
    startTransition(async () => {
      try {
        await createBankItem({ title, pillar });
        setTitle('');
        setOpen(false);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Could not save.');
      }
    });
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        aria-label="Add idea"
        className="fixed bottom-20 right-4 z-50 h-14 w-14 rounded-full bg-gold text-2xl leading-none text-noir shadow-lg shadow-black/40 transition-transform hover:scale-105 active:scale-95 sm:bottom-6 sm:right-6"
      >
        +
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 backdrop-blur-sm sm:items-center">
      <div
        className="card w-full max-w-md p-5"
        role="dialog"
        aria-label="Add idea to bank"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="display text-xl">Capture idea</h2>
          <button
            onClick={() => setOpen(false)}
            className="text-muted hover:text-bone"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <input
          autoFocus
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') submit();
            if (e.key === 'Escape') setOpen(false);
          }}
          placeholder="What's the idea?"
          className="field"
        />

        <div className="mt-3 flex gap-2">
          {PILLARS.map((p) => (
            <button
              key={p}
              onClick={() => setPillar(p)}
              className={`flex-1 rounded-xl border px-3 py-2 text-sm transition-colors ${
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

        <button
          onClick={submit}
          disabled={pending || !title.trim()}
          className="btn-primary mt-4 w-full"
        >
          {pending ? 'Saving…' : 'Add to bank'}
        </button>
      </div>
    </div>
  );
}

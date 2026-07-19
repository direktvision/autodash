'use client';

import { useState, useTransition } from 'react';
import { createBankItem } from '@/lib/actions';
import { PILLARS, PILLAR_LABEL, type Pillar } from '@/lib/types';
import { IconPlus, IconClose } from './icons';

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
        className="fixed bottom-[calc(4.25rem+env(safe-area-inset-bottom))] right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gold text-noir transition-all duration-200 ease-out hover:bg-gold-bright active:scale-95 sm:bottom-6 sm:right-6"
        style={{
          boxShadow:
            'inset 0 1px 0 rgba(255,255,255,0.3), 0 4px 16px rgba(0,0,0,0.5), 0 0 0 1px rgba(212,165,116,0.15)',
        }}
      >
        <IconPlus size={22} />
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-4 backdrop-blur-sm sm:items-center">
      <div
        className="card w-full max-w-md p-5"
        role="dialog"
        aria-label="Add idea to bank"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="display text-2xl">Capture idea</h2>
          <button
            onClick={() => setOpen(false)}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-muted transition-colors hover:bg-white/[0.05] hover:text-bone"
            aria-label="Close"
          >
            <IconClose size={16} />
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
              className={pillar === p ? 'tile-active' : 'tile'}
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

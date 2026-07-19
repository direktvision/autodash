'use client';

import { useState, useTransition } from 'react';
import { deleteItem } from '@/lib/actions';

export function DeleteButton({
  itemId,
  title,
}: {
  itemId: string;
  title: string;
}) {
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function remove() {
    setError(null);
    startTransition(async () => {
      try {
        await deleteItem(itemId);
      } catch (e) {
        // redirect() throws a control-flow error on success — let it bubble.
        if (e instanceof Error && e.message.includes('NEXT_REDIRECT')) throw e;
        setError(e instanceof Error ? e.message : 'Could not delete.');
      }
    });
  }

  if (!confirming) {
    return (
      <button
        onClick={() => setConfirming(true)}
        className="text-sm text-faint transition-colors hover:text-pillar-conversion"
      >
        Delete this item
      </button>
    );
  }

  return (
    <div>
      <p className="mb-3 text-sm text-muted">
        Delete <span className="text-bone">{title}</span> and its metrics? This
        can&apos;t be undone.
      </p>
      <div className="flex gap-2">
        <button
          onClick={remove}
          disabled={pending}
          className="btn rounded-xl bg-pillar-conversion px-4 py-2 text-sm text-bone hover:opacity-90"
        >
          {pending ? 'Deleting…' : 'Delete'}
        </button>
        <button onClick={() => setConfirming(false)} className="btn-ghost py-2 text-sm">
          Cancel
        </button>
      </div>
      {error && <p className="mt-2 text-sm text-pillar-conversion">{error}</p>}
    </div>
  );
}

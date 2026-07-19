'use client';

import { useEffect, useRef, useState } from 'react';
import { saveField } from '@/lib/actions';

type SaveState = 'idle' | 'dirty' | 'saving' | 'saved' | 'error';

/**
 * Textarea that debounces writes ~1s after typing stops.
 *
 * The component owns the text while mounted — the server value is only ever
 * read as `initial`, so a background revalidation can't yank the field out
 * from under the cursor.
 */
export function Autosave({
  itemId,
  field,
  initial,
  rows = 8,
  mono = false,
  placeholder,
}: {
  itemId: string;
  field: 'script' | 'notes';
  initial: string;
  rows?: number;
  mono?: boolean;
  placeholder?: string;
}) {
  const [value, setValue] = useState(initial);
  const [state, setState] = useState<SaveState>('idle');
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSaved = useRef(initial);

  useEffect(() => {
    if (value === lastSaved.current) return;

    setState('dirty');
    if (timer.current) clearTimeout(timer.current);

    timer.current = setTimeout(async () => {
      const pending = value;
      setState('saving');
      try {
        await saveField(itemId, field, pending);
        lastSaved.current = pending;
        setState('saved');
      } catch {
        setState('error');
      }
    }, 1000);

    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [value, itemId, field]);

  // Warn if the tab closes with an unflushed edit still in the debounce window.
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (state === 'dirty' || state === 'saving') e.preventDefault();
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [state]);

  const status = {
    idle: '',
    dirty: 'Unsaved…',
    saving: 'Saving…',
    saved: 'Saved',
    error: 'Save failed — retry by typing again',
  }[state];

  return (
    <div>
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        rows={rows}
        placeholder={placeholder}
        className={`field resize-y leading-relaxed ${mono ? 'font-mono text-sm' : ''}`}
      />
      <p
        aria-live="polite"
        className={`mt-1.5 h-4 text-xs ${
          state === 'error' ? 'text-pillar-conversion' : 'text-faint'
        }`}
      >
        {status}
      </p>
    </div>
  );
}

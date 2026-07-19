'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  // The most likely first-run failure is that the migration hasn't been run.
  const missingTables =
    /relation .* does not exist|Could not find the table|schema cache/i.test(
      error.message,
    );

  return (
    <div className="card mt-10 p-6">
      <h1 className="display text-2xl text-bone">Something broke</h1>

      {missingTables ? (
        <div className="mt-3 space-y-3 text-sm text-muted">
          <p>
            The database tables aren&apos;t there yet. Open your Supabase
            project → SQL Editor, and run{' '}
            <code className="rounded bg-white/5 px-1.5 py-0.5 font-mono text-gold">
              supabase/migrations/0001_init.sql
            </code>
            .
          </p>
        </div>
      ) : (
        <p className="mt-3 text-sm text-muted">{error.message}</p>
      )}

      <button onClick={reset} className="btn-ghost mt-5 text-sm">
        Try again
      </button>
    </div>
  );
}

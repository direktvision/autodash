import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getItem, getMetricsForItem, getSegments } from '@/lib/queries';
import { MetaEditor } from './MetaEditor';
import { Autosave } from './Autosave';
import { ShotList } from './ShotList';
import { MetricsPanel } from './MetricsPanel';
import { DeleteButton } from './DeleteButton';

export const dynamic = 'force-dynamic';

export default async function ContentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const item = await getItem(id);
  if (!item) notFound();

  const [segments, metrics] = await Promise.all([
    getSegments(),
    getMetricsForItem(id),
  ]);

  return (
    <>
      <Link
        href={
          item.year && item.week_number
            ? `/planner?y=${item.year}&w=${item.week_number}`
            : '/planner'
        }
        className="mb-4 inline-block text-sm text-muted hover:text-gold"
      >
        ← Planner
      </Link>

      <MetaEditor item={item} segments={segments} />

      <section className="mt-6">
        <h2 className="display mb-2 text-xl">Script</h2>
        <Autosave
          itemId={item.id}
          field="script"
          initial={item.script ?? ''}
          rows={14}
          mono
          placeholder="Hook in the first 2 seconds. Then the story."
        />
      </section>

      <section className="mt-6">
        <h2 className="display mb-2 text-xl">Shot list</h2>
        <ShotList itemId={item.id} initial={item.shot_list ?? []} />
      </section>

      <section className="mt-6">
        <h2 className="display mb-2 text-xl">Notes</h2>
        <Autosave
          itemId={item.id}
          field="notes"
          initial={item.notes ?? ''}
          rows={5}
          placeholder="Anything worth remembering — who to ask, what car, follow-ups."
        />
      </section>

      {item.status === 'posted' && (
        <section className="mt-6">
          <h2 className="display mb-2 text-xl">Performance</h2>
          <MetricsPanel
            itemId={item.id}
            platforms={item.platforms}
            existing={metrics}
          />
        </section>
      )}

      <div className="mt-10 border-t border-white/10 pt-6">
        <DeleteButton itemId={item.id} title={item.title} />
      </div>
    </>
  );
}

import Link from 'next/link';
import {
  PILLAR_LABEL,
  PLATFORM_LABEL,
  PRODUCTION_LABEL,
  STATUS_LABEL,
  type ContentStatus,
  type Pillar,
  type Platform,
  type ProductionLevel,
} from '@/lib/types';
import { formatShort } from '@/lib/dates';
import type { ContentItem } from '@/lib/types';

// --- Pillar -----------------------------------------------------------------

const PILLAR_STYLE: Record<Pillar, string> = {
  vlog: 'bg-pillar-vlog/15 text-pillar-vlog border-pillar-vlog/30',
  showcase: 'bg-pillar-showcase/15 text-pillar-showcase border-pillar-showcase/30',
  conversion:
    'bg-pillar-conversion/15 text-pillar-conversion border-pillar-conversion/30',
};

const PILLAR_BAR: Record<Pillar, string> = {
  vlog: 'bg-pillar-vlog',
  showcase: 'bg-pillar-showcase',
  conversion: 'bg-pillar-conversion',
};

export function PillarBadge({ pillar }: { pillar: Pillar }) {
  return (
    <span
      className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium ${PILLAR_STYLE[pillar]}`}
    >
      {PILLAR_LABEL[pillar]}
    </span>
  );
}

export function PillarBar({ pillar }: { pillar: Pillar }) {
  return (
    <span
      aria-hidden
      className={`absolute inset-y-0 left-0 w-[3px] rounded-l-2xl ${PILLAR_BAR[pillar]}`}
    />
  );
}

// --- Status -----------------------------------------------------------------

const STATUS_STYLE: Record<ContentStatus, string> = {
  idea: 'bg-white/5 text-muted',
  scripted: 'bg-white/5 text-bone',
  to_film: 'bg-gold/15 text-gold',
  filmed: 'bg-gold/15 text-gold',
  editing: 'bg-gold/15 text-gold',
  ready: 'bg-emerald-500/15 text-emerald-400',
  posted: 'bg-emerald-500/20 text-emerald-300',
};

export function StatusBadge({ status }: { status: ContentStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${STATUS_STYLE[status]}`}
    >
      {STATUS_LABEL[status]}
    </span>
  );
}

export function ProductionBadge({ level }: { level: ProductionLevel }) {
  return (
    <span className="inline-flex items-center rounded-md bg-white/5 px-2 py-0.5 text-xs text-muted">
      {PRODUCTION_LABEL[level]}
    </span>
  );
}

// --- Platforms --------------------------------------------------------------

/** Single-letter marks — real logos would need licensed assets. */
const PLATFORM_MARK: Record<Platform, string> = {
  tiktok: 'TT',
  instagram: 'IG',
  facebook: 'FB',
};

export function PlatformIcons({ platforms }: { platforms: Platform[] }) {
  if (!platforms?.length) return null;
  return (
    <span className="inline-flex gap-1">
      {platforms.map((p) => (
        <span
          key={p}
          title={PLATFORM_LABEL[p]}
          className="inline-flex h-5 w-6 items-center justify-center rounded bg-white/5 text-[10px] font-semibold tracking-wide text-muted"
        >
          {PLATFORM_MARK[p]}
        </span>
      ))}
    </span>
  );
}

// --- Layout helpers ---------------------------------------------------------

export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="display text-3xl text-bone sm:text-4xl">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-muted">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function EmptyState({
  message,
  hint,
}: {
  message: string;
  hint?: string;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-white/10 px-6 py-10 text-center">
      <p className="text-sm text-muted">{message}</p>
      {hint && <p className="mt-1 text-xs text-faint">{hint}</p>}
    </div>
  );
}

// --- Content card -----------------------------------------------------------

export function ContentCard({ item }: { item: ContentItem }) {
  const shots = item.shot_list ?? [];
  const doneShots = shots.filter((s) => s.done).length;

  return (
    <Link
      href={`/content/${item.id}`}
      className="card card-hover relative block overflow-hidden p-4 pl-5"
    >
      <PillarBar pillar={item.pillar} />

      <div className="flex items-start justify-between gap-3">
        <h3 className="font-medium leading-snug text-bone">{item.title}</h3>
        <StatusBadge status={item.status} />
      </div>

      {item.segment && (
        <p className="mt-1 text-xs text-gold-dim">{item.segment}</p>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <PillarBadge pillar={item.pillar} />
        <PlatformIcons platforms={item.platforms} />
        {item.scheduled_post_date && (
          <span className="text-xs text-muted">
            {formatShort(item.scheduled_post_date)}
          </span>
        )}
        {shots.length > 0 && (
          <span className="text-xs text-faint">
            {doneShots}/{shots.length} shots
          </span>
        )}
      </div>
    </Link>
  );
}

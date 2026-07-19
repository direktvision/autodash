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
import { MarkFacebook, MarkInstagram, MarkTikTok, IconCamera } from './icons';

// --- Pillar -----------------------------------------------------------------

const PILLAR_TEXT: Record<Pillar, string> = {
  vlog: 'text-pillar-vlog',
  showcase: 'text-pillar-showcase',
  conversion: 'text-pillar-conversion',
};

const PILLAR_DOT: Record<Pillar, string> = {
  vlog: 'bg-pillar-vlog',
  showcase: 'bg-pillar-showcase',
  conversion: 'bg-pillar-conversion',
};

/** Dot + tracked micro-label. Quieter than a filled badge; reads as a system. */
export function PillarBadge({ pillar }: { pillar: Pillar }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.12em] ${PILLAR_TEXT[pillar]}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${PILLAR_DOT[pillar]}`} />
      {PILLAR_LABEL[pillar]}
    </span>
  );
}

export function PillarBar({ pillar }: { pillar: Pillar }) {
  return (
    <span
      aria-hidden
      className={`absolute inset-y-3 left-0 w-[2px] rounded-full ${PILLAR_DOT[pillar]}`}
    />
  );
}

// --- Status -----------------------------------------------------------------

/** Three tones: dormant (gray), in-motion (gold), done (sage). */
const STATUS_TONE: Record<ContentStatus, { dot: string; text: string; ring: string }> = {
  idea: { dot: 'bg-faint', text: 'text-muted', ring: 'border-white/[0.08]' },
  scripted: { dot: 'bg-muted', text: 'text-muted', ring: 'border-white/[0.08]' },
  to_film: { dot: 'bg-gold', text: 'text-gold', ring: 'border-gold/25' },
  filmed: { dot: 'bg-gold', text: 'text-gold', ring: 'border-gold/25' },
  editing: { dot: 'bg-gold', text: 'text-gold', ring: 'border-gold/25' },
  ready: { dot: 'bg-sage', text: 'text-sage', ring: 'border-sage/25' },
  posted: { dot: 'bg-sage', text: 'text-sage', ring: 'border-sage/30' },
};

export function StatusBadge({ status }: { status: ContentStatus }) {
  const tone = STATUS_TONE[status];
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border ${tone.ring} bg-white/[0.02] px-2.5 py-1 text-[11px] font-medium ${tone.text}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${tone.dot}`} />
      {STATUS_LABEL[status]}
    </span>
  );
}

export function ProductionBadge({ level }: { level: ProductionLevel }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.08] px-2.5 py-1 text-[11px] text-muted">
      <IconCamera size={11} />
      {PRODUCTION_LABEL[level]}
    </span>
  );
}

// --- Platforms --------------------------------------------------------------

const PLATFORM_MARK: Record<Platform, React.ComponentType<{ size?: number }>> = {
  tiktok: MarkTikTok,
  instagram: MarkInstagram,
  facebook: MarkFacebook,
};

export function PlatformIcons({ platforms }: { platforms: Platform[] }) {
  if (!platforms?.length) return null;
  return (
    <span className="inline-flex items-center gap-2 text-faint">
      {platforms.map((p) => {
        const Mark = PLATFORM_MARK[p];
        return (
          <span key={p} title={PLATFORM_LABEL[p]} className="transition-colors">
            <Mark size={12} />
          </span>
        );
      })}
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
    <div className="mb-8 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="display text-4xl text-bone sm:text-5xl">{title}</h1>
        {subtitle && (
          <p className="mt-1.5 text-[13px] tracking-wide text-muted">{subtitle}</p>
        )}
      </div>
      {action}
    </div>
  );
}

export function SectionTitle({
  children,
  aside,
}: {
  children: React.ReactNode;
  aside?: React.ReactNode;
}) {
  return (
    <div className="section-head">
      <h2 className="order-1 display text-2xl text-bone">{children}</h2>
      {aside && <div className="order-3 shrink-0">{aside}</div>}
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
    <div className="rounded-2xl border border-dashed border-white/[0.09] px-6 py-12 text-center">
      <p className="text-sm text-muted">{message}</p>
      {hint && <p className="mt-1.5 text-xs text-faint">{hint}</p>}
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
      className="card card-hover group relative block overflow-hidden p-4 pl-5"
    >
      <PillarBar pillar={item.pillar} />

      <div className="flex items-center justify-between gap-3">
        <PillarBadge pillar={item.pillar} />
        <StatusBadge status={item.status} />
      </div>

      <h3 className="mt-2.5 font-medium leading-snug text-bone transition-colors group-hover:text-gold-bright">
        {item.title}
      </h3>

      {item.segment && (
        <p className="mt-0.5 text-xs italic text-gold-dim">{item.segment}</p>
      )}

      <div className="mt-3.5 flex items-center gap-3 text-[11px] text-faint">
        <PlatformIcons platforms={item.platforms} />
        {item.scheduled_post_date && (
          <span className="tnum text-muted">{formatShort(item.scheduled_post_date)}</span>
        )}
        {shots.length > 0 && (
          <span className="tnum ml-auto">
            {doneShots}/{shots.length} shots
          </span>
        )}
      </div>
    </Link>
  );
}

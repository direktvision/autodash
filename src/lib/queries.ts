import { createServerClient } from '@/lib/supabase/server';
import {
  currentIsoWeek,
  getIsoWeek,
  isoWeekStart,
  addDays,
  formatIsoDate,
  nextOnSiteDate,
  todayIso,
  type IsoWeek,
} from '@/lib/dates';
import type {
  BankItem,
  ContentItem,
  Metric,
  Pillar,
  Platform,
  Segment,
  Settings,
} from '@/lib/types';

/** Supabase returns jsonb as `unknown`; normalise shot_list to a real array. */
function normaliseItem(row: ContentItem): ContentItem {
  return {
    ...row,
    platforms: Array.isArray(row.platforms) ? row.platforms : [],
    shot_list: Array.isArray(row.shot_list) ? row.shot_list : [],
  };
}

// --- content_items ----------------------------------------------------------

export async function getItemsForWeek(week: IsoWeek): Promise<ContentItem[]> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from('content_items')
    .select('*')
    .eq('year', week.year)
    .eq('week_number', week.week)
    .order('scheduled_post_date', { ascending: true, nullsFirst: false })
    .order('created_at', { ascending: true });

  if (error) throw new Error(`Failed to load week: ${error.message}`);
  return (data ?? []).map(normaliseItem);
}

export async function getItem(id: string): Promise<ContentItem | null> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from('content_items')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) throw new Error(`Failed to load item: ${error.message}`);
  return data ? normaliseItem(data) : null;
}

export async function getAllItems(): Promise<ContentItem[]> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from('content_items')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw new Error(`Failed to load items: ${error.message}`);
  return (data ?? []).map(normaliseItem);
}

/**
 * Items to film on the next on-site day.
 *
 * Matches anything explicitly dated for that day, plus undated work that is
 * still waiting to be shot — that backlog is exactly what an on-site day is
 * for, so surfacing it beats showing an empty card.
 */
export async function getNextFilmingDay(): Promise<{
  date: string | null;
  scheduled: ContentItem[];
  unscheduled: ContentItem[];
}> {
  const supabase = createServerClient();
  const settings = await getSettings();
  const date = nextOnSiteDate(settings.on_site_days);

  const { data, error } = await supabase
    .from('content_items')
    .select('*')
    .in('status', ['idea', 'scripted', 'to_film'])
    .order('created_at', { ascending: true });

  if (error) throw new Error(`Failed to load filming day: ${error.message}`);

  const items = (data ?? []).map(normaliseItem);
  return {
    date,
    scheduled: items.filter((i) => i.filming_date === date),
    unscheduled: items.filter((i) => !i.filming_date),
  };
}

// --- content_bank -----------------------------------------------------------

export async function getBankItems(filters?: {
  pillar?: Pillar;
  priority?: string;
}): Promise<BankItem[]> {
  const supabase = createServerClient();
  let query = supabase.from('content_bank').select('*');

  if (filters?.pillar) query = query.eq('pillar', filters.pillar);
  if (filters?.priority) query = query.eq('priority', filters.priority);

  const { data, error } = await query.order('created_at', { ascending: false });
  if (error) throw new Error(`Failed to load bank: ${error.message}`);
  return data ?? [];
}

// --- metrics ----------------------------------------------------------------

export async function getMetricsForItem(itemId: string): Promise<Metric[]> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from('metrics')
    .select('*')
    .eq('content_item_id', itemId);

  if (error) throw new Error(`Failed to load metrics: ${error.message}`);
  return data ?? [];
}

export type ItemWithMetrics = ContentItem & {
  metrics: Metric[];
  totalViews: number;
  totalEngagement: number;
};

export async function getItemsWithMetrics(filters?: {
  pillar?: Pillar;
  platform?: Platform;
  from?: string;
  to?: string;
}): Promise<ItemWithMetrics[]> {
  const supabase = createServerClient();

  let query = supabase
    .from('content_items')
    .select('*, metrics(*)')
    .eq('status', 'posted');

  if (filters?.pillar) query = query.eq('pillar', filters.pillar);
  if (filters?.from) query = query.gte('scheduled_post_date', filters.from);
  if (filters?.to) query = query.lte('scheduled_post_date', filters.to);

  const { data, error } = await query;
  if (error) throw new Error(`Failed to load metrics overview: ${error.message}`);

  const rows = (data ?? []) as (ContentItem & { metrics: Metric[] })[];

  return rows
    .map((row) => {
      const metrics = (row.metrics ?? []).filter(
        (m) => !filters?.platform || m.platform === filters.platform,
      );
      return {
        ...normaliseItem(row),
        metrics,
        totalViews: metrics.reduce((sum, m) => sum + (m.views ?? 0), 0),
        totalEngagement: metrics.reduce(
          (sum, m) =>
            sum +
            (m.likes ?? 0) +
            (m.comments ?? 0) +
            (m.shares ?? 0) +
            (m.saves ?? 0),
          0,
        ),
      };
    })
    // Platform filter can leave an item with no matching rows — drop it.
    .filter((row) => !filters?.platform || row.metrics.length > 0)
    .sort((a, b) => b.totalViews - a.totalViews);
}

/** Totals for content posted during the given ISO week. */
export async function getWeekStats(week: IsoWeek): Promise<{
  views: number;
  engagement: number;
  posts: number;
}> {
  const supabase = createServerClient();
  const start = isoWeekStart(week);
  const end = addDays(start, 6);

  const { data, error } = await supabase
    .from('content_items')
    .select('id, metrics(*)')
    .eq('status', 'posted')
    .gte('scheduled_post_date', formatIsoDate(start))
    .lte('scheduled_post_date', formatIsoDate(end));

  if (error) throw new Error(`Failed to load stats: ${error.message}`);

  const rows = (data ?? []) as { id: string; metrics: Metric[] }[];
  let views = 0;
  let engagement = 0;

  for (const row of rows) {
    for (const m of row.metrics ?? []) {
      views += m.views ?? 0;
      engagement +=
        (m.likes ?? 0) + (m.comments ?? 0) + (m.shares ?? 0) + (m.saves ?? 0);
    }
  }

  return { views, engagement, posts: rows.length };
}

// --- segments & settings ----------------------------------------------------

export async function getSegments(): Promise<Segment[]> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from('segments')
    .select('*')
    .eq('active', true)
    .order('name');

  if (error) throw new Error(`Failed to load segments: ${error.message}`);
  return data ?? [];
}

const DEFAULT_SETTINGS: Settings = {
  id: true,
  on_site_days: [1, 3, 5],
  weekly_target: 5,
  updated_at: new Date().toISOString(),
};

export async function getSettings(): Promise<Settings> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from('settings')
    .select('*')
    .maybeSingle();

  if (error) throw new Error(`Failed to load settings: ${error.message}`);
  return data ?? DEFAULT_SETTINGS;
}

export { currentIsoWeek, getIsoWeek, todayIso };

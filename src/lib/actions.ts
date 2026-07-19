'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createServerClient } from '@/lib/supabase/server';
import { currentIsoWeek, getIsoWeek, parseIsoDate } from '@/lib/dates';
import type {
  ContentItem,
  Pillar,
  Platform,
  Priority,
  ShotListItem,
} from '@/lib/types';

function revalidateAll() {
  revalidatePath('/', 'layout');
}

// --- content_items ----------------------------------------------------------

export async function createItem(input: {
  title: string;
  pillar: Pillar;
  year?: number;
  week_number?: number;
  platforms?: Platform[];
}) {
  const supabase = createServerClient();
  const week = currentIsoWeek();

  const { data, error } = await supabase
    .from('content_items')
    .insert({
      title: input.title.trim() || 'Untitled',
      pillar: input.pillar,
      year: input.year ?? week.year,
      week_number: input.week_number ?? week.week,
      platforms: input.platforms ?? [],
    })
    .select('id')
    .single();

  if (error) throw new Error(`Could not create item: ${error.message}`);
  revalidateAll();
  return data.id as string;
}

/**
 * Patch a content item.
 *
 * Setting `scheduled_post_date` re-derives year/week_number so the planner and
 * the calendar can never disagree about which week an item belongs to.
 */
export async function updateItem(
  id: string,
  patch: Partial<Omit<ContentItem, 'id' | 'created_at' | 'updated_at'>>,
) {
  const supabase = createServerClient();
  const next: Record<string, unknown> = { ...patch };

  if (patch.scheduled_post_date) {
    const week = getIsoWeek(parseIsoDate(patch.scheduled_post_date));
    next.year = week.year;
    next.week_number = week.week;
  }

  const { error } = await supabase.from('content_items').update(next).eq('id', id);
  if (error) throw new Error(`Could not update item: ${error.message}`);

  revalidateAll();
}

export async function deleteItem(id: string) {
  const supabase = createServerClient();
  const { error } = await supabase.from('content_items').delete().eq('id', id);
  if (error) throw new Error(`Could not delete item: ${error.message}`);
  revalidateAll();
  redirect('/planner');
}

/** Debounced autosave target for the script and notes textareas. */
export async function saveField(
  id: string,
  field: 'script' | 'notes',
  value: string,
) {
  const supabase = createServerClient();
  const { error } = await supabase
    .from('content_items')
    .update({ [field]: value })
    .eq('id', id);

  if (error) throw new Error(`Could not save ${field}: ${error.message}`);
  // Deliberately no revalidate: the textarea already holds the current value,
  // and re-rendering mid-typing would fight the user's cursor.
}

export async function saveShotList(id: string, shotList: ShotListItem[]) {
  const supabase = createServerClient();
  const { error } = await supabase
    .from('content_items')
    .update({ shot_list: shotList })
    .eq('id', id);

  if (error) throw new Error(`Could not save shot list: ${error.message}`);
  revalidatePath(`/content/${id}`);
}

// --- content_bank -----------------------------------------------------------

export async function createBankItem(input: {
  title: string;
  pillar: Pillar;
  description?: string;
  priority?: Priority;
}) {
  const supabase = createServerClient();
  const { error } = await supabase.from('content_bank').insert({
    title: input.title.trim(),
    pillar: input.pillar,
    description: input.description?.trim() || null,
    priority: input.priority ?? 'medium',
  });

  if (error) throw new Error(`Could not add idea: ${error.message}`);
  revalidateAll();
}

export async function deleteBankItem(id: string) {
  const supabase = createServerClient();
  const { error } = await supabase.from('content_bank').delete().eq('id', id);
  if (error) throw new Error(`Could not delete idea: ${error.message}`);
  revalidateAll();
}

/**
 * Promote a bank idea into a real content item for a given week.
 *
 * The bank row is kept and back-linked rather than deleted, so the idea's
 * history survives and the bank list can show it as already used.
 */
export async function promoteBankItem(
  bankId: string,
  week: { year: number; week: number },
) {
  const supabase = createServerClient();

  const { data: bankItem, error: readError } = await supabase
    .from('content_bank')
    .select('*')
    .eq('id', bankId)
    .single();

  if (readError) throw new Error(`Could not read idea: ${readError.message}`);

  const { data: created, error: insertError } = await supabase
    .from('content_items')
    .insert({
      title: bankItem.title,
      pillar: bankItem.pillar,
      notes: bankItem.description,
      year: week.year,
      week_number: week.week,
      status: 'idea',
      platforms: [],
    })
    .select('id')
    .single();

  if (insertError) throw new Error(`Could not promote idea: ${insertError.message}`);

  const { error: linkError } = await supabase
    .from('content_bank')
    .update({ promoted_to_item_id: created.id })
    .eq('id', bankId);

  if (linkError) throw new Error(`Could not link idea: ${linkError.message}`);

  revalidateAll();
  return created.id as string;
}

// --- metrics ----------------------------------------------------------------

/**
 * Upsert one metrics row per (item, platform) — see the unique index in the
 * migration. Re-logging a platform overwrites, so numbers stay current rather
 * than accumulating duplicate snapshots.
 */
export async function logMetrics(input: {
  content_item_id: string;
  platform: Platform;
  views: number;
  likes: number;
  comments: number;
  shares?: number | null;
  saves?: number | null;
}) {
  const supabase = createServerClient();
  const { error } = await supabase.from('metrics').upsert(
    {
      ...input,
      shares: input.shares ?? null,
      saves: input.saves ?? null,
      logged_at: new Date().toISOString(),
    },
    { onConflict: 'content_item_id,platform' },
  );

  if (error) throw new Error(`Could not log metrics: ${error.message}`);
  revalidateAll();
}

// --- settings ---------------------------------------------------------------

export async function updateOnSiteDays(days: number[]) {
  const supabase = createServerClient();
  const { error } = await supabase
    .from('settings')
    .update({ on_site_days: days })
    .eq('id', true);

  if (error) throw new Error(`Could not save on-site days: ${error.message}`);
  revalidateAll();
}

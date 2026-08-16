/**
 * Supabase persistence for Publications (public.publications).
 *
 * Mirrors researchListStore.js: writes are gated server-side by RLS
 * (`can_manage_group('Nghiên cứu Khoa học')`), so a refusal throws rather than
 * being swallowed — the UI must be able to say the change didn't sync.
 */
import { supabase, isLive } from '../lib/supabaseClient.js';

// The UI's field names don't all match the column names.
const FIELD_TO_COLUMN = {
  title: 'title',
  authors: 'authors',
  category: 'category',
  section: 'section',
  citation: 'citation',
  pub_time: 'pub_time',
  ueh_declared: 'ueh_declared',
  ueh_reward: 'ueh_reward',
  year: 'pub_year',
  journal_conference: 'journal',
  indexing_cols: 'indexing_cols',
  details: 'details',
};

/**
 * Rows sourced from Supabase are keyed `live-<serial id>`; the bundled dataset
 * ('p12') and rows added in-session ('manual-1699…') have no server row.
 */
export function dbIdOf(uiId) {
  const match = /^live-(\d+)$/.exec(String(uiId ?? ''));
  return match ? Number(match[1]) : null;
}

/** Turns a UI-shaped patch into a column-shaped one, dropping unknown fields. */
export function toColumns(patch) {
  const columns = {};
  Object.entries(patch).forEach(([field, value]) => {
    const column = FIELD_TO_COLUMN[field];
    if (!column) return;
    columns[column] = value === '' ? null : value;
  });
  return columns;
}

export async function fetchPublications() {
  if (!isLive) return null;
  const { data, error } = await supabase
    .from('publications')
    .select('*')
    .order('pub_year', { ascending: false });
  if (error || !data || data.length === 0) return null;
  return data;
}

export async function insertPublication(row) {
  const columns = toColumns(row);
  const { data, error } = await supabase
    .from('publications')
    .insert(columns)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deletePublication(uiId) {
  const id = dbIdOf(uiId);
  if (id === null) return false;
  const { error } = await supabase.from('publications').delete().eq('id', id);
  if (error) throw error;
  return true;
}

export async function updatePublication(uiId, patch) {
  const id = dbIdOf(uiId);
  if (id === null) return false;
  const columns = toColumns(patch);
  if (Object.keys(columns).length === 0) return false;
  const { error } = await supabase
    .from('publications')
    .update({ ...columns, updated_at: new Date().toISOString() })
    .eq('id', id);
  if (error) throw error;
  return true;
}

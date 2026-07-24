/**
 * Supabase persistence for the Research List (public.iscm_research_list).
 *
 * Writes are gated server-side by RLS (`can_manage_group('Nghiên cứu Khoa học')`
 * — i.e. a top admin or the Research head must be signed in). These helpers
 * therefore throw on rejection rather than swallowing it, so the caller can
 * tell the user their change was NOT persisted instead of pretending it was.
 */
import { supabase, isLive } from '../lib/supabaseClient.js';

// Columns that actually exist on the table. Anything the UI carries around but
// the table has no column for (isDraft, resolvedLevel, resolvedParentId, …) is
// dropped before a write, otherwise Postgres rejects the whole statement.
const RESEARCH_COLUMNS = [
  'code', 'research_unit', 'task_name', 'status', 'start_year', 'end_year',
  'task_type', 'ordered_by', 'coordinator_manager', 'members', 'report_plan_link',
  'framework_transition', 'glocal_design', 'human_centric_orientation',
  'tech_solutions', 'urban_system', 'sdgs',
  'member_roles', 'minute_reports', 'documents',
];

const JSON_DEFAULTS = { member_roles: {}, minute_reports: [], documents: [] };
// NOT NULL in the schema — an emptied field must stay '' rather than become null.
const NOT_NULL_COLUMNS = new Set(['research_unit', 'task_name']);

/**
 * Supabase rows use the SERIAL integer PK. The bundled demo rows ('rl-12') and
 * unsaved drafts ('inline-3') have no server-side counterpart, so they must
 * never be sent to the database.
 */
export function isDbRow(id) {
  if (id === null || id === undefined) return false;
  return typeof id === 'number' || /^\d+$/.test(String(id));
}

/** Narrows an arbitrary UI row/patch down to real, writable table columns. */
export function toColumns(row) {
  const patch = {};
  RESEARCH_COLUMNS.forEach((col) => {
    if (!(col in row)) return;
    let value = row[col];
    if (col in JSON_DEFAULTS) {
      value = value ?? JSON_DEFAULTS[col];
    } else if (value === '' && !NOT_NULL_COLUMNS.has(col)) {
      value = null;
    }
    patch[col] = value;
  });
  return patch;
}

export async function fetchResearchRows() {
  if (!isLive) return null;
  const { data, error } = await supabase
    .from('iscm_research_list')
    .select('*')
    .order('research_unit', { ascending: true })
    .order('code', { ascending: true, nullsFirst: false });
  if (error || !data || data.length === 0) return null;
  return data;
}

export async function insertResearchRow(row) {
  const { data, error } = await supabase
    .from('iscm_research_list')
    .insert(toColumns(row))
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateResearchRow(id, patch) {
  const columns = toColumns(patch);
  if (Object.keys(columns).length === 0) return null;
  const { data, error } = await supabase
    .from('iscm_research_list')
    .update({ ...columns, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteResearchRows(ids) {
  const dbIds = ids.filter(isDbRow).map(Number);
  if (dbIds.length === 0) return;
  const { error } = await supabase.from('iscm_research_list').delete().in('id', dbIds);
  if (error) throw error;
}

/**
 * Shared wording for a write that RLS (or the network) refused. Deliberately
 * explicit that the change only exists in this browser, so nobody assumes it
 * synced to the shared database.
 */
export function writeFailedMessage(error, lang) {
  const detail = error?.message ? ` (${error.message})` : '';
  return lang === 'vi'
    ? `Không lưu được lên cơ sở dữ liệu${detail}.\n\nThay đổi chỉ được lưu tạm trên trình duyệt này. Hãy đăng nhập bằng tài khoản có quyền quản lý Nghiên cứu Khoa học rồi lưu lại để đồng bộ.`
    : `Could not save to the database${detail}.\n\nYour change is only stored in this browser. Sign in with an account authorised to manage Scientific Research, then save again to sync.`;
}

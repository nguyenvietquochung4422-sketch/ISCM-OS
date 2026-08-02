/**
 * Live-editable ISCM staff directory (public.iscm_members) — backs the
 * "ISCM Member Information" tab in the org chart, and the Admin panel that
 * edits it. Falls back to the static ISCM_MEMBERS seed (iscmMembers.js) in
 * demo mode (no Supabase configured), same isLive pattern used everywhere
 * else in this app.
 */
import { supabase, isLive } from '../lib/supabaseClient.js';
import { ISCM_MEMBERS } from './iscmMembers.js';

function fromRow(row) {
  return {
    id: row.id,
    group: row.group_key,
    nameVi: row.name_vi,
    nameEn: row.name_en,
    titleVi: row.title_vi,
    titleEn: row.title_en,
    fieldVi: row.field_vi,
    fieldEn: row.field_en,
    duties: row.duties || [],
    email: row.email || '',
    sortOrder: row.sort_order,
  };
}

function toRow(member) {
  return {
    id: member.id,
    group_key: member.group,
    name_vi: member.nameVi,
    name_en: member.nameEn,
    title_vi: member.titleVi || '',
    title_en: member.titleEn || '',
    field_vi: member.fieldVi || '',
    field_en: member.fieldEn || '',
    duties: (member.duties || []).filter(Boolean),
    email: member.email || null,
    sort_order: member.sortOrder ?? 0,
  };
}

/** The full roster, ordered the same way as the static seed. */
export async function fetchMembers() {
  if (!isLive) return ISCM_MEMBERS;
  const { data, error } = await supabase
    .from('iscm_members')
    .select('*')
    .order('sort_order', { ascending: true });
  if (error || !data) return ISCM_MEMBERS;
  return data.map(fromRow);
}

/** Insert or update one member (matched by id). Admin-only per RLS. */
export async function saveMember(member) {
  if (!isLive) throw new Error('Supabase is not configured — cannot save.');
  const { data, error } = await supabase
    .from('iscm_members')
    .upsert(toRow(member), { onConflict: 'id' })
    .select()
    .single();
  if (error) throw error;
  return fromRow(data);
}

/** Admin-only per RLS. */
export async function deleteMember(id) {
  if (!isLive) throw new Error('Supabase is not configured — cannot delete.');
  const { error } = await supabase.from('iscm_members').delete().eq('id', id);
  if (error) throw error;
}

/** A fresh, never-colliding id for a new member row. */
export function newMemberId() {
  return `mem-${Date.now().toString(36)}`;
}

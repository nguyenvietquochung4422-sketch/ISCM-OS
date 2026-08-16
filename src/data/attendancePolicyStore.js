/**
 * Attendance Settings — public.attendance_policies / attendance_calendar_days
 * / attendance_member_scope. Policies are versioned by `effective_from` (and
 * optional `effective_to`), never edited-in-place for a range that's already
 * elapsed — resolvePolicyForDate() in attendanceAggregation.js always picks
 * whichever version was in force on the date being calculated, so changing
 * today's policy can't silently rewrite last year's reports.
 */
import { supabase, isLive } from '../lib/supabaseClient.js';
import { logAuditEvent } from './attendanceAuditStore.js';

export const CALENDAR_DAY_TYPES = ['public_holiday', 'institute_holiday', 'special_working_day', 'special_non_working_day'];
export const ATTENDANCE_TYPE_RULE_KEYS = ['requiresApproval', 'allowMultiDay', 'allowRetroactive', 'reasonRequired', 'relatedActivityRequired'];

export async function canManageAttendanceSettings() {
  if (!isLive) return false;
  const { data, error } = await supabase.rpc('can_manage_content', { key: 'attendance-log' });
  return !error && Boolean(data);
}

export async function fetchPolicies() {
  if (!isLive) return [];
  const { data, error } = await supabase.from('attendance_policies').select('*').order('effective_from', { ascending: false });
  if (error || !data) return [];
  return data;
}

export async function createPolicy(fields, userId) {
  if (!isLive) throw new Error('Supabase is not configured — cannot save.');
  const { data, error } = await supabase
    .from('attendance_policies')
    .insert({ ...fields, created_by: userId })
    .select()
    .single();
  if (error) throw error;
  logAuditEvent({
    entityType: 'policy', entityId: data.id, action: 'policy_created', performedBy: userId,
    newValues: { name: data.name, working_days: data.working_days, standard_start_time: data.standard_start_time, standard_end_time: data.standard_end_time, effective_from: data.effective_from, effective_to: data.effective_to },
  });
  return data;
}

export async function updatePolicy(id, patch) {
  if (!isLive) throw new Error('Supabase is not configured — cannot save.');
  const { error } = await supabase.from('attendance_policies').update(patch).eq('id', id);
  if (error) throw error;
}

export async function deletePolicy(id) {
  if (!isLive) throw new Error('Supabase is not configured — cannot delete.');
  const { error } = await supabase.from('attendance_policies').delete().eq('id', id);
  if (error) throw error;
}

export async function fetchCalendarDays() {
  if (!isLive) return [];
  const { data, error } = await supabase.from('attendance_calendar_days').select('*').order('date');
  if (error || !data) return [];
  return data;
}

export async function addCalendarDay(fields, userId) {
  if (!isLive) throw new Error('Supabase is not configured — cannot save.');
  const { error } = await supabase.from('attendance_calendar_days').upsert({ ...fields, created_by: userId }, { onConflict: 'date' });
  if (error) throw error;
  logAuditEvent({
    entityType: 'calendar_day', entityId: fields.date, action: 'calendar_day_added', performedBy: userId,
    newValues: { date: fields.date, day_type: fields.day_type, name: fields.name || null },
  });
}

export async function deleteCalendarDay(date, userId) {
  if (!isLive) throw new Error('Supabase is not configured — cannot delete.');
  const { data: existing } = await supabase.from('attendance_calendar_days').select('*').eq('date', date).maybeSingle();
  const { error } = await supabase.from('attendance_calendar_days').delete().eq('date', date);
  if (error) throw error;
  logAuditEvent({
    entityType: 'calendar_day', entityId: date, action: 'calendar_day_removed', performedBy: userId,
    previousValues: existing ? { date: existing.date, day_type: existing.day_type, name: existing.name } : null,
  });
}

export async function fetchAllMemberScopes() {
  if (!isLive) return [];
  const { data, error } = await supabase.from('attendance_member_scope').select('*');
  if (error || !data) return [];
  return data;
}

export async function upsertMemberScope(fields, userId) {
  if (!isLive) throw new Error('Supabase is not configured — cannot save.');
  const { data: existing } = await supabase.from('attendance_member_scope').select('*').eq('member_id', fields.member_id).maybeSingle();
  const { error } = await supabase
    .from('attendance_member_scope')
    .upsert({ ...fields, updated_by: userId, updated_at: new Date().toISOString() }, { onConflict: 'member_id' });
  if (error) throw error;
  logAuditEvent({
    entityType: 'member_scope', entityId: fields.member_id, action: 'scope_changed', performedBy: userId,
    previousValues: existing ? { enabled: existing.enabled, start_date: existing.start_date, end_date: existing.end_date, policy_id: existing.policy_id } : null,
    newValues: { enabled: fields.enabled, start_date: fields.start_date, end_date: fields.end_date, policy_id: fields.policy_id },
  });
}

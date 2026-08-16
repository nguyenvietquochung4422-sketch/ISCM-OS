/**
 * Full audit trail — public.attendance_audit_logs. Append-only by design:
 * the table has select/insert RLS policies only (no update/delete), so a
 * logged event can never be edited or removed, not even by an admin.
 *
 * Two entity families feed it:
 *  - 'attendance_record' events (created/submitted/approved/rejected/
 *    cancelled/corrected/admin_updated) — the record-level history that
 *    ApprovalTimeline.jsx used to approximate from created_at/approved_at/
 *    cancelled_at alone.
 *  - Attendance Settings events ('policy'/'calendar_day'/'member_scope' —
 *    policy_created/calendar_day_added/calendar_day_removed/scope_changed)
 *    — so "why did Normal Working Days change between August and
 *    September" is always answerable from data, not memory.
 */
import { supabase, isLive } from '../lib/supabaseClient.js';

export const AUDIT_ACTIONS = [
  'created', 'submitted', 'approved', 'rejected', 'cancelled', 'corrected', 'admin_updated',
  'policy_created', 'calendar_day_added', 'calendar_day_removed', 'scope_changed',
];

/** Writes one audit event. Never throws into the caller's main flow — a
    failed audit write shouldn't block the underlying attendance action
    from succeeding, so this only logs to the console on failure. */
export async function logAuditEvent({ entityType, entityId, action, performedBy, previousValues, newValues, reason, metadata }) {
  if (!isLive || !performedBy) return;
  const { error } = await supabase.from('attendance_audit_logs').insert({
    entity_type: entityType,
    entity_id: String(entityId),
    action,
    performed_by: performedBy,
    previous_values: previousValues ?? null,
    new_values: newValues ?? null,
    reason: reason || null,
    metadata: metadata ?? null,
  });
  if (error) console.error('attendance audit log write failed:', error);
}

async function fetchAuditLogs(entityType, entityId) {
  if (!isLive) return [];
  const { data, error } = await supabase
    .from('attendance_audit_logs')
    .select('*, performer:performed_by(full_name, email)')
    .eq('entity_type', entityType)
    .eq('entity_id', String(entityId))
    .order('performed_at', { ascending: false });
  if (error || !data) return [];
  return data;
}

export function fetchAttendanceRecordAuditLogs(recordId) {
  return fetchAuditLogs('attendance_record', recordId);
}

/** Batched variant for a whole record set (e.g. one member's full history)
    — one query instead of one per record. */
export async function fetchAuditLogsForRecordIds(recordIds) {
  if (!isLive || !recordIds || recordIds.length === 0) return [];
  const { data, error } = await supabase
    .from('attendance_audit_logs')
    .select('*, performer:performed_by(full_name, email)')
    .eq('entity_type', 'attendance_record')
    .in('entity_id', recordIds.map(String))
    .order('performed_at', { ascending: false });
  if (error || !data) return [];
  return data;
}

/** Every Settings change (policy/calendar/scope), newest first — the
    Institute Attendance > Settings > Audit view. */
export async function fetchSettingsAuditLogs() {
  if (!isLive) return [];
  const { data, error } = await supabase
    .from('attendance_audit_logs')
    .select('*, performer:performed_by(full_name, email)')
    .in('entity_type', ['policy', 'calendar_day', 'member_scope'])
    .order('performed_at', { ascending: false })
    .limit(200);
  if (error || !data) return [];
  return data;
}

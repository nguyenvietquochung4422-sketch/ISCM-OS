/**
 * Attendance — public.attendance_records. Normal Working Day is the
 * implicit default and is never stored; a row only exists for one of the
 * five exception types below, each carrying its own approval workflow.
 * `member_id` links to users_profiles (the signed-in account), not the
 * full iscm_members roster — so only accounts that can actually sign in
 * have attendance data; everyone else has none yet.
 */
import { supabase, isLive } from '../lib/supabaseClient.js';
import { createNotification } from '../lib/notifications.js';
import { logAuditEvent } from './attendanceAuditStore.js';

/** "Today" as the viewer's own local calendar date (not UTC) — a member in
    Vietnam (UTC+7) reporting attendance at 2am local means today, not
    yesterday. Lives here (the base module attendanceAggregation.js already
    imports from) rather than there, to avoid a circular import. */
export function todayIsoLocal() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export const ATTENDANCE_TYPES = ['Annual Leave', 'Absence', 'Work from Home', 'Work Outside', 'Late'];
export const DURATION_TYPES = ['Full Day', 'Half Day - Morning', 'Half Day - Afternoon', 'Custom Time'];
export const OUTSIDE_CATEGORIES = ['Fieldwork', 'Partner Meeting', 'Workshop / Conference', 'Business Trip', 'Other'];

/* Approval lifecycle (Phase 1):
 *
 *   Pending --Approve--> Approved
 *      |                    |
 *      +---Reject---> Rejected
 *      |                    |
 *      +---Cancel----> Cancelled <---Cancel (if not yet past)---+
 *
 * A record is always created as Pending — Report Attendance has no "save
 * for later" step in Phase 1, so Draft is reserved for a future feature
 * (not produced by anything today). No Permission is likewise reserved —
 * it's for a future flow where an admin logs an unauthorised absence that
 * was never requested; nothing sets it yet. Both stay in the DB check
 * constraint (harmless) but aren't offered anywhere in the UI.
 *
 * Cancel is a soft status change, never a delete — there is deliberately no
 * DELETE RLS policy on attendance_records, so the only way a record's
 * lifecycle ends is Approved/Rejected/Cancelled, all of which keep the row
 * (and its audit trail: approved_by/approved_at/approval_comment) intact.
 * The member can Cancel their own Pending or Approved record up until the
 * date itself has passed (see isCancellable); Approve/Reject is admin-only
 * and only meaningful while Pending.
 */
export const APPROVAL_STATUSES = ['Draft', 'Pending', 'Approved', 'Rejected', 'Cancelled', 'No Permission'];

export function isCancellable(record) {
  const notPast = (record.end_date || record.attendance_date) >= todayIsoLocal();
  return notPast && ['Pending', 'Approved'].includes(record.approval_status);
}

export async function canManageAttendance() {
  if (!isLive) return false;
  const { data, error } = await supabase.rpc('can_manage_content', { key: 'attendance-log' });
  return !error && Boolean(data);
}

/** Every record belonging to one member (any status) — used for their
    calendar, today status, and history. */
export async function fetchMyAttendanceRecords(userId) {
  if (!isLive || !userId) return [];
  const { data, error } = await supabase
    .from('attendance_records')
    .select('*')
    .eq('member_id', userId)
    .order('attendance_date', { ascending: false });
  if (error || !data) return [];
  return data;
}

/** Every record institute-wide — admin only per RLS (can_manage_content). */
export async function fetchAllAttendanceRecords() {
  if (!isLive) return [];
  const { data, error } = await supabase
    .from('attendance_records')
    .select('*, member:member_id(full_name, email)')
    .order('attendance_date', { ascending: false });
  if (error || !data) return [];
  return data;
}

/** True when `userId` already has a live (not Cancelled/Rejected) record
    whose date range intersects [fromDate, toDate] — e.g. can't report Late
    on a day already covered by an approved Annual Leave. Range overlap
    can't be pushed fully into a PostgREST filter (no cross-column
    comparison), so this fetches candidates server-side (attendance_date <=
    toDate) and finishes the check client-side. */
export async function hasOverlappingRecord(userId, fromDate, toDate) {
  if (!isLive || !userId) return false;
  const { data, error } = await supabase
    .from('attendance_records')
    .select('id, attendance_date, end_date, approval_status')
    .eq('member_id', userId)
    .lte('attendance_date', toDate);
  if (error || !data) return false;
  return data.some((r) => {
    if (r.approval_status === 'Cancelled' || r.approval_status === 'Rejected') return false;
    const rEnd = r.end_date || r.attendance_date;
    return rEnd >= fromDate;
  });
}

/** Everyone who can decide this request — is_top_admin roles plus anyone
    delegated 'attendance-log' via content_permissions. A plain member can't
    read content_permissions directly (RLS), so this goes through a
    SECURITY DEFINER RPC that only ever returns a list of ids. */
export async function fetchAttendanceManagers() {
  if (!isLive) return [];
  const { data, error } = await supabase.rpc('get_attendance_managers');
  if (error || !data) return [];
  return data; // array of uuid
}

export async function createAttendanceRecord(fields, userId) {
  if (!isLive) throw new Error('Supabase is not configured — cannot save.');
  const { data, error } = await supabase
    .from('attendance_records')
    .insert({ ...fields, member_id: userId, created_by: userId, approval_status: 'Pending' })
    .select()
    .single();
  if (error) throw error;
  logAuditEvent({
    entityType: 'attendance_record', entityId: data.id, action: 'created', performedBy: userId,
    newValues: { attendance_type: data.attendance_type, attendance_date: data.attendance_date, end_date: data.end_date, duration_type: data.duration_type, approval_status: data.approval_status },
  });

  const managers = await fetchAttendanceManagers();
  managers.filter((managerId) => managerId !== userId).forEach((managerId) => {
    createNotification({
      userId: managerId,
      title: `Yêu cầu chấm công mới — ${data.attendance_type}`,
      body: `${data.attendance_date}${data.end_date && data.end_date !== data.attendance_date ? ` – ${data.end_date}` : ''}`,
      link: 'admin-attendance',
      module: 'attendance', notificationType: 'attendance_request_created',
      entityType: 'attendance_record', entityId: data.id,
      dedupeKey: `attendance_request_created:${data.id}:${managerId}`,
    });
  });

  return data;
}

/** Cancelling a still-Pending request is routine; cancelling one that's
    already Approved is changing an approved plan, not withdrawing an ask —
    keep the prior status on record and tell whoever approved it. */
export async function cancelAttendanceRecord(record, cancelledBy, reason) {
  if (!isLive) throw new Error('Supabase is not configured — cannot cancel.');
  const { error } = await supabase
    .from('attendance_records')
    .update({
      approval_status: 'Cancelled',
      previous_status: record.approval_status,
      cancelled_by: cancelledBy,
      cancelled_at: new Date().toISOString(),
      cancellation_reason: reason || null,
    })
    .eq('id', record.id);
  if (error) throw error;

  logAuditEvent({
    entityType: 'attendance_record', entityId: record.id, action: 'cancelled', performedBy: cancelledBy,
    previousValues: { approval_status: record.approval_status },
    newValues: { approval_status: 'Cancelled' },
    reason: reason || null,
  });

  if (record.approval_status === 'Approved' && record.approved_by) {
    createNotification({
      userId: record.approved_by,
      title: `${record.attendance_type} (${record.attendance_date}) đã được huỷ sau khi duyệt`,
      body: reason || undefined,
      link: 'admin-attendance',
      module: 'attendance', notificationType: 'attendance_approved_cancelled',
      entityType: 'attendance_record', entityId: record.id,
      dedupeKey: `attendance_approved_cancelled:${record.id}:${record.approved_by}`,
    });
  }
  // Cancelling a still-Pending request is routine — no notification (avoids
  // noise); the approver never saw it as actionable in the first place.
}

/** Guards against two admins deciding the same request at once: the update
    only takes effect while the row is still Pending (checked server-side,
    not just in the UI's own stale copy), and reports back whether it
    actually landed so the caller can tell the admin someone beat them to it
    instead of silently overwriting that decision. */
export async function decideAttendanceRecord(record, status, approverId, comment) {
  if (!isLive) return;
  const { data, error } = await supabase
    .from('attendance_records')
    .update({ approval_status: status, approved_by: approverId, approved_at: new Date().toISOString(), approval_comment: comment || null })
    .eq('id', record.id)
    .eq('approval_status', 'Pending')
    .select();
  if (error) throw error;
  if (!data || data.length === 0) {
    throw new Error('Yêu cầu này vừa được người khác xử lý — vui lòng tải lại.');
  }
  logAuditEvent({
    entityType: 'attendance_record', entityId: record.id, action: status === 'Approved' ? 'approved' : 'rejected', performedBy: approverId,
    previousValues: { approval_status: 'Pending' },
    newValues: { approval_status: status },
    reason: comment || null,
  });
  createNotification({
    userId: record.member_id,
    title: status === 'Approved'
      ? `Yêu cầu "${record.attendance_type}" (${record.attendance_date}) đã được duyệt`
      : `Yêu cầu "${record.attendance_type}" (${record.attendance_date}) đã bị từ chối`,
    body: status === 'Rejected' ? (comment || undefined) : undefined,
    link: 'attendance-log',
    module: 'attendance', notificationType: status === 'Approved' ? 'attendance_approved' : 'attendance_rejected',
    entityType: 'attendance_record', entityId: record.id,
    dedupeKey: `${status === 'Approved' ? 'attendance_approved' : 'attendance_rejected'}:${record.id}`,
  });
}

/** Count of provisioned accounts (users_profiles) — the "Active Members"
    KPI. Not the full iscm_members roster: attendance only exists for
    people who can actually sign in and report their own days. */
export async function fetchActiveMemberCount() {
  if (!isLive) return 0;
  const { count, error } = await supabase.from('users_profiles').select('id', { count: 'exact', head: true });
  if (error) return 0;
  return count || 0;
}

/** Every provisioned account — for the admin "Members" picker. A member
    shows up here (with zero records) even before they've ever reported
    anything, so their profile is still reachable. */
export async function fetchAllAccounts() {
  if (!isLive) return [];
  const { data, error } = await supabase.from('users_profiles').select('id, full_name, email').order('full_name');
  if (error || !data) return [];
  return data;
}

/** Does `record` cover this calendar date? (single day, or a date range for
    multi-day Annual Leave.) */
export function recordCoversDate(record, isoDate) {
  const end = record.end_date || record.attendance_date;
  return record.attendance_date <= isoDate && isoDate <= end;
}

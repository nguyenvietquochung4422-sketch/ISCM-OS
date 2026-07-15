/**
 * Real (Supabase-backed) attendance/leave request approvals, mirroring the
 * library admin pattern — the requester submits from AttendanceLogPanel,
 * an admin/permitted account (can_manage_content('attendance-log')) sees
 * and decides on everyone's pending requests.
 */
import { supabase, isLive } from '../lib/supabaseClient.js';
import { createNotification } from '../lib/notifications.js';

export async function canManageAttendance() {
  if (!isLive) return false;
  const { data, error } = await supabase.rpc('can_manage_content', { key: 'attendance-log' });
  return !error && Boolean(data);
}

export async function submitAttendanceRequestRemote({ statusKey, statusLabel, date, note, requesterId }) {
  if (!isLive || !requesterId) return null;
  const { data, error } = await supabase
    .from('attendance_requests')
    .insert({ requester_id: requesterId, status_key: statusKey, status_label: statusLabel, request_date: date || null, note })
    .select()
    .single();
  if (error) { console.error('Failed to submit attendance request:', error); return null; }
  return data;
}

export async function fetchAllAttendanceRequests() {
  if (!isLive) return [];
  const { data } = await supabase
    .from('attendance_requests')
    .select('*, requester:requester_id(full_name, email)')
    .order('created_at', { ascending: false });
  return data || [];
}

export async function decideAttendanceRequestRemote(request, status) {
  if (!isLive) return;
  await supabase.from('attendance_requests').update({ status }).eq('id', request.id);
  createNotification({
    userId: request.requester_id,
    title: status === 'Approved'
      ? `Yêu cầu "${request.status_label}" đã được duyệt`
      : `Yêu cầu "${request.status_label}" đã bị từ chối`,
    link: 'attendance-log',
  });
}

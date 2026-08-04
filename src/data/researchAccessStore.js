/**
 * Access requests for Research List resources — either a single task
 * (resource_type 'task', resource_id = the row's id) or a whole Research
 * Unit (resource_type 'unit', resource_id = the unit name). Anyone can
 * request; only the Research Head or a top admin (`can_manage_group('Nghiên
 * cứu Khoa học')`, enforced server-side via RLS) can approve/deny — that's
 * also how the Head "grants" access on their own initiative: inserting a
 * request pre-approved for someone else.
 */
import { supabase, isLive } from '../lib/supabaseClient.js';

const GROUP = 'Nghiên cứu Khoa học';

export async function canManageResearchAccess() {
  if (!isLive) return false;
  const { data, error } = await supabase.rpc('can_manage_group', { target_group: GROUP });
  return !error && Boolean(data);
}

/** Every request/grant involving the given user (any status) — used to
 * decide what a "Request Access" button should show for one resource. */
export async function fetchMyResearchAccess(userId) {
  if (!isLive || !userId) return [];
  const { data, error } = await supabase
    .from('research_access_requests')
    .select('*')
    .eq('requested_by', userId);
  if (error || !data) return [];
  return data;
}

/** Every request (any requester) — for the Head/admin review panel. RLS
 * only lets this actually return rows when the caller can manage the group. */
export async function fetchAllResearchAccessRequests() {
  if (!isLive) return [];
  const { data, error } = await supabase
    .from('research_access_requests')
    .select('*, requester:requested_by(full_name, email)')
    .order('created_at', { ascending: false });
  if (error || !data) return [];
  return data;
}

export async function requestResearchAccess({ userId, resourceType, resourceId, resourceLabel, reason }) {
  if (!isLive) throw new Error('Supabase is not configured — cannot request access.');
  const { error } = await supabase.from('research_access_requests').insert({
    requested_by: userId,
    resource_type: resourceType,
    resource_id: String(resourceId),
    resource_label: resourceLabel,
    reason: reason || null,
  });
  if (error) throw error;
}

export async function decideResearchAccess(id, status, decidedByUserId) {
  if (!isLive) throw new Error('Supabase is not configured — cannot save.');
  const { error } = await supabase
    .from('research_access_requests')
    .update({ status, decided_by: decidedByUserId, decided_at: new Date().toISOString() })
    .eq('id', id);
  if (error) throw error;
}

export async function deleteResearchAccessRequest(id) {
  if (!isLive) throw new Error('Supabase is not configured — cannot delete.');
  const { error } = await supabase.from('research_access_requests').delete().eq('id', id);
  if (error) throw error;
}

/** True when `requests` (from fetchMyResearchAccess) already has an
 * approved grant for this exact resource. */
export function hasApprovedAccess(requests, resourceType, resourceId) {
  return requests.some((r) =>
    r.resource_type === resourceType && r.resource_id === String(resourceId) && r.status === 'approved');
}

/** The most recent request status for this resource ('pending'/'denied'), or null if never requested. */
export function myRequestStatus(requests, resourceType, resourceId) {
  const mine = requests.find((r) => r.resource_type === resourceType && r.resource_id === String(resourceId));
  return mine ? mine.status : null;
}

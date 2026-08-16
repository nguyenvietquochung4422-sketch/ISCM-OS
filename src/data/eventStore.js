/**
 * Event Attendance (Phase 3D) — public.iscm_events / event_participants.
 * A separate feature from the personal leave-type Attendance module
 * (attendance_records): events are meetings/workshops/orientations an
 * organizer invites specific members to, tracked as RSVP (before) +
 * check-in (at the event) rather than an approval workflow. The two
 * modules stay data-independent — the only bridge is a read-time
 * conflict check (getLeaveConflict) that cross-references a member's
 * already-approved leave against an event date, so a mandatory event
 * scheduled over someone's approved Annual Leave surfaces as a warning
 * instead of silently double-booking them.
 */
import { supabase, isLive } from '../lib/supabaseClient.js';
import { createNotification } from '../lib/notifications.js';
import { recordCoversDate } from './attendanceStore.js';

export const EVENT_TYPES = ['Meeting', 'Workshop', 'Conference', 'Orientation', 'Training', 'Other'];
export const RSVP_STATUSES = ['No Response', 'Going', 'Not Going', 'Maybe'];

/** Matches the established app convention (see attendance-log): the
    content_key an admin grants via Content Admin Permissions is the
    member-facing sidebar key this unlocks organizer/admin visibility
    into, not a separately-invented key. */
export async function canManageEvents() {
  if (!isLive) return false;
  const { data, error } = await supabase.rpc('can_manage_content', { key: 'my-events' });
  return !error && Boolean(data);
}

/** Every event, newest date first — visible to all signed-in accounts
    (event details aren't sensitive; who's attending is, and that's gated
    on event_participants instead). */
export async function fetchEvents() {
  if (!isLive) return [];
  const { data, error } = await supabase
    .from('iscm_events')
    .select('*, organizer:organizer_id(full_name, email)')
    .order('event_date', { ascending: false });
  if (error || !data) return [];
  return data;
}

export async function createEvent(fields, organizerFallbackId, audience) {
  if (!isLive) throw new Error('Supabase is not configured — cannot save.');
  const { data, error } = await supabase
    .from('iscm_events')
    .insert({ ...fields, organizer_id: fields.organizer_id || organizerFallbackId, created_by: organizerFallbackId })
    .select()
    .single();
  if (error) throw error;

  if (audience && audience.length > 0) {
    await addParticipants(data.id, audience, organizerFallbackId, data);
  }
  return data;
}

export async function cancelEvent(event, cancelledBy) {
  if (!isLive) throw new Error('Supabase is not configured — cannot cancel.');
  const { error } = await supabase.from('iscm_events').update({ status: 'Cancelled', updated_at: new Date().toISOString() }).eq('id', event.id);
  if (error) throw error;

  const participants = await fetchEventParticipants(event.id);
  participants.forEach((p) => {
    createNotification({
      userId: p.member_id,
      title: `Sự kiện đã bị huỷ — ${event.title}`,
      body: event.event_date,
      link: 'my-events',
      module: 'events', notificationType: 'event_cancelled',
      entityType: 'event', entityId: event.id,
      dedupeKey: `event_cancelled:${event.id}:${p.member_id}`,
    });
  });
  void cancelledBy; // kept for symmetry with other decide/cancel signatures; not stored (status change is enough)
}

/** Everyone invited to one event — the organizer/admin's participant list
    (RSVP + check-in state), joined with member display names. */
export async function fetchEventParticipants(eventId) {
  if (!isLive) return [];
  const { data, error } = await supabase
    .from('event_participants')
    .select('*, member:member_id(full_name, email)')
    .eq('event_id', eventId)
    .order('created_at');
  if (error || !data) return [];
  return data;
}

/** One member's own event list — every event they're a participant on,
    across past and future, for "My Events". */
export async function fetchMyEventParticipation(userId) {
  if (!isLive || !userId) return [];
  const { data, error } = await supabase
    .from('event_participants')
    .select('*, event:event_id(*, organizer:organizer_id(full_name, email))')
    .eq('member_id', userId)
    .order('created_at', { ascending: false });
  if (error || !data) return [];
  return data;
}

/** Invites memberIds to an event — inserts participant rows and notifies
    each. Ignores members already invited (unique(event_id, member_id))
    rather than erroring the whole batch. */
export async function addParticipants(eventId, memberIds, organizerId, eventForNotification) {
  if (!isLive) throw new Error('Supabase is not configured — cannot save.');
  const rows = memberIds.map((memberId) => ({ event_id: eventId, member_id: memberId }));
  const { data, error } = await supabase.from('event_participants').upsert(rows, { onConflict: 'event_id,member_id', ignoreDuplicates: true }).select();
  if (error) throw error;

  const event = eventForNotification || (await supabase.from('iscm_events').select('*').eq('id', eventId).single()).data;
  (data || []).forEach((p) => {
    createNotification({
      userId: p.member_id,
      title: `Bạn được mời tham gia — ${event?.title || ''}`,
      body: event?.event_date,
      link: 'my-events',
      module: 'events', notificationType: 'event_invited',
      entityType: 'event', entityId: eventId,
      dedupeKey: `event_invited:${eventId}:${p.member_id}`,
    });
  });
  void organizerId;
  return data;
}

export async function submitRsvp(participantId, status, userId) {
  if (!isLive) throw new Error('Supabase is not configured — cannot save.');
  const { error } = await supabase
    .from('event_participants')
    .update({ rsvp_status: status, rsvp_at: new Date().toISOString() })
    .eq('id', participantId)
    .eq('member_id', userId);
  if (error) throw error;
}

export async function checkInParticipant(participantId, adminId) {
  if (!isLive) throw new Error('Supabase is not configured — cannot save.');
  const { error } = await supabase
    .from('event_participants')
    .update({ checked_in: true, checked_in_at: new Date().toISOString(), checked_in_by: adminId })
    .eq('id', participantId);
  if (error) throw error;
}

export async function undoCheckIn(participantId) {
  if (!isLive) throw new Error('Supabase is not configured — cannot save.');
  const { error } = await supabase
    .from('event_participants')
    .update({ checked_in: false, checked_in_at: null, checked_in_by: null })
    .eq('id', participantId);
  if (error) throw error;
}

/** Does this member already have an Approved Annual Leave / Absence
    covering the event's date? Purely a read-time check over data the
    Attendance module already owns — events don't store or duplicate any
    leave state. Returns the conflicting record, or null. */
export function getLeaveConflict(attendanceRecords, memberId, eventDate) {
  return attendanceRecords.find((r) =>
    r.member_id === memberId
    && r.approval_status === 'Approved'
    && (r.attendance_type === 'Annual Leave' || r.attendance_type === 'Absence')
    && recordCoversDate(r, eventDate)) || null;
}

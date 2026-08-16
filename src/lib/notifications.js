import { supabase, isLive } from './supabaseClient.js';

/** Fetch the most recent notifications for a signed-in user. */
export async function fetchNotifications(userId, limit = 20) {
  if (!isLive || !userId) return [];
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) {
    console.error('Failed to fetch notifications:', error);
    return [];
  }
  return data;
}

export async function markNotificationRead(id) {
  if (!isLive) return;
  await supabase.from('notifications').update({ is_read: true, read_at: new Date().toISOString() }).eq('id', id);
}

export async function markAllNotificationsRead(userId) {
  if (!isLive || !userId) return;
  await supabase.from('notifications').update({ is_read: true, read_at: new Date().toISOString() }).eq('user_id', userId).eq('is_read', false);
}

/** Create a notification for another (or the same) user — e.g. after granting
 * a permission or deciding an approval. Silently no-ops in demo mode.
 *
 * `link` is a dashboard `selected` key (e.g. 'attendance-log') the bell's
 * click handler navigates to — the same convention every module already
 * uses. `module`/`notificationType`/`entityType`/`entityId` are optional
 * enrichment (Phase 3C) so a click can deep-link to one specific record,
 * not just the module's landing tab; omit them for a plain module-level
 * notification exactly like the pre-3C call sites still do.
 *
 * `dedupeKey`, if given, makes the insert idempotent per-recipient (backed
 * by a partial unique index on (user_id, dedupe_key)) — a retried action or
 * a double-click can't produce two copies of the same notification. A
 * unique-violation from that index is treated as a successful no-op, not
 * an error.
 */
export async function createNotification({
  userId, title, body = null, link = null,
  module = null, notificationType = null, entityType = null, entityId = null,
  metadata = null, dedupeKey = null,
}) {
  if (!isLive || !userId) return;
  const { error } = await supabase.from('notifications').insert({
    user_id: userId, title, body, link,
    module, notification_type: notificationType,
    entity_type: entityType, entity_id: entityId ? String(entityId) : null,
    metadata, dedupe_key: dedupeKey,
  });
  if (error && error.code !== '23505') console.error('Failed to create notification:', error);
}

/** Unread count only — cheaper than fetching full rows when a caller just
    needs the badge number (e.g. a header that hasn't opened the dropdown). */
export async function getUnreadCount(userId) {
  if (!isLive || !userId) return 0;
  const { count, error } = await supabase
    .from('notifications')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('is_read', false);
  if (error) return 0;
  return count || 0;
}

/** Subscribe to realtime inserts of notifications for a given user.
 * Returns an unsubscribe function. */
export function subscribeToNotifications(userId, onInsert) {
  if (!isLive || !userId) return () => {};
  const channel = supabase
    .channel(`notifications-${userId}`)
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${userId}` },
      (payload) => onInsert(payload.new)
    )
    .subscribe();
  return () => supabase.removeChannel(channel);
}

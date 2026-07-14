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
  await supabase.from('notifications').update({ is_read: true }).eq('id', id);
}

export async function markAllNotificationsRead(userId) {
  if (!isLive || !userId) return;
  await supabase.from('notifications').update({ is_read: true }).eq('user_id', userId).eq('is_read', false);
}

/** Create a notification for another (or the same) user — e.g. after granting
 * a permission or deciding an approval. Silently no-ops in demo mode. */
export async function createNotification({ userId, title, body = null, link = null }) {
  if (!isLive || !userId) return;
  const { error } = await supabase.from('notifications').insert({ user_id: userId, title, body, link });
  if (error) console.error('Failed to create notification:', error);
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

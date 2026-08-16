/**
 * Real (Supabase-backed) library borrow/return + location tracking, used by
 * admins/permitted members inside the Order Book/Documents Form. Complements
 * (does not replace) the local-only demo flow in libraryStore.js — when the
 * app is live and the member is signed in, requests are written for real so
 * these admin views have real data to show.
 */
import { supabase, isLive } from '../lib/supabaseClient.js';
import { createNotification } from '../lib/notifications.js';

export async function canManageLibrary() {
  if (!isLive) return false;
  const { data, error } = await supabase.rpc('can_manage_content', { key: 'form:order-book' });
  return !error && Boolean(data);
}

export async function submitBorrowRequestRemote({ itemId, itemTitle, pickupDate, dueDate, note, requesterId }) {
  if (!isLive || !requesterId) return null;
  const { data, error } = await supabase
    .from('library_requests')
    .insert({ item_id: itemId, item_title: itemTitle, requester_id: requesterId, pickup_date: pickupDate, due_date: dueDate, note })
    .select()
    .single();
  if (error) { console.error('Failed to submit borrow request:', error); return null; }
  return data;
}

export async function fetchMyRequests(userId) {
  if (!isLive || !userId) return [];
  const { data } = await supabase.from('library_requests').select('*').eq('requester_id', userId).order('created_at', { ascending: false });
  return data || [];
}

export async function fetchAllRequests() {
  if (!isLive) return [];
  const { data } = await supabase
    .from('library_requests')
    .select('*, requester:requester_id(full_name, email)')
    .order('created_at', { ascending: false });
  return data || [];
}

export async function fetchAllCheckouts() {
  if (!isLive) return [];
  const { data } = await supabase
    .from('library_checkouts')
    .select('*, borrower:borrower_id(full_name, email)')
    .order('checked_out', { ascending: false });
  return data || [];
}

/** Approve/reject a pending request; approval opens a real checkout row and notifies the requester. */
export async function decideRequestRemote(request, status) {
  if (!isLive) return;
  await supabase.from('library_requests').update({ status }).eq('id', request.id);

  if (status === 'Approved') {
    await supabase.from('library_checkouts').insert({
      item_id: request.item_id,
      item_title: request.item_title,
      borrower_id: request.requester_id,
      checked_out: request.pickup_date,
      due: request.due_date,
    });
  }

  createNotification({
    userId: request.requester_id,
    title: status === 'Approved'
      ? `Yêu cầu mượn "${request.item_title}" đã được duyệt`
      : `Yêu cầu mượn "${request.item_title}" đã bị từ chối`,
    link: 'form:order-book',
  });
}

export async function returnCheckoutRemote(checkout) {
  if (!isLive) return;
  await supabase.from('library_checkouts').update({ returned: true, returned_at: new Date().toISOString() }).eq('id', checkout.id);
  // Returning defaults the item back to its home shelf until someone updates it again.
  await upsertItemLocation(checkout.item_id, 'Kệ sách - Văn phòng ISCM', checkout.borrower_id);
}

export async function fetchItemLocation(itemId) {
  if (!isLive) return null;
  const { data } = await supabase.from('library_item_locations').select('*, updater:updated_by(full_name)').eq('item_id', itemId).maybeSingle();
  return data;
}

export async function fetchAllLocations() {
  if (!isLive) return {};
  const { data } = await supabase.from('library_item_locations').select('*, updater:updated_by(full_name)');
  const map = {};
  (data || []).forEach((row) => { map[row.item_id] = row; });
  return map;
}

export async function upsertItemLocation(itemId, location, userId) {
  if (!isLive || !userId) return null;
  const { data, error } = await supabase
    .from('library_item_locations')
    .upsert({ item_id: itemId, location, updated_by: userId, updated_at: new Date().toISOString() })
    .select()
    .single();
  if (error) { console.error('Failed to update item location:', error); return null; }
  return data;
}

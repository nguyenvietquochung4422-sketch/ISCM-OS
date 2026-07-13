/**
 * Library borrow-return lifecycle (localStorage-backed):
 *   request (pending) -> approve -> checkout (with due date) -> return
 * Mirrors the equipment checkout pattern already used for lab gear, but
 * scoped to LIBRARY_ITEMS/book copies.
 */
import { LIBRARY_ITEMS, LOAN_DAYS } from './libraryData.js';
import { updateSubmissionStatus } from './formSubmissions.js';

const CHECKOUTS_KEY = 'iscm_library_checkouts_v1';
const PENDING_KEY = 'iscm_library_pending_v1';

const today = () => new Date().toISOString().slice(0, 10);

export function loadCheckouts() {
  try { return JSON.parse(localStorage.getItem(CHECKOUTS_KEY) || '[]'); } catch { return []; }
}
function saveCheckouts(list) {
  localStorage.setItem(CHECKOUTS_KEY, JSON.stringify(list));
}

export function loadPendingRequests() {
  try { return JSON.parse(localStorage.getItem(PENDING_KEY) || '[]'); } catch { return []; }
}
function savePendingRequests(list) {
  localStorage.setItem(PENDING_KEY, JSON.stringify(list));
}

/** Physical copies still free to request (null if the title has no print edition). */
export function physicalAvailable(itemId) {
  const item = LIBRARY_ITEMS.find((i) => i.id === itemId);
  if (!item?.physical) return null;
  const out = loadCheckouts().filter((c) => c.itemId === itemId && !c.returned).length;
  const pending = loadPendingRequests().filter((p) => p.itemId === itemId && p.status === 'Open').length;
  return Math.max(0, item.physical.totalCopies - out - pending);
}

/** Creates a pending borrow request, sharing its id with the My Forms submission entry. Pickup/due dates are chosen by the borrower. */
export function createBorrowRequest({ id, itemId, itemTitle, pickupDate, dueDate, note = '', requester = 'You' }) {
  const entry = {
    id, itemId, itemTitle,
    pickupDate: pickupDate || today(),
    dueDate: dueDate || new Date(Date.now() + LOAN_DAYS * 86400000).toISOString().slice(0, 10),
    note, requester, date: today(), status: 'Open',
  };
  savePendingRequests([entry, ...loadPendingRequests()]);
  return entry;
}

/** Approve/reject a pending request; approval opens a checkout using the borrower's chosen pickup/due dates. */
export function decidePendingRequest(id, status) {
  const list = loadPendingRequests();
  const req = list.find((r) => r.id === id);
  if (!req) return;
  savePendingRequests(list.map((r) => (r.id === id ? { ...r, status } : r)));
  updateSubmissionStatus(id, status);

  if (status === 'Approved') {
    const checkedOut = req.pickupDate || today();
    const due = req.dueDate || new Date(new Date(checkedOut).getTime() + LOAN_DAYS * 86400000).toISOString().slice(0, 10);
    saveCheckouts([...loadCheckouts(), {
      id: `libco-${Date.now()}`,
      itemId: req.itemId,
      itemTitle: req.itemTitle,
      checked_out: checkedOut,
      due,
      returned: false,
    }]);
  }
}

export function returnCheckout(id) {
  saveCheckouts(loadCheckouts().map((c) => (c.id === id ? { ...c, returned: true } : c)));
}

import { useEffect, useState } from 'react';
import { Check, Clock, MapPin, X } from 'lucide-react';
import { LIBRARY_ITEMS } from '../../data/libraryData.js';
import {
  fetchAllRequests, fetchAllCheckouts, decideRequestRemote, returnCheckoutRemote,
  fetchAllLocations, upsertItemLocation,
} from '../../data/libraryAdmin.js';
import { useAuth } from '../../auth/AuthContext.jsx';

const TABS = [
  { key: 'requests', vi: 'Yêu cầu mượn', en: 'Borrow requests' },
  { key: 'checkouts', vi: 'Đang mượn', en: 'Currently checked out' },
  { key: 'history', vi: 'Lịch sử mượn trả', en: 'Borrow/return history' },
  { key: 'locations', vi: 'Vị trí sách', en: 'Item locations' },
];

function fmtDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('vi-VN');
}

function fmtWhen(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('vi-VN');
}

export default function LibraryAdminPanel({ lang }) {
  const { user: authUser } = useAuth();
  const [tab, setTab] = useState('requests');
  const [requests, setRequests] = useState([]);
  const [checkouts, setCheckouts] = useState([]);
  const [locations, setLocations] = useState({});
  const [loading, setLoading] = useState(true);
  const [editingLocation, setEditingLocation] = useState(null); // itemId
  const [locationDraft, setLocationDraft] = useState('');

  const reload = async () => {
    setLoading(true);
    const [r, c, l] = await Promise.all([fetchAllRequests(), fetchAllCheckouts(), fetchAllLocations()]);
    setRequests(r);
    setCheckouts(c);
    setLocations(l);
    setLoading(false);
  };

  useEffect(() => { reload(); }, []);

  const handleDecide = async (req, status) => {
    setRequests((prev) => prev.map((r) => (r.id === req.id ? { ...r, status } : r)));
    await decideRequestRemote(req, status);
    reload();
  };

  const handleReturn = async (checkout) => {
    setCheckouts((prev) => prev.map((c) => (c.id === checkout.id ? { ...c, returned: true } : c)));
    await returnCheckoutRemote(checkout);
    reload();
  };

  const startEditLocation = (itemId) => {
    setEditingLocation(itemId);
    setLocationDraft(locations[itemId]?.location || '');
  };

  const saveLocation = async (itemId) => {
    if (!locationDraft.trim()) return;
    await upsertItemLocation(itemId, locationDraft.trim(), authUser.id);
    setEditingLocation(null);
    reload();
  };

  const pendingRequests = requests.filter((r) => r.status === 'Open');
  const decidedRequests = requests.filter((r) => r.status !== 'Open');
  const activeCheckouts = checkouts.filter((c) => !c.returned);
  const physicalItems = LIBRARY_ITEMS.filter((i) => i.physical);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-1.5 border-b border-neutral-200 pb-2">
        {TABS.map((t) => (
          <button key={t.key} type="button" onClick={() => setTab(t.key)}
            className={`border px-2.5 py-1 font-sans text-[10px] font-bold uppercase tracking-wide transition-colors ${
              tab === t.key ? 'border-[#990000] bg-[#990000] text-white' : 'border-neutral-300 text-neutral-600 hover:border-[#990000]'
            }`}>
            {lang === 'vi' ? t.vi : t.en}
            {t.key === 'requests' && pendingRequests.length > 0 && (
              <span className="ml-1.5 rounded-full bg-white/20 px-1.5 py-0.5 text-[9px]">{pendingRequests.length}</span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="p-6 text-center font-sans text-xs text-neutral-400">{lang === 'vi' ? 'Đang tải...' : 'Loading...'}</div>
      ) : (
        <>
          {tab === 'requests' && (
            <div className="space-y-3">
              {pendingRequests.length === 0 && (
                <p className="p-4 text-center font-sans text-xs text-neutral-400">{lang === 'vi' ? 'Không có yêu cầu chờ duyệt.' : 'No pending requests.'}</p>
              )}
              <ul className="space-y-1.5">
                {pendingRequests.map((r) => (
                  <li key={r.id} className="flex flex-col gap-1.5 border border-neutral-200 p-2.5 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <p className="font-sans text-xs font-semibold text-neutral-800 truncate">{r.item_title}</p>
                      <p className="font-sans text-[10px] text-neutral-500">
                        {r.requester?.full_name || r.requester_id} · {fmtDate(r.pickup_date)} → {fmtDate(r.due_date)}
                      </p>
                      {r.note && <p className="font-sans text-[10px] text-neutral-400 italic">{r.note}</p>}
                    </div>
                    <div className="flex gap-1.5 shrink-0">
                      <button onClick={() => handleDecide(r, 'Approved')} className="flex items-center gap-1 border border-emerald-300 bg-emerald-50 px-2 py-1 font-sans text-[10px] font-bold uppercase text-emerald-700 hover:bg-emerald-100">
                        <Check className="h-3 w-3" /> {lang === 'vi' ? 'Duyệt' : 'Approve'}
                      </button>
                      <button onClick={() => handleDecide(r, 'Rejected')} className="flex items-center gap-1 border border-red-300 bg-red-50 px-2 py-1 font-sans text-[10px] font-bold uppercase text-red-700 hover:bg-red-100">
                        <X className="h-3 w-3" /> {lang === 'vi' ? 'Từ chối' : 'Reject'}
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {tab === 'checkouts' && (
            <ul className="space-y-1.5">
              {activeCheckouts.length === 0 && (
                <p className="p-4 text-center font-sans text-xs text-neutral-400">{lang === 'vi' ? 'Không có ai đang mượn sách.' : 'No active checkouts.'}</p>
              )}
              {activeCheckouts.map((c) => (
                <li key={c.id} className="flex flex-col gap-1 border border-neutral-200 p-2.5 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <p className="font-sans text-xs font-semibold text-neutral-800 truncate">{c.item_title}</p>
                    <p className="font-sans text-[10px] text-neutral-500">
                      {lang === 'vi' ? 'Đang giữ:' : 'Held by:'} <strong>{c.borrower?.full_name || c.borrower_id}</strong> · {fmtDate(c.checked_out)} → {fmtDate(c.due)}
                    </p>
                  </div>
                  <button onClick={() => handleReturn(c)} className="shrink-0 border border-neutral-300 px-2 py-1 font-sans text-[10px] font-bold uppercase text-neutral-600 hover:border-[#990000] hover:text-[#990000]">
                    {lang === 'vi' ? 'Đánh dấu đã trả' : 'Mark returned'}
                  </button>
                </li>
              ))}
            </ul>
          )}

          {tab === 'history' && (
            <ul className="space-y-1">
              {[...checkouts, ...decidedRequests.filter((r) => r.status === 'Rejected')]
                .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
                .map((row) => {
                  const isCheckout = 'borrower_id' in row;
                  return (
                    <li key={row.id} className="flex items-center gap-2 border-b border-neutral-100 py-1.5 font-sans text-[11px]">
                      <Clock className="h-3 w-3 shrink-0 text-neutral-400" />
                      <span className="min-w-0 flex-1 truncate text-neutral-700">{row.item_title}</span>
                      <span className="shrink-0 text-neutral-400">
                        {isCheckout ? (row.borrower?.full_name || row.borrower_id) : (row.requester?.full_name || row.requester_id)}
                      </span>
                      <span className={`shrink-0 border px-1.5 py-0.5 text-[9px] font-bold uppercase ${
                        isCheckout
                          ? (row.returned ? 'border-neutral-300 text-neutral-500' : 'border-blue-300 bg-blue-50 text-blue-700')
                          : 'border-red-300 bg-red-50 text-red-700'
                      }`}>
                        {isCheckout ? (row.returned ? (lang === 'vi' ? 'Đã trả' : 'Returned') : (lang === 'vi' ? 'Đang mượn' : 'Out')) : (lang === 'vi' ? 'Từ chối' : 'Rejected')}
                      </span>
                    </li>
                  );
                })}
              {checkouts.length === 0 && decidedRequests.length === 0 && (
                <p className="p-4 text-center font-sans text-xs text-neutral-400">{lang === 'vi' ? 'Chưa có lịch sử.' : 'No history yet.'}</p>
              )}
            </ul>
          )}

          {tab === 'locations' && (
            <div className="space-y-1.5">
              <p className="font-sans text-[10px] text-neutral-400">
                {lang === 'vi'
                  ? 'Vị trí do chính người đang giữ sách tự cập nhật — bất kỳ ai cũng có thể sửa nếu biết sách đang ở đâu.'
                  : 'Locations are self-reported by whoever currently has the item — anyone can correct it if they know where a copy is.'}
              </p>
              <ul className="space-y-1">
                {physicalItems.map((item) => {
                  const loc = locations[item.id];
                  const stale = loc && (Date.now() - new Date(loc.updated_at).getTime()) > 90 * 86400000;
                  return (
                    <li key={item.id} className="flex flex-col gap-1 border border-neutral-200 p-2 sm:flex-row sm:items-center sm:justify-between">
                      <span className="min-w-0 flex-1 truncate font-sans text-[11px] font-semibold text-neutral-800">{item.title}</span>
                      {editingLocation === item.id ? (
                        <div className="flex items-center gap-1.5">
                          <input autoFocus value={locationDraft} onChange={(e) => setLocationDraft(e.target.value)}
                            placeholder={lang === 'vi' ? 'VD: Phòng CoLab, kệ 3' : 'e.g. CoLab Room, shelf 3'}
                            className="border border-neutral-300 px-2 py-1 font-sans text-[11px] focus:border-[#990000] focus:outline-none" />
                          <button onClick={() => saveLocation(item.id)} className="border border-emerald-300 bg-emerald-50 p-1 text-emerald-700 hover:bg-emerald-100"><Check className="h-3 w-3" /></button>
                          <button onClick={() => setEditingLocation(null)} className="border border-neutral-300 p-1 text-neutral-500"><X className="h-3 w-3" /></button>
                        </div>
                      ) : (
                        <button onClick={() => startEditLocation(item.id)} className="flex items-center gap-1.5 font-sans text-[10px] text-neutral-600 hover:text-[#990000] shrink-0">
                          <MapPin className="h-3 w-3 shrink-0" />
                          {loc ? (
                            <span className={stale ? 'text-amber-600' : ''}>
                              {loc.location} <span className="text-neutral-400">· {loc.updater?.full_name || ''} · {fmtWhen(loc.updated_at)}</span>
                              {stale && ` (${lang === 'vi' ? 'chưa cập nhật lâu' : 'stale'})`}
                            </span>
                          ) : (
                            <span className="italic text-neutral-400">{lang === 'vi' ? 'Chưa rõ vị trí — bấm để cập nhật' : 'Unknown — click to set'}</span>
                          )}
                        </button>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  );
}

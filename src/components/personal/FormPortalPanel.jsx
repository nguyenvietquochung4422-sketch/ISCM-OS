import { useMemo, useState, useEffect } from 'react';
import {
  FileText, ArrowLeft, CheckCircle2, XCircle, AlertTriangle, Send, BookOpen, ExternalLink, Check,
  ShoppingCart, X, ChevronLeft, ChevronRight, Search, MapPin, ArrowRight, Minus, Plus,
} from 'lucide-react';
import { FORM_GROUPS, FORM_BY_KEY } from '../../data/formPortal.js';
import { isNameCompliant } from '../../data/wikiHub.js';
import { useLanguage } from '../../i18n/LanguageContext.jsx';
import { saveSubmission } from '../../data/formSubmissions.js';
import { LIBRARY_ITEMS, LOAN_DAYS } from '../../data/libraryData.js';
import { physicalAvailable, createBorrowRequest } from '../../data/libraryStore.js';
import { submitBorrowRequestRemote, canManageLibrary, fetchItemLocation, upsertItemLocation } from '../../data/libraryAdmin.js';
import LibraryAdminPanel from './LibraryAdminPanel.jsx';
import { supabase, isLive } from '../../lib/supabaseClient.js';
import { useAuth } from '../../auth/AuthContext.jsx';

// Digital items either carry a plain external `url`, or a Supabase Storage
// `{ bucket, path }` — the latter needs a short-lived signed URL fetched
// on demand since the bucket is private (Google-sign-in-gated members only).
async function resolveDigitalUrl(digital) {
  if (digital.url) return digital.url;
  if (digital.bucket && digital.path) {
    const { data, error } = await supabase.storage.from(digital.bucket).createSignedUrl(digital.path, 3600);
    if (error) throw error;
    return data.signedUrl;
  }
  return null;
}

export { loadSubmissions } from '../../data/formSubmissions.js';

const CAT_BADGE = {
  HR: 'border border-blue-200 bg-blue-50 text-blue-800',
  IT: 'border border-emerald-200 bg-emerald-50 text-emerald-800',
  FA: 'border border-amber-200 bg-amber-50 text-amber-800',
  RM: 'border border-purple-200 bg-purple-50 text-purple-800',
  AF: 'border border-slate-300 bg-slate-100 text-slate-700',
};

/* ---------------- Grid view ---------------- */

export function FormPortalGrid({ categoryFilter = 'All', onOpenForm }) {
  const { lang } = useLanguage();
  const [query, setQuery] = useState('');
  const groups = useMemo(() => {
    const q = query.trim().toLowerCase();
    return FORM_GROUPS
      .map((g) => ({
        ...g,
        forms: g.forms.filter((f) =>
          (categoryFilter === 'All' || f.cat === categoryFilter) &&
          (!q || f.label.toLowerCase().includes(q) || f.desc.toLowerCase().includes(q))
        ),
      }))
      .filter((g) => g.forms.length > 0);
  }, [categoryFilter, query]);

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={lang === 'vi' ? 'Tìm biểu mẫu theo tên hoặc mô tả...' : 'Search forms by name or description...'}
          className="w-full rounded-none border border-neutral-300 bg-white py-1.5 pl-8 pr-2.5 font-sans text-xs focus:border-neutral-900 focus:outline-none"
        />
      </div>
      {groups.map((g) => (
        <section key={g.id} className="border border-neutral-200 p-3 bg-white">
          <h3 className="mb-3 font-sans text-xs font-bold uppercase tracking-wider text-neutral-900 border-b border-neutral-100 pb-1">
            {g.label}
          </h3>
          <div className="grid gap-2 sm:grid-cols-2">
            {g.forms.map((f) => (
              <button
                key={f.key}
                onClick={() => onOpenForm(f.key)}
                className="border border-neutral-200 hover:border-[#990000] p-2.5 text-left flex items-start gap-2 bg-neutral-50 transition-colors rounded-none"
              >
                <FileText className="mt-0.5 h-3.5 w-3.5 shrink-0 text-neutral-500" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-sans text-xs font-bold text-neutral-800">{f.label}</span>
                  <span className="block font-sans text-[10px] leading-tight text-neutral-500 mt-0.5">{f.desc}</span>
                </span>
                <span className={`badge shrink-0 !px-1 !py-0.2 !text-[9px] font-bold rounded-none ${CAT_BADGE[f.cat] || 'border border-neutral-300 text-neutral-600 bg-neutral-100'}`}>
                  {f.cat}
                </span>
              </button>
            ))}
          </div>
        </section>
      ))}
      {groups.length === 0 && (
        <p className="py-8 text-center font-sans text-xs text-neutral-400">
          {lang === 'vi' ? 'Không có biểu mẫu nào khớp bộ lọc.' : 'No forms match this category filter.'}
        </p>
      )}
    </div>
  );
}

/* ---------------- Special validation blocks ---------------- */

const inputClass =
  'w-full rounded-none border border-neutral-300 bg-white px-2 py-1.5 font-sans text-xs focus:border-neutral-900 focus:outline-none';

function ValidationNote({ ok, okText, badText }) {
  return ok === null ? null : (
    <p className={`flex items-center gap-1.5 px-2 py-1 font-sans text-[10px] rounded-none border ${
      ok ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-red-50 border-red-200 text-red-800'
    }`}>
      {ok ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
      {ok ? okText : badText}
    </p>
  );
}

function OvertimeBlock({ onValid, lang }) {
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const outside = start && end ? (end <= '07:30' || start >= '17:00') : null;
  const check = (s, e) => { if (s && e) onValid(e <= '07:30' || s >= '17:00'); };
  return (
    <div className="space-y-2">
      <div className="grid grid-cols-2 gap-2">
        <label className="font-sans text-[10px] text-neutral-500">
          {lang === 'vi' ? 'Bắt đầu' : 'Start'}
          <input type="time" value={start} className={inputClass} onChange={(e) => { setStart(e.target.value); check(e.target.value, end); }} />
        </label>
        <label className="font-sans text-[10px] text-neutral-500">
          {lang === 'vi' ? 'Kết thúc' : 'End'}
          <input type="time" value={end} className={inputClass} onChange={(e) => { setEnd(e.target.value); check(start, e.target.value); }} />
        </label>
      </div>
      <ValidationNote ok={outside}
        okText={lang === 'vi' ? 'Hợp lệ: khung giờ nằm ngoài giờ hành chính 07:30–17:00.' : 'Valid: timeframe is outside standard office hours 07:30–17:00.'}
        badText={lang === 'vi' ? 'Overtime phải nằm ngoài khung 07:30–17:00.' : 'Overtime must be OUTSIDE 07:30–17:00 — standard working hours are inside this timeframe.'} />
    </div>
  );
}

function NamingBlock({ onValid, lang }) {
  const [name, setName] = useState('');
  const ok = name ? isNameCompliant(name) : null;
  return (
    <div className="space-y-2">
      <input value={name} 
        placeholder={lang === 'vi' ? 'Tên file đính kèm, ví dụ: [2026-07-05][HCMC-Atlas][Contract Draft].docx' : 'Attachment file name, e.g.: [2026-07-05][HCMC-Atlas][Contract Draft].docx'}
        className={inputClass}
        onChange={(e) => { setName(e.target.value); onValid(isNameCompliant(e.target.value)); }} />
      <ValidationNote ok={ok}
        okText={lang === 'vi' ? 'Đặt tên tệp đúng chuẩn.' : 'Compliant: [Date][Project Name][Document Title] ✔'}
        badText={lang === 'vi' ? 'Sai chuẩn đặt tên — bắt buộc [Date][Project Name][Document Title].' : 'Invalid naming format — must use [Date][Project Name][Document Title].'} />
    </div>
  );
}

function HandoverBlock({ onValid, lang }) {
  const items = lang === 'vi' ? [
    'Bàn giao dữ liệu nghiên cứu (100%)', 
    'Bàn giao mã nguồn & notebooks', 
    'Chuyển quyền sở hữu Drive/Thư mục', 
    'Hoàn trả thiết bị phòng lab'
  ] : [
    'Research data handover (100%)', 
    'Source code & notebooks transfer', 
    'Drive/folder ownership transfer', 
    'Return lab equipment'
  ];
  const [done, setDone] = useState({});
  const count = Object.values(done).filter(Boolean).length;
  return (
    <div className="space-y-2">
      {items.map((t) => (
        <label key={t} className="flex items-center gap-2 font-sans text-[11px]">
          <input type="checkbox" className="accent-[#990000] rounded-none"
            onChange={(e) => { const next = { ...done, [t]: e.target.checked }; setDone(next); onValid(Object.values(next).filter(Boolean).length === items.length); }} />
          {t}
        </label>
      ))}
      <div className="h-2 rounded-none bg-neutral-100">
        <div className="h-full bg-[#990000] transition-all" style={{ width: `${(count / items.length) * 100}%` }} />
      </div>
      <p className="font-sans text-[10px] text-neutral-500">
        {count} / {items.length} {lang === 'vi' ? 'hoàn tất — yêu cầu 100% trước khi gửi.' : 'completed — 100% required before submitting.'}
      </p>
    </div>
  );
}

function PaymentBlock({ onValid, lang }) {
  const [flow, setFlow] = useState('');
  const FLOWS = lang === 'vi' ? [
    { v: '1', label: 'Flow 1 — Cá nhân tự thanh toán [Track 1 · UEH Standard]', track: 'Track 1 · UEH Standard' },
    { v: '2', label: 'Flow 2 — Thanh toán theo Dự án / Sự kiện [Track 1 · UEH Standard]', track: 'Track 1 · UEH Standard' },
    { v: '3', label: 'Flow 3 — Hệ thống vận hành O&F [Track 2 · Internal ISCM Fund]', track: 'Track 2 · Internal ISCM Fund' },
  ] : [
    { v: '1', label: 'Flow 1 — Individual self-payment [Track 1 · UEH Standard]', track: 'Track 1 · UEH Standard' },
    { v: '2', label: 'Flow 2 — Project / Event payment [Track 1 · UEH Standard]', track: 'Track 1 · UEH Standard' },
    { v: '3', label: 'Flow 3 — O&F Operation system [Track 2 · Internal ISCM Fund]', track: 'Track 2 · Internal ISCM Fund' },
  ];
  const sel = FLOWS.find((f) => f.v === flow);
  return (
    <div className="space-y-2">
      <select value={flow} className={inputClass} onChange={(e) => { setFlow(e.target.value); onValid(Boolean(e.target.value)); }}>
        <option value="">{lang === 'vi' ? '— Chọn financial flow —' : '— Select financial flow —'}</option>
        {FLOWS.map((f) => <option key={f.v} value={f.v}>{f.label}</option>)}
      </select>
      {sel && (
        <p className="border border-neutral-200 bg-neutral-50 px-2.5 py-1 text-neutral-800 text-[10px]">
          Routing: <strong>{sel.track}</strong>
        </p>
      )}
    </div>
  );
}

function TrainingBlock({ onValid, lang }) {
  const seminars = lang === 'vi' ? [
    ['Tham gia seminar nội bộ (Mục tiêu 80%)', '80% target'],
    ['Sự kiện cấp UEH (Yêu cầu 1/năm)', '1 required / year'],
    ['Sự kiện cấp ISCM (Yêu cầu 2/năm)', '2 required / year']
  ] : [
    ['Internal seminar attendance (80% target)', '80% target'],
    ['UEH-level events (1 required / year)', '1 required / year'],
    ['ISCM-level events (2 required / year)', '2 required / year']
  ];
  return (
    <div className="space-y-2">
      {seminars.map(([l, t]) => (
        <div key={l} className="flex items-center justify-between border border-neutral-200 bg-neutral-50 px-2 py-1 font-sans text-[10px] rounded-none">
          <span>{l}</span><span className="font-bold text-neutral-900">{t}</span>
        </div>
      ))}
      <select className={inputClass} defaultValue="" onChange={(e) => onValid(Boolean(e.target.value))}>
        <option value="">{lang === 'vi' ? '— Chọn buổi đào tạo / seminar —' : '— Select training / seminar session —'}</option>
        <option>Internal Seminar #14 — Space Syntax (29/07)</option>
        <option>GIS Training RU8.2 — Module 5 (05/08)</option>
        <option>UEH Research Methods Workshop (12/08)</option>
      </select>
    </div>
  );
}

function LabEquipBlock({ onValid, lang }) {
  return (
    <div className="space-y-2">
      <select className={inputClass} defaultValue="" onChange={(e) => onValid(Boolean(e.target.value))}>
        <option value="">{lang === 'vi' ? '— Chọn thiết bị —' : '— Select equipment —'}</option>
        <option>VR Headset — Quest Pro (Set B)</option>
        <option>DJI Mavic 3 Enterprise</option>
        <option>Spatial Computing Rig #1 (RTX 4090)</option>
      </select>
      <div className="grid grid-cols-2 gap-2">
        <input type="date" className={inputClass} /><input type="date" className={inputClass} />
      </div>
      <p className="font-sans text-[10px] text-neutral-400">
        {lang === 'vi' 
          ? 'Thiết bị đã nhận hiển thị tại mục Hồ Sơ Của Tôi → Tài sản & Thiết bị đang mượn.' 
          : 'Checked out equipment will appear under My Portal → My Assets Checked Out to Me.'}
      </p>
    </div>
  );
}

// Deterministic pastel-to-bold gradient "cover" per title — stands in for
// real cover art in a Tiki/Netflix-style grid without hotlinking images.
const COVER_PALETTE = [
  'from-rose-500 to-orange-400', 'from-sky-500 to-indigo-500', 'from-emerald-500 to-teal-400',
  'from-violet-500 to-fuchsia-500', 'from-amber-500 to-red-500', 'from-cyan-500 to-blue-500',
];
const coverGradient = (title) => {
  let h = 0;
  for (const c of title) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return COVER_PALETTE[h % COVER_PALETTE.length];
};

function CoverArt({ item, className = '' }) {
  const [broken, setBroken] = useState(false);
  if (item.coverUrl && !broken) {
    return (
      <img src={item.coverUrl} alt={item.title} onError={() => setBroken(true)}
        className={`aspect-[2/3] w-full shrink-0 object-cover ${className}`} />
    );
  }
  return (
    <div className={`flex aspect-[2/3] w-full shrink-0 items-center justify-center overflow-hidden bg-gradient-to-br p-1.5 ${coverGradient(item.title)} ${className}`}>
      <span className="line-clamp-4 text-center font-barlow text-[9px] font-black uppercase leading-tight text-white drop-shadow">
        {item.title}
      </span>
    </div>
  );
}

// Compact grid card — cover + title only. All actions & status live in the
// detail modal (opened on click) to keep the grid dense and scannable.
function LibraryCard({ item, inCart, onOpenDetail, lang }) {
  return (
    <button type="button" onClick={() => onOpenDetail(item)}
      className={`group relative flex flex-col border bg-white text-left transition-colors ${inCart ? 'border-[#990000] ring-1 ring-[#990000]' : 'border-neutral-200 hover:border-neutral-400'}`}>
      <div className="relative">
        <CoverArt item={item} />
        <span className="absolute left-0.5 top-0.5 rounded-sm bg-black/40 px-1 py-0.5 font-sans text-[7px] font-bold uppercase tracking-wide text-white">
          {item.category}
        </span>
        {inCart && (
          <span className="absolute right-0.5 top-0.5 rounded-full bg-[#990000] p-0.5 text-white"><Check className="h-2 w-2" /></span>
        )}
      </div>
      <div className="p-1.5">
        <p className="font-sans text-[10px] font-bold leading-tight text-neutral-900 line-clamp-2 group-hover:text-[#990000]">{item.title}</p>
        <p className="mt-0.5 font-sans text-[9px] text-neutral-400 line-clamp-1">{item.author}</p>
      </div>
    </button>
  );
}

// Big detail modal — title/author + a status table (bảng thông tin) plus
// the Borrow/Digital actions, opened when a card is clicked.
function LibraryDetailModal({ item, inCart, cartQty, onToggleCart, onUpdateQty, onOpenDigital, openedDigital, onClose, lang }) {
  const { user: authUser } = useAuth();
  const [resolvingDigital, setResolvingDigital] = useState(false);
  const avail = item.physical ? physicalAvailable(item.id) : null;
  const [qty, setQty] = useState(cartQty || 1);

  const handleQtyChange = (nextQty) => {
    setQty(nextQty);
    if (inCart) onUpdateQty(item.id, nextQty);
  };

  const [location, setLocation] = useState(null);
  const [editingLocation, setEditingLocation] = useState(false);
  const [locationDraft, setLocationDraft] = useState('');

  useEffect(() => {
    if (!isLive || !item.physical) { setLocation(null); return; }
    fetchItemLocation(item.id).then(setLocation);
  }, [item.id]);

  const saveLocation = async () => {
    if (!locationDraft.trim() || !authUser) return;
    const updated = await upsertItemLocation(item.id, locationDraft.trim(), authUser.id);
    if (updated) setLocation({ ...updated, updater: { full_name: authUser.user_metadata?.full_name || authUser.email } });
    setEditingLocation(false);
  };

  const handleViewDigital = async () => {
    setResolvingDigital(true);
    try {
      const url = await resolveDigitalUrl(item.digital);
      if (url) {
        window.open(url, '_blank', 'noopener,noreferrer');
        onOpenDigital(item);
      }
    } catch {
      alert(lang === 'vi' ? 'Không thể mở bản điện tử lúc này. Vui lòng thử lại.' : 'Could not open the digital edition right now. Please try again.');
    } finally {
      setResolvingDigital(false);
    }
  };
  const rows = [
    [lang === 'vi' ? 'Loại' : 'Type', item.category],
    [lang === 'vi' ? 'Tác giả' : 'Author', item.author || '—'],
    item.physical
      ? [lang === 'vi' ? 'Tổng số bản' : 'Total copies', String(item.physical.totalCopies)]
      : null,
    item.physical
      ? [lang === 'vi' ? 'Còn để mượn' : 'Available to borrow', avail === 0
          ? (lang === 'vi' ? 'Hết bản' : 'None left')
          : `${avail} / ${item.physical.totalCopies}`]
      : null,
    [lang === 'vi' ? 'Bản điện tử' : 'Digital edition', item.digital
      ? (lang === 'vi' ? 'Có — truy cập không giới hạn' : 'Available — unlimited access')
      : (lang === 'vi' ? 'Không có' : 'Not available')],
  ].filter(Boolean);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()}
        className="relative flex w-full max-w-2xl flex-col overflow-hidden bg-white shadow-2xl sm:flex-row">
        <button type="button" onClick={onClose}
          className="absolute right-3 top-3 z-10 rounded-full bg-black/40 p-1.5 text-white hover:bg-black/60">
          <X className="h-4 w-4" />
        </button>
        <CoverArt item={item} className="sm:w-56" />
        <div className="flex flex-1 flex-col gap-3 p-5">
          <div>
            <span className="w-fit border border-neutral-200 bg-neutral-50 px-1.5 py-0.5 font-sans text-[9px] font-bold uppercase tracking-wide text-neutral-500">
              {item.category}
            </span>
            <h3 className="mt-1.5 font-sans text-lg font-bold leading-snug text-neutral-900">{item.title}</h3>
            <p className="font-sans text-sm text-neutral-500">{item.author}</p>
          </div>

          <table className="w-full border-collapse border border-neutral-200 font-sans text-xs">
            <tbody>
              {rows.map(([label, value]) => (
                <tr key={label} className="border-b border-neutral-100 last:border-none">
                  <td className="w-40 bg-neutral-50 px-2.5 py-1.5 font-bold uppercase tracking-wide text-neutral-500">{label}</td>
                  <td className="px-2.5 py-1.5 text-neutral-800">{value}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {item.physical && isLive && (
            <div className="flex items-center gap-1.5 border border-neutral-200 bg-neutral-50 px-2.5 py-2">
              <MapPin className="h-3.5 w-3.5 shrink-0 text-[#990000]" />
              {editingLocation ? (
                <div className="flex flex-1 items-center gap-1.5">
                  <input autoFocus value={locationDraft} onChange={(e) => setLocationDraft(e.target.value)}
                    placeholder={lang === 'vi' ? 'VD: Phòng CoLab, kệ 3' : 'e.g. CoLab Room, shelf 3'}
                    className="flex-1 border border-neutral-300 px-2 py-1 font-sans text-[11px] focus:border-[#990000] focus:outline-none" />
                  <button type="button" onClick={saveLocation} className="border border-emerald-300 bg-emerald-50 p-1 text-emerald-700 hover:bg-emerald-100"><Check className="h-3 w-3" /></button>
                  <button type="button" onClick={() => setEditingLocation(false)} className="border border-neutral-300 p-1 text-neutral-500"><X className="h-3 w-3" /></button>
                </div>
              ) : (
                <button type="button" onClick={() => { setEditingLocation(true); setLocationDraft(location?.location || ''); }}
                  className="flex-1 text-left font-sans text-[11px] text-neutral-700 hover:text-[#990000]">
                  {location ? (
                    <>
                      <strong>{location.location}</strong>
                      <span className="text-neutral-400"> · {lang === 'vi' ? 'cập nhật bởi' : 'updated by'} {location.updater?.full_name || '—'}</span>
                    </>
                  ) : (
                    <span className="italic text-neutral-400">
                      {lang === 'vi' ? 'Chưa rõ vị trí hiện tại — bấm để cập nhật' : 'Current location unknown — click to set'}
                    </span>
                  )}
                </button>
              )}
            </div>
          )}

          {item.physical && (avail > 0 || inCart) && (
            <div className="flex items-center gap-2 border border-neutral-200 bg-neutral-50 px-2.5 py-2">
              <span className="font-sans text-[10px] font-bold uppercase text-neutral-500">
                {lang === 'vi' ? 'Số lượng' : 'Qty'}
              </span>
              <div className="flex items-center gap-1.5">
                <button type="button" disabled={qty <= 1} onClick={() => handleQtyChange(qty - 1)}
                  className="flex h-6 w-6 items-center justify-center border border-neutral-300 text-neutral-600 hover:border-[#990000] disabled:cursor-not-allowed disabled:opacity-30">
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <span className="w-5 text-center font-sans text-xs font-bold text-neutral-800">{qty}</span>
                <button type="button" disabled={qty >= avail} onClick={() => handleQtyChange(qty + 1)}
                  className="flex h-6 w-6 items-center justify-center border border-neutral-300 text-neutral-600 hover:border-[#990000] disabled:cursor-not-allowed disabled:opacity-30">
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>
              <span className="font-sans text-[10px] text-neutral-400">/ {avail} {lang === 'vi' ? 'còn lại' : 'available'}</span>
            </div>
          )}

          <div className="mt-auto flex flex-col gap-1.5 pt-2 sm:flex-row">
            {item.physical && (
              <button type="button" disabled={avail === 0 && !inCart} onClick={() => onToggleCart(item, qty)}
                className={`flex flex-1 items-center justify-center gap-1.5 border px-2.5 py-2 font-sans text-xs font-bold uppercase tracking-wide transition-colors ${
                  avail === 0 && !inCart ? 'cursor-not-allowed border-neutral-200 bg-neutral-100 text-neutral-400'
                  : inCart ? 'border-[#990000] bg-[#990000] text-white'
                  : 'border-neutral-300 text-neutral-700 hover:border-[#990000]'
                }`}>
                {inCart ? <Check className="h-3.5 w-3.5" /> : <ShoppingCart className="h-3.5 w-3.5" />}
                {inCart
                  ? (lang === 'vi' ? 'Đã có trong giỏ — Bỏ ra' : 'In cart — Remove')
                  : avail === 0
                    ? (lang === 'vi' ? 'Hết bản' : 'Unavailable')
                    : (lang === 'vi' ? 'Thêm vào giỏ mượn' : 'Add to borrow cart')}
              </button>
            )}
            {item.digital && (
              <button type="button" disabled={resolvingDigital} onClick={handleViewDigital}
                className="flex flex-1 items-center justify-center gap-1.5 border border-emerald-300 bg-emerald-50 px-2.5 py-2 font-sans text-xs font-bold uppercase tracking-wide text-emerald-700 hover:bg-emerald-100 disabled:cursor-wait disabled:opacity-60">
                {openedDigital[item.id] ? <Check className="h-3.5 w-3.5" /> : <ExternalLink className="h-3.5 w-3.5" />}
                {resolvingDigital
                  ? (lang === 'vi' ? 'Đang mở...' : 'Opening...')
                  : (lang === 'vi' ? 'Xem bản điện tử' : 'View digital')}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const LIBRARY_PAGE_SIZE = 15;

function LibraryBlock({ onValid, onData, lang, form }) {
  const { user: authUser } = useAuth();
  const [canManage, setCanManage] = useState(false);
  const [view, setView] = useState('catalog'); // 'catalog' | 'admin'
  const [cart, setCart] = useState([]); // [{ itemId, itemTitle }]
  const [pickupDate, setPickupDate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [note, setNote] = useState('');
  const [openedDigital, setOpenedDigital] = useState({});
  const [detailItem, setDetailItem] = useState(null);
  const [typeFilter, setTypeFilter] = useState('All');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [cartOpen, setCartOpen] = useState(false);
  const [cartStep, setCartStep] = useState('review'); // 'review' | 'details'

  useEffect(() => {
    if (!isLive || !authUser) { setCanManage(false); return; }
    canManageLibrary().then(setCanManage);
  }, [authUser]);

  const types = useMemo(() => ['All', ...new Set(LIBRARY_ITEMS.map((i) => i.category))], []);
  const filteredItems = useMemo(() => {
    const q = query.trim().toLowerCase();
    return LIBRARY_ITEMS
      .filter((i) =>
        (typeFilter === 'All' || i.category === typeFilter) &&
        (!q || i.title.toLowerCase().includes(q) || (i.author || '').toLowerCase().includes(q))
      )
      .sort((a, b) => a.title.localeCompare(b.title));
  }, [typeFilter, query]);
  const totalPages = Math.max(1, Math.ceil(filteredItems.length / LIBRARY_PAGE_SIZE));
  const pageItems = filteredItems.slice((page - 1) * LIBRARY_PAGE_SIZE, page * LIBRARY_PAGE_SIZE);

  const handleTypeFilter = (t) => { setTypeFilter(t); setPage(1); };
  const handleQuery = (v) => { setQuery(v); setPage(1); };

  const emit = (nextCart, nextPickup, nextDue, nextNote) => {
    onValid(nextCart.length > 0 && Boolean(nextPickup) && Boolean(nextDue));
    onData(nextCart.length > 0 ? { cart: nextCart, pickupDate: nextPickup, dueDate: nextDue, note: nextNote } : null);
  };

  const toggleCart = (item, qty = 1) => {
    setCart((prev) => {
      const exists = prev.some((c) => c.itemId === item.id);
      const next = exists ? prev.filter((c) => c.itemId !== item.id) : [...prev, { itemId: item.id, itemTitle: item.title, qty }];
      emit(next, pickupDate, dueDate, note);
      return next;
    });
  };

  const removeFromCart = (itemId) => {
    setCart((prev) => {
      const next = prev.filter((c) => c.itemId !== itemId);
      emit(next, pickupDate, dueDate, note);
      return next;
    });
  };

  const updateCartQty = (itemId, qty) => {
    setCart((prev) => {
      const next = prev.map((c) => (c.itemId === itemId ? { ...c, qty } : c));
      emit(next, pickupDate, dueDate, note);
      return next;
    });
  };

  const handlePickupDate = (v) => {
    setPickupDate(v);
    // Pre-fill a suggested due date (pickup + LOAN_DAYS) only if the member
    // hasn't already chosen one — they can still freely override it below.
    const nextDue = dueDate || (v ? new Date(new Date(v).getTime() + LOAN_DAYS * 86400000).toISOString().slice(0, 10) : dueDate);
    if (nextDue !== dueDate) setDueDate(nextDue);
    emit(cart, v, nextDue, note);
  };
  const handleDueDate = (v) => { setDueDate(v); emit(cart, pickupDate, v, note); };
  const handleNote = (v) => { setNote(v); emit(cart, pickupDate, dueDate, v); };

  const handleOpenDigital = (item) => {
    if (openedDigital[item.id]) return;
    setOpenedDigital((prev) => ({ ...prev, [item.id]: true }));
    saveSubmission(form, { status: 'Approved', form: `${form.label} — ${item.title}` });
  };

  const minPickup = new Date().toISOString().slice(0, 10);
  const cartQtyTotal = cart.reduce((sum, c) => sum + (c.qty || 1), 0);

  return (
    <div className="space-y-3">
      {canManage && (
        <div className="flex gap-1.5 border-b border-neutral-200 pb-2">
          <button type="button" onClick={() => setView('catalog')}
            className={`border px-2.5 py-1 font-sans text-[10px] font-bold uppercase tracking-wide transition-colors ${
              view === 'catalog' ? 'border-neutral-900 bg-neutral-900 text-white' : 'border-neutral-300 text-neutral-600 hover:border-neutral-900'
            }`}>
            {lang === 'vi' ? 'Danh mục' : 'Catalog'}
          </button>
          <button type="button" onClick={() => setView('admin')}
            className={`border px-2.5 py-1 font-sans text-[10px] font-bold uppercase tracking-wide transition-colors ${
              view === 'admin' ? 'border-neutral-900 bg-neutral-900 text-white' : 'border-neutral-300 text-neutral-600 hover:border-neutral-900'
            }`}>
            {lang === 'vi' ? 'Quản trị thư viện' : 'Library admin'}
          </button>
        </div>
      )}

      {view === 'admin' ? (
        <LibraryAdminPanel lang={lang} />
      ) : (
        <>
      <div className="relative">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => handleQuery(e.target.value)}
          placeholder={lang === 'vi' ? 'Tìm sách/tài liệu theo tên hoặc tác giả...' : 'Search books/documents by title or author...'}
          className="w-full rounded-none border border-neutral-300 bg-white py-1.5 pl-8 pr-2.5 font-sans text-xs focus:border-neutral-900 focus:outline-none"
        />
      </div>
      <div className="flex flex-wrap items-center gap-1.5">
        {types.map((t) => (
          <button key={t} type="button" onClick={() => handleTypeFilter(t)}
            className={`border px-2 py-1 font-sans text-[10px] font-bold uppercase tracking-wide transition-colors ${
              typeFilter === t ? 'border-[#990000] bg-[#990000] text-white' : 'border-neutral-300 text-neutral-600 hover:border-[#990000]'
            }`}>
            {t}
          </button>
        ))}
        <span className="ml-auto font-sans text-[10px] text-neutral-400">
          {lang === 'vi' ? `${filteredItems.length} đầu sách/tài liệu` : `${filteredItems.length} titles`}
        </span>

        <button type="button"
          onClick={() => { setCartOpen(true); setCartStep('review'); }}
          className="relative flex items-center gap-1.5 border border-neutral-300 px-2.5 py-1 font-sans text-[10px] font-bold uppercase tracking-wide text-neutral-600 transition-colors hover:border-[#990000]">
          <ShoppingCart className="h-3.5 w-3.5" />
          {lang === 'vi' ? 'Giỏ mượn' : 'Cart'}
          {cart.length > 0 && (
            <span className="inline-flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[#990000] px-1 text-[9px] font-bold text-white">
              {cartQtyTotal}
            </span>
          )}
        </button>

        {cartOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setCartOpen(false)}>
            <div onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg border border-neutral-200 bg-white p-4 text-left normal-case shadow-2xl">
              <div className="mb-3 flex items-center justify-between">
                <p className="flex items-center gap-1.5 font-sans text-xs font-bold uppercase tracking-wide text-[#990000]">
                  <ShoppingCart className="h-4 w-4" />
                  {lang === 'vi' ? `Giỏ mượn sách (${cartQtyTotal})` : `Borrow cart (${cartQtyTotal})`}
                </p>
                <button type="button" onClick={() => setCartOpen(false)} className="text-neutral-400 hover:text-[#990000]">
                  <X className="h-4 w-4" />
                </button>
              </div>

              {cart.length === 0 ? (
                <p className="py-6 text-center font-sans text-xs text-neutral-400">
                  {lang === 'vi' ? 'Giỏ mượn đang trống — bấm vào sách để thêm.' : 'Cart is empty — click a book to add it.'}
                </p>
              ) : cartStep === 'review' ? (
                <div className="space-y-3">
                  <ul className="max-h-80 space-y-2 overflow-y-auto pr-1">
                    {cart.map((c) => {
                      const full = LIBRARY_ITEMS.find((i) => i.id === c.itemId);
                      const maxQty = Math.max(1, physicalAvailable(c.itemId) ?? 1);
                      const qty = c.qty || 1;
                      return (
                        <li key={c.itemId} className="relative flex items-start gap-3 border border-neutral-200 bg-neutral-50 p-2 pr-6">
                          <CoverArt item={full || { title: c.itemTitle }} className="!h-16 !w-12 shrink-0" />
                          <div className="min-w-0 flex-1">
                            <p className="font-sans text-xs font-semibold leading-snug text-neutral-800">{c.itemTitle}</p>
                            {full?.author && <p className="mt-0.5 font-sans text-[10px] text-neutral-400">{full.author}</p>}
                            {full?.category && (
                              <span className="mt-1 inline-block border border-neutral-200 bg-white px-1.5 py-0.5 font-sans text-[9px] font-bold uppercase text-neutral-500">
                                {full.category}
                              </span>
                            )}
                          </div>
                          <div className="flex shrink-0 flex-col items-center gap-1 border-l border-neutral-200 pl-3">
                            <span className="font-sans text-[9px] uppercase text-neutral-400">
                              {lang === 'vi' ? 'SL' : 'Qty'}
                            </span>
                            <div className="flex items-center gap-1">
                              <button type="button" disabled={qty <= 1} onClick={() => updateCartQty(c.itemId, qty - 1)}
                                className="flex h-5 w-5 items-center justify-center border border-neutral-300 text-neutral-600 hover:border-[#990000] disabled:cursor-not-allowed disabled:opacity-30">
                                <Minus className="h-3 w-3" />
                              </button>
                              <span className="w-4 text-center font-sans text-[11px] font-bold text-neutral-800">{qty}</span>
                              <button type="button" disabled={qty >= maxQty} onClick={() => updateCartQty(c.itemId, qty + 1)}
                                className="flex h-5 w-5 items-center justify-center border border-neutral-300 text-neutral-600 hover:border-[#990000] disabled:cursor-not-allowed disabled:opacity-30">
                                <Plus className="h-3 w-3" />
                              </button>
                            </div>
                            <span className="whitespace-nowrap font-sans text-[9px] text-neutral-400">
                              / {maxQty} {lang === 'vi' ? 'còn' : 'left'}
                            </span>
                          </div>
                          <button type="button" onClick={() => removeFromCart(c.itemId)}
                            className="absolute right-1.5 top-1.5 shrink-0 text-neutral-400 hover:text-[#990000]">
                            <X className="h-4 w-4" />
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                  <div className="flex items-center justify-between border-t border-neutral-200 pt-2 font-sans text-xs">
                    <span className="font-bold uppercase tracking-wide text-neutral-500">
                      {lang === 'vi' ? 'Tổng số sách mượn' : 'Total books'}
                    </span>
                    <span className="font-bold text-[#990000]">{cartQtyTotal}</span>
                  </div>
                  <button type="button" onClick={() => setCartStep('details')}
                    className="flex w-full items-center justify-center gap-1.5 bg-[#990000] px-3 py-2.5 font-sans text-xs font-bold uppercase tracking-wide text-white hover:bg-[#7a0010]">
                    {lang === 'vi' ? 'Xác nhận' : 'Confirm'} <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : (
                <div className="space-y-2.5">
                  <button type="button" onClick={() => setCartStep('review')}
                    className="flex items-center gap-1 font-sans text-[10px] text-neutral-500 hover:text-[#990000]">
                    <ArrowLeft className="h-3 w-3" /> {lang === 'vi' ? 'Quay lại giỏ' : 'Back to cart'}
                  </button>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    <label className="block font-sans text-[10px] text-neutral-500">
                      {lang === 'vi' ? 'Ngày nhận sách' : 'Pickup date'}
                      <input type="date" min={minPickup} value={pickupDate}
                        onChange={(e) => handlePickupDate(e.target.value)}
                        className={`${inputClass} mt-0.5`} />
                    </label>
                    <label className="block font-sans text-[10px] text-neutral-500">
                      {lang === 'vi' ? 'Ngày sẽ trả' : 'Return date'}
                      <input type="date" min={pickupDate || minPickup} value={dueDate}
                        onChange={(e) => handleDueDate(e.target.value)}
                        className={`${inputClass} mt-0.5`} />
                    </label>
                  </div>
                  <label className="block font-sans text-[10px] text-neutral-500">
                    {lang === 'vi' ? 'Ghi chú giao nhận (tùy chọn)' : 'Pickup/return note (optional)'}
                    <textarea rows={2} value={note} onChange={(e) => handleNote(e.target.value)}
                      placeholder={lang === 'vi' ? 'VD: nhận tại quầy CoLab, buổi chiều...' : 'e.g. pick up at CoLab desk, afternoon...'}
                      className={`${inputClass} mt-0.5`} />
                  </label>
                  <button type="button" onClick={() => setCartOpen(false)}
                    disabled={!pickupDate || !dueDate}
                    className={`flex w-full items-center justify-center gap-1.5 px-3 py-2.5 font-sans text-xs font-bold uppercase tracking-wide text-white transition-colors ${
                      pickupDate && dueDate ? 'bg-[#990000] hover:bg-[#7a0010]' : 'cursor-not-allowed bg-neutral-300'
                    }`}>
                    <Check className="h-3.5 w-3.5" /> {lang === 'vi' ? 'Xong' : 'Done'}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-3 gap-1.5 sm:grid-cols-4 md:grid-cols-5">
        {pageItems.map((item) => (
          <LibraryCard key={item.id} item={item} inCart={cart.some((c) => c.itemId === item.id)}
            onOpenDetail={setDetailItem} lang={lang} />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-1">
          <button type="button" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="border border-neutral-300 p-1 text-neutral-600 hover:border-[#990000] disabled:cursor-not-allowed disabled:opacity-30">
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button key={p} type="button" onClick={() => setPage(p)}
              className={`h-6 w-6 border font-sans text-[10px] font-bold transition-colors ${
                page === p ? 'border-[#990000] bg-[#990000] text-white' : 'border-neutral-300 text-neutral-600 hover:border-[#990000]'
              }`}>
              {p}
            </button>
          ))}
          <button type="button" disabled={page >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className="border border-neutral-300 p-1 text-neutral-600 hover:border-[#990000] disabled:cursor-not-allowed disabled:opacity-30">
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {detailItem && (
        <LibraryDetailModal key={detailItem.id} item={detailItem} inCart={cart.some((c) => c.itemId === detailItem.id)}
          cartQty={cart.find((c) => c.itemId === detailItem.id)?.qty}
          onToggleCart={toggleCart} onUpdateQty={updateCartQty} onOpenDigital={handleOpenDigital}
          openedDigital={openedDigital} onClose={() => setDetailItem(null)} lang={lang} />
      )}

      <p className="font-sans text-[10px] text-neutral-400">
        {lang === 'vi'
          ? 'Bản điện tử được cấp quyền truy cập ngay khi bấm, không cần vào giỏ. Sách bản cứng: thêm vào giỏ, bấm icon "Giỏ mượn" ở trên để xem lại/xoá bớt và điền ngày nhận, rồi bấm "Gửi yêu cầu" bên dưới để gửi một lượt; sau khi duyệt sẽ hiện tại Hồ Sơ Của Tôi → Tài sản & Thiết bị đang mượn.'
          : 'Digital items grant access the moment you click them — no cart needed. For physical books: add them to the cart, click the "Cart" icon above to review/remove items and fill in a pickup date, then click "Submit request" below to send them all at once; once approved they appear under My Portal → My Assets Checked Out to Me.'}
      </p>
        </>
      )}
    </div>
  );
}

function ResignationBlock({ onValid, lang }) {
  return (
    <div className="space-y-2">
      <p className="border border-neutral-300 bg-neutral-50 p-2.5 font-sans text-[11px] text-neutral-600">
        {lang === 'vi'
          ? 'Gửi đơn này sẽ tự động kích hoạt Offboarding checklist: bàn giao 100% dữ liệu nghiên cứu & source code, hoàn trả thiết bị lab, thu hồi quyền truy cập hệ thống.'
          : 'Submitting this form automatically initiates the Offboarding checklist: handover of 100% research data & source code, returning lab equipment, and revoking system access.'}
      </p>
      <label className="flex items-center gap-2 font-sans text-[11px]">
        <input type="checkbox" className="accent-[#990000]" onChange={(e) => onValid(e.target.checked)} />
        {lang === 'vi' 
          ? 'Tôi xác nhận đã đọc Offboarding protocol và cam kết bàn giao đầy đủ.'
          : 'I confirm that I have read the Offboarding protocol and commit to complete handovers.'}
      </label>
    </div>
  );
}

const SPECIAL_BLOCKS = {
  overtime: OvertimeBlock, naming: NamingBlock,
  handover: HandoverBlock, payment: PaymentBlock, training: TrainingBlock,
  labEquip: LabEquipBlock, resignation: ResignationBlock, library: LibraryBlock,
};

/* ---------------- Form detail view ---------------- */

export function FormDetail({ formKey, onBack }) {
  const { lang } = useLanguage();
  const { user: authUser } = useAuth();
  const form = FORM_BY_KEY[formKey];
  const [specialValid, setSpecialValid] = useState(!form?.special);
  const [specialData, setSpecialData] = useState(null);
  const [details, setDetails] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!form) return <p className="font-sans text-xs text-neutral-400">Unknown form.</p>;
  const Special = form.special ? SPECIAL_BLOCKS[form.special] : null;

  if (submitted) {
    return (
      <div className="space-y-4 py-8 text-center border border-neutral-200 bg-neutral-50 p-4">
        <CheckCircle2 className="mx-auto h-8 w-8 text-neutral-800" />
        <p className="font-sans text-sm font-bold text-neutral-900">
          {lang === 'vi' ? 'Đã gửi thành công:' : 'Submitted successfully:'} {form.label}
        </p>
        <p className="font-sans text-xs text-neutral-500">
          {lang === 'vi' ? 'Theo dõi trạng thái tại Đơn từ gửi đi.' : 'Track status under My Forms Request Status.'}
        </p>
        <button onClick={onBack} className="btn-primary mx-auto text-xs">
          <ArrowLeft className="h-3 w-3" /> {lang === 'vi' ? 'Quay lại Form Portal' : 'Back to Form Portal'}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {form.crossRef && (
        <p className="flex items-center gap-1.5 border border-neutral-200 bg-neutral-50 px-3 py-1.5 font-sans text-[10px] text-neutral-800 rounded-none">
          <AlertTriangle className="h-3.5 w-3.5 text-neutral-500" /> Cross-ref: <strong>{form.crossRef}</strong>
        </p>
      )}

      {Special && <Special onValid={setSpecialValid} onData={setSpecialData} lang={lang} form={form} />}

      {form.special !== 'library' && (
        <div>
          <label className="block text-[9px] font-bold uppercase text-neutral-400 mb-1">
            {lang === 'vi' ? 'Chi tiết yêu cầu / lý do' : 'Justification / request details'}
          </label>
          <textarea
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            placeholder={lang === 'vi' ? 'Chi tiết yêu cầu / lý do...' : 'Justification / request details...'}
            rows={3}
            className={inputClass}
          />
        </div>
      )}

      <div className="pt-2">
        <button
          disabled={!specialValid}
          onClick={() => {
            if (form.special === 'library' && specialData?.cart?.length) {
              specialData.cart.forEach((item) => {
                const qty = item.qty || 1;
                for (let i = 0; i < qty; i++) {
                  const entry = saveSubmission(form, { form: `${form.label} — ${item.itemTitle}` });
                  createBorrowRequest({
                    id: entry.id, itemId: item.itemId, itemTitle: item.itemTitle,
                    pickupDate: specialData.pickupDate, dueDate: specialData.dueDate, note: specialData.note,
                  });
                  if (isLive && authUser) {
                    submitBorrowRequestRemote({
                      itemId: item.itemId, itemTitle: item.itemTitle,
                      pickupDate: specialData.pickupDate, dueDate: specialData.dueDate, note: specialData.note,
                      requesterId: authUser.id,
                    });
                  }
                }
              });
            } else {
              saveSubmission(form);
            }
            setSubmitted(true);
          }}
          className={`btn-primary w-full ${!specialValid && 'opacity-30 cursor-not-allowed bg-neutral-300 border-neutral-300 text-neutral-500'}`}
        >
          <Send className="h-3.5 w-3.5" />
          {form.special === 'library' && specialData?.cart?.length
            ? (() => {
                const totalQty = specialData.cart.reduce((sum, c) => sum + (c.qty || 1), 0);
                return lang === 'vi' ? `Gửi yêu cầu mượn (${totalQty} quyển)` : `Submit borrow request (${totalQty} items)`;
              })()
            : (lang === 'vi' ? 'Gửi yêu cầu' : 'Submit request')}
        </button>
        {!specialValid && (
          <p className="font-sans text-[9px] text-neutral-400 mt-1.5 text-center">
            {lang === 'vi' ? 'Nút gửi mở khóa khi các điều kiện kiểm tra phía trên đạt chuẩn.' : 'Submit button unlocks once validation conditions above are met.'}
          </p>
        )}
      </div>
    </div>
  );
}

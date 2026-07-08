import { useMemo, useState } from 'react';
import {
  FileText, ArrowLeft, CheckCircle2, XCircle, AlertTriangle, Send, Lock,
} from 'lucide-react';
import { FORM_GROUPS, FORM_BY_KEY } from '../../data/formPortal.js';
import { isNameCompliant } from '../../data/wikiHub.js';
import { useLanguage } from '../../i18n/LanguageContext.jsx';

const STORE_KEY = 'iscm_my_forms_submissions';

export function loadSubmissions() {
  try { return JSON.parse(localStorage.getItem(STORE_KEY) || '[]'); } catch { return []; }
}

function saveSubmission(form) {
  const entry = {
    id: `sub-${Date.now()}`,
    form: form.label,
    group: form.group,
    date: new Date().toISOString().slice(0, 10),
    status: 'Open',
  };
  localStorage.setItem(STORE_KEY, JSON.stringify([entry, ...loadSubmissions()]));
  return entry;
}

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
  const groups = useMemo(
    () => FORM_GROUPS
      .map((g) => ({ ...g, forms: g.forms.filter((f) => categoryFilter === 'All' || f.cat === categoryFilter) }))
      .filter((g) => g.forms.length > 0),
    [categoryFilter]
  );

  return (
    <div className="space-y-4">
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

function WfhBlock({ onValid, lang }) {
  const [day, setDay] = useState(null);
  return (
    <div className="space-y-2">
      <p className="font-sans text-[11px] text-neutral-500">
        {lang === 'vi' ? 'Chọn ngày remote trong tuần tới:' : 'Select remote day for next week:'}
      </p>
      <div className="grid grid-cols-5 gap-1.5">
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map((d) => (
          <button key={d} type="button" disabled={d === 'Mon'}
            onClick={() => { setDay(d); onValid(true); }}
            className={`border p-1.5 text-center font-sans text-[11px] transition-colors rounded-none ${
              d === 'Mon' ? 'cursor-not-allowed border-neutral-200 bg-neutral-100 text-neutral-400'
              : day === d ? 'border-[#990000] bg-[#990000] text-white'
              : 'border-neutral-300 hover:border-[#990000] bg-white'
            }`}>
            {d}{d === 'Mon' && <Lock className="mx-auto mt-0.5 h-3 w-3 text-neutral-400" />}
          </button>
        ))}
      </div>
      <p className="border border-amber-200 bg-amber-50 px-2 py-1 font-sans text-[10px] text-amber-800 rounded-none">
        {lang === 'vi'
          ? '🔒 Monday Rule: Thứ Hai khóa Onsite — All-hands, academic seminars & core team ops.'
          : '🔒 Monday Rule: Monday is locked Onsite — All-hands, academic seminars & core team ops.'}
      </p>
    </div>
  );
}

function LeaveBlock({ onValid, lang }) {
  const [date, setDate] = useState('');
  const [type, setType] = useState('Annual Leave');
  const ok = date ? new Date(date).getTime() - Date.now() >= 24 * 3600 * 1000 : null;
  return (
    <div className="space-y-2">
      <select value={type} onChange={(e) => setType(e.target.value)} className={inputClass}>
        {lang === 'vi' ? (
          <>
            <option value="Annual Leave">Nghỉ phép năm</option>
            <option value="Absence with Permission">Vắng mặt có lý do</option>
            <option value="Late with Permission">Đi trễ có lý do</option>
          </>
        ) : (
          <>
            <option value="Annual Leave">Annual Leave</option>
            <option value="Absence with Permission">Absence with Permission</option>
            <option value="Late with Permission">Late with Permission</option>
          </>
        )}
      </select>
      <input type="date" value={date} className={inputClass}
        onChange={(e) => { setDate(e.target.value); onValid(new Date(e.target.value).getTime() - Date.now() >= 24 * 3600 * 1000); }} />
      <ValidationNote ok={ok}
        okText={lang === 'vi' ? 'Đạt quy tắc Smart Office: khai báo trước ≥ 24 giờ.' : 'Compliant with Smart Office rules: declared ≥ 24 hours prior.'}
        badText={lang === 'vi' ? 'Vi phạm quy tắc 24 giờ — ngày nghỉ phải cách hiện tại tối thiểu 24 giờ.' : 'Violates 24h Prior Rule — leave day must be at least 24 hours in advance.'} />
    </div>
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
  wfh: WfhBlock, leave: LeaveBlock, overtime: OvertimeBlock, naming: NamingBlock,
  handover: HandoverBlock, payment: PaymentBlock, training: TrainingBlock,
  labEquip: LabEquipBlock, resignation: ResignationBlock,
};

/* ---------------- Form detail view ---------------- */

export function FormDetail({ formKey, onBack }) {
  const { lang } = useLanguage();
  const form = FORM_BY_KEY[formKey];
  const [specialValid, setSpecialValid] = useState(!form?.special);
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
      <div className="flex items-center justify-between border-b border-neutral-200 pb-2">
        <button onClick={onBack} className="flex items-center gap-1 font-sans text-[10px] text-neutral-500 hover:text-[#990000] uppercase font-bold">
          <ArrowLeft className="h-3 w-3" /> {lang === 'vi' ? 'Quay lại Form Portal' : 'Back to Form Portal'}
        </button>
        <span className={`badge text-[9px] font-bold ${CAT_BADGE[form.cat]}`}>{form.cat}</span>
      </div>

      <div className="bg-neutral-50 border border-neutral-200 p-3">
        <h4 className="font-sans text-xs font-bold text-neutral-950">{form.label}</h4>
        <p className="font-sans text-[10px] text-neutral-500 mt-1 leading-normal">{form.desc}</p>
      </div>

      {form.crossRef && (
        <p className="flex items-center gap-1.5 border border-neutral-200 bg-neutral-50 px-3 py-1.5 font-sans text-[10px] text-neutral-800 rounded-none">
          <AlertTriangle className="h-3.5 w-3.5 text-neutral-500" /> Cross-ref: <strong>{form.crossRef}</strong>
        </p>
      )}

      {Special && <Special onValid={setSpecialValid} lang={lang} />}

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

      <div className="pt-2">
        <button
          disabled={!specialValid}
          onClick={() => { saveSubmission(form); setSubmitted(true); }}
          className={`btn-primary w-full ${!specialValid && 'opacity-30 cursor-not-allowed bg-neutral-300 border-neutral-300 text-neutral-500'}`}
        >
          <Send className="h-3.5 w-3.5" /> {lang === 'vi' ? 'Gửi yêu cầu' : 'Submit request'}
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

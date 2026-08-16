import { useEffect, useMemo, useState } from 'react';
import { CalendarRange, Clock, UserCog, Plus, Trash2, History } from 'lucide-react';
import { useAuth } from '../../../auth/AuthContext.jsx';
import { ATTENDANCE_TYPES } from '../../../data/attendanceStore.js';
import {
  CALENDAR_DAY_TYPES, ATTENDANCE_TYPE_RULE_KEYS,
  fetchPolicies, createPolicy,
  fetchCalendarDays, addCalendarDay, deleteCalendarDay,
  fetchAllMemberScopes, upsertMemberScope,
} from '../../../data/attendancePolicyStore.js';
import { fetchAllAccounts } from '../../../data/attendanceStore.js';
import { fetchSettingsAuditLogs } from '../../../data/attendanceAuditStore.js';

const inputClass = 'w-full rounded-none border border-neutral-300 bg-white px-2.5 py-1.5 font-ibm text-xs text-iscm-charcoal focus:border-iscm-crimson focus:outline-none';
const labelClass = 'block text-[10px] font-bold text-neutral-400 uppercase mb-1';
const WEEKDAYS_VI = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
const WEEKDAYS_EN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const DAY_TYPE_LABEL = {
  vi: { public_holiday: 'Nghỉ lễ quốc gia', institute_holiday: 'Nghỉ lễ Viện', special_working_day: 'Ngày làm bù', special_non_working_day: 'Ngày nghỉ đặc biệt' },
  en: { public_holiday: 'Public Holiday', institute_holiday: 'Institute Holiday', special_working_day: 'Special Working Day', special_non_working_day: 'Special Non-Working Day' },
};
const RULE_LABEL = {
  vi: { requiresApproval: 'Cần duyệt', allowMultiDay: 'Cho phép nhiều ngày', allowRetroactive: 'Cho phép khai báo trễ', reasonRequired: 'Bắt buộc lý do', relatedActivityRequired: 'Bắt buộc hoạt động liên quan' },
  en: { requiresApproval: 'Requires Approval', allowMultiDay: 'Allow Multi-Day', allowRetroactive: 'Allow Retroactive', reasonRequired: 'Reason Required', relatedActivityRequired: 'Related Activity Required' },
};

function todayIso() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** Attendance Settings — the admin-only configuration layer behind the
    calculation engine in attendanceAggregation.js. Three groups: Working
    Calendar (holiday/special-day exceptions), Attendance Policy (working
    days/hours + per-type rules, versioned by effective_from so changing
    today's policy can never rewrite a past report), and Attendance Scope
    (per-member enabled/date-range, so the Matrix stops counting Normal
    Working Days for someone before they actually joined ISCM OS). */
export default function AttendanceSettingsPanel({ vi }) {
  const { user: authUser } = useAuth();
  const [tab, setTab] = useState('policy');
  const [policies, setPolicies] = useState([]);
  const [calendarDays, setCalendarDays] = useState([]);
  const [scopes, setScopes] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);

  const reload = () => {
    setLoading(true);
    Promise.all([fetchPolicies(), fetchCalendarDays(), fetchAllMemberScopes(), fetchAllAccounts()])
      .then(([p, c, s, a]) => { setPolicies(p); setCalendarDays(c); setScopes(s); setAccounts(a); setLoading(false); });
  };
  useEffect(() => { reload(); }, []);

  const TABS = [
    { key: 'policy', label: vi ? 'Chính sách & Giờ làm' : 'Policy & Hours', icon: Clock },
    { key: 'calendar', label: vi ? 'Lịch làm việc' : 'Working Calendar', icon: CalendarRange },
    { key: 'scope', label: vi ? 'Phạm vi thành viên' : 'Attendance Scope', icon: UserCog },
    { key: 'audit', label: vi ? 'Lịch sử thay đổi' : 'Audit History', icon: History },
  ];

  if (loading) return <p className="font-ibm text-[11px] text-gray-400 p-2">{vi ? 'Đang tải...' : 'Loading...'}</p>;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-1.5 border-b border-neutral-100 pb-2">
        {TABS.map((t) => (
          <button key={t.key} type="button" onClick={() => setTab(t.key)}
            className={`flex items-center gap-1.5 border px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide transition-colors ${
              tab === t.key ? 'border-neutral-900 bg-neutral-900 text-white' : 'border-neutral-300 text-neutral-600 hover:border-neutral-900'
            }`}>
            <t.icon className="h-3.5 w-3.5" /> {t.label}
          </button>
        ))}
      </div>

      {tab === 'policy' && <PolicyTab vi={vi} policies={policies} userId={authUser?.id} onChanged={reload} />}
      {tab === 'calendar' && <CalendarTab vi={vi} calendarDays={calendarDays} userId={authUser?.id} onChanged={reload} />}
      {tab === 'scope' && <ScopeTab vi={vi} scopes={scopes} accounts={accounts} policies={policies} userId={authUser?.id} onChanged={reload} />}
      {tab === 'audit' && <AuditTab vi={vi} />}
    </div>
  );
}

/* ------------------------------------------------------------------ */

function emptyTypeRules() {
  const rules = {};
  ATTENDANCE_TYPES.forEach((t) => {
    rules[t] = { requiresApproval: true, allowMultiDay: t === 'Annual Leave', allowRetroactive: false, reasonRequired: true, relatedActivityRequired: false };
  });
  return rules;
}

function PolicyTab({ vi, policies, userId, onChanged }) {
  const latest = policies[0]; // fetchPolicies() orders effective_from desc
  const [form, setForm] = useState(() => ({
    name: '', working_days: [1, 2, 3, 4, 5],
    standard_start_time: latest?.standard_start_time?.slice(0, 5) || '08:00',
    standard_end_time: latest?.standard_end_time?.slice(0, 5) || '17:00',
    standard_daily_minutes: latest?.standard_daily_minutes || 480,
    type_rules: latest?.type_rules && Object.keys(latest.type_rules).length > 0 ? latest.type_rules : emptyTypeRules(),
    effective_from: todayIso(), effective_to: '',
  }));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);

  const toggleDay = (d) => setForm((p) => ({
    ...p, working_days: p.working_days.includes(d) ? p.working_days.filter((x) => x !== d) : [...p.working_days, d].sort(),
  }));
  const toggleRule = (type, key) => setForm((p) => ({
    ...p, type_rules: { ...p.type_rules, [type]: { ...p.type_rules[type], [key]: !p.type_rules[type]?.[key] } },
  }));

  const submit = async () => {
    if (!form.name.trim()) { setError(vi ? 'Cần đặt tên chính sách.' : 'Policy name is required.'); return; }
    if (!form.effective_from) { setError(vi ? 'Cần chọn ngày hiệu lực.' : 'Effective-from date is required.'); return; }
    setError('');
    setSaving(true);
    try {
      await createPolicy({
        name: form.name.trim(),
        working_days: form.working_days,
        standard_start_time: form.standard_start_time,
        standard_end_time: form.standard_end_time,
        standard_daily_minutes: Number(form.standard_daily_minutes) || 480,
        type_rules: form.type_rules,
        effective_from: form.effective_from,
        effective_to: form.effective_to || null,
      }, userId);
      setShowForm(false);
      onChanged();
    } catch (e) {
      setError(e.message || (vi ? 'Lưu thất bại.' : 'Save failed.'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-3">
      <p className="text-[10px] text-neutral-400 italic">
        {vi
          ? 'Chính sách được quản lý theo phiên bản (effective_from) — sửa chính sách hiện tại không làm thay đổi báo cáo quá khứ. Muốn thay đổi giờ làm/quy tắc, hãy thêm một phiên bản mới có ngày hiệu lực từ hôm nay trở đi.'
          : 'Policies are versioned by effective_from — editing today\'s policy never rewrites past reports. To change hours/rules, add a new version effective today or later.'}
      </p>

      <div className="border border-neutral-200 overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="bg-neutral-900 text-white font-barlow text-[9px] font-bold uppercase tracking-wider">
              <th className="px-2.5 py-2">{vi ? 'Tên' : 'Name'}</th>
              <th className="px-2.5 py-2">{vi ? 'Ngày trong tuần' : 'Working Days'}</th>
              <th className="px-2.5 py-2">{vi ? 'Giờ chuẩn' : 'Standard Hours'}</th>
              <th className="px-2.5 py-2">{vi ? 'Hiệu lực từ' : 'Effective From'}</th>
              <th className="px-2.5 py-2">{vi ? 'Đến' : 'Until'}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {policies.map((p) => (
              <tr key={p.id} className="hover:bg-neutral-50/80">
                <td className="px-2.5 py-2 font-semibold text-neutral-800">{p.name}</td>
                <td className="px-2.5 py-2 text-neutral-600">{p.working_days.map((d) => (vi ? WEEKDAYS_VI : WEEKDAYS_EN)[d]).join(', ')}</td>
                <td className="px-2.5 py-2 text-neutral-600">{p.standard_start_time?.slice(0, 5)}–{p.standard_end_time?.slice(0, 5)}</td>
                <td className="px-2.5 py-2 text-neutral-600">{p.effective_from}</td>
                <td className="px-2.5 py-2 text-neutral-400">{p.effective_to || (vi ? 'hiện tại' : 'current')}</td>
              </tr>
            ))}
            {policies.length === 0 && (
              <tr><td colSpan={5} className="px-3 py-6 text-center text-neutral-400 italic">{vi ? 'Chưa có chính sách nào.' : 'No policies configured yet.'}</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {!showForm ? (
        <button type="button" onClick={() => setShowForm(true)}
          className="flex items-center gap-1.5 border border-neutral-300 px-3 py-1.5 text-[10px] font-bold uppercase text-neutral-600 hover:border-iscm-crimson hover:text-iscm-crimson">
          <Plus className="h-3.5 w-3.5" /> {vi ? 'Thêm phiên bản chính sách mới' : 'Add New Policy Version'}
        </button>
      ) : (
        <div className="space-y-3 border border-neutral-200 p-3">
          <p className="font-ibm text-xs font-semibold text-iscm-charcoal">{vi ? 'Phiên bản chính sách mới' : 'New Policy Version'}</p>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className={labelClass}>{vi ? 'Tên chính sách' : 'Policy Name'}</label>
              <input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} className={inputClass}
                placeholder={vi ? 'Vd: Chính sách 2027' : 'e.g. 2027 Policy'} />
            </div>
            <div>
              <label className={labelClass}>{vi ? 'Hiệu lực từ' : 'Effective From'}</label>
              <input type="date" value={form.effective_from} onChange={(e) => setForm((p) => ({ ...p, effective_from: e.target.value }))} className={inputClass} />
            </div>
          </div>

          <div>
            <label className={labelClass}>{vi ? 'Ngày làm việc trong tuần' : 'Working Days'}</label>
            <div className="flex flex-wrap gap-1.5">
              {(vi ? WEEKDAYS_VI : WEEKDAYS_EN).map((label, d) => (
                <button key={d} type="button" onClick={() => toggleDay(d)}
                  className={`px-2.5 py-1 text-[10px] font-bold border ${
                    form.working_days.includes(d) ? 'bg-neutral-900 text-white border-neutral-900' : 'border-neutral-300 text-neutral-500'
                  }`}>{label}</button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2.5">
            <div>
              <label className={labelClass}>{vi ? 'Giờ bắt đầu chuẩn' : 'Standard Start'}</label>
              <input type="time" value={form.standard_start_time} onChange={(e) => setForm((p) => ({ ...p, standard_start_time: e.target.value }))} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>{vi ? 'Giờ kết thúc chuẩn' : 'Standard End'}</label>
              <input type="time" value={form.standard_end_time} onChange={(e) => setForm((p) => ({ ...p, standard_end_time: e.target.value }))} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>{vi ? 'Số phút/ngày chuẩn' : 'Standard Daily Minutes'}</label>
              <input type="number" value={form.standard_daily_minutes} onChange={(e) => setForm((p) => ({ ...p, standard_daily_minutes: e.target.value }))} className={inputClass} />
            </div>
          </div>

          <div>
            <label className={labelClass}>{vi ? 'Hiệu lực đến (không bắt buộc)' : 'Effective To (optional)'}</label>
            <input type="date" value={form.effective_to} onChange={(e) => setForm((p) => ({ ...p, effective_to: e.target.value }))} className={`${inputClass} max-w-[200px]`} min={form.effective_from} />
          </div>

          <div>
            <label className={labelClass}>{vi ? 'Quy tắc theo loại' : 'Rules by Attendance Type'}</label>
            <div className="border border-neutral-200 overflow-x-auto">
              <table className="w-full text-left text-[11px]">
                <thead>
                  <tr className="bg-neutral-50 text-neutral-500 font-bold uppercase text-[9px]">
                    <th className="px-2 py-1.5">{vi ? 'Loại' : 'Type'}</th>
                    {ATTENDANCE_TYPE_RULE_KEYS.map((k) => <th key={k} className="px-2 py-1.5 text-center">{RULE_LABEL[vi ? 'vi' : 'en'][k]}</th>)}
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {ATTENDANCE_TYPES.map((t) => (
                    <tr key={t}>
                      <td className="px-2 py-1.5 font-semibold text-neutral-700">{t}</td>
                      {ATTENDANCE_TYPE_RULE_KEYS.map((k) => (
                        <td key={k} className="px-2 py-1.5 text-center">
                          <input type="checkbox" checked={Boolean(form.type_rules[t]?.[k])} onChange={() => toggleRule(t, k)} />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {error && <p className="rounded-none border border-red-200 bg-red-50 px-2 py-1 font-ibm text-[10px] text-red-700">{error}</p>}

          <div className="flex gap-2">
            <button type="button" disabled={saving} onClick={submit}
              className="px-3 py-1.5 text-[10px] font-bold uppercase text-white bg-iscm-crimson hover:bg-[#7a0010] disabled:bg-neutral-300">
              {saving ? (vi ? 'Đang lưu...' : 'Saving...') : (vi ? 'Lưu phiên bản' : 'Save Version')}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="px-3 py-1.5 text-[10px] font-bold uppercase text-neutral-500 hover:text-neutral-800">
              {vi ? 'Huỷ' : 'Cancel'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */

function CalendarTab({ vi, calendarDays, userId, onChanged }) {
  const [form, setForm] = useState({ date: '', day_type: CALENDAR_DAY_TYPES[0], name: '', note: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const submit = async () => {
    if (!form.date) { setError(vi ? 'Cần chọn ngày.' : 'Date is required.'); return; }
    setError('');
    setSaving(true);
    try {
      await addCalendarDay({ date: form.date, day_type: form.day_type, name: form.name.trim() || null, note: form.note.trim() || null }, userId);
      setForm({ date: '', day_type: CALENDAR_DAY_TYPES[0], name: '', note: '' });
      onChanged();
    } catch (e) {
      setError(e.message || (vi ? 'Lưu thất bại.' : 'Save failed.'));
    } finally {
      setSaving(false);
    }
  };

  const remove = async (date) => {
    if (!window.confirm(vi ? `Xoá ngày ${date} khỏi lịch làm việc?` : `Remove ${date} from the working calendar?`)) return;
    await deleteCalendarDay(date, userId);
    onChanged();
  };

  const sorted = useMemo(() => [...calendarDays].sort((a, b) => a.date.localeCompare(b.date)), [calendarDays]);
  const lbl = DAY_TYPE_LABEL[vi ? 'vi' : 'en'];

  return (
    <div className="space-y-3">
      <p className="text-[10px] text-neutral-400 italic">
        {vi
          ? 'Chỉ cần khai báo các ngoại lệ so với ngày làm việc chuẩn (ngày lễ, ngày làm bù) — không cần nhập từng ngày bình thường.'
          : 'Only exceptions to the standard working pattern need entering (holidays, special working days) — normal days don\'t need a row.'}
      </p>

      <div className="flex flex-wrap items-end gap-2.5 border border-neutral-200 p-3">
        <div>
          <label className={labelClass}>{vi ? 'Ngày' : 'Date'}</label>
          <input type="date" value={form.date} onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>{vi ? 'Loại' : 'Type'}</label>
          <select value={form.day_type} onChange={(e) => setForm((p) => ({ ...p, day_type: e.target.value }))} className={inputClass}>
            {CALENDAR_DAY_TYPES.map((t) => <option key={t} value={t}>{lbl[t]}</option>)}
          </select>
        </div>
        <div>
          <label className={labelClass}>{vi ? 'Tên' : 'Name'}</label>
          <input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} className={inputClass}
            placeholder={vi ? 'Vd: Quốc khánh' : 'e.g. National Day'} />
        </div>
        <button type="button" disabled={saving} onClick={submit}
          className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold uppercase text-white bg-iscm-crimson hover:bg-[#7a0010] disabled:bg-neutral-300">
          <Plus className="h-3.5 w-3.5" /> {vi ? 'Thêm' : 'Add'}
        </button>
      </div>
      {error && <p className="rounded-none border border-red-200 bg-red-50 px-2 py-1 font-ibm text-[10px] text-red-700">{error}</p>}

      <div className="border border-neutral-200 overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="bg-neutral-900 text-white font-barlow text-[9px] font-bold uppercase tracking-wider">
              <th className="px-2.5 py-2">{vi ? 'Ngày' : 'Date'}</th>
              <th className="px-2.5 py-2">{vi ? 'Loại' : 'Type'}</th>
              <th className="px-2.5 py-2">{vi ? 'Tên' : 'Name'}</th>
              <th className="px-2.5 py-2" />
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {sorted.map((c) => (
              <tr key={c.date} className="hover:bg-neutral-50/80">
                <td className="px-2.5 py-2 font-semibold text-neutral-800">{c.date}</td>
                <td className="px-2.5 py-2 text-neutral-600">{lbl[c.day_type] || c.day_type}</td>
                <td className="px-2.5 py-2 text-neutral-500">{c.name || '—'}</td>
                <td className="px-2.5 py-2 text-right">
                  <button onClick={() => remove(c.date)} className="text-neutral-400 hover:text-red-700"><Trash2 className="h-3.5 w-3.5" /></button>
                </td>
              </tr>
            ))}
            {sorted.length === 0 && (
              <tr><td colSpan={4} className="px-3 py-6 text-center text-neutral-400 italic">{vi ? 'Chưa có ngoại lệ nào.' : 'No exceptions configured yet.'}</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */

function ScopeTab({ vi, scopes, accounts, policies, userId, onChanged }) {
  const scopeByMember = useMemo(() => new Map(scopes.map((s) => [s.member_id, s])), [scopes]);
  const [draft, setDraft] = useState({}); // memberId -> partial scope fields being edited
  const [savingId, setSavingId] = useState(null);

  const fieldsFor = (accountId) => {
    const scope = scopeByMember.get(accountId);
    return draft[accountId] || { enabled: scope?.enabled !== false, start_date: scope?.start_date || '', end_date: scope?.end_date || '', policy_id: scope?.policy_id || '' };
  };
  const setField = (accountId, key, value) => setDraft((p) => ({ ...p, [accountId]: { ...fieldsFor(accountId), [key]: value } }));

  const save = async (accountId) => {
    const f = fieldsFor(accountId);
    setSavingId(accountId);
    try {
      await upsertMemberScope({
        member_id: accountId, enabled: f.enabled,
        start_date: f.start_date || null, end_date: f.end_date || null,
        policy_id: f.policy_id || null,
      }, userId);
      setDraft((p) => { const n = { ...p }; delete n[accountId]; return n; });
      onChanged();
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="space-y-3">
      <p className="text-[10px] text-neutral-400 italic">
        {vi
          ? 'Xác định ai đang thực sự trong phạm vi chấm công và từ ngày nào — Ma trận và Tổng hợp tháng sẽ không tính Ngày làm việc bình thường trước ngày bắt đầu phạm vi của thành viên. Không cấu hình = phạm vi không giới hạn.'
          : 'Determines who is actually in scope for attendance tracking and from when — the Matrix and Monthly Summary won\'t count Normal Working Days before a member\'s scope start. No row configured = unrestricted scope.'}
      </p>

      <div className="border border-neutral-200 overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="bg-neutral-900 text-white font-barlow text-[9px] font-bold uppercase tracking-wider">
              <th className="px-2.5 py-2">{vi ? 'Thành viên' : 'Member'}</th>
              <th className="px-2.5 py-2">{vi ? 'Kích hoạt' : 'Enabled'}</th>
              <th className="px-2.5 py-2">{vi ? 'Từ ngày' : 'Start Date'}</th>
              <th className="px-2.5 py-2">{vi ? 'Đến ngày' : 'End Date'}</th>
              <th className="px-2.5 py-2">{vi ? 'Chính sách riêng' : 'Pinned Policy'}</th>
              <th className="px-2.5 py-2" />
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {accounts.map((a) => {
              const f = fieldsFor(a.id);
              const dirty = Boolean(draft[a.id]);
              return (
                <tr key={a.id} className="hover:bg-neutral-50/80">
                  <td className="px-2.5 py-2 font-semibold text-neutral-800 whitespace-nowrap">{a.full_name || a.email}</td>
                  <td className="px-2.5 py-2"><input type="checkbox" checked={f.enabled} onChange={(e) => setField(a.id, 'enabled', e.target.checked)} /></td>
                  <td className="px-2.5 py-2"><input type="date" value={f.start_date} onChange={(e) => setField(a.id, 'start_date', e.target.value)} className={`${inputClass} min-w-[130px]`} /></td>
                  <td className="px-2.5 py-2"><input type="date" value={f.end_date} onChange={(e) => setField(a.id, 'end_date', e.target.value)} className={`${inputClass} min-w-[130px]`} /></td>
                  <td className="px-2.5 py-2">
                    <select value={f.policy_id} onChange={(e) => setField(a.id, 'policy_id', e.target.value)} className={`${inputClass} min-w-[140px]`}>
                      <option value="">{vi ? '— Tự động —' : '— Automatic —'}</option>
                      {policies.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                  </td>
                  <td className="px-2.5 py-2">
                    <button disabled={!dirty || savingId === a.id} onClick={() => save(a.id)}
                      className="px-2.5 py-1 text-[9px] font-bold uppercase text-white bg-iscm-crimson hover:bg-[#7a0010] disabled:bg-neutral-200 disabled:text-neutral-400">
                      {savingId === a.id ? (vi ? 'Đang lưu' : 'Saving') : (vi ? 'Lưu' : 'Save')}
                    </button>
                  </td>
                </tr>
              );
            })}
            {accounts.length === 0 && (
              <tr><td colSpan={6} className="px-3 py-6 text-center text-neutral-400 italic">{vi ? 'Không có tài khoản nào.' : 'No accounts found.'}</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */

const ENTITY_LABEL = { vi: { policy: 'Chính sách', calendar_day: 'Lịch làm việc', member_scope: 'Phạm vi thành viên' }, en: { policy: 'Policy', calendar_day: 'Working Calendar', member_scope: 'Attendance Scope' } };
const SETTINGS_ACTION_LABEL = {
  vi: { policy_created: 'Tạo phiên bản chính sách', calendar_day_added: 'Thêm ngoại lệ lịch', calendar_day_removed: 'Xoá ngoại lệ lịch', scope_changed: 'Thay đổi phạm vi thành viên' },
  en: { policy_created: 'Policy version created', calendar_day_added: 'Calendar exception added', calendar_day_removed: 'Calendar exception removed', scope_changed: 'Attendance scope changed' },
};

function fmtDateTime(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

/** Full, append-only history of every change to Attendance Settings —
    answers "why is Normal Working Days different this month" from data
    instead of memory. Reads attendance_audit_logs directly; nothing here
    is reconstructed from other tables the way the pre-Phase-3B Approval
    Timeline had to be. */
function AuditTab({ vi }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchSettingsAuditLogs().then((l) => { setLogs(l); setLoading(false); }); }, []);

  if (loading) return <p className="text-[11px] text-neutral-400 italic p-2">{vi ? 'Đang tải...' : 'Loading...'}</p>;

  const lang = vi ? 'vi' : 'en';

  return (
    <div className="space-y-3">
      <p className="text-[10px] text-neutral-400 italic">
        {vi
          ? 'Toàn bộ thay đổi đối với Chính sách, Lịch làm việc, và Phạm vi thành viên — append-only, không thể sửa hoặc xoá.'
          : 'Every change to Policy, Working Calendar, and Attendance Scope — append-only, can never be edited or deleted.'}
      </p>
      <div className="border border-neutral-200 overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="bg-neutral-900 text-white font-barlow text-[9px] font-bold uppercase tracking-wider">
              <th className="px-2.5 py-2">{vi ? 'Thời gian' : 'When'}</th>
              <th className="px-2.5 py-2">{vi ? 'Người thực hiện' : 'Performed By'}</th>
              <th className="px-2.5 py-2">{vi ? 'Hạng mục' : 'Area'}</th>
              <th className="px-2.5 py-2">{vi ? 'Hành động' : 'Action'}</th>
              <th className="px-2.5 py-2">{vi ? 'Chi tiết' : 'Details'}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {logs.map((l) => (
              <tr key={l.id} className="hover:bg-neutral-50/80 align-top">
                <td className="px-2.5 py-2 text-neutral-600 whitespace-nowrap">{fmtDateTime(l.performed_at)}</td>
                <td className="px-2.5 py-2 text-neutral-800 font-semibold whitespace-nowrap">{l.performer?.full_name || l.performer?.email || '—'}</td>
                <td className="px-2.5 py-2 text-neutral-600 whitespace-nowrap">{ENTITY_LABEL[lang][l.entity_type] || l.entity_type}</td>
                <td className="px-2.5 py-2 text-neutral-600 whitespace-nowrap">{SETTINGS_ACTION_LABEL[lang][l.action] || l.action}</td>
                <td className="px-2.5 py-2 text-neutral-500">
                  {l.new_values && <div className="text-[10px]">{Object.entries(l.new_values).filter(([, v]) => v !== null && v !== undefined).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(',') : v}`).join(' · ')}</div>}
                  {l.reason && <div className="text-[10px] italic">{vi ? 'Lý do' : 'Reason'}: {l.reason}</div>}
                </td>
              </tr>
            ))}
            {logs.length === 0 && (
              <tr><td colSpan={5} className="px-3 py-6 text-center text-neutral-400 italic">{vi ? 'Chưa có thay đổi nào được ghi nhận.' : 'No changes recorded yet.'}</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

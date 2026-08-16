import { useEffect, useMemo, useState } from 'react';
import { CalendarPlus, Search, Send } from 'lucide-react';
import { useAuth } from '../../../auth/AuthContext.jsx';
import { fetchResearchRows } from '../../../data/researchListStore.js';
import { researchList as fallbackResearchRows } from '../../../data/researchList.js';
import {
  ATTENDANCE_TYPES, DURATION_TYPES, OUTSIDE_CATEGORIES, createAttendanceRecord, hasOverlappingRecord, todayIsoLocal,
} from '../../../data/attendanceStore.js';

const inputClass = 'w-full rounded-none border border-neutral-300 bg-white px-2.5 py-1.5 font-ibm text-xs text-iscm-charcoal focus:border-iscm-crimson focus:outline-none';
const labelClass = 'block text-[10px] font-bold text-neutral-400 uppercase mb-1';

const EMPTY = {
  attendance_date: todayIsoLocal(),
  end_date: '',
  attendance_type: ATTENDANCE_TYPES[0],
  duration_type: 'Full Day',
  start_time: '', end_time: '',
  reason: '', location: '', outside_category: '',
  expected_arrival: '',
  related_activity_id: '',
};

export default function ReportAttendanceForm({ lang, onSaved }) {
  const vi = lang === 'vi';
  const { user: authUser } = useAuth();
  const [form, setForm] = useState(EMPTY);
  const [taskRows, setTaskRows] = useState([]);
  const [taskQuery, setTaskQuery] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  useEffect(() => {
    fetchResearchRows().then((rows) => setTaskRows(rows || fallbackResearchRows));
  }, []);

  const set = (key) => (e) => setForm((p) => ({ ...p, [key]: e.target.value }));

  const relatedTask = form.related_activity_id
    ? taskRows.find((r) => String(r.id) === String(form.related_activity_id))
    : null;
  const filteredTasks = useMemo(() => {
    const q = taskQuery.trim().toLowerCase();
    const list = q ? taskRows.filter((r) => (r.task_name || '').toLowerCase().includes(q)) : taskRows;
    return list.slice(0, 20);
  }, [taskRows, taskQuery]);

  const submit = async () => {
    if (!form.attendance_date) { setError(vi ? 'Cần chọn ngày.' : 'Date is required.'); return; }
    if (form.duration_type === 'Custom Time' && (!form.start_time || !form.end_time)) {
      setError(vi ? 'Cần nhập giờ bắt đầu/kết thúc.' : 'Start/End time are required for Custom Time.');
      return;
    }
    setError('');
    setSaving(true);
    const endDate = form.attendance_type === 'Annual Leave' && form.end_date ? form.end_date : form.attendance_date;
    try {
      if (await hasOverlappingRecord(authUser?.id, form.attendance_date, endDate)) {
        setError(vi
          ? 'Bạn đã có một yêu cầu khác trong khoảng ngày này — huỷ hoặc chờ xử lý yêu cầu đó trước.'
          : 'You already have another request overlapping these dates — cancel or resolve it first.');
        setSaving(false);
        return;
      }
      await createAttendanceRecord({
        attendance_date: form.attendance_date,
        end_date: form.attendance_type === 'Annual Leave' && form.end_date ? form.end_date : null,
        attendance_type: form.attendance_type,
        duration_type: form.duration_type,
        start_time: form.duration_type === 'Custom Time' ? form.start_time || null : null,
        end_time: form.duration_type === 'Custom Time' ? form.end_time || null : null,
        reason: form.reason.trim() || null,
        location: form.attendance_type === 'Work Outside' || form.attendance_type === 'Work from Home' ? form.location.trim() || null : null,
        outside_category: form.attendance_type === 'Work Outside' ? form.outside_category || null : null,
        expected_arrival: form.attendance_type === 'Late' ? form.expected_arrival || null : null,
        related_activity_id: form.related_activity_id ? Number(form.related_activity_id) : null,
      }, authUser?.id);
      setNotice(vi ? 'Đã gửi yêu cầu — theo dõi ở lịch bên dưới.' : 'Request submitted — track it on the calendar below.');
      setForm(EMPTY);
      onSaved?.();
      setTimeout(() => setNotice(''), 4000);
    } catch (e) {
      setError(e.message || (vi ? 'Gửi thất bại.' : 'Submit failed.'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-2.5 rounded-lg border border-gray-200 bg-white p-3.5">
      <p className="flex items-center gap-1.5 font-ibm text-xs font-semibold text-iscm-charcoal">
        <CalendarPlus className="h-3.5 w-3.5 text-iscm-crimson" />
        {vi ? 'Đăng ký tình trạng chấm công' : 'Report Attendance'}
      </p>

      <div className="grid grid-cols-2 gap-2.5">
        <div>
          <label className={labelClass}>{vi ? 'Ngày' : 'Date'}</label>
          <input type="date" value={form.attendance_date} onChange={set('attendance_date')} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>{vi ? 'Loại' : 'Attendance Type'}</label>
          <select value={form.attendance_type} onChange={set('attendance_type')} className={inputClass}>
            {ATTENDANCE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
      </div>

      {form.attendance_type === 'Annual Leave' && (
        <div>
          <label className={labelClass}>{vi ? 'Đến ngày (nếu nghỉ nhiều ngày)' : 'To date (if multi-day)'}</label>
          <input type="date" value={form.end_date} onChange={set('end_date')} className={inputClass} min={form.attendance_date} />
        </div>
      )}

      <div className="grid grid-cols-2 gap-2.5">
        <div>
          <label className={labelClass}>{vi ? 'Thời lượng' : 'Duration'}</label>
          <select value={form.duration_type} onChange={set('duration_type')} className={inputClass}>
            {DURATION_TYPES.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
        {form.attendance_type === 'Work Outside' && (
          <div>
            <label className={labelClass}>{vi ? 'Loại công tác' : 'Outside Work Category'}</label>
            <select value={form.outside_category} onChange={set('outside_category')} className={inputClass}>
              <option value="">{vi ? '— Chọn —' : '— Select —'}</option>
              {OUTSIDE_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        )}
        {form.attendance_type === 'Late' && (
          <div>
            <label className={labelClass}>{vi ? 'Giờ dự kiến đến' : 'Expected Arrival'}</label>
            <input type="time" value={form.expected_arrival} onChange={set('expected_arrival')} className={inputClass} />
          </div>
        )}
      </div>

      {form.duration_type === 'Custom Time' && (
        <div className="grid grid-cols-2 gap-2.5">
          <div>
            <label className={labelClass}>{vi ? 'Bắt đầu' : 'Start Time'}</label>
            <input type="time" value={form.start_time} onChange={set('start_time')} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>{vi ? 'Kết thúc' : 'End Time'}</label>
            <input type="time" value={form.end_time} onChange={set('end_time')} className={inputClass} />
          </div>
        </div>
      )}

      {(form.attendance_type === 'Work Outside' || form.attendance_type === 'Work from Home') && (
        <div>
          <label className={labelClass}>{vi ? 'Địa điểm' : 'Location'}</label>
          <input value={form.location} onChange={set('location')} className={inputClass}
            placeholder={form.attendance_type === 'Work Outside' ? (vi ? 'Vd: UBND Quận 1' : 'e.g. District 1 People\'s Committee') : (vi ? 'Vd: Nhà riêng' : 'e.g. Home')} />
        </div>
      )}

      <div>
        <label className={labelClass}>{vi ? 'Lý do' : 'Reason'}</label>
        <textarea rows={2} value={form.reason} onChange={set('reason')} className={inputClass}
          placeholder={vi ? 'Lý do / ghi chú...' : 'Reason / note...'} />
      </div>

      <div>
        <label className={labelClass}>{vi ? 'Hoạt động liên quan (không bắt buộc)' : 'Related Activity (optional)'}</label>
        {relatedTask ? (
          <div className="flex items-center justify-between border border-neutral-200 bg-neutral-50 px-2.5 py-1.5 text-xs">
            <span className="font-semibold text-neutral-800">{relatedTask.task_name}</span>
            <button type="button" onClick={() => setForm((p) => ({ ...p, related_activity_id: '' }))} className="text-neutral-400 hover:text-iscm-crimson text-[10px] font-bold uppercase">
              {vi ? 'Bỏ chọn' : 'Clear'}
            </button>
          </div>
        ) : (
          <div className="border border-neutral-200">
            <div className="relative p-1.5 border-b border-neutral-100">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-400" />
              <input type="text" value={taskQuery} onChange={(e) => setTaskQuery(e.target.value)}
                placeholder={vi ? 'Tìm hoạt động...' : 'Search activity...'}
                className="w-full border border-neutral-200 bg-white py-1.5 pl-8 pr-2.5 text-xs focus:border-iscm-crimson focus:outline-none" />
            </div>
            {taskQuery && (
              <div className="max-h-28 overflow-y-auto divide-y divide-neutral-100">
                {filteredTasks.map((r) => (
                  <button key={r.id} type="button" onClick={() => { setForm((p) => ({ ...p, related_activity_id: r.id })); setTaskQuery(''); }}
                    className="w-full text-left px-2.5 py-1.5 text-xs text-neutral-700 hover:bg-neutral-50">
                    {r.task_name} <span className="text-neutral-400">· {r.research_unit}</span>
                  </button>
                ))}
                {filteredTasks.length === 0 && <div className="px-2.5 py-2 text-center text-[11px] text-neutral-400">{vi ? 'Không tìm thấy.' : 'No matches.'}</div>}
              </div>
            )}
          </div>
        )}
      </div>

      {error && <p className="rounded-none border border-red-200 bg-red-50 px-2 py-1 font-ibm text-[10px] text-red-700">{error}</p>}
      {notice && <p className="rounded-none border border-emerald-200 bg-emerald-50 px-2 py-1 font-ibm text-[10px] text-emerald-700">{notice}</p>}

      <button type="button" disabled={saving} onClick={submit}
        className="flex w-full items-center justify-center gap-1.5 rounded-none px-3 py-2 font-ibm text-xs font-bold uppercase tracking-wide text-white bg-iscm-crimson hover:bg-[#7a0010] disabled:cursor-not-allowed disabled:bg-neutral-300 transition-colors">
        <Send className="h-3.5 w-3.5" /> {saving ? (vi ? 'Đang gửi...' : 'Sending...') : (vi ? 'Gửi yêu cầu' : 'Submit Request')}
      </button>
    </div>
  );
}

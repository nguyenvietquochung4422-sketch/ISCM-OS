import { useState } from 'react';
import { CalendarPlus, Lock, Send, UserRound } from 'lucide-react';
import { ATTENDANCE_LEGEND, ATTENDANCE_RECORD_TYPES, MY_YTD_ATTENDANCE } from '../../data/attendanceData.js';
import { saveSubmission } from '../../data/formSubmissions.js';
import { isLive } from '../../lib/supabaseClient.js';
import { useAuth } from '../../auth/AuthContext.jsx';
import { submitAttendanceRequestRemote } from '../../data/attendanceAdmin.js';

/* Daily Attendance Log — integrates iscm daily attendance checklist.xlsx.
   Personal tracking only; the institute-wide admin view lives in
   InstituteAttendancePanel.jsx under My Portal > Admin. */

const REQUESTABLE_TYPES = ATTENDANCE_LEGEND.filter((s) => s.requestable);
const inputClass = 'w-full rounded-none border border-neutral-300 bg-white px-2.5 py-1.5 font-ibm text-xs text-iscm-charcoal focus:border-iscm-crimson focus:outline-none';

// Requests submitted here are the same "Work from home"/"Leave" requests
// that used to be separate Form Portal entries — consolidated into one
// place since they're all just entries in the same daily attendance record.
function AttendanceRequestForm({ lang }) {
  const { user: authUser } = useAuth();
  const [type, setType] = useState(REQUESTABLE_TYPES[0].key);
  const [day, setDay] = useState(null); // WFH-only weekday picker
  const [date, setDate] = useState('');
  const [note, setNote] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const current = ATTENDANCE_LEGEND.find((s) => s.key === type);
  const isWfh = type === 'wfh';
  const minAdvanceMs = current?.leadTime === '6mo' ? 182 * 86400000 : 24 * 3600000;
  const dateOk = isWfh ? day != null : (date ? new Date(date).getTime() - Date.now() >= minAdvanceMs : null);

  const handleSubmit = () => {
    if (!dateOk) return;
    saveSubmission(
      { label: 'Daily Attendance', group: 'Human Resources & Admin' },
      { form: `Daily Attendance — ${current.label}`, note: isWfh ? `Remote day: ${day}` : note }
    );
    if (isLive && authUser) {
      submitAttendanceRequestRemote({
        statusKey: type, statusLabel: current.label, date: isWfh ? null : date,
        note: isWfh ? `Remote day: ${day}` : note, requesterId: authUser.id,
      });
    }
    setSubmitted(true);
    setDate(''); setDay(null); setNote('');
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <div className="space-y-2.5 rounded-lg border border-gray-200 bg-white p-3.5">
      <p className="flex items-center gap-1.5 font-ibm text-xs font-semibold text-iscm-charcoal">
        <CalendarPlus className="h-3.5 w-3.5 text-iscm-crimson" />
        {lang === 'vi' ? 'Gửi yêu cầu (WFH, nghỉ phép, đi trễ, công tác...)' : 'Submit a request (WFH, leave, late, off-site work...)'}
      </p>

      <select value={type} onChange={(e) => { setType(e.target.value); setDay(null); setDate(''); }} className={inputClass}>
        {REQUESTABLE_TYPES.map((s) => (
          <option key={s.key} value={s.key}>{lang === 'vi' ? s.vi : s.label}</option>
        ))}
      </select>

      {isWfh ? (
        <div className="space-y-1.5">
          <p className="font-ibm text-[11px] text-gray-500">
            {lang === 'vi' ? 'Chọn ngày remote trong tuần tới:' : 'Select remote day for next week:'}
          </p>
          <div className="grid grid-cols-5 gap-1.5">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map((d) => (
              <button key={d} type="button" disabled={d === 'Mon'}
                onClick={() => setDay(d)}
                className={`rounded-none border p-1.5 text-center font-ibm text-[11px] transition-colors ${
                  d === 'Mon' ? 'cursor-not-allowed border-neutral-200 bg-neutral-100 text-neutral-400'
                  : day === d ? 'border-iscm-crimson bg-iscm-crimson text-white'
                  : 'border-neutral-300 bg-white hover:border-iscm-crimson'
                }`}>
                {d}{d === 'Mon' && <Lock className="mx-auto mt-0.5 h-3 w-3 text-neutral-400" />}
              </button>
            ))}
          </div>
          <p className="rounded-none border border-amber-200 bg-amber-50 px-2 py-1 font-ibm text-[10px] text-amber-800">
            {lang === 'vi'
              ? '🔒 Monday Rule: Thứ Hai khóa Onsite — All-hands, academic seminars & core team ops.'
              : '🔒 Monday Rule: Monday is locked Onsite — All-hands, academic seminars & core team ops.'}
          </p>
        </div>
      ) : (
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inputClass} />
      )}

      {!isWfh && (
        <textarea rows={2} value={note} onChange={(e) => setNote(e.target.value)} className={inputClass}
          placeholder={lang === 'vi' ? 'Lý do / ghi chú...' : 'Justification / note...'} />
      )}

      {dateOk === false && (
        <p className="rounded-none border border-red-200 bg-red-50 px-2 py-1 font-ibm text-[10px] text-red-700">
          {current.leadTime === '6mo'
            ? (lang === 'vi' ? 'Nghỉ phép năm cần đăng ký trước ít nhất 6 tháng.' : 'Annual Leave must be registered at least 6 months in advance.')
            : (lang === 'vi' ? 'Cần khai báo trước ít nhất 24 giờ.' : 'Must be declared at least 24 hours in advance.')}
        </p>
      )}

      <button type="button" disabled={!dateOk} onClick={handleSubmit}
        className={`flex w-full items-center justify-center gap-1.5 rounded-none px-3 py-2 font-ibm text-xs font-bold uppercase tracking-wide text-white transition-colors ${
          dateOk ? 'bg-iscm-crimson hover:bg-[#7a0010]' : 'cursor-not-allowed bg-neutral-300'
        }`}>
        <Send className="h-3.5 w-3.5" /> {lang === 'vi' ? 'Gửi yêu cầu' : 'Submit request'}
      </button>

      {submitted && (
        <p className="font-ibm text-[10px] text-emerald-700">
          {lang === 'vi' ? 'Đã gửi — theo dõi tại Đơn từ gửi đi.' : 'Submitted — track it under My Forms Request Status.'}
        </p>
      )}
    </div>
  );
}

export default function AttendanceLogPanel({ lang = 'vi' }) {
  return (
    <div className="space-y-5">
      <AttendanceRequestForm lang={lang} />

      {/* Personal YTD */}
      <div>
        <p className="mb-2 flex items-center gap-1.5 font-ibm text-xs font-semibold text-iscm-charcoal">
          <UserRound className="h-3.5 w-3.5 text-iscm-crimson" /> My 2026 YTD
        </p>
        <div className="grid grid-cols-4 gap-1.5">
          {ATTENDANCE_LEGEND.map((s) => (
            <div key={s.key} className={`rounded-lg border p-2 text-center ${
              s.key === 'absence_no_permit' && MY_YTD_ATTENDANCE[s.key] > 0
                ? 'border-red-200 bg-red-50' : 'border-gray-100 bg-iscm-surface/60'
            }`}>
              <div className="font-barlow-condensed text-lg font-bold text-iscm-charcoal">{MY_YTD_ATTENDANCE[s.key] ?? 0}</div>
              <div className="truncate font-ibm text-[9px] text-gray-500" title={s.label}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Legend + coverage, merged — both were static reference tables saying
          overlapping things (which statuses exist, what else counts as one). */}
      <div>
        <p className="mb-2 font-ibm text-xs font-semibold text-iscm-charcoal">
          {lang === 'vi' ? 'Trạng thái & phạm vi ghi nhận' : 'Status & Coverage'}
        </p>
        <div className="grid gap-1.5 sm:grid-cols-2">
          {ATTENDANCE_LEGEND.map((s) => (
            <div key={s.key} className="rounded-lg border border-gray-100 bg-iscm-surface/60 p-2">
              <div className="font-ibm text-[11px] font-semibold text-iscm-charcoal">{s.label} <span className="text-gray-400">— {s.vi}</span></div>
              <div className="font-ibm text-[10px] text-gray-500">{lang === 'vi' ? s.descVi : s.desc}</div>
            </div>
          ))}
          {ATTENDANCE_RECORD_TYPES.map((r) => (
            <div key={r.key} className="rounded-lg border border-gray-100 bg-iscm-surface/60 p-2">
              <div className="font-ibm text-[11px] font-semibold text-iscm-charcoal">{r.label}</div>
              <div className="font-ibm text-[10px] text-gray-500">{lang === 'vi' ? r.descVi : r.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

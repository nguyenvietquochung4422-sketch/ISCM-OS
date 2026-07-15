import { useEffect, useState } from 'react';
import { Check, Clock3, AlertCircle, CalendarPlus, FileSpreadsheet, Lock, Send, ShieldCheck, UserRound, X } from 'lucide-react';
import {
  ATTENDANCE_DEADLINES, ATTENDANCE_LEGEND, ATTENDANCE_RECORD_TYPES, INSTITUTE_YTD_TOTALS, MY_YTD_ATTENDANCE,
  RECENT_LOG_SAMPLE, STAFF_ROSTER,
} from '../../data/attendanceData.js';
import { saveSubmission } from '../../data/formSubmissions.js';
import { isLive } from '../../lib/supabaseClient.js';
import { useAuth } from '../../auth/AuthContext.jsx';
import {
  canManageAttendance, submitAttendanceRequestRemote, fetchAllAttendanceRequests, decideAttendanceRequestRemote,
} from '../../data/attendanceAdmin.js';

/* Daily Attendance Log — integrates iscm daily attendance checklist.xlsx */

const maxTotal = Math.max(...Object.values(INSTITUTE_YTD_TOTALS));
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

function fmtDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('vi-VN');
}

// Visible only to admins/permitted accounts — the approval side of the
// requests submitted above, for everyone's WFH/leave/absence/late requests,
// not just the signed-in account's own.
function AttendanceAdminSection({ lang }) {
  const [canManage, setCanManage] = useState(false);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    canManageAttendance().then((ok) => {
      setCanManage(ok);
      if (ok) fetchAllAttendanceRequests().then((r) => { setRequests(r); setLoading(false); });
      else setLoading(false);
    });
  }, []);

  if (!canManage) return null;

  const pending = requests.filter((r) => r.status === 'Open');

  const handleDecide = async (r, status) => {
    setRequests((prev) => prev.map((x) => (x.id === r.id ? { ...x, status } : x)));
    await decideAttendanceRequestRemote(r, status);
  };

  return (
    <div className="space-y-2.5 rounded-lg border border-gray-200 bg-white p-3.5">
      <p className="flex items-center gap-1.5 font-ibm text-xs font-semibold text-iscm-charcoal">
        <ShieldCheck className="h-3.5 w-3.5 text-iscm-crimson" />
        {lang === 'vi' ? 'Duyệt yêu cầu chấm công' : 'Attendance requests to approve'}
        {pending.length > 0 && (
          <span className="rounded-full bg-iscm-crimson px-1.5 py-0.5 text-[9px] font-bold text-white">{pending.length}</span>
        )}
      </p>
      {loading ? (
        <p className="font-ibm text-[11px] text-gray-400">{lang === 'vi' ? 'Đang tải...' : 'Loading...'}</p>
      ) : pending.length === 0 ? (
        <p className="font-ibm text-[11px] text-gray-400">{lang === 'vi' ? 'Không có yêu cầu chờ duyệt.' : 'No pending requests.'}</p>
      ) : (
        <ul className="space-y-1.5">
          {pending.map((r) => (
            <li key={r.id} className="flex flex-col gap-1.5 border border-gray-100 bg-iscm-surface/60 p-2.5 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="font-ibm text-xs font-semibold text-iscm-charcoal">{r.status_label}</p>
                <p className="font-ibm text-[10px] text-gray-500">
                  {r.requester?.full_name || r.requester_id} · {fmtDate(r.request_date)}
                </p>
                {r.note && <p className="font-ibm text-[10px] italic text-gray-400">{r.note}</p>}
              </div>
              <div className="flex shrink-0 gap-1.5">
                <button onClick={() => handleDecide(r, 'Approved')} className="flex items-center gap-1 border border-emerald-300 bg-emerald-50 px-2 py-1 font-ibm text-[10px] font-bold uppercase text-emerald-700 hover:bg-emerald-100">
                  <Check className="h-3 w-3" /> {lang === 'vi' ? 'Duyệt' : 'Approve'}
                </button>
                <button onClick={() => handleDecide(r, 'Rejected')} className="flex items-center gap-1 border border-red-300 bg-red-50 px-2 py-1 font-ibm text-[10px] font-bold uppercase text-red-700 hover:bg-red-100">
                  <X className="h-3 w-3" /> {lang === 'vi' ? 'Từ chối' : 'Reject'}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function AttendanceLogPanel({ lang = 'vi' }) {
  return (
    <div className="space-y-5">
      <AttendanceRequestForm lang={lang} />
      <AttendanceAdminSection lang={lang} />

      {/* Deadline banner */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-lg bg-iscm-cta p-3 text-center text-white">
          <Clock3 className="mx-auto mb-1 h-4 w-4" />
          <div className="font-barlow-condensed text-lg font-bold">{ATTENDANCE_DEADLINES.officeCheckIn}</div>
          <div className="font-ibm text-[10px] text-white/70">Office check-in</div>
        </div>
        <div className="rounded-lg bg-iscm-crimson p-3 text-center text-white">
          <Clock3 className="mx-auto mb-1 h-4 w-4" />
          <div className="font-barlow-condensed text-lg font-bold">{ATTENDANCE_DEADLINES.formLock}</div>
          <div className="font-ibm text-[10px] text-white/70">Form lock (general)</div>
        </div>
        <div className="rounded-lg bg-iscm-charcoal p-3 text-center text-white">
          <Clock3 className="mx-auto mb-1 h-4 w-4" />
          <div className="font-barlow-condensed text-lg font-bold">{ATTENDANCE_DEADLINES.okrFinalLog}</div>
          <div className="font-ibm text-[10px] text-white/70">OKR final log</div>
        </div>
      </div>

      <div className="flex items-start gap-2 rounded-lg bg-amber-50 p-3 font-ibm text-[11px] text-amber-800">
        <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
        Chốt log 17:00 hằng ngày là dữ liệu đầu vào cho OKR quý và kỳ xét thù lao — mọi cập nhật sau 08:30 cần phê duyệt của Quản lý trực tiếp.
      </div>

      {/* Personal YTD — 'Hùng' column of 2026_Daily attendance record */}
      <div>
        <p className="mb-2 flex items-center gap-1.5 font-ibm text-xs font-semibold text-iscm-charcoal">
          <UserRound className="h-3.5 w-3.5 text-iscm-crimson" /> My 2026 YTD (cột "Hùng" — đồng bộ từ workbook)
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

      {/* Legend */}
      <div>
        <p className="mb-2 font-ibm text-xs font-semibold text-iscm-charcoal">8 trạng thái chuẩn / Status keywords</p>
        <div className="grid gap-1.5 sm:grid-cols-2">
          {ATTENDANCE_LEGEND.map((s) => (
            <div key={s.key} className="rounded-lg border border-gray-100 bg-iscm-surface/60 p-2">
              <div className="font-ibm text-[11px] font-semibold text-iscm-charcoal">{s.label} <span className="text-gray-400">— {s.vi}</span></div>
              <div className="font-ibm text-[10px] text-gray-500">{lang === 'vi' ? s.descVi : s.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* What this log also covers */}
      <div>
        <p className="mb-2 font-ibm text-xs font-semibold text-iscm-charcoal">
          {lang === 'vi' ? 'Phạm vi ghi nhận' : 'Also covers'}
        </p>
        <div className="grid gap-1.5 sm:grid-cols-2">
          {ATTENDANCE_RECORD_TYPES.map((r) => (
            <div key={r.key} className="rounded-lg border border-gray-100 bg-iscm-surface/60 p-2">
              <div className="font-ibm text-[11px] font-semibold text-iscm-charcoal">{r.label}</div>
              <div className="font-ibm text-[10px] text-gray-500">{lang === 'vi' ? r.descVi : r.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Institute-wide 2026 snapshot */}
      <div>
        <p className="mb-2 font-ibm text-xs font-semibold text-iscm-charcoal">
          Institute-wide 2026 YTD ({STAFF_ROSTER.length} nhân sự)
        </p>
        <div className="space-y-1.5">
          {ATTENDANCE_LEGEND.filter((s) => s.key in INSTITUTE_YTD_TOTALS).map((s) => (
            <div key={s.key} className="flex items-center gap-2">
              <span className="w-40 shrink-0 truncate font-ibm text-[10px] text-gray-500">{s.label}</span>
              <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-gray-100">
                <div className="h-full rounded-full bg-iscm-crimson"
                  style={{ width: `${(INSTITUTE_YTD_TOTALS[s.key] / maxTotal) * 100}%` }} />
              </div>
              <span className="w-8 shrink-0 text-right font-barlow-condensed text-xs font-semibold text-iscm-charcoal">
                {INSTITUTE_YTD_TOTALS[s.key]}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent log sample */}
      <div>
        <p className="mb-2 flex items-center gap-1.5 font-ibm text-xs font-semibold text-iscm-charcoal">
          <FileSpreadsheet className="h-3.5 w-3.5 text-iscm-crimson" /> Recent log sample (synced)
        </p>
        <div className="overflow-hidden rounded-lg border border-gray-200">
          <table className="w-full text-left font-ibm text-[11px]">
            <thead className="bg-iscm-surface text-gray-400">
              <tr><th className="px-2.5 py-1.5">Date</th><th className="px-2.5 py-1.5">Nhân sự</th><th className="px-2.5 py-1.5">Trạng thái</th></tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {RECENT_LOG_SAMPLE.map((r, i) => (
                <tr key={i}>
                  <td className="px-2.5 py-1.5 text-gray-500">{r.day} {r.date}</td>
                  <td className="px-2.5 py-1.5 font-medium">{r.staff}</td>
                  <td className="px-2.5 py-1.5 text-iscm-crimson">{r.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <p className="font-ibm text-[10px] text-gray-400">
        Nguồn: <code>iscm daily attendance checklist.xlsx</code> — Description, 2026_Daily attendance record, Jul sheets.
      </p>
    </div>
  );
}

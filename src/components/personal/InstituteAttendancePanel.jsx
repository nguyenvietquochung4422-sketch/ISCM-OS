import { useEffect, useState } from 'react';
import { Check, ShieldCheck, X } from 'lucide-react';
import { ATTENDANCE_LEGEND, INSTITUTE_YTD_TOTALS, STAFF_ROSTER, DAILY_LOG_ENTRIES } from '../../data/attendanceData.js';
import {
  canManageAttendance, fetchAllAttendanceRequests, decideAttendanceRequestRemote,
} from '../../data/attendanceAdmin.js';

const maxTotal = Math.max(...Object.values(INSTITUTE_YTD_TOTALS));
// The Jul 2025 sheet's own staff columns — not STAFF_ROSTER, which is a
// different (2026) roster snapshot with several different names on it.
const LOG_STAFF_NAMES = [...new Set(DAILY_LOG_ENTRIES.map((e) => e.staff))].sort((a, b) => a.localeCompare(b, 'vi'));

function fmtDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('vi-VN');
}

/**
 * Institute-wide attendance — the admin counterpart to the personal-only
 * "Daily Attendance" pane in My Portal. Covers everyone's pending WFH/leave
 * requests, institute-wide YTD totals, and a per-staff drill-down log.
 * Gated by canManageAttendance() (is_top_admin, or delegated via
 * content_permissions for 'attendance-log').
 */
export default function InstituteAttendancePanel({ lang = 'vi' }) {
  const [canManage, setCanManage] = useState(false);
  const [checked, setChecked] = useState(false);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [staffFilter, setStaffFilter] = useState('all');

  useEffect(() => {
    canManageAttendance().then((ok) => {
      setCanManage(ok);
      setChecked(true);
      if (ok) fetchAllAttendanceRequests().then((r) => { setRequests(r); setLoading(false); });
      else setLoading(false);
    });
  }, []);

  if (!checked) {
    return <div className="font-sans text-xs text-neutral-400 p-4">{lang === 'vi' ? 'Đang kiểm tra quyền...' : 'Checking permissions...'}</div>;
  }

  if (!canManage) {
    return (
      <div className="font-sans text-xs text-red-700 p-4 border border-red-200 bg-red-50">
        {lang === 'vi'
          ? 'Bạn không có quyền truy cập mục này. Chỉ Admin, Director, Vice Director, hoặc tài khoản được cấp quyền quản lý chấm công mới xem được.'
          : 'You do not have access to this page. Only Admin, Director, Vice Director, or an account granted attendance-management rights can view this.'}
      </div>
    );
  }

  const pending = requests.filter((r) => r.status === 'Open');
  const logEntries = DAILY_LOG_ENTRIES
    .filter((e) => staffFilter === 'all' || e.staff === staffFilter)
    .slice()
    .sort((a, b) => (a.date === b.date ? 0 : a.date < b.date ? -1 : 1));

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

      {/* Team-wide stats */}
      <div className="border-t border-gray-100 pt-2.5">
        <p className="mb-2 font-ibm text-xs font-semibold text-iscm-charcoal">
          {lang === 'vi' ? `Thống kê toàn viện 2026 (${STAFF_ROSTER.length} nhân sự)` : `Institute-wide 2026 YTD (${STAFF_ROSTER.length} staff)`}
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

      {/* Detail log — who was what, on which day. Real data: the workbook's
          "Jul" monthly sheet is the only month with entries actually filled
          in (every other month sheet is a blank template), so this covers
          2025-07-01 through 2025-07-30. */}
      <div className="border-t border-gray-100 pt-2.5">
        <div className="mb-2 flex items-center justify-between gap-2">
          <p className="font-ibm text-xs font-semibold text-iscm-charcoal">
            {lang === 'vi' ? 'Chi tiết theo ngày (Jul 2025)' : 'Daily detail log (Jul 2025)'}
          </p>
          <select
            value={staffFilter}
            onChange={(e) => setStaffFilter(e.target.value)}
            className="border border-neutral-200 bg-white px-2 py-1 font-ibm text-[10px] text-neutral-700 focus:border-iscm-crimson focus:outline-none rounded-none"
          >
            <option value="all">{lang === 'vi' ? 'Tất cả nhân sự' : 'All staff'}</option>
            {LOG_STAFF_NAMES.map((name) => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>
        </div>
        <div className="overflow-x-auto border border-neutral-200">
          <table className="w-full min-w-[420px] table-fixed border-collapse text-left">
            <thead>
              <tr className="border-b border-neutral-200 bg-neutral-900 font-barlow text-[10px] font-bold uppercase tracking-wider text-white">
                <th className="px-3 py-2 w-[22%]">{lang === 'vi' ? 'Ngày' : 'Date'}</th>
                <th className="px-3 py-2 w-[22%]">{lang === 'vi' ? 'Nhân sự' : 'Staff'}</th>
                <th className="px-3 py-2 w-[56%]">{lang === 'vi' ? 'Trạng thái' : 'Status'}</th>
              </tr>
            </thead>
            <tbody className="max-h-[320px] divide-y divide-neutral-100 font-ibm text-xs">
              {logEntries.map((e, i) => (
                <tr key={i} className="hover:bg-neutral-50/80 transition-colors">
                  <td className="px-3 py-1.5 text-neutral-500 whitespace-nowrap">{e.day} {e.date}</td>
                  <td className="px-3 py-1.5 font-medium text-neutral-800">{e.staff}</td>
                  <td className="px-3 py-1.5 text-iscm-crimson">{e.status}</td>
                </tr>
              ))}
              {logEntries.length === 0 && (
                <tr><td colSpan={3} className="px-3 py-6 text-center text-neutral-400 italic">
                  {lang === 'vi' ? 'Không có bản ghi.' : 'No entries.'}
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

import { Clock3, AlertCircle, FileSpreadsheet, UserRound } from 'lucide-react';
import {
  ATTENDANCE_DEADLINES, ATTENDANCE_LEGEND, INSTITUTE_YTD_TOTALS, MY_YTD_ATTENDANCE,
  RECENT_LOG_SAMPLE, STAFF_ROSTER,
} from '../../data/attendanceData.js';

/* Daily Attendance Log — integrates iscm daily attendance checklist.xlsx */

const maxTotal = Math.max(...Object.values(INSTITUTE_YTD_TOTALS));

export default function AttendanceLogPanel() {
  return (
    <div className="space-y-5">
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
              <div className="font-ibm text-[11px] font-semibold text-iscm-charcoal">{s.label}</div>
              <div className="font-ibm text-[10px] text-gray-500">{s.vi} — {s.desc}</div>
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

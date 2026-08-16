import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Info } from 'lucide-react';
import { ATTENDANCE_TYPES } from '../../../data/attendanceStore.js';
import { getMemberAttendanceSummary, monthRange, yearRange } from '../../../data/attendanceAggregation.js';

const UNIT_VI = {
  'Annual Leave': 'ngày', 'Absence': 'ngày', 'Work from Home': 'ngày', 'Work Outside': 'ngày', 'Late': 'lần',
};

function TypeRow({ vi, type, approved, pending }) {
  const isLate = type === 'Late';
  return (
    <div className="flex items-center justify-between border-b border-neutral-50 last:border-none py-1.5">
      <span className="text-xs text-neutral-700">{type}</span>
      <div className="text-right">
        {isLate ? (
          <span className="text-xs font-semibold text-neutral-800">
            {approved.occurrences} {vi ? 'lần' : 'occurrences'}
            {approved.customMinutes > 0 && <span className="text-neutral-400 font-normal"> · {Math.round(approved.customMinutes)}m</span>}
          </span>
        ) : (
          <span className="text-xs font-semibold text-neutral-800">
            {approved.occurrences} {vi ? 'lần' : 'occurrences'}
            {approved.equivalentDays > 0 && <span className="text-neutral-400 font-normal"> · {approved.equivalentDays} {vi ? UNIT_VI[type] : 'days'}</span>}
          </span>
        )}
        {pending.occurrences > 0 && (
          <div className="text-[10px] text-amber-700">
            +{pending.occurrences} {vi ? 'đang chờ duyệt' : 'pending'}
            {!isLate && pending.equivalentDays > 0 && ` (${pending.equivalentDays}d)`}
          </div>
        )}
      </div>
    </div>
  );
}

/** Month + Year-to-Date summary for one member — the single Approved-vs-
    Pending, days-vs-occurrences aggregation, backed entirely by
    attendanceAggregation.summarizeRecords so it can never drift from what
    History/Matrix report for the same records. */
export default function MonthlySummaryCard({ vi, records, memberId, context }) {
  const [cursor, setCursor] = useState(() => { const n = new Date(); return { y: n.getFullYear(), m: n.getMonth() }; });

  const { from, to } = monthRange(cursor.y, cursor.m);
  const monthSummary = useMemo(() => getMemberAttendanceSummary(records, memberId, from, to, context), [records, memberId, from, to, context]);

  const ytdRange = yearRange(cursor.y);
  const ytdSummary = useMemo(() => getMemberAttendanceSummary(records, memberId, ytdRange.from, ytdRange.to, context), [records, memberId, ytdRange.from, ytdRange.to, context]);

  const monthLabel = new Date(cursor.y, cursor.m, 1).toLocaleDateString(vi ? 'vi-VN' : 'en-US', { month: 'long', year: 'numeric' });

  return (
    <div className="border border-gray-200 bg-white p-3.5 space-y-4">
      <div className="flex items-center justify-between">
        <p className="font-ibm text-xs font-semibold text-iscm-charcoal">{vi ? 'Tổng hợp tháng' : 'Monthly Summary'}</p>
        <div className="flex items-center gap-1.5">
          <button onClick={() => setCursor((c) => c.m === 0 ? { y: c.y - 1, m: 11 } : { y: c.y, m: c.m - 1 })} className="p-1 border border-neutral-200 hover:border-iscm-crimson"><ChevronLeft className="h-3.5 w-3.5" /></button>
          <span className="text-xs font-semibold text-neutral-700 capitalize min-w-[110px] text-center">{monthLabel}</span>
          <button onClick={() => setCursor((c) => c.m === 11 ? { y: c.y + 1, m: 0 } : { y: c.y, m: c.m + 1 })} className="p-1 border border-neutral-200 hover:border-iscm-crimson"><ChevronRight className="h-3.5 w-3.5" /></button>
        </div>
      </div>

      <div className="border border-emerald-200 bg-emerald-50 px-3 py-2 flex items-start gap-1.5">
        <Info className="h-3.5 w-3.5 text-emerald-700 shrink-0 mt-0.5" />
        <div>
          <p className="text-xs font-bold text-emerald-800">
            {monthSummary.normalWorkingDaysEstimate} {vi
              ? `ngày làm việc bình thường${monthSummary.isEstimate ? ' (ước tính)' : ''}`
              : `Normal Working Days${monthSummary.isEstimate ? ' (estimated)' : ''}`}
          </p>
          <p className="text-[10px] text-emerald-700 mt-0.5">
            {monthSummary.isEstimate
              ? (vi
                ? `Tính từ ${monthSummary.workingDaysInRange} ngày trong tuần trừ các ngoại lệ đã duyệt. Chưa cấu hình đầy đủ lịch làm việc/ngày lễ của Viện.`
                : `Calculated from ${monthSummary.workingDaysInRange} weekdays minus approved exceptions. Working calendar/holidays are not fully configured yet.`)
              : (vi
                ? `Tính từ ${monthSummary.workingDaysInRange} ngày làm việc theo lịch của Viện, trừ các ngoại lệ đã duyệt.`
                : `Calculated from ${monthSummary.workingDaysInRange} working days per the institute's configured calendar, minus approved exceptions.`)}
          </p>
        </div>
      </div>

      <div>
        {ATTENDANCE_TYPES.map((t) => (
          <TypeRow key={t} vi={vi} type={t} approved={monthSummary.approved[t]} pending={monthSummary.pending[t]} />
        ))}
      </div>

      <div className="border-t border-neutral-100 pt-2 flex flex-wrap gap-3 text-[10px] text-neutral-500">
        <span>{vi ? 'Chờ duyệt' : 'Pending'}: <b className="text-amber-700">{monthSummary.statusCounts.pending}</b></span>
        <span>{vi ? 'Từ chối' : 'Rejected'}: <b className="text-red-700">{monthSummary.statusCounts.rejected}</b></span>
        <span>{vi ? 'Đã huỷ' : 'Cancelled'}: <b className="text-neutral-500">{monthSummary.statusCounts.cancelled}</b></span>
      </div>

      <div className="border-t border-neutral-100 pt-3">
        <p className="text-[10px] font-bold uppercase tracking-wide text-neutral-400 mb-1.5">{cursor.y} {vi ? 'Từ đầu năm' : 'Year to Date'}</p>
        <div className="grid grid-cols-5 gap-1.5">
          {ATTENDANCE_TYPES.map((t) => (
            <div key={t} className="border border-neutral-100 bg-neutral-50 p-1.5 text-center">
              <div className="font-barlow text-sm font-black text-neutral-800">
                {t === 'Late' ? ytdSummary.approved[t].occurrences : ytdSummary.approved[t].equivalentDays}
              </div>
              <div className="text-[8px] text-neutral-400 uppercase truncate" title={t}>{t}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

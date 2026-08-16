import { CheckCircle2 } from 'lucide-react';
import { recordCoversDate, todayIsoLocal } from '../../../data/attendanceStore.js';

export default function TodayStatusCard({ vi, records }) {
  const todayIso = todayIsoLocal();
  const today = records.find((r) => r.approval_status !== 'Cancelled' && r.approval_status !== 'Rejected' && recordCoversDate(r, todayIso));
  const todayLabel = new Date().toLocaleDateString(vi ? 'vi-VN' : 'en-US', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });

  return (
    <div className="border border-gray-200 bg-white p-3.5">
      <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1">{vi ? 'Hôm nay' : 'Today'}</p>
      <p className="text-xs font-semibold text-neutral-800 capitalize mb-2">{todayLabel}</p>

      {!today ? (
        <div className="flex items-start gap-2 border border-emerald-200 bg-emerald-50 px-3 py-2.5">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-bold text-emerald-800">{vi ? 'Ngày làm việc bình thường' : 'Normal Working Day'}</p>
            <p className="text-[10px] text-emerald-700 mt-0.5">
              {vi ? 'Chưa có ngoại lệ nào được ghi nhận hôm nay.' : 'No attendance exception has been recorded today.'}
            </p>
          </div>
        </div>
      ) : (
        <div className="border border-neutral-200 bg-neutral-50 px-3 py-2.5 space-y-1">
          <p className="text-xs font-bold text-neutral-800">{today.attendance_type} <span className="font-normal text-neutral-500">— {today.duration_type}</span></p>
          {today.reason && <p className="text-[10px] text-neutral-500"><span className="font-semibold uppercase text-neutral-400">{vi ? 'Lý do: ' : 'Reason: '}</span>{today.reason}</p>}
          <p className="text-[10px]">
            <span className="font-semibold uppercase text-neutral-400">{vi ? 'Phê duyệt: ' : 'Approval: '}</span>
            <span className={today.approval_status === 'Approved' ? 'text-emerald-700 font-semibold' : today.approval_status === 'Rejected' ? 'text-red-700 font-semibold' : 'text-amber-700 font-semibold'}>
              {today.approval_status}
            </span>
          </p>
        </div>
      )}
    </div>
  );
}

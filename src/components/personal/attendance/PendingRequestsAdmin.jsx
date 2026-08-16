import { useState } from 'react';
import { Check, X } from 'lucide-react';
import { decideAttendanceRecord } from '../../../data/attendanceStore.js';

function fmtDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('vi-VN');
}

export default function PendingRequestsAdmin({ vi, records, viewerId, onChanged }) {
  const [busyId, setBusyId] = useState(null);
  const pending = records.filter((r) => r.approval_status === 'Pending')
    .sort((a, b) => a.attendance_date.localeCompare(b.attendance_date));

  const decide = async (r, status) => {
    setBusyId(r.id);
    try {
      await decideAttendanceRecord(r, status, viewerId);
      onChanged();
    } catch (err) {
      window.alert(err.message || (vi ? 'Cập nhật thất bại.' : 'Update failed.'));
      onChanged(); // refresh so the stale "Pending" row updates to whatever it actually is now
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div>
      <p className="font-ibm text-xs font-semibold text-iscm-charcoal mb-2 flex items-center gap-1.5">
        {vi ? 'Yêu cầu chờ duyệt' : 'Pending Requests'}
        {pending.length > 0 && <span className="rounded-full bg-iscm-crimson px-1.5 py-0.5 text-[9px] font-bold text-white">{pending.length}</span>}
      </p>
      {pending.length === 0 ? (
        <p className="font-ibm text-[11px] text-gray-400">{vi ? 'Không có yêu cầu chờ duyệt.' : 'No pending requests.'}</p>
      ) : (
        <ul className="space-y-1.5">
          {pending.map((r) => (
            <li key={r.id} className="flex flex-col gap-1.5 border border-gray-100 bg-iscm-surface/60 p-2.5 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="font-ibm text-xs font-semibold text-iscm-charcoal">
                  {r.attendance_type} <span className="font-normal text-neutral-400">— {r.duration_type}</span>
                </p>
                <p className="font-ibm text-[10px] text-gray-500">
                  {r.member?.full_name || r.member?.email} · {fmtDate(r.attendance_date)}
                  {r.end_date && r.end_date !== r.attendance_date ? ` – ${fmtDate(r.end_date)}` : ''}
                </p>
                {r.reason && <p className="font-ibm text-[10px] italic text-gray-400">{r.reason}</p>}
              </div>
              <div className="flex shrink-0 gap-1.5">
                <button disabled={busyId === r.id} onClick={() => decide(r, 'Approved')} className="flex items-center gap-1 border border-emerald-300 bg-emerald-50 px-2 py-1 font-ibm text-[10px] font-bold uppercase text-emerald-700 hover:bg-emerald-100 disabled:opacity-50">
                  <Check className="h-3 w-3" /> {vi ? 'Duyệt' : 'Approve'}
                </button>
                <button disabled={busyId === r.id} onClick={() => decide(r, 'Rejected')} className="flex items-center gap-1 border border-red-300 bg-red-50 px-2 py-1 font-ibm text-[10px] font-bold uppercase text-red-700 hover:bg-red-100 disabled:opacity-50">
                  <X className="h-3 w-3" /> {vi ? 'Từ chối' : 'Reject'}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

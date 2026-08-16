import { useState } from 'react';
import { ATTENDANCE_TYPES, todayIsoLocal } from '../../../data/attendanceStore.js';
import AttendanceRecordModal from './AttendanceRecordModal.jsx';

const TYPE_SHORT = {
  'Annual Leave': 'AL', 'Absence': 'A', 'Work from Home': 'WFH', 'Work Outside': 'Outside', 'Late': 'Late',
};

export default function InstituteTodayOverview({ vi, records, activeMemberCount, viewerId, onChanged }) {
  const [selected, setSelected] = useState(null);
  const todayIso = todayIsoLocal();
  const todayRecords = records.filter((r) =>
    r.approval_status !== 'Cancelled' && r.approval_status !== 'Rejected'
    && r.attendance_date <= todayIso && (r.end_date || r.attendance_date) >= todayIso);

  const countByType = {};
  ATTENDANCE_TYPES.forEach((t) => { countByType[t] = todayRecords.filter((r) => r.attendance_type === t).length; });
  const pendingCount = todayRecords.filter((r) => r.approval_status === 'Pending').length;
  const noPermissionCount = todayRecords.filter((r) => r.approval_status === 'No Permission').length;
  const exceptionCount = todayRecords.length;
  const normalCount = Math.max(activeMemberCount - exceptionCount, 0);

  const todayLabel = new Date().toLocaleDateString(vi ? 'vi-VN' : 'en-US', { day: '2-digit', month: 'long', year: 'numeric' });

  const kpis = [
    [vi ? 'Tài khoản trên hệ thống' : 'Accounts on ISCM OS', activeMemberCount, 'text-neutral-900'],
    [vi ? 'Làm việc bình thường' : 'Normal Working', normalCount, 'text-emerald-700'],
    ...ATTENDANCE_TYPES.map((t) => [t, countByType[t], 'text-neutral-700']),
    [vi ? 'Chờ duyệt' : 'Pending Approval', pendingCount, 'text-amber-700'],
    [vi ? 'Không phép' : 'No Permission', noPermissionCount, 'text-red-700'],
  ];

  return (
    <div className="space-y-4">
      <div>
        <p className="font-ibm text-xs font-semibold text-iscm-charcoal">{vi ? 'Tổng quan hôm nay' : 'Institute Attendance'}</p>
        <p className="font-ibm text-[10px] text-neutral-400">{todayLabel}</p>
      </div>

      <div className="grid grid-cols-4 gap-2">
        {kpis.map(([label, value, cls]) => (
          <div key={label} className="border border-neutral-200 bg-neutral-50 p-2.5 text-center">
            <div className={`font-barlow text-lg font-black ${cls}`}>{value}</div>
            <div className="text-[8px] font-bold uppercase tracking-wide text-neutral-400 mt-0.5 truncate" title={label}>{label}</div>
          </div>
        ))}
      </div>
      <p className="font-ibm text-[10px] text-neutral-400 italic">
        {vi
          ? `Chỉ tính ${activeMemberCount} tài khoản đã đăng nhập được vào ISCM OS — chưa phải toàn bộ nhân sự ISCM (35 người trong danh bạ). Số này tăng dần khi có thêm người được cấp quyền đăng nhập.`
          : `Counts only the ${activeMemberCount} accounts currently able to sign in to ISCM OS — not the full 35-person ISCM roster. This grows as more accounts are provisioned.`}
      </p>

      <div>
        <p className="font-ibm text-xs font-semibold text-iscm-charcoal mb-1.5">{vi ? 'Ngoại lệ hôm nay' : "Today's Exceptions"}</p>
        <div className="border border-neutral-200 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-neutral-900 text-white font-barlow text-[9px] font-bold uppercase tracking-wider">
                <th className="px-2.5 py-2">{vi ? 'Thành viên' : 'Member'}</th>
                <th className="px-2.5 py-2">{vi ? 'Loại' : 'Type'}</th>
                <th className="px-2.5 py-2">{vi ? 'Thời lượng' : 'Duration'}</th>
                <th className="px-2.5 py-2">{vi ? 'Lý do' : 'Reason'}</th>
                <th className="px-2.5 py-2">{vi ? 'Duyệt' : 'Approval'}</th>
                <th className="px-2.5 py-2" />
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {todayRecords.map((r) => (
                <tr key={r.id} className="hover:bg-neutral-50/80">
                  <td className="px-2.5 py-2 font-semibold text-neutral-800">{r.member?.full_name || r.member?.email || '—'}</td>
                  <td className="px-2.5 py-2 text-neutral-600">{TYPE_SHORT[r.attendance_type] || r.attendance_type}</td>
                  <td className="px-2.5 py-2 text-neutral-500">{r.duration_type}</td>
                  <td className="px-2.5 py-2 text-neutral-500 truncate max-w-[140px]">{r.reason || '—'}</td>
                  <td className="px-2.5 py-2">
                    <span className={`text-[9px] font-bold uppercase ${
                      r.approval_status === 'Approved' ? 'text-emerald-700' : r.approval_status === 'Pending' ? 'text-amber-700' : 'text-red-700'
                    }`}>{r.approval_status}</span>
                  </td>
                  <td className="px-2.5 py-2">
                    <button onClick={() => setSelected(r)} className="text-[9px] font-bold uppercase text-neutral-500 hover:text-[#8b0000]">
                      {r.approval_status === 'Pending' ? (vi ? 'Xem xét' : 'Review') : (vi ? 'Xem' : 'View')}
                    </button>
                  </td>
                </tr>
              ))}
              {todayRecords.length === 0 && (
                <tr><td colSpan={6} className="px-3 py-6 text-center text-neutral-400 italic">{vi ? 'Không có ngoại lệ nào hôm nay.' : 'No exceptions today.'}</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selected && (
        <AttendanceRecordModal
          vi={vi}
          record={selected}
          memberLabel={selected.member?.full_name || selected.member?.email}
          isAdmin
          viewerId={viewerId}
          onClose={() => setSelected(null)}
          onChanged={() => { setSelected(null); onChanged(); }}
        />
      )}
    </div>
  );
}

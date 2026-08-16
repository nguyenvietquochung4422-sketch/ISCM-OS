import { useEffect, useState } from 'react';
import { useAuth } from '../../auth/AuthContext.jsx';
import { fetchMyAttendanceRecords } from '../../data/attendanceStore.js';
import { fetchPolicies, fetchCalendarDays, fetchAllMemberScopes } from '../../data/attendancePolicyStore.js';
import { buildAttendanceContext } from '../../data/attendanceAggregation.js';
import ReportAttendanceForm from './attendance/ReportAttendanceForm.jsx';
import MemberAttendanceProfile from './attendance/MemberAttendanceProfile.jsx';
import AttendanceRecordModal from './attendance/AttendanceRecordModal.jsx';
import useAttendanceDeepLink from './attendance/useAttendanceDeepLink.js';

/* Daily Attendance — Normal Working Day is the default; a member only acts
   when reporting one of the five exception types (Annual Leave / Absence /
   Work from Home / Work Outside / Late), each going through approval.
   The institute-wide admin view lives in InstituteAttendancePanel.jsx. */
export default function AttendanceLogPanel({ lang = 'vi' }) {
  const vi = lang === 'vi';
  const { user: authUser } = useAuth();
  const [records, setRecords] = useState([]);
  const [context, setContext] = useState(() => buildAttendanceContext([], [], []));
  const [loading, setLoading] = useState(true);

  const reload = () => {
    if (!authUser) { setRecords([]); setLoading(false); return; }
    setLoading(true);
    Promise.all([
      fetchMyAttendanceRecords(authUser.id), fetchPolicies(), fetchCalendarDays(), fetchAllMemberScopes(),
    ]).then(([r, policies, calendarDays, scopes]) => {
      setRecords(r);
      setContext(buildAttendanceContext(policies, calendarDays, scopes));
      setLoading(false);
    });
  };
  useEffect(() => { reload(); }, [authUser]);

  const { focusedRecord, missingRecordId, clear: clearDeepLink } = useAttendanceDeepLink(records, loading);

  return (
    <div className="space-y-4">
      <ReportAttendanceForm lang={lang} onSaved={reload} />
      {loading ? (
        <p className="font-ibm text-[11px] text-gray-400">{vi ? 'Đang tải...' : 'Loading...'}</p>
      ) : (
        <MemberAttendanceProfile
          vi={vi}
          records={records}
          memberId={authUser?.id}
          isAdmin={false}
          viewerId={authUser?.id}
          canCancel
          onChanged={reload}
          context={context}
        />
      )}

      {missingRecordId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={clearDeepLink}>
          <div onClick={(e) => e.stopPropagation()} className="w-full max-w-sm bg-white border border-neutral-200 shadow-xl p-4 text-center">
            <p className="text-xs text-neutral-600">{vi ? 'Không tìm thấy bản ghi chấm công này — có thể bạn không có quyền xem hoặc đã có thay đổi.' : 'This attendance record is no longer available — you may not have access to it, or it has changed.'}</p>
            <button onClick={clearDeepLink} className="mt-3 px-3 py-1.5 text-[10px] font-bold uppercase text-white bg-iscm-crimson hover:bg-[#7a0010]">{vi ? 'Đóng' : 'Close'}</button>
          </div>
        </div>
      )}
      {focusedRecord && (
        <AttendanceRecordModal
          vi={vi} record={focusedRecord} isAdmin={false} viewerId={authUser?.id} canCancel
          onClose={clearDeepLink} onChanged={() => { clearDeepLink(); reload(); }}
        />
      )}
    </div>
  );
}

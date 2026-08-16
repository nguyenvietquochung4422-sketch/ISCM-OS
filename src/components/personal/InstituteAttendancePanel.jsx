import { useEffect, useState } from 'react';
import { CalendarClock, ListChecks, LayoutGrid, Users, Table2, Settings } from 'lucide-react';
import { useAuth } from '../../auth/AuthContext.jsx';
import {
  canManageAttendance, fetchAllAttendanceRecords, fetchActiveMemberCount, fetchAllAccounts,
} from '../../data/attendanceStore.js';
import { fetchPolicies, fetchCalendarDays, fetchAllMemberScopes } from '../../data/attendancePolicyStore.js';
import { buildAttendanceContext } from '../../data/attendanceAggregation.js';
import InstituteTodayOverview from './attendance/InstituteTodayOverview.jsx';
import PendingRequestsAdmin from './attendance/PendingRequestsAdmin.jsx';
import InstituteAttendanceCalendar from './attendance/InstituteAttendanceCalendar.jsx';
import MemberAttendanceProfile from './attendance/MemberAttendanceProfile.jsx';
import MonthlyAttendanceMatrix from './attendance/MonthlyAttendanceMatrix.jsx';
import AttendanceSettingsPanel from './attendance/AttendanceSettingsPanel.jsx';
import AttendanceRecordModal from './attendance/AttendanceRecordModal.jsx';
import useAttendanceDeepLink from './attendance/useAttendanceDeepLink.js';

/**
 * Institute-wide attendance — the admin counterpart to the personal-only
 * Daily Attendance pane. Gated by canManageAttendance() (is_top_admin, or
 * delegated via content_permissions for 'attendance-log').
 */
export default function InstituteAttendancePanel({ lang = 'vi' }) {
  const vi = lang === 'vi';
  const { user: authUser } = useAuth();
  const [canManage, setCanManage] = useState(false);
  const [checked, setChecked] = useState(false);
  const [records, setRecords] = useState([]);
  const [activeMemberCount, setActiveMemberCount] = useState(0);
  const [accounts, setAccounts] = useState([]);
  const [context, setContext] = useState(() => buildAttendanceContext([], [], []));
  const [selectedMemberId, setSelectedMemberId] = useState('');
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('today');
  const { focusedRecord, missingRecordId, clear: clearDeepLink } = useAttendanceDeepLink(records, loading);

  const reload = () => {
    setLoading(true);
    Promise.all([
      fetchAllAttendanceRecords(), fetchActiveMemberCount(), fetchAllAccounts(),
      fetchPolicies(), fetchCalendarDays(), fetchAllMemberScopes(),
    ]).then(([r, count, acc, policies, calendarDays, scopes]) => {
      setRecords(r);
      setActiveMemberCount(count);
      setAccounts(acc);
      setContext(buildAttendanceContext(policies, calendarDays, scopes));
      setLoading(false);
    });
  };

  useEffect(() => {
    canManageAttendance().then((ok) => {
      setCanManage(ok);
      setChecked(true);
      if (ok) reload(); else setLoading(false);
    });
  }, []);

  if (!checked) {
    return <div className="font-sans text-xs text-neutral-400 p-4">{vi ? 'Đang kiểm tra quyền...' : 'Checking permissions...'}</div>;
  }
  if (!canManage) {
    return (
      <div className="font-sans text-xs text-red-700 p-4 border border-red-200 bg-red-50">
        {vi
          ? 'Bạn không có quyền truy cập mục này. Chỉ Admin, Director, Vice Director, hoặc tài khoản được cấp quyền quản lý chấm công mới xem được.'
          : 'You do not have access to this page. Only Admin, Director, Vice Director, or an account granted attendance-management rights can view this.'}
      </div>
    );
  }

  const TABS = [
    { key: 'today', label: vi ? 'Hôm nay' : 'Today', icon: CalendarClock },
    { key: 'requests', label: vi ? 'Yêu cầu' : 'Requests', icon: ListChecks },
    { key: 'calendar', label: vi ? 'Lịch' : 'Calendar', icon: LayoutGrid },
    { key: 'matrix', label: vi ? 'Ma trận' : 'Matrix', icon: Table2 },
    { key: 'members', label: vi ? 'Thành viên' : 'Members', icon: Users },
    { key: 'settings', label: vi ? 'Cài đặt' : 'Settings', icon: Settings },
  ];
  const pendingCount = records.filter((r) => r.approval_status === 'Pending').length;
  const selectedAccount = accounts.find((a) => a.id === selectedMemberId);
  const focusedAccount = focusedRecord && accounts.find((a) => a.id === focusedRecord.member_id);

  return (
    <div className="space-y-3 rounded-lg border border-gray-200 bg-white p-3.5 font-sans">
      <div className="flex flex-wrap gap-1.5 border-b border-neutral-100 pb-2">
        {TABS.map((t) => (
          <button key={t.key} type="button" onClick={() => setTab(t.key)}
            className={`flex items-center gap-1.5 border px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide transition-colors ${
              tab === t.key ? 'border-neutral-900 bg-neutral-900 text-white' : 'border-neutral-300 text-neutral-600 hover:border-neutral-900'
            }`}>
            <t.icon className="h-3.5 w-3.5" /> {t.label}
            {t.key === 'requests' && pendingCount > 0 && (
              <span className="rounded-full bg-[#8b0000] px-1.5 py-0.5 text-[9px] font-bold text-white">{pendingCount}</span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="font-ibm text-[11px] text-gray-400 p-2">{vi ? 'Đang tải...' : 'Loading...'}</p>
      ) : (
        <>
          {tab === 'today' && <InstituteTodayOverview vi={vi} records={records} activeMemberCount={activeMemberCount} viewerId={authUser?.id} onChanged={reload} />}
          {tab === 'requests' && <PendingRequestsAdmin vi={vi} records={records} viewerId={authUser?.id} onChanged={reload} />}
          {tab === 'calendar' && <InstituteAttendanceCalendar vi={vi} records={records} viewerId={authUser?.id} />}
          {tab === 'matrix' && <MonthlyAttendanceMatrix vi={vi} records={records} accounts={accounts} viewerId={authUser?.id} context={context} />}
          {tab === 'members' && (
            <div className="space-y-3">
              <select
                value={selectedMemberId}
                onChange={(e) => setSelectedMemberId(e.target.value)}
                className="border border-neutral-200 bg-white px-2.5 py-1.5 text-xs focus:border-[#8b0000] focus:outline-none rounded-none text-neutral-700 font-medium"
              >
                <option value="">{vi ? '— Chọn thành viên —' : '— Select a member —'}</option>
                {accounts.map((a) => (
                  <option key={a.id} value={a.id}>{a.full_name || a.email}</option>
                ))}
              </select>

              {selectedMemberId ? (
                <MemberAttendanceProfile
                  vi={vi}
                  records={records}
                  memberId={selectedMemberId}
                  memberLabel={selectedAccount?.full_name || selectedAccount?.email}
                  isAdmin
                  viewerId={authUser?.id}
                  canCancel={false}
                  onChanged={reload}
                  context={context}
                />
              ) : (
                <p className="text-xs text-neutral-400 p-4 text-center border border-neutral-200 bg-neutral-50">
                  {vi ? 'Chọn một thành viên để xem hồ sơ chấm công.' : 'Select a member to view their attendance profile.'}
                </p>
              )}
            </div>
          )}
          {tab === 'settings' && <AttendanceSettingsPanel vi={vi} />}
        </>
      )}

      {missingRecordId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={clearDeepLink}>
          <div onClick={(e) => e.stopPropagation()} className="w-full max-w-sm bg-white border border-neutral-200 shadow-xl p-4 text-center">
            <p className="text-xs text-neutral-600">{vi ? 'Không tìm thấy bản ghi chấm công này — có thể đã có thay đổi.' : 'This attendance record is no longer available — it may have changed.'}</p>
            <button onClick={clearDeepLink} className="mt-3 px-3 py-1.5 text-[10px] font-bold uppercase text-white bg-iscm-crimson hover:bg-[#7a0010]">{vi ? 'Đóng' : 'Close'}</button>
          </div>
        </div>
      )}
      {focusedRecord && (
        <AttendanceRecordModal
          vi={vi} record={focusedRecord} memberLabel={focusedAccount?.full_name || focusedAccount?.email}
          isAdmin viewerId={authUser?.id} canCancel={false}
          onClose={clearDeepLink} onChanged={() => { clearDeepLink(); reload(); }}
        />
      )}
    </div>
  );
}

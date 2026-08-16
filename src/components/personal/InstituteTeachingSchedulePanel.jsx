import { useEffect, useMemo, useState } from 'react';
import { CalendarClock, Users, AlertTriangle } from 'lucide-react';
import {
  canManageTeaching, fetchAllSessions, sessionsForMember, sessionsOnDate,
} from '../../data/teachingStore.js';
import { fetchAllAccounts, fetchAllAttendanceRecords } from '../../data/attendanceStore.js';
import { getLeaveConflict } from '../../data/eventStore.js';

function todayIso() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** Academia > Teaching > Institute Teaching Schedule — admin/organizer
    answer to "who's teaching today, and what's on someone's calendar this
    week." Gated by canManageTeaching() (is_top_admin, or delegated via
    content_permissions for 'my-teaching-schedule', same convention as
    attendance-log/my-events). */
export default function InstituteTeachingSchedulePanel({ lang = 'vi' }) {
  const vi = lang === 'vi';
  const [canManage, setCanManage] = useState(false);
  const [checked, setChecked] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('today');
  const [selectedMemberId, setSelectedMemberId] = useState('');

  const reload = () => {
    setLoading(true);
    Promise.all([fetchAllSessions(), fetchAllAccounts(), fetchAllAttendanceRecords()]).then(([s, acc, records]) => {
      setSessions(s);
      setAccounts(acc);
      setAttendanceRecords(records);
      setLoading(false);
    });
  };

  useEffect(() => {
    canManageTeaching().then((ok) => {
      setCanManage(ok);
      setChecked(true);
      if (ok) reload(); else setLoading(false);
    });
  }, []);

  const today = todayIso();
  const todaySessions = useMemo(() => sessionsOnDate(sessions, today), [sessions, today]);
  const membersTeachingToday = useMemo(() => new Set(todaySessions.map((s) => s.assignment?.member?.id)).size, [todaySessions]);
  const conflictsToday = useMemo(
    () => todaySessions.filter((s) => s.assignment?.member?.id && getLeaveConflict(attendanceRecords, s.assignment.member.id, today)).length,
    [todaySessions, attendanceRecords, today]
  );

  const selectedAccount = accounts.find((a) => a.id === selectedMemberId);
  const memberSessions = useMemo(
    () => selectedMemberId ? sessionsForMember(sessions, selectedMemberId).filter((s) => s.status !== 'Cancelled') : [],
    [sessions, selectedMemberId]
  );

  if (!checked) return <div className="font-sans text-xs text-neutral-400 p-4">{vi ? 'Đang kiểm tra quyền...' : 'Checking permissions...'}</div>;
  if (!canManage) {
    return (
      <div className="font-sans text-xs text-red-700 p-4 border border-red-200 bg-red-50">
        {vi
          ? 'Bạn không có quyền truy cập mục này. Chỉ Admin, Director, Vice Director, hoặc tài khoản được cấp quyền quản lý giảng dạy mới xem được.'
          : 'You do not have access to this page. Only Admin, Director, Vice Director, or an account granted teaching-management rights can view this.'}
      </div>
    );
  }

  const TABS = [
    { key: 'today', label: vi ? 'Hôm nay' : 'Today', icon: CalendarClock },
    { key: 'members', label: vi ? 'Theo thành viên' : 'By Member', icon: Users },
  ];

  return (
    <div className="space-y-3 rounded-lg border border-gray-200 bg-white p-3.5 font-sans">
      <div className="flex flex-wrap gap-1.5 border-b border-neutral-100 pb-2">
        {TABS.map((t) => (
          <button key={t.key} type="button" onClick={() => setTab(t.key)}
            className={`flex items-center gap-1.5 border px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide transition-colors ${
              tab === t.key ? 'border-neutral-900 bg-neutral-900 text-white' : 'border-neutral-300 text-neutral-600 hover:border-neutral-900'
            }`}>
            <t.icon className="h-3.5 w-3.5" /> {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="font-ibm text-[11px] text-gray-400 p-2">{vi ? 'Đang tải...' : 'Loading...'}</p>
      ) : tab === 'today' ? (
        <div className="space-y-3">
          <div className="grid grid-cols-4 gap-2">
            {[
              [vi ? 'Buổi dạy hôm nay' : 'Teaching today', todaySessions.length],
              [vi ? 'Thành viên đang dạy' : 'Members teaching', membersTeachingToday],
              [vi ? 'Lớp' : 'Classes', new Set(todaySessions.map((s) => s.assignment?.class_code || s.assignment?.course?.course_code)).size],
              [vi ? 'Xung đột lịch' : 'Schedule conflicts', conflictsToday],
            ].map(([label, value]) => (
              <div key={label} className="border border-neutral-200 bg-neutral-50 p-2.5 text-center">
                <div className="font-barlow text-lg font-black text-neutral-900">{value}</div>
                <div className="text-[8px] font-bold uppercase tracking-wide text-neutral-400 mt-0.5">{label}</div>
              </div>
            ))}
          </div>
          <div className="border border-neutral-200 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-neutral-900 text-white font-barlow text-[9px] font-bold uppercase tracking-wider">
                  <th className="px-2.5 py-2">{vi ? 'Giờ' : 'Time'}</th>
                  <th className="px-2.5 py-2">{vi ? 'Thành viên' : 'Member'}</th>
                  <th className="px-2.5 py-2">{vi ? 'Môn học' : 'Course'}</th>
                  <th className="px-2.5 py-2">{vi ? 'Phòng' : 'Room'}</th>
                  <th className="px-2.5 py-2">{vi ? 'Xung đột' : 'Conflict'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {[...todaySessions].sort((a, b) => a.start_time.localeCompare(b.start_time)).map((s) => {
                  const conflict = s.assignment?.member?.id && getLeaveConflict(attendanceRecords, s.assignment.member.id, today);
                  return (
                    <tr key={s.id} className="hover:bg-neutral-50/80">
                      <td className="px-2.5 py-2 text-neutral-600 whitespace-nowrap">{s.start_time?.slice(0, 5)}–{s.end_time?.slice(0, 5)}</td>
                      <td className="px-2.5 py-2 font-semibold text-neutral-800">{s.assignment?.member?.full_name || s.assignment?.member?.email}</td>
                      <td className="px-2.5 py-2 text-neutral-600">{s.assignment?.course?.course_name}</td>
                      <td className="px-2.5 py-2 text-neutral-500">{[s.room, s.campus].filter(Boolean).join(' · ') || '—'}</td>
                      <td className="px-2.5 py-2">
                        {conflict && (
                          <span className="flex items-center gap-1 text-amber-700 text-[10px] font-semibold">
                            <AlertTriangle className="h-3 w-3" /> {conflict.attendance_type}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {todaySessions.length === 0 && (
                  <tr><td colSpan={5} className="px-3 py-6 text-center text-neutral-400 italic">{vi ? 'Không có buổi dạy nào hôm nay.' : 'No teaching sessions today.'}</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <select
            value={selectedMemberId}
            onChange={(e) => setSelectedMemberId(e.target.value)}
            className="border border-neutral-200 bg-white px-2.5 py-1.5 text-xs focus:border-[#8b0000] focus:outline-none rounded-none text-neutral-700 font-medium"
          >
            <option value="">{vi ? '— Chọn thành viên —' : '— Select a member —'}</option>
            {accounts.map((a) => <option key={a.id} value={a.id}>{a.full_name || a.email}</option>)}
          </select>

          {selectedMemberId ? (
            <div className="space-y-2">
              <p className="font-barlow text-sm font-black uppercase text-neutral-900">{selectedAccount?.full_name || selectedAccount?.email}</p>
              {memberSessions.map((s) => {
                const conflict = getLeaveConflict(attendanceRecords, selectedMemberId, s.session_date);
                return (
                  <div key={s.id} className="border border-neutral-200 p-3">
                    <p className="text-xs font-bold text-neutral-900">{s.assignment?.course?.course_name}</p>
                    <p className="text-[10px] text-neutral-500 mt-0.5">
                      {s.session_date} · {s.start_time?.slice(0, 5)}–{s.end_time?.slice(0, 5)} · {s.session_type}
                      {s.room ? ` · ${s.room}` : ''}
                    </p>
                    {conflict && (
                      <p className="mt-1.5 flex items-start gap-1.5 text-[10px] text-amber-800 bg-amber-50 border border-amber-200 px-2 py-1">
                        <AlertTriangle className="h-3 w-3 shrink-0 mt-0.5" />
                        {vi ? `Trùng với ${conflict.attendance_type} đã duyệt.` : `Overlaps an approved ${conflict.attendance_type}.`}
                      </p>
                    )}
                  </div>
                );
              })}
              {memberSessions.length === 0 && (
                <p className="text-xs text-neutral-400 p-4 text-center border border-neutral-200 bg-neutral-50">{vi ? 'Không có buổi dạy nào.' : 'No teaching sessions.'}</p>
              )}
            </div>
          ) : (
            <p className="text-xs text-neutral-400 p-4 text-center border border-neutral-200 bg-neutral-50">
              {vi ? 'Chọn một thành viên để xem lịch dạy.' : 'Select a member to view their teaching schedule.'}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

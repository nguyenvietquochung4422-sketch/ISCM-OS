import { useEffect, useMemo, useState } from 'react';
import { CalendarClock, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../auth/AuthContext.jsx';
import { fetchAllSessions, sessionsForMember } from '../../data/teachingStore.js';
import { fetchMyAttendanceRecords } from '../../data/attendanceStore.js';
import { getLeaveConflict } from '../../data/eventStore.js';

const RANGE_OPTIONS = ['Today', 'This Week', 'This Month', 'All'];

function todayIso() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
function addDaysIso(iso, days) {
  const d = new Date(`${iso}T00:00:00`);
  d.setDate(d.getDate() + days);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
function endOfMonthIso(iso) {
  const [y, m] = iso.split('-').map(Number);
  const d = new Date(y, m, 0);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** Academia > Teaching > My Teaching Schedule — every session belonging to
    the signed-in member, across all their teaching_assignments. Read-only
    for members; managing sessions/assignments happens in the admin-side
    Teaching Assignments panel. */
export default function MyTeachingSchedulePanel({ lang = 'vi' }) {
  const vi = lang === 'vi';
  const { user: authUser } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState('This Week');

  useEffect(() => {
    if (!authUser) { setLoading(false); return; }
    setLoading(true);
    Promise.all([fetchAllSessions(), fetchMyAttendanceRecords(authUser.id)]).then(([s, records]) => {
      setSessions(s);
      setAttendanceRecords(records);
      setLoading(false);
    });
  }, [authUser]);

  const mySessions = useMemo(() => sessionsForMember(sessions, authUser?.id).filter((s) => s.status !== 'Cancelled'), [sessions, authUser]);

  const filtered = useMemo(() => {
    const today = todayIso();
    let from = today; let to = null;
    if (range === 'Today') to = today;
    else if (range === 'This Week') to = addDaysIso(today, 6);
    else if (range === 'This Month') to = endOfMonthIso(today);
    else { from = '0000-01-01'; to = '9999-12-31'; }
    return mySessions.filter((s) => s.session_date >= from && s.session_date <= to);
  }, [mySessions, range]);

  if (loading) return <p className="font-ibm text-[11px] text-gray-400 p-2">{vi ? 'Đang tải...' : 'Loading...'}</p>;

  return (
    <div className="space-y-3 rounded-lg border border-gray-200 bg-white p-3.5 font-sans">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="flex items-center gap-1.5 font-ibm text-xs font-semibold text-iscm-charcoal">
          <CalendarClock className="h-3.5 w-3.5 text-iscm-crimson" /> {vi ? 'Lịch dạy của tôi' : 'My Teaching Schedule'}
        </p>
        <div className="flex border border-neutral-200 text-[10px] font-bold uppercase">
          {RANGE_OPTIONS.map((r) => (
            <button key={r} onClick={() => setRange(r)} className={`px-2.5 py-1.5 ${range === r ? 'bg-neutral-900 text-white' : 'text-neutral-600 hover:bg-neutral-50'}`}>
              {r}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        {filtered.map((s) => {
          const conflict = getLeaveConflict(attendanceRecords, authUser?.id, s.session_date);
          return (
            <div key={s.id} className="border border-neutral-200 p-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-xs font-bold text-neutral-900">{s.assignment?.course?.course_name}</p>
                  <p className="text-[10px] text-neutral-500 mt-0.5">
                    {s.session_date} · {s.start_time?.slice(0, 5)}–{s.end_time?.slice(0, 5)} · {s.session_type}
                    {s.assignment?.class_code ? ` · ${s.assignment.class_code}` : ''}
                  </p>
                  {(s.room || s.campus) && (
                    <p className="text-[10px] text-neutral-400 mt-0.5">{[s.room, s.campus].filter(Boolean).join(' · ')}</p>
                  )}
                </div>
                <span className="text-[9px] font-bold uppercase text-neutral-400 shrink-0">{s.assignment?.teaching_role}</span>
              </div>
              {conflict && (
                <p className="mt-2 flex items-start gap-1.5 text-[10px] text-amber-800 bg-amber-50 border border-amber-200 px-2 py-1">
                  <AlertTriangle className="h-3 w-3 shrink-0 mt-0.5" />
                  {vi
                    ? `Bạn đã có ${conflict.attendance_type} được duyệt trùng ngày này.`
                    : `You already have an approved ${conflict.attendance_type} covering this date.`}
                </p>
              )}
            </div>
          );
        })}
        {filtered.length === 0 && (
          <p className="text-xs text-neutral-400 p-4 text-center border border-neutral-200 bg-neutral-50">
            {vi ? 'Không có buổi dạy nào trong khoảng thời gian này.' : 'No teaching sessions in this range.'}
          </p>
        )}
      </div>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { AlertTriangle, CalendarClock, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../auth/AuthContext.jsx';
import { RSVP_STATUSES, fetchMyEventParticipation, submitRsvp, getLeaveConflict } from '../../data/eventStore.js';
import { fetchMyAttendanceRecords } from '../../data/attendanceStore.js';

/** Member side of Event Attendance (Phase 3D) — everything this account
    was invited to, RSVP in place, with a leave-conflict warning if they
    already have an Approved Annual Leave/Absence covering the event date
    (read-time cross-check only; the two modules don't share state). */
export default function MyEventsPanel({ lang = 'vi' }) {
  const vi = lang === 'vi';
  const { user: authUser } = useAuth();
  const [participation, setParticipation] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  const reload = () => {
    if (!authUser) { setParticipation([]); setLoading(false); return; }
    setLoading(true);
    Promise.all([fetchMyEventParticipation(authUser.id), fetchMyAttendanceRecords(authUser.id)]).then(([p, r]) => {
      setParticipation(p);
      setAttendanceRecords(r);
      setLoading(false);
    });
  };
  useEffect(() => { reload(); }, [authUser]);

  const rsvp = async (participantId, status) => {
    await submitRsvp(participantId, status, authUser?.id);
    reload();
  };

  if (loading) return <p className="font-ibm text-[11px] text-gray-400 p-2">{vi ? 'Đang tải...' : 'Loading...'}</p>;

  return (
    <div className="space-y-3 rounded-lg border border-gray-200 bg-white p-3.5 font-sans">
      <p className="flex items-center gap-1.5 font-ibm text-xs font-semibold text-iscm-charcoal">
        <CalendarClock className="h-3.5 w-3.5 text-iscm-crimson" /> {vi ? 'Sự kiện của tôi' : 'My Events'}
      </p>

      <div className="space-y-2">
        {participation.map((p) => {
          const ev = p.event;
          if (!ev) return null;
          const conflict = getLeaveConflict(attendanceRecords, authUser?.id, ev.event_date);
          return (
            <div key={p.id} className="border border-neutral-200 p-3 space-y-1.5">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-xs font-bold text-neutral-900">
                    {ev.title}
                    {ev.mandatory && <span className="ml-1.5 text-[9px] font-bold uppercase text-iscm-crimson">{vi ? 'Bắt buộc' : 'Mandatory'}</span>}
                    {ev.status === 'Cancelled' && <span className="ml-1.5 text-[9px] font-bold uppercase text-red-700">{vi ? 'Đã huỷ' : 'Cancelled'}</span>}
                  </p>
                  <p className="text-[10px] text-neutral-400 mt-0.5">
                    {ev.event_date}{ev.start_time ? ` · ${ev.start_time.slice(0, 5)}` : ''}{ev.location ? ` · ${ev.location}` : ''} · {ev.event_type}
                  </p>
                  {ev.organizer && <p className="text-[10px] text-neutral-400">{vi ? 'Tổ chức bởi' : 'Organized by'} {ev.organizer.full_name || ev.organizer.email}</p>}
                </div>
                {p.checked_in && (
                  <span className="flex items-center gap-1 text-[9px] font-bold uppercase text-emerald-700 shrink-0"><CheckCircle2 className="h-3 w-3" /> {vi ? 'Đã điểm danh' : 'Checked in'}</span>
                )}
              </div>

              {conflict && ev.status !== 'Cancelled' && (
                <p className="flex items-start gap-1.5 text-[10px] text-amber-800 bg-amber-50 border border-amber-200 px-2 py-1">
                  <AlertTriangle className="h-3 w-3 shrink-0 mt-0.5" />
                  {vi
                    ? `Bạn đã có ${conflict.attendance_type} được duyệt trùng ngày này (${conflict.attendance_date}${conflict.end_date && conflict.end_date !== conflict.attendance_date ? ` – ${conflict.end_date}` : ''}).`
                    : `You already have an approved ${conflict.attendance_type} covering this date (${conflict.attendance_date}${conflict.end_date && conflict.end_date !== conflict.attendance_date ? ` – ${conflict.end_date}` : ''}).`}
                </p>
              )}

              {ev.status !== 'Cancelled' && (
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[10px] text-neutral-400 uppercase font-bold mr-1">RSVP:</span>
                  {RSVP_STATUSES.filter((s) => s !== 'No Response').map((s) => (
                    <button key={s} onClick={() => rsvp(p.id, s)}
                      className={`px-2.5 py-1 text-[10px] font-bold uppercase border ${
                        p.rsvp_status === s ? 'bg-neutral-900 text-white border-neutral-900' : 'border-neutral-300 text-neutral-600 hover:border-neutral-900'
                      }`}>{s}</button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
        {participation.length === 0 && (
          <p className="text-xs text-neutral-400 p-4 text-center border border-neutral-200 bg-neutral-50">
            {vi ? 'Bạn chưa được mời tham gia sự kiện nào.' : 'You have not been invited to any events yet.'}
          </p>
        )}
      </div>
    </div>
  );
}

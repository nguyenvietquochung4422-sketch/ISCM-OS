import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react';
import { recordCoversDate, todayIsoLocal } from '../../../data/attendanceStore.js';
import AttendanceRecordModal from './AttendanceRecordModal.jsx';

const BADGE = {
  'Annual Leave': { code: 'AL', cls: 'bg-blue-100 text-blue-700' },
  'Absence': { code: 'A', cls: 'bg-red-100 text-red-700' },
  'Work from Home': { code: 'H', cls: 'bg-purple-100 text-purple-700' },
  'Work Outside': { code: 'O', cls: 'bg-amber-100 text-amber-700' },
  'Late': { code: 'L', cls: 'bg-orange-100 text-orange-700' },
};

const WEEKDAY_LABELS_VI = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
const WEEKDAY_LABELS_EN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function toIso(y, m, d) {
  return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

/** Month calendar for one member — badge per exception day, click a day to
    see the full record (or nothing, for a Normal Working Day). */
export default function MyAttendanceCalendar({ vi, records, isAdmin, viewerId, canCancel, memberLabelFor, onChanged }) {
  const [cursor, setCursor] = useState(() => { const n = new Date(); return { y: n.getFullYear(), m: n.getMonth() }; });
  const [selected, setSelected] = useState(null);

  const days = useMemo(() => {
    const first = new Date(cursor.y, cursor.m, 1);
    const startWeekday = first.getDay();
    const daysInMonth = new Date(cursor.y, cursor.m + 1, 0).getDate();
    const cells = [];
    for (let i = 0; i < startWeekday; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);
    return cells;
  }, [cursor]);

  const recordsForDay = (d) => {
    if (!d) return [];
    const iso = toIso(cursor.y, cursor.m, d);
    return records.filter((r) => r.approval_status !== 'Cancelled' && recordCoversDate(r, iso));
  };

  const todayIso = todayIsoLocal();
  const monthLabel = new Date(cursor.y, cursor.m, 1).toLocaleDateString(vi ? 'vi-VN' : 'en-US', { month: 'long', year: 'numeric' });
  const weekdayLabels = vi ? WEEKDAY_LABELS_VI : WEEKDAY_LABELS_EN;

  return (
    <div className="border border-gray-200 bg-white p-3.5 space-y-3">
      <div className="flex items-center justify-between">
        <p className="flex items-center gap-1.5 font-ibm text-xs font-semibold text-iscm-charcoal">
          <CalendarDays className="h-3.5 w-3.5 text-iscm-crimson" />
          {vi ? 'Lịch chấm công' : 'Attendance Calendar'}
        </p>
        <div className="flex items-center gap-1.5">
          <button onClick={() => setCursor((c) => c.m === 0 ? { y: c.y - 1, m: 11 } : { y: c.y, m: c.m - 1 })} className="p-1 border border-neutral-200 hover:border-iscm-crimson"><ChevronLeft className="h-3.5 w-3.5" /></button>
          <span className="text-xs font-semibold text-neutral-700 capitalize min-w-[110px] text-center">{monthLabel}</span>
          <button onClick={() => setCursor((c) => c.m === 11 ? { y: c.y + 1, m: 0 } : { y: c.y, m: c.m + 1 })} className="p-1 border border-neutral-200 hover:border-iscm-crimson"><ChevronRight className="h-3.5 w-3.5" /></button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center">
        {weekdayLabels.map((w) => (
          <div key={w} className="text-[9px] font-bold uppercase text-neutral-400 py-1">{w}</div>
        ))}
        {days.map((d, i) => {
          if (!d) return <div key={i} />;
          const iso = toIso(cursor.y, cursor.m, d);
          const dayRecords = recordsForDay(d);
          const isToday = iso === todayIso;
          const isWeekend = new Date(cursor.y, cursor.m, d).getDay() % 6 === 0;
          return (
            <button
              key={i}
              onClick={() => dayRecords.length > 0 && setSelected(dayRecords[0])}
              className={`aspect-square border p-1 flex flex-col items-center justify-start gap-0.5 text-[10px] transition-colors ${
                isToday ? 'border-iscm-crimson ring-1 ring-iscm-crimson/30' : 'border-neutral-100'
              } ${isWeekend ? 'bg-neutral-50' : 'bg-white'} ${dayRecords.length > 0 ? 'hover:bg-neutral-50 cursor-pointer' : 'cursor-default'}`}
            >
              <span className={`font-semibold ${isToday ? 'text-iscm-crimson' : 'text-neutral-600'}`}>{d}</span>
              {dayRecords.map((r) => {
                const b = BADGE[r.attendance_type];
                return (
                  <span key={r.id} className={`px-1 rounded-full text-[8px] font-bold ${b?.cls || 'bg-neutral-100 text-neutral-500'} ${r.approval_status === 'Pending' ? 'opacity-60' : ''}`}>
                    {b?.code || '?'}
                  </span>
                );
              })}
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap gap-2 pt-1 border-t border-neutral-100">
        {Object.entries(BADGE).map(([type, b]) => (
          <span key={type} className="flex items-center gap-1 text-[9px] text-neutral-500">
            <span className={`px-1 rounded-full font-bold ${b.cls}`}>{b.code}</span> {type}
          </span>
        ))}
      </div>

      {selected && (
        <AttendanceRecordModal
          vi={vi}
          record={selected}
          memberLabel={memberLabelFor?.(selected)}
          isAdmin={isAdmin}
          viewerId={viewerId}
          canCancel={canCancel}
          onClose={() => setSelected(null)}
          onChanged={() => { setSelected(null); onChanged?.(); }}
        />
      )}
    </div>
  );
}

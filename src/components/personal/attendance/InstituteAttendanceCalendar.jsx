import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { recordCoversDate, todayIsoLocal } from '../../../data/attendanceStore.js';
import AttendanceRecordModal from './AttendanceRecordModal.jsx';

const TYPE_SHORT = {
  'Annual Leave': 'Leave', 'Absence': 'Absent', 'Work from Home': 'WFH', 'Work Outside': 'Outside', 'Late': 'Late',
};

function toIso(y, m, d) {
  return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

export default function InstituteAttendanceCalendar({ vi, records, viewerId }) {
  const [cursor, setCursor] = useState(() => { const n = new Date(); return { y: n.getFullYear(), m: n.getMonth() }; });
  const [dayModal, setDayModal] = useState(null); // iso date string
  const [selectedRecord, setSelectedRecord] = useState(null);

  const days = useMemo(() => {
    const first = new Date(cursor.y, cursor.m, 1);
    const startWeekday = first.getDay();
    const daysInMonth = new Date(cursor.y, cursor.m + 1, 0).getDate();
    const cells = [];
    for (let i = 0; i < startWeekday; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);
    return cells;
  }, [cursor]);

  const activeRecords = records.filter((r) => r.approval_status !== 'Cancelled' && r.approval_status !== 'Rejected');
  const recordsForIso = (iso) => activeRecords.filter((r) => recordCoversDate(r, iso));

  const monthLabel = new Date(cursor.y, cursor.m, 1).toLocaleDateString(vi ? 'vi-VN' : 'en-US', { month: 'long', year: 'numeric' });
  const weekdayLabels = vi ? ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'] : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const todayIso = todayIsoLocal();

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <p className="font-ibm text-xs font-semibold text-iscm-charcoal">{vi ? 'Lịch toàn viện' : 'Institute Calendar'}</p>
        <div className="flex items-center gap-1.5">
          <button onClick={() => setCursor((c) => c.m === 0 ? { y: c.y - 1, m: 11 } : { y: c.y, m: c.m - 1 })} className="p-1 border border-neutral-200 hover:border-iscm-crimson"><ChevronLeft className="h-3.5 w-3.5" /></button>
          <span className="text-xs font-semibold text-neutral-700 capitalize min-w-[110px] text-center">{monthLabel}</span>
          <button onClick={() => setCursor((c) => c.m === 11 ? { y: c.y + 1, m: 0 } : { y: c.y, m: c.m + 1 })} className="p-1 border border-neutral-200 hover:border-iscm-crimson"><ChevronRight className="h-3.5 w-3.5" /></button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center">
        {weekdayLabels.map((w) => <div key={w} className="text-[9px] font-bold uppercase text-neutral-400 py-1">{w}</div>)}
        {days.map((d, i) => {
          if (!d) return <div key={i} />;
          const iso = toIso(cursor.y, cursor.m, d);
          const dayRecords = recordsForIso(iso);
          const counts = {};
          dayRecords.forEach((r) => { counts[r.attendance_type] = (counts[r.attendance_type] || 0) + 1; });
          const isToday = iso === todayIso;
          return (
            <button
              key={i}
              onClick={() => dayRecords.length > 0 && setDayModal(iso)}
              className={`min-h-[64px] border p-1 flex flex-col items-start gap-0.5 text-left transition-colors ${
                isToday ? 'border-iscm-crimson ring-1 ring-iscm-crimson/30' : 'border-neutral-100'
              } ${dayRecords.length > 0 ? 'hover:bg-neutral-50 cursor-pointer' : ''}`}
            >
              <span className={`text-[10px] font-semibold ${isToday ? 'text-iscm-crimson' : 'text-neutral-600'}`}>{d}</span>
              {Object.entries(counts).map(([type, n]) => (
                <span key={type} className="text-[8px] text-neutral-500 leading-tight">{TYPE_SHORT[type]} {n}</span>
              ))}
            </button>
          );
        })}
      </div>

      {dayModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setDayModal(null)}>
          <div onClick={(e) => e.stopPropagation()} className="w-full max-w-sm bg-white border border-neutral-200 shadow-xl font-sans">
            <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-100 bg-neutral-900 text-white">
              <h3 className="font-barlow text-sm font-black uppercase tracking-wide">{new Date(dayModal).toLocaleDateString(vi ? 'vi-VN' : 'en-US', { day: '2-digit', month: 'long', year: 'numeric' })}</h3>
              <button onClick={() => setDayModal(null)} className="text-neutral-400 hover:text-white"><X className="h-4 w-4" /></button>
            </div>
            <div className="divide-y divide-neutral-100 max-h-80 overflow-y-auto">
              {recordsForIso(dayModal).map((r) => (
                <button key={r.id} onClick={() => setSelectedRecord(r)} className="w-full text-left px-4 py-2.5 hover:bg-neutral-50">
                  <p className="text-xs font-semibold text-neutral-800">{r.member?.full_name || r.member?.email}</p>
                  <p className="text-[10px] text-neutral-500">{r.attendance_type} · {r.duration_type} · <span className={r.approval_status === 'Approved' ? 'text-emerald-700' : r.approval_status === 'Pending' ? 'text-amber-700' : 'text-red-700'}>{r.approval_status}</span></p>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {selectedRecord && (
        <AttendanceRecordModal
          vi={vi}
          record={selectedRecord}
          memberLabel={selectedRecord.member?.full_name || selectedRecord.member?.email}
          isAdmin
          viewerId={viewerId}
          onClose={() => setSelectedRecord(null)}
          onChanged={() => { setSelectedRecord(null); setDayModal(null); }}
        />
      )}
    </div>
  );
}

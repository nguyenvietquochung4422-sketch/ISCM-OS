import { CalendarRange, CalendarClock } from 'lucide-react';

/** Weekly calendar grid + today detail + upcoming list — shared by the
    personal "My Calendar" pane (My Portal) and the admin "Institute
    Calendar" pane (ADMIN), each feeding it a differently-filtered event set. */
export default function MyCalendarView({ lang, t, weekDays, monday, fmtDay, isToday, fmtDateKey, getEventsForDay, fmtTime, upcoming, today, fmtDateLabel }) {
  return (
    <div className="space-y-4">
      {/* Weekly Calendar Table */}
      <div className="border border-neutral-200 bg-white rounded-none overflow-hidden">
        {/* Calendar header */}
        <div className="px-5 py-2.5 border-b border-neutral-200 bg-neutral-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CalendarRange className="h-3.5 w-3.5 text-[#990000]" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-white">
              {t.WEEKLY_SCHEDULE} — {monday.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })} – {weekDays[4].toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
            </span>
          </div>
          <span className="text-[9px] text-neutral-400 uppercase tracking-wider font-bold">Thứ 2 → Thứ 6</span>
        </div>

        {/* Week grid */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-left border-collapse">
            <thead>
              <tr>
                {weekDays.map((d) => (
                  <th key={fmtDateKey(d)}
                    className={`px-3 py-2 text-[13px] font-bold uppercase tracking-wider border-b border-neutral-300 text-center ${
                      isToday(d) ? 'bg-[#990000] text-white' : 'bg-neutral-50 text-neutral-800'
                    }`}
                  >
                    {fmtDay(d)}
                    {isToday(d) && <span className="block text-[10px] font-normal opacity-80">{lang === 'vi' ? 'Hôm nay' : 'Today'}</span>}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr className="align-top">
                {weekDays.map((d) => {
                  const dayEvents = getEventsForDay(d);
                  return (
                    <td key={fmtDateKey(d)}
                      className={`px-1.5 py-2 border-r border-neutral-200 last:border-r-0 min-h-[140px] align-top ${
                        isToday(d) ? 'bg-neutral-50/50' : ''
                      }`}
                    >
                      {dayEvents.length === 0 ? (
                        <p className="text-center text-[10px] text-neutral-300 mt-4">—</p>
                      ) : (
                        <div className="space-y-1">
                          {dayEvents.map((ev) => (
                            <div key={ev.id}
                              className={`border px-2 py-1.5 text-[11px] cursor-default ${ev.tagColor} rounded-none`}
                            >
                              <p className="font-bold leading-tight line-clamp-2 text-left">{ev.title}</p>
                              <p className="opacity-70 mt-0.5 text-[10px] text-left">{fmtTime(ev.start)}–{fmtTime(ev.end)}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Grid below: Today Details & Upcoming Events */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
        {/* Today's detail schedule */}
        <div className="border border-neutral-200 bg-white rounded-none overflow-hidden">
          <div className="px-5 py-2 bg-neutral-50 border-b border-neutral-200 text-left">
            <span className="text-xs font-bold uppercase tracking-wide text-neutral-800">
              {t.SCHEDULE_DETAILS}
            </span>
          </div>
          {(() => {
            const todayEvents = getEventsForDay(today);
            if (todayEvents.length === 0) return (
              <p className="px-5 py-6 text-center text-xs text-neutral-400 font-sans">{t.NO_EVENTS}</p>
            );
            return (
              <div className="divide-y divide-neutral-200">
                {todayEvents.map((ev) => (
                  <div key={ev.id} className="flex items-start gap-4 px-5 py-2.5">
                    <div className="shrink-0 text-center w-14">
                      <span className="block text-sm font-bold text-neutral-900">{fmtTime(ev.start)}</span>
                      <span className="block text-[11px] text-neutral-400">{fmtTime(ev.end)}</span>
                    </div>
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 bg-[#990000]" />
                    <div className="min-w-0 flex-1 text-left">
                      <p className="text-sm font-bold text-neutral-800 leading-snug">{ev.title}</p>
                      <p className="text-xs text-neutral-400 mt-0.5">{ev.location}</p>
                    </div>
                    <span className={`shrink-0 px-1.5 py-0.5 text-[10px] font-bold border ${ev.tagColor}`}>{ev.tag}</span>
                  </div>
                ))}
              </div>
            );
          })()}
        </div>

        {/* Upcoming Events highlight */}
        <div className="border border-neutral-200 bg-white rounded-none overflow-hidden">
          <div className="px-4 py-2 border-b border-neutral-200 bg-[#990000] text-white flex items-center gap-2">
            <CalendarClock className="h-3.5 w-3.5 shrink-0 text-white" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-white">{t.UPCOMING_EVENTS}</span>
          </div>
          <div className="overflow-y-auto max-h-[220px] divide-y divide-neutral-200">
            {upcoming.length === 0 && (
              <p className="px-4 py-6 text-center text-xs text-neutral-400 font-sans">{t.NO_EVENTS}</p>
            )}
            {upcoming.map((ev) => (
              <div key={ev.id} className="flex items-start gap-2.5 px-4 py-2.5 hover:bg-neutral-50 transition-colors">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 bg-[#990000]" />
                <div className="min-w-0 flex-1 text-left">
                  <p className="text-xs font-bold text-neutral-800 leading-snug">{ev.title}</p>
                  <p className="text-[10px] text-neutral-400 mt-0.5">
                    {fmtDateLabel(ev.start)} · {fmtTime(ev.start)}–{fmtTime(ev.end)}
                  </p>
                  <p className="text-[10px] text-neutral-400 truncate">{ev.location}</p>
                  <span className={`inline-block mt-1 px-1 py-0.2 text-[8px] font-bold border ${ev.tagColor}`}>{ev.tag}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="px-4 py-1.5 border-t border-neutral-200 bg-neutral-50 text-left">
            <p className="text-[9px] text-neutral-400 flex items-center gap-1">
              <span className="h-1.5 w-1.5 bg-emerald-600 inline-block" />
              {t.SYNC_SUCCESS}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

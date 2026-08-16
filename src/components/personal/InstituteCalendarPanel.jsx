import { useEffect, useMemo, useState } from 'react';
import { CalendarRange } from 'lucide-react';
import { supabase, isLive } from '../../lib/supabaseClient.js';
import { useAuth } from '../../auth/AuthContext.jsx';
import { useLanguage } from '../../i18n/LanguageContext.jsx';
import { NAVIGATION_LOCALIZATION } from '../../data/navigationLocalization.js';
import { WS_EVENTS } from '../../data/calendarEvents.js';
import { ISCM_MEMBERS } from '../../data/iscmMembers.js';
import MyCalendarView from './MyCalendarView.jsx';

const STAFF_NAMES = [...ISCM_MEMBERS].sort((a, b) => a.nameVi.localeCompare(b.nameVi, 'vi'));

function eventIncludesStaff(ev, name) {
  if (name === 'all') return true;
  if (ev.attendees === 'all') return true;
  return Array.isArray(ev.attendees) && ev.attendees.includes(name);
}

/**
 * Admin counterpart to the personal-only "My Calendar" pane in My Portal —
 * lets an admin browse the institute-wide calendar, or filter down to any
 * one member's own schedule. Reuses WS_EVENTS.attendees (shared with the
 * personal calendar) so both views stay in sync with the same source data.
 */
export default function InstituteCalendarPanel() {
  const { lang } = useLanguage();
  const vi = lang === 'vi';
  const { user: authUser } = useAuth();
  const [authorized, setAuthorized] = useState(null);
  const [staffFilter, setStaffFilter] = useState('all');

  useEffect(() => {
    if (!isLive || !authUser) { setAuthorized(false); return; }
    supabase.rpc('is_top_admin').then(({ data, error }) => setAuthorized(!error && Boolean(data)));
  }, [authUser]);

  const today = useMemo(() => new Date(), []);
  const todayStr = today.toISOString().slice(0, 10);
  const monday = useMemo(() => {
    const d = new Date(today);
    d.setDate(today.getDate() - ((today.getDay() + 6) % 7));
    return d;
  }, [today]);
  const weekDays = useMemo(() => Array.from({ length: 5 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  }), [monday]);

  const fmtDay = (d) => d.toLocaleDateString(vi ? 'vi-VN' : 'en-US', { weekday: 'short', day: '2-digit', month: '2-digit' });
  const fmtDateKey = (d) => d.toISOString().slice(0, 10);
  const isToday = (d) => fmtDateKey(d) === todayStr;
  const fmtTime = (iso) => iso.slice(11, 16);
  const fmtDateLabel = (iso) => new Date(iso).toLocaleDateString(vi ? 'vi-VN' : 'en-US', { weekday: 'short', day: '2-digit', month: '2-digit' });

  const filteredEvents = useMemo(
    () => WS_EVENTS.filter((ev) => eventIncludesStaff(ev, staffFilter)),
    [staffFilter]
  );
  const getEventsForDay = (d) => {
    const key = fmtDateKey(d);
    return filteredEvents.filter((ev) => ev.start.startsWith(key));
  };
  const upcoming = [...filteredEvents]
    .filter((ev) => ev.start >= today.toISOString().slice(0, 10))
    .sort((a, b) => a.start.localeCompare(b.start))
    .slice(0, 8);

  const t = NAVIGATION_LOCALIZATION[lang] || NAVIGATION_LOCALIZATION.en;

  if (!isLive) {
    return (
      <div className="font-sans text-xs text-neutral-500 p-4 border border-neutral-200 bg-neutral-50">
        {vi ? 'Tính năng này cần kết nối Supabase (chế độ demo không hỗ trợ).' : 'This feature requires a live Supabase connection (not available in demo mode).'}
      </div>
    );
  }

  if (authorized === null) {
    return <div className="font-sans text-xs text-neutral-400 p-4">{vi ? 'Đang kiểm tra quyền...' : 'Checking permissions...'}</div>;
  }

  if (authorized === false) {
    return (
      <div className="font-sans text-xs text-red-700 p-4 border border-red-200 bg-red-50">
        {vi
          ? 'Bạn không có quyền truy cập mục này. Chỉ Admin, Director, hoặc Vice Director mới xem được lịch toàn viện.'
          : 'You do not have access to this page. Only Admin, Director, or Vice Director can view the institute calendar.'}
      </div>
    );
  }

  return (
    <div className="space-y-3 font-sans">
      <div className="flex flex-wrap items-center gap-2 border border-neutral-200 bg-white px-3 py-2.5">
        <CalendarRange className="h-3.5 w-3.5 text-[#990000] shrink-0" />
        <span className="text-[10px] font-bold uppercase tracking-wide text-neutral-500 shrink-0">
          {vi ? 'Xem lịch của' : 'Viewing calendar for'}
        </span>
        <select
          value={staffFilter}
          onChange={(e) => setStaffFilter(e.target.value)}
          className="flex-1 min-w-[200px] rounded-none border border-neutral-300 bg-white px-2.5 py-1.5 text-xs text-neutral-800 focus:border-[#990000] focus:outline-none"
        >
          <option value="all">{vi ? 'Toàn viện (tất cả nhân sự)' : 'Institute-wide (all staff)'}</option>
          {STAFF_NAMES.map((m) => (
            <option key={m.id} value={m.nameVi}>{vi ? m.nameVi : m.nameEn}</option>
          ))}
        </select>
      </div>

      <MyCalendarView
        lang={lang}
        t={t}
        weekDays={weekDays}
        monday={monday}
        fmtDay={fmtDay}
        isToday={isToday}
        fmtDateKey={fmtDateKey}
        getEventsForDay={getEventsForDay}
        fmtTime={fmtTime}
        upcoming={upcoming}
        today={today}
        fmtDateLabel={fmtDateLabel}
      />
    </div>
  );
}

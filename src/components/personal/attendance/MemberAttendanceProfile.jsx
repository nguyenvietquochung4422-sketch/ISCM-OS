import { useMemo, useState } from 'react';
import { LayoutDashboard, CalendarDays, History as HistoryIcon, ShieldCheck } from 'lucide-react';
import TodayStatusCard from './TodayStatusCard.jsx';
import MonthlySummaryCard from './MonthlySummaryCard.jsx';
import MyAttendanceCalendar from './MyAttendanceCalendar.jsx';
import AttendanceHistoryList from './AttendanceHistoryList.jsx';
import PendingRequestsAdmin from './PendingRequestsAdmin.jsx';
import ApprovalTimeline from './ApprovalTimeline.jsx';

/** One member's whole attendance picture — Overview (today + monthly
    summary), Calendar, History — reused as both "My Attendance" (member
    viewing themself) and the admin's per-member profile (Institute
    Attendance > Members). Every child reads from the same pre-filtered
    record set, so Overview/Calendar/History never show different numbers
    for the same person. */
export default function MemberAttendanceProfile({ vi, records, memberId, memberLabel, isAdmin, viewerId, canCancel, onChanged, context }) {
  const [tab, setTab] = useState('overview');
  const memberRecords = useMemo(() => records.filter((r) => r.member_id === memberId), [records, memberId]);

  const TABS = [
    { key: 'overview', label: vi ? 'Tổng quan' : 'Overview', icon: LayoutDashboard },
    { key: 'calendar', label: vi ? 'Lịch' : 'Calendar', icon: CalendarDays },
    { key: 'history', label: vi ? 'Lịch sử' : 'History', icon: HistoryIcon },
    ...(isAdmin ? [{ key: 'admin', label: vi ? 'Quản trị' : 'Admin', icon: ShieldCheck }] : []),
  ];

  return (
    <div className="space-y-3">
      {memberLabel && (
        <p className="font-barlow text-sm font-black uppercase tracking-wide text-neutral-900">{memberLabel}</p>
      )}

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

      {tab === 'overview' && (
        <div className="space-y-3">
          <TodayStatusCard vi={vi} records={memberRecords} />
          <MonthlySummaryCard vi={vi} records={memberRecords} memberId={memberId} context={context} />
        </div>
      )}

      {tab === 'calendar' && (
        <MyAttendanceCalendar
          vi={vi} records={memberRecords} isAdmin={isAdmin} viewerId={viewerId} canCancel={canCancel}
          onChanged={onChanged}
        />
      )}

      {tab === 'history' && (
        <AttendanceHistoryList
          vi={vi} records={memberRecords} isAdmin={isAdmin} viewerId={viewerId} canCancel={canCancel}
          onChanged={onChanged}
        />
      )}

      {tab === 'admin' && isAdmin && (
        <div className="space-y-4">
          <PendingRequestsAdmin vi={vi} records={memberRecords} viewerId={viewerId} onChanged={onChanged} />
          <div className="border-t border-neutral-100 pt-3">
            <ApprovalTimeline vi={vi} records={memberRecords} />
          </div>
        </div>
      )}
    </div>
  );
}

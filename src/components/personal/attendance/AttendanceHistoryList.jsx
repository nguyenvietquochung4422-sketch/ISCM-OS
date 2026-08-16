import { useMemo, useState } from 'react';
import { Search, History } from 'lucide-react';
import { ATTENDANCE_TYPES, APPROVAL_STATUSES } from '../../../data/attendanceStore.js';
import { doesRecordOverlapRange } from '../../../data/attendanceAggregation.js';
import AttendanceRecordModal from './AttendanceRecordModal.jsx';

const CURRENT_YEAR = new Date().getFullYear();
const DEFAULT_FROM = `${CURRENT_YEAR}-01-01`;
const DEFAULT_TO = `${CURRENT_YEAR}-12-31`;

function fmtDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('vi-VN');
}

const STATUS_TEXT_CLASS = {
  Approved: 'text-emerald-700', Pending: 'text-amber-700',
  Rejected: 'text-red-700', Cancelled: 'text-neutral-400', 'No Permission': 'text-red-700', Draft: 'text-neutral-400',
};

/** All of a member's attendance records as a flat, filterable list — the
    complement to the Calendar view. Reuses AttendanceRecordModal for
    detail/cancel/approve, same as Calendar, so there's exactly one place
    that renders a record's detail and one place that decides it. */
export default function AttendanceHistoryList({ vi, records, isAdmin, viewerId, canCancel, memberLabelFor, onChanged }) {
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState(DEFAULT_FROM);
  const [dateTo, setDateTo] = useState(DEFAULT_TO);
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return records
      .filter((r) => typeFilter === 'all' || r.attendance_type === typeFilter)
      .filter((r) => statusFilter === 'all' || r.approval_status === statusFilter)
      .filter((r) => (!dateFrom && !dateTo) || doesRecordOverlapRange(r, dateFrom || '0000-01-01', dateTo || '9999-12-31'))
      .filter((r) => !q || (r.reason || '').toLowerCase().includes(q))
      .sort((a, b) => b.attendance_date.localeCompare(a.attendance_date));
  }, [records, typeFilter, statusFilter, dateFrom, dateTo, query]);

  const selectClass = 'border border-neutral-200 bg-white px-2 py-1.5 text-xs focus:border-[#8b0000] focus:outline-none rounded-none text-neutral-700 font-medium';

  return (
    <div className="space-y-2.5">
      <p className="flex items-center gap-1.5 font-ibm text-xs font-semibold text-iscm-charcoal">
        <History className="h-3.5 w-3.5 text-iscm-crimson" />
        {vi ? 'Lịch sử chấm công' : 'Attendance History'}
      </p>

      <div className="flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-[160px]">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-400" />
          <input
            type="text" value={query} onChange={(e) => setQuery(e.target.value)}
            placeholder={vi ? 'Tìm theo lý do...' : 'Search reason...'}
            className="w-full pl-8 pr-2.5 py-1.5 border border-neutral-200 bg-white text-xs focus:border-[#8b0000] focus:outline-none rounded-none"
          />
        </div>
        <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className={selectClass} />
        <span className="self-center text-neutral-300 text-xs">–</span>
        <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className={selectClass} />
        <select className={selectClass} value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
          <option value="all">{vi ? 'Tất cả loại' : 'All Types'}</option>
          {ATTENDANCE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <select className={selectClass} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="all">{vi ? 'Tất cả trạng thái' : 'All Statuses'}</option>
          {APPROVAL_STATUSES.filter((s) => s !== 'Draft' && s !== 'No Permission').map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div className="border border-neutral-200 overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="bg-neutral-900 text-white font-barlow text-[9px] font-bold uppercase tracking-wider">
              {isAdmin && <th className="px-2.5 py-2">{vi ? 'Thành viên' : 'Member'}</th>}
              <th className="px-2.5 py-2">{vi ? 'Ngày' : 'Date'}</th>
              <th className="px-2.5 py-2">{vi ? 'Loại' : 'Type'}</th>
              <th className="px-2.5 py-2">{vi ? 'Thời lượng' : 'Duration'}</th>
              <th className="px-2.5 py-2">{vi ? 'Lý do' : 'Reason'}</th>
              <th className="px-2.5 py-2">{vi ? 'Trạng thái' : 'Status'}</th>
              <th className="px-2.5 py-2" />
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {filtered.map((r) => (
              <tr key={r.id} className="hover:bg-neutral-50/80">
                {isAdmin && <td className="px-2.5 py-2 font-semibold text-neutral-800">{r.member?.full_name || r.member?.email || '—'}</td>}
                <td className="px-2.5 py-2 text-neutral-600 whitespace-nowrap">
                  {r.end_date && r.end_date !== r.attendance_date ? `${fmtDate(r.attendance_date)} – ${fmtDate(r.end_date)}` : fmtDate(r.attendance_date)}
                </td>
                <td className="px-2.5 py-2 text-neutral-700">{r.attendance_type}</td>
                <td className="px-2.5 py-2 text-neutral-500">{r.duration_type}</td>
                <td className="px-2.5 py-2 text-neutral-500 truncate max-w-[160px]">{r.reason || '—'}</td>
                <td className="px-2.5 py-2">
                  <span className={`text-[9px] font-bold uppercase ${STATUS_TEXT_CLASS[r.approval_status] || ''}`}>{r.approval_status}</span>
                </td>
                <td className="px-2.5 py-2">
                  <button onClick={() => setSelected(r)} className="text-[9px] font-bold uppercase text-neutral-500 hover:text-[#8b0000]">
                    {vi ? 'Xem' : 'View'}
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={isAdmin ? 7 : 6} className="px-3 py-8 text-center text-neutral-400 italic">{vi ? 'Không có bản ghi nào.' : 'No records found.'}</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {selected && (
        <AttendanceRecordModal
          vi={vi}
          record={selected}
          memberLabel={memberLabelFor ? memberLabelFor(selected) : (selected.member?.full_name || selected.member?.email)}
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

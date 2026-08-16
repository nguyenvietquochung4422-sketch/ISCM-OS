import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, ArrowUpDown, Download, X } from 'lucide-react';
import { exportToCsv } from '../../../lib/exportCsv.js';
import { buildMonthlyMatrix, getMatrixCellRecords, monthRange, doesRecordOverlapRange } from '../../../data/attendanceAggregation.js';
import AttendanceRecordModal from './AttendanceRecordModal.jsx';

function fmtDate(d) {
  return new Date(d).toLocaleDateString('vi-VN');
}

/** Institute-wide Monthly Attendance Matrix — replaces the old spreadsheet.
    Every number comes from summarizeRecords via buildMonthlyMatrix; nothing
    here computes a day/occurrence count independently, so totals here
    always match Member Profile for the same month. */
export default function MonthlyAttendanceMatrix({ vi, records, accounts, viewerId, context }) {
  const [cursor, setCursor] = useState(() => { const n = new Date(); return { y: n.getFullYear(), m: n.getMonth() }; });
  const [includePending, setIncludePending] = useState(false);
  const [sortKey, setSortKey] = useState('name');
  const [sortDir, setSortDir] = useState('asc');
  const [query, setQuery] = useState('');
  const [drilldown, setDrilldown] = useState(null); // { title, records }
  const [selectedRecord, setSelectedRecord] = useState(null);

  const { from, to } = monthRange(cursor.y, cursor.m);
  const monthLabel = new Date(cursor.y, cursor.m, 1).toLocaleDateString(vi ? 'vi-VN' : 'en-US', { month: 'long', year: 'numeric' });

  const matrix = useMemo(() => buildMonthlyMatrix({ accounts, records, year: cursor.y, month: cursor.m, context }), [accounts, records, cursor, context]);

  const rows = useMemo(() => matrix.map(({ account, summary }) => {
    const a = summary.approved;
    const p = summary.pending;
    const totalExceptions = Object.values(a).reduce((sum, b) => sum + b.occurrences, 0);
    return {
      account,
      name: account.full_name || account.email,
      al: { value: a['Annual Leave'].equivalentDays, pending: p['Annual Leave'].equivalentDays },
      absence: { value: a['Absence'].equivalentDays, pending: p['Absence'].equivalentDays },
      wfh: { value: a['Work from Home'].equivalentDays, pending: p['Work from Home'].equivalentDays },
      outsideFd: { value: a['Work Outside'].fullDays, pending: p['Work Outside'].fullDays },
      outsideHd: { value: a['Work Outside'].halfDays * 2, pending: p['Work Outside'].halfDays * 2 },
      outsideTotal: { value: a['Work Outside'].equivalentDays, pending: p['Work Outside'].equivalentDays },
      late: { value: a['Late'].occurrences, pending: p['Late'].occurrences },
      pending: summary.statusCounts.pending,
      totalExceptions,
    };
  }), [matrix]);

  const filteredSorted = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = rows.filter((r) => !q || r.name.toLowerCase().includes(q));
    const dir = sortDir === 'asc' ? 1 : -1;
    return [...list].sort((a, b) => {
      if (sortKey === 'name') return dir * a.name.localeCompare(b.name, 'vi');
      const av = typeof a[sortKey] === 'object' ? a[sortKey].value : a[sortKey];
      const bv = typeof b[sortKey] === 'object' ? b[sortKey].value : b[sortKey];
      return dir * (av - bv);
    });
  }, [rows, query, sortKey, sortDir]);

  const toggleSort = (key) => {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortKey(key); setSortDir(key === 'name' ? 'asc' : 'desc'); }
  };

  const openDrilldown = (row, label, attendanceType, durationGroup) => {
    const cellRecords = getMatrixCellRecords(records, row.account.id, attendanceType, from, to, durationGroup, includePending)
      .sort((a, b) => a.attendance_date.localeCompare(b.attendance_date));
    if (cellRecords.length === 0) return;
    setDrilldown({ title: `${row.name} — ${label}`, records: cellRecords });
  };

  // The Pending column spans every type (not one, like the other cells), so
  // it can't go through getMatrixCellRecords' single-type filter.
  const openPendingDrilldown = (row) => {
    const cellRecords = records
      .filter((r) => r.member_id === row.account.id && r.approval_status === 'Pending' && doesRecordOverlapRange(r, from, to))
      .sort((a, b) => a.attendance_date.localeCompare(b.attendance_date));
    if (cellRecords.length === 0) return;
    setDrilldown({ title: `${row.name} — ${vi ? 'Chờ duyệt' : 'Pending'}`, records: cellRecords });
  };

  const COLUMNS = [
    { key: 'al', label: 'AL', type: 'Annual Leave', group: null },
    { key: 'absence', label: vi ? 'Vắng' : 'Absence', type: 'Absence', group: null },
    { key: 'wfh', label: 'WFH', type: 'Work from Home', group: null },
    { key: 'outsideFd', label: 'Outside FD', type: 'Work Outside', group: 'Full Day' },
    { key: 'outsideHd', label: 'Outside HD', type: 'Work Outside', group: 'Half Day' },
    { key: 'outsideTotal', label: 'Outside Total', type: 'Work Outside', group: null },
    { key: 'late', label: 'Late', type: 'Late', group: null },
  ];

  const cellClass = (val) => `px-2 py-2 text-center ${val > 0 ? 'cursor-pointer hover:bg-[#8b0000]/5 font-semibold text-neutral-800' : 'text-neutral-300'}`;

  const handleExport = () => {
    const headers = [
      vi ? 'Thành viên' : 'Member', 'Email', vi ? 'Tháng' : 'Month',
      'Annual Leave (days)', 'Absence (days)', 'WFH (days)',
      'Outside Full Day (count)', 'Outside Half Day (count)', 'Outside Total (days)',
      'Late (occurrences)', 'Pending Requests', 'Total Approved Exceptions',
    ];
    const csvRows = filteredSorted.map((r) => [
      r.name, r.account.email, monthLabel,
      r.al.value, r.absence.value, r.wfh.value,
      r.outsideFd.value, r.outsideHd.value, r.outsideTotal.value,
      r.late.value, r.pending, r.totalExceptions,
    ]);
    exportToCsv(`iscm-attendance-matrix-${cursor.y}-${String(cursor.m + 1).padStart(2, '0')}`, headers, csvRows);
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="font-ibm text-xs font-semibold text-iscm-charcoal">
          {vi ? 'Ma trận chấm công theo tháng' : 'Monthly Attendance Matrix'}
        </p>
        <div className="flex items-center gap-1.5">
          <button onClick={() => setCursor((c) => c.m === 0 ? { y: c.y - 1, m: 11 } : { y: c.y, m: c.m - 1 })} className="p-1 border border-neutral-200 hover:border-iscm-crimson"><ChevronLeft className="h-3.5 w-3.5" /></button>
          <span className="text-xs font-semibold text-neutral-700 capitalize min-w-[110px] text-center">{monthLabel}</span>
          <button onClick={() => setCursor((c) => c.m === 11 ? { y: c.y + 1, m: 0 } : { y: c.y, m: c.m + 1 })} className="p-1 border border-neutral-200 hover:border-iscm-crimson"><ChevronRight className="h-3.5 w-3.5" /></button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <input
          type="text" value={query} onChange={(e) => setQuery(e.target.value)}
          placeholder={vi ? 'Tìm tên thành viên...' : 'Search member name...'}
          className="flex-1 min-w-[160px] px-2.5 py-1.5 border border-neutral-200 bg-white text-xs focus:border-[#8b0000] focus:outline-none rounded-none"
        />
        <div className="flex border border-neutral-200 text-[10px] font-bold uppercase">
          <button onClick={() => setIncludePending(false)} className={`px-2.5 py-1.5 ${!includePending ? 'bg-neutral-900 text-white' : 'text-neutral-600 hover:bg-neutral-50'}`}>
            {vi ? 'Chỉ Approved' : 'Approved only'}
          </button>
          <button onClick={() => setIncludePending(true)} className={`px-2.5 py-1.5 ${includePending ? 'bg-neutral-900 text-white' : 'text-neutral-600 hover:bg-neutral-50'}`}>
            {vi ? 'Kèm Pending' : 'Show Pending'}
          </button>
        </div>
        <button onClick={handleExport} className="flex items-center gap-1.5 border border-neutral-200 bg-white px-2.5 py-1.5 text-[10px] font-bold uppercase text-neutral-600 hover:border-[#8b0000] hover:text-[#8b0000]">
          <Download className="h-3.5 w-3.5" /> CSV
        </button>
      </div>

      <p className="text-[10px] text-neutral-400 italic">
        {vi
          ? 'Bao gồm mọi tài khoản ISCM OS đang hoạt động — thành viên không có ngoại lệ trong tháng vẫn hiện với giá trị 0.'
          : 'Includes every active ISCM OS account — members with no exceptions this month still appear with zero values.'}
      </p>

      <div className="border border-neutral-200 overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-neutral-900 text-white font-barlow text-[9px] font-bold uppercase tracking-wider">
              <th className="sticky left-0 bg-neutral-900 px-2.5 py-2 z-10">
                <button onClick={() => toggleSort('name')} className="flex items-center gap-1">{vi ? 'Thành viên' : 'Member'} <ArrowUpDown className="h-2.5 w-2.5" /></button>
              </th>
              {COLUMNS.map((c) => (
                <th key={c.key} className="px-2 py-2 text-center whitespace-nowrap">
                  <button onClick={() => toggleSort(c.key)} className="flex items-center gap-1 mx-auto">{c.label} <ArrowUpDown className="h-2.5 w-2.5" /></button>
                </th>
              ))}
              <th className="px-2 py-2 text-center whitespace-nowrap">
                <button onClick={() => toggleSort('pending')} className="flex items-center gap-1 mx-auto">{vi ? 'Chờ duyệt' : 'Pending'} <ArrowUpDown className="h-2.5 w-2.5" /></button>
              </th>
              <th className="px-2 py-2 text-center whitespace-nowrap">
                <button onClick={() => toggleSort('totalExceptions')} className="flex items-center gap-1 mx-auto">{vi ? 'Tổng' : 'Total'} <ArrowUpDown className="h-2.5 w-2.5" /></button>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {filteredSorted.map((row) => (
              <tr key={row.account.id} className="hover:bg-neutral-50/60">
                <td className="sticky left-0 bg-white px-2.5 py-2 font-semibold text-neutral-800 whitespace-nowrap">{row.name}</td>
                {COLUMNS.map((c) => {
                  const cell = row[c.key];
                  return (
                    <td key={c.key} className={cellClass(cell.value)} onClick={() => openDrilldown(row, c.label, c.type, c.group)}>
                      {cell.value}
                      {includePending && cell.pending > 0 && <span className="text-amber-600 font-normal"> (+{cell.pending})</span>}
                    </td>
                  );
                })}
                <td className={cellClass(row.pending)} onClick={() => openPendingDrilldown(row)}>{row.pending}</td>
                <td className="px-2 py-2 text-center font-bold text-neutral-900">{row.totalExceptions}</td>
              </tr>
            ))}
            {accounts.length === 0 ? (
              <tr><td colSpan={COLUMNS.length + 3} className="px-3 py-8 text-center text-neutral-400 italic">
                {vi ? 'Không có tài khoản nào đang hoạt động trên ISCM OS.' : 'No attendance-enabled accounts found.'}
              </td></tr>
            ) : filteredSorted.length === 0 && (
              <tr><td colSpan={COLUMNS.length + 3} className="px-3 py-8 text-center text-neutral-400 italic">
                {vi ? 'Không có thành viên nào khớp bộ lọc.' : 'No members match the selected filters.'}
              </td></tr>
            )}
          </tbody>
        </table>
      </div>

      {drilldown && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setDrilldown(null)}>
          <div onClick={(e) => e.stopPropagation()} className="w-full max-w-sm bg-white border border-neutral-200 shadow-xl font-sans">
            <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-100 bg-neutral-900 text-white">
              <h3 className="font-barlow text-xs font-black uppercase tracking-wide">{drilldown.title}</h3>
              <button onClick={() => setDrilldown(null)} className="text-neutral-400 hover:text-white"><X className="h-4 w-4" /></button>
            </div>
            <div className="divide-y divide-neutral-100 max-h-80 overflow-y-auto">
              {drilldown.records.map((r) => (
                <button key={r.id} onClick={() => setSelectedRecord(r)} className="w-full text-left px-4 py-2.5 hover:bg-neutral-50">
                  <p className="text-xs font-semibold text-neutral-800">
                    {fmtDate(r.attendance_date)}{r.end_date && r.end_date !== r.attendance_date ? ` – ${fmtDate(r.end_date)}` : ''}
                    {' — '}{r.attendance_type} · {r.duration_type}
                  </p>
                  <p className="text-[10px] text-neutral-500">
                    {r.reason || (vi ? '(không có lý do)' : '(no reason given)')} ·{' '}
                    <span className={r.approval_status === 'Approved' ? 'text-emerald-700' : 'text-amber-700'}>{r.approval_status}</span>
                  </p>
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
          isAdmin
          viewerId={viewerId}
          onClose={() => setSelectedRecord(null)}
          onChanged={() => { setSelectedRecord(null); setDrilldown(null); }}
        />
      )}
    </div>
  );
}

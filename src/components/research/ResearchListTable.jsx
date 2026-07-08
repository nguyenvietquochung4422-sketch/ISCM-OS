import { useEffect, useMemo, useState } from 'react';
import { Search, Database, WifiOff, Plus, X, RotateCcw } from 'lucide-react';
import { supabase, isLive } from '../../lib/supabaseClient.js';
import { researchList as fallbackRows, RESEARCH_UNITS } from '../../data/researchList.js';

/* ------------------------------------------------------------------ */
/* Research List — full-screen editable grid, Excel-style.             */
/* Live Supabase query (authenticated read policy); falls back to the  */
/* bundled TSV-derived dataset when offline or unauthenticated. Cell    */
/* edits, custom columns, assignees and new rows persist to            */
/* localStorage so the sheet behaves like a live working document.     */
/* ------------------------------------------------------------------ */

const STORE_KEY = 'iscm_research_list_edits_v1';

function loadStore() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORE_KEY) || '{}');
    return {
      cellEdits: parsed.cellEdits ?? {},
      customColumns: parsed.customColumns ?? [],
      extraRows: parsed.extraRows ?? [],
    };
  } catch {
    return { cellEdits: {}, customColumns: [], extraRows: [] };
  }
}
function saveStore(store) {
  localStorage.setItem(STORE_KEY, JSON.stringify(store));
}

const STATUS_STYLES = {
  'In progress': 'bg-blue-50 text-blue-700 border-blue-200',
  Done: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Funded: 'bg-emerald-600 text-white border-emerald-600',
  Review: 'bg-amber-50 text-amber-700 border-amber-200',
  'On hold': 'bg-gray-100 text-gray-600 border-gray-200',
  'Not start': 'bg-gray-50 text-gray-500 border-gray-200',
  Delay: 'bg-orange-50 text-orange-700 border-orange-200',
  'Delay/File Clearance': 'bg-orange-50 text-orange-700 border-orange-200',
  'Submitted/ Termination': 'bg-violet-50 text-violet-700 border-violet-200',
  Failed: 'bg-red-50 text-iscm-crimson border-red-200',
  Cancel: 'bg-red-50 text-red-400 border-red-100 line-through',
};

/** The five ISCM framework pillars stored as flag columns on each row */
const PILLARS = [
  { key: 'framework_transition', label: 'FT' },
  { key: 'glocal_design', label: 'GD' },
  { key: 'human_centric_orientation', label: 'HC' },
  { key: 'tech_solutions', label: 'TS' },
  { key: 'urban_system', label: 'US' },
];

const BASE_COLUMNS = [
  { key: 'code', label: 'Code', width: 96, frozen: true },
  { key: 'research_unit', label: 'Research Unit', width: 190 },
  { key: 'task_name', label: 'Task Name', width: 340 },
  { key: 'status', label: 'Status', width: 130, type: 'status' },
  { key: 'start_year', label: 'Start', width: 76 },
  { key: 'end_year', label: 'End', width: 76 },
  { key: 'task_type', label: 'Type', width: 130 },
  { key: 'ordered_by', label: 'Order by', width: 140 },
  { key: 'coordinator_manager', label: 'Coordinator/Manager', width: 160 },
  { key: 'members', label: 'Members', width: 260 },
  { key: 'assignee', label: 'Assignee', width: 160, highlight: true },
  { key: 'report_plan_link', label: 'Minute Report / Plan', width: 260 },
  { key: 'pillars', label: 'Pillars', width: 150, type: 'pillars', readOnlyDerived: true },
  { key: 'sdgs', label: 'SDGs', width: 220 },
];

function PillarChips({ row }) {
  return (
    <span className="flex gap-0.5">
      {PILLARS.map(({ key, label }) => {
        const active = row[key] && row[key] !== 'Không';
        return (
          <span
            key={key}
            title={active ? row[key] : `${label}: —`}
            className={`inline-flex h-5 w-6 items-center justify-center rounded font-barlow-condensed text-[9px] font-bold ${
              active ? 'bg-iscm-crimson text-white' : 'bg-gray-100 text-gray-300'
            }`}
          >
            {label}
          </span>
        );
      })}
    </span>
  );
}

let newRowSeq = 0;
let newColSeq = 0;

export default function ResearchListTable() {
  const [rows, setRows] = useState(null); // null = loading (live mode)
  const [source, setSource] = useState('local');
  const [unit, setUnit] = useState('all');
  const [status, setStatus] = useState('all');
  const [query, setQuery] = useState('');

  const [store, setStore] = useState(loadStore);
  const [addingColumn, setAddingColumn] = useState(false);
  const [newColName, setNewColName] = useState('');

  useEffect(() => { saveStore(store); }, [store]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!isLive) { setRows(fallbackRows); return; }
      try {
        const { data, error } = await supabase
          .from('iscm_research_list')
          .select('*')
          .order('research_unit', { ascending: true })
          .order('code', { ascending: true, nullsFirst: false });
        if (cancelled) return;
        if (error || !data || data.length === 0) {
          setRows(fallbackRows);
        } else {
          setRows(data);
          setSource('live');
        }
      } catch {
        if (!cancelled) setRows(fallbackRows);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  const columns = useMemo(() => [...BASE_COLUMNS, ...store.customColumns], [store.customColumns]);

  const allRows = useMemo(() => {
    if (!rows) return [];
    return [...rows, ...store.extraRows];
  }, [rows, store.extraRows]);

  const getCell = (row, key) => store.cellEdits[row.id]?.[key] ?? row[key] ?? '';

  const setCell = (rowId, key, value) => {
    setStore((prev) => ({
      ...prev,
      cellEdits: {
        ...prev.cellEdits,
        [rowId]: { ...prev.cellEdits[rowId], [key]: value },
      },
    }));
  };

  const addRow = () => {
    newRowSeq += 1;
    const id = `new-${Date.now()}-${newRowSeq}`;
    setStore((prev) => ({ ...prev, extraRows: [...prev.extraRows, { id }] }));
  };

  const removeRow = (id) => {
    setStore((prev) => ({ ...prev, extraRows: prev.extraRows.filter((r) => r.id !== id) }));
  };

  const confirmAddColumn = () => {
    const label = newColName.trim();
    if (!label) { setAddingColumn(false); return; }
    newColSeq += 1;
    const key = `custom_${Date.now()}_${newColSeq}`;
    setStore((prev) => ({ ...prev, customColumns: [...prev.customColumns, { key, label }] }));
    setNewColName('');
    setAddingColumn(false);
  };

  const removeColumn = (key) => {
    setStore((prev) => ({ ...prev, customColumns: prev.customColumns.filter((c) => c.key !== key) }));
  };

  const resetEdits = () => {
    if (!window.confirm('Xoá toàn bộ chỉnh sửa (ô, cột, dòng đã thêm) và khôi phục dữ liệu gốc?')) return;
    const empty = { cellEdits: {}, customColumns: [], extraRows: [] };
    setStore(empty);
  };

  const statuses = useMemo(
    () => [...new Set(allRows.map((r) => getCell(r, 'status')).filter(Boolean))].sort(),
    [allRows, store.cellEdits]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return allRows.filter((r) => {
      const rUnit = getCell(r, 'research_unit');
      const rStatus = getCell(r, 'status');
      return (
        (unit === 'all' || rUnit === unit) &&
        (status === 'all' || rStatus === status) &&
        (!q || columns.some((c) => String(getCell(r, c.key) ?? '').toLowerCase().includes(q)))
      );
    });
  }, [allRows, unit, status, query, columns, store.cellEdits]);

  const selectClass =
    'rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 font-ibm text-[11px] focus:border-iscm-crimson focus:outline-none text-iscm-charcoal';

  const cellInputClass =
    'w-full min-w-0 bg-transparent px-1 py-0.5 font-ibm text-[11px] text-iscm-charcoal focus:bg-iscm-crimson/5 focus:rounded focus:outline-none focus:ring-1 focus:ring-iscm-crimson/40';

  if (rows === null) {
    return <div className="py-12 text-center font-ibm text-xs text-gray-400">Đang tải Research List từ Supabase…</div>;
  }

  return (
    <div className="flex h-full min-h-0 flex-col gap-2">
      {/* Toolbar: source indicator + filters + actions */}
      <div className="flex flex-wrap items-center gap-2 px-1">
        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-barlow-condensed text-[10px] font-semibold uppercase tracking-wider ${
          source === 'live' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
        }`}>
          {source === 'live' ? <Database className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
          {source === 'live' ? 'Live · iscm_research_list' : 'Offline snapshot (RLS: cần đăng nhập)'}
        </span>
        <span className="font-barlow-condensed text-xs text-gray-400">{filtered.length} / {allRows.length} hoạt động</span>

        <div className="ml-auto flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 h-3 w-3 -translate-y-1/2 text-gray-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Lọc theo tên, code, thành viên…"
              className={`${selectClass} w-48 pl-6`}
            />
          </div>
          <select value={unit} onChange={(e) => setUnit(e.target.value)} className={selectClass}>
            <option value="all">Tất cả Research Units</option>
            {RESEARCH_UNITS.map((u) => <option key={u}>{u}</option>)}
          </select>
          <select value={status} onChange={(e) => setStatus(e.target.value)} className={selectClass}>
            <option value="all">Mọi trạng thái</option>
            {statuses.map((s) => <option key={s}>{s}</option>)}
          </select>
          <button
            onClick={addRow}
            className="flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 font-ibm text-[11px] font-semibold text-iscm-charcoal hover:border-iscm-crimson hover:text-iscm-crimson"
          >
            <Plus className="h-3 w-3" /> Dòng
          </button>
          {addingColumn ? (
            <span className="flex items-center gap-1">
              <input
                autoFocus
                value={newColName}
                onChange={(e) => setNewColName(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') confirmAddColumn(); if (e.key === 'Escape') setAddingColumn(false); }}
                placeholder="Tên cột mới…"
                className={`${selectClass} w-36`}
              />
              <button onClick={confirmAddColumn} className="rounded-lg bg-iscm-crimson px-2 py-1.5 font-ibm text-[11px] font-semibold text-white hover:bg-iscm-crimson-dark">OK</button>
            </span>
          ) : (
            <button
              onClick={() => setAddingColumn(true)}
              className="flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 font-ibm text-[11px] font-semibold text-iscm-charcoal hover:border-iscm-crimson hover:text-iscm-crimson"
            >
              <Plus className="h-3 w-3" /> Cột
            </button>
          )}
          <button
            onClick={resetEdits}
            title="Khôi phục dữ liệu gốc"
            className="flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 font-ibm text-[11px] font-semibold text-gray-500 hover:border-iscm-crimson hover:text-iscm-crimson"
          >
            <RotateCcw className="h-3 w-3" /> Reset
          </button>
        </div>
      </div>

      {/* Excel-style grid: sticky header row + sticky first (Code) column */}
      <div className="min-h-0 flex-1 overflow-auto rounded-xl border border-gray-200">
        <table className="border-collapse text-left" style={{ minWidth: 'max-content' }}>
          <thead>
            <tr className="border-b-2 border-gray-300 bg-iscm-charcoal font-barlow-condensed text-[10px] font-bold uppercase tracking-[0.1em] text-white">
              {columns.map((c) => (
                <th
                  key={c.key}
                  className={`sticky top-0 whitespace-nowrap border-r border-white/10 px-3 py-2.5 ${c.frozen ? 'left-0 z-30 bg-iscm-charcoal' : 'z-20'} ${c.highlight ? 'bg-iscm-crimson-dark' : ''}`}
                  style={{ minWidth: c.width }}
                >
                  <span className="flex items-center gap-1.5">
                    {c.label}
                    {!c.readOnlyDerived && c.key.startsWith('custom_') && (
                      <button onClick={() => removeColumn(c.key)} title="Xoá cột" className="text-white/50 hover:text-white">
                        <X className="h-3 w-3" />
                      </button>
                    )}
                  </span>
                </th>
              ))}
              <th className="sticky top-0 z-20 w-10 bg-iscm-charcoal" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map((r, i) => {
              const stripe = i % 2 === 0 ? 'bg-white' : 'bg-gray-50/60';
              return (
                <tr key={r.id} className={`group hover:bg-iscm-crimson/5 ${stripe}`}>
                  {columns.map((c) => {
                    const frozenBg = i % 2 === 0 ? 'bg-white' : 'bg-gray-50';
                    if (c.type === 'pillars') {
                      return (
                        <td key={c.key} className="border-r border-gray-100 px-3 py-2" style={{ minWidth: c.width }}>
                          <PillarChips row={r} />
                        </td>
                      );
                    }
                    if (c.type === 'status') {
                      const val = getCell(r, c.key);
                      return (
                        <td key={c.key} className="border-r border-gray-100 px-2 py-1.5" style={{ minWidth: c.width }}>
                          <select
                            value={val}
                            onChange={(e) => setCell(r.id, c.key, e.target.value)}
                            className={`rounded-full border px-2 py-0.5 font-ibm text-[10px] font-medium focus:outline-none ${STATUS_STYLES[val] ?? STATUS_STYLES['Not start']}`}
                          >
                            {!STATUS_STYLES[val] && val && <option value={val}>{val}</option>}
                            {!val && <option value="">—</option>}
                            {Object.keys(STATUS_STYLES).map((s) => <option key={s} value={s}>{s}</option>)}
                          </select>
                        </td>
                      );
                    }
                    return (
                      <td
                        key={c.key}
                        className={`border-r border-gray-100 px-2 py-1.5 ${c.frozen ? `sticky left-0 z-10 ${frozenBg}` : ''} ${c.highlight ? 'bg-amber-50/60' : ''}`}
                        style={{ minWidth: c.width }}
                      >
                        <input
                          value={getCell(r, c.key)}
                          onChange={(e) => setCell(r.id, c.key, e.target.value)}
                          className={cellInputClass}
                          placeholder={c.key === 'assignee' ? 'Chưa phân công' : '—'}
                        />
                      </td>
                    );
                  })}
                  <td className="px-2 py-1.5 text-center">
                    {store.extraRows.some((er) => er.id === r.id) && (
                      <button onClick={() => removeRow(r.id)} title="Xoá dòng" className="text-gray-300 opacity-0 hover:text-iscm-crimson group-hover:opacity-100">
                        <X className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={columns.length + 1} className="px-3 py-10 text-center font-ibm text-xs text-gray-400">
                  Không có hoạt động nào khớp bộ lọc.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <p className="px-1 font-ibm text-[10px] text-gray-400">
        FT = Framework Transition · GD = Glocal Design · HC = Human Centric Orientation · TS = Tech Solutions · US = Urban System.
        Bấm trực tiếp vào ô để chỉnh sửa — thay đổi được lưu tại trình duyệt này. Nguồn: <span className="font-semibold">2026 ISCM – RESEARCH – Research List</span> (bảng <code>iscm_research_list</code>).
      </p>
    </div>
  );
}

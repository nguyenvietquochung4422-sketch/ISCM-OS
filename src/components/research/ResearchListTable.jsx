import { useMemo, useState, useEffect, Fragment } from 'react';
import {
  Search, Plus, ChevronRight, ChevronDown, Folder, FileText, FolderPlus, Download
} from 'lucide-react';
import { RESEARCH_UNITS } from '../../data/researchList.js';
import { ISCM_MEMBERS } from '../../data/iscmMembers.js';
import { useLanguage } from '../../i18n/LanguageContext.jsx';
import { exportToCsv } from '../../lib/exportCsv.js';
import { resolveMemberNameAndTitle } from '../../data/memberNames.js';
import {
  compareCodes, parentCodeOf, codeDepth, isSubUnitCode,
} from '../../data/researchCodes.js';
import NewResearchRowDialog from './NewResearchRowDialog.jsx';

const STATUS_CLASSES = {
  'In progress': 'bg-blue-50 text-blue-700 border-blue-200',
  'Completed': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'Done': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'Funded': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'Cancel': 'bg-red-50 text-red-700 border-red-200',
  'Failed': 'bg-red-50 text-red-700 border-red-200',
  'Not start': 'bg-gray-100 text-gray-600 border-gray-200',
  'On hold': 'bg-gray-100 text-gray-600 border-gray-200',
  'Review': 'bg-amber-50 text-amber-700 border-amber-200',
};

const TASK_TYPE_CLASSES = {
  'Paper': 'border-purple-200 text-purple-700 bg-purple-50',
  'Training': 'border-gray-200 text-gray-700 bg-gray-50',
  'IRL': 'border-blue-200 text-blue-700 bg-blue-50',
  'Research': 'border-indigo-200 text-indigo-700 bg-indigo-50',
  'New initiative': 'border-orange-200 text-orange-700 bg-orange-50',
  'Student research': 'border-pink-200 text-pink-700 bg-pink-50',
  'Fund Raising': 'border-yellow-200 text-yellow-700 bg-yellow-50',
  'Project': 'border-teal-200 text-teal-700 bg-teal-50',
  'PL': 'border-cyan-200 text-cyan-700 bg-cyan-50',
  'TIL': 'border-violet-200 text-violet-700 bg-violet-50',
  'Event': 'border-rose-200 text-rose-700 bg-rose-50',
  'Individual': 'border-sky-200 text-sky-700 bg-sky-50',
};

let inlineRowSeq = 0;

// Map group name to its main numeric code for section sorting
const getGroupMainCode = (groupName) => {
  switch (groupName) {
    case 'MOVE System': return 'RU1';
    case 'Net Zero Open lab': return 'RU2';
    case 'Public Space Lab': return 'RU3';
    case 'Governance and Planning': return 'RU4';
    case 'Immersive Tech Convergence Center': return 'RU5';
    case 'Smart City': return 'RU6';
    case 'New Economy': return 'RU7';
    case 'Data Driven and Urban Design': return 'RU8';
    case 'Fund Raising': return 'RU9';
    case 'Individual & Team Initiatives': return 'RU 10';
    default: return 'RU999';
  }
};

export default function ResearchListTable({
  allRowsResolved,
  setCell,
  selectedTask,
  setSelectedTask,
  store,
  onCreateDraft,
  researchUnits = [],
  setResearchUnits,
  taskTypes = [],
  statusOptions = []
}) {
  const { lang } = useLanguage();
  const [query, setQuery] = useState('');
  const [unit, setUnit] = useState('all');
  const [taskType, setTaskType] = useState('all');
  const [status, setStatus] = useState('all');
  const [expandedRows, setExpandedRows] = useState(new Set());
  const [newOpen, setNewOpen] = useState(false);
  const [newPrefill, setNewPrefill] = useState(null);

  // Set default view collapsed on load
  useEffect(() => {
    if (allRowsResolved.length > 0 && expandedRows.size === 0) {
      setExpandedRows(new Set());
    }
  }, [allRowsResolved]);

  const toggleRow = (id, e) => {
    e.stopPropagation();
    setExpandedRows((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // ── Code convention ──  (see src/data/researchCodes.js)
  //   RU1        main Research Unit   -> RU1.CE    sub Research Unit
  //   RU1.CE.1   task inside the sub-unit
  //   RU1.2      task sitting directly under the main unit
  // All three levels are created from the one dialog below, which enters the
  // code as its three parts and numbers the task itself.

  /** Blank row — every field starts empty so nothing is pre-filled with a guess. */
  const blankRow = (idPrefix, targetUnit) => {
    inlineRowSeq += 1;
    return {
      id: `${idPrefix}-${Date.now()}-${inlineRowSeq}`,
      code: '',
      task_name: '',
      research_unit: targetUnit,
      status: '',
      start_year: '',
      end_year: null,
      task_type: '',
      coordinator_manager: '',
      members: '',
      report_plan_link: '',
      framework_transition: '',
      glocal_design: '',
      human_centric_orientation: '',
      tech_solutions: '',
      urban_system: '',
      sdgs: '',
    };
  };

  const openNewDialog = (prefill = null) => {
    setNewPrefill(prefill);
    setNewOpen(true);
  };

  /**
   * The one place a row is born, whichever of the three levels it is: the
   * dialog has already worked out the code and which level it belongs to, so
   * all that's left is to register a brand-new Research Unit and hand the row
   * over as a draft (nothing is stored until Save).
   */
  const handleCreateFromDialog = ({ kind, code, task_name, research_unit }) => {
    if (kind === 'unit') {
      if (researchUnits.includes(research_unit)) {
        alert(lang === 'vi' ? 'Đơn vị này đã tồn tại.' : 'This Research Unit already exists.');
        setUnit(research_unit);
        return;
      }
      setResearchUnits?.((prev) => [...prev, research_unit]);
      setUnit(research_unit);
    }
    onCreateDraft({ ...blankRow(`new-${kind}`, research_unit), code, task_name });
  };

  // Filter rows first (matching search and hierarchy parents)
  const filteredRows = useMemo(() => {
    const q = query.trim().toLowerCase();
    const isFiltered = q !== '' || unit !== 'all' || taskType !== 'all' || status !== 'all';

    // 1. Compute direct matches
    const matched = allRowsResolved.filter((r) => {
      const rUnit = r.research_unit || '';
      const rStatus = r.status || '';
      const rType = r.task_type || '';

      const matchQuery = !q || [
        r.code,
        r.task_name,
        r.coordinator_manager,
        r.members
      ].some((val) => String(val || '').toLowerCase().includes(q));

      const matchUnit = unit === 'all' || rUnit === unit;
      const matchType = taskType === 'all' || rType === taskType;
      const matchStatus = status === 'all' || rStatus === status;

      return matchQuery && matchUnit && matchType && matchStatus;
    });

    if (!isFiltered) return allRowsResolved;

    // 2. Resolve parent ancestors to preserve tree structure
    const activeSet = new Set();
    const codeToId = {};
    allRowsResolved.forEach(r => { if (r.code) codeToId[r.code.trim()] = r.id; });

    matched.forEach((r) => {
      activeSet.add(r.id);
      
      // Walk up the code chain so a filtered-in row keeps its ancestors
      // visible (RU1.SML1 -> RU1.SML -> RU1).
      let code = (r.code || '').trim();
      let parentCode = parentCodeOf(code);
      while (parentCode) {
        const parentId = codeToId[parentCode];
        if (parentId) activeSet.add(parentId);
        code = parentCode;
        parentCode = parentCodeOf(code);
      }
    });

    return allRowsResolved.filter((r) => activeSet.has(r.id));
  }, [allRowsResolved, query, unit, taskType, status]);

  // Group and sort the filtered items
  const groupedAndSortedData = useMemo(() => {
    // 1. Group rows by Research Unit (consolidating Individual and IndividualTEAM)
    const groups = {};
    filteredRows.forEach(row => {
      let groupName = row.research_unit || 'Other';
      if (groupName === 'Individual' || groupName === 'IndividualTEAM') {
        groupName = 'Individual & Team Initiatives';
      }
      if (!groups[groupName]) groups[groupName] = [];
      groups[groupName].push(row);
    });

    // 2. Sort groups by their main folder code
    const groupNames = Object.keys(groups).sort((a, b) => 
      compareCodes(getGroupMainCode(a), getGroupMainCode(b))
    );

    // 3. For each group, build tree hierarchy and sort pre-order
    const result = [];

    groupNames.forEach(groupName => {
      const groupRows = groups[groupName];

      // Identify main folder for this group
      const mainFolder = groupRows.find(r => {
        const code = (r.code || '').trim();
        const name = (r.task_name || '').toLowerCase();
        return name.includes('main folder') || (code.startsWith('RU') && !code.includes('.') && code.match(/^RU\s*\d+$/));
      });

      const codeToId = {};
      groupRows.forEach(r => { if (r.code) codeToId[r.code.trim()] = r.id; });

      // Resolve parents and levels inside this group
      const childrenMap = {};
      const resolvedRowsMap = {};

      groupRows.forEach(r => {
        let parentId = null;
        let level = 0;
        const code = (r.code || '').trim();

        if (mainFolder && r.id !== mainFolder.id) {
          const parentCode = parentCodeOf(code);
          if (parentCode) {
            // Indentation always matches the code's own depth (RU1.SML1 is a
            // level-2 grandchild), even when an intermediate row like RU1.SML
            // was never created — it just falls back to attaching under the
            // main folder instead of visually flattening to level 1.
            parentId = codeToId[parentCode] || mainFolder.id;
            level = codeDepth(code);
          } else {
            parentId = mainFolder.id;
            level = 1;
          }
        }

        const resolved = { ...r, resolvedParentId: parentId, resolvedLevel: level };
        resolvedRowsMap[r.id] = resolved;

        if (parentId) {
          if (!childrenMap[parentId]) childrenMap[parentId] = [];
          childrenMap[parentId].push(resolved);
        }
      });

      // Traverse pre-order to preserve tree layout and sorting
      const sortedGroupRows = [];
      const traverse = (node, level) => {
        // Never indent shallower than the code itself implies (see the
        // fallback-attachment case above) — only ever deepen from the
        // tree-walk depth, never shallow it back out.
        node.resolvedLevel = Math.max(level, node.resolvedLevel || 0);
        sortedGroupRows.push(node);
        const children = childrenMap[node.id] || [];
        children.sort((a, b) => compareCodes(a.code, b.code));
        children.forEach(child => traverse(child, node.resolvedLevel + 1));
      };

      const roots = groupRows
        .map(r => resolvedRowsMap[r.id])
        .filter(r => !r.resolvedParentId);
      
      roots.sort((a, b) => compareCodes(a.code, b.code));
      roots.forEach(root => traverse(root, 0));

      // Filter visible rows in this group based on expanded state — only the
      // top-level Research Unit folder is collapsible; once it's expanded,
      // every task and sub-task beneath it shows in full (no per-task
      // chevrons to open individually).
      const isFiltered = query.trim() !== '' || unit !== 'all' || taskType !== 'all' || status !== 'all';
      const visibleGroupRows = sortedGroupRows.filter(row => {
        if (isFiltered) return true;
        if (row.resolvedLevel === 0) return true;
        return mainFolder ? expandedRows.has(mainFolder.id) : true;
      });

      if (visibleGroupRows.length > 0) {
        result.push({ groupName, rows: visibleGroupRows });
      }
    });

    return result;
  }, [filteredRows, expandedRows, query, unit, taskType, status]);

  // Render avatar stack
  const renderAvatarGroup = (membersStr, memberRoles) => {
    if (!membersStr) return <span className="text-neutral-300 font-sans text-[11px]">—</span>;
    const list = membersStr.split(',').map(m => m.trim()).filter(Boolean);
    const displayed = list.slice(0, 3);
    const leftover = list.length - 3;

    return (
      <div className="relative group/avatar flex items-center">
        <div className="flex -space-x-1.5 overflow-hidden">
          {displayed.map((name, idx) => {
            const clean = name.replace('-Lead', '').trim();
            const initials = clean.split(/\s+/).map(p => p[0]).join('').substring(0, 2).toUpperCase();
            return (
              <div
                key={idx}
                className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-neutral-100 border border-white text-[9px] font-bold text-neutral-800 font-ibm tracking-tighter"
                title={resolveMemberNameAndTitle(name)}
              >
                {initials}
              </div>
            );
          })}
          {leftover > 0 && (
            <div className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#8b0000] border border-white text-[9px] font-bold text-white font-ibm">
              +{leftover}
            </div>
          )}
        </div>
        
        {/* Tooltip */}
        <div className="pointer-events-none absolute left-1/2 -translate-x-1/2 top-full z-40 mt-1.5 w-52 scale-90 rounded bg-[#111] p-2.5 text-[10px] text-white opacity-0 shadow-xl transition-all duration-200 group-hover/avatar:pointer-events-auto group-hover/avatar:scale-100 group-hover/avatar:opacity-100 font-ibm">
          <div className="font-semibold text-white/50 mb-1 uppercase tracking-wider text-[8px]">Team Members</div>
          <ul className="space-y-0.5">
            {list.map((name, i) => (
              <li key={i} className="flex items-center gap-1.5 text-white/90">
                <span className="h-1 w-1 rounded-full bg-[#8b0000] shrink-0" />
                <span className="truncate">{resolveMemberNameAndTitle(name)}</span>
                {memberRoles?.[name] && (
                  <span className="ml-auto shrink-0 text-white/40 text-[9px]">{memberRoles[name]}</span>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  };

  const customColumns = store.customColumns;

  // Exports exactly the rows currently rendered in the table — same rows,
  // same order, respecting the search/unit/task type/status filters AND
  // which Research Unit folders are collapsed vs expanded right now (a
  // collapsed folder's children aren't "in the table" until expanded).
  // Coordinator and Members are resolved to the same display names shown
  // on screen, not the raw short-name strings the fields are stored as, so
  // the CSV matches what's actually visible rather than the backing data.
  const handleExportCsv = () => {
    const headers = ['Code', 'Task Name', 'Research Unit', 'Task Type', 'Coordinator / Manager', 'Members', 'Status', 'Start Year', 'End Year'];
    const visibleRows = groupedAndSortedData.flatMap((group) => group.rows);
    const rows = visibleRows.map((r) => [
      r.code || '', r.task_name || '', r.research_unit || '', r.task_type || '',
      resolveMemberNameAndTitle(r.coordinator_manager || ''),
      (r.members || '').split(',').map((m) => m.trim()).filter(Boolean).map(resolveMemberNameAndTitle).join(', '),
      r.status || '', r.start_year || '', r.end_year || '',
    ]);
    exportToCsv('research-list', headers, rows);
  };

  return (
    <div className="flex h-full min-h-0 flex-col gap-4 font-ibm text-neutral-900 bg-white">
      
      {/* 1. Filters Bar — single row; the search field absorbs all the slack
          so the filters/actions never wrap to a second line. */}
      <div className="flex items-center gap-2 bg-neutral-50 p-2.5 border border-neutral-200/60">
        <div className="relative min-w-0 flex-1">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by Code, Task Name, or Member..."
            className="w-full pl-9 pr-3 py-1.5 border border-neutral-200 bg-white text-xs text-neutral-800 placeholder:text-neutral-400 focus:border-[#8b0000] focus:ring-1 focus:ring-[#8b0000] focus:outline-none transition-all rounded-none"
          />
        </div>

        <select
          value={unit}
          onChange={(e) => setUnit(e.target.value)}
          className="shrink-0 max-w-[150px] border border-neutral-200 bg-white px-2 py-1.5 text-xs focus:border-[#8b0000] focus:outline-none rounded-none text-neutral-700 font-medium"
        >
          <option value="all">All Research Units</option>
          {researchUnits.map((u) => <option key={u} value={u}>{u}</option>)}
        </select>

        <select
          value={taskType}
          onChange={(e) => setTaskType(e.target.value)}
          className="shrink-0 max-w-[130px] border border-neutral-200 bg-white px-2 py-1.5 text-xs focus:border-[#8b0000] focus:outline-none rounded-none text-neutral-700 font-medium"
        >
          <option value="all">All Task Types</option>
          {taskTypes.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="shrink-0 max-w-[125px] border border-neutral-200 bg-white px-2 py-1.5 text-xs focus:border-[#8b0000] focus:outline-none rounded-none text-neutral-700 font-medium"
        >
          <option value="all">All Statuses</option>
          {statusOptions.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>

        <button
          type="button"
          onClick={() => openNewDialog()}
          title={lang === 'vi' ? 'Tạo Đơn vị / Nhóm con / Tác vụ' : 'New Unit / Sub-unit / Task'}
          className="shrink-0 inline-flex items-center gap-1.5 whitespace-nowrap border border-neutral-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-neutral-700 hover:border-[#8b0000] hover:text-[#8b0000] transition-colors rounded-none"
        >
          <FolderPlus className="h-3.5 w-3.5 shrink-0" />
          {lang === 'vi' ? 'Tạo mới' : 'New'}
        </button>

        <button
          type="button"
          onClick={handleExportCsv}
          title={lang === 'vi' ? 'Xuất CSV' : 'Export CSV'}
          className="shrink-0 inline-flex items-center gap-1.5 whitespace-nowrap border border-neutral-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-neutral-700 hover:border-[#8b0000] hover:text-[#8b0000] transition-colors rounded-none"
        >
          <Download className="h-3.5 w-3.5 shrink-0" />
          CSV
        </button>
      </div>

      {/* 2. Grid Table */}
      <div className="min-h-0 flex-1 overflow-auto border border-neutral-200 bg-white shadow-sm">
        <table className="w-full table-fixed border-collapse text-left">
          <thead>
            <tr className="border-b border-neutral-200 bg-neutral-900 text-white font-barlow text-[10px] font-bold uppercase tracking-wider">
              <th className="px-3 py-3 w-[9%]">Code</th>
              <th className="px-3 py-3 w-[24%]">Task Name</th>
              <th className="px-3 py-3 w-[10%]">Task Type</th>
              <th className="px-3 py-3 w-[14%]">Coordinator / Manager</th>
              <th className="px-3 py-3 w-[10%]">Members</th>
              <th className="px-3 py-3 w-[13%]">Status</th>
              <th className="px-3 py-3 w-[9%]">Timeline</th>
              {customColumns.map((col) => (
                <th key={col.key} className="px-3 py-3" />
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100 text-xs font-ibm">
            {groupedAndSortedData.map((group) => (
              <Fragment key={group.groupName}>
                {/* Unified Section Header Row aligned in table */}
                <tr className="bg-neutral-100/80 border-y border-neutral-200 select-none">
                  <td colSpan={7 + customColumns.length} className="px-4 py-2.5 font-bold font-barlow text-[#8b0000] uppercase tracking-wide text-[11px]">
                    {group.groupName}
                  </td>
                </tr>

                {/* Section Rows as siblings to align columns */}
                {group.rows.map((row) => {
                  const level = row.resolvedLevel || 0;
                  const isExpanded = expandedRows.has(row.id);
                  const isSelected = selectedTask?.id === row.id;

                  // Check if row has children (has children with this row's id as parent)
                  const hasChildren = allRowsResolved.some(r => {
                    const pcode = (row.code || '').trim();
                    const rcode = (r.code || '').trim();
                    return pcode && rcode.startsWith(pcode + '.') && rcode.split('.').length === pcode.split('.').length + 1;
                  });

                  return (
                    <tr
                      key={row.id}
                      onClick={() => setSelectedTask(row)}
                      className={`group cursor-pointer hover:bg-neutral-50/80 transition-colors border-b border-neutral-100 last:border-none ${
                        isSelected ? '!bg-red-50/40 border-l-4 border-[#8b0000]' : ''
                      }`}
                    >
                      {/* CODE */}
                      <td className="px-3 py-3 font-semibold overflow-hidden">
                        <div className="flex items-center gap-1.5">
                          {hasChildren && level === 0 ? (
                            <button
                              onClick={(e) => toggleRow(row.id, e)}
                              className="h-4 w-4 inline-flex items-center justify-center text-neutral-500 hover:bg-neutral-200 transition-colors rounded-sm shrink-0"
                            >
                              {isExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                            </button>
                          ) : (
                            <span className="w-4 shrink-0" />
                          )}

                          {level === 0 || isSubUnitCode(row.code) ? (
                            <Folder className={`h-3.5 w-3.5 shrink-0 ${level === 0 ? 'text-[#8b0000]' : 'text-neutral-400'}`} />
                          ) : (
                            <FileText className="h-3.5 w-3.5 text-neutral-400 shrink-0" />
                          )}

                          {row.code ? (
                            <span className="text-[10px] font-mono text-neutral-500">
                              {row.code}
                            </span>
                          ) : (
                            <span className="text-neutral-300 font-mono text-[9px]">--</span>
                          )}
                        </div>
                      </td>

                      {/* TASK NAME with progressive indentation + tree guide lines */}
                      <td className="relative px-3 py-3 font-medium" style={{ paddingLeft: `${Math.max(12, level * 20)}px` }}>
                        {Array.from({ length: level }).map((_, i) => (
                          <span key={i} className="absolute bottom-0 top-0 border-l border-neutral-200" style={{ left: `${16 + i * 20}px` }} />
                        ))}
                        <button
                          onClick={() => setSelectedTask(row)}
                          className="relative text-left font-sans text-xs font-semibold text-slate-700 group-hover:text-[#8b0000] hover:underline transition-colors whitespace-normal break-words"
                        >
                          {row.task_name || 'Untitled Task'}
                        </button>
                        {/* Shortcut into the same dialog, with this sub-unit
                            already selected in the two left-hand code boxes. */}
                        {isSubUnitCode(row.code) && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              const [unitCode, subAbbr] = (row.code || '').trim().split('.');
                              openNewDialog({ unitCode, subAbbr });
                            }}
                            title={lang === 'vi' ? 'Thêm tác vụ vào nhóm này' : 'Add a task inside this sub-unit'}
                            className="relative ml-1.5 inline-flex items-center text-neutral-300 opacity-0 group-hover:opacity-100 hover:text-[#8b0000] transition-all"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        )}
                      </td>

                      {/* TASK TYPE — blank when unset */}
                      <td className="px-3 py-3 overflow-hidden">
                        {row.task_type && (
                          <span className={`inline-block max-w-full truncate border px-2 py-0.5 text-[9px] font-semibold rounded-none tracking-wider uppercase ${
                            TASK_TYPE_CLASSES[row.task_type] || 'border-neutral-200 text-neutral-600 bg-neutral-50'
                          }`}>
                            {row.task_type}
                          </span>
                        )}
                      </td>

                      {/* COORDINATOR */}
                      <td className="px-3 py-3">
                        {row.coordinator_manager ? (
                          <span className="text-[11px] font-semibold text-neutral-700">
                            {resolveMemberNameAndTitle(row.coordinator_manager)}
                          </span>
                        ) : (
                          <span className="text-neutral-300 italic">—</span>
                        )}
                      </td>

                      {/* MEMBERS — hidden on RU main folder rows, only shown on child tasks */}
                      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                        {level > 0 && renderAvatarGroup(row.members, row.member_roles)}
                      </td>

                      {/* STATUS — read-only badge, same as Task Type; no
                          in-table dropdown at all. Editing status only
                          happens from the drawer. */}
                      <td className="px-3 py-3 overflow-hidden">
                        {row.status && (
                          <span className={`inline-block max-w-full truncate border px-2 py-0.5 text-[9px] font-semibold rounded-none tracking-wider uppercase ${
                            STATUS_CLASSES[row.status] || 'border-neutral-200 text-neutral-600 bg-neutral-50'
                          }`}>
                            {row.status}
                          </span>
                        )}
                      </td>

                      {/* TIMELINE */}
                      <td className="px-4 py-3 text-neutral-500 font-mono font-medium whitespace-nowrap">
                        {row.start_year || '—'} - {row.end_year || '--'}
                      </td>

                      {/* CUSTOM COLUMNS */}
                      {customColumns.map((col) => (
                        <td key={col.key} className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="text"
                            value={row[col.key] || ''}
                            onChange={(e) => setCell(row.id, col.key, e.target.value)}
                            placeholder="—"
                            className="w-full bg-transparent border-b border-transparent hover:border-neutral-200 focus:border-[#8b0000] focus:outline-none py-0.5 text-xs text-neutral-800"
                          />
                        </td>
                      ))}
                    </tr>
                  );
                })}

                {/* Adding anything — Unit, sub-unit or task — goes through the
                    single "Tạo mới" dialog in the toolbar. */}
              </Fragment>
            ))}

            {groupedAndSortedData.length === 0 && (
              <tr>
                <td colSpan={7 + customColumns.length} className="py-12 text-center text-neutral-400 font-medium">
                  No research activities match the selected filters.
                </td>
              </tr>
            )}

          </tbody>
        </table>
      </div>

      <NewResearchRowDialog
        open={newOpen}
        onClose={() => setNewOpen(false)}
        rows={allRowsResolved}
        prefill={newPrefill}
        onCreate={handleCreateFromDialog}
      />
    </div>
  );
}

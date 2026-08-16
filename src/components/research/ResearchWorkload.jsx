import { useMemo, useState, useEffect } from 'react';
import { Search, User, Briefcase, CheckSquare, Layers, AlertCircle, ArrowUpRight, CheckCircle2, Download, AlertTriangle } from 'lucide-react';
import { ISCM_MEMBERS } from '../../data/iscmMembers.js';
import { exportToCsv } from '../../lib/exportCsv.js';

import { getShortNamesForMember, isMemberMatch, stripTitles } from '../../data/memberNames.js';
import { roleOf } from '../../data/memberRoles.js';

// Name matching lives in ../../data/memberNames.js — re-exported here because
// several modules already import it from this file.
export { getShortNamesForMember, isMemberMatch };

// Member Roles (Leader/Coordinator/Member) are tagged per-task in the
// Research List drawer, keyed by the exact name string as it appears in
// `row.members` — resolve which of those name segments is this member to
// look up their role on that specific task. Via roleOf, so the Director
// reads as Leader here too when no role was recorded.
export function getMemberRoleForTask(row, member) {
  if (!row.members) return null;
  const names = row.members.split(',').map(m => m.trim()).filter(Boolean);
  const matchedName = names.find(name => isMemberMatch(member, name));
  return matchedName ? (roleOf(row.member_roles, matchedName) || null) : null;
}

// end_year is stored ISO ("YYYY-MM-DD") for new edits, but legacy rows still
// carry free text like "3/8/2026" (M/D/YYYY) — parse both.
function parseDeadline(str) {
  if (!str) return null;
  const s = String(str).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
    const d = new Date(`${s}T23:59:59`);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  const m = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(s);
  if (m) {
    const [, mo, da, yr] = m;
    const d = new Date(`${yr}-${mo.padStart(2, '0')}-${da.padStart(2, '0')}T23:59:59`);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  return null;
}

const MS_PER_DAY = 24 * 60 * 60 * 1000;

export default function ResearchWorkload({ allRowsResolved, setSelectedTask }) {
  const [query, setQuery] = useState('');
  const [workloadFilter, setWorkloadFilter] = useState('all');

  // Overdue is time-based, not stored — re-check against the wall clock
  // every minute so a task crossing its deadline while the page stays open
  // flips to "Overdue" without a reload.
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const daysLate = (row) => {
    const deadline = parseDeadline(row.end_year);
    if (!deadline) return null;
    const diff = Math.floor((now - deadline) / MS_PER_DAY);
    return diff > 0 ? diff : null;
  };

  // Compute workload mapping for each member
  const memberWorkloads = useMemo(() => {
    const isActiveTask = (row) => {
      if (!row.status) return true;
      const status = row.status.toLowerCase().trim();
      return (
        status !== 'completed' &&
        status !== 'done' &&
        status !== 'failed' &&
        status !== 'cancel' &&
        status !== 'not start' &&
        status !== 'submitted/ termination'
      );
    };

    const isDoneTask = (row) => {
      if (!row.status) return false;
      const status = row.status.toLowerCase().trim();
      return status === 'completed' || status === 'done';
    };

    // RU main-folder rows (e.g. "DDUD Main Folder", code "RU8") are structural
    // grouping containers, not real assignments — same rule used to hide
    // Members/Status on them in ResearchListTable, applied here so they don't
    // show up as workload chips either.
    const isMainFolderRow = (row) => {
      const code = (row.code || '').trim();
      const name = (row.task_name || '').toLowerCase();
      return name.includes('main folder') || (code.startsWith('RU') && !code.includes('.') && /^RU\s*\d+$/.test(code));
    };

    return ISCM_MEMBERS.map(member => {
      // Find coordinator roles (where this member is coordinator_manager)
      const coordinatorTasks = allRowsResolved.filter(row =>
        row.coordinator_manager &&
        isMemberMatch(member, row.coordinator_manager) &&
        isActiveTask(row) &&
        !isMainFolderRow(row)
      );

      // Find member roles (where this member is listed in members list)
      const memberTasks = allRowsResolved.filter(row =>
        row.members &&
        isMemberMatch(member, row.members) &&
        isActiveTask(row) &&
        !isMainFolderRow(row)
      );

      // Find completed roles (coordinator or member) for the "Done" section
      const doneRows = allRowsResolved.filter(row =>
        isDoneTask(row) &&
        !isMainFolderRow(row) && (
          (row.coordinator_manager && isMemberMatch(member, row.coordinator_manager)) ||
          (row.members && isMemberMatch(member, row.members))
        )
      );
      const doneTasks = Array.from(new Map(doneRows.map(r => [r.id, r])).values());

      // Overdue = active (not done/cancelled) task whose deadline is already
      // behind "now" — recomputed every tick, not a stored flag.
      const overdueTasks = Array.from(
        new Map([...coordinatorTasks, ...memberTasks]
          .filter(row => daysLate(row) !== null)
          .map(r => [r.id, r])).values()
      );

      const totalRoles = coordinatorTasks.length + memberTasks.length;

      let status = 'Available';
      let statusClass = 'bg-emerald-50 text-emerald-700 border-emerald-200';
      if (totalRoles > 4) {
        status = 'High Workload';
        statusClass = 'bg-red-50 text-red-700 border-red-200';
      } else if (totalRoles > 0) {
        status = 'Moderate Workload';
        statusClass = 'bg-amber-50 text-amber-700 border-amber-200';
      }

      return {
        member,
        coordinatorTasks,
        memberTasks,
        doneTasks,
        overdueTasks,
        totalRoles,
        status,
        statusClass
      };
    });
  }, [allRowsResolved, now]);

  // Apply filters
  const filteredWorkloads = useMemo(() => {
    const q = query.trim().toLowerCase();
    return memberWorkloads.filter(w => {
      const matchQuery = !q || [
        w.member.nameVi,
        w.member.nameEn,
        w.member.titleVi,
        w.member.titleEn
      ].some(val => String(val || '').toLowerCase().includes(q));

      const matchStatus = workloadFilter === 'all'
        || (workloadFilter === 'Overdue' ? w.overdueTasks.length > 0 : w.status === workloadFilter);

      return matchQuery && matchStatus;
    });
  }, [memberWorkloads, query, workloadFilter]);

  // Institute-wide overdue count — unique tasks, not per-member (a task with
  // 2 overdue members would otherwise be counted twice).
  const instituteOverdueTasks = useMemo(() => {
    const map = new Map();
    memberWorkloads.forEach(w => w.overdueTasks.forEach(t => map.set(t.id, t)));
    return Array.from(map.values());
  }, [memberWorkloads]);

  // Exports the currently filtered members with their coordinating/
  // engagement/done task lists — opens directly in Excel/Sheets.
  const handleExportCsv = () => {
    const headers = ['Name', 'Title', 'Capacity Status', 'Total Roles', 'Coordinating', 'Engagements (with role)', 'Done Tasks', 'Overdue Tasks (days late)'];
    const rows = filteredWorkloads.map((w) => [
      w.member.nameVi,
      w.member.titleVi || '',
      w.status,
      w.totalRoles,
      w.coordinatorTasks.map((t) => t.task_name).join('; '),
      w.memberTasks.map((t) => {
        const role = getMemberRoleForTask(t, w.member);
        return role ? `${t.task_name} (${role})` : t.task_name;
      }).join('; '),
      w.doneTasks.map((t) => t.task_name).join('; '),
      w.overdueTasks.map((t) => `${t.task_name} (${daysLate(t)}d)`).join('; '),
    ]);
    exportToCsv('workload', headers, rows);
  };

  // Get initials for member avatar display
  const getInitials = (name) => {
    const clean = stripTitles(name);
    const parts = clean.split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return clean.substring(0, 2).toUpperCase();
  };

  return (
    <div className="flex h-full min-h-0 flex-col gap-4 text-neutral-900 bg-white">

      {/* Overdue Summary Banner — recomputed against the wall clock every
          minute (see the `now` ticker above), so it's live, not a stored flag. */}
      {instituteOverdueTasks.length > 0 && (
        <button
          type="button"
          onClick={() => setWorkloadFilter(workloadFilter === 'Overdue' ? 'all' : 'Overdue')}
          className={`flex items-center gap-2 border px-3 py-2 text-left transition-colors ${
            workloadFilter === 'Overdue'
              ? 'bg-red-100 border-red-300'
              : 'bg-red-50 border-red-200 hover:bg-red-100'
          }`}
        >
          <AlertTriangle className="h-4 w-4 text-red-600 shrink-0" />
          <span className="text-xs font-semibold text-red-700">
            {instituteOverdueTasks.length} {instituteOverdueTasks.length === 1 ? 'task is' : 'tasks are'} past deadline
          </span>
          <span className="text-[10px] text-red-500 font-medium">
            {workloadFilter === 'Overdue' ? '· click to clear filter' : '· click to filter'}
          </span>
        </button>
      )}

      {/* Search and Filters Toolbar */}
      <div className="flex flex-wrap items-center gap-3 bg-neutral-50 p-3 border border-neutral-200/60">
        <div className="relative flex-1 min-w-[260px]">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search members by name or role title..."
            className="w-full pl-9 pr-3 py-1.5 border border-neutral-200 bg-white text-xs text-neutral-800 focus:border-[#8b0000] focus:ring-1 focus:ring-[#8b0000] focus:outline-none transition-all rounded-none"
          />
        </div>

        <select
          value={workloadFilter}
          onChange={(e) => setWorkloadFilter(e.target.value)}
          className="border border-neutral-200 bg-white px-3 py-1.5 text-xs focus:border-[#8b0000] focus:outline-none rounded-none text-neutral-700 font-medium"
        >
          <option value="all">All Workload Statuses</option>
          <option value="High Workload">High Workload (&gt; 4 Tasks)</option>
          <option value="Moderate Workload">Moderate Workload (1-4 Tasks)</option>
          <option value="Available">Available (0 Tasks)</option>
          <option value="Overdue">Overdue (past deadline)</option>
        </select>

        <button
          type="button"
          onClick={handleExportCsv}
          className="ml-auto inline-flex items-center gap-1.5 border border-neutral-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-neutral-700 hover:border-[#8b0000] hover:text-[#8b0000] transition-colors rounded-none"
        >
          <Download className="h-3.5 w-3.5" />
          Export CSV
        </button>

        <div className="text-xs text-neutral-500 font-medium">
          Showing {filteredWorkloads.length} of {ISCM_MEMBERS.length} members
        </div>
      </div>

      {/* Grid of Workload Profile Cards */}
      <div className="flex-1 overflow-y-auto pr-1 min-h-0">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredWorkloads.map(wl => (
            <div 
              key={wl.member.id} 
              className="border border-neutral-200 bg-white p-5 hover:shadow-glass hover:border-[#8b0000]/30 transition-all duration-300 flex flex-col gap-4 rounded-none group"
            >
              
              {/* Member Profile Header */}
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-full bg-[#8b0000]/5 text-[#8b0000] border border-[#8b0000]/10 flex items-center justify-center font-bold text-xs font-ibm shrink-0">
                  {getInitials(wl.member.nameVi)}
                </div>
                <div className="min-w-0">
                  <h4 className="font-semibold text-neutral-800 text-xs truncate" title={wl.member.nameVi}>
                    {wl.member.nameVi}
                  </h4>
                  <p className="text-[10px] text-neutral-400 font-medium truncate" title={wl.member.titleVi}>
                    {wl.member.titleVi} {wl.member.fieldVi ? `· ${wl.member.fieldVi}` : ''}
                  </p>
                </div>
              </div>

              {/* Workload Status Badge */}
              <div className="flex items-center justify-between border-t border-neutral-100 pt-3">
                <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider">
                  Capacity Rating
                </span>
                <span className={`inline-block border px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${wl.statusClass}`}>
                  {wl.status} ({wl.totalRoles} {wl.totalRoles === 1 ? 'task' : 'tasks'})
                </span>
              </div>

              {/* Overdue Tasks — only rendered when there's actually something
                  late, kept ahead of Coordinating/Engagements so it's the
                  first thing anyone scanning the card notices. */}
              {wl.overdueTasks.length > 0 && (
                <div className="flex flex-col gap-1.5 border-t border-red-100 pt-3">
                  <span className="text-[9px] font-bold text-red-500 uppercase tracking-wider flex items-center gap-1.5">
                    <AlertTriangle className="h-3 w-3 text-red-500" />
                    Overdue ({wl.overdueTasks.length})
                  </span>
                  <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto pr-0.5">
                    {wl.overdueTasks.map(task => (
                      <button
                        key={task.id}
                        onClick={() => setSelectedTask(task)}
                        className="inline-flex items-center gap-1 bg-red-50 hover:bg-red-100 border border-red-200 hover:border-red-300 text-red-700 px-2 py-0.5 text-[9px] font-semibold text-left transition-all rounded-none truncate max-w-full group/tag"
                      >
                        {task.code && <span className="font-mono text-[8px] bg-red-100 px-1 py-0.2">{task.code}</span>}
                        <span className="truncate">{task.task_name}</span>
                        <span className="shrink-0 font-bold">· {daysLate(task)}d late</span>
                        <ArrowUpRight className="h-2.5 w-2.5 opacity-0 group-hover/tag:opacity-100 shrink-0" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Coordinator Roles */}
              <div className="flex flex-col gap-1.5 flex-1 min-h-0">
                <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Layers className="h-3 w-3 text-neutral-400" />
                  Coordinating ({wl.coordinatorTasks.length})
                </span>
                {wl.coordinatorTasks.length > 0 ? (
                  <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto pr-0.5">
                    {wl.coordinatorTasks.map(task => (
                      <button
                        key={task.id}
                        onClick={() => setSelectedTask(task)}
                        className="inline-flex items-center gap-1 bg-neutral-50 hover:bg-[#8b0000]/10 border border-neutral-200 hover:border-[#8b0000]/30 text-neutral-600 hover:text-[#8b0000] px-2 py-0.5 text-[9px] font-semibold text-left transition-all rounded-none truncate max-w-full group/tag"
                      >
                        {task.code && <span className="font-mono text-[8px] bg-neutral-200/60 px-1 py-0.2">{task.code}</span>}
                        <span className="truncate">{task.task_name}</span>
                        <ArrowUpRight className="h-2.5 w-2.5 opacity-0 group-hover/tag:opacity-100 shrink-0" />
                      </button>
                    ))}
                  </div>
                ) : (
                  <span className="text-[10px] text-neutral-400 italic">No coordinated activities.</span>
                )}
              </div>

              {/* Member Engagements */}
              <div className="flex flex-col gap-1.5 border-t border-neutral-100 pt-3">
                <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
                  <CheckSquare className="h-3 w-3 text-neutral-400" />
                  Engagements ({wl.memberTasks.length})
                </span>
                {wl.memberTasks.length > 0 ? (
                  <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto pr-0.5">
                    {wl.memberTasks.map(task => {
                      const role = getMemberRoleForTask(task, wl.member);
                      return (
                        <button
                          key={task.id}
                          onClick={() => setSelectedTask(task)}
                          className="inline-flex items-center gap-1 bg-[#8b0000]/5 hover:bg-[#8b0000]/10 border border-[#8b0000]/10 hover:border-[#8b0000]/30 text-[#8b0000] px-2 py-0.5 text-[9px] font-semibold text-left transition-all rounded-none truncate max-w-full group/tag"
                        >
                          {task.code && <span className="font-mono text-[8px] bg-[#8b0000]/10 px-1 py-0.2">{task.code}</span>}
                          <span className="truncate">{task.task_name}</span>
                          {role && <span className="shrink-0 text-[#8b0000]/50 font-normal normal-case">· {role}</span>}
                          <ArrowUpRight className="h-2.5 w-2.5 opacity-0 group-hover/tag:opacity-100 shrink-0" />
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <span className="text-[10px] text-neutral-400 italic">No active engagements.</span>
                )}
              </div>

              {/* Done Tasks */}
              <div className="flex flex-col gap-1.5 border-t border-neutral-100 pt-3">
                <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 className="h-3 w-3 text-neutral-400" />
                  Done ({wl.doneTasks.length})
                </span>
                {wl.doneTasks.length > 0 ? (
                  <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto pr-0.5">
                    {wl.doneTasks.map(task => {
                      const role = getMemberRoleForTask(task, wl.member);
                      return (
                        <button
                          key={task.id}
                          onClick={() => setSelectedTask(task)}
                          className="inline-flex items-center gap-1 bg-neutral-100 hover:bg-neutral-200 border border-neutral-200 hover:border-neutral-300 text-neutral-500 px-2 py-0.5 text-[9px] font-semibold text-left transition-all rounded-none truncate max-w-full group/tag"
                        >
                          {task.code && <span className="font-mono text-[8px] bg-neutral-200/70 px-1 py-0.2">{task.code}</span>}
                          <span className="truncate">{task.task_name}</span>
                          {role && <span className="shrink-0 text-neutral-400 font-normal normal-case">· {role}</span>}
                          <ArrowUpRight className="h-2.5 w-2.5 opacity-0 group-hover/tag:opacity-100 shrink-0" />
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <span className="text-[10px] text-neutral-400 italic">No completed tasks yet.</span>
                )}
              </div>

            </div>
          ))}

          {filteredWorkloads.length === 0 && (
            <div className="col-span-full py-16 text-center text-neutral-400 font-medium">
              No members match the filtered search criteria.
            </div>
          )}
        </div>
      </div>
      
    </div>
  );
}

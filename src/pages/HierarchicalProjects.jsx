import { useMemo, useState } from 'react';
import {
  FolderTree, KanbanSquare, GanttChartSquare, Table2, Clock4, AlertTriangle,
  ChevronDown, ChevronRight, Layers, Link2, CheckCircle2, ListTodo, GripVertical,
} from 'lucide-react';
import {
  OS_HIERARCHY, OS_TASKS, ADHOC_TASKS, TIMESHEET, TIMESHEET_WEEK,
  timesheetTotal, staffById, projectIndex, TODAY,
} from '../data/osData.js';
import { Avatar } from '../components/ui.jsx';

/* ------------------------------------------------------------------ */
/* Đề án 1 · Phân hệ Quản lý Dự án Phân tầng                           */
/* Lab Chuyên Năng → Chương Trình Lớn → Dự Án Thành Phần → Task        */
/* Đa góc nhìn: Kanban / Gantt / Table + Timesheet Engine + Ad-hoc     */
/* ------------------------------------------------------------------ */

const VIEWS = [
  { key: 'kanban', label: 'Kanban', icon: KanbanSquare },
  { key: 'gantt', label: 'Gantt', icon: GanttChartSquare },
  { key: 'table', label: 'Table View', icon: Table2 },
  { key: 'timesheet', label: 'Timesheet', icon: Clock4 },
];

const COLUMNS = [
  { key: 'todo', label: 'Cần làm', accent: 'border-t-gray-300' },
  { key: 'doing', label: 'Đang làm', accent: 'border-t-blue-400' },
  { key: 'review', label: 'Rà soát', accent: 'border-t-amber-400' },
  { key: 'done', label: 'Hoàn tất', accent: 'border-t-emerald-400' },
];

/* ---- Gantt helpers: cửa sổ 01/07 → 30/09/2026 ---- */
const G_START = new Date('2026-07-01');
const G_DAYS = 92;
const pct = (d) => Math.min(100, Math.max(0, ((new Date(d) - G_START) / 864e5 / G_DAYS) * 100));

function GanttView({ tasks }) {
  const months = [
    { label: 'Tháng 7', left: 0, width: pct('2026-08-01') },
    { label: 'Tháng 8', left: pct('2026-08-01'), width: pct('2026-09-01') - pct('2026-08-01') },
    { label: 'Tháng 9', left: pct('2026-09-01'), width: 100 - pct('2026-09-01') },
  ];
  const barColor = { todo: 'bg-gray-300', doing: 'bg-blue-500', review: 'bg-amber-400', done: 'bg-emerald-500' };
  return (
    <div className="overflow-x-auto">
      <div className="min-w-[760px]">
        {/* Month header */}
        <div className="relative ml-[260px] h-7 rounded-t-lg border border-gray-200 bg-iscm-surface">
          {months.map((m) => (
            <span key={m.label}
              className="absolute top-0 flex h-full items-center border-l border-gray-200 pl-2 font-barlow-condensed text-[10px] font-bold uppercase tracking-wider text-gray-500"
              style={{ left: `${m.left}%`, width: `${m.width}%` }}>
              {m.label}
            </span>
          ))}
        </div>
        <div className="relative border border-t-0 border-gray-200">
          {/* Today line */}
          <span className="absolute bottom-0 top-0 z-10 w-px bg-iscm-crimson" style={{ left: `calc(260px + (100% - 260px) * ${pct(TODAY) / 100})` }}>
            <span className="absolute -top-0.5 left-1 font-barlow-condensed text-[9px] font-bold text-iscm-crimson">Hôm nay</span>
          </span>
          {tasks.map((t, i) => {
            const left = pct(t.start);
            const width = Math.max(1.5, pct(t.end) - left);
            const who = staffById[t.assignee];
            return (
              <div key={t.id} className={`flex items-center ${i % 2 ? 'bg-gray-50/60' : 'bg-white'}`}>
                <div className="w-[260px] shrink-0 truncate border-r border-gray-100 px-2.5 py-2 font-ibm text-[11px] text-iscm-charcoal" title={t.title}>
                  <span className="font-barlow-condensed font-bold text-iscm-crimson">{t.id}</span> {t.title}
                </div>
                <div className="relative h-8 flex-1">
                  <span
                    title={`${t.start} → ${t.end} · ${who?.name}`}
                    className={`absolute top-1.5 h-5 rounded-full ${barColor[t.column]} flex items-center gap-1 overflow-hidden px-2`}
                    style={{ left: `${left}%`, width: `${width}%` }}
                  >
                    <span className="truncate font-ibm text-[9px] font-semibold text-white">{who?.name?.split(' ').pop()}</span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
        <p className="mt-2 flex flex-wrap gap-3 font-ibm text-[10px] text-gray-400">
          {COLUMNS.map((c) => (
            <span key={c.key} className="inline-flex items-center gap-1">
              <span className={`h-2 w-4 rounded-full ${barColor[c.key]}`} /> {c.label}
            </span>
          ))}
        </p>
      </div>
    </div>
  );
}

/* ---- Kanban (kéo - thả) ---- */
function KanbanView({ tasks, onMove }) {
  const [dragId, setDragId] = useState(null);
  const [over, setOver] = useState(null);
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {COLUMNS.map((col) => {
        const items = tasks.filter((t) => t.column === col.key);
        return (
          <div key={col.key}
            onDragOver={(e) => { e.preventDefault(); setOver(col.key); }}
            onDragLeave={() => setOver(null)}
            onDrop={() => { if (dragId) onMove(dragId, col.key); setDragId(null); setOver(null); }}
            className={`rounded-2xl border-t-4 ${col.accent} bg-iscm-surface/70 p-2.5 transition-colors ${over === col.key ? 'ring-2 ring-iscm-crimson/30 bg-iscm-crimson/5' : ''}`}>
            <div className="mb-2 flex items-center justify-between px-1">
              <h4 className="font-barlow text-xs font-bold uppercase tracking-wide text-iscm-charcoal">{col.label}</h4>
              <span className="font-barlow-condensed text-sm font-semibold text-gray-400">{items.length}</span>
            </div>
            <div className="space-y-2">
              {items.map((t) => {
                const who = staffById[t.assignee];
                return (
                  <article key={t.id} draggable
                    onDragStart={() => setDragId(t.id)}
                    onDragEnd={() => { setDragId(null); setOver(null); }}
                    className={`glass-card cursor-grab select-none p-2.5 active:cursor-grabbing ${dragId === t.id ? 'opacity-40' : ''}`}>
                    <div className="flex items-start gap-1.5">
                      <GripVertical className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gray-300" />
                      <p className="font-ibm text-xs font-medium text-iscm-charcoal">{t.title}</p>
                    </div>
                    <div className="mt-2 flex items-center justify-between pl-5">
                      <span className="flex items-center gap-1.5">
                        <Avatar name={who?.name} size="sm" />
                        <span className="font-ibm text-[10px] text-gray-500">{who?.name}</span>
                      </span>
                      <span className="font-barlow-condensed text-[10px] text-gray-400">{t.end?.slice(5).replace('-', '/')}</span>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ---- Table View: mật độ cao, typography tối giản ---- */
function TableView({ tasks }) {
  const statusChip = {
    todo: 'bg-gray-100 text-gray-600', doing: 'bg-blue-50 text-blue-700',
    review: 'bg-amber-50 text-amber-700', done: 'bg-emerald-50 text-emerald-700',
  };
  const label = { todo: 'Cần làm', doing: 'Đang làm', review: 'Rà soát', done: 'Hoàn tất' };
  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200" style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>
      <table className="w-full min-w-[720px] text-left">
        <thead className="sticky top-0">
          <tr className="bg-iscm-charcoal text-[10px] font-bold uppercase tracking-wider text-white">
            <th className="px-3 py-2.5">Mã</th><th className="px-3 py-2.5">Gói công việc</th>
            <th className="px-3 py-2.5">Phụ trách</th><th className="px-3 py-2.5">Bắt đầu</th>
            <th className="px-3 py-2.5">Kết thúc</th><th className="px-3 py-2.5">Giờ dự kiến</th>
            <th className="px-3 py-2.5">Trạng thái</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 text-xs">
          {tasks.map((t, i) => (
            <tr key={t.id} className={`${i % 2 ? 'bg-gray-50/60' : 'bg-white'} hover:bg-iscm-crimson/5`}>
              <td className="px-3 py-2 font-bold text-iscm-crimson">{t.id}</td>
              <td className="px-3 py-2 text-iscm-charcoal">{t.title}</td>
              <td className="whitespace-nowrap px-3 py-2 text-gray-600">{staffById[t.assignee]?.name}</td>
              <td className="whitespace-nowrap px-3 py-2 tabular-nums text-gray-500">{t.start}</td>
              <td className="whitespace-nowrap px-3 py-2 tabular-nums text-gray-500">{t.end}</td>
              <td className="px-3 py-2 tabular-nums text-gray-600">{t.hours_est}h</td>
              <td className="px-3 py-2"><span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${statusChip[t.column]}`}>{label[t.column]}</span></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ---- Timesheet Engine + cảnh báo chồng lấn nguồn lực ---- */
function TimesheetView() {
  const [sheet, setSheet] = useState(TIMESHEET);
  const days = ['T2', 'T3', 'T4', 'T5', 'T6'];
  const overloaded = sheet.filter((e) => timesheetTotal(e) > TIMESHEET_WEEK.capacity);

  const approve = (staffId) =>
    setSheet((prev) => prev.map((e) => (e.staff === staffId ? { ...e, status: 'Đã duyệt' } : e)));

  return (
    <div className="space-y-3">
      {overloaded.length > 0 && (
        <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 font-ibm text-xs text-iscm-crimson">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>
            <strong>Cảnh báo chồng lấn nguồn lực (over-allocation):</strong>{' '}
            {overloaded.map((e) => `${staffById[e.staff]?.name} (${timesheetTotal(e)}h/${TIMESHEET_WEEK.capacity}h)`).join(' · ')}
            {' '}— Head Lab cần điều phối lại phân bổ giữa các dự án song song.
          </span>
        </div>
      )}
      <p className="font-barlow-condensed text-xs font-semibold uppercase tracking-wider text-gray-400">
        {TIMESHEET_WEEK.label} · năng lực chuẩn {TIMESHEET_WEEK.capacity}h/tuần · giờ công liên kết trực tiếp KPI cá nhân/nhóm/dự án
      </p>
      <div className="space-y-3">
        {sheet.map((entry) => {
          const total = timesheetTotal(entry);
          const over = total > TIMESHEET_WEEK.capacity;
          const who = staffById[entry.staff];
          return (
            <div key={entry.staff} className={`glass-card overflow-hidden ${over ? 'ring-1 ring-red-300' : ''}`}>
              <div className="flex flex-wrap items-center gap-2 border-b border-gray-100 px-4 py-2.5">
                <Avatar name={who?.name} size="sm" />
                <span className="font-ibm text-xs font-semibold text-iscm-charcoal">{who?.name}</span>
                <span className="font-ibm text-[10px] text-gray-400">{who?.group}</span>
                <span className={`ml-auto font-barlow-condensed text-sm font-bold ${over ? 'text-iscm-crimson' : 'text-iscm-charcoal'}`}>
                  {total}h {over && '⚠'}
                </span>
                {entry.status === 'Đã duyệt' ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 font-ibm text-[10px] font-semibold text-emerald-700">
                    <CheckCircle2 className="h-3 w-3" /> Đã duyệt
                  </span>
                ) : (
                  <button onClick={() => approve(entry.staff)}
                    className="rounded-lg bg-iscm-cta px-2.5 py-1 font-ibm text-[10px] font-semibold text-white hover:bg-iscm-charcoal">
                    Duyệt giờ công
                  </button>
                )}
              </div>
              <table className="w-full text-left font-ibm text-[11px]">
                <thead>
                  <tr className="bg-iscm-surface/70 font-barlow-condensed text-[10px] uppercase text-gray-400">
                    <th className="px-4 py-1.5">Dự án / Task</th>
                    {days.map((d) => <th key={d} className="w-12 px-2 py-1.5 text-center">{d}</th>)}
                    <th className="w-16 px-3 py-1.5 text-right">Tổng</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {entry.rows.map((r) => (
                    <tr key={r.ref}>
                      <td className={`px-4 py-1.5 ${r.ref.startsWith('Ad-hoc') ? 'italic text-violet-700' : 'text-iscm-charcoal'}`}>{r.ref}</td>
                      {r.hours.map((h, i) => (
                        <td key={i} className="px-2 py-1.5 text-center font-barlow-condensed text-xs text-gray-600">{h || '·'}</td>
                      ))}
                      <td className="px-3 py-1.5 text-right font-barlow-condensed text-xs font-semibold">
                        {r.hours.reduce((a, b) => a + b, 0)}h
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ---- Trang chính ---- */
export default function HierarchicalProjects() {
  const [selectedProject, setSelectedProject] = useState('prj-psa-q1');
  const [view, setView] = useState('kanban');
  const [tasks, setTasks] = useState(OS_TASKS);
  const [expanded, setExpanded] = useState({});

  const project = projectIndex[selectedProject];
  const projectTasks = useMemo(() => tasks.filter((t) => t.project_id === selectedProject), [tasks, selectedProject]);
  const moveTask = (id, column) => setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, column } : t)));
  const isOpen = (k) => expanded[k] ?? true;
  const toggle = (k) => setExpanded((p) => ({ ...p, [k]: !(p[k] ?? true) }));

  return (
    <div className="w-full space-y-4">
      <header className="border-l-4 border-iscm-crimson pl-4 py-1 mb-2">
        <h1 className="font-barlow text-3xl font-extrabold uppercase tracking-wider text-iscm-charcoal">
          Quản lý Dự án Phân tầng
        </h1>
        <p className="mt-1 font-ibm text-xs uppercase tracking-wider text-gray-500">
          Lab Chuyên Năng → Chương Trình Lớn → Dự Án Thành Phần → Gói Công Việc · Đề án 1 / Phân hệ 3.2
        </p>
      </header>

      <div className="grid items-start gap-4 lg:grid-cols-[280px_1fr]">
        {/* Cây phân tầng */}
        <aside className="glass-card space-y-1 p-3 lg:sticky lg:top-2">
          <p className="flex items-center gap-1.5 px-1 pb-1 font-barlow text-xs font-extrabold uppercase tracking-wide text-iscm-charcoal">
            <FolderTree className="h-4 w-4 text-iscm-crimson" /> Cấu trúc phân tầng
          </p>
          {OS_HIERARCHY.map((lab) => (
            <div key={lab.lab_code}>
              <button onClick={() => toggle(lab.lab_code)}
                className="flex w-full items-center gap-1.5 rounded-lg px-2 py-1.5 text-left font-barlow text-[11px] font-bold uppercase tracking-wide text-iscm-charcoal hover:bg-iscm-surface">
                {isOpen(lab.lab_code) ? <ChevronDown className="h-3 w-3 text-gray-400" /> : <ChevronRight className="h-3 w-3 text-gray-400" />}
                <Layers className="h-3.5 w-3.5 text-iscm-crimson" /> {lab.lab}
              </button>
              {isOpen(lab.lab_code) && lab.programs.map((pg) => (
                <div key={pg.program} className="ml-4 border-l border-gray-200 pl-2">
                  <p className="px-1 pt-1 font-barlow-condensed text-[10px] font-semibold uppercase tracking-wider text-gray-400">{pg.program}</p>
                  {pg.projects.map((p) => (
                    <button key={p.id} onClick={() => setSelectedProject(p.id)}
                      className={`mt-0.5 flex w-full items-center gap-1.5 rounded-md px-2 py-1.5 text-left font-ibm text-[11px] transition-colors ${
                        selectedProject === p.id ? 'bg-iscm-crimson font-medium text-white' : 'text-iscm-charcoal hover:bg-iscm-surface'
                      }`}>
                      <span className="min-w-0 flex-1 truncate">{p.name}</span>
                      {p.pilot && <span className={`rounded px-1 font-barlow-condensed text-[8px] font-bold uppercase ${selectedProject === p.id ? 'bg-white/20' : 'bg-iscm-crimson/10 text-iscm-crimson'}`}>Pilot</span>}
                    </button>
                  ))}
                </div>
              ))}
            </div>
          ))}

          {/* Task ngoài dự án (Ad-hoc) */}
          <div className="mt-2 rounded-xl border border-violet-200 bg-violet-50/60 p-2.5">
            <p className="flex items-center gap-1.5 font-barlow text-[11px] font-bold uppercase tracking-wide text-violet-800">
              <ListTodo className="h-3.5 w-3.5" /> Task ngoài dự án
            </p>
            <ul className="mt-1.5 space-y-1">
              {ADHOC_TASKS.map((t) => (
                <li key={t.id} className="rounded-md bg-white/80 px-2 py-1.5 font-ibm text-[10px]">
                  <span className={t.status === 'done' ? 'text-gray-400 line-through' : 'text-iscm-charcoal'}>{t.title}</span>
                  <span className="mt-0.5 block text-gray-400">
                    {staffById[t.assignee]?.name} · hạn {t.due.slice(5).replace('-', '/')} · {t.hours}h → Timesheet
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        {/* Vùng tác nghiệp */}
        <section className="min-w-0 space-y-3">
          {/* Meta dự án + liên kết ISCM CORE */}
          <div className="glass-card flex flex-wrap items-center gap-3 px-4 py-3">
            <div className="min-w-0 flex-1">
              <p className="font-barlow-condensed text-[10px] font-semibold uppercase tracking-[0.2em] text-gray-400">
                {project?.lab} · {project?.program}
              </p>
              <h2 className="truncate font-barlow text-lg font-bold text-iscm-charcoal">{project?.name}</h2>
            </div>
            <span className="badge border border-blue-200 bg-blue-50 text-blue-700">{project?.status}</span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-iscm-charcoal px-3 py-1 font-ibm text-[10px] font-semibold text-white" title="Liên kết iscm_data_catalog (Đề án 2)">
              <Link2 className="h-3 w-3" /> ISCM CORE · {project?.core_assets ?? 0} tài sản dữ liệu
            </span>
            {/* Bộ chuyển góc nhìn */}
            <div className="flex gap-1 rounded-xl bg-iscm-surface p-1">
              {VIEWS.map(({ key, label, icon: Icon }) => (
                <button key={key} onClick={() => setView(key)}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-ibm text-[11px] font-medium transition-colors ${
                    view === key ? 'bg-iscm-crimson text-white shadow-glass' : 'text-gray-600 hover:bg-white/70'
                  }`}>
                  <Icon className="h-3.5 w-3.5" /> {label}
                </button>
              ))}
            </div>
          </div>

          {view === 'kanban' && <KanbanView tasks={projectTasks} onMove={moveTask} />}
          {view === 'gantt' && <GanttView tasks={tasks} />}
          {view === 'table' && <TableView tasks={projectTasks} />}
          {view === 'timesheet' && <TimesheetView />}

          {view === 'gantt' && (
            <p className="font-ibm text-[10px] text-gray-400">
              Gantt hiển thị toàn bộ gói công việc của Viện (theo dõi tiến độ chồng lấn giữa các dự án) · cửa sổ 01/07 – 30/09/2026.
            </p>
          )}
        </section>
      </div>
    </div>
  );
}

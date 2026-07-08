import { useState } from 'react';
import { MapPin, ChevronDown, Upload } from 'lucide-react';
import {
  projects, projectMembers, assets as allAssets, tasks as allTasks,
  userById, projectById, STATUS_TAGS_VI, SDG_COLORS,
} from '../data/mockData.js';
import { RoleBadge, Avatar } from '../components/ui.jsx';
import KanbanBoard from '../components/workspace/KanbanBoard.jsx';
import OfficeDocsTab from '../components/workspace/OfficeDocsTab.jsx';
import PartnersTab from '../components/workspace/PartnersTab.jsx';

/* ------------------------------------------------------------------ */
/* Matrix Workspace (ERP & CRM) — two-column asymmetric grid           */
/*   LEFT 35%  → crimson Focus Card + gray Phase Box                   */
/*   RIGHT 65% → 3-Tab functional container:                           */
/*     📝 Kanban (ERP) · 📑 Tài liệu (KMS) · 👥 Đối tác (CRM)          */
/* ------------------------------------------------------------------ */

const TABS = [
  { key: 'progress', label: '📝 Tiến độ Kanban' },
  { key: 'office', label: '📑 Tài liệu văn phòng' },
  { key: 'partners', label: '👥 Đối tác & Liên kết' },
];

/** Compact date badge in Barlow Condensed — mirrors the site's "15 Th7" block */
function DateBadge({ date, dark }) {
  const d = new Date(date);
  return (
    <span
      className={`flex h-11 w-10 shrink-0 flex-col items-center justify-center rounded-md font-barlow-condensed leading-none ${
        dark ? 'bg-iscm-cta text-white' : 'bg-white text-iscm-charcoal'
      }`}
    >
      <span className="text-base font-bold">{d.getDate()}</span>
      <span className="text-[10px]">Th{d.getMonth() + 1}</span>
    </span>
  );
}

/** Left column upper block — crimson Focus Card with SDGs + black CTA */
function FocusCard({ project, members }) {
  return (
    <section className="rounded-xl bg-iscm-crimson p-6 text-white shadow-glass">
      <div className="font-barlow-condensed text-xs font-semibold uppercase tracking-[0.25em] text-white/60">
        {project.project_code}
      </div>
      <h2 className="mt-1 font-barlow text-xl font-bold leading-snug">{project.project_name}</h2>

      <div className="mt-3 flex items-center justify-between gap-3">
        <span className="font-barlow-condensed text-sm font-semibold tracking-widest text-white/90">
          {STATUS_TAGS_VI[project.status]}
        </span>
        {/* SDG badge row */}
        <div className="flex gap-1">
          {(project.sdg_tags ?? []).map((n) => (
            <span
              key={n}
              title={`SDG ${n}`}
              className="flex h-7 w-7 items-center justify-center rounded-sm font-barlow-condensed text-xs font-bold text-white"
              style={{ background: SDG_COLORS[n] ?? '#666' }}
            >
              {n}
            </span>
          ))}
        </div>
      </div>

      <p className="mt-3 font-ibm text-sm leading-relaxed text-white/85">{project.description}</p>

      <div className="mt-3 flex items-center gap-1.5 font-ibm text-xs text-white/70">
        <MapPin className="h-3.5 w-3.5" /> {project.location} · khởi động {project.created_at}
      </div>

      {/* Matrix roster */}
      <ul className="mt-4 space-y-1.5 border-t border-white/20 pt-3">
        {members.map((m) => {
          const user = userById[m.user_id];
          return (
            <li key={m.user_id} className="flex items-center gap-2">
              <Avatar name={user?.full_name} size="sm" />
              <span className="min-w-0 flex-1 truncate font-ibm text-xs">
                {user?.full_name}
                {m.is_cross_line && (
                  <span title="Phân công chéo tuyến (cross-line)" className="ml-1.5 rounded bg-white/20 px-1 font-barlow-condensed text-[10px] uppercase">
                    chéo tuyến
                  </span>
                )}
              </span>
              <RoleBadge role={m.project_role} />
            </li>
          );
        })}
      </ul>

      {/* Embedded solid-black primary CTA (cta-black) */}
      <button className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-iscm-cta py-3 font-ibm text-sm font-semibold text-white transition-colors hover:bg-iscm-charcoal">
        Nạp Tài Sản Mới <Upload className="h-4 w-4" />
      </button>
    </section>
  );
}

/** Left column lower block — gray Phase Wrapper (bg-gray-wrapper) */
function PhaseWrapper({ phases = [] }) {
  return (
    <section className="rounded-xl bg-iscm-wrapper p-5">
      <h3 className="mb-3 font-barlow text-base font-bold text-iscm-charcoal">
        Thời gian &amp; Giai đoạn dự án
      </h3>
      <ol className="space-y-2.5">
        {phases.map((phase) => (
          <li
            key={phase.phase_name}
            className={`flex items-center gap-3 rounded-lg p-2.5 ${
              phase.is_current ? 'bg-iscm-cta text-white shadow' : 'text-iscm-charcoal'
            }`}
          >
            <DateBadge date={phase.start_date} dark={!phase.is_current} />
            <div className="min-w-0">
              <div className="truncate font-barlow text-sm font-semibold">{phase.phase_name}</div>
              <div className={`font-barlow-condensed text-xs ${phase.is_current ? 'text-white/70' : 'text-gray-500'}`}>
                {phase.start_date} → {phase.end_date}
                {phase.is_current && ' · ĐANG DIỄN RA'}
              </div>
            </div>
          </li>
        ))}
        {phases.length === 0 && (
          <li className="font-ibm text-sm text-gray-500">Chưa có giai đoạn nào được khai báo.</li>
        )}
      </ol>
    </section>
  );
}

export default function ProjectWorkspace({ projectId, onSelectProject }) {
  const [activeTab, setActiveTab] = useState('progress');

  const project = projectById[projectId] ?? projects[0];
  const members = projectMembers.filter((m) => m.project_id === project.id);
  const projectAssets = allAssets.filter((a) => a.project_id === project.id);
  const projectTasks = allTasks.filter((t) => t.project_id === project.id);

  return (
    <div className="w-full space-y-5">
      {/* Header row: section title (Barlow, site-style caps) + workspace selector */}
      <header className="flex flex-wrap items-start justify-between gap-3 border-l-4 border-iscm-crimson pl-4 py-1 mb-2">
        <div>
          <h1 className="font-barlow text-3xl font-extrabold uppercase tracking-wider text-iscm-charcoal">
            Không gian Dự án
          </h1>
          <p className="mt-1 font-ibm text-xs uppercase tracking-wider text-gray-500">
            Tổng quan tiến độ Kanban, tài liệu văn phòng, đối tác & liên kết của dự án.
          </p>
        </div>
        <label className="relative">
          <select
            value={project.id}
            onChange={(e) => onSelectProject(e.target.value)}
            className="appearance-none rounded-lg border border-gray-200 bg-white py-2 pl-4 pr-10 font-ibm text-sm font-medium text-iscm-charcoal shadow-sm focus:border-iscm-crimson focus:outline-none"
          >
            {projects.map((p) => (
              <option key={p.id} value={p.id}>{p.project_name}</option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        </label>
      </header>

      {/* Asymmetric 35 / 65 grid */}
      <div className="grid gap-6 lg:grid-cols-[35fr_65fr]">
        {/* LEFT — Project Metadata & Milestones */}
        <div className="space-y-5">
          <FocusCard project={project} members={members} />
          <PhaseWrapper phases={project.phases} />
        </div>

        {/* RIGHT — Main Application Active Area: 4-Tab container */}
        <div className="min-w-0 space-y-4">
          <div className="flex gap-1 overflow-x-auto rounded-xl bg-iscm-surface p-1">
            {TABS.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`flex-1 whitespace-nowrap rounded-lg px-4 py-2.5 font-ibm text-sm font-medium transition-colors ${
                  activeTab === key
                    ? 'bg-iscm-crimson text-white shadow-glass'
                    : 'text-gray-600 hover:bg-white/70'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {activeTab === 'progress' && <KanbanBoard key={project.id} tasks={projectTasks} />}
          {activeTab === 'office' && <OfficeDocsTab assets={projectAssets} />}
          {activeTab === 'partners' && <PartnersTab projectId={project.id} assets={projectAssets} />}
        </div>
      </div>
    </div>
  );
}

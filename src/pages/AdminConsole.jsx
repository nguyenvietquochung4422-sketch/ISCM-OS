import { useState } from 'react';
import { UserPlus, ShieldCheck, ArrowRight } from 'lucide-react';
import {
  users, projects, projectMembers as initialMembers, assets as initialAssets,
  userById, projectById,
} from '../data/mockData.js';
import { Avatar, RoleBadge, FileIcon } from '../components/ui.jsx';

/* ------------------------------------------------------------------ */
/* Executive Admin Matrix Console (Director only)                      */
/*  A. Cross-line Assigner — move members between workspace contexts    */
/*  B. Security State Configurator — Draft → Internal Open → Confidential */
/* ------------------------------------------------------------------ */

const ROLES = ['Lead', 'Manager', 'Coordinator', 'Host', 'Member'];
const SECURITY_STATES = ['Draft', 'Internal Open', 'Confidential'];

const STATE_STYLES = {
  Draft: 'bg-gray-200 text-gray-700',
  'Internal Open': 'bg-emerald-600 text-white',
  Confidential: 'bg-iscm-crimson text-white',
};

function CrossFunctionalAssigner() {
  const [members, setMembers] = useState(initialMembers);
  const [userId, setUserId] = useState(users[3].id);
  const [projectId, setProjectId] = useState(projects[1].id);
  const [role, setRole] = useState('Member');
  const [notice, setNotice] = useState(null);

  const selectedUser = userById[userId];
  const selectedProject = projectById[projectId];

  const assign = () => {
    if (members.some((m) => m.user_id === userId && m.project_id === projectId)) {
      setNotice({ tone: 'warn', text: `${selectedUser.full_name} đã thuộc ${selectedProject.project_name}.` });
      return;
    }
    setMembers((prev) => [
      ...prev,
      { project_id: projectId, user_id: userId, project_role: role, is_cross_line: true },
    ]);
    setNotice({
      tone: 'ok',
      text: `Đã phân công chéo tuyến: ${selectedUser.full_name} (${selectedUser.base_functional_group}) làm ${role} tại ${selectedProject.project_name}.`,
    });
  };

  const selectClass =
    'w-full rounded-lg border border-gray-200 bg-white px-3 py-2 font-ibm text-sm focus:border-iscm-crimson focus:outline-none';

  return (
    <section className="glass-card p-5">
      <h2 className="flex items-center gap-2 font-barlow text-lg font-bold text-iscm-charcoal">
        <UserPlus className="h-5 w-5 text-iscm-crimson" /> Cross-line Assigner
      </h2>
      <p className="mb-4 font-ibm text-xs text-gray-500">
        Phân công ma trận: điều động thành viên chéo tuyến giữa các khối chức năng và không gian dự án.
      </p>

      <div className="grid gap-3 sm:grid-cols-[1fr_auto_1fr_1fr_auto] sm:items-end">
        <label className="block">
          <span className="mb-1 block font-barlow-condensed text-xs font-semibold uppercase tracking-wide text-gray-400">Thành viên (khối gốc)</span>
          <select value={userId} onChange={(e) => setUserId(e.target.value)} className={selectClass}>
            {users.filter((u) => u.system_role !== 'Director').map((u) => (
              <option key={u.id} value={u.id}>{u.full_name} — {u.base_functional_group}</option>
            ))}
          </select>
        </label>
        <ArrowRight className="hidden h-5 w-5 self-center text-iscm-crimson sm:block" />
        <label className="block">
          <span className="mb-1 block font-barlow-condensed text-xs font-semibold uppercase tracking-wide text-gray-400">Không gian đích</span>
          <select value={projectId} onChange={(e) => setProjectId(e.target.value)} className={selectClass}>
            {projects.map((p) => <option key={p.id} value={p.id}>{p.project_name}</option>)}
          </select>
        </label>
        <label className="block">
          <span className="mb-1 block font-barlow-condensed text-xs font-semibold uppercase tracking-wide text-gray-400">Vai trò ngữ cảnh</span>
          <select value={role} onChange={(e) => setRole(e.target.value)} className={selectClass}>
            {ROLES.map((r) => <option key={r}>{r}</option>)}
          </select>
        </label>
        <button onClick={assign} className="btn-primary justify-center">Phân công</button>
      </div>

      {notice && (
        <p className={`mt-3 rounded-lg px-3 py-2 font-ibm text-sm ${
          notice.tone === 'ok' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
        }`}>
          {notice.text}
        </p>
      )}

      {/* Live matrix table */}
      <div className="mt-5 overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-gray-200 font-barlow-condensed text-xs font-semibold uppercase tracking-[0.12em] text-gray-400">
              <th className="py-2 pr-4">Thành viên</th>
              <th className="py-2 pr-4">Khối chức năng gốc</th>
              <th className="py-2 pr-4">Không gian</th>
              <th className="py-2 pr-4">Vai trò</th>
              <th className="py-2">Tuyến</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {members.map((m, i) => {
              const u = userById[m.user_id];
              const p = projectById[m.project_id];
              return (
                <tr key={`${m.user_id}-${m.project_id}-${i}`}>
                  <td className="py-2.5 pr-4">
                    <span className="flex items-center gap-2">
                      <Avatar name={u?.full_name} size="sm" />
                      <span className="font-ibm text-sm">{u?.full_name}</span>
                    </span>
                  </td>
                  <td className="py-2.5 pr-4 font-ibm text-sm text-gray-500">{u?.base_functional_group}</td>
                  <td className="py-2.5 pr-4 font-ibm text-sm">{p?.project_name}</td>
                  <td className="py-2.5 pr-4"><RoleBadge role={m.project_role} /></td>
                  <td className="py-2.5">
                    {m.is_cross_line ? (
                      <span className="badge bg-iscm-crimson/10 text-iscm-crimson">Chéo tuyến</span>
                    ) : (
                      <span className="badge bg-gray-100 text-gray-500">Trong tuyến</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function SecurityStateConfigurator() {
  const [assetList, setAssetList] = useState(initialAssets);

  /** Director-only: set any of the three visibility states directly */
  const setLevel = (id, level) =>
    setAssetList((prev) => prev.map((a) => (a.id === id ? { ...a, security_level: level } : a)));

  return (
    <section className="glass-card p-5">
      <h2 className="flex items-center gap-2 font-barlow text-lg font-bold text-iscm-charcoal">
        <ShieldCheck className="h-5 w-5 text-iscm-crimson" /> Security State Configurator
      </h2>
      <p className="mb-4 font-ibm text-xs text-gray-500">
        <span className="font-medium">Draft</span> — nội bộ dự án ·{' '}
        <span className="font-medium text-emerald-700">Internal Open</span> — chia sẻ toàn Viện qua Global Library ·{' '}
        <span className="font-medium text-iscm-crimson">Confidential</span> — khóa dữ liệu nhạy cảm.
      </p>

      <ul className="divide-y divide-gray-100">
        {assetList.map((a) => {
          const project = projectById[a.project_id];
          return (
            <li key={a.id} className="flex flex-wrap items-center gap-3 py-3">
              <FileIcon extension={a.file_extension} className="h-5 w-5" />
              <div className="min-w-0 flex-1">
                <div className="truncate font-ibm text-sm font-medium text-iscm-charcoal">{a.asset_name}</div>
                <div className="truncate font-ibm text-xs text-gray-400">{project?.project_name}</div>
              </div>
              {/* Three-state segmented switch */}
              <div className="flex overflow-hidden rounded-full border border-gray-200 bg-iscm-surface">
                {SECURITY_STATES.map((state) => (
                  <button
                    key={state}
                    onClick={() => setLevel(a.id, state)}
                    className={`px-3 py-1 font-ibm text-xs font-medium transition-colors ${
                      a.security_level === state ? STATE_STYLES[state] : 'text-gray-500 hover:bg-white'
                    }`}
                  >
                    {state}
                  </button>
                ))}
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export default function AdminConsole() {
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <header>
        <h1 className="font-barlow text-2xl font-bold uppercase tracking-tight text-iscm-charcoal">
          Executive Admin Matrix Console
        </h1>
        <p className="font-ibm text-sm text-gray-500">
          Công cụ Viện trưởng — phân công ma trận &amp; quản trị trạng thái bảo mật dữ liệu.
        </p>
      </header>
      <CrossFunctionalAssigner />
      <SecurityStateConfigurator />
    </div>
  );
}

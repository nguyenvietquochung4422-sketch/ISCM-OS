import { useState, useEffect } from 'react';
import { UserPlus, ArrowRight, TrendingUp, MousePointerSquareDashed, ScrollText, MailCheck, ShieldOff } from 'lucide-react';
import { supabase, isLive } from '../lib/supabaseClient.js';
import {
  users as mockUsers,
  projects as mockProjects,
  projectMembers as mockMembers,
  projectById,
  userById
} from '../data/mockData.js';
import {
  OS_STAFF, OS_GROUPS, DYNAMIC_ROLES, GUEST_ACCOUNTS, AUDIT_LOG, projectIndex,
} from '../data/osData.js';
import { RoleBadge, Avatar } from '../components/ui.jsx';

const ROLES = ['Lead', 'Manager', 'Coordinator', 'Host', 'Member'];

/* ------------------------------------------------------------------ */
/* Matrix Assigner Console (Đề án 1 · 3.1) — kéo-thả nhân sự vào dự án */
/* với vai trò động; Context-RBAC tự thu hồi khi dự án kết thúc.       */
/* ------------------------------------------------------------------ */
function DragDropConsole({ onAudit }) {
  const [activeRole, setActiveRole] = useState('Data Collector');
  const [dragStaff, setDragStaff] = useState(null);
  const [overProject, setOverProject] = useState(null);
  const [assignments, setAssignments] = useState([
    { staff: 'Nguyễn Việt Quốc Hùng', project: 'prj-psa-q1', role: 'Editor' },
    { staff: 'Võ Anh Khoa', project: 'prj-drt', role: 'Data Collector' },
  ]);

  const projects = Object.values(projectIndex);
  const drop = (projectId) => {
    if (!dragStaff) return;
    setAssignments((prev) => [
      ...prev.filter((a) => !(a.staff === dragStaff.name && a.project === projectId)),
      { staff: dragStaff.name, project: projectId, role: activeRole },
    ]);
    onAudit(`Điều động ${dragStaff.name} → ${projectIndex[projectId]?.name} (${activeRole})`);
    setDragStaff(null); setOverProject(null);
  };

  const roleTone = {
    'Project Lead': 'bg-iscm-crimson text-white', 'Data Collector': 'bg-blue-600 text-white',
    Editor: 'bg-amber-500 text-white', Viewer: 'bg-gray-400 text-white',
  };

  return (
    <section className="glass-card p-5">
      <h2 className="mb-1 flex items-center gap-2 font-barlow text-xl font-bold text-iscm-charcoal border-l-2 border-iscm-crimson pl-2">
        <MousePointerSquareDashed className="h-5 w-5 text-iscm-crimson" /> Matrix Assigner Console (kéo - thả)
      </h2>
      <p className="mb-3 font-ibm text-sm text-gray-500">
        Chọn vai trò động rồi kéo nhân sự từ 5 khối chức năng thả vào dự án — quyền tự động cấp theo ngữ cảnh (Context-RBAC) và thu hồi khi dự án kết thúc.
      </p>

      {/* Vai trò động */}
      <div className="mb-3 flex flex-wrap items-center gap-1.5">
        <span className="font-barlow-condensed text-xs font-bold uppercase tracking-wider text-gray-400">Vai trò khi thả:</span>
        {DYNAMIC_ROLES.map((r) => (
          <button key={r} onClick={() => setActiveRole(r)}
            className={`rounded-full px-3 py-1 font-ibm text-[11px] font-semibold transition-colors ${
              activeRole === r ? roleTone[r] : 'bg-iscm-surface text-gray-600 hover:bg-gray-200'
            }`}>
            {r}
          </button>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[300px_1fr]">
        {/* Pool nhân sự theo 5 khối */}
        <div className="rounded-xl border border-gray-200 bg-iscm-surface/50 p-3">
          <p className="mb-2 font-barlow text-[11px] font-bold uppercase tracking-wide text-iscm-charcoal">Nhân sự 5 khối chức năng</p>
          {OS_GROUPS.map((g) => {
            const members = OS_STAFF.filter((s) => s.group === g);
            if (members.length === 0) return null;
            return (
              <div key={g} className="mb-2">
                <p className="font-barlow-condensed text-[9px] font-semibold uppercase tracking-wider text-gray-400">{g}</p>
                <div className="mt-1 flex flex-wrap gap-1.5">
                  {members.map((s) => (
                    <span key={s.id} draggable
                      onDragStart={() => setDragStaff(s)}
                      onDragEnd={() => { setDragStaff(null); setOverProject(null); }}
                      className={`inline-flex cursor-grab items-center gap-1.5 rounded-full border border-gray-200 bg-white px-2 py-1 font-ibm text-[10px] font-medium text-iscm-charcoal shadow-sm active:cursor-grabbing ${
                        dragStaff?.id === s.id ? 'opacity-40' : ''
                      }`}>
                      <Avatar name={s.name} size="sm" /> {s.name}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Drop zones dự án */}
        <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
          {projects.map((p) => {
            const assigned = assignments.filter((a) => a.project === p.id);
            return (
              <div key={p.id}
                onDragOver={(e) => { e.preventDefault(); setOverProject(p.id); }}
                onDragLeave={() => setOverProject(null)}
                onDrop={() => drop(p.id)}
                className={`rounded-xl border-2 border-dashed p-3 transition-colors ${
                  overProject === p.id ? 'border-iscm-crimson bg-iscm-crimson/5' : 'border-gray-200 bg-white/60'
                }`}>
                <p className="font-barlow-condensed text-[9px] font-semibold uppercase tracking-wider text-gray-400">{p.lab}</p>
                <p className="truncate font-ibm text-xs font-bold text-iscm-charcoal" title={p.name}>{p.name}</p>
                <div className="mt-2 space-y-1">
                  {assigned.map((a, i) => (
                    <p key={i} className="flex items-center gap-1.5 font-ibm text-[10px] text-gray-600">
                      <span className={`rounded px-1.5 py-0.5 text-[8px] font-bold ${roleTone[a.role]}`}>{a.role}</span>
                      <span className="truncate">{a.staff}</span>
                    </p>
                  ))}
                  {assigned.length === 0 && <p className="py-1 text-center font-ibm text-[9px] text-gray-300">Thả nhân sự vào đây</p>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* Tài khoản khách mời (Google OAuth2) + Audit Log */
function GuestAndAudit({ auditEntries }) {
  const [guests, setGuests] = useState(GUEST_ACCOUNTS);
  const revoke = (id) =>
    setGuests((prev) => prev.map((g) => (g.id === id ? { ...g, status: 'Đã thu hồi' } : g)));

  return (
    <div className="grid items-start gap-6 lg:grid-cols-2">
      <section className="glass-card p-5">
        <h2 className="mb-1 flex items-center gap-2 font-barlow text-xl font-bold text-iscm-charcoal border-l-2 border-iscm-crimson pl-2">
          <MailCheck className="h-5 w-5 text-iscm-crimson" /> Tài khoản khách mời (Google OAuth2)
        </h2>
        <p className="mb-3 font-ibm text-sm text-gray-500">
          Intern/CTV ngoài trường đăng nhập bằng Gmail — cấp quyền tối thiểu, giới hạn đúng dự án được phân công, tự vô hiệu hóa khi hết hạn.
        </p>
        <ul className="space-y-2">
          {guests.map((g) => {
            const inactive = g.status !== 'Hoạt động';
            return (
              <li key={g.id} className={`rounded-xl border p-3 ${inactive ? 'border-gray-100 bg-gray-50 opacity-70' : 'border-gray-200 bg-white/70'}`}>
                <div className="flex flex-wrap items-center gap-2">
                  <Avatar name={g.name} size="sm" />
                  <span className="font-ibm text-xs font-semibold text-iscm-charcoal">{g.name}</span>
                  <span className="font-ibm text-[10px] text-gray-400">{g.email}</span>
                  <span className={`ml-auto badge ${inactive ? 'bg-gray-100 text-gray-500' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'}`}>{g.status}</span>
                </div>
                <p className="mt-1.5 font-ibm text-[10px] text-gray-500">
                  Phạm vi: <strong>{g.scope}</strong> · Vai trò: {g.role} · Hiệu lực đến <strong>{g.expires}</strong> · Duyệt bởi {g.approved_by}
                </p>
                {!inactive && (
                  <button onClick={() => revoke(g.id)}
                    className="mt-2 inline-flex items-center gap-1 rounded bg-iscm-crimson px-2 py-1 font-ibm text-[10px] font-semibold text-white hover:bg-iscm-crimson-dark">
                    <ShieldOff className="h-3 w-3" /> Thu hồi quyền ngay
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      </section>

      <section className="glass-card p-5">
        <h2 className="mb-1 flex items-center gap-2 font-barlow text-xl font-bold text-iscm-charcoal border-l-2 border-iscm-crimson pl-2">
          <ScrollText className="h-5 w-5 text-iscm-crimson" /> Nhật ký truy vết (Audit Log)
        </h2>
        <p className="mb-3 font-ibm text-sm text-gray-500">
          Toàn bộ thay đổi vai trò, phân quyền và điều động — kể cả tài khoản khách mời — phục vụ đối chiếu và kiểm toán nội bộ.
        </p>
        <ol className="relative space-y-3 border-l border-gray-200 pl-4">
          {auditEntries.map((a, i) => (
            <li key={i} className="relative">
              <span className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full border-2 border-white bg-iscm-crimson" />
              <p className="font-ibm text-xs text-iscm-charcoal">{a.action}</p>
              <p className="font-barlow-condensed text-[10px] text-gray-400">{a.at} · {a.actor}</p>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}

export default function MatrixAssignerPage() {
  const [matrixRoster, setMatrixRoster] = useState([]);
  const [loading, setLoading] = useState(false);
  const [audit, setAudit] = useState(AUDIT_LOG);
  const pushAudit = (action) =>
    setAudit((prev) => [{ at: '2026-07-08 ' + new Date().toTimeString().slice(0, 5), actor: 'Trịnh Tú Anh (Console)', action }, ...prev]);

  // Form states
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [selectedRole, setSelectedRole] = useState('Member');
  const [notice, setNotice] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Dropdown pools
  const [allUsers, setAllUsers] = useState(mockUsers);
  const [allProjects, setAllProjects] = useState(mockProjects);
  const [localMembers, setLocalMembers] = useState(mockMembers);

  const fetchMatrixData = async () => {
    setLoading(true);
    if (isLive) {
      try {
        // Fetch users & projects
        const { data: usersData } = await supabase.from('users_profiles').select('*').order('full_name');
        const { data: projectsData } = await supabase.from('projects').select('*').order('project_name');
        if (usersData) setAllUsers(usersData);
        if (projectsData) setAllProjects(projectsData);

        // Fetch roster members
        const { data: rosterData } = await supabase
          .from('project_members')
          .select('*, users_profiles!project_members_user_id_fkey(*), projects(*)');

        if (rosterData) {
          const formatted = rosterData.map((item) => ({
            id: item.id,
            user_id: item.user_id,
            project_id: item.project_id,
            full_name: item.users_profiles?.full_name ?? 'Unknown',
            base_functional_group: item.users_profiles?.base_functional_group ?? 'Unknown',
            project_name: item.projects?.project_name ?? 'Unknown',
            contextual_role: item.contextual_role,
            is_cross_line: item.is_cross_line
          }));
          setMatrixRoster(formatted);
        }

        // Default dropdowns
        if (usersData && usersData.length > 0 && !selectedUserId) {
          const nonDir = usersData.find(u => u.global_system_role !== 'Director');
          setSelectedUserId(nonDir ? nonDir.id : usersData[0].id);
        }
        if (projectsData && projectsData.length > 0 && !selectedProjectId) {
          setSelectedProjectId(projectsData[0].id);
        }

      } catch (err) {
        console.error('Failed to load matrix data:', err);
      } finally {
        setLoading(false);
      }
    } else {
      // Offline fallback mapping
      if (!selectedUserId && allUsers.length > 0) {
        const nonDir = allUsers.find(u => u.system_role !== 'Director');
        setSelectedUserId(nonDir ? nonDir.id : allUsers[0].id);
      }
      if (!selectedProjectId && allProjects.length > 0) {
        setSelectedProjectId(allProjects[0].id);
      }

      const roster = localMembers.map((m, idx) => {
        const u = allUsers.find((user) => user.id === m.user_id);
        const p = allProjects.find((proj) => proj.id === m.project_id);
        return {
          id: `m-${idx}`,
          user_id: m.user_id,
          project_id: m.project_id,
          full_name: u?.full_name ?? 'Unknown',
          base_functional_group: u?.base_functional_group ?? 'Unknown',
          project_name: p?.project_name ?? 'Unknown',
          contextual_role: m.contextual_role || m.project_role,
          is_cross_line: m.is_cross_line
        };
      });
      setMatrixRoster(roster);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatrixData();
  }, [localMembers]);

  const handleAssign = async (e) => {
    e.preventDefault();
    if (!selectedUserId || !selectedProjectId) {
      setNotice({ tone: 'warn', text: 'Vui lòng chọn nhân viên và dự án ma trận.' });
      return;
    }

    setSubmitting(true);
    setNotice(null);

    const chosenUser = allUsers.find((u) => u.id === selectedUserId);
    const chosenProject = allProjects.find((p) => p.id === selectedProjectId);

    if (isLive) {
      try {
        const directorUser = allUsers.find(u => u.global_system_role === 'Director');
        const { error } = await supabase
          .from('project_members')
          .upsert({
            project_id: selectedProjectId,
            user_id: selectedUserId,
            contextual_role: selectedRole,
            is_cross_line: true,
            assigned_by: directorUser ? directorUser.id : null
          }, {
            onConflict: 'project_id,user_id'
          });

        if (error) throw error;

        setNotice({
          tone: 'ok',
          text: `Đã phân công chéo tuyến: ${chosenUser?.full_name} (${chosenUser?.base_functional_group}) làm ${selectedRole} tại ${chosenProject?.project_name}.`
        });
        fetchMatrixData();
      } catch (err) {
        console.error('Database matrix assignment failed:', err);
        setNotice({ tone: 'warn', text: 'Lỗi phân công: ' + err.message });
      } finally {
        setSubmitting(false);
      }
    } else {
      // Offline fallback
      setLocalMembers((prev) => {
        const filtered = prev.filter(m => !(m.user_id === selectedUserId && m.project_id === selectedProjectId));
        return [
          ...filtered,
          {
            project_id: selectedProjectId,
            user_id: selectedUserId,
            contextual_role: selectedRole,
            project_role: selectedRole,
            is_cross_line: true
          }
        ];
      });

      setNotice({
        tone: 'ok',
        text: `Đã phân công chéo tuyến (Offline Fallback): ${chosenUser?.full_name} (${chosenUser?.base_functional_group}) làm ${selectedRole} tại ${chosenProject?.project_name}.`
      });
      setSubmitting(false);
    }
  };

  const selectClass =
    'w-full rounded-lg border border-gray-200 bg-white px-3 py-2 font-ibm text-sm focus:border-iscm-crimson focus:outline-none text-iscm-charcoal';

  return (
    <div className="w-full space-y-6">
      <header className="border-l-4 border-iscm-crimson pl-4 py-1">
        <h1 className="font-barlow text-3xl font-extrabold uppercase tracking-wider text-iscm-charcoal">
          Cross-Functional Matrix Assigner
        </h1>
        <p className="font-ibm text-sm uppercase tracking-wider text-gray-500 mt-1">
          Quản trị điều phối nhân sự chéo tuyến (Cross-line allocation) giữa các khối chức năng và không gian nghiên cứu.
        </p>
      </header>

      {/* Grid: Form on Top, Workload Table on Bottom */}
      <div className="space-y-6">

        {/* Row 0: Drag-drop console (Đề án 1 · vai trò động) */}
        <DragDropConsole onAudit={pushAudit} />

        {/* Row 1: Allocation Scheduler Form */}
        <section className="glass-card p-5">
          <h2 className="mb-2 font-barlow text-xl font-bold text-iscm-charcoal border-l-2 border-iscm-crimson pl-2">
            Matrix Resource Allocation
          </h2>
          <p className="mb-4 font-ibm text-sm text-gray-500">
            Điều động điều phối nhanh: Thêm thành viên vào không gian dự án khác với tư cách chéo tuyến (Cross-Line assignment) để giải quyết các nút thắt công việc.
          </p>

          <form onSubmit={handleAssign} className="bg-iscm-surface p-4 rounded-xl space-y-4 border border-gray-100">
            <div className="grid gap-4 sm:grid-cols-3">
              <label className="block">
                <span className="mb-1 block font-barlow-condensed text-xs font-bold uppercase tracking-wider text-gray-400">Chọn thành viên</span>
                <select 
                  value={selectedUserId} 
                  onChange={(e) => setSelectedUserId(e.target.value)} 
                  className={selectClass}
                >
                  {allUsers.filter(u => u.global_system_role !== 'Director' && u.system_role !== 'Director').map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.full_name} ({u.base_functional_group})
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="mb-1 block font-barlow-condensed text-xs font-bold uppercase tracking-wider text-gray-400">Chọn không gian đích</span>
                <select 
                  value={selectedProjectId} 
                  onChange={(e) => setSelectedProjectId(e.target.value)} 
                  className={selectClass}
                >
                  {allProjects.map((p) => (
                    <option key={p.id} value={p.id}>{p.project_name}</option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="mb-1 block font-barlow-condensed text-xs font-bold uppercase tracking-wider text-gray-400">Vai trò chéo tuyến</span>
                <select 
                  value={selectedRole} 
                  onChange={(e) => setSelectedRole(e.target.value)} 
                  className={selectClass}
                >
                  {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
              </label>
            </div>

            <div className="flex items-center justify-between gap-4 pt-1">
              <div className="min-h-[20px] flex-1">
                {notice && (
                  <span className={`font-ibm text-xs font-semibold ${
                    notice.tone === 'ok' ? 'text-emerald-600' : 'text-amber-600'
                  }`}>
                    {notice.text}
                  </span>
                )}
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="btn-primary text-xs font-semibold py-2 px-5 shrink-0 bg-iscm-cta hover:bg-iscm-charcoal transition-colors rounded-lg text-white"
              >
                {submitting ? 'Processing...' : 'Assign Cross-Line'}
              </button>
            </div>
          </form>
        </section>

        {/* Row 2: Roster Workload Table */}
        <section className="glass-card p-5">
          <h2 className="mb-3 font-barlow text-xl font-bold text-iscm-charcoal border-l-2 border-iscm-crimson pl-2">
            Employee Workload &amp; Matrix Roster
          </h2>
          {loading ? (
            <div className="py-12 text-center text-gray-400 font-ibm text-sm">Loading roster...</div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-gray-100">
              <table className="w-full text-left font-ibm text-sm bg-white">
                <thead className="bg-iscm-surface font-barlow-condensed text-xs uppercase tracking-wider text-gray-400">
                  <tr>
                    <th className="py-3 px-4">Cán bộ chuyên trách</th>
                    <th className="py-3 px-4">Khối chức năng gốc</th>
                    <th className="py-3 px-4">Không gian điều động</th>
                    <th className="py-3 px-4">Vai trò ngữ cảnh</th>
                    <th className="py-3 px-4">Phân loại tuyến</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {matrixRoster.map((m, idx) => (
                    <tr key={`${m.user_id}-${m.project_id}-${idx}`} className="hover:bg-iscm-surface/20">
                      <td className="py-3 px-4 flex items-center gap-2">
                        <Avatar name={m.full_name} size="sm" />
                        <span className="font-semibold text-iscm-charcoal">{m.full_name}</span>
                      </td>
                      <td className="py-3 px-4 text-gray-500">{m.base_functional_group}</td>
                      <td className="py-3 px-4 font-semibold text-iscm-charcoal">{m.project_name}</td>
                      <td className="py-3 px-4"><RoleBadge role={m.contextual_role} /></td>
                      <td className="py-3 px-4">
                        {m.is_cross_line ? (
                          <span className="badge bg-iscm-crimson/10 text-iscm-crimson font-bold">Chéo tuyến</span>
                        ) : (
                          <span className="badge bg-gray-100 text-gray-500">Trong tuyến</span>
                        )}
                      </td>
                    </tr>
                  ))}
                  {matrixRoster.length === 0 && (
                    <tr>
                      <td colSpan="5" className="py-8 text-center text-gray-400">
                        Chưa ghi nhận sự điều động phân công nào.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Row 3: Guest accounts + Audit log (Đề án 1 · 3.1) */}
        <GuestAndAudit auditEntries={audit} />

      </div>
    </div>
  );
}

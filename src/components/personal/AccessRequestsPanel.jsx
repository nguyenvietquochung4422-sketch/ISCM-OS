import { useEffect, useState } from 'react';
import { Check, X, RotateCcw, Trash2, UserCheck2 } from 'lucide-react';
import { supabase, isLive } from '../../lib/supabaseClient.js';
import { useAuth } from '../../auth/AuthContext.jsx';
import { useLanguage } from '../../i18n/LanguageContext.jsx';

const ROLE_OPTIONS = ['Director', 'Vice Director', 'Group Head', 'Researcher', 'Assistant', 'Guest', 'Admin'];

const inputClass = 'rounded-none border border-neutral-200 bg-white px-2 py-1 text-xs text-neutral-800 focus:border-[#990000] focus:outline-none';

/** Any Google account can now sign in (AuthGate no longer checks an
 * allowlist) — everyone lands as `access_status: 'pending'` until an admin
 * approves or denies them here. Approving lets the admin also fix up the
 * role/functional group the trigger guessed from role_presets. */
export default function AccessRequestsPanel() {
  const { lang } = useLanguage();
  const vi = lang === 'vi';
  const { user: authUser } = useAuth();
  const [authorized, setAuthorized] = useState(null);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [drafts, setDrafts] = useState({}); // id -> { role, group } pending edits before approve
  const [busyId, setBusyId] = useState(null);

  useEffect(() => {
    if (!isLive || !authUser) { setAuthorized(false); return; }
    supabase.rpc('is_top_admin').then(({ data, error: err }) => setAuthorized(!err && Boolean(data)));
  }, [authUser]);

  const reload = () => {
    setLoading(true);
    supabase
      .from('users_profiles')
      .select('id, email, full_name, base_functional_group, global_system_role, access_status, created_at')
      .order('created_at', { ascending: false })
      .then(({ data }) => { setRows(data || []); setLoading(false); });
  };
  useEffect(() => { if (authorized) reload(); }, [authorized]);

  const draftFor = (row) => drafts[row.id] || { role: row.global_system_role, group: row.base_functional_group };
  const setDraft = (id, patch) => setDrafts((p) => ({ ...p, [id]: { ...draftFor(rows.find((r) => r.id === id)), ...p[id], ...patch } }));

  const decide = async (row, status) => {
    setBusyId(row.id);
    try {
      const draft = draftFor(row);
      const patch = { access_status: status };
      if (status === 'approved') {
        patch.global_system_role = draft.role;
        patch.base_functional_group = draft.group;
      }
      await supabase.from('users_profiles').update(patch).eq('id', row.id);
      reload();
    } finally {
      setBusyId(null);
    }
  };

  const remove = async (row) => {
    const msg = vi ? `Xoá vĩnh viễn yêu cầu của "${row.full_name}"?` : `Permanently delete the request from "${row.full_name}"?`;
    if (!window.confirm(msg)) return;
    setBusyId(row.id);
    try {
      await supabase.from('users_profiles').delete().eq('id', row.id);
      reload();
    } finally {
      setBusyId(null);
    }
  };

  if (!isLive) {
    return (
      <div className="font-sans text-xs text-neutral-500 p-4 border border-neutral-200 bg-neutral-50">
        {vi ? 'Tính năng này cần kết nối Supabase (chế độ demo không hỗ trợ).' : 'This feature requires a live Supabase connection (not available in demo mode).'}
      </div>
    );
  }
  if (authorized === null) {
    return <div className="font-sans text-xs text-neutral-400 p-4">{vi ? 'Đang kiểm tra quyền...' : 'Checking permissions...'}</div>;
  }
  if (authorized === false) {
    return (
      <div className="font-sans text-xs text-red-700 p-4 border border-red-200 bg-red-50">
        {vi
          ? 'Bạn không có quyền truy cập mục này. Chỉ Admin, Director, hoặc Vice Director mới có thể duyệt.'
          : 'You do not have access to this page. Only Admin, Director, or Vice Director can approve requests.'}
      </div>
    );
  }

  const pending = rows.filter((r) => r.access_status === 'pending');
  const approved = rows.filter((r) => r.access_status === 'approved');
  const denied = rows.filter((r) => r.access_status === 'denied');

  return (
    <div className="space-y-6 font-sans">
      <p className="text-xs text-neutral-500 leading-relaxed">
        {vi
          ? 'Bất kỳ tài khoản Google nào cũng có thể đăng nhập, nhưng chỉ dùng được ISCM OS sau khi được duyệt ở đây. Người mới đăng nhập sẽ hiện trong mục "Đang chờ duyệt" bên dưới.'
          : 'Any Google account can sign in, but can only use ISCM OS once approved here. New sign-ins show up under "Pending" below.'}
      </p>

      <div>
        <span className="block font-barlow text-xs font-black uppercase tracking-wider text-neutral-900 mb-2">
          {vi ? `Đang chờ duyệt (${pending.length})` : `Pending (${pending.length})`}
        </span>
        {loading ? (
          <div className="text-xs text-neutral-400 p-3">{vi ? 'Đang tải...' : 'Loading...'}</div>
        ) : pending.length === 0 ? (
          <div className="p-4 text-center text-xs text-neutral-400 border border-neutral-200 bg-neutral-50">
            {vi ? 'Không có yêu cầu nào.' : 'No pending requests.'}
          </div>
        ) : (
          <div className="border border-neutral-200 divide-y divide-neutral-100">
            {pending.map((row) => {
              const draft = draftFor(row);
              return (
                <div key={row.id} className="flex flex-col gap-2 p-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-neutral-900">{row.full_name}</p>
                    <p className="text-[10px] text-neutral-400">{row.email}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                    <select
                      className={inputClass}
                      value={draft.role}
                      onChange={(e) => setDraft(row.id, { role: e.target.value })}
                    >
                      {ROLE_OPTIONS.map((r) => <option key={r} value={r}>{r}</option>)}
                    </select>
                    <input
                      className={`${inputClass} w-36`}
                      value={draft.group}
                      onChange={(e) => setDraft(row.id, { group: e.target.value })}
                      placeholder={vi ? 'Nhóm chức năng' : 'Functional group'}
                    />
                    <button
                      onClick={() => decide(row, 'approved')}
                      disabled={busyId === row.id}
                      className="flex items-center gap-1 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-60 text-white font-bold text-[10px] uppercase px-2.5 py-1.5"
                    >
                      <Check className="h-3.5 w-3.5" /> {vi ? 'Duyệt' : 'Approve'}
                    </button>
                    <button
                      onClick={() => decide(row, 'denied')}
                      disabled={busyId === row.id}
                      className="flex items-center gap-1 border border-neutral-300 hover:border-[#990000] hover:text-[#990000] disabled:opacity-60 text-neutral-600 font-bold text-[10px] uppercase px-2.5 py-1.5"
                    >
                      <X className="h-3.5 w-3.5" /> {vi ? 'Từ chối' : 'Deny'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div>
        <span className="block font-barlow text-xs font-black uppercase tracking-wider text-neutral-900 mb-2">
          {vi ? `Đã duyệt (${approved.length})` : `Approved (${approved.length})`}
        </span>
        <div className="border border-neutral-200 divide-y divide-neutral-100 max-h-64 overflow-y-auto">
          {approved.map((row) => (
            <div key={row.id} className="flex items-center justify-between gap-2 p-2.5 text-xs">
              <div className="min-w-0 flex items-center gap-1.5">
                <UserCheck2 className="h-3.5 w-3.5 shrink-0 text-emerald-700" />
                <span className="font-bold text-neutral-800 truncate">{row.full_name}</span>
                <span className="shrink-0 text-[10px] text-neutral-400">{row.global_system_role} · {row.email}</span>
              </div>
              <button
                onClick={() => decide(row, 'denied')}
                disabled={busyId === row.id}
                className="shrink-0 flex items-center gap-1 border border-neutral-200 text-neutral-500 hover:border-[#990000] hover:text-[#990000] disabled:opacity-50 text-[10px] font-bold uppercase px-2 py-1"
                title={vi ? 'Thu hồi quyền' : 'Revoke access'}
              >
                <X className="h-3 w-3" /> {vi ? 'Thu hồi' : 'Revoke'}
              </button>
            </div>
          ))}
          {approved.length === 0 && (
            <div className="p-4 text-center text-xs text-neutral-400">{vi ? 'Chưa có ai.' : 'No one yet.'}</div>
          )}
        </div>
      </div>

      {denied.length > 0 && (
        <div>
          <span className="block font-barlow text-xs font-black uppercase tracking-wider text-neutral-900 mb-2">
            {vi ? `Đã từ chối (${denied.length})` : `Denied (${denied.length})`}
          </span>
          <div className="border border-neutral-200 divide-y divide-neutral-100">
            {denied.map((row) => (
              <div key={row.id} className="flex items-center justify-between gap-2 p-2.5 text-xs">
                <div className="min-w-0">
                  <span className="font-bold text-neutral-800">{row.full_name}</span>
                  <span className="ml-1.5 text-[10px] text-neutral-400">{row.email}</span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => decide(row, 'approved')}
                    disabled={busyId === row.id}
                    className="flex items-center gap-1 border border-neutral-200 text-neutral-500 hover:border-emerald-700 hover:text-emerald-700 disabled:opacity-50 text-[10px] font-bold uppercase px-2 py-1"
                  >
                    <RotateCcw className="h-3 w-3" /> {vi ? 'Duyệt lại' : 'Reconsider'}
                  </button>
                  <button
                    onClick={() => remove(row)}
                    disabled={busyId === row.id}
                    className="flex items-center gap-1 border border-neutral-200 text-neutral-500 hover:border-[#990000] hover:text-[#990000] disabled:opacity-50 text-[10px] font-bold uppercase px-2 py-1"
                  >
                    <Trash2 className="h-3 w-3" /> {vi ? 'Xoá' : 'Delete'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

import { useEffect, useState } from 'react';
import { Check, X, RotateCcw, Trash2, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../auth/AuthContext.jsx';
import {
  canManageResearchAccess, fetchAllResearchAccessRequests,
  decideResearchAccess, deleteResearchAccessRequest,
} from '../../data/researchAccessStore.js';

/** Self-gated review screen for the Research Head (or top admin): approve
    or deny access requests for a task or a whole Research Unit. This is
    the only way those requests get decided — RLS enforces that only the
    Head/admin can update a request's status either way. */
export default function ResearchAccessPanel({ lang }) {
  const vi = lang === 'vi';
  const { user: authUser } = useAuth();
  const [authorized, setAuthorized] = useState(null);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);

  useEffect(() => {
    if (!authUser) { setAuthorized(false); return; }
    canManageResearchAccess().then(setAuthorized);
  }, [authUser]);

  const reload = () => {
    setLoading(true);
    fetchAllResearchAccessRequests().then((data) => { setRows(data); setLoading(false); });
  };
  useEffect(() => { if (authorized) reload(); }, [authorized]);

  const decide = async (row, status) => {
    setBusyId(row.id);
    try {
      await decideResearchAccess(row.id, status, authUser.id);
      reload();
    } finally {
      setBusyId(null);
    }
  };

  const remove = async (row) => {
    if (!window.confirm(vi ? `Xoá yêu cầu này?` : 'Delete this request?')) return;
    setBusyId(row.id);
    try {
      await deleteResearchAccessRequest(row.id);
      reload();
    } finally {
      setBusyId(null);
    }
  };

  if (authorized === null) {
    return <div className="font-sans text-xs text-neutral-400 p-4">{vi ? 'Đang kiểm tra quyền...' : 'Checking permissions...'}</div>;
  }
  if (authorized === false) {
    return (
      <div className="font-sans text-xs text-red-700 p-4 border border-red-200 bg-red-50">
        {vi
          ? 'Chỉ Trưởng bộ phận Nghiên cứu Khoa học hoặc Admin mới xem được mục này.'
          : 'Only the Research Head or an Admin can view this.'}
      </div>
    );
  }

  const pending = rows.filter((r) => r.status === 'pending');
  const decided = rows.filter((r) => r.status !== 'pending');

  const resourceLine = (r) => (
    <>
      <span className="inline-block border border-neutral-200 bg-neutral-100 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-neutral-500 mr-1.5">
        {r.resource_type === 'unit' ? (vi ? 'Đơn vị' : 'Unit') : (vi ? 'Tác vụ' : 'Task')}
      </span>
      <span className="font-semibold text-neutral-800">{r.resource_label}</span>
    </>
  );

  return (
    <div className="space-y-6 font-sans">
      <p className="text-xs text-neutral-500 leading-relaxed">
        {vi
          ? 'Ai cũng có thể gửi yêu cầu xem tài liệu của một Đơn vị nghiên cứu hoặc một tác vụ cụ thể. Chỉ tại đây Trưởng bộ phận (hoặc Admin) mới duyệt/từ chối được.'
          : 'Anyone can request to view the documents of a Research Unit or a specific task. Only here can the Head (or an Admin) approve or deny it.'}
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
            {pending.map((row) => (
              <div key={row.id} className="flex flex-col gap-1.5 p-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="text-xs">{resourceLine(row)}</p>
                  <p className="text-[10px] text-neutral-400 mt-0.5">
                    {row.requester?.full_name || row.requester?.email} · {row.requester?.email}
                  </p>
                  {row.reason && <p className="text-[10px] text-neutral-500 italic mt-0.5">"{row.reason}"</p>}
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
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
                    className="flex items-center gap-1 border border-neutral-300 hover:border-[#8b0000] hover:text-[#8b0000] disabled:opacity-60 text-neutral-600 font-bold text-[10px] uppercase px-2.5 py-1.5"
                  >
                    <X className="h-3.5 w-3.5" /> {vi ? 'Từ chối' : 'Deny'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {decided.length > 0 && (
        <div>
          <span className="block font-barlow text-xs font-black uppercase tracking-wider text-neutral-900 mb-2">
            {vi ? 'Đã xử lý' : 'Decided'}
          </span>
          <div className="border border-neutral-200 divide-y divide-neutral-100 max-h-72 overflow-y-auto">
            {decided.map((row) => (
              <div key={row.id} className="flex items-center justify-between gap-2 p-2.5 text-xs">
                <div className="min-w-0 flex items-center gap-1.5">
                  {row.status === 'approved'
                    ? <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-emerald-700" />
                    : <X className="h-3.5 w-3.5 shrink-0 text-neutral-400" />}
                  {resourceLine(row)}
                  <span className="shrink-0 text-[10px] text-neutral-400">— {row.requester?.full_name || row.requester?.email}</span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => decide(row, row.status === 'approved' ? 'denied' : 'approved')}
                    disabled={busyId === row.id}
                    className="flex items-center gap-1 border border-neutral-200 text-neutral-500 hover:border-[#8b0000] hover:text-[#8b0000] disabled:opacity-50 text-[10px] font-bold uppercase px-2 py-1"
                  >
                    <RotateCcw className="h-3 w-3" /> {row.status === 'approved' ? (vi ? 'Thu hồi' : 'Revoke') : (vi ? 'Duyệt lại' : 'Reconsider')}
                  </button>
                  <button
                    onClick={() => remove(row)}
                    disabled={busyId === row.id}
                    className="flex items-center gap-1 border border-neutral-200 text-neutral-500 hover:border-[#8b0000] hover:text-[#8b0000] disabled:opacity-50 text-[10px] font-bold uppercase px-2 py-1"
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

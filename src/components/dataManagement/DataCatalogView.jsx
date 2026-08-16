import { useEffect, useMemo, useState } from 'react';
import { Search, Plus } from 'lucide-react';
import { fetchResearchRows } from '../../data/researchListStore.js';
import { researchList as fallbackResearchRows } from '../../data/researchList.js';
import { fetchDatasets, DATA_TYPES, ACCESS_LEVELS, STATUS_OPTIONS, GROUPS } from '../../data/datasetsStore.js';
import { ISCM_MEMBERS } from '../../data/iscmMembers.js';
import { useAuth } from '../../auth/AuthContext.jsx';
import { supabase, isLive } from '../../lib/supabaseClient.js';
import DatasetDetailModal from './DatasetDetailModal.jsx';

const TASK_TYPES = ['Research', 'Paper', 'Training', 'New initiative', 'Student research', 'Fund Raising', 'Project', 'Event'];

const STATUS_DOT = {
  Draft: 'bg-neutral-400',
  Submitted: 'bg-amber-500',
  Registered: 'bg-emerald-600',
  'Needs Update': 'bg-red-500',
};

export default function DataCatalogView({ lang, onRegister }) {
  const vi = lang === 'vi';
  const { user: authUser } = useAuth();
  const [datasets, setDatasets] = useState([]);
  const [taskRows, setTaskRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  const [query, setQuery] = useState('');
  const [fGroup, setFGroup] = useState('all');
  const [fTaskType, setFTaskType] = useState('all');
  const [fDataType, setFDataType] = useState('all');
  const [fAccess, setFAccess] = useState('all');
  const [fStatus, setFStatus] = useState('all');

  const reload = () => {
    setLoading(true);
    fetchDatasets().then((rows) => { setDatasets(rows); setLoading(false); });
  };
  useEffect(() => { reload(); }, []);
  useEffect(() => {
    fetchResearchRows().then((rows) => setTaskRows(rows || fallbackResearchRows));
  }, []);
  useEffect(() => {
    if (!isLive || !authUser) { setIsAdmin(false); return; }
    supabase.rpc('is_top_admin').then(({ data, error }) => setIsAdmin(!error && Boolean(data)));
  }, [authUser]);

  // Who's signed in, on the roster — lets us tell "you're the contact
  // person for this dataset" apart from everyone else, for the storage-link
  // visibility gate (priority #8: hide links from people with no reason to see them).
  const myMemberIdentity = useMemo(
    () => (authUser?.email ? ISCM_MEMBERS.find((m) => (m.email || '').toLowerCase() === authUser.email.toLowerCase()) : null),
    [authUser]
  );

  const taskById = useMemo(() => {
    const m = new Map();
    taskRows.forEach((r) => m.set(String(r.id), r));
    return m;
  }, [taskRows]);

  const rowsWithTask = useMemo(() => datasets.map((d) => ({
    ...d,
    _task: d.primary_task_id ? taskById.get(String(d.primary_task_id)) : null,
  })), [datasets, taskById]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rowsWithTask.filter((d) => {
      if (q && !d.name.toLowerCase().includes(q) && !(d._task?.task_name || '').toLowerCase().includes(q)) return false;
      if (fGroup !== 'all' && d.lead_group !== fGroup && !(d.contributing_groups || []).includes(fGroup)) return false;
      if (fTaskType !== 'all' && (d._task?.task_type || '') !== fTaskType) return false;
      if (fDataType !== 'all' && !d.data_types.includes(fDataType)) return false;
      if (fAccess !== 'all' && d.access_level !== fAccess) return false;
      if (fStatus !== 'all' && d.status !== fStatus) return false;
      return true;
    });
  }, [rowsWithTask, query, fGroup, fTaskType, fDataType, fAccess, fStatus]);

  const groupCount = new Set(datasets.map((d) => d.lead_group).filter(Boolean)).size;
  const needsReviewCount = datasets.filter((d) => d.status === 'Submitted' || d.status === 'Needs Update').length;

  const selectClass = 'border border-neutral-200 bg-white px-2.5 py-1.5 text-xs focus:border-[#8b0000] focus:outline-none rounded-none text-neutral-700 font-medium';

  const canSeeStorageLinks = (d) =>
    isAdmin || d.access_level === 'Public' || (myMemberIdentity && d.contact_member_id === myMemberIdentity.id);

  return (
    <div className="space-y-5 font-sans">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-barlow text-lg font-black uppercase tracking-wide text-neutral-900">
            {vi ? 'KHO DỮ LIỆU ISCM' : 'ISCM DATA CATALOG'}
          </h2>
          <p className="text-xs text-neutral-500 mt-0.5">
            {vi
              ? 'Kho dữ liệu tập trung — mọi dữ liệu đang có trong các nhóm, hoạt động và dự án nghiên cứu của ISCM.'
              : 'Centralized inventory of datasets across ISCM groups, activities, and research projects.'}
          </p>
        </div>
        <button
          type="button"
          onClick={onRegister}
          className="shrink-0 inline-flex items-center gap-1.5 bg-[#8b0000] hover:bg-[#6d0000] text-white text-xs font-bold uppercase px-3.5 py-2 transition-colors"
        >
          <Plus className="h-3.5 w-3.5" /> {vi ? 'Đăng ký dữ liệu' : 'Register Dataset'}
        </button>
      </div>

      {/* Summary — 3 boxes only, per spec */}
      <div className="grid grid-cols-3 gap-3">
        <div className="border border-neutral-200 bg-neutral-50 p-3.5 text-center">
          <div className="font-barlow text-2xl font-black text-neutral-900">{datasets.length}</div>
          <div className="text-[9px] font-bold uppercase tracking-wider text-neutral-400 mt-0.5">{vi ? 'Tổng bộ dữ liệu' : 'Total Datasets'}</div>
        </div>
        <div className="border border-neutral-200 bg-neutral-50 p-3.5 text-center">
          <div className="font-barlow text-2xl font-black text-neutral-900">{groupCount}</div>
          <div className="text-[9px] font-bold uppercase tracking-wider text-neutral-400 mt-0.5">{vi ? 'Nhóm' : 'Groups'}</div>
        </div>
        <div className="border border-amber-200 bg-amber-50 p-3.5 text-center">
          <div className="font-barlow text-2xl font-black text-amber-700">{needsReviewCount}</div>
          <div className="text-[9px] font-bold uppercase tracking-wider text-amber-600 mt-0.5">{vi ? 'Cần rà soát' : 'Needs Review'}</div>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="space-y-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-400" />
          <input
            type="text" value={query} onChange={(e) => setQuery(e.target.value)}
            placeholder={vi ? 'Tìm bộ dữ liệu...' : 'Search datasets...'}
            className="w-full pl-9 pr-3 py-1.5 border border-neutral-200 bg-white text-xs text-neutral-800 focus:border-[#8b0000] focus:outline-none rounded-none"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <select className={selectClass} value={fGroup} onChange={(e) => setFGroup(e.target.value)}>
            <option value="all">{vi ? 'Tất cả Group' : 'All Groups'}</option>
            {GROUPS.map((g) => <option key={g} value={g}>{g}</option>)}
          </select>
          <select className={selectClass} value={fTaskType} onChange={(e) => setFTaskType(e.target.value)}>
            <option value="all">{vi ? 'Tất cả Task Type' : 'All Task Types'}</option>
            {TASK_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
          <select className={selectClass} value={fDataType} onChange={(e) => setFDataType(e.target.value)}>
            <option value="all">{vi ? 'Tất cả Data Type' : 'All Data Types'}</option>
            {DATA_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
          <select className={selectClass} value={fAccess} onChange={(e) => setFAccess(e.target.value)}>
            <option value="all">{vi ? 'Tất cả mức truy cập' : 'All Access'}</option>
            {ACCESS_LEVELS.map((a) => <option key={a} value={a}>{a}</option>)}
          </select>
          <select className={selectClass} value={fStatus} onChange={(e) => setFStatus(e.target.value)}>
            <option value="all">{vi ? 'Tất cả trạng thái' : 'All Statuses'}</option>
            {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="border border-neutral-200 overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="bg-neutral-900 text-white font-barlow text-[10px] font-bold uppercase tracking-wider">
              <th className="px-3 py-2.5">{vi ? 'Bộ dữ liệu' : 'Dataset'}</th>
              <th className="px-3 py-2.5">{vi ? 'Lead Group' : 'Lead Group'}</th>
              <th className="px-3 py-2.5">{vi ? 'Hoạt động liên quan' : 'Related Activity'}</th>
              <th className="px-3 py-2.5">{vi ? 'Loại dữ liệu' : 'Data Type'}</th>
              <th className="px-3 py-2.5">{vi ? 'Liên hệ' : 'Contact'}</th>
              <th className="px-3 py-2.5">Access</th>
              <th className="px-3 py-2.5">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {loading ? (
              <tr><td colSpan={7} className="px-3 py-8 text-center text-neutral-400">{vi ? 'Đang tải...' : 'Loading...'}</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={7} className="px-3 py-10 text-center text-neutral-400">
                {datasets.length === 0 ? (
                  <div className="space-y-2">
                    <p>{vi ? 'Chưa có bộ dữ liệu nào được đăng ký.' : 'No datasets have been registered yet.'}</p>
                    <p className="text-[11px]">{vi ? 'Đăng ký bộ dữ liệu đầu tiên để bắt đầu xây dựng Kho dữ liệu ISCM.' : 'Register the first dataset to begin building the ISCM Data Catalog.'}</p>
                    <button type="button" onClick={onRegister} className="inline-flex items-center gap-1.5 bg-[#8b0000] hover:bg-[#6d0000] text-white text-[10px] font-bold uppercase px-3 py-1.5 mt-1">
                      <Plus className="h-3 w-3" /> {vi ? 'Đăng ký dữ liệu' : 'Register Dataset'}
                    </button>
                  </div>
                ) : (vi ? 'Không tìm thấy bộ dữ liệu nào.' : 'No datasets found.')}
              </td></tr>
            ) : filtered.map((d) => (
              <tr key={d.id} className="hover:bg-neutral-50/80 transition-colors">
                <td className="px-3 py-2.5">
                  <button onClick={() => setSelected(d)} className="font-semibold text-neutral-800 hover:text-[#8b0000] hover:underline text-left">
                    {d.name}
                  </button>
                </td>
                <td className="px-3 py-2.5 text-neutral-600">{d.lead_group}</td>
                <td className="px-3 py-2.5 text-neutral-500 truncate max-w-[180px]">{d._task?.task_name || '—'}</td>
                <td className="px-3 py-2.5 text-neutral-600">{d.data_types.join(', ') || '—'}</td>
                <td className="px-3 py-2.5 text-neutral-600">{d.contact_name}</td>
                <td className="px-3 py-2.5">
                  <span className="border border-neutral-200 px-1.5 py-0.5 text-[9px] font-bold uppercase text-neutral-500">{d.access_level}</span>
                </td>
                <td className="px-3 py-2.5">
                  <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase text-neutral-600">
                    <span className={`h-1.5 w-1.5 rounded-full ${STATUS_DOT[d.status] || 'bg-neutral-300'}`} />
                    {d.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selected && (
        <DatasetDetailModal
          vi={vi}
          dataset={selected}
          taskLabel={selected.primary_task_id ? taskById.get(String(selected.primary_task_id)) : null}
          otherTaskLabels={(selected.other_task_ids || []).map((id) => taskById.get(String(id))).filter(Boolean)}
          isAdmin={isAdmin}
          canSeeStorageLinks={canSeeStorageLinks(selected)}
          onClose={() => setSelected(null)}
          onChanged={() => { reload(); setSelected(null); }}
        />
      )}
    </div>
  );
}

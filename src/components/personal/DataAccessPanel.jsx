import { useEffect, useState } from 'react';
import { Lock, Unlock } from 'lucide-react';
import { supabase, isLive } from '../../lib/supabaseClient.js';
import { assets as mockAssets } from '../../data/mockData.js';
import { FileIcon, SecurityBadge } from '../ui.jsx';

/* Data Access Permissions — Public (Internal Open) vs Restricted (Draft/
   Confidential) folder clearance. Directors can bypass-approve a Draft
   asset straight to Internal Open from here. */

export default function DataAccessPanel() {
  const [drafts, setDrafts] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    if (isLive) {
      try {
        const { data } = await supabase
          .from('digital_assets')
          .select('*, projects(project_name)')
          .eq('security_level', 'Draft')
          .order('created_at', { ascending: false });
        setDrafts(data ?? []);
      } catch {
        setDrafts([]);
      }
    } else {
      setDrafts(mockAssets.filter((a) => a.security_level === 'Draft')
        .map((a) => ({ ...a, projects: { project_name: 'HCMC Walkability Atlas (Local)' } })));
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const approve = async (id) => {
    if (isLive) {
      const { error } = await supabase.from('digital_assets').update({ security_level: 'Internal Open' }).eq('id', id);
      if (!error) load();
    } else {
      setDrafts((prev) => prev.filter((a) => a.id !== id));
    }
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 font-ibm text-[11px] text-emerald-700">
          <Unlock className="mb-1 h-4 w-4" /> <strong>Public</strong> — Internal Open, visible institute-wide via Global Library.
        </div>
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 font-ibm text-[11px] text-gray-600">
          <Lock className="mb-1 h-4 w-4" /> <strong>Restricted</strong> — Draft / Confidential, workspace members only.
        </div>
      </div>

      <p className="font-ibm text-xs font-semibold text-iscm-charcoal">Pending clearance requests (Draft → Internal Open)</p>
      {loading ? (
        <p className="py-6 text-center font-ibm text-xs text-gray-400">Loading…</p>
      ) : (
        <ul className="divide-y divide-gray-100">
          {drafts.map((a) => (
            <li key={a.id} className="flex items-center gap-2.5 py-2.5">
              <FileIcon extension={a.file_extension} className="h-4 w-4" />
              <div className="min-w-0 flex-1">
                <div className="truncate font-ibm text-xs font-medium">{a.asset_name}</div>
                <div className="truncate font-ibm text-[10px] text-gray-400">{a.projects?.project_name}</div>
              </div>
              <SecurityBadge level={a.security_level} />
              <button onClick={() => approve(a.id)} className="rounded bg-iscm-cta px-2.5 py-1 font-ibm text-[11px] font-semibold text-white hover:bg-iscm-charcoal">
                Approve
              </button>
            </li>
          ))}
          {drafts.length === 0 && <li className="py-6 text-center font-ibm text-xs text-gray-400">Không có yêu cầu nào đang chờ.</li>}
        </ul>
      )}
    </div>
  );
}

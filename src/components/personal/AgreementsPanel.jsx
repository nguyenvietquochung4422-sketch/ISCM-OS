import { useEffect, useMemo, useState } from 'react';
import { Plus, FileSignature } from 'lucide-react';
import { useAuth } from '../../auth/AuthContext.jsx';
import {
  COLLABORATION_DOMAINS,
  canManagePartnership, fetchOrganizations, fetchAgreements, createAgreement, getExpiryStatus,
} from '../../data/partnershipStore.js';

const inputClass = 'w-full rounded-none border border-neutral-300 bg-white px-2.5 py-1.5 font-ibm text-xs text-iscm-charcoal focus:border-iscm-crimson focus:outline-none';

// v1 only exposes the two domains the source data actually has — the
// schema supports the full COLLABORATION_DOMAINS list for when more show up.
const DOMAIN_FILTERS = ['All', 'Academia', 'Industry'];

const STATUS_STYLE = {
  Active: 'text-emerald-700 border-emerald-300 bg-emerald-50',
  'Expiring Soon': 'text-amber-700 border-amber-300 bg-amber-50',
  Expired: 'text-red-700 border-red-300 bg-red-50',
  'Under Review': 'text-neutral-600 border-neutral-300 bg-neutral-50',
  Draft: 'text-neutral-500 border-neutral-300 bg-neutral-50',
  Terminated: 'text-neutral-400 border-neutral-200 bg-neutral-50',
  Archived: 'text-neutral-400 border-neutral-200 bg-neutral-50',
};

/** Partnership > Agreements > Active MOUs — single registry across every
    collaboration domain (not split into separate Academia/Industry
    tables); the [All][Academia][Industry] filter here does the splitting,
    same pattern used to keep O&F's Resources sidebar from exploding. */
export default function AgreementsPanel({ lang = 'vi' }) {
  const vi = lang === 'vi';
  const { user: authUser } = useAuth();
  const [canManage, setCanManage] = useState(false);
  const [checked, setChecked] = useState(false);
  const [agreements, setAgreements] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [domainFilter, setDomainFilter] = useState('All');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    organization_id: '', title: '', collaboration_domain: 'Academia',
    signed_date: '', effective_from: '', expiry_date: '',
  });

  const reload = () => {
    setLoading(true);
    Promise.all([fetchAgreements(), fetchOrganizations()]).then(([ag, orgs]) => {
      setAgreements(ag); setOrganizations(orgs); setLoading(false);
    });
  };

  useEffect(() => {
    canManagePartnership().then((ok) => { setCanManage(ok); setChecked(true); });
    reload();
  }, []);

  const submit = async () => {
    if (!form.organization_id || !form.title.trim()) return;
    await createAgreement({
      organization_id: form.organization_id, title: form.title.trim(), collaboration_domain: form.collaboration_domain,
      signed_date: form.signed_date || null, effective_from: form.effective_from || null, expiry_date: form.expiry_date || null,
      internal_owner_id: authUser?.id,
    }, authUser?.id);
    setForm({ organization_id: '', title: '', collaboration_domain: 'Academia', signed_date: '', effective_from: '', expiry_date: '' });
    setShowForm(false); reload();
  };

  const withStatus = useMemo(() => agreements.map((a) => ({ ...a, expiryStatus: getExpiryStatus(a) })), [agreements]);
  const filtered = domainFilter === 'All' ? withStatus : withStatus.filter((a) => a.collaboration_domain === domainFilter);

  const kpis = useMemo(() => ({
    active: withStatus.filter((a) => a.expiryStatus === 'Active').length,
    expiringSoon: withStatus.filter((a) => a.expiryStatus === 'Expiring Soon').length,
    expired: withStatus.filter((a) => a.expiryStatus === 'Expired').length,
  }), [withStatus]);

  if (!checked || loading) return <p className="font-ibm text-[11px] text-gray-400 p-2">{vi ? 'Đang tải...' : 'Loading...'}</p>;

  return (
    <div className="space-y-3 rounded-lg border border-gray-200 bg-white p-3.5 font-sans">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="flex items-center gap-1.5 font-ibm text-xs font-semibold text-iscm-charcoal">
          <FileSignature className="h-3.5 w-3.5 text-iscm-crimson" /> {vi ? 'MOU đang hiệu lực' : 'Active MOUs'}
        </p>
        {canManage && (
          <button onClick={() => setShowForm((s) => !s)} className="flex items-center gap-1 text-[10px] font-bold uppercase text-neutral-500 hover:text-iscm-crimson">
            <Plus className="h-3.5 w-3.5" /> {vi ? 'Thêm MOU' : 'Add MOU'}
          </button>
        )}
      </div>

      <div className="grid grid-cols-3 gap-2">
        {[
          [vi ? 'Đang hiệu lực' : 'Active MOUs', kpis.active, 'text-emerald-700'],
          [vi ? 'Sắp hết hạn' : 'Expiring Soon', kpis.expiringSoon, 'text-amber-700'],
          [vi ? 'Đã hết hạn' : 'Expired', kpis.expired, 'text-red-700'],
        ].map(([label, value, cls]) => (
          <div key={label} className="border border-neutral-200 bg-neutral-50 p-2.5 text-center">
            <div className={`font-barlow text-lg font-black ${cls}`}>{value}</div>
            <div className="text-[8px] font-bold uppercase tracking-wide text-neutral-400 mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {showForm && (
        <div className="grid grid-cols-3 gap-2 border border-neutral-200 p-2.5">
          <select value={form.organization_id} onChange={(e) => setForm((p) => ({ ...p, organization_id: e.target.value }))} className={inputClass}>
            <option value="">{vi ? '— Tổ chức đối tác —' : '— Partner organization —'}</option>
            {organizations.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
          </select>
          <input placeholder={vi ? 'Tiêu đề MOU' : 'Agreement title'} value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} className={`${inputClass} col-span-2`} />
          <select value={form.collaboration_domain} onChange={(e) => setForm((p) => ({ ...p, collaboration_domain: e.target.value }))} className={inputClass}>
            {COLLABORATION_DOMAINS.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
          <div>
            <label className="block text-[9px] text-neutral-400 mb-0.5">{vi ? 'Ngày ký' : 'Signed'}</label>
            <input type="date" value={form.signed_date} onChange={(e) => setForm((p) => ({ ...p, signed_date: e.target.value }))} className={inputClass} />
          </div>
          <div>
            <label className="block text-[9px] text-neutral-400 mb-0.5">{vi ? 'Hết hạn' : 'Expiry'}</label>
            <input type="date" value={form.expiry_date} onChange={(e) => setForm((p) => ({ ...p, expiry_date: e.target.value }))} className={inputClass} />
          </div>
          <button onClick={submit} className="px-3 py-1.5 text-[10px] font-bold uppercase text-white bg-iscm-crimson hover:bg-[#7a0010] w-fit">{vi ? 'Lưu' : 'Save'}</button>
        </div>
      )}

      <div className="flex border border-neutral-200 text-[10px] font-bold uppercase w-fit">
        {DOMAIN_FILTERS.map((d) => (
          <button key={d} onClick={() => setDomainFilter(d)} className={`px-2.5 py-1.5 ${domainFilter === d ? 'bg-neutral-900 text-white' : 'text-neutral-600 hover:bg-neutral-50'}`}>{d}</button>
        ))}
      </div>

      <div className="border border-neutral-200 overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="bg-neutral-900 text-white font-barlow text-[9px] font-bold uppercase tracking-wider">
              <th className="px-2.5 py-2">{vi ? 'Đối tác' : 'Partner'}</th>
              <th className="px-2.5 py-2">{vi ? 'Tiêu đề' : 'Title'}</th>
              <th className="px-2.5 py-2">{vi ? 'Lĩnh vực' : 'Domain'}</th>
              <th className="px-2.5 py-2">{vi ? 'Hết hạn' : 'Expiry'}</th>
              <th className="px-2.5 py-2">{vi ? 'Trạng thái' : 'Status'}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {filtered.map((a) => (
              <tr key={a.id} className="hover:bg-neutral-50/80">
                <td className="px-2.5 py-2 font-semibold text-neutral-800">{a.organization?.name}</td>
                <td className="px-2.5 py-2 text-neutral-600">{a.title}</td>
                <td className="px-2.5 py-2 text-neutral-500">{a.collaboration_domain}</td>
                <td className="px-2.5 py-2 text-neutral-500">{a.expiry_date || '—'}</td>
                <td className="px-2.5 py-2">
                  <span className={`text-[9px] font-bold uppercase border px-1.5 py-0.5 ${STATUS_STYLE[a.expiryStatus] || ''}`}>{a.expiryStatus}</span>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={5} className="px-3 py-8 text-center text-neutral-400 italic">{vi ? 'Không có MOU nào.' : 'No agreements yet.'}</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

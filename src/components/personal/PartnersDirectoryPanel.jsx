import { useEffect, useState } from 'react';
import { Plus, Search, Users } from 'lucide-react';
import { useAuth } from '../../auth/AuthContext.jsx';
import {
  ORG_TYPES, RELATIONSHIP_STATUSES, STAKEHOLDER_TYPES,
  canManagePartnership, fetchOrganizations, createOrganization, fetchIndividuals, createIndividual,
} from '../../data/partnershipStore.js';

const inputClass = 'w-full rounded-none border border-neutral-300 bg-white px-2.5 py-1.5 font-ibm text-xs text-iscm-charcoal focus:border-iscm-crimson focus:outline-none';
const labelClass = 'block text-[10px] font-bold text-neutral-400 uppercase mb-1';

function useCanManage() {
  const [canManage, setCanManage] = useState(false);
  const [checked, setChecked] = useState(false);
  useEffect(() => { canManagePartnership().then((ok) => { setCanManage(ok); setChecked(true); }); }, []);
  return { canManage, checked };
}

/** Partnership > Partners > Individual Stakeholders — people ISCM has a
    collaboration relationship with, optionally tied to an organization.
    Kept as its own entity (not merged into organizations) since a person
    and an org are different things for future modeling (people ↔ orgs ↔
    projects ↔ events). */
export function IndividualStakeholdersPanel({ lang = 'vi' }) {
  const vi = lang === 'vi';
  const { user: authUser } = useAuth();
  const { canManage, checked } = useCanManage();
  const [individuals, setIndividuals] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ full_name: '', stakeholder_type: 'Other', organization_id: '', email: '', phone: '' });

  const reload = () => {
    setLoading(true);
    Promise.all([fetchIndividuals(), fetchOrganizations()]).then(([ind, orgs]) => {
      setIndividuals(ind); setOrganizations(orgs); setLoading(false);
    });
  };
  useEffect(() => { reload(); }, []);

  const submit = async () => {
    if (!form.full_name.trim()) return;
    await createIndividual({
      full_name: form.full_name.trim(), stakeholder_type: form.stakeholder_type,
      organization_id: form.organization_id || null, email: form.email.trim() || null, phone: form.phone.trim() || null,
    }, authUser?.id);
    setForm({ full_name: '', stakeholder_type: 'Other', organization_id: '', email: '', phone: '' });
    setShowForm(false); reload();
  };

  const q = query.trim().toLowerCase();
  const filtered = individuals.filter((i) => !q || i.full_name.toLowerCase().includes(q) || (i.organization?.name || '').toLowerCase().includes(q));

  if (!checked || loading) return <p className="font-ibm text-[11px] text-gray-400 p-2">{vi ? 'Đang tải...' : 'Loading...'}</p>;

  return (
    <div className="space-y-3 rounded-lg border border-gray-200 bg-white p-3.5 font-sans">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="flex items-center gap-1.5 font-ibm text-xs font-semibold text-iscm-charcoal">
          <Users className="h-3.5 w-3.5 text-iscm-crimson" /> {vi ? 'Đối tác cá nhân' : 'Individual Stakeholders'}
        </p>
        {canManage && (
          <button onClick={() => setShowForm((s) => !s)} className="flex items-center gap-1 text-[10px] font-bold uppercase text-neutral-500 hover:text-iscm-crimson">
            <Plus className="h-3.5 w-3.5" /> {vi ? 'Thêm' : 'Add'}
          </button>
        )}
      </div>

      {showForm && (
        <div className="grid grid-cols-3 gap-2 border border-neutral-200 p-2.5">
          <input placeholder={vi ? 'Họ tên' : 'Full name'} value={form.full_name} onChange={(e) => setForm((p) => ({ ...p, full_name: e.target.value }))} className={inputClass} />
          <select value={form.stakeholder_type} onChange={(e) => setForm((p) => ({ ...p, stakeholder_type: e.target.value }))} className={inputClass}>
            {STAKEHOLDER_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
          <select value={form.organization_id} onChange={(e) => setForm((p) => ({ ...p, organization_id: e.target.value }))} className={inputClass}>
            <option value="">{vi ? '— Tổ chức (không bắt buộc) —' : '— Organization (optional) —'}</option>
            {organizations.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
          </select>
          <input placeholder="Email" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} className={inputClass} />
          <input placeholder={vi ? 'Điện thoại' : 'Phone'} value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} className={inputClass} />
          <button onClick={submit} className="px-3 py-1.5 text-[10px] font-bold uppercase text-white bg-iscm-crimson hover:bg-[#7a0010] w-fit">{vi ? 'Lưu' : 'Save'}</button>
        </div>
      )}

      <div className="relative max-w-sm">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-400" />
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={vi ? 'Tìm...' : 'Search...'} className="w-full rounded-none border border-neutral-300 bg-white py-1.5 pl-8 pr-2.5 text-xs focus:border-neutral-900 focus:outline-none" />
      </div>

      <div className="border border-neutral-200 overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="bg-neutral-900 text-white font-barlow text-[9px] font-bold uppercase tracking-wider">
              <th className="px-2.5 py-2">{vi ? 'Họ tên' : 'Name'}</th>
              <th className="px-2.5 py-2">{vi ? 'Vai trò' : 'Type'}</th>
              <th className="px-2.5 py-2">{vi ? 'Tổ chức' : 'Organization'}</th>
              <th className="px-2.5 py-2">Email</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {filtered.map((i) => (
              <tr key={i.id} className="hover:bg-neutral-50/80">
                <td className="px-2.5 py-2 font-semibold text-neutral-800">{i.full_name}</td>
                <td className="px-2.5 py-2 text-neutral-600">{i.stakeholder_type}</td>
                <td className="px-2.5 py-2 text-neutral-500">{i.organization?.name || '—'}</td>
                <td className="px-2.5 py-2 text-neutral-500">{i.email || '—'}</td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={4} className="px-3 py-8 text-center text-neutral-400 italic">{vi ? 'Không có đối tác cá nhân nào.' : 'No individual stakeholders yet.'}</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/** Partnership > Partners > Institutional Partners — universities,
    government agencies, businesses, NGOs, research institutions... — not
    just "doanh nghiệp" (companies), matching the org_type breadth the
    schema already supports. */
export function InstitutionalPartnersPanel({ lang = 'vi' }) {
  const vi = lang === 'vi';
  const { user: authUser } = useAuth();
  const { canManage, checked } = useCanManage();
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', org_type: 'Other', country: '', relationship_status: 'Active' });

  const reload = () => { setLoading(true); fetchOrganizations().then((o) => { setOrganizations(o); setLoading(false); }); };
  useEffect(() => { reload(); }, []);

  const submit = async () => {
    if (!form.name.trim()) return;
    await createOrganization({
      name: form.name.trim(), org_type: form.org_type, country: form.country.trim() || null, relationship_status: form.relationship_status,
    }, authUser?.id);
    setForm({ name: '', org_type: 'Other', country: '', relationship_status: 'Active' });
    setShowForm(false); reload();
  };

  const q = query.trim().toLowerCase();
  const filtered = organizations.filter((o) => !q || o.name.toLowerCase().includes(q));

  if (!checked || loading) return <p className="font-ibm text-[11px] text-gray-400 p-2">{vi ? 'Đang tải...' : 'Loading...'}</p>;

  return (
    <div className="space-y-3 rounded-lg border border-gray-200 bg-white p-3.5 font-sans">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="flex items-center gap-1.5 font-ibm text-xs font-semibold text-iscm-charcoal">
          <Users className="h-3.5 w-3.5 text-iscm-crimson" /> {vi ? 'Đối tác tổ chức' : 'Institutional Partners'}
        </p>
        {canManage && (
          <button onClick={() => setShowForm((s) => !s)} className="flex items-center gap-1 text-[10px] font-bold uppercase text-neutral-500 hover:text-iscm-crimson">
            <Plus className="h-3.5 w-3.5" /> {vi ? 'Thêm' : 'Add'}
          </button>
        )}
      </div>

      {showForm && (
        <div className="grid grid-cols-4 gap-2 border border-neutral-200 p-2.5">
          <input placeholder={vi ? 'Tên tổ chức' : 'Organization name'} value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} className={`${inputClass} col-span-2`} />
          <select value={form.org_type} onChange={(e) => setForm((p) => ({ ...p, org_type: e.target.value }))} className={inputClass}>
            {ORG_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
          <input placeholder={vi ? 'Quốc gia' : 'Country'} value={form.country} onChange={(e) => setForm((p) => ({ ...p, country: e.target.value }))} className={inputClass} />
          <select value={form.relationship_status} onChange={(e) => setForm((p) => ({ ...p, relationship_status: e.target.value }))} className={inputClass}>
            {RELATIONSHIP_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <button onClick={submit} className="px-3 py-1.5 text-[10px] font-bold uppercase text-white bg-iscm-crimson hover:bg-[#7a0010] w-fit">{vi ? 'Lưu' : 'Save'}</button>
        </div>
      )}

      <div className="relative max-w-sm">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-400" />
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={vi ? 'Tìm...' : 'Search...'} className="w-full rounded-none border border-neutral-300 bg-white py-1.5 pl-8 pr-2.5 text-xs focus:border-neutral-900 focus:outline-none" />
      </div>

      <div className="border border-neutral-200 overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="bg-neutral-900 text-white font-barlow text-[9px] font-bold uppercase tracking-wider">
              <th className="px-2.5 py-2">{vi ? 'Tên tổ chức' : 'Name'}</th>
              <th className="px-2.5 py-2">{vi ? 'Loại' : 'Type'}</th>
              <th className="px-2.5 py-2">{vi ? 'Quốc gia' : 'Country'}</th>
              <th className="px-2.5 py-2">{vi ? 'Trạng thái' : 'Status'}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {filtered.map((o) => (
              <tr key={o.id} className="hover:bg-neutral-50/80">
                <td className="px-2.5 py-2 font-semibold text-neutral-800">{o.name}</td>
                <td className="px-2.5 py-2 text-neutral-600">{o.org_type}</td>
                <td className="px-2.5 py-2 text-neutral-500">{o.country || '—'}</td>
                <td className="px-2.5 py-2">
                  <span className={`text-[9px] font-bold uppercase ${o.relationship_status === 'Active' ? 'text-emerald-700' : 'text-neutral-400'}`}>{o.relationship_status}</span>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={4} className="px-3 py-8 text-center text-neutral-400 italic">{vi ? 'Không có đối tác tổ chức nào.' : 'No institutional partners yet.'}</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

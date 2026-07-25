import { useEffect, useState } from 'react';
import { Phone, Mail, Building2, GraduationCap, Link2 } from 'lucide-react';
import { users, FUNCTIONAL_GROUPS } from '../../data/mockData.js';
import { Avatar, RoleBadge } from '../ui.jsx';
import { supabase, isLive } from '../../lib/supabaseClient.js';

/* Contacts — support desks, departments, and the colleague directory. */

const SUPPORT_CONTACTS = [
  { name: 'IT Service Desk', line: 'it.iscm@ueh.edu.vn · ext. 2201', scope: 'Equipment, network, software, DC access' },
  { name: 'O&F Operation Desk', line: 'oandf.iscm@ueh.edu.vn · ext. 2105', scope: 'Payments, advances, budget lines (Flow 3)' },
  { name: 'HR & Admin Desk', line: 'hr.iscm@ueh.edu.vn · ext. 2102', scope: 'Leave, attendance, contracts, allowances' },
  { name: 'Lab Manager (ITCC)', line: 'lab.iscm@ueh.edu.vn · ext. 2310', scope: 'VR / drone / rig booking & returns' },
];

export function SupportContactsView() {
  return (
    <ul className="space-y-2">
      {SUPPORT_CONTACTS.map((c) => (
        <li key={c.name} className="glass-card flex items-start gap-3 p-3">
          <Phone className="mt-0.5 h-4 w-4 shrink-0 text-iscm-crimson" />
          <div>
            <div className="font-ibm text-xs font-semibold text-iscm-charcoal">{c.name}</div>
            <div className="font-ibm text-[11px] text-gray-600">{c.line}</div>
            <div className="font-ibm text-[10px] text-gray-400">{c.scope}</div>
          </div>
        </li>
      ))}
    </ul>
  );
}

export function DepartmentsView() {
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {FUNCTIONAL_GROUPS.map((g) => {
        const members = users.filter((u) => u.base_functional_group === g);
        return (
          <div key={g} className="glass-card p-3">
            <div className="flex items-center gap-2 font-barlow text-xs font-bold text-iscm-charcoal">
              <Building2 className="h-4 w-4 text-iscm-crimson" /> {g}
            </div>
            <div className="mt-1 font-barlow-condensed text-lg font-semibold text-iscm-crimson">{members.length}</div>
            <div className="font-ibm text-[10px] text-gray-400">nhân sự thuộc khối gốc</div>
          </div>
        );
      })}
    </div>
  );
}

/**
 * Live contact details a colleague has filled in on their own Profile & Bio
 * (Personal Portal), keyed by email — phone, avatar, academic title, and
 * ORCID/Scholar link. Anyone signed in can read the whole roster (RLS:
 * "profiles read (authenticated)"), so this overlays real data on top of
 * the bundled staff list rather than replacing it — most staff never touch
 * Contact Information, and the roster itself still needs to list them.
 */
function useLiveProfilesByEmail() {
  const [byEmail, setByEmail] = useState({});
  useEffect(() => {
    if (!isLive) return;
    let cancelled = false;
    supabase
      .from('users_profiles')
      .select('email, phone, avatar_url, academic_title, scholar_url')
      .then(({ data, error }) => {
        if (cancelled || error || !data) return;
        const map = {};
        data.forEach((row) => { map[(row.email || '').toLowerCase()] = row; });
        setByEmail(map);
      });
    return () => { cancelled = true; };
  }, []);
  return byEmail;
}

export function ColleaguesView() {
  const liveByEmail = useLiveProfilesByEmail();

  return (
    <div className="overflow-x-auto border border-neutral-200">
      <table className="w-full min-w-[720px] table-fixed border-collapse text-left">
        <thead>
          <tr className="border-b border-neutral-200 bg-neutral-900 text-white font-barlow text-[10px] font-bold uppercase tracking-wider">
            <th className="px-3 py-2.5 w-[26%]">Colleague</th>
            <th className="px-3 py-2.5 w-[22%]">Email</th>
            <th className="px-3 py-2.5 w-[13%]">Phone</th>
            <th className="px-3 py-2.5 w-[20%]">Functional Group</th>
            <th className="px-3 py-2.5 w-[19%]">Links</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-100 font-ibm text-xs">
          {users.map((u) => {
            const live = liveByEmail[(u.email || '').toLowerCase()];
            const phone = live?.phone || u.phone;
            return (
              <tr key={u.id} className="hover:bg-neutral-50/80 transition-colors">
                <td className="px-3 py-2.5">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Avatar name={u.full_name} size="sm" src={live?.avatar_url} />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="truncate font-semibold text-iscm-charcoal">{u.full_name}</span>
                        {u.system_role && <RoleBadge role={u.system_role} />}
                      </div>
                      {live?.academic_title && (
                        <div className="mt-0.5 flex items-center gap-1 text-[10px] text-gray-500">
                          <GraduationCap className="h-2.5 w-2.5 shrink-0" /> <span className="truncate">{live.academic_title}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-3 py-2.5">
                  <span className="flex items-center gap-1 text-gray-600 truncate">
                    <Mail className="h-2.5 w-2.5 shrink-0" /> <span className="truncate">{u.email}</span>
                  </span>
                </td>
                <td className="px-3 py-2.5">
                  <span className="flex items-center gap-1 text-gray-600">
                    <Phone className="h-2.5 w-2.5 shrink-0" />
                    {phone || <span className="text-gray-300 italic">—</span>}
                  </span>
                </td>
                <td className="px-3 py-2.5">
                  <span className="flex items-center gap-1 text-gray-600 truncate">
                    <Building2 className="h-2.5 w-2.5 shrink-0" /> <span className="truncate">{u.base_functional_group}</span>
                  </span>
                </td>
                <td className="px-3 py-2.5">
                  {live?.scholar_url ? (
                    <a
                      href={live.scholar_url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1 text-iscm-crimson hover:underline"
                    >
                      <Link2 className="h-2.5 w-2.5 shrink-0" /> ORCID/Scholar
                    </a>
                  ) : (
                    <span className="text-gray-300">—</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

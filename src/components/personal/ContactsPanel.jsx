import { Phone, Mail, Building2 } from 'lucide-react';
import { users, projectMembers, FUNCTIONAL_GROUPS } from '../../data/mockData.js';
import { Avatar, RoleBadge } from '../ui.jsx';

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

export function ColleaguesView() {
  return (
    <ul className="divide-y divide-gray-100">
      {users.map((u) => {
        const roles = projectMembers.filter((m) => m.user_id === u.id);
        return (
          <li key={u.id} className="flex items-center gap-3 py-2.5">
            <Avatar name={u.full_name} size="sm" />
            <div className="min-w-0 flex-1">
              <div className="truncate font-ibm text-xs font-semibold text-iscm-charcoal">{u.full_name}</div>
              <div className="flex items-center gap-1 truncate font-ibm text-[10px] text-gray-400">
                <Mail className="h-2.5 w-2.5" /> {u.email} · {u.base_functional_group}
              </div>
            </div>
            <span className="flex gap-1">
              {roles.slice(0, 2).map((r) => <RoleBadge key={r.project_id} role={r.project_role} />)}
              {roles.length > 2 && <span className="font-barlow-condensed text-[10px] text-gray-400">+{roles.length - 2}</span>}
            </span>
          </li>
        );
      })}
    </ul>
  );
}

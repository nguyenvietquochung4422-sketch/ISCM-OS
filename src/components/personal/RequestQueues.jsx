import { useMemo, useState } from 'react';
import { Inbox, Check, X } from 'lucide-react';
import { MY_TASKS, MY_FORMS_SEED } from '../../data/formPortal.js';
import { loadSubmissions } from './FormPortalPanel.jsx';
import { loadPendingRequests, decidePendingRequest } from '../../data/libraryStore.js';

/* My Tasks (approvals waiting on me) + My Forms (my submissions).
   Status filters arrive from the inline sidebar dropdowns. */

const STATUS_BADGE = {
  Open:     'bg-amber-50 text-amber-700 border border-amber-200',
  Approved: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  Rejected: 'bg-red-50 text-iscm-crimson border border-red-200',
};

const matches = (status, filter) =>
  filter === 'All' || (filter === 'Open' ? status === 'Open' : status !== 'Open');

export function MyTasksPanel({ statusFilter = 'All' }) {
  const [tasks, setTasks] = useState(() => {
    const libraryTasks = loadPendingRequests().map((r) => ({
      id: r.id,
      title: `Borrow request: ${r.itemTitle}`,
      requester: r.requester,
      form: 'Order Book/Documents Form',
      date: r.date,
      status: r.status,
      isLibrary: true,
    }));
    return [...libraryTasks, ...MY_TASKS];
  });
  const visible = tasks.filter((t) => matches(t.status, statusFilter));

  const decide = (id, status) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, status } : t)));
    if (tasks.find((t) => t.id === id)?.isLibrary) decidePendingRequest(id, status);
  };

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200">
      {/* Sticky header */}
      <div className="overflow-x-auto overflow-y-auto max-h-[480px]">
        <table className="w-full min-w-[540px] text-left">
          <thead className="sticky top-0 z-10">
            <tr className="bg-iscm-charcoal font-barlow-condensed text-[10px] font-bold uppercase tracking-wider text-white">
              <th className="px-4 py-3">Yêu cầu</th>
              <th className="px-4 py-3">Biểu mẫu</th>
              <th className="px-4 py-3">Ngày</th>
              <th className="px-4 py-3">Trạng thái</th>
              <th className="px-4 py-3 w-20">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {visible.map((t, i) => (
              <tr key={t.id} className={`${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/60'} hover:bg-iscm-crimson/5 transition-colors`}>
                <td className="px-4 py-2.5">
                  <div className="flex items-center gap-2">
                    <Inbox className="h-3.5 w-3.5 shrink-0 text-iscm-crimson" />
                    <span className="font-ibm text-xs font-medium text-iscm-charcoal">{t.title}</span>
                  </div>
                  <div className="font-ibm text-[10px] text-gray-400 pl-5">{t.requester}</div>
                </td>
                <td className="px-4 py-2.5 font-ibm text-[11px] text-gray-500 whitespace-nowrap">{t.form}</td>
                <td className="px-4 py-2.5 font-barlow-condensed text-xs text-gray-500 whitespace-nowrap">{t.date}</td>
                <td className="px-4 py-2.5">
                  <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold border ${STATUS_BADGE[t.status]}`}>{t.status}</span>
                </td>
                <td className="px-4 py-2.5">
                  {t.status === 'Open' && (
                    <span className="flex gap-1">
                      <button onClick={() => decide(t.id, 'Approved')} title="Approve"
                        className="rounded bg-emerald-600 p-1.5 text-white hover:bg-emerald-700"><Check className="h-3 w-3" /></button>
                      <button onClick={() => decide(t.id, 'Rejected')} title="Reject"
                        className="rounded bg-iscm-crimson p-1.5 text-white hover:bg-iscm-crimson-dark"><X className="h-3 w-3" /></button>
                    </span>
                  )}
                </td>
              </tr>
            ))}
            {visible.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-10 text-center font-ibm text-xs text-gray-400">Không có mục nào khớp bộ lọc.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function MyFormsPanel({ statusFilter = 'All' }) {
  const all = useMemo(() => [...loadSubmissions(), ...MY_FORMS_SEED], []);
  const visible = all.filter((f) => matches(f.status, statusFilter));

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200">
      <div className="overflow-x-auto overflow-y-auto max-h-[480px]">
        <table className="w-full min-w-[480px] text-left">
          <thead className="sticky top-0 z-10">
            <tr className="bg-iscm-charcoal font-barlow-condensed text-[10px] font-bold uppercase tracking-wider text-white">
              <th className="px-4 py-3">Biểu mẫu</th>
              <th className="px-4 py-3">Nhóm</th>
              <th className="px-4 py-3">Ngày gửi</th>
              <th className="px-4 py-3">Trạng thái</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {visible.map((f, i) => (
              <tr key={f.id} className={`${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/60'} hover:bg-iscm-crimson/5 transition-colors`}>
                <td className="px-4 py-2.5 font-ibm text-xs font-medium text-iscm-charcoal">{f.form}</td>
                <td className="px-4 py-2.5 font-ibm text-[11px] text-gray-500 whitespace-nowrap">{f.group}</td>
                <td className="px-4 py-2.5 font-barlow-condensed text-xs text-gray-500 whitespace-nowrap">{f.date}</td>
                <td className="px-4 py-2.5">
                  <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold border ${STATUS_BADGE[f.status]}`}>{f.status}</span>
                </td>
              </tr>
            ))}
            {visible.length === 0 && (
              <tr><td colSpan={4} className="px-4 py-10 text-center font-ibm text-xs text-gray-400">Không có form nào khớp bộ lọc.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}


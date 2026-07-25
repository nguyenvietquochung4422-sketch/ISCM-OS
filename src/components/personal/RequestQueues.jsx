import { useMemo, useState } from 'react';
import { Inbox, Check, X } from 'lucide-react';
import { MY_TASKS, MY_FORMS_SEED } from '../../data/formPortal.js';
import { loadSubmissions } from './FormPortalPanel.jsx';
import { loadPendingRequests, decidePendingRequest } from '../../data/libraryStore.js';

/* My Tasks (approvals waiting on me) + My Forms (my submissions).
   Status filters arrive from the inline sidebar dropdowns. */

// Matches STATUS_CLASSES in ResearchListTable.jsx — same sharp-cornered
// bordered badge style used across the app's tables.
const STATUS_BADGE = {
  Open:     'bg-amber-50 text-amber-700 border-amber-200',
  Approved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Rejected: 'bg-red-50 text-red-700 border-red-200',
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
    <div className="overflow-x-auto border border-neutral-200 bg-white shadow-sm">
      <div className="overflow-y-auto max-h-[480px]">
        <table className="w-full min-w-[540px] table-fixed border-collapse text-left">
          <thead className="sticky top-0 z-10">
            <tr className="border-b border-neutral-200 bg-neutral-900 font-barlow text-[10px] font-bold uppercase tracking-wider text-white">
              <th className="px-3 py-3 w-[38%]">Yêu cầu</th>
              <th className="px-3 py-3 w-[24%]">Biểu mẫu</th>
              <th className="px-3 py-3 w-[13%]">Ngày</th>
              <th className="px-3 py-3 w-[13%]">Trạng thái</th>
              <th className="px-3 py-3 w-[12%]">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100 font-ibm text-xs">
            {visible.map((t) => (
              <tr key={t.id} className="hover:bg-neutral-50/80 transition-colors">
                <td className="px-3 py-2.5">
                  <div className="flex items-center gap-2">
                    <Inbox className="h-3.5 w-3.5 shrink-0 text-[#8b0000]" />
                    <span className="font-medium text-neutral-800">{t.title}</span>
                  </div>
                  <div className="text-[10px] text-neutral-400 pl-5">{t.requester}</div>
                </td>
                <td className="px-3 py-2.5 text-[11px] text-neutral-500 whitespace-nowrap">{t.form}</td>
                <td className="px-3 py-2.5 text-neutral-500 whitespace-nowrap">{t.date}</td>
                <td className="px-3 py-2.5">
                  <span className={`inline-block border px-2 py-0.5 text-[9px] font-semibold rounded-none tracking-wider uppercase ${STATUS_BADGE[t.status]}`}>{t.status}</span>
                </td>
                <td className="px-3 py-2.5">
                  {t.status === 'Open' && (
                    <span className="flex gap-1">
                      <button onClick={() => decide(t.id, 'Approved')} title="Approve"
                        className="p-1.5 text-emerald-700 border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 transition-colors"><Check className="h-3 w-3" /></button>
                      <button onClick={() => decide(t.id, 'Rejected')} title="Reject"
                        className="p-1.5 text-red-700 border border-red-200 bg-red-50 hover:bg-red-100 transition-colors"><X className="h-3 w-3" /></button>
                    </span>
                  )}
                </td>
              </tr>
            ))}
            {visible.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-10 text-center text-neutral-400 italic">Không có mục nào khớp bộ lọc.</td></tr>
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
    <div className="overflow-x-auto border border-neutral-200 bg-white shadow-sm">
      <div className="overflow-y-auto max-h-[480px]">
        <table className="w-full min-w-[480px] table-fixed border-collapse text-left">
          <thead className="sticky top-0 z-10">
            <tr className="border-b border-neutral-200 bg-neutral-900 font-barlow text-[10px] font-bold uppercase tracking-wider text-white">
              <th className="px-3 py-3 w-[34%]">Biểu mẫu</th>
              <th className="px-3 py-3 w-[30%]">Nhóm</th>
              <th className="px-3 py-3 w-[18%]">Ngày gửi</th>
              <th className="px-3 py-3 w-[18%]">Trạng thái</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100 font-ibm text-xs">
            {visible.map((f) => (
              <tr key={f.id} className="hover:bg-neutral-50/80 transition-colors">
                <td className="px-3 py-2.5 font-medium text-neutral-800">{f.form}</td>
                <td className="px-3 py-2.5 text-[11px] text-neutral-500 whitespace-nowrap">{f.group}</td>
                <td className="px-3 py-2.5 text-neutral-500 whitespace-nowrap">{f.date}</td>
                <td className="px-3 py-2.5">
                  <span className={`inline-block border px-2 py-0.5 text-[9px] font-semibold rounded-none tracking-wider uppercase ${STATUS_BADGE[f.status]}`}>{f.status}</span>
                </td>
              </tr>
            ))}
            {visible.length === 0 && (
              <tr><td colSpan={4} className="px-4 py-10 text-center text-neutral-400 italic">Không có form nào khớp bộ lọc.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}


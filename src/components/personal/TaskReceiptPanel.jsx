import { useEffect, useState } from 'react';
import { Flag, Plus, Trash2 } from 'lucide-react';

/* Smart Office Tasks — personal task receipt + "raise a flag" blocker reporting.
   Persisted to localStorage; each task can be flagged as blocked. */

export default function TaskReceiptPanel() {
  const [tasks, setTasks] = useState([]);
  const [text, setText] = useState('');

  useEffect(() => {
    const stored = localStorage.getItem('iscm_mysite_tasks');
    if (stored) {
      try { setTasks(JSON.parse(stored)); } catch { /* ignore corrupt cache */ }
    }
  }, []);

  const persist = (next) => {
    setTasks(next);
    localStorage.setItem('iscm_mysite_tasks', JSON.stringify(next));
  };

  const addTask = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    persist([{ id: Date.now().toString(), text: text.trim(), done: false, flagged: false }, ...tasks]);
    setText('');
  };

  const toggleDone = (id) => persist(tasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  const toggleFlag = (id) => persist(tasks.map((t) => (t.id === id ? { ...t, flagged: !t.flagged } : t)));
  const remove = (id) => persist(tasks.filter((t) => t.id !== id));

  return (
    <div className="space-y-3">
      <form onSubmit={addTask} className="flex gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Nhận việc mới / Receive a new task…"
          className="flex-1 rounded-lg border border-gray-200 bg-white px-3 py-2 font-ibm text-xs focus:border-iscm-crimson focus:outline-none"
        />
        <button type="submit" className="btn-primary !px-3 !py-2 text-xs">
          <Plus className="h-3.5 w-3.5" /> Nhận việc
        </button>
      </form>

      <ul className="divide-y divide-gray-100">
        {tasks.map((t) => (
          <li key={t.id} className="flex items-center gap-2.5 py-2.5">
            <input type="checkbox" checked={t.done} onChange={() => toggleDone(t.id)}
              className="h-4 w-4 accent-iscm-crimson" />
            <span className={`min-w-0 flex-1 truncate font-ibm text-xs ${t.done ? 'text-gray-400 line-through' : 'text-iscm-charcoal font-medium'}`}>
              {t.text}
            </span>
            <button
              onClick={() => toggleFlag(t.id)}
              title="Raise a flag — báo cáo vướng mắc"
              className={`rounded-full p-1.5 transition-colors ${t.flagged ? 'bg-amber-100 text-amber-600' : 'bg-gray-100 text-gray-300 hover:text-amber-500'}`}
            >
              <Flag className="h-3.5 w-3.5" />
            </button>
            <button onClick={() => remove(t.id)} className="rounded p-1.5 text-gray-300 hover:text-iscm-crimson">
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </li>
        ))}
        {tasks.length === 0 && (
          <li className="py-8 text-center font-ibm text-xs text-gray-400">Chưa có tác vụ nào được nhận.</li>
        )}
      </ul>
      {tasks.some((t) => t.flagged) && (
        <p className="rounded-lg bg-amber-50 px-3 py-2 font-ibm text-[11px] text-amber-700">
          {tasks.filter((t) => t.flagged).length} tác vụ đang được gắn cờ chờ Quản lý xử lý vướng mắc.
        </p>
      )}
    </div>
  );
}

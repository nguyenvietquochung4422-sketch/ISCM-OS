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
    } else {
      const defaultTasks = [
        { id: 'dt-1', text: 'Nghiệm thu nội bộ dữ liệu đợt 1 (Atlas Q1)', done: true, flagged: false },
        { id: 'dt-2', text: 'Phê duyệt kế hoạch tài chính Quý III', done: false, flagged: false },
        { id: 'dt-3', text: 'Chuẩn bị hồ sơ đón đoàn Hochschule Worms', done: false, flagged: false },
        { id: 'dt-4', text: 'Rà soát quy hoạch chi tiết Phan Đình Phùng', done: false, flagged: true },
      ];
      persist(defaultTasks);
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
    <div className="flex flex-col h-[220px] justify-between">
      <div className="overflow-y-auto px-4 py-2 flex-1 divide-y divide-neutral-100 max-h-[170px]">
        {tasks.map((t) => (
          <div key={t.id} className="flex items-center gap-2.5 py-2">
            <input
              type="checkbox"
              checked={t.done}
              onChange={() => toggleDone(t.id)}
              className="h-3.5 w-3.5 accent-[#990000] cursor-pointer"
            />
            <span className={`min-w-0 flex-1 truncate font-ibm text-[11px] ${t.done ? 'text-neutral-400 line-through' : 'text-neutral-800 font-semibold'}`}>
              {t.text}
            </span>
            <button
              onClick={() => toggleFlag(t.id)}
              title="Raise a flag — báo cáo vướng mắc"
              className={`rounded-full p-1 transition-colors ${t.flagged ? 'bg-amber-100 text-amber-600' : 'text-neutral-300 hover:text-amber-500'}`}
            >
              <Flag className="h-3 w-3" />
            </button>
            <button onClick={() => remove(t.id)} className="text-neutral-300 hover:text-red-700 transition-colors">
              <Trash2 className="h-3 w-3" />
            </button>
          </div>
        ))}
        {tasks.length === 0 && (
          <div className="py-8 text-center font-ibm text-xs text-neutral-400">Chưa có tác vụ nào được nhận.</div>
        )}
      </div>

      <form onSubmit={addTask} className="flex border-t border-neutral-200 bg-neutral-50 px-2 py-1.5 gap-1.5 shrink-0">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Nhận việc mới..."
          className="flex-1 rounded-none border border-neutral-300 bg-white px-2 py-1 font-ibm text-[11px] focus:border-[#990000] focus:outline-none"
        />
        <button type="submit" className="rounded-none bg-neutral-900 hover:bg-[#990000] text-white px-3 py-1 font-barlow font-bold text-[10px] uppercase tracking-wider transition-colors">
          Thêm
        </button>
      </form>
    </div>
  );
}

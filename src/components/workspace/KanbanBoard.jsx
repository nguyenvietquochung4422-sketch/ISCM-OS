import { useState } from 'react';
import { GripVertical, Plus, CalendarClock } from 'lucide-react';
import { Avatar } from '../ui.jsx';
import { userById } from '../../data/mockData.js';

/* ------------------------------------------------------------------ */
/* Tab 1 — Progress: drag-and-drop Kanban board (native HTML5 DnD)     */
/* ------------------------------------------------------------------ */

const COLUMNS = [
  { key: 'todo', label: 'To-do', accent: 'border-t-gray-300' },
  { key: 'in_progress', label: 'In Progress', accent: 'border-t-blue-400' },
  { key: 'review', label: 'Review', accent: 'border-t-amber-400' },
  { key: 'done', label: 'Done', accent: 'border-t-emerald-400' },
];

export default function KanbanBoard({ tasks: initialTasks }) {
  const [tasks, setTasks] = useState(initialTasks);
  const [dragId, setDragId] = useState(null);
  const [overColumn, setOverColumn] = useState(null);

  const dropInColumn = (columnKey) => {
    if (!dragId) return;
    setTasks((prev) => prev.map((t) => (t.id === dragId ? { ...t, column_key: columnKey } : t)));
    setDragId(null);
    setOverColumn(null);
  };

  return (
    <div className="grid gap-3 sm:grid-cols-2 2xl:grid-cols-4">
      {COLUMNS.map((col) => {
        const columnTasks = tasks.filter((t) => t.column_key === col.key);
        return (
          <div
            key={col.key}
            onDragOver={(e) => { e.preventDefault(); setOverColumn(col.key); }}
            onDragLeave={() => setOverColumn(null)}
            onDrop={() => dropInColumn(col.key)}
            className={`rounded-2xl border-t-4 ${col.accent} bg-iscm-surface/70 p-3 transition-colors ${
              overColumn === col.key ? 'bg-iscm-crimson/5 ring-2 ring-iscm-crimson/30' : ''
            }`}
          >
            <div className="mb-3 flex items-center justify-between px-1">
              <h3 className="font-barlow text-sm font-bold uppercase tracking-wide text-iscm-charcoal">
                {col.label}
              </h3>
              <span className="font-barlow-condensed text-sm font-semibold text-gray-400">
                {columnTasks.length}
              </span>
            </div>

            <div className="space-y-2.5">
              {columnTasks.map((task) => {
                const assignee = userById[task.assignee_id];
                return (
                  <article
                    key={task.id}
                    draggable
                    onDragStart={() => setDragId(task.id)}
                    onDragEnd={() => { setDragId(null); setOverColumn(null); }}
                    className={`glass-card cursor-grab select-none p-3 active:cursor-grabbing ${
                      dragId === task.id ? 'opacity-40' : ''
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <GripVertical className="mt-0.5 h-4 w-4 shrink-0 text-gray-300" />
                      <p className="font-ibm text-sm font-medium text-iscm-charcoal">{task.title}</p>
                    </div>
                    <div className="mt-2.5 flex items-center justify-between gap-2 pl-6">
                      {assignee && (
                        <span className="flex min-w-0 items-center gap-2">
                          <Avatar name={assignee.full_name} size="sm" />
                          <span className="truncate font-ibm text-xs text-gray-500">{assignee.full_name}</span>
                        </span>
                      )}
                      {task.due_date && (
                        <span
                          className={`flex shrink-0 items-center gap-1 rounded font-barlow-condensed text-xs ${
                            task.column_key !== 'done' && new Date(task.due_date) < new Date()
                              ? 'font-semibold text-iscm-crimson'
                              : 'text-gray-400'
                          }`}
                          title="Deadline"
                        >
                          <CalendarClock className="h-3.5 w-3.5" />
                          {new Date(task.due_date).getDate()}/{new Date(task.due_date).getMonth() + 1}
                        </span>
                      )}
                    </div>
                  </article>
                );
              })}
              <button className="flex w-full items-center justify-center gap-1 rounded-xl border border-dashed border-gray-300 py-2 font-ibm text-xs text-gray-400 hover:border-iscm-crimson hover:text-iscm-crimson">
                <Plus className="h-3.5 w-3.5" /> Add task
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

import { useEffect, useState } from 'react';
import { LifeBuoy, MessageSquareHeart, Send, Ticket } from 'lucide-react';

/* Supports — lightweight ad-hoc ticket layer, distinct from Form Portal. */

const STORE_KEY = 'iscm_support_tickets';
const loadTickets = () => {
  try { return JSON.parse(localStorage.getItem(STORE_KEY) || '[]'); } catch { return []; }
};

export function CreateRequestView() {
  const [kind, setKind] = useState('help');
  const [text, setText] = useState('');
  const [sent, setSent] = useState(false);

  const submit = () => {
    if (!text.trim()) return;
    const ticket = {
      id: `tk-${Date.now()}`,
      kind: kind === 'help' ? 'Need Help' : 'Send Feedback',
      text: text.trim(),
      date: new Date().toISOString().slice(0, 10),
      status: 'Open',
    };
    localStorage.setItem(STORE_KEY, JSON.stringify([ticket, ...loadTickets()]));
    setText('');
    setSent(true);
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        <button onClick={() => { setKind('help'); setSent(false); }}
          className={`flex items-center justify-center gap-2 rounded-xl border p-3 font-ibm text-xs font-semibold transition-colors ${
            kind === 'help' ? 'border-iscm-crimson bg-iscm-crimson text-white' : 'border-gray-200 text-iscm-charcoal hover:border-iscm-crimson'
          }`}>
          <LifeBuoy className="h-4 w-4" /> Need Help
        </button>
        <button onClick={() => { setKind('feedback'); setSent(false); }}
          className={`flex items-center justify-center gap-2 rounded-xl border p-3 font-ibm text-xs font-semibold transition-colors ${
            kind === 'feedback' ? 'border-iscm-crimson bg-iscm-crimson text-white' : 'border-gray-200 text-iscm-charcoal hover:border-iscm-crimson'
          }`}>
          <MessageSquareHeart className="h-4 w-4" /> Send Feedback
        </button>
      </div>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={4}
        placeholder={kind === 'help' ? 'Mô tả vấn đề bạn cần hỗ trợ…' : 'Góp ý của bạn cho ISCM Hub / vận hành Viện…'}
        className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 font-ibm text-xs focus:border-iscm-crimson focus:outline-none"
      />
      <button onClick={submit} className="btn-primary text-xs"><Send className="h-3.5 w-3.5" /> Gửi</button>
      {sent && <p className="font-ibm text-[11px] text-emerald-600">Đã gửi — theo dõi tại 📥 My Requests.</p>}
    </div>
  );
}

export function MyRequestsView() {
  const [tickets, setTickets] = useState([]);
  useEffect(() => { setTickets(loadTickets()); }, []);

  return (
    <ul className="divide-y divide-gray-100">
      {tickets.map((t) => (
        <li key={t.id} className="flex items-center gap-3 py-2.5">
          <Ticket className="h-4 w-4 shrink-0 text-iscm-crimson" />
          <div className="min-w-0 flex-1">
            <div className="truncate font-ibm text-xs font-medium text-iscm-charcoal">{t.text}</div>
            <div className="font-ibm text-[10px] text-gray-400">{t.kind} · {t.date}</div>
          </div>
          <span className="badge border border-blue-200 bg-blue-50 text-blue-700">{t.status}</span>
        </li>
      ))}
      {tickets.length === 0 && (
        <li className="py-8 text-center font-ibm text-xs text-gray-400">
          Chưa có support ticket nào — tạo tại ➕ Create Request.
        </li>
      )}
    </ul>
  );
}

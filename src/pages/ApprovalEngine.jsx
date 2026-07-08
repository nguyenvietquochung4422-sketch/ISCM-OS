import { useMemo, useState } from 'react';
import {
  FileSignature, Stamp, Check, X, MessageSquareWarning, BellRing, Mail,
  Timer, PenLine, Send, ShieldCheck,
} from 'lucide-react';
import {
  APPROVALS, APPROVAL_TYPES, APPROVAL_NOTIFICATIONS, staffById,
} from '../data/osData.js';
import { Avatar } from '../components/ui.jsx';
import { useLanguage } from '../i18n/LanguageContext.jsx';
import { NAVIGATION_LOCALIZATION } from '../data/navigationLocalization.js';

/* ------------------------------------------------------------------ */
/* Đề án 1 · 3.3 — Bypass Approval Engine (trục phê duyệt tờ trình)    */
/* Tờ trình ký số → phòng chờ duyệt Viện trưởng theo cấp bậc cấu hình  */
/* Thông báo in-app + email @ueh.edu.vn khi trạng thái thay đổi        */
/* ------------------------------------------------------------------ */

const STATUS_STYLE = {
  'Chờ duyệt': 'bg-amber-50 text-amber-700 border-amber-200',
  'Đã duyệt': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'Từ chối': 'bg-red-50 text-iscm-crimson border-red-200',
  'Yêu cầu bổ sung': 'bg-violet-50 text-violet-700 border-violet-200',
};

const TYPE_LABEL = Object.fromEntries(APPROVAL_TYPES.map((t) => [t.key, t.label]));

/** Form lập tờ trình mới + ký số */
function NewSubmission({ onSubmit }) {
  const [type, setType] = useState('funding');
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [signed, setSigned] = useState(false);
  const [done, setDone] = useState(false);

  const inputClass =
    'w-full rounded-lg border border-gray-200 bg-white px-3 py-2 font-ibm text-xs focus:border-iscm-crimson focus:outline-none';

  const submit = () => {
    if (!title.trim() || !signed) return;
    onSubmit({
      id: `TT-2026-0${44 + Math.floor(Math.random() * 50)}`,
      type, title: title.trim(), amount: amount || '—',
      requester: 's7', created: '2026-07-08', level: 1,
      status: 'Chờ duyệt', signed: true, sla_hours: 0,
    });
    setTitle(''); setAmount(''); setSigned(false); setDone(true);
    setTimeout(() => setDone(false), 4000);
  };

  return (
    <section className="glass-card p-4">
      <h2 className="mb-1 flex items-center gap-2 font-barlow text-base font-bold text-iscm-charcoal">
        <PenLine className="h-4 w-4 text-iscm-crimson" /> Lập tờ trình mới
      </h2>
      <p className="mb-3 font-ibm text-[11px] text-gray-500">
        Số hóa 100% quy trình tờ trình — ký số rồi đẩy tự động vào phòng chờ theo cấp bậc phê duyệt.
      </p>
      <div className="space-y-2.5">
        <select value={type} onChange={(e) => setType(e.target.value)} className={inputClass}>
          {APPROVAL_TYPES.map((t) => <option key={t.key} value={t.key}>{t.label}</option>)}
        </select>
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Trích yếu tờ trình…" className={inputClass} />
        {type !== 'data-access' && (
          <input value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Kinh phí đề xuất (VND)…" className={inputClass} />
        )}
        <label className={`flex items-center gap-2 rounded-lg border p-2.5 font-ibm text-[11px] transition-colors ${
          signed ? 'border-emerald-300 bg-emerald-50 text-emerald-700' : 'border-gray-200 text-gray-600'
        }`}>
          <input type="checkbox" checked={signed} onChange={(e) => setSigned(e.target.checked)} className="accent-iscm-crimson" />
          <FileSignature className="h-4 w-4" />
          Ký số bằng chứng thư UEH — SHA-256: <code className="font-barlow-condensed">{signed ? '9f2e…c41a ✔' : 'chưa ký'}</code>
        </label>
        <button onClick={submit} disabled={!title.trim() || !signed}
          className={`flex items-center gap-2 rounded-lg px-4 py-2 font-ibm text-xs font-semibold text-white ${
            title.trim() && signed ? 'bg-iscm-crimson hover:bg-iscm-crimson-dark' : 'cursor-not-allowed bg-gray-300'
          }`}>
          <Send className="h-3.5 w-3.5" /> Trình ký & đẩy vào phòng chờ
        </button>
        {done && <p className="font-ibm text-[11px] text-emerald-600">Đã gửi — thông báo in-app + email sẽ phát khi trạng thái thay đổi.</p>}
      </div>
    </section>
  );
}

export default function ApprovalEngine() {
  const [items, setItems] = useState(APPROVALS);
  const [feed, setFeed] = useState(APPROVAL_NOTIFICATIONS);

  const decide = (id, status) => {
    setItems((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)));
    const verb = status === 'Đã duyệt' ? 'PHÊ DUYỆT' : status === 'Từ chối' ? 'TỪ CHỐI' : 'YÊU CẦU BỔ SUNG';
    setFeed((prev) => [{
      id: `n-${Date.now()}`, at: '2026-07-08 ' + new Date().toTimeString().slice(0, 5),
      channel: ['in-app', 'email'],
      text: `${id} đã được Viện trưởng ${verb} — email tự động gửi tới người trình ký`,
    }, ...prev]);
  };

  const pendingDirector = items.filter((a) => a.level === 2 && a.status === 'Chờ duyệt');
  const avgSla = useMemo(() => {
    const done = items.filter((a) => a.sla_hours > 0);
    return done.length ? Math.round(done.reduce((s, a) => s + a.sla_hours, 0) / done.length) : 0;
  }, [items]);

  const { lang } = useLanguage();
  const t = NAVIGATION_LOCALIZATION[lang];

  return (
    <div className="w-full space-y-4">
      <header className="flex flex-wrap items-start justify-between gap-3 border-l-4 border-iscm-crimson pl-4 py-1 mb-2">
        <div>
          <h1 className="font-barlow text-3xl font-extrabold uppercase tracking-wider text-iscm-charcoal">
            {t.APPROVAL_WORKFLOW}
          </h1>
          <p className="mt-1 font-ibm text-xs uppercase tracking-wider text-gray-500">
            Trục phê duyệt tờ trình số & ký số · Đề án 1 / Phân hệ 3.3
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-xl bg-iscm-charcoal px-4 py-2 text-white">
          <Timer className="h-4 w-4 text-iscm-crimson-light" />
          <span className="font-barlow-condensed text-2xl font-bold">{avgSla}h</span>
          <span className="font-ibm text-[10px] text-white/60">SLA xử lý trung bình<br />mục tiêu giảm ≥ 50%</span>
        </div>
      </header>

      <div className="grid items-start gap-4 xl:grid-cols-[340px_1fr_320px]">
        <NewSubmission onSubmit={(a) => setItems((prev) => [a, ...prev])} />

        {/* Phòng chờ duyệt */}
        <section className="glass-card min-w-0 p-4">
          <h2 className="mb-1 flex items-center gap-2 font-barlow text-base font-bold text-iscm-charcoal">
            <Stamp className="h-4 w-4 text-iscm-crimson" /> Phòng chờ duyệt của Viện trưởng
            <span className="rounded-full bg-iscm-crimson px-2 py-0.5 font-barlow-condensed text-xs font-bold text-white">{pendingDirector.length}</span>
          </h2>
          <p className="mb-3 font-ibm text-[11px] text-gray-500">
            Tờ trình đã ký số được đẩy tự động theo cấp bậc: Head Lab (cấp 1) → Viện trưởng (cấp 2).
          </p>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-left">
              <thead>
                <tr className="bg-iscm-surface font-barlow-condensed text-[10px] font-bold uppercase tracking-wider text-gray-500">
                  <th className="px-3 py-2">Số hiệu</th><th className="px-3 py-2">Trích yếu</th>
                  <th className="px-3 py-2">Người trình</th><th className="px-3 py-2">Kinh phí</th>
                  <th className="px-3 py-2">Cấp</th><th className="px-3 py-2">Trạng thái</th>
                  <th className="px-3 py-2">Xử lý</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-ibm text-[11px]">
                {items.map((a) => {
                  const who = staffById[a.requester];
                  return (
                    <tr key={a.id} className="hover:bg-iscm-crimson/5">
                      <td className="whitespace-nowrap px-3 py-2 font-barlow-condensed text-xs font-bold text-iscm-crimson">
                        {a.id}
                        {a.signed && <ShieldCheck className="ml-1 inline h-3 w-3 text-emerald-600" title="Đã ký số" />}
                      </td>
                      <td className="max-w-[240px] px-3 py-2">
                        <span className="block truncate font-medium text-iscm-charcoal" title={a.title}>{a.title}</span>
                        <span className="text-[10px] text-gray-400">{TYPE_LABEL[a.type]} · {a.created}</span>
                      </td>
                      <td className="whitespace-nowrap px-3 py-2">
                        <span className="flex items-center gap-1.5"><Avatar name={who?.name} size="sm" />{who?.name?.split(' ').slice(-2).join(' ')}</span>
                      </td>
                      <td className="whitespace-nowrap px-3 py-2 font-barlow-condensed">{a.amount}</td>
                      <td className="px-3 py-2 font-barlow-condensed text-xs">{a.level === 2 ? 'Viện trưởng' : 'Head Lab'}</td>
                      <td className="px-3 py-2">
                        <span className={`inline-block whitespace-nowrap rounded-full border px-2 py-0.5 text-[10px] font-semibold ${STATUS_STYLE[a.status]}`}>{a.status}</span>
                      </td>
                      <td className="px-3 py-2">
                        {a.status === 'Chờ duyệt' && (
                          <span className="flex gap-1">
                            <button onClick={() => decide(a.id, 'Đã duyệt')} title="Phê duyệt" className="rounded bg-emerald-600 p-1.5 text-white hover:bg-emerald-700"><Check className="h-3 w-3" /></button>
                            <button onClick={() => decide(a.id, 'Yêu cầu bổ sung')} title="Yêu cầu bổ sung" className="rounded bg-violet-600 p-1.5 text-white hover:bg-violet-700"><MessageSquareWarning className="h-3 w-3" /></button>
                            <button onClick={() => decide(a.id, 'Từ chối')} title="Từ chối" className="rounded bg-iscm-crimson p-1.5 text-white hover:bg-iscm-crimson-dark"><X className="h-3 w-3" /></button>
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        {/* Thông báo in-app + email */}
        <section className="glass-card p-4">
          <h2 className="mb-1 flex items-center gap-2 font-barlow text-base font-bold text-iscm-charcoal">
            <BellRing className="h-4 w-4 text-iscm-crimson" /> Thông báo trạng thái
          </h2>
          <p className="mb-3 font-ibm text-[11px] text-gray-500">In-app + email nội bộ @ueh.edu.vn, phát ngay khi trạng thái đổi.</p>
          <ul className="space-y-2">
            {feed.map((n) => (
              <li key={n.id} className="rounded-lg border border-gray-100 bg-white/70 p-2.5">
                <p className="font-ibm text-[11px] text-iscm-charcoal">{n.text}</p>
                <p className="mt-1 flex items-center gap-2 font-barlow-condensed text-[10px] text-gray-400">
                  {n.at}
                  {n.channel.includes('in-app') && <span className="rounded bg-blue-50 px-1.5 py-0.5 font-ibm text-[9px] font-semibold text-blue-700">in-app</span>}
                  {n.channel.includes('email') && <span className="inline-flex items-center gap-0.5 rounded bg-iscm-crimson/10 px-1.5 py-0.5 font-ibm text-[9px] font-semibold text-iscm-crimson"><Mail className="h-2.5 w-2.5" />email</span>}
                </p>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}

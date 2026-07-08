import { TRANSACTIONS } from '../../data/formPortal.js';

/* Transactions — union ledger of Track 1 (UEH) and Track 2 (ISCM Fund) lines */

const STATUS_TONE = {
  Paid: 'text-emerald-600', Settled: 'text-emerald-600',
  Advance: 'text-blue-600', Pending: 'text-amber-600',
};

const FLOW_LABEL = { 1: 'Individual', 2: 'Project/Event', 3: 'O&F Operation', 4: 'Internal Incentives' };

export default function TransactionsPanel() {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2 font-ibm text-[11px]">
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-2.5 text-blue-800">
          <strong>Track 1 — UEH Standard.</strong> Flow 1 (Individual) · Flow 2 (Project/Event).
        </div>
        <div className="rounded-lg border border-red-200 bg-iscm-crimson/5 p-2.5 text-iscm-crimson">
          <strong>Track 2 — Internal ISCM Fund.</strong> Flow 3 (O&amp;F) · Flow 4 (Incentives/Phúc lợi).
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-gray-200">
        <table className="w-full text-left font-ibm text-[11px]">
          <thead className="bg-iscm-surface font-barlow-condensed uppercase text-gray-400">
            <tr>
              <th className="px-2.5 py-1.5">Ngày</th><th className="px-2.5 py-1.5">Diễn giải</th>
              <th className="px-2.5 py-1.5">Track / Flow</th><th className="px-2.5 py-1.5 text-right">VND</th>
              <th className="px-2.5 py-1.5">Trạng thái</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {TRANSACTIONS.map((x) => (
              <tr key={x.id}>
                <td className="whitespace-nowrap px-2.5 py-1.5 font-barlow-condensed">{x.date}</td>
                <td className="px-2.5 py-1.5 text-iscm-charcoal">{x.desc}</td>
                <td className="whitespace-nowrap px-2.5 py-1.5">
                  <span className={`badge !text-[9px] ${x.track === 1 ? 'bg-blue-50 text-blue-700' : 'bg-iscm-crimson/10 text-iscm-crimson'}`}>
                    T{x.track} · F{x.flow} {FLOW_LABEL[x.flow]}
                  </span>
                </td>
                <td className="whitespace-nowrap px-2.5 py-1.5 text-right font-barlow-condensed font-semibold">{x.amount}</td>
                <td className={`px-2.5 py-1.5 font-medium ${STATUS_TONE[x.status] ?? 'text-gray-500'}`}>{x.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

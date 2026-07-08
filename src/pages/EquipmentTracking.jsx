import { useMemo, useState } from 'react';
import { QrCode, Wrench, AlertTriangle, Undo2, HandHelping, CalendarClock } from 'lucide-react';
import { EQUIPMENT, staffById, TODAY } from '../data/osData.js';
import { Avatar } from '../components/ui.jsx';

/* ------------------------------------------------------------------ */
/* Đề án 1 · 3.3 — ISCM-Equipment Tracking                             */
/* Mượn - trả thiết bị công nghệ cao qua mã QR/RFID, lưu vết người     */
/* mượn, thời hạn và cảnh báo lịch bảo trì định kỳ.                    */
/* ------------------------------------------------------------------ */

const STATUS_STYLE = {
  'Sẵn sàng': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'Đang mượn': 'bg-blue-50 text-blue-700 border-blue-200',
  'Bảo trì': 'bg-amber-50 text-amber-700 border-amber-200',
};

/** Ô QR giả lập — pattern sinh từ chuỗi mã định danh */
function QrBadge({ code }) {
  const cells = useMemo(() => {
    let h = 0;
    for (const c of code) h = (h * 31 + c.charCodeAt(0)) >>> 0;
    return Array.from({ length: 25 }, (_, i) => ((h >> (i % 28)) ^ (i * 2654435761)) & 1);
  }, [code]);
  return (
    <span className="grid h-9 w-9 shrink-0 grid-cols-5 gap-px rounded border border-gray-200 bg-white p-0.5" title={`QR: ${code}`}>
      {cells.map((on, i) => <span key={i} className={on ? 'bg-iscm-charcoal' : 'bg-white'} />)}
    </span>
  );
}

export default function EquipmentTracking() {
  const [items, setItems] = useState(EQUIPMENT);

  const maintenanceDue = items.filter((e) => e.next_maintenance <= TODAY);
  const overdueLoans = items.filter((e) => e.status === 'Đang mượn' && e.due && e.due < TODAY);

  const giveBack = (id) =>
    setItems((prev) => prev.map((e) => (e.id === id ? { ...e, status: 'Sẵn sàng', borrower: null, due: null } : e)));
  const borrow = (id) =>
    setItems((prev) => prev.map((e) => (e.id === id ? { ...e, status: 'Đang mượn', borrower: 's7', due: '2026-07-22' } : e)));

  const counts = {
    total: items.length,
    borrowed: items.filter((e) => e.status === 'Đang mượn').length,
    ready: items.filter((e) => e.status === 'Sẵn sàng').length,
    maint: items.filter((e) => e.status === 'Bảo trì').length,
  };

  return (
    <div className="w-full space-y-4">
      <header className="border-l-4 border-iscm-crimson pl-4 py-1 mb-2">
        <h1 className="font-barlow text-3xl font-extrabold uppercase tracking-wider text-iscm-charcoal">
          ISCM-Equipment Tracking
        </h1>
        <p className="mt-1 font-ibm text-xs uppercase tracking-wider text-gray-500">
          Mượn - trả thiết bị công nghệ cao · định danh QR/RFID · cảnh báo bảo trì định kỳ
        </p>
      </header>

      {/* KPI strip */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          ['Tổng thiết bị', counts.total, 'text-iscm-charcoal'],
          ['Đang mượn', counts.borrowed, 'text-blue-600'],
          ['Sẵn sàng', counts.ready, 'text-emerald-600'],
          ['Đang bảo trì', counts.maint, 'text-amber-600'],
        ].map(([label, n, tone]) => (
          <div key={label} className="glass-card px-4 py-3">
            <div className={`font-barlow-condensed text-3xl font-bold ${tone}`}>{n}</div>
            <div className="font-ibm text-[11px] text-gray-500">{label}</div>
          </div>
        ))}
      </div>

      {/* Cảnh báo */}
      {(maintenanceDue.length > 0 || overdueLoans.length > 0) && (
        <div className="space-y-2">
          {maintenanceDue.length > 0 && (
            <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 font-ibm text-xs text-amber-800">
              <Wrench className="mt-0.5 h-4 w-4 shrink-0" />
              <span><strong>Đến hạn bảo trì định kỳ:</strong> {maintenanceDue.map((e) => `${e.name} (${e.next_maintenance})`).join(' · ')}</span>
            </div>
          )}
          {overdueLoans.length > 0 && (
            <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 font-ibm text-xs text-iscm-crimson">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              <span><strong>Mượn quá hạn:</strong> {overdueLoans.map((e) => `${e.name} — ${staffById[e.borrower]?.name} (hạn ${e.due})`).join(' · ')}</span>
            </div>
          )}
        </div>
      )}

      {/* Registry */}
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {items.map((e) => {
          const borrower = staffById[e.borrower];
          const maintDue = e.next_maintenance <= TODAY;
          const loanOverdue = e.status === 'Đang mượn' && e.due && e.due < TODAY;
          return (
            <article key={e.id} className={`glass-card glass-card-hover p-4 ${loanOverdue ? 'ring-1 ring-red-300' : maintDue ? 'ring-1 ring-amber-300' : ''}`}>
              <div className="flex items-start gap-3">
                <QrBadge code={e.qr} />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-ibm text-xs font-semibold text-iscm-charcoal" title={e.name}>{e.name}</p>
                  <p className="flex items-center gap-1 font-barlow-condensed text-[10px] uppercase tracking-wider text-gray-400">
                    <QrCode className="h-3 w-3" /> {e.qr} · {e.type}
                  </p>
                </div>
                <span className={`badge shrink-0 border ${STATUS_STYLE[e.status]}`}>{e.status}</span>
              </div>

              <div className="mt-3 space-y-1.5 font-ibm text-[11px]">
                {borrower ? (
                  <p className="flex items-center gap-1.5 text-gray-600">
                    <Avatar name={borrower.name} size="sm" /> {borrower.name}
                    <span className={`ml-auto font-barlow-condensed ${loanOverdue ? 'font-bold text-iscm-crimson' : 'text-gray-400'}`}>
                      hạn trả {e.due}{loanOverdue && ' ⚠'}
                    </span>
                  </p>
                ) : (
                  <p className="text-gray-400">Chưa có người mượn</p>
                )}
                <p className={`flex items-center gap-1.5 ${maintDue ? 'font-semibold text-amber-700' : 'text-gray-400'}`}>
                  <CalendarClock className="h-3.5 w-3.5" /> Bảo trì kế tiếp: {e.next_maintenance}{maintDue && ' — ĐẾN HẠN'}
                </p>
              </div>

              <div className="mt-3 flex gap-2">
                {e.status === 'Sẵn sàng' && (
                  <button onClick={() => borrow(e.id)} className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-iscm-crimson py-1.5 font-ibm text-[11px] font-semibold text-white hover:bg-iscm-crimson-dark">
                    <HandHelping className="h-3.5 w-3.5" /> Quét QR mượn
                  </button>
                )}
                {e.status === 'Đang mượn' && (
                  <button onClick={() => giveBack(e.id)} className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-iscm-cta py-1.5 font-ibm text-[11px] font-semibold text-white hover:bg-iscm-charcoal">
                    <Undo2 className="h-3.5 w-3.5" /> Ghi nhận trả
                  </button>
                )}
                {e.status === 'Bảo trì' && (
                  <span className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-amber-100 py-1.5 font-ibm text-[11px] font-semibold text-amber-700">
                    <Wrench className="h-3.5 w-3.5" /> Đang bảo trì định kỳ
                  </span>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}

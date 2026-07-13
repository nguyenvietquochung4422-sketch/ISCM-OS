import { useState } from 'react';
import { MonitorSmartphone, Undo2 } from 'lucide-react';
import { MY_ASSETS } from '../../data/formPortal.js';
import { loadCheckouts, returnCheckout } from '../../data/libraryStore.js';

/* My Assets — equipment currently checked out to me; filter comes from
   the inline sidebar dropdown; booking new slots goes via Form Portal. */

export default function MyAssetsPanel({ typeFilter = 'All' }) {
  const [assets, setAssets] = useState(() => {
    const books = loadCheckouts().filter((c) => !c.returned).map((c) => ({
      id: c.id,
      name: c.itemTitle,
      type: 'Book',
      checked_out: c.checked_out,
      due: c.due,
      isLibrary: true,
    }));
    return [...books, ...MY_ASSETS];
  });
  const visible = assets.filter((a) => typeFilter === 'All' || a.type === typeFilter);
  const overdue = (a) => a.due && new Date(a.due) < new Date();

  const handleReturn = (asset) => {
    if (asset.isLibrary) returnCheckout(asset.id);
    setAssets((prev) => prev.filter((x) => x.id !== asset.id));
  };

  return (
    <div className="space-y-3">
      <p className="font-ibm text-[11px] text-gray-500">
        Thiết bị đang mượn · filter: <strong>{typeFilter}</strong> · đặt lịch mới qua Form Portal → IT → <em>Lab equipment request</em>.
      </p>
      <ul className="space-y-2">
        {visible.map((a) => (
          <li key={a.id} className="glass-card flex items-center gap-3 p-3">
            <MonitorSmartphone className="h-5 w-5 shrink-0 text-iscm-crimson" />
            <div className="min-w-0 flex-1">
              <div className="truncate font-ibm text-xs font-semibold text-iscm-charcoal">{a.name}</div>
              <div className="font-ibm text-[10px] text-gray-400">
                {a.type} · nhận {a.checked_out} ·{' '}
                {a.due
                  ? <span className={overdue(a) ? 'font-semibold text-iscm-crimson' : ''}>hạn trả {a.due}{overdue(a) && ' — QUÁ HẠN'}</span>
                  : 'cấp dài hạn'}
              </div>
            </div>
            <button
              onClick={() => handleReturn(a)}
              className="flex items-center gap-1 rounded-lg bg-iscm-cta px-2.5 py-1.5 font-ibm text-[10px] font-semibold text-white hover:bg-iscm-charcoal"
            >
              <Undo2 className="h-3 w-3" /> Return
            </button>
          </li>
        ))}
        {visible.length === 0 && (
          <li className="py-8 text-center font-ibm text-xs text-gray-400">Không có thiết bị nào khớp bộ lọc.</li>
        )}
      </ul>
    </div>
  );
}

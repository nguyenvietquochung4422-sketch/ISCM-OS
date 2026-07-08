import { useMemo, useState } from 'react';
import {
  DatabaseZap, ShieldAlert, Cog, Warehouse, UploadCloud, Check, X, Globe2,
  KeyRound, LockKeyhole, Link2, Timer, FileWarning, Map as MapIcon,
} from 'lucide-react';
import { CORE_FILES, CORE_STAGES, EGRESS_LINKS, projectIndex } from '../data/osData.js';

/* ------------------------------------------------------------------ */
/* Đề án 2 · ISCM CORE — Trục hạ tầng & Tổng kho dữ liệu đô thị        */
/* [Web Lab/Web ISCM] → [API Gateway] → [Sandbox] → [ETL] → [Kho tổng] */
/* ------------------------------------------------------------------ */

const PRIVACY_STYLE = {
  Draft: 'bg-gray-100 text-gray-600 border-gray-200',
  Internal_Open: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Confidential: 'bg-red-50 text-iscm-crimson border-red-200',
};

const TYPE_TONE = {
  EXCEL: 'text-emerald-600', SHAPEFILE: 'text-violet-700', GEOJSON: 'text-emerald-700',
  CAD: 'text-blue-700', GEOTIFF: 'text-amber-700',
};

const STAGE_ICONS = { uploaded: UploadCloud, scanning: ShieldAlert, pending: FileWarning, etl: Cog, stored: Warehouse };

function FlowBadge({ flow }) {
  return flow === 'lab' ? (
    <span className="inline-flex items-center gap-1 rounded bg-blue-50 px-1.5 py-0.5 font-ibm text-[9px] font-semibold text-blue-700" title="Widget nhúng Web Lab — xác thực UEH ID + API Key">
      <KeyRound className="h-2.5 w-2.5" /> Lab Widget
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 rounded bg-amber-50 px-1.5 py-0.5 font-ibm text-[9px] font-semibold text-amber-700" title="Cổng công cộng Web ISCM — reCAPTCHA + Email OTP">
      <Globe2 className="h-2.5 w-2.5" /> Public OTP
    </span>
  );
}

export default function IscmCore() {
  const [files, setFiles] = useState(CORE_FILES);
  const [links, setLinks] = useState(EGRESS_LINKS);

  const approve = (id) =>
    setFiles((prev) => prev.map((f) => (f.asset_id === id
      ? { ...f, stage: 'etl', etl_step: f.source_crs ? 'GeoPandas: đang ép WGS84 → VN2000…' : 'Pandas: đang chuẩn hóa UTF-8, khử dòng trống…' }
      : f)));
  const reject = (id) =>
    setFiles((prev) => prev.map((f) => (f.asset_id === id ? { ...f, stage: 'rejected', reject_reason: 'Lãnh đạo Lab từ chối đưa vào xử lý' } : f)));

  const issueLink = (assetId) => {
    const token = Math.random().toString(16).slice(2, 6) + '…' + Math.random().toString(16).slice(2, 6);
    setLinks((prev) => [{
      id: `lnk-${Date.now()}`, asset_id: assetId, token,
      issued: '2026-07-08 ' + new Date().toTimeString().slice(0, 5),
      expires: '2026-07-09 ' + new Date().toTimeString().slice(0, 5),
      to: 'Đối tác ngoài (theo yêu cầu)',
    }, ...prev]);
  };

  const byStage = useMemo(() => {
    const m = Object.fromEntries(CORE_STAGES.map((s) => [s.key, []]));
    files.forEach((f) => { if (m[f.stage]) m[f.stage].push(f); });
    return m;
  }, [files]);

  const rejected = files.filter((f) => f.stage === 'rejected');
  const stored = files.filter((f) => f.stage === 'stored');

  return (
    <div className="w-full space-y-4">
      <header className="flex flex-wrap items-start justify-between gap-3 border-l-4 border-iscm-crimson pl-4 py-1 mb-2">
        <div>
          <h1 className="flex items-center gap-2 font-barlow text-3xl font-extrabold uppercase tracking-wider text-iscm-charcoal">
            <DatabaseZap className="h-6 w-6 text-iscm-crimson" /> ISCM CORE
          </h1>
          <p className="mt-1 font-ibm text-xs uppercase tracking-wider text-gray-500">
            Trục hạ tầng & Tổng kho dữ liệu đô thị trung tâm · Đề án 2 · UEH Cloud
          </p>
        </div>
        <span className="rounded-full bg-iscm-crimson px-3 py-1.5 font-barlow text-[10px] font-bold uppercase tracking-widest text-white">
          Thí điểm: Public Space Lab — Atlas HCMC
        </span>
      </header>

      {/* Pipeline 4 tầng */}
      <section className="glass-card p-4">
        <h2 className="mb-3 font-barlow text-base font-bold text-iscm-charcoal">Đường ống dữ liệu (Four-Tier Pipeline)</h2>
        <div className="grid gap-2 md:grid-cols-5">
          {CORE_STAGES.map((s, i) => {
            const Icon = STAGE_ICONS[s.key];
            const items = byStage[s.key];
            return (
              <div key={s.key} className="relative rounded-xl border border-gray-200 bg-iscm-surface/60 p-3">
                {i < CORE_STAGES.length - 1 && (
                  <span className="absolute -right-2 top-1/2 z-10 hidden -translate-y-1/2 font-barlow text-gray-300 md:block">→</span>
                )}
                <p className="flex items-center gap-1.5 font-barlow text-[11px] font-bold uppercase tracking-wide text-iscm-charcoal">
                  <Icon className="h-4 w-4 text-iscm-crimson" /> {s.label}
                  <span className="ml-auto font-barlow-condensed text-sm text-gray-400">{items.length}</span>
                </p>
                <p className="mt-0.5 font-ibm text-[9px] leading-snug text-gray-400">{s.hint}</p>
                <div className="mt-2 space-y-1.5">
                  {items.map((f) => (
                    <div key={f.asset_id} className="rounded-lg border border-gray-100 bg-white p-2">
                      <p className="truncate font-ibm text-[10px] font-semibold text-iscm-charcoal" title={f.file_name}>{f.file_name}</p>
                      <p className="mt-0.5 flex items-center gap-1.5">
                        <span className={`font-barlow-condensed text-[9px] font-bold ${TYPE_TONE[f.file_type] ?? 'text-gray-500'}`}>{f.file_type}</span>
                        <FlowBadge flow={f.flow} />
                        <span className="ml-auto font-barlow-condensed text-[9px] text-gray-400">{f.size_mb}MB</span>
                      </p>
                      {f.stage === 'scanning' && (
                        <p className="mt-1 flex items-center gap-1 font-ibm text-[9px] text-amber-700">
                          <span className="h-1.5 w-1.5 animate-ping rounded-full bg-amber-500" /> ClamAV đang quét mã độc…
                        </p>
                      )}
                      {f.stage === 'etl' && (
                        <p className="mt-1 font-ibm text-[9px] italic text-blue-700">{f.etl_step}</p>
                      )}
                      {f.stage === 'pending' && (
                        <div className="mt-1.5 space-y-1">
                          <p className="font-ibm text-[9px] text-violet-700">Ticket đã bắn về ISCM OS — chờ Lãnh đạo Lab</p>
                          <div className="flex gap-1">
                            <button onClick={() => approve(f.asset_id)} className="flex flex-1 items-center justify-center gap-1 rounded bg-emerald-600 py-1 font-ibm text-[9px] font-bold text-white hover:bg-emerald-700"><Check className="h-2.5 w-2.5" />Approve</button>
                            <button onClick={() => reject(f.asset_id)} className="flex flex-1 items-center justify-center gap-1 rounded bg-iscm-crimson py-1 font-ibm text-[9px] font-bold text-white hover:bg-iscm-crimson-dark"><X className="h-2.5 w-2.5" />Reject</button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                  {items.length === 0 && <p className="py-2 text-center font-ibm text-[9px] text-gray-300">— trống —</p>}
                </div>
              </div>
            );
          })}
        </div>
        {rejected.length > 0 && (
          <p className="mt-3 flex items-start gap-1.5 rounded-lg bg-red-50 p-2.5 font-ibm text-[10px] text-iscm-crimson">
            <ShieldAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <span><strong>Cách ly tại Sandbox:</strong> {rejected.map((f) => `${f.file_name} — ${f.reject_reason}`).join(' · ')}</span>
          </p>
        )}
      </section>

      <div className="grid items-start gap-4 xl:grid-cols-[1fr_360px]">
        {/* Danh mục iscm_data_catalog */}
        <section className="glass-card min-w-0 p-4">
          <h2 className="mb-1 font-barlow text-base font-bold text-iscm-charcoal">Danh mục tài sản dữ liệu — <code className="font-barlow-condensed text-sm">iscm_data_catalog</code></h2>
          <p className="mb-3 font-ibm text-[11px] text-gray-500">
            Kho tổng sau ETL · dữ liệu không gian đã ép về VN2000 (EPSG:5899 cho TP.HCM, KTT 107°30′ cho Huế) · phiên bản giữ hậu tố _v2_YYYYMMDD.
          </p>
          <div className="overflow-x-auto rounded-xl border border-gray-200">
            <table className="w-full min-w-[760px] text-left">
              <thead>
                <tr className="bg-iscm-charcoal font-barlow-condensed text-[10px] font-bold uppercase tracking-wider text-white">
                  <th className="px-3 py-2.5">Asset</th><th className="px-3 py-2.5">Lab</th>
                  <th className="px-3 py-2.5">Dự án (OS)</th><th className="px-3 py-2.5">CRS</th>
                  <th className="px-3 py-2.5">Features</th><th className="px-3 py-2.5">Bảo mật</th>
                  <th className="px-3 py-2.5">Chia sẻ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-ibm text-[11px]">
                {stored.map((f, i) => (
                  <tr key={f.asset_id} className={`${i % 2 ? 'bg-gray-50/60' : 'bg-white'} hover:bg-iscm-crimson/5`}>
                    <td className="max-w-[220px] px-3 py-2">
                      <span className="block truncate font-semibold text-iscm-charcoal" title={f.file_name}>{f.file_name}</span>
                      <span className="font-barlow-condensed text-[10px] text-gray-400">{f.asset_id} · {f.uploaded_by}{f.version ? ` · ${f.version}` : ''}</span>
                    </td>
                    <td className="whitespace-nowrap px-3 py-2 font-barlow-condensed text-xs font-bold text-iscm-crimson">{f.lab_code}</td>
                    <td className="max-w-[140px] truncate px-3 py-2 text-gray-600">{projectIndex[f.project_id]?.name ?? '—'}</td>
                    <td className="whitespace-nowrap px-3 py-2">
                      {f.source_crs ? (
                        <span className="inline-flex items-center gap-1 font-barlow-condensed text-[10px]">
                          <MapIcon className="h-3 w-3 text-gray-400" />
                          <span className="text-gray-400">{f.source_crs}</span> → <span className="font-bold text-emerald-700">{f.target_crs}</span>
                        </span>
                      ) : <span className="text-gray-300">—</span>}
                    </td>
                    <td className="px-3 py-2 font-barlow-condensed text-xs text-gray-600">{f.total_features || '—'}</td>
                    <td className="px-3 py-2"><span className={`inline-block whitespace-nowrap rounded-full border px-2 py-0.5 text-[10px] font-semibold ${PRIVACY_STYLE[f.privacy_status]}`}>{f.privacy_status}</span></td>
                    <td className="px-3 py-2">
                      {f.privacy_status === 'Confidential' ? (
                        <button onClick={() => issueLink(f.asset_id)} className="inline-flex items-center gap-1 rounded bg-iscm-cta px-2 py-1 font-ibm text-[10px] font-semibold text-white hover:bg-iscm-charcoal" title="Chỉ xuất qua trục API — link mã hóa tự hủy 24h">
                          <LockKeyhole className="h-3 w-3" /> Link 24h
                        </button>
                      ) : (
                        <button onClick={() => issueLink(f.asset_id)} className="inline-flex items-center gap-1 rounded border border-gray-200 px-2 py-1 font-ibm text-[10px] font-semibold text-iscm-charcoal hover:border-iscm-crimson hover:text-iscm-crimson">
                          <Link2 className="h-3 w-3" /> Cấp link
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Link mã hóa tự hủy 24h */}
        <section className="glass-card p-4">
          <h2 className="mb-1 flex items-center gap-2 font-barlow text-base font-bold text-iscm-charcoal">
            <Timer className="h-4 w-4 text-iscm-crimson" /> Link chia sẻ tự hủy
          </h2>
          <p className="mb-3 font-ibm text-[11px] text-gray-500">
            Hết hạn = Thời điểm cấp + 24 giờ. File Confidential không bao giờ sinh link tĩnh — bắt buộc đi qua trục API kiểm tra quyền.
          </p>
          <ul className="space-y-2">
            {links.map((l) => (
              <li key={l.id} className="rounded-lg border border-gray-100 bg-white/70 p-2.5">
                <p className="font-barlow-condensed text-xs font-bold text-iscm-charcoal">{l.asset_id} → {l.to}</p>
                <p className="mt-0.5 break-all font-ibm text-[10px] text-gray-500">
                  https://core.iscm.ueh.edu.vn/egress/<span className="font-semibold text-iscm-crimson">{l.token}</span>
                </p>
                <p className="mt-1 flex items-center justify-between font-barlow-condensed text-[10px]">
                  <span className="text-gray-400">Cấp: {l.issued}</span>
                  <span className="rounded bg-red-50 px-1.5 py-0.5 font-bold text-iscm-crimson">Tự hủy: {l.expires}</span>
                </p>
              </li>
            ))}
            {links.length === 0 && <li className="py-6 text-center font-ibm text-xs text-gray-400">Chưa cấp link nào.</li>}
          </ul>
        </section>
      </div>
    </div>
  );
}

import { useMemo, useState } from 'react';
import {
  DatabaseZap, ShieldAlert, Cog, Warehouse, UploadCloud, Check, X, Globe2,
  KeyRound, LockKeyhole, Link2, Timer, FileWarning, Map as MapIcon,
  ChevronDown, ChevronRight, Package, Clock, AlertTriangle, Filter,
} from 'lucide-react';
import { CORE_FILES, CORE_STAGES, EGRESS_LINKS, projectIndex, OS_HIERARCHY } from '../data/osData.js';

/* ------------------------------------------------------------------ */
/* Đề án 2 · ISCM CORE — Trục hạ tầng & Tổng kho dữ liệu đô thị       */
/* [Web Lab / Web ISCM] → [API GW] → [Sandbox] → [ETL] → [Kho tổng]  */
/* ------------------------------------------------------------------ */

const PRIVACY_STYLE = {
  Draft:         'bg-gray-100 text-gray-600 border-gray-300',
  Internal_Open: 'bg-emerald-50 text-emerald-700 border-emerald-300',
  Confidential:  'bg-red-50 text-red-700 border-red-300',
};

const TYPE_TONE = {
  EXCEL: 'text-emerald-700 bg-emerald-50 border-emerald-200',
  SHAPEFILE: 'text-violet-700 bg-violet-50 border-violet-200',
  GEOJSON: 'text-teal-700 bg-teal-50 border-teal-200',
  CAD: 'text-blue-700 bg-blue-50 border-blue-200',
  GEOTIFF: 'text-amber-700 bg-amber-50 border-amber-200',
};

const STAGE_META = {
  uploaded: { Icon: UploadCloud,  color: 'text-gray-500',    bg: 'bg-gray-50',    border: 'border-gray-200' },
  scanning: { Icon: ShieldAlert,  color: 'text-amber-600',   bg: 'bg-amber-50',   border: 'border-amber-200' },
  pending:  { Icon: FileWarning,  color: 'text-violet-600',  bg: 'bg-violet-50',  border: 'border-violet-200' },
  etl:      { Icon: Cog,          color: 'text-blue-600',    bg: 'bg-blue-50',    border: 'border-blue-200' },
  stored:   { Icon: Warehouse,    color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' },
  rejected: { Icon: AlertTriangle,color: 'text-red-600',     bg: 'bg-red-50',     border: 'border-red-200' },
};

/* Lab metadata from hierarchy */
const LABS = OS_HIERARCHY.map((l) => ({ code: l.lab_code, name: l.lab }));
const ALL_CODE = '__ALL__';

function FlowBadge({ flow }) {
  return flow === 'lab' ? (
    <span className="inline-flex items-center gap-1 rounded border border-blue-200 bg-blue-50 px-1.5 py-0.5 font-ibm text-[10px] font-semibold text-blue-700">
      <KeyRound className="h-2.5 w-2.5" /> Lab Widget
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 rounded border border-amber-200 bg-amber-50 px-1.5 py-0.5 font-ibm text-[10px] font-semibold text-amber-700">
      <Globe2 className="h-2.5 w-2.5" /> Public OTP
    </span>
  );
}

/* ─── Zone 1: Stat Card ─── */
function StatCard({ label, value, sub, color = 'text-iscm-charcoal', bg = 'bg-white', Icon }) {
  return (
    <div className={`flex flex-col gap-1 rounded-none border border-neutral-200 ${bg} px-4 py-3`}>
      <div className="flex items-center gap-2">
        {Icon && <Icon className={`h-4 w-4 ${color}`} />}
        <span className="font-barlow-condensed text-xs font-bold uppercase tracking-wide text-neutral-500">{label}</span>
      </div>
      <span className={`font-barlow text-3xl font-extrabold leading-none ${color}`}>{value}</span>
      {sub && <span className="font-ibm text-[10px] text-neutral-400">{sub}</span>}
    </div>
  );
}

/* ─── Zone 2: Pipeline Card ─── */
function PipelineCard({ f, onApprove, onReject }) {
  const sm = STAGE_META[f.stage] ?? STAGE_META.stored;
  return (
    <div className={`rounded-none border ${sm.border} ${sm.bg} p-2.5 space-y-1.5`}>
      {/* filename */}
      <p className="font-ibm text-xs font-semibold text-iscm-charcoal leading-snug line-clamp-2" title={f.file_name}>
        {f.file_name}
      </p>
      {/* meta row */}
      <div className="flex flex-wrap items-center gap-1">
        <span className={`rounded border px-1.5 py-0.5 font-barlow-condensed text-[10px] font-bold ${TYPE_TONE[f.file_type] ?? 'text-gray-500 bg-gray-50 border-gray-200'}`}>
          {f.file_type}
        </span>
        <FlowBadge flow={f.flow} />
        <span className="ml-auto font-barlow-condensed text-[10px] text-neutral-400">{f.size_mb} MB</span>
      </div>
      {/* uploader & time */}
      <p className="font-ibm text-[10px] text-neutral-400 truncate">{f.uploaded_by} · {f.created_at?.slice(0, 10)}</p>

      {/* Stage-specific indicators */}
      {f.stage === 'scanning' && (
        <p className="flex items-center gap-1 font-ibm text-[10px] text-amber-700 font-semibold">
          <span className="h-2 w-2 animate-ping rounded-full bg-amber-500 shrink-0" />
          ClamAV đang quét…
        </p>
      )}
      {f.stage === 'etl' && (
        <p className="font-ibm text-[10px] italic text-blue-700">{f.etl_step}</p>
      )}
      {f.stage === 'pending' && (
        <div className="space-y-1 pt-0.5">
          <p className="font-ibm text-[10px] text-violet-700">Ticket bắn về ISCM OS — chờ Lãnh đạo Lab</p>
          <div className="flex gap-1.5">
            <button
              onClick={() => onApprove(f.asset_id)}
              className="flex flex-1 items-center justify-center gap-1 rounded bg-emerald-600 py-1 font-ibm text-[10px] font-bold text-white hover:bg-emerald-700 transition-colors"
            >
              <Check className="h-3 w-3" /> Approve
            </button>
            <button
              onClick={() => onReject(f.asset_id)}
              className="flex flex-1 items-center justify-center gap-1 rounded bg-red-700 py-1 font-ibm text-[10px] font-bold text-white hover:bg-red-800 transition-colors"
            >
              <X className="h-3 w-3" /> Reject
            </button>
          </div>
        </div>
      )}
      {f.stage === 'rejected' && (
        <p className="font-ibm text-[10px] text-red-700 font-semibold">{f.reject_reason}</p>
      )}
    </div>
  );
}

/* ─── Zone 2: Single-Lab Pipeline View ─── */
function LabPipeline({ labCode, files, onApprove, onReject }) {
  const activeStages = CORE_STAGES.filter((s) => s.key !== 'stored'); // stored = catalog zone

  return (
    <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${activeStages.length}, minmax(0,1fr))` }}>
      {activeStages.map((s, i) => {
        const sm = STAGE_META[s.key];
        const Icon = sm.Icon;
        const labFiles = files.filter((f) => (labCode === ALL_CODE || f.lab_code === labCode) && f.stage === s.key);
        return (
          <div key={s.key} className="relative">
            {/* arrow connector */}
            {i < activeStages.length - 1 && (
              <span className="absolute -right-2 top-5 z-10 hidden font-barlow text-lg text-neutral-300 md:block select-none">›</span>
            )}
            {/* Stage header */}
            <div className={`flex items-center gap-1.5 rounded-none border-b-2 ${sm.border} px-2 py-1.5 mb-2`}>
              <Icon className={`h-3.5 w-3.5 shrink-0 ${sm.color}`} />
              <span className={`font-barlow text-[11px] font-bold uppercase tracking-wide ${sm.color}`}>{s.label}</span>
              <span className="ml-auto font-barlow-condensed text-sm font-bold text-neutral-400">{labFiles.length}</span>
            </div>
            {/* hint */}
            <p className="font-ibm text-[10px] text-neutral-400 leading-snug mb-2 px-0.5">{s.hint}</p>
            {/* cards */}
            <div className="space-y-2">
              {labFiles.map((f) => (
                <PipelineCard key={f.asset_id} f={f} onApprove={onApprove} onReject={onReject} />
              ))}
              {labFiles.length === 0 && (
                <p className="py-4 text-center font-ibm text-[10px] text-neutral-300 border border-dashed border-neutral-200 rounded-none">— trống —</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ─── Main Component ─── */
export default function IscmCore() {
  const [files, setFiles] = useState(CORE_FILES);
  const [links, setLinks] = useState(EGRESS_LINKS);
  const [selectedLab, setSelectedLab] = useState(LABS[0].code);
  const [catalogLabFilter, setCatalogLabFilter] = useState(ALL_CODE);

  /* Actions */
  const approve = (id) =>
    setFiles((prev) => prev.map((f) => f.asset_id === id
      ? { ...f, stage: 'etl', etl_step: f.source_crs ? 'GeoPandas: đang ép WGS84 → VN2000…' : 'Pandas: đang chuẩn hóa UTF-8, khử dòng trống…' }
      : f));
  const reject = (id) =>
    setFiles((prev) => prev.map((f) => f.asset_id === id
      ? { ...f, stage: 'rejected', reject_reason: 'Lãnh đạo Lab từ chối đưa vào xử lý' }
      : f));
  const issueLink = (assetId) => {
    const token = Math.random().toString(16).slice(2, 6) + '…' + Math.random().toString(16).slice(2, 6);
    setLinks((prev) => [{
      id: `lnk-${Date.now()}`, asset_id: assetId, token,
      issued: '2026-07-08 ' + new Date().toTimeString().slice(0, 5),
      expires: '2026-07-09 ' + new Date().toTimeString().slice(0, 5),
      to: 'Đối tác ngoài (theo yêu cầu)',
    }, ...prev]);
  };

  /* Derived stats */
  const pipelineFiles   = files.filter((f) => !['stored', 'rejected'].includes(f.stage));
  const pendingFiles    = files.filter((f) => f.stage === 'pending');
  const etlFiles        = files.filter((f) => f.stage === 'etl');
  const storedFiles     = files.filter((f) => f.stage === 'stored');
  const rejectedFiles   = files.filter((f) => f.stage === 'rejected');

  /* Catalog data */
  const catalogRows = storedFiles.filter(
    (f) => catalogLabFilter === ALL_CODE || f.lab_code === catalogLabFilter
  );

  /* Per-lab pipeline file counts (non-stored, non-rejected) */
  const labCounts = useMemo(() => {
    const counts = {};
    LABS.forEach((l) => { counts[l.code] = 0; });
    pipelineFiles.forEach((f) => { if (counts[f.lab_code] !== undefined) counts[f.lab_code]++; });
    return counts;
  }, [pipelineFiles]);

  const selectedLabName = LABS.find((l) => l.code === selectedLab)?.name ?? selectedLab;

  return (
    <div className="w-full space-y-5">

      {/* ── Header ── */}
      <header className="flex flex-wrap items-start justify-between gap-3 border-l-4 border-iscm-crimson pl-4 py-1">
        <div>
          <h1 className="flex items-center gap-2 font-barlow text-3xl font-extrabold uppercase tracking-wider text-iscm-charcoal">
            <DatabaseZap className="h-6 w-6 text-iscm-crimson" /> ISCM CORE
          </h1>
          <p className="mt-1 font-ibm text-xs uppercase tracking-wider text-gray-500">
            Trục hạ tầng &amp; Tổng kho dữ liệu đô thị · Đề án 2 · UEH Cloud
          </p>
        </div>
        <span className="rounded-none bg-iscm-crimson px-3 py-1.5 font-barlow text-[10px] font-bold uppercase tracking-widest text-white">
          Thí điểm: Public Space Lab — Atlas HCMC
        </span>
      </header>

      {/* ── Zone 1: Stats Bar ── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        <StatCard label="Trong pipeline" value={pipelineFiles.length} sub="đang xử lý" Icon={Package} color="text-iscm-charcoal" />
        <StatCard label="Chờ duyệt" value={pendingFiles.length} sub="cần hành động" Icon={FileWarning} color="text-violet-700" bg="bg-violet-50" />
        <StatCard label="Đang ETL" value={etlFiles.length} sub="Pandas / GeoPandas" Icon={Cog} color="text-blue-700" bg="bg-blue-50" />
        <StatCard label="Đã lưu kho" value={storedFiles.length} sub="Data Lake + PostGIS" Icon={Warehouse} color="text-emerald-700" bg="bg-emerald-50" />
        <StatCard label="Cách ly / Từ chối" value={rejectedFiles.length} sub="sandbox quarantine" Icon={ShieldAlert} color="text-red-700" bg="bg-red-50" />
      </div>

      {/* ── Zone 2: Lab Sidebar + Pipeline ── */}
      <section className="glass-card overflow-hidden p-0">
        <div className="flex border-b border-neutral-200 bg-neutral-900 px-4 py-2.5 gap-2 items-center">
          <DatabaseZap className="h-4 w-4 text-iscm-crimson shrink-0" />
          <span className="font-barlow text-xs font-bold uppercase tracking-widest text-white">Đường ống dữ liệu (Four-Tier Pipeline)</span>
        </div>
        <div className="flex divide-x divide-neutral-200">

          {/* Left: Lab selector */}
          <aside className="w-48 shrink-0 bg-white">
            <div className="px-3 py-2 border-b border-neutral-100">
              <span className="font-barlow text-[10px] font-bold uppercase tracking-wider text-neutral-400">Labs</span>
            </div>
            <ul className="divide-y divide-neutral-100">
              {LABS.map((lab) => {
                const count = labCounts[lab.code] ?? 0;
                const active = selectedLab === lab.code;
                return (
                  <li key={lab.code}>
                    <button
                      onClick={() => setSelectedLab(lab.code)}
                      className={`w-full text-left px-3 py-2.5 flex items-start justify-between gap-2 transition-colors ${
                        active
                          ? 'bg-iscm-crimson text-white'
                          : 'text-neutral-800 hover:bg-neutral-50'
                      }`}
                    >
                      <span className="font-ibm text-xs font-semibold leading-snug">{lab.name}</span>
                      {count > 0 && (
                        <span className={`shrink-0 mt-0.5 rounded-full px-1.5 py-0.5 font-barlow-condensed text-[10px] font-bold ${
                          active ? 'bg-white/20 text-white' : 'bg-iscm-crimson text-white'
                        }`}>
                          {count}
                        </span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </aside>

          {/* Right: Pipeline for selected lab */}
          <div className="flex-1 min-w-0 p-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="font-barlow text-sm font-bold text-iscm-charcoal uppercase tracking-wide">{selectedLabName}</span>
              <span className="font-ibm text-xs text-neutral-400">— pipeline hiện tại</span>
            </div>
            <LabPipeline
              labCode={selectedLab}
              files={files}
              onApprove={approve}
              onReject={reject}
            />
          </div>
        </div>

        {/* Rejected/quarantined alert */}
        {rejectedFiles.length > 0 && (
          <div className="border-t border-red-200 bg-red-50 px-4 py-2.5 flex items-start gap-2">
            <ShieldAlert className="h-4 w-4 text-red-700 shrink-0 mt-0.5" />
            <div>
              <span className="font-barlow text-xs font-bold text-red-700 uppercase tracking-wide">Cách ly tại Sandbox: </span>
              <span className="font-ibm text-xs text-red-600">
                {rejectedFiles.map((f) => `${f.file_name} — ${f.reject_reason}`).join(' · ')}
              </span>
            </div>
          </div>
        )}
      </section>

      {/* ── Zone 3: Data Catalog ── */}
      <section className="glass-card p-0 overflow-hidden">
        {/* Catalog header */}
        <div className="flex items-center justify-between border-b border-neutral-200 bg-neutral-900 px-4 py-2.5">
          <div className="flex items-center gap-2">
            <Warehouse className="h-4 w-4 text-iscm-crimson shrink-0" />
            <span className="font-barlow text-xs font-bold uppercase tracking-widest text-white">
              Danh mục tài sản — <code className="font-barlow-condensed text-emerald-400">iscm_data_catalog</code>
            </span>
          </div>
          {/* Lab filter */}
          <div className="flex items-center gap-1.5">
            <Filter className="h-3 w-3 text-neutral-400" />
            <select
              value={catalogLabFilter}
              onChange={(e) => setCatalogLabFilter(e.target.value)}
              className="rounded-none border border-neutral-600 bg-neutral-800 px-2 py-1 font-ibm text-[11px] text-white focus:outline-none focus:border-iscm-crimson"
            >
              <option value={ALL_CODE}>All Labs</option>
              {LABS.map((l) => (
                <option key={l.code} value={l.code}>{l.name}</option>
              ))}
            </select>
          </div>
        </div>

        <p className="px-4 py-2 font-ibm text-[11px] text-gray-500 border-b border-neutral-100 bg-neutral-50">
          Kho tổng sau ETL · Dữ liệu không gian đã ép về VN2000 (EPSG:5899) · Phiên bản hậu tố _v2_YYYYMMDD
        </p>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-left">
            <thead>
              <tr className="bg-iscm-charcoal font-barlow-condensed text-[11px] font-bold uppercase tracking-wider text-white">
                <th className="px-4 py-2.5">Asset</th>
                <th className="px-4 py-2.5">Lab</th>
                <th className="px-4 py-2.5">Dự án</th>
                <th className="px-4 py-2.5">Loại</th>
                <th className="px-4 py-2.5">CRS</th>
                <th className="px-4 py-2.5">Features</th>
                <th className="px-4 py-2.5">Bảo mật</th>
                <th className="px-4 py-2.5">Chia sẻ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-ibm text-xs">
              {catalogRows.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-neutral-400 font-ibm">
                    Không có tài sản nào trong kho tổng.
                  </td>
                </tr>
              )}
              {catalogRows.map((f, i) => {
                const activeLink = links.find((l) => l.asset_id === f.asset_id);
                return (
                  <tr key={f.asset_id} className={`${i % 2 ? 'bg-gray-50/60' : 'bg-white'} hover:bg-iscm-crimson/5 transition-colors`}>
                    {/* Asset */}
                    <td className="max-w-[220px] px-4 py-2.5">
                      <span className="block truncate font-semibold text-iscm-charcoal" title={f.file_name}>{f.file_name}</span>
                      <span className="font-barlow-condensed text-[10px] text-gray-400">
                        {f.asset_id} · {f.uploaded_by}{f.version ? ` · ${f.version}` : ''}
                      </span>
                    </td>
                    {/* Lab */}
                    <td className="whitespace-nowrap px-4 py-2.5">
                      <span className="rounded-none border border-iscm-crimson/30 bg-iscm-crimson/5 px-1.5 py-0.5 font-barlow-condensed text-[10px] font-bold text-iscm-crimson">
                        {f.lab_code}
                      </span>
                    </td>
                    {/* Project */}
                    <td className="max-w-[160px] truncate px-4 py-2.5 text-gray-600">
                      {projectIndex[f.project_id]?.name ?? '—'}
                    </td>
                    {/* Type */}
                    <td className="whitespace-nowrap px-4 py-2.5">
                      <span className={`rounded border px-1.5 py-0.5 font-barlow-condensed text-[10px] font-bold ${TYPE_TONE[f.file_type] ?? 'text-gray-500 bg-gray-50 border-gray-200'}`}>
                        {f.file_type}
                      </span>
                    </td>
                    {/* CRS */}
                    <td className="whitespace-nowrap px-4 py-2.5">
                      {f.source_crs ? (
                        <span className="inline-flex items-center gap-1 font-barlow-condensed text-[10px]">
                          <MapIcon className="h-3 w-3 text-gray-400" />
                          <span className="text-gray-400">{f.source_crs}</span>
                          <span className="text-neutral-300 mx-0.5">→</span>
                          <span className="font-bold text-emerald-700">{f.target_crs}</span>
                        </span>
                      ) : <span className="text-gray-300">—</span>}
                    </td>
                    {/* Features */}
                    <td className="px-4 py-2.5 font-barlow-condensed text-neutral-500">
                      {f.total_features > 0 ? f.total_features.toLocaleString() : '—'}
                    </td>
                    {/* Privacy */}
                    <td className="px-4 py-2.5">
                      <span className={`inline-block whitespace-nowrap rounded-full border px-2 py-0.5 text-[10px] font-semibold ${PRIVACY_STYLE[f.privacy_status]}`}>
                        {f.privacy_status}
                      </span>
                    </td>
                    {/* Share */}
                    <td className="px-4 py-2.5">
                      <div className="flex flex-col gap-1">
                        {f.privacy_status === 'Confidential' ? (
                          <button
                            onClick={() => issueLink(f.asset_id)}
                            className="inline-flex items-center gap-1 rounded-none bg-iscm-cta px-2 py-1 font-ibm text-[10px] font-semibold text-white hover:bg-iscm-charcoal transition-colors"
                            title="Link mã hóa tự hủy 24h — bắt buộc qua API"
                          >
                            <LockKeyhole className="h-3 w-3" /> Link 24h
                          </button>
                        ) : (
                          <button
                            onClick={() => issueLink(f.asset_id)}
                            className="inline-flex items-center gap-1 rounded-none border border-neutral-300 px-2 py-1 font-ibm text-[10px] font-semibold text-iscm-charcoal hover:border-iscm-crimson hover:text-iscm-crimson transition-colors"
                          >
                            <Link2 className="h-3 w-3" /> Cấp link
                          </button>
                        )}
                        {/* Inline active link */}
                        {activeLink && (
                          <div className="rounded-none border border-amber-200 bg-amber-50 px-1.5 py-1">
                            <p className="font-ibm text-[9px] text-amber-700 break-all leading-snug">
                              …/egress/<span className="font-bold">{activeLink.token}</span>
                            </p>
                            <div className="flex items-center justify-between mt-0.5">
                              <span className="font-ibm text-[9px] text-amber-600">{activeLink.to}</span>
                              <span className="font-barlow-condensed text-[9px] text-red-600 font-bold flex items-center gap-0.5">
                                <Timer className="h-2.5 w-2.5" /> {activeLink.expires}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Egress summary footer */}
        {links.length > 0 && (
          <div className="border-t border-amber-200 bg-amber-50 px-4 py-2.5 flex items-center gap-2">
            <Timer className="h-4 w-4 text-amber-600 shrink-0" />
            <span className="font-ibm text-xs text-amber-700">
              <strong>{links.length}</strong> link chia sẻ đang hoạt động —
              tất cả tự hủy sau 24h · Confidential files bắt buộc qua trục API.
            </span>
          </div>
        )}
      </section>
    </div>
  );
}

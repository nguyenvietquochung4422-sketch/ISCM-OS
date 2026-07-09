import { useState, useEffect, useMemo, useRef } from 'react';
import {
  Database, Server, HardDrive, ShieldCheck, ShieldAlert, ShieldX,
  AlertTriangle, CheckCircle2, Clock, Filter, Search, Download,
  Lock, Globe2, Wifi, FileSpreadsheet, Layers, Satellite, Activity,
  ChevronDown, X, Copy, ExternalLink, Info, Play, UploadCloud,
  FileWarning, Check, ArrowRight, Terminal, BarChart3, Zap,
  Package, Eye, Radio, FlaskConical, Microscope, Wind, Cpu, Map,
  SlidersHorizontal, RefreshCw, AlertCircle, Inbox
} from 'lucide-react';

// ─────────────────────────────────────────────────────────────
// MASTER DATA CATALOG — 5 PRODUCTION ASSET ROWS
// ─────────────────────────────────────────────────────────────
const MASTER_ASSETS = [
  {
    id: 'PSA-Q1-2026-0002',
    name: 'District 1 Sidewalk Survey Data — Phase 2',
    nameVi: 'Dữ liệu khảo sát Vỉa hè Quận 1 — Giai đoạn 2',
    sourceLab: 'Public Space Living Lab',
    sourceLabShort: 'PS Lab',
    sourceColor: 'rose',
    typeTag: 'SURVEY (Excel)',
    typeIcon: FileSpreadsheet,
    typeColor: 'violet',
    crs: 'N/A (Tabular attributes data)',
    geoScope: 'HCMC District 1 (Hồ Con Rùa Area)',
    privacy: 'Internal_Open',
    privacyLevel: 'internal',
    egress: 'download',
    size: '8.4 MB',
    records: '2,847 rows',
    updatedAt: '2026-07-04',
    category: 'Survey Fields (Excel/CSV)',
  },
  {
    id: 'DDU-LST-2026-0012',
    name: 'HCMC Surface Temperature Map (LST Analysis from GEE)',
    nameVi: 'Bản đồ Nhiệt độ bề mặt TPHCM (Phân tích LST từ GEE)',
    sourceLab: 'DDUD / Eco-Cultural Corridor',
    sourceLabShort: 'DDUD',
    sourceColor: 'orange',
    typeTag: 'RASTER (GeoTIFF)',
    typeIcon: Satellite,
    typeColor: 'amber',
    crs: "EPSG:5899 (VN2000 / KTT 105°00')",
    geoScope: 'HCMC (Metropolitan)',
    privacy: 'Internal_Open',
    privacyLevel: 'internal',
    egress: 'download-preview',
    size: '245.6 MB',
    records: '30m resolution raster',
    updatedAt: '2026-06-18',
    category: 'Remote Sensing (Raster/GEE Tiles)',
  },
  {
    id: 'HUE-CAD-2026-0044',
    name: 'Hue Eco-Cultural Corridor Architectural Master Plan',
    nameVi: 'Quy hoạch tổng thể Hành lang Sinh thái-Văn hóa Huế',
    sourceLab: 'Public Space Living Lab',
    sourceLabShort: 'PS Lab',
    sourceColor: 'rose',
    typeTag: 'CAD (AutoCAD)',
    typeIcon: Layers,
    typeColor: 'blue',
    crs: "VN2000 / KTT 107°30'",
    geoScope: 'Thừa Thiên Huế (Heritage Zone)',
    privacy: 'Confidential',
    privacyLevel: 'confidential',
    egress: 'request',
    size: '1.2 GB',
    records: '44 CAD sheets',
    updatedAt: '2026-05-30',
    category: 'Spatial Vectors (GIS/CAD/Drone)',
  },
  {
    id: 'NZL-AQI-2026-0089',
    name: 'ISCM Air Quality Monitoring Hub — Live Feed',
    nameVi: 'Trung tâm Quan trắc Không khí ISCM — Luồng thời gian thực',
    sourceLab: 'Net Zero Open Lab',
    sourceLabShort: 'NZ Lab',
    sourceColor: 'emerald',
    typeTag: 'SENSOR (IoT)',
    typeIcon: Radio,
    typeColor: 'slate',
    crs: 'EPSG:4326 (WGS-84)',
    geoScope: 'HCMC (Metropolitan)',
    privacy: 'Public_Open',
    privacyLevel: 'public',
    egress: 'stream',
    size: 'Live stream',
    records: '6 sensor nodes',
    updatedAt: 'Real-time',
    category: 'Sensor Networks (Real-time IoT/CCTV)',
  },
  {
    id: 'MS-LID-2026-0031',
    name: 'Hồ Con Rùa 3D Terrestrial LiDAR Point Cloud Scan',
    nameVi: 'Quét 3D LiDAR Mặt đất Hồ Con Rùa',
    sourceLab: 'MakerSpace',
    sourceLabShort: 'MakerSpace',
    sourceColor: 'indigo',
    typeTag: '3D CLOUD (LAS)',
    typeIcon: Package,
    typeColor: 'teal',
    crs: 'EPSG:5899 (VN2000)',
    geoScope: 'HCMC District 1 (Hồ Con Rùa Area)',
    privacy: 'Confidential',
    privacyLevel: 'confidential',
    egress: 'lab-only',
    size: '38.7 GB',
    records: '420M point cloud',
    updatedAt: '2026-04-12',
    category: 'Spatial Vectors (GIS/CAD/Drone)',
  },
];

// ─────────────────────────────────────────────────────────────
// STAGED INGESTION BUFFER FILES
// ─────────────────────────────────────────────────────────────
const STAGED_FILES = [
  {
    id: 'stg-01',
    filename: 'sidewalk_survey_q2_2026.xlsx',
    uploader: 'Nguyen Minh Huy (Intern)',
    uploadedAt: '2026-07-09 14:22',
    size: '4.1 MB',
    script: 'metadata_check.py',
    crsDetected: 'N/A (Tabular)',
    crsExpected: 'EPSG:5899',
    status: 'ready',
    issues: [],
  },
  {
    id: 'stg-02',
    filename: 'heritage_layer_v3_draft.geojson',
    uploader: 'Truong Thanh Dat (Intern)',
    uploadedAt: '2026-07-09 13:55',
    size: '22.8 MB',
    script: 'crs_validator.py',
    crsDetected: 'EPSG:4326 (WGS-84)',
    crsExpected: 'EPSG:5899',
    status: 'warning',
    issues: ['CRS mismatch: detected EPSG:4326, required EPSG:5899', 'Missing field: project_id, data_steward'],
  },
  {
    id: 'stg-03',
    filename: 'iscm_aqi_sensor_raw_2026.csv',
    uploader: 'Hoàng Trương Tiến Đạt (Intern)',
    uploadedAt: '2026-07-09 15:01',
    size: '1.7 MB',
    script: 'crs_autodetect.py',
    crsDetected: null,
    crsExpected: 'EPSG:5899',
    status: 'processing',
    issues: [],
  },
];

// ─────────────────────────────────────────────────────────────
// FILTER OPTIONS
// ─────────────────────────────────────────────────────────────
const FILTER_LABS = ['All', 'Public Space Living Lab', 'Eco-Cultural Corridor (Hue)', 'Net Zero Open Lab', 'Smart Mobility Lab', 'MakerSpace'];
const FILTER_GEO = ['All', 'HCMC (Metropolitan)', 'HCMC District 1 (Hồ Con Rùa Area)', 'Thừa Thiên Huế (Heritage Zone)', 'Bến Tre Province (Coconut Material Hub)'];
const FILTER_TYPE = ['All', 'Survey Fields (Excel/CSV)', 'Spatial Vectors (GIS/CAD/Drone)', 'Remote Sensing (Raster/GEE Tiles)', 'Sensor Networks (Real-time IoT/CCTV)'];
const FILTER_PRIVACY = ['All', 'Public Open', 'Internal Open', 'Confidential'];

// ─────────────────────────────────────────────────────────────
// APPROVAL QUEUE (for modal on row 3)
// ─────────────────────────────────────────────────────────────
const APPROVAL_QUEUE = [
  { requester: 'Dr. Lan Ngoc Hoang', institution: 'UEH — Faculty of Architecture', purpose: 'Urban heritage corridor documentation for research publication Vol. 3.', date: '2026-07-08', status: 'PENDING DIRECTOR' },
  { requester: 'Christopher Han', institution: 'External — National University of Singapore', purpose: 'Cross-border climate resilience study: Hue coastal urban morphology.', date: '2026-07-07', status: 'UNDER REVIEW' },
  { requester: 'Sandhya Rao, M.Arch', institution: 'UEH — ISCM Research Unit', purpose: 'Comparison of heritage preservation strategies — CAD geometry analysis.', date: '2026-07-06', status: 'APPROVED', token: 'CAD-ACCESS-3F9A1' },
];

// ─────────────────────────────────────────────────────────────
// HELPER: Badge colors by type
// ─────────────────────────────────────────────────────────────
function TypeBadge({ tag, color }) {
  const styles = {
    violet: 'bg-violet-50 text-violet-700 border-violet-200',
    amber: 'bg-amber-50 text-amber-700 border-amber-200',
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    slate: 'bg-slate-100 text-slate-700 border-slate-300',
    teal: 'bg-teal-50 text-teal-700 border-teal-200',
  };
  return (
    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 text-[9.5px] font-bold uppercase tracking-wider border font-mono ${styles[color] || styles.slate}`}>
      {tag}
    </span>
  );
}

function LabBadge({ name, color }) {
  const styles = {
    rose: 'bg-rose-50 text-rose-700 border-rose-200',
    orange: 'bg-orange-50 text-orange-700 border-orange-200',
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    indigo: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
  };
  return (
    <span className={`inline-flex items-center px-1.5 py-0.5 text-[9.5px] font-bold uppercase tracking-wide border ${styles[color] || styles.blue}`}>
      {name}
    </span>
  );
}

function PrivacyBadge({ level }) {
  if (level === 'public') return (
    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[9.5px] font-bold uppercase border border-blue-400 text-blue-600 bg-blue-50">
      <Globe2 className="h-2.5 w-2.5" /> PUBLIC OPEN
    </span>
  );
  if (level === 'internal') return (
    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[9.5px] font-bold uppercase border border-emerald-400 text-emerald-700 bg-emerald-50">
      <ShieldCheck className="h-2.5 w-2.5" /> INTERNAL OPEN
    </span>
  );
  return (
    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[9.5px] font-bold uppercase border border-red-400 text-red-700 bg-red-50">
      <Lock className="h-2.5 w-2.5" /> CONFIDENTIAL
    </span>
  );
}

// ─────────────────────────────────────────────────────────────
// INGESTION BUFFER DRAWER
// ─────────────────────────────────────────────────────────────
function IngestionBufferDrawer({ open, onClose }) {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    if (!open) return;
    const id = setInterval(() => setTick(t => t + 1), 900);
    return () => clearInterval(id);
  }, [open]);

  const dots = '.'.repeat((tick % 3) + 1);

  return (
    <>
      {/* backdrop */}
      <div
        className={`fixed inset-0 bg-black/30 z-40 transition-opacity duration-300 ${open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />
      {/* drawer */}
      <div className={`fixed top-0 right-0 h-full w-full max-w-[520px] bg-white border-l border-neutral-200 shadow-2xl z-50 flex flex-col transform transition-transform duration-300 ease-in-out ${open ? 'translate-x-0' : 'translate-x-full'}`}>
        {/* header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-200 bg-amber-50 shrink-0">
          <div className="flex items-center gap-2">
            <UploadCloud className="h-4 w-4 text-amber-600" />
            <span className="text-xs font-black uppercase tracking-widest text-amber-800">Pending Ingestion Buffer</span>
            <span className="bg-amber-500 text-white text-[9px] font-bold px-1.5 py-0.5 ml-1">{STAGED_FILES.length} STAGED</span>
          </div>
          <button onClick={onClose} className="text-neutral-400 hover:text-neutral-700 transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <p className="text-[10px] text-neutral-500 leading-relaxed border-l-2 border-amber-400 pl-2">
            Validation engine is actively running metadata and CRS checks on staged files. Push to Core only after all validations pass. Flagged files must be returned to contributor for correction.
          </p>

          {STAGED_FILES.map((file) => (
            <div key={file.id} className={`border p-4 space-y-3 ${
              file.status === 'ready' ? 'border-emerald-200 bg-emerald-50/30' :
              file.status === 'warning' ? 'border-amber-300 bg-amber-50/40' :
              'border-neutral-200 bg-neutral-50/50'
            }`}>
              {/* file header */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-mono text-xs font-bold text-neutral-900">{file.filename}</p>
                  <p className="text-[10px] text-neutral-500 mt-0.5">{file.uploader} · {file.uploadedAt} · {file.size}</p>
                </div>
                {file.status === 'ready' && (
                  <span className="flex items-center gap-1 text-[9px] font-black uppercase tracking-wide text-emerald-700 bg-emerald-100 border border-emerald-300 px-2 py-0.5 shrink-0">
                    <CheckCircle2 className="h-3 w-3" /> READY TO CORE
                  </span>
                )}
                {file.status === 'warning' && (
                  <span className="flex items-center gap-1 text-[9px] font-black uppercase tracking-wide text-amber-800 bg-amber-100 border border-amber-400 px-2 py-0.5 shrink-0">
                    <AlertTriangle className="h-3 w-3" /> MISSING METADATA
                  </span>
                )}
                {file.status === 'processing' && (
                  <span className="flex items-center gap-1 text-[9px] font-black uppercase tracking-wide text-neutral-600 bg-neutral-100 border border-neutral-300 px-2 py-0.5 shrink-0 animate-pulse">
                    <RefreshCw className="h-3 w-3 animate-spin" /> PROCESSING{dots}
                  </span>
                )}
              </div>

              {/* validation script line */}
              <div className="bg-neutral-900 px-3 py-2 font-mono text-[10px] leading-loose">
                <span className="text-neutral-500">$ python3 </span>
                <span className="text-emerald-400">{file.script}</span>
                <span className="text-neutral-500"> --input </span>
                <span className="text-blue-300">"{file.filename}"</span>
                {file.status === 'processing' && (
                  <span className="block text-yellow-400 mt-0.5">↳ Auto-detecting CRS{dots}</span>
                )}
                {file.status === 'ready' && (
                  <span className="block text-emerald-400 mt-0.5">✓ Metadata complete · CRS accepted · Ready for ingestion</span>
                )}
                {file.status === 'warning' && (
                  <>
                    <span className="block text-red-400 mt-0.5">✗ CRS: detected {file.crsDetected} → expected {file.crsExpected}</span>
                    <span className="block text-amber-400">⚠ Missing required metadata fields</span>
                  </>
                )}
              </div>

              {/* issues list */}
              {file.issues.length > 0 && (
                <ul className="space-y-1">
                  {file.issues.map((issue, i) => (
                    <li key={i} className="flex items-start gap-1.5 text-[10px] text-amber-800">
                      <AlertCircle className="h-3 w-3 shrink-0 mt-0.5 text-amber-500" />
                      {issue}
                    </li>
                  ))}
                </ul>
              )}

              {/* action buttons */}
              <div className="flex gap-2 pt-1 border-t border-neutral-200">
                <button
                  disabled={file.status !== 'ready'}
                  className={`flex-1 flex items-center justify-center gap-1 text-[10px] font-bold uppercase tracking-wide py-1.5 transition-colors ${
                    file.status === 'ready'
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      : 'bg-neutral-100 text-neutral-400 cursor-not-allowed'
                  }`}
                >
                  <ArrowRight className="h-3 w-3" /> Push to Core
                </button>
                <button
                  disabled={file.status === 'processing'}
                  className={`flex-1 flex items-center justify-center gap-1 text-[10px] font-bold uppercase tracking-wide py-1.5 border transition-colors ${
                    file.status === 'processing'
                      ? 'border-neutral-200 text-neutral-400 cursor-not-allowed'
                      : 'border-neutral-300 text-neutral-700 hover:border-red-400 hover:text-red-700'
                  }`}
                >
                  <X className="h-3 w-3" /> Flag & Return
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="px-5 py-3 border-t border-neutral-200 bg-neutral-50 text-[10px] text-neutral-400 shrink-0">
          Validation engine: <span className="font-mono text-neutral-600">iscm_validator v0.8.3</span> · CRS reference: EPSG:5899 standard
        </div>
      </div>
    </>
  );
}

// ─────────────────────────────────────────────────────────────
// EGRESS MODALS / OVERLAYS
// ─────────────────────────────────────────────────────────────

function DownloadToast({ asset, onClose }) {
  const [phase, setPhase] = useState('generating'); // 'generating' | 'ready'
  useEffect(() => {
    const t = setTimeout(() => setPhase('ready'), 1400);
    return () => clearTimeout(t);
  }, []);
  return (
    <div className="fixed bottom-5 right-6 z-50 w-80 bg-white border border-neutral-200 shadow-xl p-4 space-y-2.5 animate-in slide-in-from-bottom-4 duration-300">
      <div className="flex items-center justify-between">
        <span className="text-xs font-black uppercase tracking-widest text-neutral-700">Secure Download</span>
        <button onClick={onClose} className="text-neutral-400 hover:text-neutral-600"><X className="h-3.5 w-3.5" /></button>
      </div>
      <p className="text-[10px] text-neutral-500 font-mono truncate">{asset.id}</p>
      {phase === 'generating' ? (
        <div className="flex items-center gap-2 text-xs text-neutral-600">
          <RefreshCw className="h-3.5 w-3.5 animate-spin text-[#5467a6]" />
          Generating time-limited download link…
        </div>
      ) : (
        <>
          <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-2.5 py-1.5">
            <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
            <span className="text-[10px] font-bold text-emerald-700">Link generated — expires in 15 min</span>
          </div>
          <div className="flex items-center gap-1.5 bg-neutral-50 border border-neutral-200 px-2 py-1">
            <span className="font-mono text-[9px] text-neutral-600 flex-1 truncate">
              https://storage.ueh.edu.vn/iscm/egress/{asset.id.toLowerCase()}.xlsx?token=DL9F2A…
            </span>
            <button className="shrink-0 text-neutral-400 hover:text-neutral-700 transition-colors">
              <Copy className="h-3 w-3" />
            </button>
          </div>
          <p className="text-[9px] text-neutral-400">File: {asset.size} · Format: .xlsx / .csv</p>
        </>
      )}
    </div>
  );
}

function RasterPreviewModal({ asset, onClose }) {
  const [phase, setPhase] = useState('fetching'); // 'fetching' | 'ready'
  useEffect(() => {
    const t = setTimeout(() => setPhase('ready'), 1800);
    return () => clearTimeout(t);
  }, []);
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-6">
      <div className="bg-white w-full max-w-lg border border-neutral-200 shadow-2xl space-y-0">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-neutral-200 bg-neutral-50">
          <div className="flex items-center gap-2">
            <Satellite className="h-4 w-4 text-amber-600" />
            <span className="text-xs font-black uppercase tracking-widest text-neutral-700">Raster Asset Download</span>
          </div>
          <button onClick={onClose} className="text-neutral-400 hover:text-neutral-700"><X className="h-4 w-4" /></button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Asset</p>
            <p className="text-sm font-bold text-neutral-800 mt-0.5">{asset.name}</p>
            <p className="font-mono text-[10px] text-neutral-500 mt-0.5">{asset.id} · {asset.crs}</p>
          </div>

          {/* thumbnail preview area */}
          <div className="border border-neutral-200 bg-neutral-900 aspect-video relative overflow-hidden flex items-center justify-center">
            {phase === 'fetching' ? (
              <div className="flex flex-col items-center gap-2 text-neutral-400">
                <RefreshCw className="h-5 w-5 animate-spin text-[#5467a6]" />
                <span className="text-[10px] font-mono">Fetching from Supabase Storage…</span>
              </div>
            ) : (
              <>
                {/* simulated LST color ramp gradient */}
                <div className="absolute inset-0" style={{
                  background: 'radial-gradient(ellipse at 60% 40%, #ff4b2b 0%, #ff9900 25%, #ffe34a 45%, #7bd94a 65%, #2b9af3 85%, #1c3a6e 100%)',
                  opacity: 0.9
                }} />
                {/* simulated noise/texture overlay */}
                <div className="absolute inset-0" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'4\' height=\'4\'%3E%3Crect width=\'4\' height=\'4\' fill=\'none\'/%3E%3Crect width=\'1\' height=\'1\' fill=\'rgba(0,0,0,0.1)\'/%3E%3C/svg%3E")' }} />
                <div className="relative z-10 p-3 bg-black/60 text-[9px] font-mono text-emerald-400 text-center border border-emerald-900/50">
                  <p className="font-bold text-emerald-300">LST PREVIEW — HCMC Metropolitan</p>
                  <p className="text-neutral-400 mt-0.5">30m resolution · GEE-derived · {asset.crs}</p>
                  <div className="flex justify-between mt-2 text-[8px]">
                    <span className="text-blue-400">▮ 24°C</span>
                    <span className="text-yellow-400">▮ 38°C</span>
                    <span className="text-red-400">▮ 52°C</span>
                  </div>
                </div>
              </>
            )}
          </div>

          {phase === 'ready' && (
            <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-3 py-2">
              <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
              <div>
                <p className="text-[10px] font-bold text-emerald-700">GeoTIFF package ready · {asset.size}</p>
                <p className="text-[9px] text-emerald-600">Auto-expires in 30 min · Logged to audit trail</p>
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <button
              disabled={phase === 'fetching'}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-bold uppercase tracking-wider transition-colors ${phase === 'ready' ? 'bg-[#5467a6] hover:bg-[#3d4f8a] text-white' : 'bg-neutral-100 text-neutral-400 cursor-not-allowed'}`}
            >
              <Download className="h-3.5 w-3.5" />
              Download .tif Package
            </button>
            <button onClick={onClose} className="px-4 border border-neutral-200 text-neutral-600 text-xs font-bold hover:border-neutral-400 transition-colors">Cancel</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function AccessRequestModal({ asset, onClose }) {
  const [justification, setJustification] = useState('');
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-6">
      <div className="bg-white w-full max-w-xl border border-neutral-200 shadow-2xl">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-red-100 bg-red-50">
          <div className="flex items-center gap-2">
            <Lock className="h-4 w-4 text-red-600" />
            <span className="text-xs font-black uppercase tracking-widest text-red-800">Confidential Asset — Access Request</span>
          </div>
          <button onClick={onClose} className="text-neutral-400 hover:text-neutral-700"><X className="h-4 w-4" /></button>
        </div>
        <div className="p-5 space-y-5">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Locked Asset</p>
            <p className="text-sm font-bold text-neutral-800 mt-0.5">{asset.name}</p>
            <p className="font-mono text-[10px] text-neutral-500 mt-0.5">{asset.id} · Raw .dwg locked · Director authorization required</p>
          </div>

          {/* approval queue */}
          <div>
            <div className="flex items-center gap-1.5 mb-2.5">
              <Clock className="h-3.5 w-3.5 text-neutral-500" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">Active Approval Queue</span>
              <span className="bg-neutral-800 text-white text-[8px] font-bold px-1.5 py-0.5">{APPROVAL_QUEUE.length}</span>
            </div>
            <div className="space-y-2">
              {APPROVAL_QUEUE.map((item, i) => (
                <div key={i} className={`border p-3 text-xs ${item.status === 'APPROVED' ? 'border-emerald-200 bg-emerald-50/50' : item.status === 'UNDER REVIEW' ? 'border-blue-200 bg-blue-50/30' : 'border-amber-200 bg-amber-50/30'}`}>
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-bold text-neutral-800">{item.requester}</span>
                    <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 border ${
                      item.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700 border-emerald-300' :
                      item.status === 'UNDER REVIEW' ? 'bg-blue-100 text-blue-700 border-blue-300' :
                      'bg-amber-100 text-amber-800 border-amber-300'
                    }`}>{item.status}</span>
                  </div>
                  <p className="text-[10px] text-neutral-500">{item.institution}</p>
                  <p className="text-[10px] text-neutral-600 mt-1 italic">"{item.purpose}"</p>
                  {item.token && <p className="font-mono text-[9px] text-emerald-600 mt-1">Token: {item.token}</p>}
                  <p className="text-[9px] text-neutral-400 mt-0.5">Submitted: {item.date}</p>
                </div>
              ))}
            </div>
          </div>

          {/* new request */}
          <div className="border border-neutral-200 p-3 space-y-2 bg-neutral-50">
            <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">Submit New Access Request</p>
            <textarea
              rows={3}
              value={justification}
              onChange={e => setJustification(e.target.value)}
              placeholder="Describe your research purpose and how this data will be used…"
              className="w-full border border-neutral-200 bg-white text-xs p-2 focus:outline-none focus:border-[#5467a6] resize-none placeholder:text-neutral-400"
            />
            <button
              disabled={!justification.trim()}
              className={`w-full py-2 text-xs font-bold uppercase tracking-wider transition-colors ${justification.trim() ? 'bg-[#5467a6] hover:bg-[#3d4f8a] text-white' : 'bg-neutral-100 text-neutral-400 cursor-not-allowed'}`}
            >
              Submit Request — Awaiting Director Authorization
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ApiStreamPanel({ asset, onClose }) {
  const endpointUrl = `https://api.iscm-core.ueh.edu.vn/v1/stream/${asset.id.toLowerCase()}`;
  const exampleJson = `{
  "asset_id": "${asset.id}",
  "timestamp": "2026-07-09T15:18:00Z",
  "nodes": [
    { "id": "NZL-001", "lat": 10.776, "lng": 106.701,
      "pm25": 18.4, "pm10": 32.1, "co2": 412.5,
      "temp_c": 33.2, "humidity": 71 },
    { "id": "NZL-002", "lat": 10.782, "lng": 106.695,
      "pm25": 22.7, "pm10": 41.3, "co2": 408.9 }
  ],
  "crs": "EPSG:4326",
  "update_interval_ms": 5000
}`;
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-6">
      <div className="bg-white w-full max-w-xl border border-neutral-200 shadow-2xl">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-blue-100 bg-blue-50">
          <div className="flex items-center gap-2">
            <Radio className="h-4 w-4 text-blue-600 animate-pulse" />
            <span className="text-xs font-black uppercase tracking-widest text-blue-800">Public API Stream</span>
            <span className="bg-blue-500 text-white text-[8px] font-bold px-1.5 py-0.5 animate-pulse">LIVE</span>
          </div>
          <button onClick={onClose} className="text-neutral-400 hover:text-neutral-700"><X className="h-4 w-4" /></button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Data Feed</p>
            <p className="text-sm font-bold text-neutral-800 mt-0.5">{asset.name}</p>
            <p className="font-mono text-[10px] text-neutral-500 mt-0.5">{asset.id} · {asset.records} · Update: 5s interval</p>
          </div>

          <div className="space-y-2">
            <p className="text-[10px] font-bold uppercase tracking-wide text-neutral-500">Stream Endpoint</p>
            <div className="flex items-center gap-2 bg-neutral-900 px-3 py-2">
              <span className="font-mono text-[10px] text-emerald-400 flex-1 break-all">{endpointUrl}</span>
              <button className="shrink-0 text-neutral-500 hover:text-white transition-colors"><Copy className="h-3.5 w-3.5" /></button>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-bold uppercase tracking-wide text-neutral-500">Live JSON Payload Example</p>
              <span className="flex items-center gap-1 text-[9px] text-emerald-600 font-bold animate-pulse">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 inline-block" /> streaming
              </span>
            </div>
            <pre className="bg-neutral-900 text-[9.5px] font-mono text-emerald-300 p-3 overflow-x-auto leading-relaxed">{exampleJson}</pre>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center">
            {[['Auth', 'Bearer Token (UEH SSO)'], ['Protocol', 'WebSocket / HTTPS'], ['Format', 'JSON Array (GeoJSON)']].map(([k, v]) => (
              <div key={k} className="border border-neutral-200 p-2">
                <p className="text-[9px] uppercase text-neutral-400">{k}</p>
                <p className="text-[9px] font-bold text-neutral-700 mt-0.5">{v}</p>
              </div>
            ))}
          </div>

          <div className="flex items-start gap-2 bg-blue-50 border border-blue-200 p-3 text-[10px] text-blue-700">
            <Info className="h-3.5 w-3.5 shrink-0 mt-0.5 text-blue-500" />
            This stream is injected directly into the smART Hub Living Labs public visualization engine. File download is disabled for this asset. For data archival, contact the Net Zero Lab data steward.
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// EGRESS ACTION BUTTON — per row
// ─────────────────────────────────────────────────────────────
function EgressButton({ asset, onAction }) {
  if (asset.egress === 'download') return (
    <button
      onClick={() => onAction('download', asset)}
      className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[9.5px] font-bold uppercase tracking-wider px-2.5 py-1.5 transition-colors"
    >
      <Download className="h-3 w-3" /> Download
    </button>
  );
  if (asset.egress === 'download-preview') return (
    <button
      onClick={() => onAction('download-preview', asset)}
      className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[9.5px] font-bold uppercase tracking-wider px-2.5 py-1.5 transition-colors"
    >
      <Download className="h-3 w-3" /> Download + Preview
    </button>
  );
  if (asset.egress === 'request') return (
    <button
      onClick={() => onAction('request', asset)}
      className="flex items-center gap-1 bg-amber-500 hover:bg-amber-600 text-white text-[9.5px] font-bold uppercase tracking-wider px-2.5 py-1.5 transition-colors"
    >
      <Lock className="h-3 w-3" /> Request Access
    </button>
  );
  if (asset.egress === 'stream') return (
    <button
      onClick={() => onAction('stream', asset)}
      className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white text-[9.5px] font-bold uppercase tracking-wider px-2.5 py-1.5 transition-colors"
    >
      <Radio className="h-3 w-3 animate-pulse" /> API Stream
    </button>
  );
  // lab-only
  return (
    <span className="flex items-center gap-1 border border-red-300 text-red-700 text-[9.5px] font-bold uppercase tracking-wider px-2 py-1.5 bg-red-50 cursor-default group relative">
      <ShieldX className="h-3 w-3" /> Lab Copy Only
      <span className="absolute bottom-full left-0 mb-1 hidden group-hover:block w-56 bg-neutral-900 text-white text-[9px] px-2.5 py-2 font-normal normal-case tracking-normal leading-relaxed z-10 shadow-xl border border-neutral-700">
        Data size too heavy for cloud tier. Restricted to physical encrypted transfer at MakerSpace Storage Drive #02. Contact Data Admin.
      </span>
    </span>
  );
}

// ─────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────
export default function UrbanDataCore() {
  // Filter state
  const [filterLab, setFilterLab] = useState('All');
  const [filterGeo, setFilterGeo] = useState('All');
  const [filterType, setFilterType] = useState('All');
  const [filterPrivacy, setFilterPrivacy] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // UI state
  const [bufferOpen, setBufferOpen] = useState(false);
  const [activeModal, setActiveModal] = useState(null); // { type, asset }
  const [downloadToast, setDownloadToast] = useState(null);

  // clock
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  // filter logic
  const visibleAssets = useMemo(() => {
    return MASTER_ASSETS.filter(a => {
      // lab filter — partial match
      if (filterLab !== 'All') {
        const labKey = filterLab.toLowerCase();
        if (!a.sourceLab.toLowerCase().includes(labKey.split(' ')[0].toLowerCase())) {
          // more specific match by well-known names
          const labMap = {
            'Public Space Living Lab': ['public space', 'ps lab'],
            'Eco-Cultural Corridor (Hue)': ['ddud', 'eco-cultural', 'hue'],
            'Net Zero Open Lab': ['net zero', 'nz lab'],
            'Smart Mobility Lab': ['mobility'],
            'MakerSpace': ['makerspace'],
          };
          const keys = labMap[filterLab] || [];
          if (!keys.some(k => a.sourceLab.toLowerCase().includes(k))) return false;
        }
      }
      // geo filter
      if (filterGeo !== 'All' && !a.geoScope.includes(filterGeo.split(' (')[0])) return false;
      // type filter
      if (filterType !== 'All' && a.category !== filterType) return false;
      // privacy filter
      if (filterPrivacy === 'Public Open' && a.privacyLevel !== 'public') return false;
      if (filterPrivacy === 'Internal Open' && a.privacyLevel !== 'internal') return false;
      if (filterPrivacy === 'Confidential' && a.privacyLevel !== 'confidential') return false;
      // search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        if (!a.name.toLowerCase().includes(q) && !a.id.toLowerCase().includes(q) && !a.sourceLab.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [filterLab, filterGeo, filterType, filterPrivacy, searchQuery]);

  const clearFilters = () => {
    setFilterLab('All');
    setFilterGeo('All');
    setFilterType('All');
    setFilterPrivacy('All');
    setSearchQuery('');
  };

  const hasActiveFilters = filterLab !== 'All' || filterGeo !== 'All' || filterType !== 'All' || filterPrivacy !== 'All' || searchQuery.trim();

  const handleEgressAction = (type, asset) => {
    if (type === 'download') {
      setDownloadToast(asset);
    } else if (type === 'download-preview') {
      setActiveModal({ type: 'raster-preview', asset });
    } else if (type === 'request') {
      setActiveModal({ type: 'access-request', asset });
    } else if (type === 'stream') {
      setActiveModal({ type: 'api-stream', asset });
    }
  };

  // storage numbers
  const storedGB = 325;
  const totalGB = 500;
  const pct = Math.round((storedGB / totalGB) * 100);

  return (
    <div className="flex flex-col h-full -m-4 lg:-mx-6 lg:-my-5 overflow-hidden">

      {/* ── ZONE 1: SYSTEM HEALTH BAR ── */}
      <div className="shrink-0 bg-[#0f1117] text-white border-b border-neutral-800 px-5 py-3">
        <div className="flex flex-wrap items-center gap-x-8 gap-y-3">

          {/* branding */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="h-7 w-7 bg-[#5467a6] flex items-center justify-center">
              <Database className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-300">ISCM OS — Urban Data Core</p>
              <p className="text-[8px] text-neutral-500 font-mono">v2.1.0 · UEH Cloud · {now.toLocaleTimeString('vi-VN')}</p>
            </div>
          </div>

          {/* storage gauge */}
          <div className="flex items-center gap-3 min-w-[200px]">
            <HardDrive className="h-3.5 w-3.5 text-neutral-400 shrink-0" />
            <div className="flex-1">
              <div className="flex justify-between text-[9px] mb-1">
                <span className="text-neutral-400 font-mono">Storage Health</span>
                <span className="text-neutral-200 font-bold font-mono">{storedGB} GB / {totalGB} GB</span>
              </div>
              <div className="h-1.5 bg-neutral-700 w-full">
                <div
                  className="h-full bg-[#5467a6] transition-all duration-1000"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <p className="text-[8px] text-neutral-500 mt-0.5 font-mono">{pct}% allocated · UEH Cloud Tier-1</p>
            </div>
          </div>

          {/* KPI chips */}
          <div className="flex items-center gap-2 flex-wrap">
            {[
              { label: 'Total Assets', val: '5', icon: Package, color: 'text-neutral-300' },
              { label: 'Verified Active', val: '3', icon: CheckCircle2, color: 'text-emerald-400' },
              { label: 'Pending Validation', val: STAGED_FILES.length, icon: Clock, color: 'text-amber-400' },
              { label: 'Quarantined', val: '1', icon: ShieldAlert, color: 'text-red-400' },
              { label: 'Confidential Locked', val: '2', icon: Lock, color: 'text-red-300' },
            ].map(({ label, val, icon: Icon, color }) => (
              <div key={label} className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-2.5 py-1">
                <Icon className={`h-3 w-3 ${color}`} />
                <span className={`text-[9px] font-bold font-mono ${color}`}>{val}</span>
                <span className="text-[8px] text-neutral-500 uppercase tracking-wide">{label}</span>
              </div>
            ))}
          </div>

          {/* buffer badge */}
          <div className="ml-auto shrink-0">
            <button
              onClick={() => setBufferOpen(true)}
              className="flex items-center gap-1.5 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-[9px] font-black uppercase tracking-widest px-3 py-1.5 transition-colors"
            >
              <Inbox className="h-3 w-3" />
              Ingestion Buffer
              <span className="bg-amber-500 text-white text-[8px] font-bold px-1 py-0.5 rounded-sm">{STAGED_FILES.length}</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── ZONES 2 + 3: SPLIT WORKSPACE ── */}
      <div className="flex flex-1 overflow-hidden">

        {/* ── ZONE 2: LEFT FILTER DOCK ── */}
        <div className="w-64 shrink-0 border-r border-neutral-200 bg-neutral-50 overflow-y-auto flex flex-col">
          <div className="px-4 pt-4 pb-2 border-b border-neutral-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <SlidersHorizontal className="h-3.5 w-3.5 text-neutral-500" />
                <span className="text-[10px] font-black uppercase tracking-widest text-neutral-600">Discovery Filters</span>
              </div>
              {hasActiveFilters && (
                <button onClick={clearFilters} className="text-[9px] text-[#5467a6] hover:underline font-bold uppercase tracking-wide">Clear All</button>
              )}
            </div>
            <div className="mt-2 text-[10px] font-mono text-neutral-500">
              Showing <span className="font-bold text-neutral-800">{visibleAssets.length}</span> of {MASTER_ASSETS.length} assets
            </div>
          </div>

          <div className="flex-1 px-3 py-3 space-y-5">

            {/* FILTER A: Lab Origin */}
            <div>
              <p className="text-[9px] font-black uppercase tracking-widest text-neutral-400 mb-2 flex items-center gap-1">
                <FlaskConical className="h-3 w-3" /> A · Lab Origin
              </p>
              <div className="space-y-0.5">
                {FILTER_LABS.map(opt => (
                  <button
                    key={opt}
                    onClick={() => setFilterLab(opt)}
                    className={`w-full text-left text-[10px] px-2.5 py-1.5 transition-colors font-medium ${
                      filterLab === opt
                        ? 'bg-[#5467a6] text-white font-bold'
                        : 'text-neutral-600 hover:bg-neutral-100'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            {/* FILTER B: Geographic Scope */}
            <div>
              <p className="text-[9px] font-black uppercase tracking-widest text-neutral-400 mb-2 flex items-center gap-1">
                <Map className="h-3 w-3" /> B · Geographic Scope
              </p>
              <div className="space-y-0.5">
                {FILTER_GEO.map(opt => (
                  <button
                    key={opt}
                    onClick={() => setFilterGeo(opt)}
                    className={`w-full text-left text-[10px] px-2.5 py-1.5 transition-colors font-medium ${
                      filterGeo === opt
                        ? 'bg-[#5467a6] text-white font-bold'
                        : 'text-neutral-600 hover:bg-neutral-100'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            {/* FILTER C: Data Category */}
            <div>
              <p className="text-[9px] font-black uppercase tracking-widest text-neutral-400 mb-2 flex items-center gap-1">
                <Layers className="h-3 w-3" /> C · Data Category
              </p>
              <div className="space-y-0.5">
                {FILTER_TYPE.map(opt => (
                  <button
                    key={opt}
                    onClick={() => setFilterType(opt)}
                    className={`w-full text-left text-[10px] px-2.5 py-1.5 transition-colors font-medium ${
                      filterType === opt
                        ? 'bg-[#5467a6] text-white font-bold'
                        : 'text-neutral-600 hover:bg-neutral-100'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            {/* FILTER D: Privacy */}
            <div>
              <p className="text-[9px] font-black uppercase tracking-widest text-neutral-400 mb-2 flex items-center gap-1">
                <ShieldCheck className="h-3 w-3" /> D · Security Classification
              </p>
              <div className="space-y-0.5">
                {FILTER_PRIVACY.map(opt => (
                  <button
                    key={opt}
                    onClick={() => setFilterPrivacy(opt)}
                    className={`w-full text-left text-[10px] px-2.5 py-1.5 transition-colors font-medium ${
                      filterPrivacy === opt
                        ? 'bg-[#5467a6] text-white font-bold'
                        : 'text-neutral-600 hover:bg-neutral-100'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── ZONE 3: MASTER CATALOG WORKSPACE ── */}
        <div className="flex-1 overflow-y-auto flex flex-col bg-white">

          {/* catalog toolbar */}
          <div className="sticky top-0 z-10 bg-white border-b border-neutral-200 px-5 py-3 flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5">
              <Database className="h-4 w-4 text-[#5467a6]" />
              <span className="text-xs font-black uppercase tracking-widest text-neutral-700">Master Data Catalog</span>
            </div>
            <div className="h-4 w-px bg-neutral-200" />

            {/* search */}
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search asset ID, name, lab…"
                className="w-full pl-8 pr-3 py-1.5 border border-neutral-200 text-xs focus:outline-none focus:border-[#5467a6] placeholder:text-neutral-400"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700">
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>

            <div className="ml-auto flex items-center gap-2">
              <span className="text-[10px] font-mono text-neutral-400">
                {visibleAssets.length} / {MASTER_ASSETS.length} assets
              </span>
              <button
                onClick={() => setBufferOpen(true)}
                className="flex items-center gap-1.5 bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-700 text-[9.5px] font-bold uppercase tracking-wider px-2.5 py-1.5 transition-colors"
              >
                <UploadCloud className="h-3.5 w-3.5" />
                Pending Ingestion Buffer
                <span className="bg-amber-500 text-white text-[8px] px-1 py-0.5 font-black">{STAGED_FILES.length}</span>
              </button>
            </div>
          </div>

          {/* table */}
          <div className="flex-1 overflow-x-auto">
            <table className="w-full text-xs border-collapse min-w-[900px]">
              <thead>
                <tr className="bg-neutral-50 border-b border-neutral-200">
                  {['Asset ID', 'Asset Name', 'Source Lab', 'Type Tag', 'CRS', 'Privacy', 'Egress Action'].map(col => (
                    <th key={col} className="text-left py-2.5 px-4 text-[9px] font-black uppercase tracking-widest text-neutral-400 whitespace-nowrap border-b border-neutral-200">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {visibleAssets.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-16 text-neutral-400">
                      <div className="flex flex-col items-center gap-2">
                        <Filter className="h-8 w-8 text-neutral-300" />
                        <p className="text-sm font-bold text-neutral-500">No assets match the selected filters</p>
                        <button onClick={clearFilters} className="text-xs text-[#5467a6] hover:underline mt-1">Clear all filters</button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  visibleAssets.map((asset, idx) => {
                    const Icon = asset.typeIcon;
                    return (
                      <tr
                        key={asset.id}
                        className={`border-b border-neutral-100 hover:bg-neutral-50/80 transition-colors group ${idx % 2 === 0 ? 'bg-white' : 'bg-neutral-50/30'}`}
                      >
                        {/* Asset ID */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-[10px] text-neutral-600 select-all">{asset.id}</span>
                            <button className="opacity-0 group-hover:opacity-100 transition-opacity text-neutral-400 hover:text-neutral-700">
                              <Copy className="h-3 w-3" />
                            </button>
                          </div>
                        </td>

                        {/* Asset Name */}
                        <td className="py-3.5 px-4">
                          <div>
                            <p className="font-bold text-neutral-800 leading-tight">{asset.name}</p>
                            <p className="text-[9px] text-neutral-400 mt-0.5 font-mono">{asset.size} · {asset.records} · Updated {asset.updatedAt}</p>
                          </div>
                        </td>

                        {/* Source Lab */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <LabBadge name={asset.sourceLabShort} color={asset.sourceColor} />
                        </td>

                        {/* Type Tag */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <Icon className="h-3.5 w-3.5 text-neutral-400 shrink-0" />
                            <TypeBadge tag={asset.typeTag} color={asset.typeColor} />
                          </div>
                        </td>

                        {/* CRS */}
                        <td className="py-3.5 px-4">
                          <span className="font-mono text-[9.5px] text-neutral-500 leading-tight">{asset.crs}</span>
                        </td>

                        {/* Privacy */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <PrivacyBadge level={asset.privacyLevel} />
                        </td>

                        {/* Egress Action */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <EgressButton asset={asset} onAction={handleEgressAction} />
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* table footer */}
          <div className="shrink-0 border-t border-neutral-100 bg-neutral-50 px-5 py-2.5 flex items-center justify-between">
            <p className="text-[9.5px] text-neutral-400 font-mono">
              ISCM Urban Data Core · Institutional Data Lakehouse · UEH Cloud Platform
            </p>
            <p className="text-[9.5px] text-neutral-400 font-mono">
              Last sync: {now.toLocaleDateString('vi-VN')} {now.toLocaleTimeString('vi-VN')}
            </p>
          </div>
        </div>
      </div>

      {/* ── INGESTION BUFFER DRAWER ── */}
      <IngestionBufferDrawer open={bufferOpen} onClose={() => setBufferOpen(false)} />

      {/* ── EGRESS MODALS ── */}
      {activeModal?.type === 'raster-preview' && (
        <RasterPreviewModal asset={activeModal.asset} onClose={() => setActiveModal(null)} />
      )}
      {activeModal?.type === 'access-request' && (
        <AccessRequestModal asset={activeModal.asset} onClose={() => setActiveModal(null)} />
      )}
      {activeModal?.type === 'api-stream' && (
        <ApiStreamPanel asset={activeModal.asset} onClose={() => setActiveModal(null)} />
      )}

      {/* ── DOWNLOAD TOAST ── */}
      {downloadToast && (
        <DownloadToast asset={downloadToast} onClose={() => setDownloadToast(null)} />
      )}
    </div>
  );
}

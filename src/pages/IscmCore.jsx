import { useMemo, useState, useEffect } from 'react';
import {
  DatabaseZap, ShieldAlert, Cog, Warehouse, UploadCloud, Check, X, Globe2,
  KeyRound, LockKeyhole, Link2, Timer, FileWarning, Map as MapIcon,
  ChevronDown, ChevronRight, Package, Clock, AlertTriangle, Filter,
  Activity, Info, Lock, Play, Pause, RotateCcw, CheckCircle2, ShieldCheck,
} from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext.jsx';
import { NAVIGATION_LOCALIZATION } from '../data/navigationLocalization.js';
import { CORE_FILES, CORE_STAGES, EGRESS_LINKS, projectIndex, OS_HIERARCHY } from '../data/osData.js';

/* ------------------------------------------------------------------ */
/* Đề án 2 · ISCM CORE — Trục hạ tầng & Tổng kho dữ liệu đô thị       */
/* Split into Left Sidebar and Right Viewport master-detail layout    */
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

/* ─── Simplified Stat Card ─── */
function StatCard({ label, value, sub, color = 'text-iscm-charcoal', bg = 'bg-white', Icon }) {
  return (
    <div className={`flex flex-col gap-1 rounded-none border border-neutral-200 ${bg} px-4 py-3 text-left`}>
      <div className="flex items-center gap-2">
        {Icon && <Icon className={`h-4 w-4 ${color}`} />}
        <span className="font-barlow-condensed text-[10px] font-bold uppercase tracking-wide text-neutral-500">{label}</span>
      </div>
      <span className={`font-barlow text-2xl font-extrabold leading-none ${color}`}>{value}</span>
      {sub && <span className="font-ibm text-[9px] text-neutral-400">{sub}</span>}
    </div>
  );
}

export default function IscmCore() {
  const { lang } = useLanguage();
  const t = NAVIGATION_LOCALIZATION[lang] || NAVIGATION_LOCALIZATION.en;

  // Selected viewport state: 'core-pipeline', 'core-dashboard', 'core-policy'
  const [selected, setSelected] = useState('core-pipeline');

  // Load custom-event triggers from top nav menu redirections
  useEffect(() => {
    const handleSelect = (e) => {
      if (e.detail && ['core-pipeline', 'core-dashboard', 'core-policy'].includes(e.detail)) {
        setSelected(e.detail);
      }
    };
    window.addEventListener('select-dashboard', handleSelect);
    return () => window.removeEventListener('select-dashboard', handleSelect);
  }, []);

  /* ─── State Management for files (Dashboard) ─── */
  const [files, setFiles] = useState(CORE_FILES);
  const [links, setLinks] = useState(EGRESS_LINKS);
  const [catalogLabFilter, setCatalogLabFilter] = useState(ALL_CODE);
  const [selectedLab, setSelectedLab] = useState(LABS[0]?.code || 'PUBLIC_SPACE');

  // Egress link issue helper
  const issueLink = (assetId) => {
    const existing = links.find((l) => l.asset_id === assetId);
    if (existing) {
      setLinks((prev) => prev.filter((l) => l.asset_id !== assetId));
    } else {
      const newToken = Math.random().toString(36).substring(2, 8).toUpperCase();
      setLinks((prev) => [
        ...prev,
        {
          id: `new-${Date.now()}`,
          asset_id: assetId,
          token: newToken,
          to: lang === 'vi' ? 'Liên kết Khách' : 'Guest Egress',
          expires: '23h 59m',
        },
      ]);
    }
  };

  // Approval actions
  const approve = (fileId) => {
    setFiles((prev) =>
      prev.map((f) => {
        if (f.id === fileId) {
          return { ...f, stage: 'etl' };
        }
        return f;
      })
    );
  };

  const reject = (fileId, reason) => {
    setFiles((prev) =>
      prev.map((f) => {
        if (f.id === fileId) {
          return { ...f, stage: 'rejected', reject_reason: reason || 'Failed validation schemas' };
        }
        return f;
      })
    );
  };

  // Pipeline lists
  const pipelineFiles = files.filter((f) => f.stage !== 'stored' && f.stage !== 'rejected');
  const pendingFiles = files.filter((f) => f.stage === 'pending' || f.stage === 'scanning');
  const etlFiles = files.filter((f) => f.stage === 'etl');
  const storedFiles = files.filter((f) => f.stage === 'stored');
  const rejectedFiles = files.filter((f) => f.stage === 'rejected');

  // Filter stored assets catalog row
  const catalogRows = useMemo(() => {
    let rows = files.filter((f) => f.stage === 'stored');
    if (catalogLabFilter !== ALL_CODE) {
      rows = rows.filter((r) => r.lab_code === catalogLabFilter);
    }
    return rows;
  }, [files, catalogLabFilter]);

  // Per-lab counts for pipeline indicator
  const labCounts = useMemo(() => {
    const counts = {};
    LABS.forEach((l) => { counts[l.code] = 0; });
    pipelineFiles.forEach((f) => { if (counts[f.lab_code] !== undefined) counts[f.lab_code]++; });
    return counts;
  }, [pipelineFiles]);

  const selectedLabName = LABS.find((l) => l.code === selectedLab)?.name ?? selectedLab;

  /* ─── State for Data Pipeline Interactive Map ─── */
  const [activeNode, setActiveNode] = useState(null);
  const [simStep, setSimStep] = useState(-1);
  const [simIntervalId, setSimIntervalId] = useState(null);

  const pipelineNodes = [
    {
      id: 'collect',
      x: 75,
      y: 100,
      label: lang === 'vi' ? '1. THU THẬP' : '1. COLLECT',
      title: lang === 'vi' ? 'IoT & Web Ingestion' : 'IoT & Web Ingest',
      descVi: 'Thu thập thông tin thô từ các Web Lab widget, IoT telemetry, và các cổng nhập liệu công cộng. Tiếp nhận các định dạng GeoJSON, Shapefile, Excel, CAD.',
      descEn: 'Collect raw data from Web Lab widgets, IoT telemetry, and public OTP portals. Supported formats include GeoJSON, Shapefile, Excel, and CAD.',
      color: 'text-gray-500 border-gray-200 bg-gray-50',
      icon: UploadCloud,
    },
    {
      id: 'apigw',
      x: 245,
      y: 100,
      label: lang === 'vi' ? '2. CỔNG API' : '2. API GATEWAY',
      title: lang === 'vi' ? 'API Gateway & SSO TLS' : 'API Gateway Authorization',
      descVi: 'Xác thực tài khoản cán bộ thông qua UEH SSO. Kiểm tra chứng chỉ SSL/TLS, giải mã các request và thẩm định định dạng MIME header đầu vào.',
      descEn: 'Authenticate access credentials via UEH SSO. Validate SSL/TLS headers, decrypt request payloads, and evaluate file MIME headers.',
      color: 'text-blue-600 border-blue-200 bg-blue-50',
      icon: KeyRound,
    },
    {
      id: 'sandbox',
      x: 415,
      y: 100,
      label: lang === 'vi' ? '3. KIỂM DUYỆT' : '3. SANDBOX SCAN',
      title: lang === 'vi' ? 'Sandbox Quarantine' : 'Sandbox Scan & Quarantine',
      descVi: 'Đưa tệp tin vào phân vùng ảo tách biệt (Sandbox). Quét mã độc hại, virus, rà soát lỗ hổng định dạng dữ liệu không gian trước khi giải nén.',
      descEn: 'Route uploaded datasets through an isolated virtual Sandbox block. Automatically evaluate viruses, malware, and buffer overflows.',
      color: 'text-amber-600 border-amber-200 bg-amber-50',
      icon: ShieldAlert,
    },
    {
      id: 'etl',
      x: 585,
      y: 100,
      label: lang === 'vi' ? '4. XỬ LÝ ETL' : '4. ETL ENGINE',
      title: lang === 'vi' ? 'Python & GeoPandas ETL' : 'Transform & Spatial Projection',
      descVi: 'Chạy các tác vụ biến đổi dữ liệu (Pandas / GeoPandas). Chuẩn hóa hệ tọa độ không gian thô về hệ VN2000 kinh tuyến trục TP.HCM (EPSG:5899).',
      descEn: 'Execute data normalization pipelines via Python (Pandas/GeoPandas). Project raw geometric schemas to VN2000 standard (EPSG:5899).',
      color: 'text-violet-600 border-violet-200 bg-violet-50',
      icon: Cog,
    },
    {
      id: 'stored',
      x: 755,
      y: 100,
      label: lang === 'vi' ? '5. LƯU TRỮ' : '5. STORED CATALOG',
      title: lang === 'vi' ? 'PostGIS Spatial DB' : 'PostGIS Data Lake Store',
      descVi: 'Lưu trữ cơ sở dữ liệu sạch vào Postgres PostGIS & CityDB. Tạo chỉ mục không gian R-Tree để phục vụ truy xuất tốc độ cao cho các Lab.',
      descEn: 'Load fully structured outputs to Postgres PostGIS & CityDB with R-Tree spatial indexing for high-speed lab query egress.',
      color: 'text-emerald-600 border-emerald-200 bg-emerald-50',
      icon: Warehouse,
    },
  ];

  // Simulator flow controller
  const startSimulator = () => {
    if (simIntervalId) clearInterval(simIntervalId);
    setSimStep(0);
    const id = setInterval(() => {
      setSimStep((prev) => {
        if (prev >= 4) {
          clearInterval(id);
          setSimIntervalId(null);
          return -1;
        }
        return prev + 1;
      });
    }, 1500);
    setSimIntervalId(id);
  };

  useEffect(() => {
    return () => {
      if (simIntervalId) clearInterval(simIntervalId);
    };
  }, [simIntervalId]);

  // Sync active node info cards when simulation changes
  useEffect(() => {
    if (simStep >= 0 && simStep < 5) {
      setActiveNode(pipelineNodes[simStep]);
    }
  }, [simStep]);

  // Sidebar tree items
  const sidebarNodes = t.ISCM_CORE_TREE?.[0]?.children || [
    { key: 'core-pipeline', label: 'Sơ đồ luồng dữ liệu' },
    { key: 'core-dashboard', label: 'Tổng kho dữ liệu' },
    { key: 'core-policy', label: 'Chính sách bảo mật thông tin' },
  ];

  const activeTitle = sidebarNodes.find((n) => n.key === selected)?.label || 'ISCM CORE';

  return (
    <div className="w-full font-sans">
      <style>{`
        @keyframes flowDash {
          to {
            stroke-dashoffset: -16;
          }
        }
        .animate-flow-dash {
          animation: flowDash 0.8s linear infinite;
        }
        @keyframes pulseGlow {
          0%, 100% {
            transform: scale(1);
            filter: drop-shadow(0 0 2px rgba(153, 0, 0, 0.4));
          }
          50% {
            transform: scale(1.08);
            filter: drop-shadow(0 0 8px rgba(153, 0, 0, 0.9));
          }
        }
        .animate-pulse-glow {
          animation: pulseGlow 1.8s infinite ease-in-out;
        }
      `}</style>

      {/* ── Page Header ── */}
      <header className="border-l-4 border-[#990000] pl-4 py-1 mb-6 flex items-start justify-between rounded-none">
        <div>
          <h1 className="font-barlow text-3xl font-extrabold uppercase tracking-wider text-iscm-charcoal">
            ISCM CORE
          </h1>
          <p className="font-ibm text-xs uppercase tracking-wider text-gray-500 mt-1">
            {lang === 'vi' ? 'Trục hạ tầng dữ liệu đô thị thông minh · Đề án 2 · UEH Cloud' : 'Smart Urban Data Infrastructure · Project 2 · UEH Cloud'}
          </p>
        </div>
        <span className="rounded-none bg-[#990000] px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white mt-1 shrink-0">
          {lang === 'vi' ? 'Quy trình thí điểm' : 'Pilot Program Active'}
        </span>
      </header>

      {/* ── 2-Column Split Master-Detail Layout ── */}
      <div className="grid items-start gap-4 md:grid-cols-10">
        
        {/* LEFT — Localized Tabbed Navigation Sidebar */}
        <aside className="border border-neutral-200 bg-white p-2.5 md:col-span-2 rounded-none">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-[#990000] bg-neutral-50 border-b border-neutral-200 py-1.5 px-2 mb-2 select-none text-left">
              ISCM CORE
            </div>
            <ul className="space-y-0.5">
              {sidebarNodes.map((node) => {
                const isActive = selected === node.key;
                return (
                  <li key={node.key}>
                    <button
                      onClick={() => setSelected(node.key)}
                      className={`w-full text-left font-sans text-[11px] py-1.5 px-2 border-b border-neutral-100 transition-colors flex items-center justify-between rounded-none font-bold uppercase text-neutral-900 hover:bg-neutral-50 ${
                        isActive ? '!bg-[#990000] !text-white !font-bold' : ''
                      }`}
                    >
                      <span className="truncate">{node.label}</span>
                      <ChevronRight className={`h-3 w-3 shrink-0 ${isActive ? 'text-white' : 'text-neutral-400'}`} />
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </aside>

        {/* RIGHT — Dynamic Content Viewport */}
        <main className="border border-neutral-200 bg-white p-5 md:col-span-8 rounded-none min-h-[500px]">
          {/* Active section title */}
          <div className="border-l-4 border-[#990000] pl-4 py-1 mb-6 flex items-start justify-between rounded-none">
            <div>
              <h2 className="font-barlow text-2xl font-extrabold uppercase tracking-wider text-iscm-charcoal flex items-center gap-2">
                <DatabaseZap className="h-5 w-5 text-[#990000] shrink-0 animate-pulse" /> {activeTitle}
              </h2>
              <p className="font-ibm text-[10px] uppercase tracking-wider text-gray-500 mt-1">
                {lang === 'vi' ? 'Hạ tầng lưu trữ thông tin không gian' : 'Spatial data ingestion pipeline'}
              </p>
            </div>
          </div>

          {/* VIEWPORT BODY CONTENT */}
          
          {/* Viewport 1: Sơ đồ luồng dữ liệu (Data Pipeline Map) */}
          {selected === 'core-pipeline' && (
            <div className="space-y-6">
              
              {/* Simulator controller header */}
              <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
                <p className="font-ibm text-xs text-neutral-500 text-left">
                  {lang === 'vi' 
                    ? 'Nhấp hoặc di chuột qua các nút để khám phá hoạt động phân luồng dữ liệu đô thị thông minh.' 
                    : 'Hover or click stages to explore the smart urban data workflow.'}
                </p>
                <button
                  onClick={startSimulator}
                  className="inline-flex items-center gap-1.5 rounded-none bg-[#990000] text-white hover:bg-red-800 transition-colors px-3 py-1 font-barlow text-xs font-bold uppercase tracking-wider"
                >
                  <Play className="h-3 w-3 fill-white" />
                  {simIntervalId ? (lang === 'vi' ? 'Đang mô phỏng...' : 'Simulating...') : (lang === 'vi' ? 'Chạy mô phỏng' : 'Run Simulator')}
                </button>
              </div>

              {/* Animated SVG Diagram Canvas */}
              <div className="relative border border-neutral-200 bg-neutral-50/50 p-4 overflow-x-auto select-none">
                <svg viewBox="0 0 830 200" className="w-full min-w-[750px] h-auto overflow-visible">
                  <defs>
                    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                      <feGaussianBlur stdDeviation="4" result="blur" />
                      <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                  </defs>

                  {/* Flow dashed connector lines */}
                  <path d="M 120 100 L 200 100" stroke="#d4d4d4" strokeWidth="4" fill="none" />
                  <path d="M 120 100 L 200 100" stroke="#990000" strokeWidth="4" fill="none" strokeDasharray="6,6" className="animate-flow-dash" />

                  <path d="M 290 100 L 370 100" stroke="#d4d4d4" strokeWidth="4" fill="none" />
                  <path d="M 290 100 L 370 100" stroke="#990000" strokeWidth="4" fill="none" strokeDasharray="6,6" className="animate-flow-dash" />

                  <path d="M 460 100 L 540 100" stroke="#d4d4d4" strokeWidth="4" fill="none" />
                  <path d="M 460 100 L 540 100" stroke="#990000" strokeWidth="4" fill="none" strokeDasharray="6,6" className="animate-flow-dash" />

                  <path d="M 630 100 L 710 100" stroke="#d4d4d4" strokeWidth="4" fill="none" />
                  <path d="M 630 100 L 710 100" stroke="#990000" strokeWidth="4" fill="none" strokeDasharray="6,6" className="animate-flow-dash" />

                  {/* Travelling telemetry packet simulator dot */}
                  {simStep >= 0 && simStep < 5 && (
                    <circle
                      cx={75 + simStep * 170}
                      cy={100}
                      r={10}
                      fill="#990000"
                      className="animate-pulse"
                      filter="url(#glow)"
                    />
                  )}

                  {/* Nodes rendering */}
                  {pipelineNodes.map((node, index) => {
                    const NodeIcon = node.icon;
                    const isActive = activeNode?.id === node.id;
                    const isPassed = simStep >= index;
                    return (
                      <g
                        key={node.id}
                        className="cursor-pointer group"
                        onMouseEnter={() => {
                          if (!simIntervalId) setActiveNode(node);
                        }}
                        onClick={() => {
                          if (!simIntervalId) setActiveNode(node);
                        }}
                      >
                        {/* Node circle backdrop */}
                        <circle
                          cx={node.x}
                          cy={100}
                          r={32}
                          fill={isActive ? '#990000' : (isPassed ? '#fef2f2' : '#ffffff')}
                          stroke={isActive ? '#990000' : (isPassed ? '#f87171' : '#d4d4d4')}
                          strokeWidth="2"
                          className="transition-all duration-300 group-hover:stroke-[#990000] group-hover:scale-105"
                        />
                        {/* Icon */}
                        <g transform={`translate(${node.x - 10}, 90)`}>
                          <NodeIcon className={`h-5 w-5 ${isActive ? 'text-white' : 'text-neutral-700'} group-hover:text-red-600 transition-colors`} />
                        </g>
                        {/* Label text */}
                        <text
                          x={node.x}
                          y={150}
                          textAnchor="middle"
                          className="font-barlow-condensed text-[10px] font-extrabold tracking-wider text-neutral-800 fill-current"
                        >
                          {node.label}
                        </text>
                        <text
                          x={node.x}
                          y={163}
                          textAnchor="middle"
                          className="font-ibm text-[9px] text-neutral-400 fill-current"
                        >
                          {node.title}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>

              {/* Info Details Card for Active Node */}
              {activeNode ? (
                <div className="border border-neutral-200 bg-white p-4 relative animate-in fade-in slide-in-from-bottom-2 duration-300 text-left">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-1 rounded bg-[#990000]/10">
                      <activeNode.icon className="h-4 w-4 text-[#990000]" />
                    </div>
                    <h3 className="font-barlow text-sm font-bold uppercase tracking-wider text-neutral-800">
                      {activeNode.title}
                    </h3>
                    <span className="text-[10px] font-ibm text-neutral-400 font-semibold uppercase">
                      ({activeNode.id})
                    </span>
                  </div>
                  <p className="font-ibm text-xs text-neutral-700 leading-relaxed">
                    {lang === 'vi' ? activeNode.descVi : activeNode.descEn}
                  </p>
                </div>
              ) : (
                <div className="border border-dashed border-neutral-200 rounded p-6 text-center text-xs text-neutral-400">
                  {lang === 'vi' 
                    ? 'Chạm vào bất kỳ nút nào phía trên để xem thuyết minh chi tiết hoạt động đường ống dữ liệu.' 
                    : 'Click any node above to see pipeline functional documentation.'}
                </div>
              )}
            </div>
          )}

          {/* Viewport 2: Tổng kho dữ liệu (Data Catalog Dashboard) */}
          {selected === 'core-dashboard' && (
            <div className="space-y-6">
              
              {/* Stats Bar */}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
                <StatCard label={lang === 'vi' ? 'Đường ống' : 'In Pipeline'} value={pipelineFiles.length} sub={lang === 'vi' ? 'đang xử lý' : 'processing'} Icon={Package} color="text-neutral-700" bg="bg-neutral-50" />
                <StatCard label={lang === 'vi' ? 'Chờ duyệt' : 'Pending'} value={pendingFiles.length} sub={lang === 'vi' ? 'yêu cầu phê duyệt' : 'approvals needed'} Icon={FileWarning} color="text-violet-700" bg="bg-violet-50" />
                <StatCard label={lang === 'vi' ? 'Đang ETL' : 'ETL In-progress'} value={etlFiles.length} sub={lang === 'vi' ? 'xử lý không gian' : 'python running'} Icon={Cog} color="text-blue-700" bg="bg-blue-50" />
                <StatCard label={lang === 'vi' ? 'Đã lưu kho' : 'Stored'} value={storedFiles.length} sub={lang === 'vi' ? 'đã lưu tổng kho' : 'stored securely'} Icon={Warehouse} color="text-emerald-700" bg="bg-emerald-50" />
                <StatCard label={lang === 'vi' ? 'Bị cách ly' : 'Quarantined'} value={rejectedFiles.length} sub={lang === 'vi' ? 'phát hiện lỗi' : 'quarantined'} Icon={ShieldAlert} color="text-red-700" bg="bg-red-50" />
              </div>

              {/* Collapsible Active Pipeline Action List (Simplified) */}
              {pendingFiles.length > 0 && (
                <div className="border border-neutral-200 bg-white">
                  <div className="px-4 py-2 border-b border-neutral-200 bg-neutral-900 text-white flex items-center justify-between">
                    <span className="font-barlow text-[10px] font-bold uppercase tracking-widest text-white flex items-center gap-1.5">
                      <FileWarning className="h-3.5 w-3.5 text-violet-400" />
                      {lang === 'vi' ? 'TẬP TIN ĐANG CHỜ PHÊ DUYỆT' : 'FILES PENDING APPROVAL'}
                    </span>
                    <span className="bg-violet-600 px-1.5 py-0.2 text-[8px] font-bold text-white uppercase tracking-wider">{pendingFiles.length} file</span>
                  </div>
                  <div className="divide-y divide-neutral-100 max-h-[220px] overflow-y-auto">
                    {pendingFiles.map((f) => (
                      <div key={f.id} className="p-3 flex items-center justify-between gap-3 text-left">
                        <div className="min-w-0 flex-1">
                          <p className="font-ibm text-xs font-bold text-neutral-800 truncate" title={f.file_name}>{f.file_name}</p>
                          <p className="text-[10px] text-neutral-400 mt-0.5 uppercase tracking-wide">
                            {f.lab_code} · {f.file_type} · {f.uploaded_by}
                          </p>
                        </div>
                        <div className="flex gap-1 shrink-0">
                          <button
                            onClick={() => approve(f.id)}
                            className="h-6 w-6 flex items-center justify-center bg-emerald-600 hover:bg-emerald-700 text-white rounded transition-colors"
                            title={lang === 'vi' ? 'Duyệt lưu kho' : 'Approve Storing'}
                          >
                            <Check className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => reject(f.id, 'Virus threat check failed or incorrect spatial schemas')}
                            className="h-6 w-6 flex items-center justify-center bg-[#990000] hover:bg-red-800 text-white rounded transition-colors"
                            title={lang === 'vi' ? 'Cách ly / Từ chối' : 'Reject File'}
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Data Catalog Table */}
              <div className="border border-neutral-200 bg-white">
                
                {/* Catalog header */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-200 bg-neutral-900 px-4 py-2 text-left">
                  <div className="flex items-center gap-1.5">
                    <Warehouse className="h-4 w-4 text-[#990000] shrink-0" />
                    <span className="font-barlow text-xs font-bold uppercase tracking-widest text-white">
                      {lang === 'vi' ? 'Danh mục tài sản đã lưu kho' : 'Stored Spatial Assets Catalog'}
                    </span>
                  </div>
                  {/* Lab filter selector */}
                  <div className="flex items-center gap-1.5 ml-auto">
                    <Filter className="h-3 w-3 text-neutral-400" />
                    <select
                      value={catalogLabFilter}
                      onChange={(e) => setCatalogLabFilter(e.target.value)}
                      className="rounded-none border border-neutral-700 bg-neutral-800 px-2 py-0.5 font-ibm text-[10px] text-white focus:outline-none focus:border-[#990000]"
                    >
                      <option value={ALL_CODE}>{lang === 'vi' ? 'Tất cả các Lab' : 'All Labs'}</option>
                      {LABS.map((l) => (
                        <option key={l.code} value={l.code}>{l.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Catalog Table */}
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[700px] text-left border-collapse">
                    <thead>
                      <tr className="bg-neutral-800 font-barlow text-[10px] font-bold uppercase tracking-wider text-white border-b border-neutral-700">
                        <th className="px-4 py-2">Asset Name</th>
                        <th className="px-4 py-2">Lab</th>
                        <th className="px-4 py-2">Type</th>
                        <th className="px-4 py-2">CRS</th>
                        <th className="px-4 py-2">Privacy</th>
                        <th className="px-4 py-2 text-right">Egress Share</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100 font-ibm text-xs text-neutral-800">
                      {catalogRows.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-4 py-8 text-center text-neutral-400 font-ibm">
                            {lang === 'vi' ? 'Không có tài sản dữ liệu nào.' : 'No data assets found.'}
                          </td>
                        </tr>
                      ) : (
                        catalogRows.map((f, i) => {
                          const activeLink = links.find((l) => l.asset_id === f.asset_id);
                          return (
                            <tr key={f.asset_id} className={`${i % 2 ? 'bg-neutral-50/30' : 'bg-white'} hover:bg-[#990000]/5 transition-colors`}>
                              <td className="max-w-[200px] px-4 py-2 text-left">
                                <span className="block truncate font-semibold text-neutral-800" title={f.file_name}>{f.file_name}</span>
                                <span className="block text-[9px] text-neutral-400 leading-none mt-0.5">
                                  {f.asset_id} · {f.uploaded_by}
                                </span>
                              </td>
                              <td className="px-4 py-2 text-left">
                                <span className="rounded-none border border-[#990000]/30 bg-[#990000]/5 px-1 py-0.2 text-[9px] font-bold text-[#990000]">
                                  {f.lab_code}
                                </span>
                              </td>
                              <td className="px-4 py-2 text-left">
                                <span className={`rounded border px-1 py-0.2 text-[9px] font-bold ${TYPE_TONE[f.file_type] ?? 'text-gray-500 bg-gray-50 border-gray-200'}`}>
                                  {f.file_type}
                                </span>
                              </td>
                              <td className="px-4 py-2 text-left">
                                {f.source_crs ? (
                                  <span className="inline-flex items-center gap-1 text-[9px]">
                                    <span className="text-gray-400 font-bold">{f.source_crs}</span>
                                    <span className="text-neutral-300">➔</span>
                                    <span className="font-bold text-emerald-700">{f.target_crs}</span>
                                  </span>
                                ) : <span className="text-gray-300">—</span>}
                              </td>
                              <td className="px-4 py-2 text-left">
                                <span className={`inline-block rounded-full border px-1.5 py-0.2 text-[9px] font-semibold ${PRIVACY_STYLE[f.privacy_status]}`}>
                                  {f.privacy_status}
                                </span>
                              </td>
                              <td className="px-4 py-2 text-right">
                                <div className="inline-flex flex-col items-end gap-1">
                                  {f.privacy_status === 'Confidential' ? (
                                    <button
                                      onClick={() => issueLink(f.asset_id)}
                                      className="inline-flex items-center gap-1 bg-[#990000] text-white hover:bg-red-800 transition-colors px-2 py-0.5 text-[9px] font-bold rounded-none"
                                    >
                                      <LockKeyhole className="h-2.5 w-2.5" /> API Egress
                                    </button>
                                  ) : (
                                    <button
                                      onClick={() => issueLink(f.asset_id)}
                                      className="inline-flex items-center gap-1 border border-neutral-300 text-neutral-800 hover:border-[#990000] hover:text-[#990000] transition-colors px-2 py-0.5 text-[9px] font-bold rounded-none"
                                    >
                                      <Link2 className="h-2.5 w-2.5" /> {lang === 'vi' ? 'Cấp link' : 'Generate Link'}
                                    </button>
                                  )}
                                  
                                  {/* Inline active generated link */}
                                  {activeLink && (
                                    <div className="rounded-none border border-amber-200 bg-amber-50 p-1 text-left mt-1 max-w-[140px]">
                                      <p className="font-ibm text-[8px] text-amber-700 break-all leading-snug">
                                        …/egress/{activeLink.token}
                                      </p>
                                      <div className="flex items-center justify-between gap-1 mt-0.5 text-[8px] text-neutral-400">
                                        <span className="font-bold text-red-600 flex items-center gap-0.5">
                                          <Timer className="h-2 w-2" /> {activeLink.expires}
                                        </span>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Footnote */}
                <div className="px-4 py-2 border-t border-neutral-200 bg-neutral-50 flex justify-between items-center text-[10px] text-neutral-500 font-ibm">
                  <span>
                    {lang === 'vi' 
                      ? '* Hệ tọa độ chuẩn hóa về VN2000 (EPSG:5899)' 
                      : '* Projected outputs mapped to standard VN2000'}
                  </span>
                  {links.length > 0 && (
                    <span className="text-amber-700 font-semibold">
                      {links.length} {lang === 'vi' ? 'liên kết đang phát hành' : 'active link egress tokens'}
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Viewport 3: Chính sách bảo mật thông tin (Information Security Policy) */}
          {selected === 'core-policy' && (
            <div className="grid gap-6 grid-cols-1 md:grid-cols-2 text-left">
              
              {/* Left Column: Access Controls */}
              <div className="border border-neutral-200 bg-white p-5 space-y-4">
                <div className="flex items-center gap-2 border-b border-neutral-200 pb-2">
                  <ShieldCheck className="h-5 w-5 text-emerald-600" />
                  <h3 className="font-barlow text-sm font-bold uppercase tracking-wider text-neutral-800">
                    {lang === 'vi' ? 'Quy định Phân quyền & Định danh' : 'Access Authorization Rules'}
                  </h3>
                </div>

                <div className="space-y-3 font-ibm text-xs text-neutral-600 leading-relaxed">
                  <div>
                    <span className="block font-bold text-neutral-800 mb-0.5">
                      1. Định danh Tập trung (UEH SSO Identity)
                    </span>
                    {lang === 'vi' 
                      ? 'Tất cả người dùng truy cập tổng kho dữ liệu đô thị ISCM CORE bắt buộc phải thực hiện xác thực thông qua hệ thống UEH SSO. Nghiêm cấm chia sẻ tài khoản dùng chung.'
                      : 'All personnel accessing stored urban datasets must authenticate through centralized UEH SSO. Dynamic credentials sharing is strictly forbidden.'}
                  </div>
                  
                  <div>
                    <span className="block font-bold text-neutral-800 mb-0.5">
                      2. Phân quyền theo vai trò (RBAC)
                    </span>
                    {lang === 'vi'
                      ? 'Áp dụng phân quyền chặt chẽ theo phân loại công việc dự án. Quyền đọc/ghi tài sản dữ liệu được gán tự động dựa trên lab_code và danh sách thành viên dự án tương ứng.'
                      : 'Privileges are enforced via Role-Based Access Control (RBAC). Read/write configurations are mapped dynamically to lab_code and project staff lists.'}
                  </div>

                  <div>
                    <span className="block font-bold text-neutral-800 mb-0.5">
                      3. Phân loại bảo mật dữ liệu (Confidentiality)
                    </span>
                    {lang === 'vi'
                      ? 'Tài sản dữ liệu được phân chia thành 3 nhóm: Draft (Nháp), Internal Open (Lưu hành nội bộ), và Confidential (Mật). Đối với các tài sản thuộc nhóm Confidential, việc xuất dữ liệu ra ngoài bắt buộc phải có sự chấp thuận ký duyệt từ Ban Giám đốc Viện.'
                      : 'Assets are categorized into Draft, Internal Open, or Confidential. Access to Confidential resources remains locked and requires explicit Director Board authorization.'}
                  </div>
                </div>
              </div>

              {/* Right Column: Egress Controls */}
              <div className="border border-neutral-200 bg-white p-5 space-y-4">
                <div className="flex items-center gap-2 border-b border-neutral-200 pb-2">
                  <LockKeyhole className="h-5 w-5 text-[#990000]" />
                  <h3 className="font-barlow text-sm font-bold uppercase tracking-wider text-neutral-800">
                    {lang === 'vi' ? 'Kiểm soát Xuất khẩu & Giám sát' : 'Egress Control & Audits'}
                  </h3>
                </div>

                <div className="space-y-3 font-ibm text-xs text-neutral-600 leading-relaxed">
                  <div>
                    <span className="block font-bold text-neutral-800 mb-0.5">
                      1. Mã thông báo tự hủy (Time-Sensitive Egress Tokens)
                    </span>
                    {lang === 'vi'
                      ? 'Việc chia sẻ đường dẫn tải dữ liệu ra bên ngoài hệ thống phải thông qua cơ chế phát hành mã thông báo tự hủy (Egress Links). Các đường dẫn chia sẻ này có thời gian hiệu lực tối đa là 24 giờ kể từ thời điểm cấp phát.'
                      : 'Data exports to external partners must use time-sensitive security link tokens (Egress Links) which will expire and auto-delete in maximum 24 hours.'}
                  </div>
                  
                  <div>
                    <span className="block font-bold text-neutral-800 mb-0.5">
                      2. Môi trường Cách ly Sandbox (Sandbox Quarantine)
                    </span>
                    {lang === 'vi'
                      ? 'Mọi tệp tin dữ liệu không gian tải lên từ các nguồn lực bên ngoài hoặc đối tác quốc tế đều được tự động giữ lại tại Sandbox Quarantine để quét mã độc, virus, trước khi được chuyển sang công cụ ETL chuẩn hóa.'
                      : 'Incoming spatial assets from external groups or global partners are held in Sandbox Quarantine for automated threat scans before ETL processes run.'}
                  </div>

                  <div>
                    <span className="block font-bold text-neutral-800 mb-0.5">
                      3. Nhật ký truy xuất vĩnh viễn (Immutable Audit Logs)
                    </span>
                    {lang === 'vi'
                      ? 'Mọi hành vi truy cập dữ liệu, xuất file, hoặc phê duyệt hồ sơ được ghi nhận tự động vào hệ thống Audit Log bất biến trên UEH Cloud phục vụ công tác thanh kiểm tra an toàn thông tin định kỳ.'
                      : 'All data actions, egress logs, and access changes are recorded on immutable Audit Logs hosted on UEH Cloud for security compliance.'}
                  </div>
                </div>
              </div>

            </div>
          )}

        </main>
      </div>
    </div>
  );
}

import { useMemo, useState, useEffect } from 'react';
import {
  DatabaseZap, ShieldAlert, Cog, Warehouse, UploadCloud, Check, X, Globe2,
  KeyRound, LockKeyhole, Link2, Timer, FileWarning, Map as MapIcon,
  ChevronDown, ChevronRight, Package, Clock, AlertTriangle, Filter,
  Activity, Info, Lock, Play, Pause, RotateCcw, CheckCircle2, ShieldCheck,
  Server, Cpu, Database, Eye, Terminal, ArrowRightLeft, Users, UserCheck
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

  /* ─── State for Detailed Data Pipeline Map ─── */
  const [selectedSource, setSelectedSource] = useState('labs'); // 'website', 'labs', 'partners'
  const [activeNode, setActiveNode] = useState(null);
  const [simStep, setSimStep] = useState(-1);
  const [simStatusMsg, setSimStatusMsg] = useState('');
  const [simIntervalId, setSimIntervalId] = useState(null);

  // Configuration of 3 Inputs (Left Column)
  const inputNodes = [
    {
      id: 'website',
      x: 50,
      y: 50,
      label: lang === 'vi' ? 'ISCM Website Portal' : 'ISCM Website Portal',
      title: lang === 'vi' ? 'iscm.edu.vn Cổng cộng đồng' : 'iscm.edu.vn Portal',
      descVi: 'Nguồn dữ liệu cộng đồng được đóng góp công khai từ công dân, khảo sát xã hội học và các ứng dụng đô thị thông minh Web/Mobile. Tiếp nhận trực tuyến.',
      descEn: 'Public crowdsourced data contributed by citizens, social survey forms, and smart city mobile applications submitted directly via web API.',
      inputsVi: 'Citizen surveys, IoT telemetry streams, JSON form uploads.',
      inputsEn: 'Citizen surveys, IoT telemetry streams, JSON form uploads.',
      roleVi: 'Cộng đồng / Citizens (Web Admin quản trị tiếp nhận)',
      roleEn: 'Community / Citizens (Web Admin manages uploads)',
      approverVi: 'Tự động kiểm tra định dạng dữ liệu (Schema Validation)',
      approverEn: 'Automated Schema Validation engine',
      etlVi: 'Chuyển JSON thô thành định dạng tệp phẳng (CSV / GeoJSON).',
      etlEn: 'Serialize raw citizen JSON payloads into spatial tabular structures.',
      stack: 'React Client, Node.js REST API, AWS API Gateway',
      code: `@app.post("/api/v1/citizen-survey")\nasync def survey_endpoint(payload: SurveyPayload):\n    # Authenticate public API client key\n    verify_client_key(payload.client_id)\n    # Queue data packet for raw ingestion stage\n    await queue_raw_telemetry(payload.to_json())\n    return {"status": "queued_at_ingest"}`
    },
    {
      id: 'labs',
      x: 50,
      y: 160,
      label: lang === 'vi' ? 'ISCM Research Labs' : 'ISCM Research Labs',
      title: lang === 'vi' ? 'Hệ thống các Lab nghiên cứu' : 'Internal Research Labs',
      descVi: 'Dữ liệu địa lý độ chính xác cao từ các Lab của ISCM (Public Space Lab, MOVE Lab, DDUD Lab). Tải lên định dạng tệp Shapefile (.zip), GeoJSON, Excel, CAD.',
      descEn: 'High-precision geospatial datasets uploaded by internal ISCM research labs. Supported formats include GIS Shapefiles (.zip), GeoJSON, CAD, and Excel.',
      inputsVi: 'Tập tin GIS (Shapefiles, GeoJSON), Bản vẽ CAD, Bảng thuộc tính Excel.',
      inputsEn: 'Geospatial files (Shapefiles, GeoJSON), CAD designs, attributes.',
      roleVi: 'Cán bộ Lab / Research Specialists (Move, Public Space, DDUD)',
      roleEn: 'Lab Specialists / Researchers (Move, Public Space, DDUD)',
      approverVi: 'Director Trịnh Tú Anh phê duyệt duyệt chuyển lưu trữ.',
      approverEn: 'Director Trịnh Tú Anh (Manual approve action).',
      etlVi: 'Rà soát hình học không gian (Topology), chuẩn hóa hệ quy chiếu VN2000.',
      etlEn: 'Check topological geometry constraints, reproject to VN2000 coordinate system.',
      stack: 'ISCM OS UI Upload, MinIO Object Storage, RabbitMQ Broker',
      code: `def handle_lab_geodata(file_path):\n    # Extract metadata properties and schema features\n    layer_metadata = parse_spatial_headers(file_path)\n    log_audit_trail(user_id, action="ingest_lab", file=file_path)\n    # Trigger sandbox threat screening tasks\n    sandbox_queue.put(file_path)`
    },
    {
      id: 'partners',
      x: 50,
      y: 270,
      label: lang === 'vi' ? 'External Partners' : 'External Partners',
      title: lang === 'vi' ? 'Đối tác & Các viện thành viên' : 'External Partner Units',
      descVi: 'Dữ liệu liên kết từ các đơn vị thành viên UEH, sở ban ngành thành phố (Sở Quy hoạch Kiến trúc, Sở GTVT) và các đối tác nghiên cứu quốc tế.',
      descEn: 'Federated datasets exchanged with UEH units, municipal agencies (Sở QHKT, Sở GTVT), and collaborative international smart city laboratories.',
      inputsVi: 'Tệp GeoTIFF (Satellite imagery), WMS/WFS API streams, Postgre SQL dumps.',
      inputsEn: 'GeoTIFF raster maps, WMS/WFS API streams, Database dumps.',
      roleVi: 'Đối tác liên kết / System Integrator (External Specialists)',
      roleEn: 'Collaborating Partner Specialists / System Integrator',
      approverVi: 'Admin / System Operator xác nhận chất lượng tích hợp.',
      approverEn: 'System Admin / Technical Lead check.',
      etlVi: 'Tải trực tiếp vào PostgreSQL qua công cụ ogr2ogr, đồng bộ bảng từ xa.',
      etlEn: 'Load database records directly via ogr2ogr, execute schema diff mappings.',
      stack: 'GeoServer, FastAPI Endpoints, PostgreSQL FDW (Foreign Data Wrapper)',
      code: `async def fetch_partner_layer(api_endpoint):\n    # Fetch partner remote layer payload\n    async with httpx.Client() as client:\n        resp = await client.get(f"{api_endpoint}/wfs?request=GetFeature")\n    # Verify payload digital signature keys\n    verify_signature(resp.headers["X-Partner-Signature"])\n    return parse_gml(resp.content)`
    }
  ];

  // Configuration of 5 core Stages (x=210, 370, 530, 690, 850)
  const coreNodes = [
    {
      id: 'collect',
      x: 210,
      y: 160,
      label: lang === 'vi' ? '1. THU THẬP / INGEST' : '1. INGESTION HUB',
      title: lang === 'vi' ? 'Hộp nhận Ingestion Hub' : 'Ingestion Hub',
      descVi: 'Hộp nhận Ingestion Hub tiếp nhận dữ liệu đa luồng từ 3 nguồn đầu vào chính. Tách biệt tệp dữ liệu vào bộ nhớ đệm tạm thời (Buffer Store).',
      descEn: 'The Ingestion Hub consolidates incoming streams from all three sources, pushing files into temporary buffer pools for security isolation.',
      inputsVi: 'Tất cả các nguồn dữ liệu thô (JSON, Zip, GeoJSON, Excel, CAD, GeoTIFF).',
      inputsEn: 'All raw incoming formats (JSON, Zip, GeoJSON, Excel, CAD, GeoTIFF).',
      roleVi: 'Hệ thống tự động / Cron jobs (Ingest Daemon)',
      roleEn: 'Ingestion Daemon / Cron jobs',
      approverVi: 'Hệ thống tự động ghi nhật ký Audit Log (System level)',
      approverEn: 'Automated Audit Log registration engine',
      etlVi: 'Phân loại file, gán nhãn thời gian (timestamp) và cấp phát ID nháp.',
      etlEn: 'Catalog file metadata, attach ingestion timestamps, and assign draft IDs.',
      stack: 'MinIO, Redis Buffer, RabbitMQ Queue',
      code: `def process_ingest_buffer(file_stream):\n    draft_id = generate_uuid()\n    write_to_temp_buffer(draft_id, file_stream)\n    # Publish message to API Gateway validator queue\n    rabbitmq_publish("validate_queue", {"id": draft_id})`,
      icon: Package,
    },
    {
      id: 'apigw',
      x: 370,
      y: 160,
      label: lang === 'vi' ? '2. CỔNG API' : '2. API GATEWAY',
      title: lang === 'vi' ? 'API Gateway & SSO TLS' : 'API Gateway Authorization',
      descVi: 'Cổng tiếp nhận API Gateway kiểm tra chứng thực bảo mật SSL/TLS, xác minh tài khoản đăng nhập UEH SSO và phân tích định dạng tệp tin MIME.',
      descEn: 'The API Gateway performs SSL/TLS handshakes, checks digital signatures, and verifies researcher accounts against UEH SSO LDAP.',
      inputsVi: 'Dữ liệu đệm tạm thời kèm mã xác thực Token.',
      inputsEn: 'Buffered dataset files along with client credentials.',
      roleVi: 'System Admin / Hệ thống SSO',
      roleEn: 'System Admin / SSO Identity Provider',
      approverVi: 'Kiểm soát truy cập tự động qua token bảo mật JWT.',
      approverEn: 'SSO Token Validator (System level)',
      etlVi: 'Giải mã Payload, lọc headers và từ chối các kết nối không hợp lệ.',
      etlEn: 'Decrypt requests, filter headers, and drop invalid socket connections.',
      stack: 'FastAPI SSO middleware, Keycloak LDAP, Nginx Reverse Proxy',
      code: `def authorize_api_request(headers):\n    auth_header = headers.get("Authorization")\n    # Validate JWT claims against UEH Keycloak Server\n    claims = keycloak_verify(auth_header)\n    if not claims.has_role("Researcher"):\n        raise HTTPException(status_code=403, detail="Forbidden")\n    return claims`,
      icon: KeyRound,
    },
    {
      id: 'sandbox',
      x: 530,
      y: 160,
      label: lang === 'vi' ? '3. KIỂM DUYỆT (SANDBOX)' : '3. SANDBOX AUDIT',
      title: lang === 'vi' ? 'Phân vùng cách ly Sandbox' : 'Sandbox Audit & Approve',
      descVi: 'Tệp dữ liệu được giữ lại tại Sandbox để quét virus tự động (ClamAV). Cán bộ phụ trách kiểm tra thuộc tính và gửi yêu cầu phê duyệt lên Director.',
      descEn: 'Datasets are held in an isolated Sandbox block for malware screening. Specialists review attributes and request approval from the Director Board.',
      inputsVi: 'Tệp tin đã qua cổng API hợp lệ.',
      inputsEn: 'Securely parsed files waiting for malware validation.',
      roleVi: 'Cán bộ Lab chuẩn bị, Director Trịnh Tú Anh phê duyệt quyết định lưu kho.',
      roleEn: 'Lab Specialist reviews, Director Trịnh Tú Anh executes approval.',
      approverVi: 'Director Trịnh Tú Anh (Bấm duyệt lưu kho tại Cổng phê duyệt).',
      approverEn: 'Director Trịnh Tú Anh (Approval Action).',
      etlVi: 'Kiểm tra topology không gian tự động (đứt gãy hình học, chồng đè thuộc tính).',
      etlEn: 'Run automated geometry topology audit routines to highlight spatial errors.',
      stack: 'ClamAV, Python Shapely Geometry Checker, ISCM OS Approval Queue',
      code: `def sandbox_validation(file_path):\n    # ClamAV daemon virus scan\n    if scan_for_viruses(file_path) == "INFECTED":\n        quarantine_file(file_path)\n        return False\n    # Evaluate topology invalid intersections\n    geom = read_geojson_shapes(file_path)\n    return geom.is_valid`,
      icon: ShieldAlert,
    },
    {
      id: 'etl',
      x: 690,
      y: 160,
      label: lang === 'vi' ? '4. XỬ LÝ ETL' : '4. ETL ENGINE',
      title: lang === 'vi' ? 'Python & GeoPandas ETL' : 'Transform & Spatial Projection',
      descVi: 'Động cơ xử lý không gian trích xuất hình học không gian, xử lý các bản ghi lỗi, và chuẩn hóa hệ tọa độ sang hệ VN2000 kinh tuyến trục TP.HCM (EPSG:5899).',
      descEn: 'The ETL Engine extracts geometry shapes, resolves duplicate attributes, and projects raw coords into standard VN2000 HCM (EPSG:5899).',
      inputsVi: 'Dữ liệu hình học thô (WGS84 hoặc các hệ tọa độ vệ tinh khác).',
      inputsEn: 'Raw geometric shapes (WGS84, EPSG:4326, etc.).',
      roleVi: 'Hệ thống tự động chạy các script xử lý dữ liệu (ETL Worker)',
      roleEn: 'ETL Workers (System level task engine)',
      approverVi: 'Hệ thống tự động hậu kiểm schemas trước khi ghi.',
      approverEn: 'Post-ETL schema validation checker',
      etlVi: 'Chuyển hệ tọa độ (Reprojection), giải quyết đứt gãy không gian, định dạng kiểu dữ liệu thuộc tính.',
      etlEn: 'Geographic coordinate transformation, geometric correction, schema casting.',
      stack: 'Python GeoPandas, PyProj Engine, SQL Alchemy',
      code: `import geopandas as gpd\n\ndef etl_transform(file_path):\n    # Load raw file into GeoPandas GeoDataFrame\n    gdf = gpd.read_file(file_path)\n    # Reproject coordinates standard to VN2000 (EPSG:5899)\n    gdf = gdf.to_crs(epsg=5899)\n    # Fill missing values and compute geometric area\n    gdf['area_m2'] = gdf.geometry.area\n    return gdf`,
      icon: Cog,
    },
    {
      id: 'stored',
      x: 850,
      y: 160,
      label: lang === 'vi' ? '5. LƯU TRỮ' : '5. STORED CATALOG',
      title: lang === 'vi' ? 'PostGIS Spatial DB' : 'PostGIS Data Lake Store',
      descVi: 'Lưu trữ tệp tin sạch đã qua xử lý vào cơ sở dữ liệu không gian PostGIS và CityDB. Lập chỉ mục không gian GIST (R-Tree) sẵn sàng phục vụ các dự án.',
      descEn: 'Load fully structured outputs to Postgres PostGIS & CityDB databases with GIST R-Tree spatial indexing for high-speed lab query egress.',
      inputsVi: 'Bảng dữ liệu sạch chuẩn hóa hệ tọa độ VN2000.',
      inputsEn: 'Cleaned, structured tables in VN2000 schema.',
      roleVi: 'Database Administrator (DBA)',
      roleEn: 'Database Administrator (DBA)',
      approverVi: 'Hệ thống kiểm soát tính toàn vẹn khóa ngoại (Referential integrity).',
      approverEn: 'DBMS Referential Integrity engine',
      etlVi: 'Tạo chỉ mục không gian GIST, tối ưu hóa câu truy vấn không gian (Spatial Queries).',
      etlEn: 'Build spatial GIST indexes, update database statistic catalogs.',
      stack: 'PostgreSQL, PostGIS, GIST Indexing, CityGML Database',
      code: `-- SQL storage load script\nINSERT INTO iscm_data_catalog (asset_id, file_name, geom, uploaded_by, privacy_status)\nVALUES (:id, :file_name, ST_GeomFromText(:wkt, 5899), :user, :privacy);\n-- Build spatial indexing\nCREATE INDEX IF NOT EXISTS idx_spatial ON iscm_data_catalog USING GIST(geom);`,
      icon: Warehouse,
    }
  ];

  const allPipelineNodes = [...inputNodes, ...coreNodes];

  // Initialize active node documentation panel to first node
  useEffect(() => {
    if (!activeNode) {
      setActiveNode(inputNodes[1]); // Default to Research Labs input node
    }
  }, []);

  // Simulator flow controller
  const startSimulator = () => {
    if (simIntervalId) {
      clearInterval(simIntervalId);
      setSimIntervalId(null);
      setSimStep(-1);
      setSimStatusMsg('');
      return;
    }

    setSimStep(0);
    const sourceNode = inputNodes.find(i => i.id === selectedSource);
    setSimStatusMsg(lang === 'vi' 
      ? `Đang đẩy gói tin từ ${sourceNode.label} vào đường ống...`
      : `Pushing data packet from ${sourceNode.label} into the pipeline...`
    );

    let currentStep = 0;
    const id = setInterval(() => {
      currentStep++;
      if (currentStep === 1) {
        setSimStep(1);
        setSimStatusMsg(lang === 'vi'
          ? "Bước 1: Hộp nhận Ingestion Hub tiếp nhận dữ liệu tạm thời."
          : "Step 1: Ingestion Hub consolidates raw payload into buffer."
        );
      } else if (currentStep === 2) {
        setSimStep(2);
        setSimStatusMsg(lang === 'vi'
          ? "Bước 2: Cổng API Gateway xác thực SSO credentials & SSL handshake."
          : "Step 2: API Gateway validates token claims and SSL certificates."
        );
      } else if (currentStep === 3) {
        setSimStep(3);
        // Pause simulation for Director approval sequence
        setSimStatusMsg(lang === 'vi'
          ? "Bước 3: Sandbox Quarantine — Cán bộ kiểm duyệt gửi yêu cầu duyệt..."
          : "Step 3: Sandbox Quarantine — Specialist sends approval request..."
        );
        setTimeout(() => {
          setSimStatusMsg(lang === 'vi'
            ? "⚠️ Chờ duyệt: Director Trịnh Tú Anh đang rà soát an toàn thông tin..."
            : "⚠️ Sandbox: Director Trịnh Tú Anh is auditing spatial structures..."
          );
        }, 1500);
        setTimeout(() => {
          setSimStatusMsg(lang === 'vi'
            ? "✓ Phê duyệt thành công: Director Trịnh Tú Anh ký duyệt chuyển lưu kho!"
            : "✓ Approved: Director Trịnh Tú Anh signed file load authorization!"
          );
        }, 3200);
      } else if (currentStep === 4) {
        setSimStep(4);
        setSimStatusMsg(lang === 'vi'
          ? "Bước 4: Động cơ ETL (GeoPandas) đang chạy chuẩn hóa hệ tọa độ VN2000..."
          : "Step 4: ETL Spatial Engine converting projection to VN2000..."
        );
      } else if (currentStep === 5) {
        setSimStep(5);
        setSimStatusMsg(lang === 'vi'
          ? "Bước 5: PostGIS Spatial DB — Đã ghi tổng kho và tạo chỉ mục GIST!"
          : "Step 5: Stored! Clean geometries loaded with spatial indexes."
        );
      } else if (currentStep >= 6) {
        clearInterval(id);
        setSimIntervalId(null);
        setSimStep(-1);
        setSimStatusMsg(lang === 'vi'
          ? "✓ Mô phỏng hoàn tất! Gói tin đã nằm an toàn trong kho lưu trữ PostGIS."
          : "✓ Simulation complete! Packet successfully written to PostGIS Database."
        );
      }
    }, 4500); // 4.5 seconds per transition to allow reading status messages
    setSimIntervalId(id);
  };

  // Sync active node info cards when simulation changes
  useEffect(() => {
    if (simStep === 0) {
      const sourceNode = inputNodes.find(i => i.id === selectedSource);
      setActiveNode(sourceNode);
    } else if (simStep >= 1 && simStep <= 5) {
      setActiveNode(coreNodes[simStep - 1]);
    }
  }, [simStep, selectedSource]);

  // Sidebar tree items
  const sidebarNodes = t.ISCM_CORE_TREE?.[0]?.children || [
    { key: 'core-pipeline', label: 'Sơ đồ luồng dữ liệu' },
    { key: 'core-dashboard', label: 'Tổng kho dữ liệu' },
    { key: 'core-policy', label: 'Chính sách bảo mật thông tin' },
  ];

  const activeTitle = sidebarNodes.find((n) => n.key === selected)?.label || 'ISCM CORE';

  // Coordinate calculations for traveling packet
  const getPacketCoords = () => {
    if (simStep === 0) {
      const node = inputNodes.find(i => i.id === selectedSource);
      return { cx: node?.x || 50, cy: node?.y || 160 };
    }
    if (simStep >= 1 && simStep <= 5) {
      const node = coreNodes[simStep - 1];
      return { cx: node.x, cy: node.y };
    }
    return { cx: 50, cy: 160 };
  };

  const packetPos = getPacketCoords();

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
              
              {/* Controls bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-200 pb-3">
                <div className="flex items-center gap-2 text-left">
                  <span className="font-barlow text-xs font-bold text-neutral-500 uppercase tracking-wide">
                    {lang === 'vi' ? 'Luồng đầu vào:' : 'Select Stream Source:'}
                  </span>
                  <div className="flex gap-1">
                    {inputNodes.map((s) => (
                      <button
                        key={s.id}
                        onClick={() => {
                          if (!simIntervalId) {
                            setSelectedSource(s.id);
                            setActiveNode(s);
                          }
                        }}
                        disabled={!!simIntervalId}
                        className={`rounded-none px-2 py-1 font-barlow text-[10px] font-bold uppercase tracking-wider transition-colors border ${
                          selectedSource === s.id
                            ? 'bg-[#990000] text-white border-[#990000]'
                            : 'bg-white text-neutral-600 border-neutral-300 hover:bg-neutral-50'
                        }`}
                      >
                        {s.id === 'website' ? 'Web Portal' : (s.id === 'labs' ? 'Research Labs' : 'Partners')}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={startSimulator}
                  className="inline-flex items-center gap-1.5 rounded-none bg-[#990000] text-white hover:bg-red-800 transition-colors px-3.5 py-1.5 font-barlow text-xs font-bold uppercase tracking-wider shrink-0"
                >
                  {simIntervalId ? (
                    <>
                      <Pause className="h-3 w-3 fill-white" />
                      {lang === 'vi' ? 'Dừng mô phỏng' : 'Stop'}
                    </>
                  ) : (
                    <>
                      <Play className="h-3 w-3 fill-white" />
                      {lang === 'vi' ? 'Chạy mô phỏng' : 'Run Simulator'}
                    </>
                  )}
                </button>
              </div>

              {/* In-simulation Messages Banner */}
              {simStatusMsg && (
                <div className="border border-[#990000]/20 bg-red-50/50 p-2.5 text-left font-ibm text-xs font-semibold text-[#990000] flex items-center gap-2 animate-pulse rounded-none">
                  <Activity className="h-4 w-4 shrink-0 text-[#990000]" />
                  <span>{simStatusMsg}</span>
                </div>
              )}

              {/* Animated SVG Diagram Canvas */}
              <div className="relative border border-neutral-200 bg-neutral-900 p-6 overflow-x-auto select-none rounded-none">
                <svg viewBox="0 0 900 320" className="w-full min-w-[820px] h-auto overflow-visible">
                  <defs>
                    <filter id="glow" x="-30%" y="-30%" width="160%" height="160%">
                      <feGaussianBlur stdDeviation="5" result="blur" />
                      <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                  </defs>

                  {/* Flow dashed connector lines (Branching inputs to Ingest step) */}
                  {/* Web Portal (y=50) -> Ingest (210, 160) */}
                  <path
                    d="M 120 50 C 170 50, 175 160, 202 160"
                    stroke={selectedSource === 'website' ? '#990000' : '#444444'}
                    strokeWidth="3.5"
                    fill="none"
                  />
                  {selectedSource === 'website' && (
                    <path
                      d="M 120 50 C 170 50, 175 160, 202 160"
                      stroke="#ff4d4d"
                      strokeWidth="3.5"
                      fill="none"
                      strokeDasharray="6,6"
                      className="animate-flow-dash"
                    />
                  )}

                  {/* Research Labs (y=160) -> Ingest (210, 160) */}
                  <path
                    d="M 120 160 L 202 160"
                    stroke={selectedSource === 'labs' ? '#990000' : '#444444'}
                    strokeWidth="3.5"
                    fill="none"
                  />
                  {selectedSource === 'labs' && (
                    <path
                      d="M 120 160 L 202 160"
                      stroke="#ff4d4d"
                      strokeWidth="3.5"
                      fill="none"
                      strokeDasharray="6,6"
                      className="animate-flow-dash"
                    />
                  )}

                  {/* External Partners (y=270) -> Ingest (210, 160) */}
                  <path
                    d="M 120 270 C 170 270, 175 160, 202 160"
                    stroke={selectedSource === 'partners' ? '#990000' : '#444444'}
                    strokeWidth="3.5"
                    fill="none"
                  />
                  {selectedSource === 'partners' && (
                    <path
                      d="M 120 270 C 170 270, 175 160, 202 160"
                      stroke="#ff4d4d"
                      strokeWidth="3.5"
                      fill="none"
                      strokeDasharray="6,6"
                      className="animate-flow-dash"
                    />
                  )}

                  {/* Straight paths connecting the core steps 1 to 5 */}
                  {/* Step 1 -> Step 2 */}
                  <path d="M 218 160 L 362 160" stroke="#444444" strokeWidth="3.5" fill="none" />
                  <path d="M 218 160 L 362 160" stroke="#ff4d4d" strokeWidth="3.5" fill="none" strokeDasharray="6,6" className="animate-flow-dash" />

                  {/* Step 2 -> Step 3 */}
                  <path d="M 378 160 L 522 160" stroke="#444444" strokeWidth="3.5" fill="none" />
                  <path d="M 378 160 L 522 160" stroke="#ff4d4d" strokeWidth="3.5" fill="none" strokeDasharray="6,6" className="animate-flow-dash" />

                  {/* Step 3 -> Step 4 */}
                  <path d="M 538 160 L 682 160" stroke="#444444" strokeWidth="3.5" fill="none" />
                  <path d="M 538 160 L 682 160" stroke="#ff4d4d" strokeWidth="3.5" fill="none" strokeDasharray="6,6" className="animate-flow-dash" />

                  {/* Step 4 -> Step 5 */}
                  <path d="M 698 160 L 842 160" stroke="#444444" strokeWidth="3.5" fill="none" />
                  <path d="M 698 160 L 842 160" stroke="#ff4d4d" strokeWidth="3.5" fill="none" strokeDasharray="6,6" className="animate-flow-dash" />

                  {/* Dynamic Simulation Travelling Packet Circle */}
                  {simStep >= 0 && (
                    <circle
                      cx={packetPos.cx}
                      cy={packetPos.cy}
                      r={11}
                      fill="#ff4d4d"
                      className="animate-pulse"
                      style={{ transition: 'all 1.2s ease-in-out' }}
                      filter="url(#glow)"
                    />
                  )}

                  {/* Input Source Nodes (Website, Labs, Partners) */}
                  {inputNodes.map((s) => {
                    const isActive = activeNode?.id === s.id;
                    const isSelectedSource = selectedSource === s.id;
                    return (
                      <g
                        key={s.id}
                        className="cursor-pointer"
                        onClick={() => {
                          if (!simIntervalId) {
                            setSelectedSource(s.id);
                            setActiveNode(s);
                          }
                        }}
                      >
                        <circle
                          cx={s.x}
                          cy={s.y}
                          r={28}
                          fill={isActive ? '#990000' : (isSelectedSource ? '#1f1f1f' : '#121212')}
                          stroke={isActive ? '#ff4d4d' : (isSelectedSource ? '#ff4d4d' : '#333333')}
                          strokeWidth="2.5"
                          className="transition-all duration-300"
                        />
                        {/* Icon */}
                        <g transform={`translate(${s.x - 9}, ${s.y - 9})`}>
                          {s.id === 'website' && <Globe2 className={`h-4.5 w-4.5 ${isActive ? 'text-white' : 'text-neutral-400'}`} />}
                          {s.id === 'labs' && <Users className={`h-4.5 w-4.5 ${isActive ? 'text-white' : 'text-neutral-400'}`} />}
                          {s.id === 'partners' && <Server className={`h-4.5 w-4.5 ${isActive ? 'text-white' : 'text-neutral-400'}`} />}
                        </g>
                        <text x={s.x} y={s.y + 44} textAnchor="middle" className="font-barlow-condensed text-[9px] font-bold text-neutral-300 fill-current uppercase tracking-wider">{s.label}</text>
                      </g>
                    );
                  })}

                  {/* Core Steps Nodes (1 to 5) */}
                  {coreNodes.map((node, index) => {
                    const NodeIcon = node.icon;
                    const isActive = activeNode?.id === node.id;
                    const isPassed = simStep >= index + 1;
                    return (
                      <g
                        key={node.id}
                        className="cursor-pointer"
                        onClick={() => {
                          if (!simIntervalId) setActiveNode(node);
                        }}
                      >
                        <circle
                          cx={node.x}
                          cy={node.y}
                          r={30}
                          fill={isActive ? '#990000' : (isPassed ? '#1f1f1f' : '#121212')}
                          stroke={isActive ? '#ff4d4d' : (isPassed ? '#ff4d4d' : '#333333')}
                          strokeWidth="2.5"
                          className="transition-all duration-300"
                        />
                        {/* Icon */}
                        <g transform={`translate(${node.x - 10}, ${node.y - 10})`}>
                          <NodeIcon className={`h-5 w-5 ${isActive ? 'text-white' : 'text-neutral-400'}`} />
                        </g>
                        {/* Labels */}
                        <text x={node.x} y={node.y + 45} textAnchor="middle" className="font-barlow-condensed text-[9.5px] font-extrabold text-neutral-200 fill-current tracking-wider uppercase">{node.label}</text>
                      </g>
                    );
                  })}
                </svg>
              </div>

              {/* Technical Details and Code Inspection Panel */}
              {activeNode ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 border border-neutral-200 bg-white rounded-none animate-in fade-in slide-in-from-bottom-2 duration-300">
                  
                  {/* Left Column: Descriptive Fields */}
                  <div className="p-4 text-left border-r border-neutral-200 space-y-3.5">
                    <div className="flex items-center gap-2 border-b border-neutral-100 pb-2">
                      <div className="p-1 rounded bg-[#990000]/10">
                        {activeNode.id === 'website' && <Globe2 className="h-4 w-4 text-[#990000]" />}
                        {activeNode.id === 'labs' && <Users className="h-4 w-4 text-[#990000]" />}
                        {activeNode.id === 'partners' && <Server className="h-4 w-4 text-[#990000]" />}
                        {!['website', 'labs', 'partners'].includes(activeNode.id) && <activeNode.icon className="h-4 w-4 text-[#990000]" />}
                      </div>
                      <h3 className="font-barlow text-sm font-bold uppercase tracking-wider text-neutral-800">
                        {activeNode.title}
                      </h3>
                      <span className="text-[9px] font-ibm text-neutral-400 font-semibold uppercase bg-neutral-100 px-1 py-0.2">
                        {activeNode.id}
                      </span>
                    </div>

                    <div className="space-y-2.5 font-ibm text-xs text-neutral-600">
                      <p className="leading-relaxed font-medium text-neutral-700">{lang === 'vi' ? activeNode.descVi : activeNode.descEn}</p>
                      
                      <div className="border-t border-neutral-100 pt-2 grid grid-cols-2 gap-2">
                        <div>
                          <span className="block font-bold text-[10px] text-neutral-800 uppercase tracking-wide">{lang === 'vi' ? 'Đầu vào cụ thể' : 'Data Inputs'}</span>
                          <span className="text-[11px]">{lang === 'vi' ? activeNode.inputsVi : activeNode.inputsEn}</span>
                        </div>
                        <div>
                          <span className="block font-bold text-[10px] text-neutral-800 uppercase tracking-wide">{lang === 'vi' ? 'Thực hiện' : 'Responsible'}</span>
                          <span className="text-[11px]">{lang === 'vi' ? activeNode.roleVi : activeNode.roleEn}</span>
                        </div>
                      </div>

                      <div className="border-t border-neutral-100 pt-2 grid grid-cols-2 gap-2">
                        <div>
                          <span className="block font-bold text-[10px] text-neutral-800 uppercase tracking-wide">{lang === 'vi' ? 'Kiểm duyệt' : 'Approver'}</span>
                          <span className="text-[11px] font-semibold text-[#990000]">{lang === 'vi' ? activeNode.approverVi : activeNode.approverEn}</span>
                        </div>
                        <div>
                          <span className="block font-bold text-[10px] text-neutral-800 uppercase tracking-wide">{lang === 'vi' ? 'Công nghệ' : 'Technology'}</span>
                          <span className="text-[11px] font-mono text-neutral-700">{activeNode.stack}</span>
                        </div>
                      </div>

                      {activeNode.etlVi && (
                        <div className="border-t border-neutral-100 pt-2">
                          <span className="block font-bold text-[10px] text-neutral-800 uppercase tracking-wide">{lang === 'vi' ? 'Nghiệp vụ ETL / Standard' : 'ETL Processing Standard'}</span>
                          <span className="text-[11px] leading-snug">{lang === 'vi' ? activeNode.etlVi : activeNode.etlEn}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Column: Code Inspector Mockup */}
                  <div className="p-4 bg-neutral-900 text-left flex flex-col min-w-0">
                    <div className="flex items-center justify-between border-b border-neutral-800 pb-2 mb-3">
                      <span className="font-barlow-condensed text-[10px] font-bold text-[#ff4d4d] uppercase tracking-wider flex items-center gap-1.5">
                        <Terminal className="h-3.5 w-3.5" /> CODE INSPECTOR
                      </span>
                      <span className="text-[8px] font-mono text-neutral-500">FastAPI / Python ETL worker</span>
                    </div>
                    <pre className="flex-1 overflow-x-auto font-mono text-[10.5px] leading-relaxed text-neutral-300 whitespace-pre scrollbar-thin select-text py-2">
                      <code>{activeNode.code}</code>
                    </pre>
                  </div>
                  
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

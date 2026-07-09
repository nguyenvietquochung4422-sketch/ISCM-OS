import { useMemo, useState, useEffect } from 'react';
import {
  DatabaseZap, ShieldAlert, Cog, Warehouse, UploadCloud, Check, X, Globe2,
  KeyRound, LockKeyhole, Link2, Timer, FileWarning, Map as MapIcon,
  ChevronDown, ChevronRight, Package, Clock, AlertTriangle, Filter,
  Activity, Info, Lock, Play, Pause, RotateCcw, CheckCircle2, ShieldCheck,
  Server, Cpu, Database, Eye, Terminal, ArrowRightLeft, Users, UserCheck, Copy, ShieldX
} from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext.jsx';
import { NAVIGATION_LOCALIZATION } from '../data/navigationLocalization.js';

// ------------------------------------------------------------------
// MOCK DATA & PERSONNEL DIRECTORY FOR ISCM CORE URBAN DATA LAKEHOUSE
// ------------------------------------------------------------------

const SIMULATED_USERS = [
  // ROLE A
  { id: 'u1', name: 'Assoc.Prof. Tu Anh Trinh, PhD', role: 'ROLE A: GOVERNANCE BOARD', title: 'Director', roleType: 'A', email: 'tuanh.trinh@ueh.edu.vn' },
  { id: 'u2', name: 'Hung Quoc Viet Nguyen, B.A', role: 'ROLE A: ARCHITECT', title: 'Smart City - Data Core Architect', roleType: 'A', email: 'hung.nvq@ueh.edu.vn' },
  
  // ROLE B
  { id: 'u3', name: 'Mai Quynh Thi Tran, M.Arch', role: 'ROLE B: DATA STEWARD', title: 'Director of Bachelor Program - Dual Degree', roleType: 'B', email: 'mai.tran@ueh.edu.vn' },
  { id: 'u4', name: 'Hien The Dang, M.Sc', role: 'ROLE B: DATA STEWARD', title: 'Director of Bachelor Program - Architect', roleType: 'B', email: 'hien.dang@ueh.edu.vn' },
  { id: 'u5', name: 'Hoai Nguyen Pham, PhD', role: 'ROLE B: DATA STEWARD', title: 'Director of Bachelor Program - Smart Mobility', roleType: 'B', email: 'hoai.pham@ueh.edu.vn' },
  { id: 'u6', name: 'Dr. Arch, Lan Ngoc Hoang', role: 'ROLE B: DATA STEWARD', title: 'Head of Academia', roleType: 'B', email: 'lan.hoang@ueh.edu.vn' },
  { id: 'u7', name: 'Dr. Arch, Khang Van Huynh', role: 'ROLE B: DATA STEWARD', title: 'Head of Community Engagement', roleType: 'B', email: 'khang.huynh@ueh.edu.vn' },
  { id: 'u8', name: 'Dung Lai Phuong, M.A', role: 'ROLE B: DATA STEWARD', title: 'Head of Partnership', roleType: 'B', email: 'dung.lai@ueh.edu.vn' },
  { id: 'u9', name: 'Tien Thuy Thi Le, B.E', role: 'ROLE B: DATA STEWARD', title: 'Head of PR & Communication', roleType: 'B', email: 'tien.le@ueh.edu.vn' },
  
  // ROLE C
  { id: 'u10', name: 'Tam Phuc Le Do, M.Sc', role: 'ROLE C: RESEARCHER', title: 'Lecturer - Smart Urban Development', roleType: 'C', email: 'tam.le@ueh.edu.vn' },
  { id: 'u11', name: 'Nam Thanh Le, PhD', role: 'ROLE C: RESEARCHER', title: 'Lecturer - Urban Infrastructure & Sustainable Development', roleType: 'C', email: 'nam.le@ueh.edu.vn' },
  { id: 'u12', name: 'Long Phi Hoang, PhD', role: 'ROLE C: RESEARCHER', title: 'Adjunct Lecturer - Environmental Science', roleType: 'C', email: 'long.hoang@ueh.edu.vn' },
  { id: 'u13', name: 'Dao Chi Vo, PhD', role: 'ROLE C: RESEARCHER', title: 'Lecturer - Urban Infrastructure & Sustainable Development', roleType: 'C', email: 'dao.vo@ueh.edu.vn' },
  { id: 'u14', name: 'Quang Tran Vuong, PhD', role: 'ROLE C: RESEARCHER', title: 'Lecturer - Environmental Science', roleType: 'C', email: 'quang.vuong@ueh.edu.vn' },
  { id: 'u15', name: 'Sandhya Rao, M.Arch', role: 'ROLE C: RESEARCHER', title: 'Lecturer - Architecture & Urban Design', roleType: 'C', email: 'sandhya.rao@ueh.edu.vn' },
  { id: 'u16', name: 'Nam-Hai Hoang, M.Arch', role: 'ROLE C: RESEARCHER', title: 'Lecturer - Architecture & Urban Design', roleType: 'C', email: 'namhai.hoang@ueh.edu.vn' },
  { id: 'u17', name: 'Daniela Hurtarte, M.Sc', role: 'ROLE C: RESEARCHER', title: 'Lecturer - Urban Planning & Design', roleType: 'C', email: 'daniela.hurtarte@ueh.edu.vn' },
  { id: 'u18', name: 'Trung Nguyen Tan, PhD', role: 'ROLE C: RESEARCHER', title: 'Lecturer - Environmental Engineering & Science', roleType: 'C', email: 'trung.nguyen@ueh.edu.vn' },
  { id: 'u19', name: 'An Truong Phan Le, MUD', role: 'ROLE C: RESEARCHER', title: 'Officer - Smart Mobility', roleType: 'C', email: 'an.le@ueh.edu.vn' },
  { id: 'u20', name: 'Phuc Hoang Nguyen, B.Arch', role: 'ROLE C: RESEARCHER', title: 'Officer MakerSpace', roleType: 'C', email: 'phuc.nguyen@ueh.edu.vn' },
  { id: 'u21', name: 'Toan Phuc Le, B.E', role: 'ROLE C: RESEARCHER', title: 'Designer', roleType: 'C', email: 'toan.le@ueh.edu.vn' },
  { id: 'u22', name: 'Vu Anh Thai, M.Sc', role: 'ROLE C: RESEARCHER', title: 'Researcher - Smart City', roleType: 'C', email: 'thai.vu@ueh.edu.vn' },
  { id: 'u23', name: 'Tram Quynh Nguyen, B.A', role: 'ROLE C: RESEARCHER', title: 'Coordinator - UEH CoLab', roleType: 'C', email: 'tram.nguyen@ueh.edu.vn' },
  { id: 'u24', name: 'Binh Thanh Pham Luu, B.A', role: 'ROLE C: RESEARCHER', title: 'Design Collaborator - UEH CoLab', roleType: 'C', email: 'binh.pham@ueh.edu.vn' },
  { id: 'u25', name: 'Tai Vinh Tran, B.A', role: 'ROLE C: RESEARCHER', title: 'Collaborator - Studio Lab', roleType: 'C', email: 'tai.tran@ueh.edu.vn' },
  
  // ROLE D
  { id: 'u26', name: 'Dung Hong Vo Pham, B.A', role: 'ROLE D: INTERN', title: 'PR & Communication Intern', roleType: 'D', email: 'intern.dung@ueh.edu.vn' },
  { id: 'u27', name: 'Bùi Thảo Nguyên', role: 'ROLE D: INTERN', title: 'PR & Communication Intern', roleType: 'D', email: 'intern.nguyen@ueh.edu.vn' },
  { id: 'u28', name: 'Nguyen Ha Cam Tien', role: 'ROLE D: INTERN', title: 'PR & Communication Intern', roleType: 'D', email: 'intern.tien@ueh.edu.vn' },
  { id: 'u29', name: 'Luong Thi Thuy An', role: 'ROLE D: INTERN', title: 'Design Intern', roleType: 'D', email: 'intern.an@ueh.edu.vn' },
  { id: 'u30', name: 'Nguyen Minh Huy', role: 'ROLE D: INTERN', title: 'Design Intern', roleType: 'D', email: 'intern.huy@ueh.edu.vn' },
  { id: 'u31', name: 'Truong Thanh Dat', role: 'ROLE D: INTERN', title: 'IT Digital Platform Intern', roleType: 'D', email: 'intern.dat@ueh.edu.vn' },
  { id: 'u32', name: 'Nguyen Ngọc Thien', role: 'ROLE D: INTERN', title: 'Tech Convergence Hub Intern', roleType: 'D', email: 'intern.thien@ueh.edu.vn' },
  { id: 'u33', name: 'Ngô An Phú', role: 'ROLE D: INTERN', title: 'smART Hub Intern', roleType: 'D', email: 'intern.phu@ueh.edu.vn' },
  { id: 'u34', name: 'Nguyễn Lương Minh Thư', role: 'ROLE D: INTERN', title: 'Public Space Living Lab Intern', roleType: 'D', email: 'intern.thu@ueh.edu.vn' },
  { id: 'u35', name: 'Hoàng Trương Tiến Đạt', role: 'ROLE D: INTERN', title: 'Public Space Living Lab Intern', roleType: 'D', email: 'intern.tiendat@ueh.edu.vn' }
];

const INITIAL_ASSETS = [
  {
    id: 'ASSET-001',
    name: 'Hue Eco-Cultural Corridor GIS Layers',
    source: 'DDUD Lab / Hue Heritage Project',
    crs: 'VN-2000 (EPSG:5899)',
    scope: 'Hue Heritage Area',
    metadataStatus: 'Complete',
    privacyLevel: 'Confidential',
    category: 'Spatial Vectors (GIS/Drone)',
    tab: 'core', 
    status: 'Locked in Core', 
    egressState: 'red', 
    requestsCount: 0,
    size: '145.2 MB'
  },
  {
    id: 'ASSET-002',
    name: 'HCMC District 1 Sidewalk Survey 2026',
    source: 'Public Space Lab / PSA Project',
    crs: 'WGS-84 (EPSG:4326)',
    scope: 'HCMC District 1',
    metadataStatus: 'Complete',
    privacyLevel: 'Public',
    category: 'Survey Fields (Excel/Form)',
    tab: 'core',
    status: 'Locked in Core',
    egressState: 'green',
    requestsCount: 0,
    size: '12.4 MB'
  },
  {
    id: 'ASSET-003',
    name: 'Mekong Delta Sentinel-2 Land Cover 10m',
    source: 'Climate Resilience Lab / Partner API',
    crs: 'WGS-84 / UTM 48N (EPSG:32648)',
    scope: 'Mekong Delta',
    metadataStatus: 'Complete',
    privacyLevel: 'Internal',
    category: 'Remote Sensing (Raster/GEE)',
    tab: 'core',
    status: 'Locked in Core',
    egressState: 'yellow',
    requestsCount: 3,
    size: '2.4 GB'
  },
  {
    id: 'ASSET-004',
    name: 'Vinhomes Central Park Smart Lighting Telemetry',
    source: 'MOVE System Lab / IoT Hub',
    crs: 'WGS-84 (EPSG:4326)',
    scope: 'HCMC Binh Thanh',
    metadataStatus: 'Under Review',
    privacyLevel: 'Internal',
    category: 'Sensor Networks (IoT)',
    tab: 'staging',
    status: 'In-Pipeline',
    egressState: 'red',
    requestsCount: 0,
    size: '89.7 MB'
  },
  {
    id: 'ASSET-005',
    name: 'Da Nang Green Space Drone Mapping (LiDAR)',
    source: 'DDUD Lab / City Greenery',
    crs: 'VN-2000 (EPSG:5899)',
    scope: 'Da Nang City',
    metadataStatus: 'Missing Fields',
    privacyLevel: 'Confidential',
    category: 'Spatial Vectors (GIS/Drone)',
    tab: 'staging',
    status: 'Pending Approval',
    egressState: 'yellow',
    requestsCount: 5,
    size: '1.8 GB'
  },
  {
    id: 'ASSET-006',
    name: 'Thu Duc City Traffic Flow counts (DRT)',
    source: 'MOVE System Lab / DRT Bus',
    crs: 'WGS-84 (EPSG:4326)',
    scope: 'Thu Duc City',
    metadataStatus: 'Complete',
    privacyLevel: 'Public',
    category: 'Sensor Networks (IoT)',
    tab: 'core',
    status: 'Locked in Core',
    egressState: 'green',
    requestsCount: 0,
    size: '412.3 MB'
  },
  {
    id: 'ASSET-007',
    name: 'HCMC Hồ Con Rùa Microclimate Sensor Logs',
    source: 'Public Space Lab / HCR-PDPhung',
    crs: 'WGS-84 (EPSG:4326)',
    scope: 'HCMC District 3',
    metadataStatus: 'Complete',
    privacyLevel: 'Internal',
    category: 'Sensor Networks (IoT)',
    tab: 'staging',
    status: 'ETL Processing',
    egressState: 'yellow',
    requestsCount: 1,
    size: '15.6 MB'
  },
  {
    id: 'ASSET-008',
    name: 'An Giang Flooding Area SAR Sentinel-1',
    source: 'Climate Resilience Lab / Partner API',
    crs: 'WGS-84 / UTM 48N (EPSG:32648)',
    scope: 'An Giang Province',
    metadataStatus: 'Under Review',
    privacyLevel: 'Public',
    category: 'Remote Sensing (Raster/GEE)',
    tab: 'staging',
    status: 'In-Pipeline',
    egressState: 'green',
    requestsCount: 0,
    size: '920.4 MB'
  },
  {
    id: 'ASSET-009',
    name: 'Hue Citadel Historic Building CAD Models',
    source: 'DDUD Lab / Heritage Conservation',
    crs: 'VN-2000 (EPSG:5899)',
    scope: 'Hue Citadel',
    metadataStatus: 'Complete',
    privacyLevel: 'Confidential',
    category: 'Spatial Vectors (GIS/Drone)',
    tab: 'core',
    status: 'Locked in Core',
    egressState: 'red',
    requestsCount: 0,
    size: '88.5 MB'
  },
  {
    id: 'ASSET-010',
    name: 'HCMC Pedestrian Behavior Social Survey',
    source: 'Public Space Lab / HCR Project',
    crs: 'WGS-84 (EPSG:4326)',
    scope: 'HCMC District 1 & 3',
    metadataStatus: 'Missing Fields',
    privacyLevel: 'Internal',
    category: 'Survey Fields (Excel/Form)',
    tab: 'staging',
    status: 'Quarantined',
    egressState: 'yellow',
    requestsCount: 3,
    size: '8.2 MB'
  }
];

export default function IscmCore() {
  const { lang } = useLanguage();
  const t = NAVIGATION_LOCALIZATION[lang] || NAVIGATION_LOCALIZATION.en;

  // Selected navigation viewport
  const [selected, setSelected] = useState('core-dashboard');

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

  // ------------------------------------------------------------------
  // STATES
  // ------------------------------------------------------------------
  const [assets, setAssets] = useState(INITIAL_ASSETS);
  const [activeUser, setActiveUser] = useState(SIMULATED_USERS[0]); // Assoc.Prof. Tu Anh Trinh as default
  const [catalogTab, setCatalogTab] = useState('core'); // 'staging' or 'core'
  const [categoryFilter, setCategoryFilter] = useState('All');
  
  // Modal state for generated download URL
  const [generatedLink, setGeneratedLink] = useState(null);
  
  // Pending Access Request Simulation State (Right Panel of Pipeline View)
  const [activeRequest, setActiveRequest] = useState({
    id: 'REQ-4902',
    requester: 'Dr. Marcus Thorne',
    institution: 'MIT Urban Risk Lab',
    assetId: 'ASSET-001',
    assetName: 'Hue Eco-Cultural Corridor GIS Layers',
    purpose: 'Academic study on flood propagation & green infrastructure mapping in Central Vietnam.',
    status: 'Pending Review',
    token: null
  });

  // Simulated Pipeline stream variables
  const [selectedSource, setSelectedSource] = useState('external'); // 'external' (Interns/External), 'internal' (Researchers)
  const [simStep, setSimStep] = useState(-1);
  const [simStatusMsg, setSimStatusMsg] = useState('');
  const [simIntervalId, setSimIntervalId] = useState(null);
  
  // ------------------------------------------------------------------
  // COUNTS (Pipeline Indicators)
  // ------------------------------------------------------------------
  const pipelineStats = useMemo(() => {
    const counts = {
      inPipeline: 0,
      pendingApproval: 0,
      etlProcessing: 0,
      lockedInCore: 0,
      quarantined: 0
    };
    assets.forEach(a => {
      if (a.status === 'In-Pipeline') counts.inPipeline++;
      else if (a.status === 'Pending Approval') counts.pendingApproval++;
      else if (a.status === 'ETL Processing') counts.etlProcessing++;
      else if (a.status === 'Locked in Core') counts.lockedInCore++;
      else if (a.status === 'Quarantined') counts.quarantined++;
    });
    return counts;
  }, [assets]);

  // ------------------------------------------------------------------
  // FILTERED CATALOG ROW CALCULATIONS
  // ------------------------------------------------------------------
  const filteredAssets = useMemo(() => {
    // If Role D (Intern), return empty list for Central Core tab (Zero visibility policy)
    if (activeUser.roleType === 'D' && catalogTab === 'core') {
      return [];
    }

    let rows = assets.filter(a => a.tab === catalogTab);
    
    // If Role D (Intern), they can only see files they/their teams uploaded (e.g. metadata missing, public, or specific categories)
    if (activeUser.roleType === 'D') {
      rows = rows.filter(a => a.privacyLevel !== 'Confidential');
    }

    if (categoryFilter !== 'All') {
      rows = rows.filter(a => a.category === categoryFilter);
    }
    return rows;
  }, [assets, catalogTab, categoryFilter, activeUser]);

  // ------------------------------------------------------------------
  // HANDLERS & ACTIONS
  // ------------------------------------------------------------------
  const handleApproveStagingAsset = (assetId) => {
    // Requires Role A or Role B
    if (activeUser.roleType !== 'A' && activeUser.roleType !== 'B') {
      alert(lang === 'vi' 
        ? 'LỖI BẢO MẬT: Chỉ Ban Giám Đốc (Role A) hoặc Quản trị dữ liệu (Role B) mới có quyền duyệt dữ liệu vào kho chính.' 
        : 'ACCESS DENIED: Only Governance Board (Role A) or Data Stewards (Role B) can approve staging ingestion.');
      return;
    }
    
    setAssets(prev => prev.map(a => {
      if (a.id === assetId) {
        return {
          ...a,
          tab: 'core',
          status: 'Locked in Core'
        };
      }
      return a;
    }));
  };

  const handleQuarantineStagingAsset = (assetId) => {
    if (activeUser.roleType !== 'A' && activeUser.roleType !== 'B') {
      alert(lang === 'vi' 
        ? 'LỖI BẢO MẬT: Chỉ Ban Giám Đốc (Role A) hoặc Quản trị dữ liệu (Role B) mới có quyền từ chối/cách ly dữ liệu.' 
        : 'ACCESS DENIED: Only Governance Board (Role A) or Data Stewards (Role B) can quarantine files.');
      return;
    }

    setAssets(prev => prev.map(a => {
      if (a.id === assetId) {
        return {
          ...a,
          status: 'Quarantined'
        };
      }
      return a;
    }));
  };

  const handleEgressShareClick = (asset) => {
    // Green Badge - Public Link
    if (asset.egressState === 'green') {
      const timeToken = Math.random().toString(36).substring(2, 8).toUpperCase();
      const mockURL = `https://iscm-lakehouse.ueh.edu.vn/egress/public/${asset.id}?token=PUB-${timeToken}`;
      setGeneratedLink({
        assetName: asset.name,
        url: mockURL,
        expires: '23h 59m 59s',
        type: 'Public Access Link'
      });
    } 
    // Yellow Badge - Pending Requests
    else if (asset.egressState === 'yellow') {
      // Simulate switching to pipeline view to review requests
      setSelected('core-pipeline');
      // Set the active request preview to match this asset
      setActiveRequest({
        id: `REQ-${Math.floor(1000 + Math.random() * 9000)}`,
        requester: 'Prof. Sandhya Rao',
        institution: 'University Architecture Lab',
        assetId: asset.id,
        assetName: asset.name,
        purpose: 'Collaborative smart city design validation and spatial attributes audits.',
        status: 'Pending Review',
        token: null
      });
    } 
    // Red Badge - Secure Stream - API Only
    else if (asset.egressState === 'red') {
      // Requires Role A
      if (activeUser.roleType === 'A') {
        const adminToken = Math.random().toString(36).substring(2, 10).toUpperCase();
        const mockURL = `https://iscm-lakehouse.ueh.edu.vn/egress/api/v1/stream/${asset.id}?key=SEC-${adminToken}`;
        setGeneratedLink({
          assetName: asset.name,
          url: mockURL,
          expires: '01h 00m 00s (Strict Admin Session)',
          type: 'Secure API Stream Payload Token (Override Active)'
        });
      } else {
        alert(lang === 'vi'
          ? 'KHÓA BẢO MẬT: Tệp dữ liệu này được cấu hình [Secure Stream - API Only]. Tải xuống thô bị khóa. Dữ liệu chỉ kết xuất trực tiếp lên WebGIS (smART Hub). Chỉ Giám Đốc Viện mới có quyền Override tạo Token khẩn cấp.'
          : 'SECURITY LOCK: This asset is locked to [Secure Stream - API Only]. Raw downloads are prohibited. WebGIS rendering only. Only the Director Board (Role A) can run override controls.');
      }
    }
  };

  // Egress Request Panel Action Handlers
  const handleApproveRequest = () => {
    if (activeUser.roleType !== 'A' && activeUser.roleType !== 'B') {
      alert(lang === 'vi' 
        ? 'LỖI BẢO MẬT: Chỉ Ban Giám Đốc (Role A) hoặc Quản trị dữ liệu (Role B) mới có quyền duyệt yêu cầu chia sẻ.' 
        : 'ACCESS DENIED: Only Governance Board (Role A) or Data Stewards (Role B) can approve access requests.');
      return;
    }
    setActiveRequest(prev => ({
      ...prev,
      status: 'Approved & Linked',
      token: `TEMP-TOKEN-${Math.random().toString(36).substring(2, 8).toUpperCase()}`
    }));
    // Update matching asset to green egress state
    setAssets(prev => prev.map(a => {
      if (a.id === activeRequest.assetId) {
        return { ...a, egressState: 'green', privacyLevel: 'Internal_Open' };
      }
      return a;
    }));
  };

  const handleGenerateTempToken = () => {
    if (activeUser.roleType !== 'A' && activeUser.roleType !== 'B') {
      alert(lang === 'vi' 
        ? 'LỖI BẢO MẬT: Chỉ Ban Giám Đốc (Role A) hoặc Quản trị dữ liệu (Role B) mới có quyền cấp Token tạm thời.' 
        : 'ACCESS DENIED: Only Governance Board (Role A) or Data Stewards (Role B) can issue temporary tokens.');
      return;
    }
    const tokenStr = `TEMP-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    setActiveRequest(prev => ({
      ...prev,
      status: 'Temporary Token Generated',
      token: tokenStr
    }));
  };

  const handleDenyAndMask = () => {
    if (activeUser.roleType !== 'A' && activeUser.roleType !== 'B') {
      alert(lang === 'vi' 
        ? 'LỖI BẢO MẬT: Chỉ Ban Giám Đốc (Role A) hoặc Quản trị dữ liệu (Role B) mới có quyền từ chối yêu cầu.' 
        : 'ACCESS DENIED: Only Governance Board (Role A) or Data Stewards (Role B) can deny access requests.');
      return;
    }
    setActiveRequest(prev => ({
      ...prev,
      status: 'Denied & Attributes Masked',
      token: 'MASKED-ENCRYPTED'
    }));
    // Update matching asset to secure stream
    setAssets(prev => prev.map(a => {
      if (a.id === activeRequest.assetId) {
        return { ...a, egressState: 'red', privacyLevel: 'Confidential' };
      }
      return a;
    }));
  };

  // Pipeline Simulator Flow Controller
  const startSimulator = () => {
    if (simIntervalId) {
      clearInterval(simIntervalId);
      setSimIntervalId(null);
      setSimStep(-1);
      setSimStatusMsg('');
      return;
    }

    setSimStep(0);
    setSimStatusMsg(lang === 'vi' 
      ? `Đang đẩy gói tin từ nguồn ${selectedSource === 'external' ? 'Cộng đồng/Interns (Staging Area)' : 'Cán bộ nghiên cứu (Labs Upload)'} vào đường ống...`
      : `Pushing data packet from ${selectedSource === 'external' ? 'Community/Interns (Staging Area)' : 'Research Staff (Labs Upload)'} into the pipeline...`
    );

    let currentStep = 0;
    const id = setInterval(() => {
      currentStep++;
      if (currentStep === 1) {
        setSimStep(1);
        setSimStatusMsg(lang === 'vi'
          ? "Bước 1: Hộp nhận Ingestion Hub tiếp nhận dữ liệu và gán nhãn buffer."
          : "Step 1: Ingestion Hub consolidates raw payload into staging buffer."
        );
      } else if (currentStep === 2) {
        setSimStep(2);
        setSimStatusMsg(lang === 'vi'
          ? "Bước 2: Cổng API Gateway xác thực SSO JWT và mã hóa đường truyền TLS."
          : "Step 2: API Gateway validates token claims and enforces TLS encryption."
        );
      } else if (currentStep === 3) {
        setSimStep(3);
        setSimStatusMsg(lang === 'vi'
          ? "Bước 3: Sandbox Quarantine — Đang quét mã độc (ClamAV) & kiểm tra định dạng dữ liệu..."
          : "Step 3: Sandbox Quarantine — Scanning for threat signatures (ClamAV) & format schemas..."
        );
        
        // Simulating automated or steward-based approval sequence
        setTimeout(() => {
          setSimStatusMsg(lang === 'vi'
            ? "⚠️ Chờ duyệt: Đang gửi báo cáo thẩm định hình học không gian (Topology Auditing)..."
            : "⚠️ Sandbox: Dispatching topology spatial constraints audit report..."
          );
        }, 1500);
      } else if (currentStep === 4) {
        setSimStep(4);
        setSimStatusMsg(lang === 'vi'
          ? "Bước 4: Động cơ ETL đang xử lý dữ liệu hình học, chuyển đổi sang hệ tọa độ VN2000 (EPSG:5899)..."
          : "Step 4: Python GeoPandas ETL running, projecting geometry schemas to VN-2000 CRS..."
        );
      } else if (currentStep === 5) {
        setSimStep(5);
        setSimStatusMsg(lang === 'vi'
          ? "Bước 5: Lưu trữ thành công vào PostgreSQL/PostGIS. Thiết lập khóa ngoại và chỉ mục không gian GIST."
          : "Step 5: Written successfully to secure PostgreSQL/PostGIS database schemas. GIST Index active."
        );
      } else if (currentStep >= 6) {
        clearInterval(id);
        setSimIntervalId(null);
        setSimStep(-1);
        setSimStatusMsg(lang === 'vi'
          ? "✓ Mô phỏng hoàn tất! Gói tin đã nằm an toàn trong kho lưu trữ PostGIS (Locked in Core)."
          : "✓ Simulation complete! Packet successfully written to PostGIS Database (Locked in Core)."
        );
      }
    }, 4000); 
    setSimIntervalId(id);
  };

  useEffect(() => {
    return () => {
      if (simIntervalId) clearInterval(simIntervalId);
    };
  }, [simIntervalId]);

  // Sidebar tree items for master-detail layout
  const sidebarNodes = [
    { key: 'core-dashboard', label: lang === 'vi' ? 'Tổng kho dữ liệu' : 'Central Data Asset Catalog' },
    { key: 'core-pipeline', label: lang === 'vi' ? 'Sơ đồ luồng & Phê duyệt' : 'Data Pipeline & Egress' },
    { key: 'core-policy', label: lang === 'vi' ? 'Chính sách bảo mật thông tin' : 'Data Governance Policy' },
  ];

  const activeTitle = sidebarNodes.find((n) => n.key === selected)?.label || 'ISCM CORE';

  return (
    <div className="w-full text-neutral-800 antialiased select-none" style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>
      <style>{`
        @keyframes flowDash {
          to {
            stroke-dashoffset: -16;
          }
        }
        .animate-flow-dash {
          animation: flowDash 0.8s linear infinite;
        }
      `}</style>

      {/* ------------------------------------------------------------------ */}
      {/* PAGE HEADER */}
      {/* ------------------------------------------------------------------ */}
      <header className="border-b border-neutral-200 pb-4 mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="text-left">
          <div className="flex items-center gap-2">
            <span className="h-5 w-1.5 bg-[#990000] inline-block"></span>
            <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
              ISCM CORE
            </h1>
            <span className="text-[10px] bg-red-50 border border-red-200 text-[#990000] px-2 py-0.5 font-bold uppercase tracking-wider">
              {lang === 'vi' ? 'Hồ dữ liệu đô thị thông minh' : 'Urban Data Lakehouse'}
            </span>
          </div>
          <p className="text-xs text-neutral-500 mt-1 pl-3.5">
            {lang === 'vi' 
              ? 'Nền tảng quản trị dữ liệu lớn đô thị trên Cloud của Viện Đô thị Thông minh và Quản lý (ISCM-UEH)' 
              : 'Institutional Data Lakehouse hosted on UEH University Cloud - Data Ingestion & RBAC Management'}
          </p>
        </div>

        {/* ACTIVE PROFILE SIMULATOR SELECTOR */}
        <div className="flex items-center gap-2 self-start md:self-auto bg-neutral-50 border border-neutral-200 p-2">
          <UserCheck className="h-4 w-4 text-[#990000]" />
          <div className="text-left">
            <label className="block text-[9px] font-bold text-neutral-400 uppercase tracking-wider leading-none">
              {lang === 'vi' ? 'Mô phỏng phiên người dùng SSO:' : 'SSO Active User Profile Simulator:'}
            </label>
            <select
              value={activeUser.id}
              onChange={(e) => {
                const found = SIMULATED_USERS.find(u => u.id === e.target.value);
                if (found) setActiveUser(found);
              }}
              className="bg-transparent border-none text-xs font-bold text-neutral-800 focus:outline-none cursor-pointer pr-4 mt-0.5"
            >
              <optgroup label="ROLE A: DATA GOVERNANCE BOARD">
                {SIMULATED_USERS.filter(u => u.roleType === 'A').map(u => (
                  <option key={u.id} value={u.id}>{u.name} ({u.title})</option>
                ))}
              </optgroup>
              <optgroup label="ROLE B: PROGRAM DIRECTORS">
                {SIMULATED_USERS.filter(u => u.roleType === 'B').map(u => (
                  <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                ))}
              </optgroup>
              <optgroup label="ROLE C: LAB RESEARCHERS">
                {SIMULATED_USERS.filter(u => u.roleType === 'C').map(u => (
                  <option key={u.id} value={u.id}>{u.name} ({u.title})</option>
                ))}
              </optgroup>
              <optgroup label="ROLE D: EXTERNAL INTERNS">
                {SIMULATED_USERS.filter(u => u.roleType === 'D').map(u => (
                  <option key={u.id} value={u.id}>{u.name} ({u.title})</option>
                ))}
              </optgroup>
            </select>
          </div>
        </div>
      </header>

      {/* ------------------------------------------------------------------ */}
      {/* 2-COLUMN SPLIT MASTER-DETAIL LAYOUT */}
      {/* ------------------------------------------------------------------ */}
      <div className="grid items-start gap-4 md:grid-cols-12">
        
        {/* LEFT VIEWPORT NAVIGATION SIDEBAR */}
        <aside className="border border-neutral-200 bg-white p-2 md:col-span-3">
          <div className="text-[10px] font-bold uppercase tracking-wider text-[#990000] bg-neutral-50 border-b border-neutral-200 py-2 px-3 mb-2 text-left">
            {lang === 'vi' ? 'ĐIỀU HÀNH HỆ THỐNG' : 'LAKEHOUSE CONTROL'}
          </div>
          <ul className="space-y-1">
            {sidebarNodes.map((node) => {
              const isActive = selected === node.key;
              return (
                <li key={node.key}>
                  <button
                    onClick={() => setSelected(node.key)}
                    className={`w-full text-left text-xs py-2 px-3 border border-neutral-100 transition-colors flex items-center justify-between font-bold uppercase ${
                      isActive ? 'bg-[#990000] text-white border-[#990000]' : 'text-neutral-700 hover:bg-neutral-50'
                    }`}
                  >
                    <span>{node.label}</span>
                    <ChevronRight className={`h-3 w-3 shrink-0 ${isActive ? 'text-white' : 'text-neutral-400'}`} />
                  </button>
                </li>
              );
            })}
          </ul>

          <div className="mt-4 p-3 bg-neutral-50 border border-neutral-200 text-left">
            <h4 className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-1.5">
              {lang === 'vi' ? 'THÔNG TIN BẢO MẬT' : 'SESSION SECURITY CONTEXT'}
            </h4>
            <div className="space-y-1.5 text-xs">
              <div>
                <span className="text-[10px] text-neutral-400 block leading-none">{lang === 'vi' ? 'Họ & Tên:' : 'Identity:'}</span>
                <span className="font-bold text-neutral-800">{activeUser.name}</span>
              </div>
              <div>
                <span className="text-[10px] text-neutral-400 block leading-none">{lang === 'vi' ? 'Cấp quyền truy cập:' : 'RBAC Clearance:'}</span>
                <span className="inline-block bg-red-50 text-[#990000] text-[9px] font-mono font-bold px-1.5 py-0.5 border border-red-100 mt-0.5">
                  {activeUser.role}
                </span>
              </div>
              <div className="pt-2 border-t border-neutral-200 mt-2 text-[10px] text-neutral-500">
                {activeUser.roleType === 'A' && (
                  <p className="text-emerald-700 font-semibold">✓ Full Read/Write, System Override, Egress Token Sign Off</p>
                )}
                {activeUser.roleType === 'B' && (
                  <p className="text-blue-700 font-semibold">✓ Schema Read/Write, Approve/Reject Domain Ingestion, Egress Requests</p>
                )}
                {activeUser.roleType === 'C' && (
                  <p className="text-neutral-600 font-semibold">⚠ Write-Only to MinIO Staging, Central Core Read-Only via GIS Connection</p>
                )}
                {activeUser.roleType === 'D' && (
                  <p className="text-red-700 font-semibold">✖ Zero Core Visibility, Community Sandboxed Staging Ingestion Only</p>
                )}
              </div>
            </div>
          </div>
        </aside>

        {/* RIGHT DYNAMIC VIEWPORT */}
        <main className="border border-neutral-200 bg-white p-5 md:col-span-9 min-h-[600px] text-left">
          
          {/* Active section title */}
          <div className="border-l-2 border-[#990000] pl-3 py-0.5 mb-6">
            <h2 className="text-lg font-bold uppercase tracking-wider text-neutral-900 flex items-center gap-2">
              <DatabaseZap className="h-4.5 w-4.5 text-[#990000]" /> {activeTitle}
            </h2>
            <p className="text-[10px] text-neutral-500 uppercase tracking-widest mt-0.5">
              {selected === 'core-dashboard' && (lang === 'vi' ? 'Hệ thống lưu trữ & Quản lý danh mục' : 'Data Catalog & Access Control Panel')}
              {selected === 'core-pipeline' && (lang === 'vi' ? 'Đường ống xử lý dữ liệu và Duyệt luồng ra' : 'Data Ingestion Streams & Access Egress Panel')}
              {selected === 'core-policy' && (lang === 'vi' ? 'Định danh SSO & Cơ chế mã hóa vĩnh viễn' : 'SSO Credentials, Threat Quarantine & Audit Log')}
            </p>
          </div>

          {/* ------------------------------------------------------------------ */}
          {/* VIEWPORT 1: CENTRAL DATA CATALOG DASHBOARD (core-dashboard) */}
          {/* ------------------------------------------------------------------ */}
          {selected === 'core-dashboard' && (
            <div className="space-y-6">
              
              {/* DATA PIPELINE HEALTH INDICATORS */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                <div className="bg-neutral-50 border border-neutral-200 p-3">
                  <div className="flex items-center gap-1.5 text-neutral-400">
                    <UploadCloud className="h-3.5 w-3.5" />
                    <span className="text-[9px] font-bold uppercase tracking-wider">In-Pipeline</span>
                  </div>
                  <div className="text-xl font-bold mt-1 text-neutral-800">{pipelineStats.inPipeline}</div>
                  <span className="text-[9px] text-neutral-400 block mt-0.5">{lang === 'vi' ? 'Mime/SSO Kiểm tra' : 'SSO & Mime checking'}</span>
                </div>
                
                <div className="bg-amber-50 border border-amber-200 p-3">
                  <div className="flex items-center gap-1.5 text-amber-700">
                    <FileWarning className="h-3.5 w-3.5" />
                    <span className="text-[9px] font-bold uppercase tracking-wider">Pending Approval</span>
                  </div>
                  <div className="text-xl font-bold mt-1 text-amber-800">{pipelineStats.pendingApproval}</div>
                  <span className="text-[9px] text-amber-500 block mt-0.5">{lang === 'vi' ? 'Đang nằm trong Buffer' : 'Staging buffer store'}</span>
                </div>

                <div className="bg-blue-50 border border-blue-200 p-3">
                  <div className="flex items-center gap-1.5 text-blue-700">
                    <Cog className="h-3.5 w-3.5" />
                    <span className="text-[9px] font-bold uppercase tracking-wider">ETL Processing</span>
                  </div>
                  <div className="text-xl font-bold mt-1 text-blue-800">{pipelineStats.etlProcessing}</div>
                  <span className="text-[9px] text-blue-500 block mt-0.5">{lang === 'vi' ? 'GeoPandas chuyển hệ' : 'VN-2000 reprojection'}</span>
                </div>

                <div className="bg-emerald-50 border border-emerald-200 p-3">
                  <div className="flex items-center gap-1.5 text-emerald-700">
                    <Warehouse className="h-3.5 w-3.5" />
                    <span className="text-[9px] font-bold uppercase tracking-wider">Locked in Core</span>
                  </div>
                  <div className="text-xl font-bold mt-1 text-emerald-800">{pipelineStats.lockedInCore}</div>
                  <span className="text-[9px] text-emerald-500 block mt-0.5">{lang === 'vi' ? 'Đã lưu PostGIS' : 'Postgres PostGIS Stored'}</span>
                </div>

                <div className="bg-red-50 border border-red-200 p-3">
                  <div className="flex items-center gap-1.5 text-red-700">
                    <ShieldAlert className="h-3.5 w-3.5" />
                    <span className="text-[9px] font-bold uppercase tracking-wider">Quarantined</span>
                  </div>
                  <div className="text-xl font-bold mt-1 text-red-800">{pipelineStats.quarantined}</div>
                  <span className="text-[9px] text-red-500 block mt-0.5">{lang === 'vi' ? 'Cách ly do lỗi/threat' : 'Threat/Geometry errors'}</span>
                </div>
              </div>

              {/* TABS SELECTOR (Pending Buffer vs Central Core) */}
              <div className="border-b border-neutral-200 flex items-center justify-between">
                <div className="flex gap-2">
                  <button
                    onClick={() => setCatalogTab('staging')}
                    className={`py-2 px-3 border-b-2 text-xs font-bold uppercase tracking-wider transition-all ${
                      catalogTab === 'staging' 
                        ? 'border-[#990000] text-[#990000] font-black' 
                        : 'border-transparent text-neutral-500 hover:text-neutral-800'
                    }`}
                  >
                    {lang === 'vi' ? 'Hộp đệm chờ phê duyệt (Staging Buffer)' : 'Pending Approvals (Staging Buffer)'}
                  </button>
                  <button
                    onClick={() => setCatalogTab('core')}
                    className={`py-2 px-3 border-b-2 text-xs font-bold uppercase tracking-wider transition-all ${
                      catalogTab === 'core' 
                        ? 'border-[#990000] text-[#990000] font-black' 
                        : 'border-transparent text-neutral-500 hover:text-neutral-800'
                    }`}
                  >
                    {lang === 'vi' ? 'Tổng kho dữ liệu trung tâm (Central Core)' : 'Central Data Core (Locked/Processed)'}
                  </button>
                </div>

                {activeUser.roleType === 'D' && (
                  <span className="text-[10px] text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 font-bold uppercase tracking-wide">
                    {lang === 'vi' ? 'Giới hạn Intern' : 'Intern Access Restricted'}
                  </span>
                )}
              </div>

              {/* DATA ASSET CATEGORIES FILTER */}
              <div className="flex flex-wrap gap-1 items-center bg-neutral-50 p-2 border border-neutral-200">
                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest px-2">
                  {lang === 'vi' ? 'Phân loại:' : 'Category:'}
                </span>
                {['All', 'Survey Fields (Excel/Form)', 'Spatial Vectors (GIS/Drone)', 'Remote Sensing (Raster/GEE)', 'Sensor Networks (IoT)'].map(cat => (
                  <button
                    key={cat}
                    onClick={() => setCategoryFilter(cat)}
                    className={`text-[10.5px] font-bold px-2.5 py-1 transition-colors ${
                      categoryFilter === cat 
                        ? 'bg-neutral-800 text-white' 
                        : 'bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-100'
                    }`}
                  >
                    {cat === 'All' ? '[All]' : cat}
                  </button>
                ))}
              </div>

              {/* DATA CATALOG GRID */}
              <div className="border border-neutral-200 bg-white">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-neutral-100 text-[10px] font-bold uppercase tracking-wider text-neutral-500 border-b border-neutral-200">
                        <th className="px-4 py-3">{lang === 'vi' ? 'Tên tài sản' : 'Asset Name'}</th>
                        <th className="px-4 py-3">{lang === 'vi' ? 'Nguồn gốc (Lab/Project)' : 'Data Source'}</th>
                        <th className="px-4 py-3">CRS</th>
                        <th className="px-4 py-3">{lang === 'vi' ? 'Phạm vi địa lý' : 'Geographic Scope'}</th>
                        <th className="px-4 py-3">Metadata</th>
                        <th className="px-4 py-3">{lang === 'vi' ? 'Độ bảo mật' : 'Privacy'}</th>
                        <th className="px-4 py-3 text-right">Egress Share</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-200 text-xs">
                      {/* Zero visibility implementation for Role D on central core */}
                      {activeUser.roleType === 'D' && catalogTab === 'core' ? (
                        <tr>
                          <td colSpan={7} className="px-6 py-12 text-center bg-red-50/20 text-neutral-500 border border-dashed border-red-200">
                            <div className="flex flex-col items-center justify-center gap-2">
                              <ShieldX className="h-8 w-8 text-[#990000] animate-bounce" />
                              <p className="font-bold text-[#990000] uppercase tracking-wider">
                                {lang === 'vi' ? 'KHÓA TRUY CẬP HỆ THỐNG' : 'ROLE ACCESS LOCKED'}
                              </p>
                              <p className="text-xs max-w-md mt-1">
                                {lang === 'vi'
                                  ? 'Tài khoản Phân quyền Nhóm D (Intern / Thực tập sinh) không được phép truy xuất Tổng kho Dữ liệu Trung tâm (Central Core). Vui lòng chuyển sang Hộp đệm để xem tài sản nháp.'
                                  : 'SSO Directory confirms your Role D (Intern) has zero visibility into the Central Data Core. Database tables are hidden by system encryption.'}
                              </p>
                            </div>
                          </td>
                        </tr>
                      ) : filteredAssets.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="px-4 py-8 text-center text-neutral-400">
                            {lang === 'vi' ? 'Không tìm thấy tài sản dữ liệu đô thị nào phù hợp.' : 'No urban data assets found matching the criteria.'}
                          </td>
                        </tr>
                      ) : (
                        filteredAssets.map(asset => {
                          return (
                            <tr key={asset.id} className="hover:bg-neutral-50/50 transition-colors">
                              {/* Asset Name */}
                              <td className="px-4 py-3 font-semibold text-neutral-800">
                                <span className="block truncate max-w-[200px]" title={asset.name}>{asset.name}</span>
                                <span className="block text-[9px] text-neutral-400 font-mono mt-0.5">
                                  {asset.id} · {asset.size}
                                </span>
                              </td>
                              
                              {/* Source */}
                              <td className="px-4 py-3 text-neutral-600">
                                <span className="text-[10px] bg-neutral-100 px-1.5 py-0.5 border border-neutral-200 font-bold uppercase tracking-wider text-neutral-700">
                                  {asset.source}
                                </span>
                              </td>
                              
                              {/* CRS */}
                              <td className="px-4 py-3 text-neutral-500 font-mono text-[10px]">
                                {asset.crs}
                              </td>
                              
                              {/* Geographic Scope */}
                              <td className="px-4 py-3 text-neutral-600">
                                {asset.scope}
                              </td>
                              
                              {/* Metadata Status */}
                              <td className="px-4 py-3">
                                <span className={`inline-flex items-center gap-1 text-[10px] font-bold ${
                                  asset.metadataStatus === 'Complete' 
                                    ? 'text-emerald-700' 
                                    : asset.metadataStatus === 'Under Review' 
                                      ? 'text-amber-700' 
                                      : 'text-red-700'
                                }`}>
                                  <span className={`h-1.5 w-1.5 rounded-full ${
                                    asset.metadataStatus === 'Complete' 
                                      ? 'bg-emerald-600' 
                                      : asset.metadataStatus === 'Under Review' 
                                        ? 'bg-amber-500' 
                                        : 'bg-red-600'
                                  }`}></span>
                                  {asset.metadataStatus}
                                </span>
                              </td>
                              
                              {/* Privacy Level */}
                              <td className="px-4 py-3">
                                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 border ${
                                  asset.privacyLevel === 'Public'
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                    : asset.privacyLevel === 'Internal'
                                      ? 'bg-blue-50 text-blue-700 border-blue-200'
                                      : 'bg-red-50 text-red-700 border-red-200'
                                }`}>
                                  {asset.privacyLevel}
                                </span>
                              </td>
                              
                              {/* Egress Share Column */}
                              <td className="px-4 py-3 text-right">
                                <div className="inline-flex flex-col items-end gap-1">
                                  
                                  {/* Staging Tab Controls (Approve/Reject) */}
                                  {catalogTab === 'staging' ? (
                                    <div className="flex gap-1">
                                      {asset.status === 'Pending Approval' ? (
                                        <>
                                          <button
                                            onClick={() => handleApproveStagingAsset(asset.id)}
                                            className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold uppercase tracking-wider transition-colors"
                                          >
                                            {lang === 'vi' ? 'Duyệt lưu' : 'Approve'}
                                          </button>
                                          <button
                                            onClick={() => handleQuarantineStagingAsset(asset.id)}
                                            className="px-2 py-1 bg-[#990000] hover:bg-red-800 text-white text-[10px] font-bold uppercase tracking-wider transition-colors"
                                          >
                                            {lang === 'vi' ? 'Cách ly' : 'Quarantine'}
                                          </button>
                                        </>
                                      ) : (
                                        <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 border ${
                                          asset.status === 'In-Pipeline'
                                            ? 'bg-neutral-100 text-neutral-500 border-neutral-300'
                                            : asset.status === 'ETL Processing'
                                              ? 'bg-blue-50 text-blue-700 border-blue-200'
                                              : 'bg-red-50 text-red-700 border-red-200'
                                        }`}>
                                          {asset.status}
                                        </span>
                                      )}
                                    </div>
                                  ) : (
                                    /* Central Core Tab Egress Controls */
                                    <button
                                      onClick={() => handleEgressShareClick(asset)}
                                      className={`inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider border transition-colors ${
                                        asset.egressState === 'green'
                                          ? 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100'
                                          : asset.egressState === 'yellow'
                                            ? 'bg-amber-50 text-amber-700 border-amber-300 hover:bg-amber-100'
                                            : 'bg-red-50 text-red-700 border-red-300 hover:bg-red-100'
                                      }`}
                                    >
                                      {asset.egressState === 'green' && (
                                        <>
                                          <Link2 className="h-3 w-3" />
                                          <span>[Public Link]</span>
                                        </>
                                      )}
                                      {asset.egressState === 'yellow' && (
                                        <>
                                          <FileWarning className="h-3 w-3" />
                                          <span>[Pending Requests]</span>
                                        </>
                                      )}
                                      {asset.egressState === 'red' && (
                                        <>
                                          <LockKeyhole className="h-3 w-3" />
                                          <span>[Secure Stream - API Only]</span>
                                        </>
                                      )}
                                    </button>
                                  )}

                                  {/* Details of active requests under button */}
                                  {asset.egressState === 'yellow' && catalogTab === 'core' && (
                                    <span className="text-[9px] text-amber-600 font-bold block animate-pulse">
                                      {asset.id === 'ASSET-003' ? '3 Requests Active' : '5 Requests Active'}
                                    </span>
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
                <div className="bg-neutral-50 px-4 py-2 border-t border-neutral-200 flex flex-col sm:flex-row sm:items-center justify-between text-[10px] text-neutral-500 gap-1">
                  <span>
                    {lang === 'vi'
                      ? '* Dữ liệu lưu trữ trong kho trung tâm đã được chạy ETL chuẩn hóa hệ tọa độ VN-2000 kinh tuyến trục TP.HCM.'
                      : '* All assets stored in the Central Core are automatically projected to VN-2000 coordinate reference system (HCM zone).'}
                  </span>
                  <span className="font-semibold text-[#990000]">
                    {lang === 'vi' ? `Vai trò hiện tại: ${activeUser.role}` : `Current Session: ${activeUser.role}`}
                  </span>
                </div>
              </div>

              {/* GENERATED DOWNLOAD URL POPUP */}
              {generatedLink && (
                <div className="bg-neutral-900 text-white p-4 border-l-4 border-emerald-500 animate-in fade-in duration-200 text-left">
                  <div className="flex items-center justify-between border-b border-neutral-800 pb-2 mb-2">
                    <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
                      <CheckCircle2 className="h-4 w-4" /> {generatedLink.type}
                    </span>
                    <button onClick={() => setGeneratedLink(null)} className="text-neutral-400 hover:text-white">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <p className="text-[10px] text-neutral-400 font-bold uppercase">{lang === 'vi' ? 'Tài sản:' : 'Asset Resource:'}</p>
                  <p className="text-sm font-bold mt-0.5 text-neutral-100">{generatedLink.assetName}</p>
                  <div className="mt-3 flex items-center gap-2 bg-neutral-950 p-2 border border-neutral-800">
                    <input
                      type="text"
                      readOnly
                      value={generatedLink.url}
                      className="bg-transparent border-none text-xs font-mono flex-1 text-emerald-300 focus:outline-none select-all"
                    />
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(generatedLink.url);
                        alert(lang === 'vi' ? 'Đã sao chép đường dẫn!' : 'Link copied to clipboard!');
                      }}
                      className="p-1 hover:bg-neutral-800 transition-colors"
                      title="Copy Link"
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <div className="mt-2 text-[10px] text-neutral-400 flex items-center gap-1">
                    <Timer className="h-3 w-3 text-red-500" />
                    <span>
                      {lang === 'vi' 
                        ? `Mã thông báo chia sẻ có hiệu lực giới hạn: Tự huỷ sau ${generatedLink.expires}` 
                        : `This secure download URL is time-limited: Auto-deletes in ${generatedLink.expires}`}
                    </span>
                  </div>
                </div>
              )}

              {/* ORGANIZATIONAL DIRECTORY REFERENCE (RBAC MAP) */}
              <div className="border border-neutral-200 p-4 bg-neutral-50 text-left space-y-4">
                <div className="border-b border-neutral-200 pb-2">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-700 flex items-center gap-1.5">
                    <Users className="h-4 w-4 text-neutral-500" />
                    {lang === 'vi' ? 'DANH BẠ CƠ CẤU PHÂN QUYỀN VIỆN ISCM' : 'INSTITUTIONAL ACCESS ROLES & DIRECTORY'}
                  </h3>
                  <p className="text-[10px] text-neutral-400 mt-0.5">
                    {lang === 'vi' 
                      ? 'Áp dụng phân quyền vai trò (RBAC) trên Cloud dựa theo Tờ trình vận hành số hiệu 08/2026.'
                      : 'Role-Based Access Control directory mapped from ISCM operational charter.'}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs leading-relaxed">
                  {/* ROLE A */}
                  <div className="bg-white p-3 border border-neutral-200 space-y-2">
                    <span className="block font-black text-[#990000] text-[9.5px] uppercase tracking-wide">
                      ROLE A: GOVERNANCE BOARD
                    </span>
                    <p className="text-[9px] text-neutral-400 uppercase tracking-widest leading-tight">
                      Full Read/Write, System Override, Egress Sign Off
                    </p>
                    <ul className="space-y-1 font-mono text-[10px] text-neutral-600 border-t border-neutral-100 pt-1.5">
                      <li>• Assoc.Prof. Tu Anh Trinh</li>
                      <li>• Hung Quoc Viet Nguyen</li>
                    </ul>
                  </div>

                  {/* ROLE B */}
                  <div className="bg-white p-3 border border-neutral-200 space-y-2">
                    <span className="block font-black text-blue-800 text-[9.5px] uppercase tracking-wide">
                      ROLE B: DATA STEWARDS
                    </span>
                    <p className="text-[9px] text-neutral-400 uppercase tracking-widest leading-tight">
                      Program Read/Write, Approve/Reject Domain Ingest
                    </p>
                    <ul className="space-y-1 font-mono text-[9px] text-neutral-600 border-t border-neutral-100 pt-1.5">
                      <li>• Mai Quynh Thi Tran</li>
                      <li>• Hien The Dang</li>
                      <li>• Hoai Nguyen Pham</li>
                      <li>• Dr. Lan Ngoc Hoang</li>
                      <li>• Dr. Khang Van Huynh</li>
                      <li>• Dung Lai Phuong</li>
                      <li>• Tien Thuy Thi Le</li>
                    </ul>
                  </div>

                  {/* ROLE C */}
                  <div className="bg-white p-3 border border-neutral-200 space-y-2">
                    <span className="block font-black text-neutral-800 text-[9.5px] uppercase tracking-wide">
                      ROLE C: LAB RESEARCHERS
                    </span>
                    <p className="text-[9px] text-neutral-400 uppercase tracking-widest leading-tight">
                      Staging Write-Only, Core GIS Read-Only Connect
                    </p>
                    <ul className="space-y-1 font-mono text-[9px] text-neutral-600 border-t border-neutral-100 pt-1.5 max-h-[120px] overflow-y-auto">
                      <li>• Tam Phuc Le Do</li>
                      <li>• Nam Thanh Le</li>
                      <li>• Long Phi Hoang</li>
                      <li>• Dao Chi Vo</li>
                      <li>• Quang Tran Vuong</li>
                      <li>• Sandhya Rao</li>
                      <li>• Nam-Hai Hoang</li>
                      <li>• Daniela Hurtarte</li>
                      <li>• Trung Nguyen Tan</li>
                      <li>• An Truong Phan Le</li>
                      <li>• Phuc Hoang Nguyen</li>
                      <li>• Toan Phuc Le</li>
                      <li>• Vu Anh Thai</li>
                      <li>• Tram Quynh Nguyen</li>
                      <li>• Binh Thanh Pham Luu</li>
                      <li>• Tai Vinh Tran</li>
                    </ul>
                  </div>

                  {/* ROLE D */}
                  <div className="bg-white p-3 border border-neutral-200 space-y-2">
                    <span className="block font-black text-red-800 text-[9.5px] uppercase tracking-wide">
                      ROLE D: EXTERNAL INTERNS
                    </span>
                    <p className="text-[9px] text-neutral-400 uppercase tracking-widest leading-tight">
                      Sandboxed Ingestion, Zero Central Core Visibility
                    </p>
                    <ul className="space-y-1 font-mono text-[9px] text-neutral-600 border-t border-neutral-100 pt-1.5">
                      <li>• Dung Hong Vo Pham</li>
                      <li>• Bùi Thảo Nguyên</li>
                      <li>• Nguyen Ha Cam Tien</li>
                      <li>• Luong Thi Thuy An</li>
                      <li>• Nguyen Minh Huy</li>
                      <li>• Truong Thanh Dat</li>
                      <li>• Nguyen Ngọc Thien</li>
                      <li>• Ngô An Phú</li>
                      <li>• Nguyễn Lương Minh Thư</li>
                      <li>• Hoàng Trương Tiến Đạt</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ------------------------------------------------------------------ */}
          {/* VIEWPORT 2: DATA PIPELINE FLOW & ACCESS EGRESS PANEL (core-pipeline) */}
          {/* ------------------------------------------------------------------ */}
          {selected === 'core-pipeline' && (
            <div className="space-y-6">
              
              {/* DUAL VIEW SPLIT PANEL */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                
                {/* LEFT PANEL: DATA PIPELINE FLOW */}
                <div className="lg:col-span-7 border border-neutral-200 p-4 bg-white space-y-4">
                  <div className="border-b border-neutral-200 pb-2 flex items-center justify-between">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-700 flex items-center gap-1.5">
                      <Activity className="h-4.5 w-4.5 text-[#990000]" />
                      {lang === 'vi' ? 'LUỒNG XỬ LÝ HỒ DỮ LIỆU' : 'DATA PIPELINE FLOW'}
                    </h3>
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => setSelectedSource('external')}
                        className={`text-[9px] font-bold px-2 py-0.5 border ${
                          selectedSource === 'external' 
                            ? 'bg-[#990000] text-white border-[#990000]' 
                            : 'bg-white text-neutral-600 border-neutral-300'
                        }`}
                      >
                        {lang === 'vi' ? 'Ngoại vi / Interns' : 'Staging Area (Role D)'}
                      </button>
                      <button
                        onClick={() => setSelectedSource('internal')}
                        className={`text-[9px] font-bold px-2 py-0.5 border ${
                          selectedSource === 'internal' 
                            ? 'bg-[#990000] text-white border-[#990000]' 
                            : 'bg-white text-neutral-600 border-neutral-300'
                        }`}
                      >
                        {lang === 'vi' ? 'Nội bộ / Specialists' : 'Labs Upload (Role C)'}
                      </button>
                    </div>
                  </div>

                  {/* Pipeline Message Banner */}
                  {simStatusMsg ? (
                    <div className="bg-red-50 border border-red-200 p-2 text-[10px] font-semibold text-[#990000] flex items-center gap-1.5 animate-pulse">
                      <Activity className="h-3.5 w-3.5 shrink-0" />
                      <span>{simStatusMsg}</span>
                    </div>
                  ) : (
                    <div className="bg-neutral-50 border border-neutral-200 p-2 text-[10px] text-neutral-500">
                      {lang === 'vi' 
                        ? 'Chọn nguồn và bấm Chạy để mô phỏng tiến trình kiểm duyệt an toàn dữ liệu.' 
                        : 'Select data ingestion source and run simulation to trace automated safety validation.'}
                    </div>
                  )}

                  {/* SVG DIAGRAM */}
                  <div className="bg-neutral-900 p-4 border border-neutral-800">
                    <svg viewBox="0 0 580 340" className="w-full h-auto overflow-visible select-none">
                      <defs>
                        <filter id="glow-pipe" x="-20%" y="-20%" width="140%" height="140%">
                          <feGaussianBlur stdDeviation="3" result="blur" />
                          <feComposite in="SourceGraphic" in2="blur" operator="over" />
                        </filter>
                      </defs>

                      {/* Connection lines */}
                      {/* Source A (External) -> Ingestion Hub */}
                      <path
                        d="M 120 70 C 150 70, 160 160, 200 160"
                        stroke={selectedSource === 'external' ? '#990000' : '#333333'}
                        strokeWidth="2.5"
                        fill="none"
                      />
                      {selectedSource === 'external' && (
                        <path
                          d="M 120 70 C 150 70, 160 160, 200 160"
                          stroke="#ff4d4d"
                          strokeWidth="2.5"
                          fill="none"
                          strokeDasharray="5,5"
                          className="animate-flow-dash"
                        />
                      )}

                      {/* Source B (Internal) -> Ingestion Hub */}
                      <path
                        d="M 120 250 C 150 250, 160 160, 200 160"
                        stroke={selectedSource === 'internal' ? '#990000' : '#333333'}
                        strokeWidth="2.5"
                        fill="none"
                      />
                      {selectedSource === 'internal' && (
                        <path
                          d="M 120 250 C 150 250, 160 160, 200 160"
                          stroke="#ff4d4d"
                          strokeWidth="2.5"
                          fill="none"
                          strokeDasharray="5,5"
                          className="animate-flow-dash"
                        />
                      )}

                      {/* Core Pipeline Paths */}
                      <path d="M 300 160 L 330 160" stroke="#333333" strokeWidth="2.5" fill="none" />
                      {simStep >= 1 && <path d="M 300 160 L 330 160" stroke="#ff4d4d" strokeWidth="2.5" fill="none" strokeDasharray="4,4" className="animate-flow-dash" />}

                      <path d="M 430 160 L 460 160" stroke="#333333" strokeWidth="2.5" fill="none" />
                      {simStep >= 3 && <path d="M 430 160 L 460 160" stroke="#ff4d4d" strokeWidth="2.5" fill="none" strokeDasharray="4,4" className="animate-flow-dash" />}

                      {/* Traveling Packet Circle */}
                      {simStep >= 0 && (
                        <circle
                          cx={
                            simStep === 0 ? (selectedSource === 'external' ? 120 : 120) :
                            simStep === 1 ? 250 :
                            simStep === 2 ? 260 :
                            simStep === 3 ? 380 :
                            simStep === 4 ? 390 :
                            simStep === 5 ? 510 : 250
                          }
                          cy={
                            simStep === 0 ? (selectedSource === 'external' ? 70 : 250) :
                            simStep === 1 || simStep === 2 || simStep === 3 || simStep === 4 || simStep === 5 ? 160 : 160
                          }
                          r={7}
                          fill="#ff4d4d"
                          className="animate-pulse"
                          style={{ transition: 'all 0.8s ease-in-out' }}
                          filter="url(#glow-pipe)"
                        />
                      )}

                      {/* Source Nodes */}
                      {/* External Inputs */}
                      <g>
                        <rect x="20" y="30" width="100" height="70" rx="3" fill="#0f0f11" stroke={selectedSource === 'external' ? '#ff4d4d' : '#27272a'} />
                        <rect x="20" y="30" width="100" height="15" fill="#1f1f23" />
                        <text x="25" y="41" fill="#ffffff" className="font-sans text-[7.5px] font-bold">STAGING BUFFER</text>
                        <text x="25" y="58" fill="#a1a1aa" className="font-sans text-[7px]">Role D & Externals</text>
                        <text x="25" y="68" fill="#ffffff" className="font-mono text-[7px]">ClamAV quarantine</text>
                        <text x="25" y="78" fill="#ff4d4d" className="font-sans text-[7px] font-bold">Restricted Access</text>
                      </g>

                      {/* Internal Labs */}
                      <g>
                        <rect x="20" y="210" width="100" height="70" rx="3" fill="#0f0f11" stroke={selectedSource === 'internal' ? '#ff4d4d' : '#27272a'} />
                        <rect x="20" y="210" width="100" height="15" fill="#1f1f23" />
                        <text x="25" y="221" fill="#ffffff" className="font-sans text-[7.5px] font-bold">INTERNAL LABS</text>
                        <text x="25" y="238" fill="#a1a1aa" className="font-sans text-[7px]">Role C Specialists</text>
                        <text x="25" y="248" fill="#ffffff" className="font-mono text-[7px]">Direct MinIO upload</text>
                        <text x="25" y="258" fill="#ff4d4d" className="font-sans text-[7px] font-bold">Staging upload ok</text>
                      </g>

                      {/* Core Processing Steps */}
                      {/* Step 1: Ingestion & API Gateway */}
                      <g>
                        <rect x="200" y="110" width="100" height="100" rx="3" fill="#0f0f11" stroke={simStep === 1 || simStep === 2 ? '#ff4d4d' : '#27272a'} />
                        <rect x="200" y="110" width="100" height="15" fill="#1f1f23" />
                        <text x="205" y="121" fill="#ffffff" className="font-sans text-[7.5px] font-bold">1 & 2. INGEST & API</text>
                        <text x="205" y="140" fill="#a1a1aa" className="font-sans text-[7px]">SSO Credentials Check</text>
                        <text x="205" y="150" fill="#ffffff" className="font-mono text-[7px]">Keycloak LDAP JWT</text>
                        <text x="205" y="165" fill="#a1a1aa" className="font-sans text-[7px]">Threat screening</text>
                        <text x="205" y="175" fill="#ffffff" className="font-mono text-[7px]">Virus Scan: ClamAV</text>
                        <rect x="205" y="185" width="90" height="12" fill="#18181b" stroke="#27272a" />
                        <text x="250" y="193" textAnchor="middle" fill="#ff4d4d" className="font-mono text-[6.5px] font-bold">SSL/TLS SSLv3</text>
                      </g>

                      {/* Step 2: Sandbox Audit & Python ETL */}
                      <g>
                        <rect x="330" y="110" width="100" height="100" rx="3" fill="#0f0f11" stroke={simStep === 3 || simStep === 4 ? '#ff4d4d' : '#27272a'} />
                        <rect x="330" y="110" width="100" height="15" fill="#1f1f23" />
                        <text x="335" y="121" fill="#ffffff" className="font-sans text-[7.5px] font-bold">3 & 4. SANDBOX & ETL</text>
                        <text x="335" y="140" fill="#a1a1aa" className="font-sans text-[7px]">Data Steward review</text>
                        <text x="335" y="150" fill="#ffffff" className="font-mono text-[7px]">Director Board approve</text>
                        <text x="335" y="165" fill="#a1a1aa" className="font-sans text-[7px]">CRS Reprojection</text>
                        <text x="335" y="175" fill="#ffffff" className="font-mono text-[7px]">VN-2000 (EPSG:5899)</text>
                        <rect x="335" y="185" width="90" height="12" fill="#18181b" stroke="#27272a" />
                        <text x="380" y="193" textAnchor="middle" fill="#ff4d4d" className="font-mono text-[6.5px] font-bold">GeoPandas Engine</text>
                      </g>

                      {/* Step 3: Stored PostGIS */}
                      <g>
                        <rect x="460" y="110" width="100" height="100" rx="3" fill="#0f0f11" stroke={simStep === 5 ? '#ff4d4d' : '#27272a'} />
                        <rect x="460" y="110" width="100" height="15" fill="#1f1f23" />
                        <text x="465" y="121" fill="#ffffff" className="font-sans text-[7.5px] font-bold">5. STORED POSTGIS</text>
                        <text x="465" y="140" fill="#a1a1aa" className="font-sans text-[7px]">Spatial Database</text>
                        <text x="465" y="150" fill="#ffffff" className="font-mono text-[7px]">PostgreSQL 15 / PostGIS</text>
                        <text x="465" y="165" fill="#a1a1aa" className="font-sans text-[7px]">Spatial Index</text>
                        <text x="465" y="175" fill="#ffffff" className="font-mono text-[7px]">GIST R-Tree Enabled</text>
                        <rect x="465" y="185" width="90" height="12" fill="#18181b" stroke="#27272a" />
                        <text x="510" y="193" textAnchor="middle" fill="#ff4d4d" className="font-mono text-[6.5px] font-bold">Locked in Core</text>
                      </g>
                    </svg>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <span className="text-[10px] text-neutral-400">
                      * Ingestion Hub buffer pools are hosted on university MinIO S3 nodes.
                    </span>
                    <button
                      onClick={startSimulator}
                      className="bg-[#990000] hover:bg-red-800 text-white font-bold text-xs uppercase tracking-wider py-1.5 px-3 transition-colors flex items-center gap-1 shrink-0"
                    >
                      {simIntervalId ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                      {simIntervalId ? (lang === 'vi' ? 'Dừng mô phỏng' : 'Stop') : (lang === 'vi' ? 'Chạy mô phỏng' : 'Run Ingestion')}
                    </button>
                  </div>
                </div>

                {/* RIGHT PANEL: ACCESS & EGRESS CONTROL PANEL */}
                <div className="lg:col-span-5 border border-neutral-200 p-4 bg-white space-y-4">
                  <div className="border-b border-neutral-200 pb-2">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-[#990000] flex items-center gap-1.5">
                      <LockKeyhole className="h-4.5 w-4.5 text-[#990000]" />
                      {lang === 'vi' ? 'KIỂM SOÁT LUỒNG RA (EGRESS)' : 'ACCESS & EGRESS CONTROL PANEL'}
                    </h3>
                  </div>

                  <div className="bg-neutral-50 border border-neutral-200 p-3 text-left space-y-3">
                    <div className="flex items-center justify-between border-b border-neutral-200 pb-2">
                      <span className="text-[10px] bg-amber-50 text-amber-800 border border-amber-200 font-bold px-1.5 py-0.5 uppercase tracking-wide">
                        {activeRequest.status}
                      </span>
                      <span className="text-[9px] font-mono text-neutral-400">{activeRequest.id}</span>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div>
                        <span className="text-[10px] text-neutral-400 block leading-none">{lang === 'vi' ? 'Người yêu cầu:' : 'External Requester:'}</span>
                        <span className="font-bold text-neutral-800">{activeRequest.requester}</span>
                        <span className="text-[10px] text-neutral-500 block leading-none mt-0.5">{activeRequest.institution}</span>
                      </div>
                      
                      <div>
                        <span className="text-[10px] text-neutral-400 block leading-none">{lang === 'vi' ? 'Tài sản yêu cầu:' : 'Requested Asset Layer:'}</span>
                        <span className="font-bold text-[#990000]">{activeRequest.assetName}</span>
                        <span className="text-[9px] text-neutral-400 block font-mono mt-0.5">Asset ID: {activeRequest.assetId}</span>
                      </div>

                      <div>
                        <span className="text-[10px] text-neutral-400 block leading-none">{lang === 'vi' ? 'Mục đích sử dụng:' : 'Usage Purpose Description:'}</span>
                        <p className="text-neutral-600 mt-1 leading-snug italic bg-white p-2 border border-neutral-100">
                          "{activeRequest.purpose}"
                        </p>
                      </div>

                      {activeRequest.token && (
                        <div className="bg-emerald-50 border border-emerald-200 p-2 text-emerald-800 font-bold">
                          <span className="text-[9px] text-emerald-600 block uppercase leading-none">Security Token Generated:</span>
                          <span className="text-xs font-mono select-all block mt-1">{activeRequest.token}</span>
                        </div>
                      )}
                    </div>

                    {/* Action buttons grid */}
                    <div className="grid grid-cols-1 gap-2 pt-2 border-t border-neutral-200">
                      <button
                        onClick={handleApproveRequest}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold uppercase tracking-wider py-2 transition-colors"
                      >
                        {lang === 'vi' ? 'Phê duyệt cấp quyền' : 'Approve Access (Generate Link)'}
                      </button>
                      <button
                        onClick={handleGenerateTempToken}
                        className="w-full border border-neutral-300 bg-white hover:border-[#990000] hover:text-[#990000] text-neutral-700 text-[11px] font-bold uppercase tracking-wider py-2 transition-colors"
                      >
                        {lang === 'vi' ? 'Tạo Token tạm thời' : 'Generate Temporary Token'}
                      </button>
                      <button
                        onClick={handleDenyAndMask}
                        className="w-full bg-neutral-800 hover:bg-neutral-900 text-white text-[11px] font-bold uppercase tracking-wider py-2 transition-colors"
                      >
                        {lang === 'vi' ? 'Từ chối & Che giấu thuộc tính' : 'Deny & Mask Attributes'}
                      </button>
                    </div>
                  </div>

                  <div className="p-3 bg-red-50/50 border border-red-200/50 text-[11px] text-red-800 text-left">
                    <p className="font-bold flex items-center gap-1">
                      <ShieldAlert className="h-3.5 w-3.5 shrink-0" />
                      {lang === 'vi' ? 'Chính sách Egress (Mục 3.2):' : 'Egress Governance Policy Rule:'}
                    </p>
                    <p className="mt-1 leading-snug">
                      {lang === 'vi'
                        ? 'Dữ liệu chỉ lưu hành nội bộ hoặc mật bắt buộc phải che giấu thông tin cá nhân và định dạng hình học (Geom Masking) trước khi phát hành mã thông báo ra bên ngoài mạng UEH.'
                        : 'Confidential geometric assets require attribute masking and token constraints verification prior to staging external delivery.'}
                    </p>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* ------------------------------------------------------------------ */}
          {/* VIEWPORT 3: DATA GOVERNANCE POLICY (core-policy) */}
          {/* ------------------------------------------------------------------ */}
          {selected === 'core-policy' && (
            <div className="grid gap-5 grid-cols-1 md:grid-cols-2 text-left">
              
              {/* Security Policy Details */}
              <div className="border border-neutral-200 p-5 space-y-4 bg-white">
                <div className="flex items-center gap-2 border-b border-neutral-200 pb-2">
                  <ShieldCheck className="h-5 w-5 text-emerald-600" />
                  <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-800">
                    {lang === 'vi' ? 'Quy định Xác thực & Định danh SSO' : 'SSO Identity Provider Integration'}
                  </h3>
                </div>

                <div className="space-y-3 text-xs text-neutral-600 leading-relaxed">
                  <div>
                    <span className="block font-bold text-neutral-800">
                      1. Định danh Tập trung (UEH SSO Identity)
                    </span>
                    <p className="mt-1">
                      {lang === 'vi' 
                        ? 'Toàn bộ cán bộ, nghiên cứu viên và cộng tác viên khi kết nối vào Hồ dữ liệu ISCM CORE bắt buộc phải đi qua cổng xác thực Keycloak SSO sử dụng tài khoản email đuôi @ueh.edu.vn.'
                        : 'All staff, researchers, and interns accessing the ISCM CORE lakehouse must authenticate via Keycloak Identity Provider using official university email accounts.'}
                    </p>
                  </div>
                  
                  <div>
                    <span className="block font-bold text-neutral-800">
                      2. Môi trường Cách ly (Malware & Script Quarantine)
                    </span>
                    <p className="mt-1">
                      {lang === 'vi'
                        ? 'Mọi tệp tin không gian tải lên từ Role D (Interns) hoặc đối tác sẽ được cách ly tại phân vùng buffer độc lập. Quá trình quét virus và định dạng hình học tự động (Topology constraints) sẽ được kích hoạt trước khi gửi ticket phê duyệt.'
                        : 'Geospatial files uploaded by Role D or external streams are quarantined in a sandbox buffer. Automatic antivirus (ClamAV) and topology checkers validate the file before staging.'}
                    </p>
                  </div>

                  <div>
                    <span className="block font-bold text-neutral-800">
                      3. Mã hóa & Bảo mật kết nối
                    </span>
                    <p className="mt-1">
                      {lang === 'vi'
                        ? 'Đường truyền dữ liệu kết nối trực tiếp từ QGIS / ArcGIS Pro đến máy chủ PostgreSQL/PostGIS bắt buộc phải cấu hình mã hóa SSL Mode (Require). Mọi hoạt động truy xuất thô được ghi nhận vĩnh viễn trên Audit Logs.'
                        : 'Direct database connections from QGIS or ArcGIS Pro clients to PostGIS tables require SSL encryption mode. Raw access logs are pushed to immutable log streams on the university cloud.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Audit Log Mock */}
              <div className="border border-neutral-200 p-5 space-y-4 bg-white flex flex-col">
                <div className="flex items-center gap-2 border-b border-neutral-200 pb-2">
                  <Terminal className="h-5 w-5 text-neutral-700" />
                  <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-800">
                    {lang === 'vi' ? 'Nhật ký vận hành hệ thống (Audit Logs)' : 'Immutable Audit Log Console'}
                  </h3>
                </div>

                <div className="bg-neutral-900 p-3 rounded font-mono text-[10.5px] leading-normal text-emerald-400 flex-1 overflow-y-auto max-h-[300px] select-text">
                  <p className="text-neutral-500">[2026-07-09T14:30:15Z] SSO Sync: Synchronized 35 active LDAP user sessions.</p>
                  <p className="text-neutral-500">[2026-07-09T14:31:02Z] JWT Auth: User "tuanh.trinh@ueh.edu.vn" authenticated successfully.</p>
                  <p className="text-neutral-500">[2026-07-09T14:31:45Z] Sandbox: Ingestion buffer "ASSET-005" passed ClamAV security screening.</p>
                  <p className="text-[#ff4d4d] font-bold">[2026-07-09T14:32:10Z] POLICY BLOCKED: User "intern.huy@ueh.edu.vn" (Role D) denied read query on Confidential tables.</p>
                  <p className="text-emerald-300">[2026-07-09T14:33:04Z] API Egress: Temporary link issued for ASSET-002 (Token: TEMP-8AF2D) by Steward "hien.dang@ueh.edu.vn".</p>
                  <p className="text-neutral-500">[2026-07-09T14:34:00Z] ETL Engine: Successfully reprojected "ASSET-007" coordinates to VN-2000 CRS.</p>
                  <p className="text-emerald-300">[2026-07-09T14:35:12Z] DB Core: Spatial GIST index rebuilt on table "iscm_spatial_core.hue_heritage_layers".</p>
                </div>

                <div className="text-[10px] text-neutral-500 mt-2 text-right">
                  {lang === 'vi' ? '* Nhật ký vận hành được lưu vĩnh viễn không thể sửa xóa.' : '* Logs are cryptographically signed and stored in a read-only logging bucket.'}
                </div>
              </div>

            </div>
          )}

        </main>
      </div>
    </div>
  );
}

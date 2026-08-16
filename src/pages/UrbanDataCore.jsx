import { useState, useEffect, useMemo, useRef } from 'react';
import {
  Database, HardDrive, ShieldCheck, ShieldAlert, ShieldX, Lock, Globe2,
  CheckCircle2, Clock, Filter, Search, Download, Wifi, FileSpreadsheet,
  Layers, Satellite, Activity, ChevronDown, ChevronRight, X, Copy,
  Info, Play, UploadCloud, Check, ArrowRight, Terminal, Package, Radio,
  FlaskConical, Map, SlidersHorizontal, RefreshCw, AlertCircle, Inbox,
  Image, Video, Folder, FolderOpen, AlertTriangle, GitBranch, History,
  Eye, Edit3, Trash2, FileText, ZoomIn, RotateCcw, Volume2, Maximize2,
  BookOpen, Link2, User, CalendarDays, BadgeInfo, Cpu
} from 'lucide-react';

// ─────────────────────────────────────────────────────────────
// 7 PRODUCTION ASSET ROWS
// ─────────────────────────────────────────────────────────────
const MASTER_ASSETS = [
  {
    id: 'PSA-Q1-2026-0002',
    name: 'District 1 Sidewalk Survey Data — Phase 2',
    sourceLab: 'Public Space Living Lab', sourceLabShort: 'PS Lab', sourceColor: 'rose',
    typeTag: 'SURVEY (Excel)', typeIcon: FileSpreadsheet, typeColor: 'violet',
    crs: 'N/A (Tabular attributes data)', geoScope: 'HCMC District 1 (Hồ Con Rùa Area)',
    privacy: 'Internal_Open', privacyLevel: 'internal', egress: 'download',
    size: '8.4 MB', records: '2,847 rows', updatedAt: '2026-07-04',
    category: 'Survey Fields & Tabular Metrics', labCluster: 'Public Space Living Lab Cluster',
    project: 'Public Space Atlas in HCMC Campaign', previewType: 'table',
  },
  {
    id: 'DDU-LST-2026-0012',
    name: 'HCMC Surface Temperature Map (GEE Analysis)',
    sourceLab: 'DDUD / Eco-Cultural Corridor', sourceLabShort: 'DDUD', sourceColor: 'orange',
    typeTag: 'RASTER (GeoTIFF)', typeIcon: Satellite, typeColor: 'amber',
    crs: "EPSG:5899 (VN2000 / KTT 105°00')", geoScope: 'HCMC (Metropolitan)',
    privacy: 'Internal_Open', privacyLevel: 'internal', egress: 'download-preview',
    size: '245.6 MB', records: '30m resolution raster', updatedAt: '2026-06-18',
    category: 'Remote Sensing & Trắc quan', labCluster: 'UEH CoLab & Studio Lab Cluster',
    project: 'Public Space Atlas in HCMC Campaign', previewType: 'raster',
  },
  {
    id: 'HUE-CAD-2026-0044',
    name: 'Hue Eco-Cultural Corridor Master Plan',
    sourceLab: 'Public Space Living Lab', sourceLabShort: 'PS Lab', sourceColor: 'rose',
    typeTag: 'CAD (AutoCAD)', typeIcon: Layers, typeColor: 'blue',
    crs: "VN2000 / KTT 107°30'", geoScope: 'Thừa Thiên Huế (Heritage Zone)',
    privacy: 'Confidential', privacyLevel: 'confidential', egress: 'request',
    size: '1.2 GB', records: '44 CAD sheets', updatedAt: '2026-05-30',
    category: 'Spatial Geometry & Vectors', labCluster: 'Public Space Living Lab Cluster',
    project: 'Eco-Cultural Corridors in Heritage Cities (Hue Project) Campaign', previewType: 'threed',
  },
  {
    id: 'NZL-AQI-2026-0089',
    name: 'ISCM Air Quality Hub — Real-Time Sensor Stream',
    sourceLab: 'Net Zero Open Lab', sourceLabShort: 'NZ Lab', sourceColor: 'emerald',
    typeTag: 'SENSOR (IoT)', typeIcon: Radio, typeColor: 'slate',
    crs: 'EPSG:4326 (WGS-84)', geoScope: 'HCMC (Metropolitan)',
    privacy: 'Public_Open', privacyLevel: 'public', egress: 'stream',
    size: 'Live stream', records: '6 sensor nodes', updatedAt: 'Real-time',
    category: 'Sensor Networks & Live Streams', labCluster: 'Net Zero Open Lab Cluster',
    project: 'Smart Hub Living Labs Infrastructure Component', previewType: 'map',
  },
  {
    id: 'MS-LID-2026-0031',
    name: 'Hồ Con Rùa 3D Terrestrial LiDAR Scan',
    sourceLab: 'MakerSpace', sourceLabShort: 'MakerSpace', sourceColor: 'indigo',
    typeTag: '3D CLOUD (LAS)', typeIcon: Package, typeColor: 'teal',
    crs: 'EPSG:5899 (VN2000)', geoScope: 'HCMC District 1 (Hồ Con Rùa Area)',
    privacy: 'Confidential', privacyLevel: 'confidential', egress: 'lab-only',
    size: '38.7 GB', records: '420M point cloud', updatedAt: '2026-04-12',
    category: 'Spatial Geometry & Vectors', labCluster: 'MakerSpace & Tech Convergence Hub Cluster',
    project: 'Public Space Atlas in HCMC Campaign', previewType: 'threed',
  },
  {
    id: 'PSA-IMG-2026-0105',
    name: 'Hồ Con Rùa Urban Activity Drone Imagery',
    sourceLab: 'Public Space Living Lab', sourceLabShort: 'PS Lab', sourceColor: 'rose',
    typeTag: 'MEDIA (Photo / .RAW)', typeIcon: Image, typeColor: 'pink',
    crs: 'Non-spatial Graphic', geoScope: 'HCMC District 1 (Hồ Con Rùa Area)',
    privacy: 'Internal_Open', privacyLevel: 'internal', egress: 'preview-download',
    size: '3.8 GB', records: '214 RAW frames', updatedAt: '2026-06-28',
    category: 'Multimedia & Unstructured Data', labCluster: 'Public Space Living Lab Cluster',
    project: 'Public Space Atlas in HCMC Campaign', previewType: 'image',
  },
  {
    id: 'HUE-VID-2026-0022',
    name: 'Hue Heritage Green Corridor Stakeholder Interviews',
    sourceLab: 'Public Space Living Lab', sourceLabShort: 'PS Lab', sourceColor: 'rose',
    typeTag: 'MEDIA (Video / .MP4)', typeIcon: Video, typeColor: 'red',
    crs: 'Non-spatial Video', geoScope: 'Thừa Thiên Huế (Heritage Zone)',
    privacy: 'Internal_Open', privacyLevel: 'internal', egress: 'stream-play',
    size: '12.4 GB', records: '9 interviews · 4h 22min total', updatedAt: '2026-05-15',
    category: 'Multimedia & Unstructured Data', labCluster: 'Public Space Living Lab Cluster',
    project: 'Eco-Cultural Corridors in Heritage Cities (Hue Project) Campaign', previewType: 'video',
  },
];

// ─────────────────────────────────────────────────────────────
// DOSSIER DATA — 4 blocks per asset, with real research linkage
// ─────────────────────────────────────────────────────────────
const DOSSIER_DATA = {
  'PSA-Q1-2026-0002': {
    technical: {
      format: 'Microsoft Excel (.xlsx) / Comma-Separated Values (.csv)', size: '8.4 MB',
      records: '2,847 survey response records · 34 attribute columns',
      bbox: 'N/A — attribute-only tabular dataset, no geometric bounds',
      crsHistory: ['Initial collection: No CRS (tabular form data)', 'V2: WGS-84 coordinate columns added for QGIS mapping layer cross-reference'],
    },
    lineage: {
      method: 'Field survey — manual data entry via KoBoToolbox mobile forms during a pedestrian walkability audit across 12 blocks of District 1',
      originator: 'Collected by Nguyễn Lương Minh Thư (Intern, PS Lab) under supervision of Mai Quynh Thi Tran, M.Arch (Data Steward, Head of Dual Degree Program)',
      collected: '2026-Q1 · January–March 2026 · Dry season audit',
      ingested: '2026-04-02 into UEH Cloud Staging Buffer → Core: 2026-04-07',
      researchCode: 'RU8.3', researchTitle: 'CTD Scholars 2: Perceived Safety in Hẻm System',
      researchPIs: 'Coordinator: Ms. Chi (Dao Chi Vo, PhD) · Member: Hùng (Hung Quoc Viet Nguyen, B.A)',
    },
    audit: [
      { v: 'V1.0', action: 'Raw CSV Upload — KoBoToolbox export, unprocessed', by: 'Nguyễn Lương Minh Thư (Intern)', date: '2026-04-02', status: 'staged' },
      { v: 'V2.0', action: 'Data cleaned, Vietnamese encoding normalized, duplicate records removed', by: 'Hung Quoc Viet Nguyen, B.A (Data Core Architect)', date: '2026-04-05', status: 'processed' },
      { v: 'V3.0', action: 'Metadata validated · Approved for Core Ingestion · Status: LOCKED', by: 'Assoc.Prof. Tu Anh Trinh, PhD (Director)', date: '2026-04-07', status: 'approved' },
    ],
    previewRows: [
      ['REF-001','10.773','106.698','Sidewalk Width','1.4m','Excellent','District 1'],
      ['REF-002','10.774','106.700','Sidewalk Width','0.8m','Poor','District 1'],
      ['REF-003','10.775','106.701','Obstruction','Motor parking','Blocked','District 1'],
      ['REF-004','10.776','106.702','Crosswalk','Yes','Good','District 1'],
      ['REF-005','10.777','106.703','Shade Coverage','72%','Excellent','District 1'],
      ['REF-006','10.778','106.704','Vendor Presence','Yes (mobile)','Moderate','District 1'],
      ['REF-007','10.779','106.705','Surface','Tile','Cracked','District 1'],
      ['REF-008','10.780','106.706','Lighting','Partial','Poor','District 1'],
      ['REF-009','10.781','106.707','Green Cover','Trees x3','Good','District 1'],
      ['REF-010','10.782','106.708','Seating','None','N/A','District 1'],
    ],
    previewCols: ['Survey ID','Lat','Lng','Feature','Value','Rating','Zone'],
  },
  'DDU-LST-2026-0012': {
    technical: {
      format: 'GeoTIFF (.tif) — Raster, 30m resolution, single-band float32', size: '245.6 MB',
      records: 'Spatial grid: ~1.2M pixels · Coverage: 2,061 km² (HCMC extent)',
      bbox: 'Xmin: 106.348 | Xmax: 107.102 | Ymin: 10.341 | Ymax: 11.167 (WGS-84 bounds)',
      crsHistory: ['Source: WGS-84 / EPSG:4326 (GEE native export)', 'V2: Reprojected to EPSG:5899 (VN2000/KTT 105°00\') for domestic compliance'],
    },
    lineage: {
      method: 'Google Earth Engine (GEE) API automated script — Landsat 8 OLI/TIRS Band 10 thermal infrared imagery, composited over dry season 2026 (Jan–Apr), processed with NDVI-corrected LST algorithm',
      originator: 'Compiled by Hung Quoc Viet Nguyen, B.A (Data Architect) · Supervised by Ms. Dao Chi Vo, PhD (DDUD Lab Coordinator)',
      collected: '2026-Q1 · Landsat 8 scenes: Jan–Apr 2026 · Dry season composite',
      ingested: '2026-06-01 Staging → Core: 2026-06-18',
      researchCode: 'RU8.1', researchTitle: 'Urban Heat — Data-Driven Techniques & Resilient Design',
      researchPIs: 'Coordinator: Ms. Chi (Dao Chi Vo, PhD) · Members: Quang (Quang Tran Vuong), Hùng · SDGs: SDG4, SDG11, SDG13',
    },
    audit: [
      { v: 'V1.0', action: 'Raw GEE export — WGS-84, provisional LST values', by: 'Hung Quoc Viet Nguyen, B.A', date: '2026-06-01', status: 'staged' },
      { v: 'V2.0', action: 'CRS reprojected EPSG:4326 → EPSG:5899 · NDVI correction applied · Latency-optimized (tiled COG format)', by: 'Hung Quoc Viet Nguyen, B.A (Data Architect)', date: '2026-06-10', status: 'processed' },
      { v: 'V3.0', action: 'Approved for Core Ingestion · Metadata record complete · LOCKED', by: 'Assoc.Prof. Tu Anh Trinh, PhD (Director)', date: '2026-06-18', status: 'approved' },
    ],
    previewRows: [], previewCols: [],
  },
  'HUE-CAD-2026-0044': {
    technical: {
      format: 'AutoCAD Drawing (.dwg) · DXF exchange format · PDF architectural sheets', size: '1.2 GB',
      records: '44 CAD layout sheets · 12 layer groups · ~840 geometry blocks',
      bbox: "Xmin: 107.532 | Xmax: 107.618 | Ymin: 16.420 | Ymax: 16.503 (Hue City, VN2000 107°30')",
      crsHistory: ['Original draft: Local Hue survey coordinate system (2022)', "V2: Reprojected to VN-2000 / KTT 107°30' for provincial compliance", 'V3: Scaled and verified against Thừa Thiên Huế provincial cadastral base map'],
    },
    lineage: {
      method: 'Photogrammetric drone survey (DJI Phantom 4 RTK) + manual digitization of heritage cadastral records provided by Hue Municipal Urban Planning Department · Integrates botanical survey walk transects',
      originator: 'Lead by Hung Quoc Viet Nguyen, B.A (Data Architect) · Research supervision: Mai Quynh Thi Tran, M.Arch · Field data collection: Nguyễn Lương Minh Thư & Hoàng Trương Tiến Đạt (Interns)',
      collected: '2026-Q1/Q2 · Feb–May 2026 · Two field campaign phases',
      ingested: '2026-05-20 Staging → Confidential Core: 2026-05-30',
      researchCode: 'rl-68', researchTitle: 'Delineating an Integrated Ecological–Cultural Corridor Network in Hue, Vietnam: A Spatial Decision Support System (SDSS) Approach',
      researchPIs: 'Supervisor: Mr. Steven · Researcher: Hùng (Hung Quoc Viet Nguyen) · Award: CTD Scholars Prize A · SDGs: SDG3, SDG4, SDG9, SDG10, SDG11',
    },
    audit: [
      { v: 'V1.0', action: 'Draft CAD upload — local coordinate system, unverified layers', by: 'Hoàng Trương Tiến Đạt (Intern)', date: '2026-05-20', status: 'staged' },
      { v: 'V2.0', action: "CRS aligned to VN-2000 KTT 107°30' · Layer taxonomy standardized · Heritage zone boundaries verified", by: 'Hung Quoc Viet Nguyen, B.A (Data Architect)', date: '2026-05-26', status: 'processed' },
      { v: 'V3.0', action: 'Approved as CONFIDENTIAL Core asset · Director signature required for access', by: 'Assoc.Prof. Tu Anh Trinh, PhD (Director)', date: '2026-05-30', status: 'approved' },
    ],
    previewRows: [], previewCols: [],
  },
  'NZL-AQI-2026-0089': {
    technical: {
      format: 'Real-time JSON stream (WebSocket) · Historical archival: Parquet + CSV snapshots', size: 'Live · Historical archive: ~2.1 GB/year',
      records: '6 active sensor nodes · 5-second update interval · 12 metrics per node',
      bbox: 'HCMC Metropolitan bounding box · Node coordinates: EPSG:4326 (WGS-84 GPS)',
      crsHistory: ['Native sensor output: WGS-84/EPSG:4326 (GPS chipset)', 'Historical snapshots also stored in EPSG:5899 for GIS integration'],
    },
    lineage: {
      method: 'Physical IoT deployment — Sensirion SEN55 environmental sensors (PM2.5, PM10, CO₂, Temp, Humidity) installed on ISCM building infrastructure. Data streams via MQTT protocol to UEH Cloud broker',
      originator: 'Network designed and deployed by Hung Quoc Viet Nguyen, B.A (Data Architect) · Sensor procurement supervised by Net Zero Open Lab leadership · Maintenance: IT team',
      collected: 'Continuous real-time stream since 2026-03-15 · No seasonal constraint',
      ingested: '2026-03-15 → Live integration into smART Hub public visualization engine',
      researchCode: 'rl-19', researchTitle: 'Living Lab on Nature-based Solutions (NbS) to Urban Heat',
      researchPIs: 'Coordinator: Mr. Quang (Quang Tran Vuong, PhD) · ISCM initiative · SDGs: SDG4, SDG11, SDG13',
    },
    audit: [
      { v: 'V1.0', action: 'Sensor network installation complete · MQTT broker configured · Stream initiated', by: 'Hung Quoc Viet Nguyen, B.A (Data Architect)', date: '2026-03-15', status: 'staged' },
      { v: 'V2.0', action: 'Public API endpoint activated · smART Hub visualization integration verified', by: 'Hung Quoc Viet Nguyen, B.A (Data Architect)', date: '2026-03-22', status: 'processed' },
      { v: 'V3.0', action: 'Approved as PUBLIC OPEN stream · Embedded in ISCM external portal', by: 'Assoc.Prof. Tu Anh Trinh, PhD (Director)', date: '2026-04-01', status: 'approved' },
    ],
    previewRows: [], previewCols: [],
  },
  'MS-LID-2026-0031': {
    technical: {
      format: 'LAS Point Cloud v1.4 (.las) · LAZ compressed variant also stored', size: '38.7 GB (raw) · 14.2 GB (LAZ compressed)',
      records: '420,412,088 points · Point density: ~1,200 pts/m² · RGB colorized',
      bbox: 'Xmin: 106.6921 | Xmax: 106.6988 | Ymin: 10.7741 | Ymax: 10.7799 (Hồ Con Rùa square boundary)',
      crsHistory: ['Raw scanner output: Scanner-native coordinate system', 'V2: Geo-referenced to EPSG:5899 (VN2000) using 6 GCPs from RTK GPS survey'],
    },
    lineage: {
      method: 'Terrestrial LiDAR scanning — Leica RTC360 scanner · 7 scan stations · 360° hemispherical coverage · RTK GPS georeferencing with 6 ground control points',
      originator: 'Scan campaign led by Hung Quoc Viet Nguyen, B.A (Data Architect) · MakerSpace equipment operator: Phuc Hoang Nguyen, B.Arch · Field assistants: 2 student interns',
      collected: '2026-04-06/07 · 2 days on-site · Dry season (clear atmospheric conditions)',
      ingested: '2026-04-09 Staging → Confidential Core: 2026-04-12 · Physical drive copy at MakerSpace Drive #02',
      researchCode: 'RU5.2', researchTitle: '4DGS — Real-Time 3D Reconstruction and Motion Hologram',
      researchPIs: 'Coordinator: Mr. Tâm (Tam Phuc Le Do, M.Sc) · Member: Tài (Tai Vinh Tran, B.A) · SDGs: SDG9, SDG11',
    },
    audit: [
      { v: 'V1.0', action: 'Raw .las upload from scanner laptop — scanner-native CRS, no geo-reference', by: 'Phuc Hoang Nguyen, B.Arch (MakerSpace)', date: '2026-04-09', status: 'staged' },
      { v: 'V2.0', action: 'Geo-referenced to EPSG:5899 · Noise filtering · RGB colorization from drone ortho overlay', by: 'Hung Quoc Viet Nguyen, B.A (Data Architect)', date: '2026-04-11', status: 'processed' },
      { v: 'V3.0', action: 'CONFIDENTIAL — Physical encrypted drive required. Approved with transfer restriction note', by: 'Assoc.Prof. Tu Anh Trinh, PhD (Director)', date: '2026-04-12', status: 'approved' },
    ],
    previewRows: [], previewCols: [],
  },
  'PSA-IMG-2026-0105': {
    technical: {
      format: 'Adobe DNG / RAW (.dng, .arw) + JPEG derivatives', size: '3.8 GB',
      records: '214 RAW frames · DJI Mavic 3 · 4/3" CMOS sensor · 20MP per frame',
      bbox: 'Flight footprint: Hồ Con Rùa Park + 300m surrounding block radius',
      crsHistory: ['Embedded GPS EXIF: WGS-84 / EPSG:4326 coordinates per frame', 'Orthomosaic derived product: registered to EPSG:5899 (VN2000)'],
    },
    lineage: {
      method: 'Drone photogrammetry — DJI Mavic 3 aerial survey at 80m AGL altitude · Grid flight pattern with 80% lateral/frontal overlap · Automated waypoint mission using DJI FlightHub · Morning light window (06:30–08:00) for optimal shadow conditions',
      originator: 'Drone pilot: Hung Quoc Viet Nguyen, B.A (Data Architect, licensed UAV operator) · Ground safety crew: Ngô An Phú & Nguyễn Lương Minh Thư (Interns, PS Lab)',
      collected: '2026-06-22 · Single-day campaign · Clear sky, Beaufort 1 wind',
      ingested: '2026-06-24 Staging → Core: 2026-06-28',
      researchCode: 'rl-85', researchTitle: 'Sponge City Concept in Urban Hybrid Garden Design (Thanh Da Area)',
      researchPIs: 'Supervisor: Mr. Quang (Quang Tran Vuong, PhD) · Members: Phan Thiên Kim, Lê Hồng Trang, Nguyễn Viết Quốc Hùng · Award: NNCT Prize B',
    },
    audit: [
      { v: 'V1.0', action: 'RAW frames uploaded from DJI remote controller SD card', by: 'Ngô An Phú (Intern)', date: '2026-06-24', status: 'staged' },
      { v: 'V2.0', action: 'Metadata validated · EXIF GPS verified · JPEG preview derivatives generated', by: 'Hung Quoc Viet Nguyen, B.A (Data Architect)', date: '2026-06-26', status: 'processed' },
      { v: 'V3.0', action: 'Approved for Core Ingestion · INTERNAL OPEN classification confirmed', by: 'Assoc.Prof. Tu Anh Trinh, PhD (Director)', date: '2026-06-28', status: 'approved' },
    ],
    previewRows: [], previewCols: [],
  },
  'HUE-VID-2026-0022': {
    technical: {
      format: 'MP4 H.264 (AVC) · AAC stereo audio · 1080p 25fps', size: '12.4 GB',
      records: '9 interview sessions · 4h 22min total runtime · Vietnamese + English transcripts',
      bbox: 'Non-spatial — recorded at Hue City heritage sites and municipal offices',
      crsHistory: ['Non-spatial video asset — no CRS applicable', 'Interview location metadata tagged as WGS-84 point annotations in companion JSON'],
    },
    lineage: {
      method: 'Semi-structured stakeholder interviews — participants include urban heritage officials, local community leaders, and Hue Tourism Authority representatives. Recorded with Sony FX3 cinema camera + lavalier microphones. Vietnamese/English bilingual with professional interpreter',
      originator: 'Interview design: Mai Quynh Thi Tran, M.Arch · Field recording crew: Toan Phuc Le, B.E (Designer) · Transcription by: Bùi Thảo Nguyên (Intern) under supervision of Mai Quynh Thi Tran, M.Arch',
      collected: '2026-05-08 to 2026-05-12 · 5-day field mission to Hue City',
      ingested: '2026-05-13 Staging → Core: 2026-05-15',
      researchCode: 'rl-68', researchTitle: 'Ecological–Cultural Corridor Network in Hue, Vietnam (SDSS Approach) — Stakeholder Interview Corpus',
      researchPIs: 'Lead: Supervisor Mr. Steven · Researcher: Hùng (Hung Quoc Viet Nguyen, B.A) · CTD Scholars Award: Prize A · SDGs: SDG3, SDG4, SDG10, SDG11',
    },
    audit: [
      { v: 'V1.0', action: 'Raw footage upload from Sony FX3 storage cards · No edits applied', by: 'Toan Phuc Le, B.E (Designer)', date: '2026-05-13', status: 'staged' },
      { v: 'V2.0', action: 'H.264 encoded for streaming · Chapter markers added · Transcript companion files attached', by: 'Hung Quoc Viet Nguyen, B.A (Data Architect)', date: '2026-05-14', status: 'processed' },
      { v: 'V3.0', action: 'Approved for Core · INTERNAL OPEN — accessible to ISCM researchers with streaming token', by: 'Assoc.Prof. Tu Anh Trinh, PhD (Director)', date: '2026-05-15', status: 'approved' },
    ],
    previewRows: [], previewCols: [],
  },
};

// ─────────────────────────────────────────────────────────────
// GROUPING SYSTEM
// ─────────────────────────────────────────────────────────────
const GROUP_CONFIGS = {
  category: {
    label: 'Data Category', labelVi: 'Loại Dữ liệu',
    folders: [
      { key: 'Survey Fields & Tabular Metrics', label: 'Survey Fields & Tabular Metrics', sub: 'Excel, CSV', icon: FileSpreadsheet },
      { key: 'Spatial Geometry & Vectors', label: 'Spatial Geometry & Vectors', sub: 'Shapefiles, GeoJSON, CAD .DWG', icon: Layers },
      { key: 'Remote Sensing & Trắc quan', label: 'Remote Sensing & Trắc quan', sub: 'Raster GeoTIFF, GEE Tiles', icon: Satellite },
      { key: 'Sensor Networks & Live Streams', label: 'Sensor Networks & Live Streams', sub: 'IoT JSON feeds, CCTV Logs', icon: Radio },
      { key: 'Multimedia & Unstructured Data', label: 'Multimedia & Unstructured Data', sub: 'Photos .RAW, Videos .MP4, 3D Mesh', icon: Image },
    ],
    assetKey: 'category',
  },
  lab: {
    label: 'Lab Cluster', labelVi: 'Cụm Lab',
    folders: [
      { key: 'Public Space Living Lab Cluster', label: 'Public Space Living Lab Cluster', sub: 'PS Lab', icon: FlaskConical },
      { key: 'Net Zero Open Lab Cluster', label: 'Net Zero Open Lab Cluster', sub: 'NZ Lab', icon: Activity },
      { key: 'Smart Mobility Lab Cluster', label: 'Smart Mobility Lab Cluster', sub: 'Move System', icon: Cpu },
      { key: 'MakerSpace & Tech Convergence Hub Cluster', label: 'MakerSpace & Tech Convergence', sub: 'MakerSpace', icon: Package },
      { key: 'UEH CoLab & Studio Lab Cluster', label: 'UEH CoLab & Studio Lab Cluster', sub: 'CoLab / DDUD', icon: Database },
    ],
    assetKey: 'labCluster',
  },
  project: {
    label: 'Strategic Project', labelVi: 'Dự án Chiến lược',
    folders: [
      { key: 'Public Space Atlas in HCMC Campaign', label: 'Public Space Atlas in HCMC', sub: 'HCMC Campaign', icon: Map },
      { key: 'Eco-Cultural Corridors in Heritage Cities (Hue Project) Campaign', label: 'Eco-Cultural Corridors — Hue Project', sub: 'Heritage Campaign', icon: BookOpen },
      { key: 'Smart Hub Living Labs Infrastructure Component', label: 'Smart Hub Living Labs', sub: 'Infrastructure', icon: Wifi },
      { key: 'Coconut Palm Wood Structural Research Track', label: 'Coconut Palm Wood Research', sub: 'Bến Tre Track', icon: FileText },
    ],
    assetKey: 'project',
  },
};

const FILTER_GEO = ['All', 'HCMC Metropolitan', 'HCMC District 1 (Hồ Con Rùa Area)', 'Thừa Thiên Huế (Heritage Zone)', 'Bến Tre Province'];
const FILTER_PRIVACY = ['All', 'Public Open', 'Internal Open', 'Confidential'];
const RBAC_ROLES = [
  { id: 'A', label: 'Role A — Director (Admin)', name: 'Assoc.Prof. Tu Anh Trinh', color: 'text-red-700 bg-red-50 border-red-300' },
  { id: 'B', label: 'Role B — Data Steward', name: 'Hien The Dang, M.Sc', color: 'text-blue-700 bg-blue-50 border-blue-300' },
  { id: 'C', label: 'Role C — Researcher', name: 'Quang Tran Vuong, PhD', color: 'text-neutral-700 bg-neutral-50 border-neutral-300' },
  { id: 'D', label: 'Role D — Intern', name: 'Nguyen Minh Huy', color: 'text-amber-700 bg-amber-50 border-amber-300' },
];
const STAGED_FILES = [
  { id: 'stg-01', filename: 'sidewalk_survey_q2_2026.xlsx', uploader: 'Nguyen Minh Huy (Intern)', uploadedAt: '2026-07-09 14:22', size: '4.1 MB', script: 'metadata_check.py', status: 'ready', issues: [] },
  { id: 'stg-02', filename: 'heritage_layer_v3_draft.geojson', uploader: 'Truong Thanh Dat (Intern)', uploadedAt: '2026-07-09 13:55', size: '22.8 MB', script: 'crs_validator.py', status: 'warning', crsDetected: 'EPSG:4326', crsExpected: 'EPSG:5899', issues: ['CRS mismatch: detected EPSG:4326, required EPSG:5899', 'Missing field: project_id, data_steward'] },
  { id: 'stg-03', filename: 'iscm_aqi_sensor_raw_2026.csv', uploader: 'Hoàng Trương Tiến Đạt (Intern)', uploadedAt: '2026-07-09 15:01', size: '1.7 MB', script: 'crs_autodetect.py', status: 'processing', issues: [] },
];

// ─────────────────────────────────────────────────────────────
// SMALL REUSABLE COMPONENTS
// ─────────────────────────────────────────────────────────────
function TypeBadge({ tag, color }) {
  const s = { violet:'bg-violet-50 text-violet-700 border-violet-200', amber:'bg-amber-50 text-amber-700 border-amber-200', blue:'bg-blue-50 text-blue-700 border-blue-200', slate:'bg-slate-100 text-slate-700 border-slate-300', teal:'bg-teal-50 text-teal-700 border-teal-200', pink:'bg-pink-50 text-pink-700 border-pink-200', red:'bg-red-50 text-red-700 border-red-200' };
  return <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 text-[9.5px] font-bold uppercase tracking-wider border font-mono ${s[color]||s.slate}`}>{tag}</span>;
}
function LabBadge({ name, color }) {
  const s = { rose:'bg-rose-50 text-rose-700 border-rose-200', orange:'bg-orange-50 text-orange-700 border-orange-200', emerald:'bg-emerald-50 text-emerald-700 border-emerald-200', indigo:'bg-indigo-50 text-indigo-700 border-indigo-200' };
  return <span className={`inline-flex items-center px-1.5 py-0.5 text-[9.5px] font-bold uppercase tracking-wide border ${s[color]||s.rose}`}>{name}</span>;
}
function PrivacyBadge({ level }) {
  if (level==='public') return <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[9.5px] font-bold uppercase border border-blue-400 text-blue-600 bg-blue-50"><Globe2 className="h-2.5 w-2.5"/>PUBLIC OPEN</span>;
  if (level==='internal') return <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[9.5px] font-bold uppercase border border-emerald-400 text-emerald-700 bg-emerald-50"><ShieldCheck className="h-2.5 w-2.5"/>INTERNAL OPEN</span>;
  return <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[9.5px] font-bold uppercase border border-red-400 text-red-700 bg-red-50"><Lock className="h-2.5 w-2.5"/>CONFIDENTIAL</span>;
}
function EgressButton({ asset, onAction }) {
  if (asset.egress==='download') return <button onClick={()=>onAction('download',asset)} className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[9px] font-bold uppercase tracking-wider px-2 py-1.5 transition-colors"><Download className="h-3 w-3"/>Download</button>;
  if (asset.egress==='download-preview') return <button onClick={()=>onAction('download-preview',asset)} className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[9px] font-bold uppercase tracking-wider px-2 py-1.5 transition-colors"><Download className="h-3 w-3"/>Download+Preview</button>;
  if (asset.egress==='request') return <button onClick={()=>onAction('request',asset)} className="flex items-center gap-1 bg-amber-500 hover:bg-amber-600 text-white text-[9px] font-bold uppercase tracking-wider px-2 py-1.5 transition-colors"><Lock className="h-3 w-3"/>Request Access</button>;
  if (asset.egress==='stream') return <button onClick={()=>onAction('stream',asset)} className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white text-[9px] font-bold uppercase tracking-wider px-2 py-1.5 transition-colors"><Radio className="h-3 w-3 animate-pulse"/>API Stream</button>;
  if (asset.egress==='preview-download') return <button onClick={()=>onAction('preview-download',asset)} className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[9px] font-bold uppercase tracking-wider px-2 py-1.5 transition-colors"><ZoomIn className="h-3 w-3"/>Preview & Download</button>;
  if (asset.egress==='stream-play') return <button onClick={()=>onAction('stream-play',asset)} className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[9px] font-bold uppercase tracking-wider px-2 py-1.5 transition-colors"><Play className="h-3 w-3"/>Stream / Play</button>;
  return <span className="flex items-center gap-1 border border-red-300 text-red-700 text-[9px] font-bold uppercase tracking-wider px-2 py-1.5 bg-red-50 cursor-default group relative"><ShieldX className="h-3 w-3"/>Lab Copy Only<span className="absolute bottom-full left-0 mb-1 hidden group-hover:block w-56 bg-neutral-900 text-white text-[9px] px-2.5 py-2 font-normal normal-case z-20 shadow-xl">Data size too heavy for cloud tier. Restricted to physical encrypted transfer at MakerSpace Storage Drive #02. Contact Data Admin.</span></span>;
}

// ─────────────────────────────────────────────────────────────
// PREVIEW COMPONENTS (context-aware for Block C)
// ─────────────────────────────────────────────────────────────
function TablePreviewCanvas({ asset, dossier }) {
  const cols = dossier.previewCols;
  const rows = dossier.previewRows;
  return (
    <div className="overflow-x-auto border border-neutral-200">
      <div className="bg-neutral-50 border-b border-neutral-200 px-3 py-1.5 flex items-center gap-1.5">
        <FileSpreadsheet className="h-3.5 w-3.5 text-violet-600"/>
        <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-600">Survey Data Preview — First 10 rows</span>
      </div>
      <table className="w-full text-[10px] font-mono border-collapse">
        <thead><tr>{cols.map(c=><th key={c} className="bg-neutral-100 border border-neutral-200 px-2 py-1 text-left text-[9px] font-bold uppercase text-neutral-500 whitespace-nowrap">{c}</th>)}</tr></thead>
        <tbody>{rows.map((row,i)=><tr key={i} className={i%2===0?'bg-white':'bg-neutral-50/50'}>{row.map((cell,j)=><td key={j} className="border border-neutral-100 px-2 py-1 text-neutral-700 whitespace-nowrap">{cell}</td>)}</tr>)}</tbody>
      </table>
    </div>
  );
}
function MapPreviewCanvas({ asset }) {
  const isLive = asset.egress === 'stream';
  return (
    <div className="bg-neutral-900 aspect-video relative overflow-hidden border border-neutral-200 flex items-end">
      <svg viewBox="0 0 400 240" className="absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMid slice">
        <rect width="400" height="240" fill="#1a2035"/>
        <rect x="20" y="20" width="360" height="200" rx="2" fill="none" stroke="#5467a6" strokeWidth="1" strokeDasharray="4,2"/>
        <path d="M 80 160 Q 120 140 160 155 Q 200 170 250 150 Q 290 135 340 155" fill="none" stroke="#2563eb" strokeWidth="2" opacity="0.6"/>
        <path d="M 60 130 Q 100 120 140 125 Q 180 130 220 120 Q 260 110 310 125" fill="none" stroke="#2563eb" strokeWidth="1.5" opacity="0.4"/>
        {isLive ? (
          <>
            {[{x:120,y:100},{x:180,y:140},{x:250,y:90},{x:300,y:150},{x:200,y:60},{x:150,y:180}].map((node,i)=>(
              <g key={i}>
                <circle cx={node.x} cy={node.y} r={8} fill="#10b981" opacity="0.2" className="animate-ping"/>
                <circle cx={node.x} cy={node.y} r={5} fill="#10b981"/>
                <text x={node.x+8} y={node.y+4} fill="#86efac" fontSize="7" fontFamily="monospace">NZL-00{i+1}</text>
              </g>
            ))}
          </>
        ) : (
          <rect x="80" y="60" width="240" height="120" rx="2" fill="#5467a6" opacity="0.15" stroke="#5467a6" strokeWidth="1.5"/>
        )}
        <text x="200" y="225" textAnchor="middle" fill="#4b5563" fontSize="9" fontFamily="monospace">{asset.crs}</text>
      </svg>
      {isLive && <div className="absolute top-2 right-2 flex items-center gap-1.5 bg-emerald-600/90 text-white text-[9px] font-black px-2 py-0.5"><span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse"/>LIVE FEED</div>}
      <div className="relative z-10 bg-black/60 px-3 py-2 w-full text-[9.5px] font-mono text-neutral-400">
        Bounding Box: {asset.previewType === 'map' ? '106.348–107.102 E · 10.341–11.167 N (HCMC Metro)' : '107.532–107.618 E · 16.420–16.503 N (Hue City)'}
      </div>
    </div>
  );
}
function RasterPreviewCanvas() {
  return (
    <div className="border border-neutral-200 bg-neutral-900 aspect-video relative overflow-hidden flex items-end">
      <div className="absolute inset-0" style={{background:'radial-gradient(ellipse at 60% 40%, #ff4b2b 0%, #ff9900 25%, #ffe34a 45%, #7bd94a 65%, #2b9af3 85%, #1c3a6e 100%)',opacity:0.9}}/>
      <div className="relative z-10 p-3 bg-black/70 text-[9px] font-mono text-emerald-400 w-full">
        <p className="font-bold text-emerald-300">LST PREVIEW — HCMC Metropolitan · 30m resolution</p>
        <div className="flex justify-between mt-1 text-[8px]"><span className="text-blue-400">▮ 24°C (Cool zone)</span><span className="text-yellow-400">▮ 38°C (Urban)</span><span className="text-red-400">▮ 52°C (Heat island)</span></div>
      </div>
    </div>
  );
}
function ThreeDViewportCanvas({ asset }) {
  const [angle, setAngle] = useState(0);
  useEffect(()=>{const id=setInterval(()=>setAngle(a=>(a+0.5)%360),30);return()=>clearInterval(id);},[]);
  const rad = angle * Math.PI/180;
  const cos = Math.cos(rad); const sin = Math.sin(rad);
  const pts = [[-1,-1,-1],[ 1,-1,-1],[ 1, 1,-1],[-1, 1,-1],[-1,-1, 1],[ 1,-1, 1],[ 1, 1, 1],[-1, 1, 1]];
  const project = ([x,y,z])=>{const rx=x*cos-z*sin;const rz=x*sin+z*cos;const ry=y;const s=120/(rz+3);return[200+rx*s,120-ry*s];};
  const edges=[[0,1],[1,2],[2,3],[3,0],[4,5],[5,6],[6,7],[7,4],[0,4],[1,5],[2,6],[3,7]];
  return (
    <div className="bg-[#0a0a12] border border-neutral-700 aspect-video relative overflow-hidden flex flex-col">
      <div className="absolute top-2 left-2 text-[9px] font-mono text-emerald-400 opacity-70">
        {asset.previewType==='threed' && asset.id.startsWith('MS') ? '3D LIDAR POINT CLOUD — WIREFRAME PREVIEW' : 'CAD GEOMETRY — 3D WIREFRAME PREVIEW'}
      </div>
      <svg viewBox="0 0 400 240" className="flex-1 w-full">
        {edges.map(([a,b],i)=>{const [x1,y1]=project(pts[a]);const [x2,y2]=project(pts[b]);return<line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={asset.id.startsWith('MS')?'#00ffaa':'#5467a6'} strokeWidth="1.5" opacity="0.9"/>;})}
        {pts.map((p,i)=>{const [px,py]=project(p);return<circle key={i} cx={px} cy={py} r={asset.id.startsWith('MS')?2.5:3} fill={asset.id.startsWith('MS')?'#00ffaa':'#7c9fe6'} opacity="0.9"/>;})}
      </svg>
      <div className="absolute bottom-2 right-2 text-[8px] font-mono text-neutral-500">Auto-rotate · Click to pause · {asset.crs}</div>
      <div className="absolute bottom-2 left-2 flex gap-2">
        {['Orbit','Zoom','Pan'].map(t=><span key={t} className="text-[8px] bg-white/10 text-white px-1.5 py-0.5 font-mono">{t}</span>)}
      </div>
    </div>
  );
}
function VideoPlayerCanvas({ asset }) {
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(18);
  return (
    <div className="bg-black border border-neutral-700 aspect-video relative overflow-hidden flex flex-col">
      <div className="flex-1 flex items-center justify-center relative">
        <div className="absolute inset-0 bg-gradient-to-b from-neutral-900 to-black opacity-70"/>
        <div className="relative z-10 text-center space-y-2">
          <div className="text-neutral-500 text-[10px] font-mono">[ Video Player — Streaming from UEH Cloud ]</div>
          <button onClick={()=>setPlaying(p=>!p)} className={`h-14 w-14 rounded-full flex items-center justify-center transition-colors ${playing?'bg-white/20 hover:bg-white/30':'bg-[#5467a6] hover:bg-[#3d4f8a]'}`}>
            {playing ? <div className="flex gap-1"><div className="h-5 w-1.5 bg-white"/><div className="h-5 w-1.5 bg-white"/></div> : <Play className="h-6 w-6 text-white ml-0.5"/>}
          </button>
          <div className="text-neutral-400 text-[9px] font-mono">{playing ? 'Streaming…' : 'Click to stream interview footage'}</div>
        </div>
        {playing && <div className="absolute top-2 right-2 flex items-center gap-1 bg-red-600 text-white text-[8px] font-bold px-1.5 py-0.5"><span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse"/>LIVE</div>}
      </div>
      <div className="bg-neutral-900 px-3 py-2 space-y-1">
        <div className="flex items-center gap-2">
          <button onClick={()=>setPlaying(p=>!p)} className="text-white">{playing?<div className="flex gap-0.5"><div className="h-3 w-1 bg-white"/><div className="h-3 w-1 bg-white"/></div>:<Play className="h-3 w-3"/>}</button>
          <div className="flex-1 h-1 bg-neutral-700 relative cursor-pointer" onClick={e=>{const r=e.currentTarget.getBoundingClientRect();setProgress(Math.round((e.clientX-r.left)/r.width*100));}}>
            <div className="absolute left-0 top-0 h-full bg-[#5467a6]" style={{width:`${progress}%`}}/>
            <div className="absolute top-1/2 -translate-y-1/2 h-3 w-3 rounded-full bg-white shadow" style={{left:`calc(${progress}% - 6px)`}}/>
          </div>
          <span className="text-[9px] font-mono text-neutral-400">00:{String(Math.round(progress*262/100)).padStart(2,'0')} / 04:22:00</span>
          <Volume2 className="h-3 w-3 text-neutral-400"/>
          <Maximize2 className="h-3 w-3 text-neutral-400"/>
        </div>
        <div className="text-[8px] font-mono text-neutral-500">Chapter 1: Village elder interview (Hue Heritage District) · Vietnamese + EN subtitles available</div>
      </div>
    </div>
  );
}
function ImageGalleryCanvas({ asset }) {
  const [selected, setSelected] = useState(0);
  const frames = ['Frame 001 · 06:32AM', 'Frame 042 · 06:48AM', 'Frame 107 · 07:11AM', 'Frame 163 · 07:29AM', 'Frame 198 · 07:52AM', 'Frame 214 · 08:01AM'];
  const colors = ['from-slate-700 to-slate-500', 'from-blue-900 to-blue-700', 'from-amber-800 to-amber-600', 'from-green-800 to-green-600', 'from-slate-800 to-slate-600', 'from-blue-800 to-blue-600'];
  return (
    <div className="space-y-2">
      <div className={`bg-gradient-to-br ${colors[selected]} aspect-video rounded-none flex items-end border border-neutral-200`}>
        <div className="bg-black/60 w-full px-3 py-2 text-[9px] font-mono text-white">
          <p className="font-bold">DJI Mavic 3 · {frames[selected]} · 80m AGL</p>
          <p className="text-neutral-400">GPS: 10.7756°N, 106.6949°E · Hồ Con Rùa Aerial Survey</p>
        </div>
      </div>
      <div className="grid grid-cols-6 gap-1">
        {frames.map((f,i)=>(
          <button key={i} onClick={()=>setSelected(i)} className={`aspect-square bg-gradient-to-br ${colors[i]} rounded-none border-2 transition-colors ${selected===i?'border-[#5467a6]':'border-transparent hover:border-neutral-400'}`}>
            <span className="text-[7px] text-white/70 font-mono block text-center pt-1">{String(i+1).padStart(3,'0')}</span>
          </button>
        ))}
      </div>
      <p className="text-[9px] text-neutral-400 font-mono">214 RAW frames total · Showing {frames[selected]} · DNG format</p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// DOSSIER PANEL
// ─────────────────────────────────────────────────────────────
function DossierPanel({ asset, rbacRole, onClose }) {
  const [activeBlock, setActiveBlock] = useState('A');
  const dossier = DOSSIER_DATA[asset.id];
  const isConfidential = asset.privacyLevel === 'confidential';
  const isBlocked = rbacRole === 'D' && isConfidential;
  const isAdmin = rbacRole === 'A';
  const roleInfo = RBAC_ROLES.find(r => r.id === rbacRole);

  return (
    <div className="fixed inset-y-0 right-0 w-full max-w-[680px] z-50 flex flex-col bg-white border-l border-neutral-200 shadow-2xl">
      {/* dossier header */}
      <div className="shrink-0 bg-[#0f1117] text-white px-5 py-3.5 flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[8px] font-black uppercase tracking-[0.2em] text-neutral-400">DATA ASSET DOSSIER</span>
            <PrivacyBadge level={asset.privacyLevel}/>
          </div>
          <p className="font-bold text-sm text-white leading-tight">{asset.name}</p>
          <p className="font-mono text-[10px] text-neutral-400 mt-0.5">{asset.id} · {asset.size} · Updated {asset.updatedAt}</p>
        </div>
        <button onClick={onClose} className="shrink-0 text-neutral-500 hover:text-white transition-colors"><X className="h-5 w-5"/></button>
      </div>

      {/* RBAC session indicator */}
      <div className={`shrink-0 border-b px-5 py-2 flex items-center gap-3 ${roleInfo?.color || 'bg-neutral-50 border-neutral-200'}`}>
        <User className="h-3.5 w-3.5 shrink-0"/>
        <div className="flex-1 text-[10px]">
          <span className="font-bold">{roleInfo?.label}</span>
          <span className="text-neutral-500 ml-2">Session: {roleInfo?.name}</span>
        </div>
        {isAdmin && <div className="flex gap-1.5">
          <button className="flex items-center gap-1 bg-[#5467a6] hover:bg-[#3d4f8a] text-white text-[9px] font-bold uppercase px-2 py-1 transition-colors"><Edit3 className="h-2.5 w-2.5"/>Edit</button>
          <button className="flex items-center gap-1 bg-red-600 hover:bg-red-700 text-white text-[9px] font-bold uppercase px-2 py-1 transition-colors"><Trash2 className="h-2.5 w-2.5"/>Delete</button>
        </div>}
      </div>

      {/* BLOCKED overlay for Role D + Confidential */}
      {isBlocked ? (
        <div className="flex-1 flex items-center justify-center bg-red-950/10">
          <div className="text-center space-y-4 max-w-xs px-6">
            <div className="h-16 w-16 bg-red-100 border-2 border-red-300 flex items-center justify-center mx-auto">
              <ShieldX className="h-8 w-8 text-red-600"/>
            </div>
            <div>
              <p className="font-black text-sm text-red-700 uppercase tracking-wider">Restricted Access</p>
              <p className="text-xs text-neutral-500 mt-1 leading-relaxed">Security clearance required. This asset is classified <strong>Confidential</strong> and is not accessible to Role D (Intern) accounts. Contact your Data Steward to request supervised access.</p>
            </div>
            <div className="border border-red-200 bg-red-50 px-3 py-2 text-[10px] font-mono text-red-600">Asset ID: {asset.id} · Classification: {asset.privacy}</div>
          </div>
        </div>
      ) : (
        <>
          {/* block tabs */}
          <div className="shrink-0 flex border-b border-neutral-200 bg-neutral-50">
            {[['A','Technical Profile'], ['B','Lineage & Origin'], ['C','Preview Canvas'], ['D','Audit Log']].map(([key, label])=>(
              <button key={key} onClick={()=>setActiveBlock(key)} className={`flex-1 py-2.5 text-[9.5px] font-bold uppercase tracking-wider transition-colors border-b-2 ${activeBlock===key ? 'border-[#5467a6] text-[#5467a6] bg-white' : 'border-transparent text-neutral-500 hover:text-neutral-700'}`}>
                <span className="text-[8px] block text-neutral-400">Block {key}</span>{label}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto">
            {/* BLOCK A: Technical Profile */}
            {activeBlock==='A' && (
              <div className="p-5 space-y-5">
                <div>
                  <p className="text-[9px] font-black uppercase tracking-widest text-neutral-400 mb-2 flex items-center gap-1.5"><BadgeInfo className="h-3 w-3"/>Technical Specifications</p>
                  <div className="grid grid-cols-2 gap-px bg-neutral-200 border border-neutral-200">
                    {[['File Format', dossier.technical.format], ['Asset Size', dossier.technical.size], ['Record Count', dossier.technical.records], ['Bounding Box', dossier.technical.bbox]].map(([k,v])=>(
                      <div key={k} className="bg-white p-3"><p className="text-[9px] uppercase text-neutral-400 font-bold">{k}</p><p className="text-xs text-neutral-800 font-mono mt-0.5 leading-snug">{v}</p></div>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-[9px] font-black uppercase tracking-widest text-neutral-400 mb-2 flex items-center gap-1.5"><GitBranch className="h-3 w-3"/>CRS Translation History</p>
                  <div className="space-y-1.5">
                    {dossier.technical.crsHistory.map((entry,i)=>(
                      <div key={i} className="flex items-start gap-2 text-xs">
                        <span className="shrink-0 h-5 w-5 bg-[#5467a6] text-white text-[8px] font-black flex items-center justify-center">{i+1}</span>
                        <span className="font-mono text-neutral-600">{entry}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* BLOCK B: Lineage & Origin */}
            {activeBlock==='B' && (
              <div className="p-5 space-y-4">
                <p className="text-[9px] font-black uppercase tracking-widest text-neutral-400 flex items-center gap-1.5"><History className="h-3 w-3"/>Data Provenance & Lineage Registry</p>
                <div className="space-y-3">
                  {[
                    ['Acquisition Method', dossier.lineage.method, Terminal],
                    ['Named Originator & Supervision', dossier.lineage.originator, User],
                    ['Collection Period', dossier.lineage.collected, CalendarDays],
                    ['Cloud Ingestion Timestamp', dossier.lineage.ingested, Database],
                  ].map(([k,v,Icon])=>(
                    <div key={k} className="border border-neutral-200 p-3">
                      <div className="flex items-center gap-1.5 mb-1.5"><Icon className="h-3.5 w-3.5 text-[#5467a6] shrink-0"/><span className="text-[9px] font-black uppercase tracking-wider text-neutral-500">{k}</span></div>
                      <p className="text-xs text-neutral-700 leading-relaxed">{v}</p>
                    </div>
                  ))}
                  <div className="border-2 border-[#5467a6]/30 bg-blue-50/50 p-3">
                    <div className="flex items-center gap-1.5 mb-1.5"><BookOpen className="h-3.5 w-3.5 text-[#5467a6] shrink-0"/><span className="text-[9px] font-black uppercase tracking-wider text-[#5467a6]">Linked Research Project</span></div>
                    <p className="text-[10px] font-bold text-neutral-800">{dossier.lineage.researchCode} — {dossier.lineage.researchTitle}</p>
                    <p className="text-[10px] text-neutral-600 mt-1">{dossier.lineage.researchPIs}</p>
                  </div>
                </div>
              </div>
            )}

            {/* BLOCK C: Preview Canvas */}
            {activeBlock==='C' && (
              <div className="p-5 space-y-3">
                <p className="text-[9px] font-black uppercase tracking-widest text-neutral-400 flex items-center gap-1.5"><Eye className="h-3 w-3"/>Interactive Preview Canvas</p>
                {asset.previewType==='table' && <TablePreviewCanvas asset={asset} dossier={dossier}/>}
                {(asset.previewType==='map') && <MapPreviewCanvas asset={asset}/>}
                {asset.previewType==='raster' && <RasterPreviewCanvas/>}
                {asset.previewType==='threed' && <ThreeDViewportCanvas asset={asset}/>}
                {asset.previewType==='video' && <VideoPlayerCanvas asset={asset}/>}
                {asset.previewType==='image' && <ImageGalleryCanvas asset={asset}/>}
              </div>
            )}

            {/* BLOCK D: Audit Log */}
            {activeBlock==='D' && (
              <div className="p-5 space-y-4">
                <p className="text-[9px] font-black uppercase tracking-widest text-neutral-400 flex items-center gap-1.5"><History className="h-3 w-3"/>Version Control & Modification History</p>
                <div className="relative">
                  <div className="absolute left-3.5 top-0 bottom-0 w-px bg-neutral-200"/>
                  <div className="space-y-4">
                    {dossier.audit.map((entry,i)=>(
                      <div key={i} className="flex items-start gap-4 relative pl-8">
                        <div className={`absolute left-0 h-7 w-7 flex items-center justify-center text-[8px] font-black text-white shrink-0 ${entry.status==='approved'?'bg-emerald-600':entry.status==='processed'?'bg-[#5467a6]':'bg-neutral-400'}`}>{entry.v}</div>
                        <div className="flex-1 border border-neutral-200 p-3 bg-white">
                          <div className="flex items-center justify-between mb-1">
                            <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 border ${entry.status==='approved'?'bg-emerald-50 border-emerald-300 text-emerald-700':entry.status==='processed'?'bg-blue-50 border-blue-300 text-blue-700':'bg-neutral-100 border-neutral-300 text-neutral-600'}`}>{entry.status.toUpperCase()}</span>
                            <span className="text-[9px] font-mono text-neutral-400">{entry.date}</span>
                          </div>
                          <p className="text-xs text-neutral-700 leading-snug">{entry.action}</p>
                          <p className="text-[10px] text-neutral-500 mt-1 font-medium">— {entry.by}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-neutral-50 border border-neutral-200 p-3 text-[10px] text-neutral-500">
                  All modifications are cryptographically signed and stored in an immutable audit log on the UEH Cloud write-once bucket. Retroactive edits are technically impossible.
                </div>
              </div>
            )}
          </div>

          {/* dossier footer actions */}
          <div className="shrink-0 border-t border-neutral-200 px-5 py-3 bg-neutral-50 flex items-center justify-between">
            <div className="text-[10px] font-mono text-neutral-400">Dossier · ISCM Urban Data Core v2.1</div>
            <div className="flex gap-2">
              {!isConfidential || isAdmin ? <button className="flex items-center gap-1 bg-[#5467a6] hover:bg-[#3d4f8a] text-white text-[9.5px] font-bold uppercase tracking-wider px-3 py-1.5 transition-colors"><Download className="h-3 w-3"/>Export Dossier</button> : null}
              <button onClick={onClose} className="flex items-center gap-1 border border-neutral-300 text-neutral-600 text-[9.5px] font-bold uppercase tracking-wider px-3 py-1.5 hover:border-neutral-500 transition-colors"><X className="h-3 w-3"/>Close</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// INGESTION BUFFER DRAWER (condensed reuse)
// ─────────────────────────────────────────────────────────────
function IngestionBufferDrawer({ open, onClose }) {
  const [tick, setTick] = useState(0);
  useEffect(()=>{if(!open)return;const id=setInterval(()=>setTick(t=>t+1),900);return()=>clearInterval(id);},[open]);
  const dots = '.'.repeat((tick%3)+1);
  return (
    <>
      <div className={`fixed inset-0 bg-black/30 z-40 transition-opacity duration-300 ${open?'opacity-100':'opacity-0 pointer-events-none'}`} onClick={onClose}/>
      <div className={`fixed top-0 right-0 h-full w-full max-w-[480px] bg-white border-l border-neutral-200 shadow-2xl z-50 flex flex-col transform transition-transform duration-300 ease-in-out ${open?'translate-x-0':'translate-x-full'}`}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-200 bg-amber-50 shrink-0">
          <div className="flex items-center gap-2"><UploadCloud className="h-4 w-4 text-amber-600"/><span className="text-xs font-black uppercase tracking-widest text-amber-800">Pending Ingestion Buffer</span><span className="bg-amber-500 text-white text-[9px] font-bold px-1.5 py-0.5 ml-1">{STAGED_FILES.length} STAGED</span></div>
          <button onClick={onClose} className="text-neutral-400 hover:text-neutral-700"><X className="h-4 w-4"/></button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {STAGED_FILES.map((file)=>(
            <div key={file.id} className={`border p-4 space-y-3 ${file.status==='ready'?'border-emerald-200 bg-emerald-50/30':file.status==='warning'?'border-amber-300 bg-amber-50/40':'border-neutral-200 bg-neutral-50/50'}`}>
              <div className="flex items-start justify-between gap-2">
                <div><p className="font-mono text-xs font-bold text-neutral-900">{file.filename}</p><p className="text-[10px] text-neutral-500 mt-0.5">{file.uploader} · {file.uploadedAt} · {file.size}</p></div>
                {file.status==='ready' && <span className="flex items-center gap-1 text-[9px] font-black uppercase text-emerald-700 bg-emerald-100 border border-emerald-300 px-2 py-0.5 shrink-0"><CheckCircle2 className="h-3 w-3"/>READY TO CORE</span>}
                {file.status==='warning' && <span className="flex items-center gap-1 text-[9px] font-black uppercase text-amber-800 bg-amber-100 border border-amber-400 px-2 py-0.5 shrink-0"><AlertTriangle className="h-3 w-3"/>MISSING METADATA</span>}
                {file.status==='processing' && <span className="flex items-center gap-1 text-[9px] font-black uppercase text-neutral-600 bg-neutral-100 border border-neutral-300 px-2 py-0.5 shrink-0 animate-pulse"><RefreshCw className="h-3 w-3 animate-spin"/>PROCESSING{dots}</span>}
              </div>
              <div className="bg-neutral-900 px-3 py-2 font-mono text-[10px] leading-loose">
                <span className="text-neutral-500">$ python3 </span><span className="text-emerald-400">{file.script}</span>
                {file.status==='ready' && <span className="block text-emerald-400 mt-0.5">✓ All checks passed · Ready for ingestion</span>}
                {file.status==='warning' && <><span className="block text-red-400 mt-0.5">✗ CRS mismatch: {file.crsDetected} → expected {file.crsExpected}</span><span className="block text-amber-400">⚠ Missing required metadata fields</span></>}
                {file.status==='processing' && <span className="block text-yellow-400 mt-0.5">↳ Auto-detecting coordinate system{dots}</span>}
              </div>
              <div className="flex gap-2 pt-1 border-t border-neutral-200">
                <button disabled={file.status!=='ready'} className={`flex-1 flex items-center justify-center gap-1 text-[10px] font-bold uppercase py-1.5 transition-colors ${file.status==='ready'?'bg-emerald-600 hover:bg-emerald-700 text-white':'bg-neutral-100 text-neutral-400 cursor-not-allowed'}`}><ArrowRight className="h-3 w-3"/>Push to Core</button>
                <button disabled={file.status==='processing'} className={`flex-1 flex items-center justify-center gap-1 text-[10px] font-bold uppercase py-1.5 border transition-colors ${file.status==='processing'?'border-neutral-200 text-neutral-400 cursor-not-allowed':'border-neutral-300 text-neutral-700 hover:border-red-400 hover:text-red-700'}`}><X className="h-3 w-3"/>Flag & Return</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

// ─────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────
export default function UrbanDataCore() {
  // Grouping & filter state
  const [groupMode, setGroupMode] = useState('category');
  const [activeFolder, setActiveFolder] = useState(null);
  const [expandedFolders, setExpandedFolders] = useState({});
  const [filterGeo, setFilterGeo] = useState('All');
  const [filterPrivacy, setFilterPrivacy] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // UI state
  const [bufferOpen, setBufferOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [rbacRole, setRbacRole] = useState('A');
  const [now, setNow] = useState(new Date());

  useEffect(()=>{const id=setInterval(()=>setNow(new Date()),1000);return()=>clearInterval(id);},[]);

  const groupConfig = GROUP_CONFIGS[groupMode];

  const toggleFolder = (key) => {
    setExpandedFolders(prev=>({...prev,[key]:!prev[key]}));
    setActiveFolder(prev=>prev===key?null:key);
  };

  // Filter logic
  const visibleAssets = useMemo(()=>{
    return MASTER_ASSETS.filter(a=>{
      if (activeFolder && a[groupConfig.assetKey]!==activeFolder) return false;
      if (filterGeo!=='All' && !a.geoScope.includes(filterGeo.split(' (')[0])) return false;
      if (filterPrivacy==='Public Open' && a.privacyLevel!=='public') return false;
      if (filterPrivacy==='Internal Open' && a.privacyLevel!=='internal') return false;
      if (filterPrivacy==='Confidential' && a.privacyLevel!=='confidential') return false;
      if (searchQuery.trim()){const q=searchQuery.toLowerCase();if(!a.name.toLowerCase().includes(q)&&!a.id.toLowerCase().includes(q)&&!a.sourceLab.toLowerCase().includes(q))return false;}
      return true;
    });
  },[activeFolder,groupMode,filterGeo,filterPrivacy,searchQuery,groupConfig]);

  const folderCounts = useMemo(()=>{
    const counts={};
    groupConfig.folders.forEach(f=>{counts[f.key]=MASTER_ASSETS.filter(a=>a[groupConfig.assetKey]===f.key).length;});
    return counts;
  },[groupConfig]);

  const storedGB=325, totalGB=500, pct=Math.round(storedGB/totalGB*100);

  return (
    <div className="flex flex-col h-full -m-4 lg:-mx-6 lg:-my-5 overflow-hidden">

      {/* ── ZONE 1: HEALTH BAR ── */}
      <div className="shrink-0 bg-[#0f1117] text-white border-b border-neutral-800 px-5 py-3">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
          <div className="flex items-center gap-2 shrink-0">
            <div className="h-7 w-7 bg-[#5467a6] flex items-center justify-center"><Database className="h-4 w-4 text-white"/></div>
            <div><p className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-300">ISCM OS — Urban Data Core</p><p className="text-[8px] text-neutral-500 font-mono">v2.1.0 · UEH Cloud · {now.toLocaleTimeString('vi-VN')}</p></div>
          </div>
          <div className="flex items-center gap-3 min-w-[200px]">
            <HardDrive className="h-3.5 w-3.5 text-neutral-400 shrink-0"/>
            <div className="flex-1">
              <div className="flex justify-between text-[9px] mb-1"><span className="text-neutral-400 font-mono">Storage Health</span><span className="text-neutral-200 font-bold font-mono">{storedGB}GB / {totalGB}GB</span></div>
              <div className="h-1.5 bg-neutral-700 w-full"><div className="h-full bg-[#5467a6] transition-all" style={{width:`${pct}%`}}/></div>
              <p className="text-[8px] text-neutral-500 mt-0.5 font-mono">{pct}% used · UEH Cloud Tier-1</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {[['7 Assets', Package,'text-neutral-300'],['Verified',CheckCircle2,'text-emerald-400'],['3 Staged',Clock,'text-amber-400'],['2 Confidential',Lock,'text-red-300']].map(([label,Icon,color])=>(
              <div key={label} className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-2.5 py-1"><Icon className={`h-3 w-3 ${color}`}/><span className={`text-[9px] font-bold font-mono ${color}`}>{label}</span></div>
            ))}
          </div>
          <div className="ml-auto flex items-center gap-3 shrink-0">
            {/* RBAC role selector */}
            <select value={rbacRole} onChange={e=>setRbacRole(e.target.value)} className="bg-neutral-800 border border-neutral-600 text-neutral-200 text-[9.5px] font-bold px-2 py-1 focus:outline-none focus:border-[#5467a6]">
              {RBAC_ROLES.map(r=><option key={r.id} value={r.id}>{r.label}</option>)}
            </select>
            <button onClick={()=>setBufferOpen(true)} className="flex items-center gap-1.5 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-[9px] font-black uppercase tracking-widest px-3 py-1.5 transition-colors">
              <Inbox className="h-3 w-3"/>Buffer<span className="bg-amber-500 text-white text-[8px] font-bold px-1 py-0.5 rounded-sm">{STAGED_FILES.length}</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── ZONES 2 + 3: SPLIT ── */}
      <div className="flex flex-1 overflow-hidden">

        {/* ── ZONE 2: LEFT DOCK ── */}
        <div className="w-64 shrink-0 border-r border-neutral-200 bg-neutral-50 overflow-y-auto flex flex-col">
          {/* grouping mode toggle */}
          <div className="px-3 pt-3 pb-2 border-b border-neutral-100">
            <p className="text-[9px] font-black uppercase tracking-widest text-neutral-400 mb-2">Group Assets By</p>
            <div className="grid grid-cols-3 gap-1">
              {[['category','Category'],['lab','Lab'],['project','Project']].map(([mode,label])=>(
                <button key={mode} onClick={()=>{setGroupMode(mode);setActiveFolder(null);}} className={`text-[9px] font-bold uppercase py-1.5 transition-colors ${groupMode===mode?'bg-[#5467a6] text-white':'bg-white text-neutral-500 border border-neutral-200 hover:border-neutral-400'}`}>{label}</button>
              ))}
            </div>
          </div>

          {/* folder tiers */}
          <div className="px-2 py-2 flex-1 space-y-0.5">
            <p className="text-[8px] font-black uppercase tracking-widest text-neutral-400 px-1 mb-1">{groupConfig.label} Folders</p>
            {groupConfig.folders.map(folder=>{
              const FIcon = folder.icon;
              const isActive = activeFolder === folder.key;
              const isOpen = !!expandedFolders[folder.key];
              const count = folderCounts[folder.key] || 0;
              return (
                <div key={folder.key}>
                  <button onClick={()=>toggleFolder(folder.key)} className={`w-full flex items-center gap-2 px-2 py-1.5 text-left transition-colors ${isActive?'bg-[#5467a6] text-white':'hover:bg-neutral-100 text-neutral-700'}`}>
                    {isOpen ? <FolderOpen className="h-3.5 w-3.5 shrink-0"/> : <Folder className="h-3.5 w-3.5 shrink-0"/>}
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-bold leading-tight truncate">{folder.label}</p>
                      <p className={`text-[8px] truncate ${isActive?'text-white/70':'text-neutral-400'}`}>{folder.sub}</p>
                    </div>
                    <span className={`shrink-0 text-[8px] font-black px-1 py-0.5 rounded-sm ${isActive?'bg-white/20 text-white':'bg-neutral-200 text-neutral-600'}`}>{count}</span>
                    <ChevronRight className={`h-3 w-3 shrink-0 transition-transform ${isOpen?'rotate-90':''}`}/>
                  </button>
                </div>
              );
            })}
            {activeFolder && <button onClick={()=>setActiveFolder(null)} className="w-full text-[9px] text-[#5467a6] hover:underline font-bold text-left px-2 pt-1">← Show all assets</button>}
          </div>

          {/* supplementary filters */}
          <div className="border-t border-neutral-200 px-3 py-3 space-y-4">
            <div>
              <p className="text-[9px] font-black uppercase tracking-widest text-neutral-400 mb-1.5 flex items-center gap-1"><Map className="h-3 w-3"/>Geographic Scope</p>
              {FILTER_GEO.map(opt=><button key={opt} onClick={()=>setFilterGeo(opt)} className={`w-full text-left text-[9.5px] px-2 py-1 transition-colors ${filterGeo===opt?'bg-[#5467a6] text-white font-bold':'text-neutral-600 hover:bg-neutral-100'}`}>{opt}</button>)}
            </div>
            <div>
              <p className="text-[9px] font-black uppercase tracking-widest text-neutral-400 mb-1.5 flex items-center gap-1"><ShieldCheck className="h-3 w-3"/>Security Classification</p>
              {FILTER_PRIVACY.map(opt=><button key={opt} onClick={()=>setFilterPrivacy(opt)} className={`w-full text-left text-[9.5px] px-2 py-1 transition-colors ${filterPrivacy===opt?'bg-[#5467a6] text-white font-bold':'text-neutral-600 hover:bg-neutral-100'}`}>{opt}</button>)}
            </div>
          </div>
        </div>

        {/* ── ZONE 3: CATALOG ── */}
        <div className="flex-1 overflow-y-auto flex flex-col bg-white">
          {/* toolbar */}
          <div className="sticky top-0 z-10 bg-white border-b border-neutral-200 px-5 py-3 flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5"><Database className="h-4 w-4 text-[#5467a6]"/><span className="text-xs font-black uppercase tracking-widest text-neutral-700">Master Data Catalog</span></div>
            <div className="h-4 w-px bg-neutral-200"/>
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400"/>
              <input type="text" value={searchQuery} onChange={e=>setSearchQuery(e.target.value)} placeholder="Search asset ID, name, lab…" className="w-full pl-8 pr-3 py-1.5 border border-neutral-200 text-xs focus:outline-none focus:border-[#5467a6] placeholder:text-neutral-400"/>
              {searchQuery && <button onClick={()=>setSearchQuery('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700"><X className="h-3 w-3"/></button>}
            </div>
            <div className="ml-auto flex items-center gap-2">
              <span className="text-[10px] font-mono text-neutral-400">{visibleAssets.length} / {MASTER_ASSETS.length} assets</span>
              <button onClick={()=>setBufferOpen(true)} className="flex items-center gap-1.5 bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-700 text-[9px] font-bold uppercase tracking-wider px-2.5 py-1.5 transition-colors">
                <UploadCloud className="h-3.5 w-3.5"/>Ingestion Buffer<span className="bg-amber-500 text-white text-[8px] px-1 py-0.5 font-black">{STAGED_FILES.length}</span>
              </button>
            </div>
          </div>

          {/* table */}
          <div className="flex-1 overflow-x-auto">
            <table className="w-full text-xs border-collapse min-w-[960px]">
              <thead>
                <tr className="bg-neutral-50 border-b border-neutral-200">
                  {['Asset ID', 'Asset Name', 'Source Lab', 'Type Tag', 'CRS', 'Privacy', 'Egress Action'].map(col=>(
                    <th key={col} className="text-left py-2.5 px-4 text-[9px] font-black uppercase tracking-widest text-neutral-400 whitespace-nowrap border-b border-neutral-200">{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {visibleAssets.length===0 ? (
                  <tr><td colSpan={7} className="text-center py-16 text-neutral-400"><div className="flex flex-col items-center gap-2"><Filter className="h-8 w-8 text-neutral-300"/><p className="text-sm font-bold text-neutral-500">No assets match selected filters</p><button onClick={()=>{setActiveFolder(null);setFilterGeo('All');setFilterPrivacy('All');setSearchQuery('');}} className="text-xs text-[#5467a6] hover:underline">Clear all filters</button></div></td></tr>
                ) : visibleAssets.map((asset,idx)=>{
                  const Icon = asset.typeIcon;
                  const isConfidentalBlocked = rbacRole==='D' && asset.privacyLevel==='confidential';
                  return (
                    <tr key={asset.id} onClick={()=>setSelectedAsset(asset)} className={`border-b border-neutral-100 cursor-pointer transition-colors group ${idx%2===0?'bg-white':'bg-neutral-50/30'} ${isConfidentalBlocked?'opacity-60':'hover:bg-blue-50/40'}`}>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5"><span className="font-mono text-[10px] text-neutral-600">{asset.id}</span><Copy className="h-3 w-3 text-neutral-300 opacity-0 group-hover:opacity-100 transition-opacity"/></div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div>
                          <p className="font-bold text-neutral-800 leading-tight flex items-center gap-1.5">{asset.name}{isConfidentalBlocked && <Lock className="h-3 w-3 text-red-500 shrink-0"/>}</p>
                          <p className="text-[9px] text-neutral-400 mt-0.5 font-mono">{asset.size} · {asset.records}</p>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap"><LabBadge name={asset.sourceLabShort} color={asset.sourceColor}/></td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5"><Icon className="h-3.5 w-3.5 text-neutral-400 shrink-0"/><TypeBadge tag={asset.typeTag} color={asset.typeColor}/></div>
                      </td>
                      <td className="py-3.5 px-4"><span className="font-mono text-[9.5px] text-neutral-500">{asset.crs}</span></td>
                      <td className="py-3.5 px-4 whitespace-nowrap"><PrivacyBadge level={asset.privacyLevel}/></td>
                      <td className="py-3.5 px-4 whitespace-nowrap" onClick={e=>e.stopPropagation()}>
                        {isConfidentalBlocked
                          ? <span className="flex items-center gap-1 text-[9px] text-red-600 border border-red-200 bg-red-50 px-2 py-1.5 font-bold uppercase"><ShieldX className="h-3 w-3"/>Access Restricted</span>
                          : <EgressButton asset={asset} onAction={()=>{}}/>
                        }
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="shrink-0 border-t border-neutral-100 bg-neutral-50 px-5 py-2.5 flex items-center justify-between">
            <p className="text-[9.5px] text-neutral-400 font-mono">ISCM Urban Data Core · UEH Cloud Platform · Click any row to open Asset Dossier</p>
            <p className="text-[9.5px] text-neutral-400 font-mono">{now.toLocaleDateString('vi-VN')} {now.toLocaleTimeString('vi-VN')}</p>
          </div>
        </div>
      </div>

      {/* ── DOSSIER BACKDROP ── */}
      {selectedAsset && <div className="fixed inset-0 bg-black/20 z-40" onClick={()=>setSelectedAsset(null)}/>}

      {/* ── DOSSIER PANEL ── */}
      {selectedAsset && <DossierPanel asset={selectedAsset} rbacRole={rbacRole} onClose={()=>setSelectedAsset(null)}/>}

      {/* ── INGESTION BUFFER DRAWER ── */}
      <IngestionBufferDrawer open={bufferOpen} onClose={()=>setBufferOpen(false)}/>
    </div>
  );
}

import { useState, useMemo, useEffect } from 'react';
import {
  Search, Link2, FileWarning, LockKeyhole, X, CheckCircle2, Copy, Timer,
  ClipboardCheck, AlertTriangle, Clock, CheckCheck, Ban, ShieldCheck
} from 'lucide-react';
import { supabase, isLive } from '../../lib/supabaseClient.js';

const STORE_KEY = 'iscm_assets_catalog_v3'; // bumped: asset IDs now encode Category-Lab-Geo

// digital_assets row (asset_type='Dataset') -> DataCatalog's internal asset shape.
// dbId (the uuid PK) is kept so edits (approve/quarantine/notes/privacy) can be
// written back to the same row; assets without a dbId (fallback/local seed data)
// only update in local state.
const mapAssetRow = (row) => ({
  id: row.display_code || row.id,
  dbId: row.id,
  name: row.asset_name,
  source: row.submitted_by_name || '',
  crs: row.crs || '',
  scope: row.geo_scope || '',
  metadataStatus: row.metadata_status || 'Under Review',
  privacyLevel: row.privacy_level || 'Pending',
  category: row.category || '',
  format: row.file_extension || '',
  tab: row.pipeline_status === 'Locked in Core' ? 'core' : 'staging',
  status: row.pipeline_status || 'Scanning',
  egressState: row.egress_state || 'red',
  size: row.size_label || '',
  submittedBy: row.submitted_by_name || '',
  submittedDate: row.created_at ? row.created_at.slice(0, 10) : '',
  reviewer: row.reviewer || 'Unassigned',
  reviewNote: row.review_note || '',
});

// Internal asset field -> digital_assets column, for patch updates.
const FIELD_TO_COLUMN = {
  status: 'pipeline_status',
  reviewNote: 'review_note',
  privacyLevel: 'privacy_level',
};
const mapPatchToColumns = (patch) => {
  const out = {};
  for (const [k, v] of Object.entries(patch)) {
    if (k === 'tab') continue; // derived from pipeline_status, not stored separately
    out[FIELD_TO_COLUMN[k] || k] = v;
  }
  return out;
};

const INITIAL_ASSETS = [
  {
    id: 'GIS-DDU-HUE-001',
    name: 'Hue Eco-Cultural Corridor GIS Layers',
    source: 'DDUD Lab / Hue Heritage Project',
    crs: 'VN-2000 (EPSG:5899)',
    scope: 'Hue Heritage Area',
    metadataStatus: 'Complete',
    privacyLevel: 'Confidential',
    category: 'Spatial Vectors (GIS/Drone)',
    format: '.shp / .geojson',
    tab: 'core',
    status: 'Locked in Core',
    egressState: 'red',
    size: '145.2 MB',
    submittedBy: 'DDUD Lab',
    submittedDate: '2025-11-03',
    reviewer: 'Assoc.Prof. Tu Anh Trinh',
    reviewNote: '',
  },
  {
    id: 'SUR-PSA-HCM-002',
    name: 'HCMC District 1 Sidewalk Survey 2026',
    source: 'Public Space Lab / PSA Project',
    crs: 'WGS-84 (EPSG:4326)',
    scope: 'HCMC District 1',
    metadataStatus: 'Complete',
    privacyLevel: 'Public',
    category: 'Survey Fields (Excel/Form)',
    format: '.xlsx / Google Form',
    tab: 'core',
    status: 'Locked in Core',
    egressState: 'green',
    size: '12.4 MB',
    submittedBy: 'Public Space Lab',
    submittedDate: '2026-01-15',
    reviewer: 'Lan Ngoc Hoang',
    reviewNote: 'Verified field columns. Approved.',
  },
  {
    id: 'RS-CRL-MKD-003',
    name: 'Mekong Delta Sentinel-2 Land Cover 10m',
    source: 'Climate Resilience Lab / Partner API',
    crs: 'WGS-84 / UTM 48N (EPSG:32648)',
    scope: 'Mekong Delta',
    metadataStatus: 'Complete',
    privacyLevel: 'Internal',
    category: 'Remote Sensing (Raster/GEE)',
    format: '.tif / GEE Asset',
    tab: 'core',
    status: 'Locked in Core',
    egressState: 'yellow',
    size: '2.4 GB',
    submittedBy: 'Climate Resilience Lab',
    submittedDate: '2025-09-21',
    reviewer: 'Khang Van Huynh',
    reviewNote: 'Band calibration verified.',
  },
  {
    id: 'IOT-MOV-HCM-004',
    name: 'Vinhomes Central Park Smart Lighting Telemetry',
    source: 'MOVE System Lab / IoT Hub',
    crs: 'WGS-84 (EPSG:4326)',
    scope: 'HCMC Binh Thanh',
    metadataStatus: 'Under Review',
    privacyLevel: 'Internal',
    category: 'Sensor Networks (IoT)',
    format: 'MQTT / JSON stream',
    tab: 'staging',
    status: 'In-Pipeline',
    egressState: 'red',
    size: '89.7 MB',
    submittedBy: 'MOVE System Lab',
    submittedDate: '2026-06-28',
    reviewer: 'Hien The Dang',
    reviewNote: '',
  },
  {
    id: 'GIS-DDU-DAN-005',
    name: 'Da Nang Green Space Drone Mapping (LiDAR)',
    source: 'DDUD Lab / City Greenery',
    crs: 'VN-2000 (EPSG:5899)',
    scope: 'Da Nang City',
    metadataStatus: 'Missing Fields',
    privacyLevel: 'Confidential',
    category: 'Spatial Vectors (GIS/Drone)',
    format: '.las / .laz (LiDAR)',
    tab: 'staging',
    status: 'Pending Approval',
    egressState: 'yellow',
    size: '1.8 GB',
    submittedBy: 'DDUD Lab',
    submittedDate: '2026-07-01',
    reviewer: 'Mai Quynh Thi Tran',
    reviewNote: 'Missing projection metadata. Follow-up required.',
  },
  {
    id: 'IOT-MOV-THU-006',
    name: 'Thu Duc City Traffic Flow counts (DRT)',
    source: 'MOVE System Lab / DRT Bus',
    crs: 'WGS-84 (EPSG:4326)',
    scope: 'Thu Duc City',
    metadataStatus: 'Complete',
    privacyLevel: 'Public',
    category: 'Sensor Networks (IoT)',
    format: 'CSV / REST API',
    tab: 'core',
    status: 'Locked in Core',
    egressState: 'green',
    size: '412.3 MB',
    submittedBy: 'MOVE System Lab',
    submittedDate: '2025-12-10',
    reviewer: 'Hoai Nguyen Pham',
    reviewNote: '',
  },
  {
    id: 'IOT-PSA-HCM-007',
    name: 'HCMC Hồ Con Rùa Microclimate Sensor Logs',
    source: 'Public Space Lab / HCR-PDPhung',
    crs: 'WGS-84 (EPSG:4326)',
    scope: 'HCMC District 3',
    metadataStatus: 'Complete',
    privacyLevel: 'Internal',
    category: 'Sensor Networks (IoT)',
    format: 'JSON / InfluxDB',
    tab: 'staging',
    status: 'ETL Processing',
    egressState: 'yellow',
    size: '15.6 MB',
    submittedBy: 'Public Space Lab',
    submittedDate: '2026-07-05',
    reviewer: 'Dung Lai Phuong',
    reviewNote: 'ETL pipeline running. ETA 2026-07-20.',
  },
  {
    id: 'RS-CRL-ANG-008',
    name: 'An Giang Flooding Area SAR Sentinel-1',
    source: 'Climate Resilience Lab / Partner API',
    crs: 'WGS-84 / UTM 48N (EPSG:32648)',
    scope: 'An Giang Province',
    metadataStatus: 'Under Review',
    privacyLevel: 'Public',
    category: 'Remote Sensing (Raster/GEE)',
    format: '.tif / SAR GRD',
    tab: 'staging',
    status: 'In-Pipeline',
    egressState: 'green',
    size: '920.4 MB',
    submittedBy: 'Climate Resilience Lab',
    submittedDate: '2026-07-08',
    reviewer: 'Unassigned',
    reviewNote: '',
  },
  {
    id: 'GIS-DDU-HUE-009',
    name: 'Hue Citadel Historic Building CAD Models',
    source: 'DDUD Lab / Heritage Conservation',
    crs: 'VN-2000 (EPSG:5899)',
    scope: 'Hue Citadel',
    metadataStatus: 'Complete',
    privacyLevel: 'Confidential',
    category: 'Spatial Vectors (GIS/Drone)',
    format: '.dwg / .ifc / .obj',
    tab: 'core',
    status: 'Locked in Core',
    egressState: 'red',
    size: '88.5 MB',
    submittedBy: 'DDUD Lab',
    submittedDate: '2025-08-14',
    reviewer: 'Assoc.Prof. Tu Anh Trinh',
    reviewNote: 'Approved under heritage embargo.',
  },
];

/* ──────────── Column configs per mode ──────────── */
const CORE_COLUMNS = [
  { key: 'stt',      label: 'STT',              width: 48  },
  { key: 'name',     label: 'Asset Name',        width: 260 },
  { key: 'category', label: 'Category',          width: 180 },
  { key: 'format',   label: 'Data Format',       width: 140 },
  { key: 'source',   label: 'Data Source',       width: 190 },
  { key: 'crs',      label: 'CRS',               width: 150 },
  { key: 'scope',    label: 'Geographic Scope',  width: 140 },
  { key: 'metadata', label: 'Metadata',          width: 110 },
  { key: 'privacy',  label: 'Privacy',           width: 100 },
  { key: 'egress',   label: 'Egress Share',      width: 150 },
];

const STAGING_COLUMNS = [
  { key: 'stt',        label: 'STT',            width: 48  },
  { key: 'status_tag', label: 'Pipeline Status',width: 150 },
  { key: 'name',       label: 'Asset Name',     width: 240 },
  { key: 'category',   label: 'Category',       width: 180 },
  { key: 'format',     label: 'Data Format',    width: 140 },
  { key: 'source',     label: 'Submitted By',   width: 200 },
  { key: 'submitted',  label: 'Submitted Date', width: 120 },
  { key: 'reviewer',   label: 'Reviewer',       width: 160 },
  { key: 'privacy_set',label: 'Privacy',        width: 120 },
  { key: 'metadata',   label: 'Metadata',       width: 110 },
  { key: 'reviewnote', label: 'Review Note',    width: 220 },
  { key: 'actions',    label: 'Actions',        width: 160 },
];

/* ──────────── Status config ──────────── */
const STATUS_CFG = {
  'Scanning':         { icon: ShieldCheck,      cls: 'text-fuchsia-700', bg: 'bg-fuchsia-50 border-fuchsia-200' },
  'Locked in Core':   { icon: CheckCheck,       cls: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200' },
  'In-Pipeline':      { icon: Clock,            cls: 'text-sky-700',     bg: 'bg-sky-50 border-sky-200'         },
  'Pending Approval': { icon: ClipboardCheck,   cls: 'text-amber-700',   bg: 'bg-amber-50 border-amber-200'    },
  'ETL Processing':   { icon: AlertTriangle,    cls: 'text-violet-700',  bg: 'bg-violet-50 border-violet-200'  },
  'Quarantined':      { icon: Ban,              cls: 'text-red-700',     bg: 'bg-red-50 border-red-200'        },
};

const CAT_COLOR = {
  'Survey Fields (Excel/Form)':  'bg-sky-50 text-sky-700 border-sky-200',
  'Spatial Vectors (GIS/Drone)': 'bg-violet-50 text-violet-700 border-violet-200',
  'Remote Sensing (Raster/GEE)': 'bg-amber-50 text-amber-700 border-amber-200',
  'Sensor Networks (IoT)':       'bg-emerald-50 text-emerald-700 border-emerald-200',
};

export default function DataCatalog({ mode = 'core', lang }) {
  const [assets, setAssets] = useState([]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (isLive) {
        try {
          const { data, error } = await supabase
            .from('digital_assets')
            .select('*')
            .eq('asset_type', 'Dataset')
            .order('created_at', { ascending: false });
          if (!cancelled && !error && data && data.length > 0) {
            setAssets(data.map(mapAssetRow));
            return;
          }
        } catch {}
      }
      if (cancelled) return;
      try {
        const stored = localStorage.getItem(STORE_KEY);
        if (stored) { setAssets(JSON.parse(stored)); return; }
      } catch {}
      setAssets(INITIAL_ASSETS);
    }
    load();
    return () => { cancelled = true; };
  }, []);

  const defaultCols = mode === 'staging' ? STAGING_COLUMNS : CORE_COLUMNS;
  const [columns, setColumns] = useState(defaultCols);
  const [draggedIdx, setDraggedIdx] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [labFilter, setLabFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [geoFilter, setGeoFilter] = useState('All');
  const [generatedLink, setGeneratedLink] = useState(null);
  const [editingNote, setEditingNote] = useState(null); // assetId

  // Targeted single-row update: writes back to Supabase when the asset has a
  // live dbId, otherwise just updates local state (and persists to
  // localStorage so offline/fallback assets still keep their edits).
  const patchAsset = (id, patch) => {
    const current = assets.find(a => a.id === id);
    const next = assets.map(a => a.id === id ? { ...a, ...patch } : a);
    setAssets(next);
    if (isLive && current?.dbId) {
      supabase.from('digital_assets').update(mapPatchToColumns(patch)).eq('id', current.dbId)
        .then(({ error }) => { if (error) console.error('Failed to sync asset update to Supabase:', error); });
    } else {
      localStorage.setItem(STORE_KEY, JSON.stringify(next));
    }
  };

  /* ── Column drag-reorder ── */
  const onDragStart = (i) => setDraggedIdx(i);
  const onDragOver  = (e) => e.preventDefault();
  const onDrop      = (ti) => {
    if (draggedIdx === null || draggedIdx === ti) return;
    const next = [...columns];
    const [col] = next.splice(draggedIdx, 1);
    next.splice(ti, 0, col);
    setColumns(next);
    setDraggedIdx(null);
  };

  /* ── Column resize ── */
  const onResizeStart = (ci, e) => {
    e.stopPropagation(); e.preventDefault();
    const sx = e.clientX, sw = columns[ci].width;
    const mv = (me) => {
      const w = Math.max(40, sw + me.clientX - sx);
      setColumns(prev => prev.map((c, i) => i === ci ? { ...c, width: w } : c));
    };
    const up = () => { window.removeEventListener('mousemove', mv); window.removeEventListener('mouseup', up); };
    window.addEventListener('mousemove', mv);
    window.addEventListener('mouseup', up);
  };

  /* ── Filtering ── */
  const filteredAssets = useMemo(() => {
    let rows = assets.filter(a => a.tab === mode);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      rows = rows.filter(a =>
        a.name.toLowerCase().includes(q) ||
        a.source.toLowerCase().includes(q) ||
        a.id.toLowerCase().includes(q) ||
        a.scope.toLowerCase().includes(q)
      );
    }
    if (categoryFilter !== 'All') rows = rows.filter(a => a.category === categoryFilter);
    if (labFilter !== 'All')      rows = rows.filter(a => a.source.toLowerCase().includes(labFilter.split(' ')[0].toLowerCase()));
    if (statusFilter !== 'All')   rows = rows.filter(a => a.status === statusFilter);
    if (geoFilter !== 'All')      rows = rows.filter(a => a.scope.toLowerCase().includes(geoFilter.toLowerCase().split(' ')[0]));
    return rows;
  }, [assets, mode, searchQuery, categoryFilter, labFilter, statusFilter, geoFilter]);

  /* ── Staging actions ── */
  const handleApprove = (id) => {
    if (!window.confirm(lang === 'vi'
      ? 'Xác nhận phê duyệt đưa tài sản này vào kho chính?'
      : 'Confirm approval to migrate this asset into the Core Catalog?')) return;
    patchAsset(id, { tab: 'core', status: 'Locked in Core' });
  };
  const handleQuarantine = (id) => {
    patchAsset(id, { status: 'Quarantined' });
  };
  const handleScanClear = (id) => {
    patchAsset(id, { status: 'In-Pipeline' });
  };
  const handleScanThreat = (id) => {
    if (!window.confirm(lang === 'vi'
      ? 'Xác nhận phát hiện mã độc và cách ly tệp này?'
      : 'Confirm threat detected — quarantine this file?')) return;
    const current = assets.find(a => a.id === id);
    patchAsset(id, {
      status: 'Quarantined',
      reviewNote: current?.reviewNote || (lang === 'vi'
        ? 'ClamAV: phát hiện mã độc — cách ly tại Sandbox.'
        : 'ClamAV: malware detected — quarantined to Sandbox.'),
    });
  };
  const handleSaveNote = (id, note) => {
    patchAsset(id, { reviewNote: note });
    setEditingNote(null);
  };

  /* ── Egress share (core only) ── */
  const handleEgress = (asset) => {
    const tok = Math.random().toString(36).slice(2, 10).toUpperCase();
    if (asset.egressState === 'green') {
      setGeneratedLink({
        assetName: asset.name,
        url: `https://iscm-lakehouse.ueh.edu.vn/egress/public/${asset.id}?token=PUB-${tok}`,
        expires: '23h 59m 59s', type: 'Public Access Link'
      });
    } else if (asset.egressState === 'yellow') {
      alert(lang === 'vi'
        ? 'Yêu cầu truy cập đang chờ phê duyệt từ Ban Giám đốc.'
        : 'CONTROLLED SHARING: Access request is pending board review.');
    } else {
      setGeneratedLink({
        assetName: asset.name,
        url: `https://iscm-lakehouse.ueh.edu.vn/egress/api/v1/stream/${asset.id}?key=SEC-${tok}`,
        expires: '01h 00m 00s (Admin Session)', type: 'Secure API Stream Token'
      });
    }
  };

  const tableWidth = columns.reduce((s, c) => s + c.width, 0);

  /* ── Cell renderer ── */
  const cellVal = (col, asset, ai) => {
    switch (col.key) {
      case 'stt':
        return <span className="text-neutral-400 font-mono text-[11px]">{ai + 1}</span>;

      case 'name':
        return (
          <span className="font-semibold text-neutral-800 text-xs leading-snug">
            {asset.name}
            <span className="block text-[9px] text-neutral-400 font-mono font-normal mt-0.5">
              {asset.id} · {asset.size}
            </span>
          </span>
        );

      case 'category': {
        const cls = CAT_COLOR[asset.category] || 'bg-neutral-50 text-neutral-600 border-neutral-200';
        return <span className={`text-[10px] font-bold border px-1.5 py-0.5 leading-snug ${cls}`}>{asset.category}</span>;
      }

      case 'format':
        return <span className="font-mono text-[10px] text-neutral-600 bg-neutral-100 px-1.5 py-0.5 rounded-sm">{asset.format || '—'}</span>;

      case 'source':
        return <span className="text-xs text-neutral-700">{asset.source}</span>;

      case 'crs':
        return <span className="font-mono text-[10px] text-neutral-500">{asset.crs}</span>;

      case 'scope':
        return <span className="text-xs text-neutral-700">{asset.scope}</span>;

      case 'metadata': {
        const mc = asset.metadataStatus === 'Complete' ? 'text-emerald-700' : asset.metadataStatus === 'Under Review' ? 'text-amber-600' : 'text-red-600';
        return <span className={`text-[10px] font-bold ${mc}`}>{asset.metadataStatus}</span>;
      }

      case 'privacy': {
        const pc = asset.privacyLevel === 'Public' ? 'text-emerald-700' : asset.privacyLevel === 'Internal' ? 'text-blue-700' : 'text-red-700';
        return <span className={`text-[10px] font-bold uppercase tracking-wide ${pc}`}>{asset.privacyLevel}</span>;
      }

      case 'egress':
        return (
          <button onClick={() => handleEgress(asset)}
            className="text-[10px] font-bold uppercase tracking-wide text-neutral-700 hover:text-[#8b0000] transition-colors">
            {asset.egressState === 'green'  && '[Public Link]'}
            {asset.egressState === 'yellow' && '[Pending Review]'}
            {asset.egressState === 'red'    && '[Secure API]'}
          </button>
        );

      /* ── Staging-only columns ── */
      case 'status_tag': {
        const cfg = STATUS_CFG[asset.status] || { icon: Clock, cls: 'text-neutral-500', bg: 'bg-neutral-50 border-neutral-200' };
        const Icon = cfg.icon;
        return (
          <span className={`inline-flex items-center gap-1 text-[10px] font-bold border px-1.5 py-0.5 ${cfg.bg} ${cfg.cls}`}>
            <Icon className="h-3 w-3 shrink-0" />
            {asset.status}
          </span>
        );
      }

      case 'submitted':
        return <span className="font-mono text-[10px] text-neutral-500">{asset.submittedDate || '—'}</span>;

      case 'reviewer':
        return (
          <span className={`text-[10px] font-medium ${asset.reviewer === 'Unassigned' ? 'text-red-500 italic' : 'text-neutral-700'}`}>
            {asset.reviewer || 'Unassigned'}
          </span>
        );

      case 'privacy_set': {
        const privVal = asset.privacyLevel || 'Pending';
        const privCls = {
          Public:       'text-emerald-700 border-emerald-300 bg-emerald-50',
          Internal:     'text-blue-700 border-blue-300 bg-blue-50',
          Confidential: 'text-red-700 border-red-300 bg-red-50',
          Pending:      'text-amber-600 border-amber-300 bg-amber-50',
        }[privVal] || 'text-neutral-500 border-neutral-200 bg-neutral-50';
        return (
          <select
            value={privVal}
            onChange={(e) => patchAsset(asset.id, { privacyLevel: e.target.value })}
            className={`border text-[10px] font-bold px-1.5 py-0.5 rounded-none focus:outline-none cursor-pointer w-full ${privCls}`}
          >
            <option value="Pending">— Pending —</option>
            <option value="Public">Public</option>
            <option value="Internal">Internal</option>
            <option value="Confidential">Confidential</option>
          </select>
        );
      }

      case 'reviewnote': {
        const isEditing = editingNote === asset.id;
        return isEditing ? (
          <textarea
            autoFocus
            defaultValue={asset.reviewNote}
            rows={2}
            onBlur={(e) => handleSaveNote(asset.id, e.target.value)}
            className="w-full border border-[#8b0000]/40 text-[10px] p-1 font-ibm focus:outline-none resize-none bg-white"
          />
        ) : (
          <span
            onClick={() => setEditingNote(asset.id)}
            className="text-[10px] text-neutral-600 italic cursor-text hover:text-neutral-900 leading-snug block min-h-[1.5em]"
            title="Click to edit review note"
          >
            {asset.reviewNote || <span className="text-neutral-300">+ Add note…</span>}
          </span>
        );
      }

      case 'actions': {
        if (asset.status === 'Scanning') return (
          <span className="flex flex-col gap-1">
            <button onClick={() => handleScanClear(asset.id)}
              className="text-[10px] font-bold uppercase text-emerald-700 hover:text-emerald-900 text-left">
              ✓ Clean → Queue for Review
            </button>
            <button onClick={() => handleScanThreat(asset.id)}
              className="text-[10px] font-bold uppercase text-[#8b0000] hover:text-red-800 text-left">
              ⛔ Threat Detected
            </button>
          </span>
        );
        const actionable = ['Pending Approval', 'In-Pipeline', 'ETL Processing'].includes(asset.status);
        if (!actionable) return (
          <span className="text-[10px] text-neutral-400 italic uppercase">{asset.status === 'Quarantined' ? '⛔ Quarantined' : '✓ Migrated'}</span>
        );
        return (
          <span className="flex flex-col gap-1">
            <button onClick={() => handleApprove(asset.id)}
              className="text-[10px] font-bold uppercase text-emerald-700 hover:text-emerald-900 text-left">
              ✓ Approve → Core
            </button>
            <button onClick={() => handleQuarantine(asset.id)}
              className="text-[10px] font-bold uppercase text-[#8b0000] hover:text-red-800 text-left">
              ⛔ Quarantine
            </button>
          </span>
        );
      }

      default: return null;
    }
  };

  /* ── Staging pipeline summary bar ── */
  const stagingCounts = useMemo(() => {
    const rows = assets.filter(a => a.tab === 'staging');
    return {
      total: rows.length,
      scanning: rows.filter(a => a.status === 'Scanning').length,
      pending: rows.filter(a => a.status === 'Pending Approval').length,
      etl: rows.filter(a => a.status === 'ETL Processing').length,
      pipeline: rows.filter(a => a.status === 'In-Pipeline').length,
      quarantined: rows.filter(a => a.status === 'Quarantined').length,
    };
  }, [assets]);

  return (
    <div className="space-y-4 text-left font-ibm bg-white">

      {/* ── Staging summary bar ── */}
      {mode === 'staging' && (
        <div className="grid grid-cols-5 gap-2 select-none text-center">
          {[
            { label: lang === 'vi' ? 'Đang quét virus' : 'Scanning', val: stagingCounts.scanning,     cls: 'text-fuchsia-700 border-fuchsia-200 bg-fuchsia-50' },
            { label: lang === 'vi' ? 'Chờ duyệt' : 'Pending Approval', val: stagingCounts.pending,     cls: 'text-amber-700 border-amber-200 bg-amber-50' },
            { label: lang === 'vi' ? 'Đang xử lý ETL' : 'ETL Processing',     val: stagingCounts.etl,         cls: 'text-violet-700 border-violet-200 bg-violet-50' },
            { label: lang === 'vi' ? 'Trong pipeline' : 'In-Pipeline',      val: stagingCounts.pipeline,    cls: 'text-sky-700 border-sky-200 bg-sky-50' },
            { label: lang === 'vi' ? 'Bị cách ly' : 'Quarantined',      val: stagingCounts.quarantined, cls: 'text-red-700 border-red-200 bg-red-50' },
          ].map(({ label, val, cls }) => (
            <div key={label} className={`border px-3 py-2 ${cls}`}>
              <div className="text-lg font-black">{val}</div>
              <div className="text-[9px] font-bold uppercase tracking-wider mt-0.5">{label}</div>
            </div>
          ))}
        </div>
      )}

      {/* ── Toolbar ── */}
      <div className="flex flex-wrap items-center gap-2.5 bg-neutral-50 p-2.5 border border-neutral-200/60 select-none">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-400" />
          <input
            type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={lang === 'vi' ? 'Tìm tên tài sản, nguồn dữ liệu...' : 'Search asset name, source...'}
            className="w-full pl-9 pr-3 py-1.5 border border-neutral-200 bg-white text-xs placeholder:text-neutral-400 focus:border-[#8b0000] focus:outline-none rounded-none"
          />
        </div>

        <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}
          className="border border-neutral-200 bg-white px-2.5 py-1.5 text-xs focus:border-[#8b0000] focus:outline-none rounded-none text-neutral-700">
          <option value="All">{lang === 'vi' ? 'Tất cả phân loại' : 'All Categories'}</option>
          <option value="Survey Fields (Excel/Form)">Survey Fields</option>
          <option value="Spatial Vectors (GIS/Drone)">Spatial Vectors (GIS/Drone)</option>
          <option value="Remote Sensing (Raster/GEE)">Remote Sensing (Raster/GEE)</option>
          <option value="Sensor Networks (IoT)">Sensor Networks (IoT)</option>
        </select>

        <select value={labFilter} onChange={(e) => setLabFilter(e.target.value)}
          className="border border-neutral-200 bg-white px-2.5 py-1.5 text-xs focus:border-[#8b0000] focus:outline-none rounded-none text-neutral-700">
          <option value="All">{lang === 'vi' ? 'Tất cả nguồn Lab' : 'All Lab Origins'}</option>
          <option value="Public Space Lab">Public Space Lab</option>
          <option value="DDUD Lab">DDUD Lab</option>
          <option value="MOVE System Lab">MOVE System Lab</option>
          <option value="Climate Resilience Lab">Climate Resilience Lab</option>
        </select>

        {mode === 'staging' && (
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-neutral-200 bg-white px-2.5 py-1.5 text-xs focus:border-[#8b0000] focus:outline-none rounded-none text-neutral-700">
            <option value="All">{lang === 'vi' ? 'Tất cả trạng thái' : 'All Statuses'}</option>
            <option value="In-Pipeline">In-Pipeline</option>
            <option value="Pending Approval">Pending Approval</option>
            <option value="ETL Processing">ETL Processing</option>
            <option value="Quarantined">Quarantined</option>
          </select>
        )}

        <select value={geoFilter} onChange={(e) => setGeoFilter(e.target.value)}
          className="border border-neutral-200 bg-white px-2.5 py-1.5 text-xs focus:border-[#8b0000] focus:outline-none rounded-none text-neutral-700">
          <option value="All">{lang === 'vi' ? 'Tất cả địa bàn' : 'All Geographies'}</option>
          <option value="HCMC">HCMC</option>
          <option value="Hue">Hue</option>
          <option value="Da Nang">Da Nang</option>
          <option value="Mekong">Mekong Delta</option>
        </select>
      </div>

      {/* ── Table ── */}
      <div className="border border-neutral-200 overflow-auto">
        <table className="table-fixed border-collapse" style={{ width: tableWidth }}>
          <colgroup>
            {columns.map(c => <col key={c.key} style={{ width: c.width }} />)}
          </colgroup>
          <thead className="sticky top-0 z-10 bg-neutral-900 text-white">
            <tr>
              {columns.map((col, ci) => (
                <th key={col.key}
                  draggable={col.key !== 'stt'}
                  onDragStart={() => onDragStart(ci)}
                  onDragOver={onDragOver}
                  onDrop={() => onDrop(ci)}
                  className={`px-2 py-2.5 text-center text-[10px] font-black uppercase tracking-wider border-r border-neutral-800 relative select-none ${col.key !== 'stt' ? 'cursor-move hover:bg-neutral-800' : ''}`}
                >
                  {col.label}
                  <span onMouseDown={(e) => onResizeStart(ci, e)}
                    className="absolute right-0 top-0 bottom-0 w-1.5 cursor-col-resize hover:bg-[#8b0000]/50 z-20" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100 bg-white text-xs">
            {filteredAssets.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="py-10 text-center text-neutral-400 italic">
                  {lang === 'vi' ? 'Không tìm thấy tài sản nào.' : 'No data assets found.'}
                </td>
              </tr>
            ) : filteredAssets.map((asset, ai) => (
              <tr key={asset.id} className="hover:bg-neutral-50 transition-colors">
                {columns.map(col => (
                  <td key={col.key}
                    className={`px-3 py-2.5 border-r border-neutral-100 align-top ${col.key === 'stt' ? 'text-center' : ''}`}>
                    {cellVal(col, asset, ai)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── Footnote ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between text-[10px] text-neutral-400 gap-1 select-none px-1">
        <span>
          {mode === 'staging'
            ? (lang === 'vi' ? '* Dữ liệu đang trong quá trình thẩm định — chưa được phê duyệt vào kho chính.' : '* Assets listed are under audit — not yet approved into the Core Catalog.')
            : (lang === 'vi' ? '* Tất cả tài sản được định vị theo hệ tọa độ VN-2000.' : '* All assets are projected to VN-2000 coordinate reference system.')}
        </span>
        <span className="font-semibold text-[#8b0000]">RBAC Mode: Active Directory Connected</span>
      </div>

      {/* ── Generated link popup (core only) ── */}
      {generatedLink && (
        <div className="bg-neutral-900 text-white p-3.5 border-l-4 border-emerald-500">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-2 mb-2">
            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5" /> {generatedLink.type}
            </span>
            <button onClick={() => setGeneratedLink(null)} className="text-neutral-400 hover:text-white"><X className="h-4 w-4" /></button>
          </div>
          <p className="text-[9px] text-neutral-400 font-bold uppercase mb-0.5">{lang === 'vi' ? 'Tài sản:' : 'Asset:'}</p>
          <p className="text-xs font-bold text-neutral-100 mb-2.5">{generatedLink.assetName}</p>
          <div className="flex items-center gap-2 bg-neutral-950 p-2 border border-neutral-800">
            <input readOnly value={generatedLink.url}
              className="bg-transparent border-none text-[11px] font-mono flex-1 text-emerald-300 focus:outline-none" />
            <button onClick={() => navigator.clipboard.writeText(generatedLink.url)}
              className="p-1 hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors">
              <Copy className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="mt-2 text-[9px] text-neutral-400 flex items-center gap-1">
            <Timer className="h-3 w-3 text-red-400" />
            <span>{lang === 'vi' ? `Hết hạn sau ${generatedLink.expires}` : `Expires in ${generatedLink.expires}`}</span>
          </div>
        </div>
      )}
    </div>
  );
}

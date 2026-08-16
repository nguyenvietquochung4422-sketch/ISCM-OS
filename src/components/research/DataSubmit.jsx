import { useState, useRef, useMemo } from 'react';
import { UploadCloud, CheckCircle2, X, Plus, File, AlertTriangle, User } from 'lucide-react';
import { researchList, RESEARCH_UNITS } from '../../data/researchList.js';
import { buildAssetId } from '../../data/assetCodes.js';
import { supabase, isLive } from '../../lib/supabaseClient.js';

const STORE_KEY = 'iscm_assets_catalog_v3'; // must match DataCatalog.jsx's STORE_KEY

// Simulated logged-in user — replace with auth context when available
const CURRENT_USER = 'Hung Quoc Viet Nguyen, B.A';

const CATEGORIES = [
  'Survey Fields (Excel/Form)',
  'Spatial Vectors (GIS/Drone)',
  'Remote Sensing (Raster/GEE)',
  'Sensor Networks (IoT)',
];

// Detect format label from file extension
const detectFormat = (filename) => {
  const ext = filename.split('.').pop().toLowerCase();
  const MAP = {
    shp: '.shp (Shapefile)',
    geojson: '.geojson',
    kml: '.kml',
    tif: '.tif (GeoTIFF)',
    tiff: '.tif (GeoTIFF)',
    las: '.las (LiDAR)',
    laz: '.laz (LiDAR compressed)',
    csv: 'CSV',
    xlsx: '.xlsx (Excel)',
    xls: '.xls (Excel)',
    json: 'JSON',
    dwg: '.dwg (AutoCAD)',
    ifc: '.ifc (BIM)',
    obj: '.obj (3D Mesh)',
    zip: '.zip (Archive)',
    gpkg: '.gpkg (GeoPackage)',
    nc: '.nc (NetCDF)',
    hdf: '.hdf (HDF5)',
    geotiff: 'GeoTIFF',
  };
  return MAP[ext] || `.${ext.toUpperCase()}`;
};

const humanSize = (bytes) => {
  if (bytes < 1024)             return `${bytes} B`;
  if (bytes < 1024 * 1024)     return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 ** 3)       return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
  return `${(bytes / 1024 ** 3).toFixed(2)} GB`;
};

const EMPTY_FORM = {
  name: '',
  linkedProjectId: '',   // id from researchList
  category: '',
  scope: '',
  description: '',
};

export default function DataSubmit({ lang }) {
  const [form, setForm]           = useState(EMPTY_FORM);
  const [attachedFile, setFile]   = useState(null);
  const [dragOver, setDragOver]   = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submittedName, setName]  = useState('');
  const [errors, setErrors]       = useState({});
  const [folderDropped, setFolderDropped] = useState(false);
  const fileInputRef              = useRef();

  // Group research list by unit for the dropdown optgroups
  const groupedProjects = useMemo(() => {
    return RESEARCH_UNITS.map(unit => ({
      unit,
      items: researchList.filter(r =>
        r.research_unit === unit && r.task_name
      ),
    })).filter(g => g.items.length > 0);
  }, []);

  const set = (field, val) => {
    setForm(prev => ({ ...prev, [field]: val }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: false }));
  };

  const processFile = (file) => {
    if (!file) return;
    setFolderDropped(false);
    setFile({
      name: file.name,
      format: detectFormat(file.name),
      size: humanSize(file.size),
    });
    if (!form.name) set('name', file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '));
    if (errors.file) setErrors(prev => ({ ...prev, file: false }));
  };

  const handleFileDrop = (e) => {
    e.preventDefault();
    setDragOver(false);

    // Reject directories dropped from the OS file explorer — a dropped folder
    // surfaces as a fake File (size 0, no extension) and would otherwise slip
    // through as a bogus asset with no real content.
    const item = e.dataTransfer?.items?.[0];
    const entry = item?.webkitGetAsEntry?.();
    if (entry && entry.isDirectory) {
      setFolderDropped(true);
      setErrors(prev => ({ ...prev, file: true }));
      return;
    }

    processFile(e.dataTransfer?.files?.[0]);
  };

  const handleFileInput = (e) => processFile(e.target.files?.[0]);

  const validate = () => {
    const e = {};
    if (!attachedFile)              e.file = true;
    if (!form.name.trim())          e.name = true;
    if (!form.category)             e.category = true;
    if (!form.linkedProjectId)      e.linkedProjectId = true;
    if (!form.scope.trim())         e.scope = true;
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;

    const linked = researchList.find(r => r.id === form.linkedProjectId);
    const sourceStr = linked
      ? `${linked.research_unit} / ${linked.task_name}${linked.code ? ` (${linked.code})` : ''}`
      : '';

    const today = new Date().toISOString().slice(0, 10);
    const newId  = buildAssetId({ category: form.category, source: sourceStr, scope: form.scope.trim() });

    const newAsset = {
      id: newId,
      name: form.name.trim(),
      source: sourceStr,
      crs: '',            // ETL will handle
      scope: form.scope.trim(),
      metadataStatus: 'Under Review',
      privacyLevel: 'Pending',
      category: form.category,
      format: attachedFile.format,
      tab: 'staging',
      status: 'Scanning',
      egressState: 'red',
      size: attachedFile.size,
      submittedBy: CURRENT_USER,
      submittedDate: today,
      reviewer: 'Unassigned',
      reviewNote: form.description.trim(),
    };

    let savedLive = false;
    if (isLive) {
      // No real file storage backend yet — storage_url is a placeholder until
      // one is wired up; the actual bytes never leave the browser today.
      const { error } = await supabase.from('digital_assets').insert({
        asset_name: newAsset.name,
        asset_type: 'Dataset',
        file_extension: newAsset.format,
        storage_url: `local://pending-upload/${newId}`,
        category: newAsset.category,
        geo_scope: newAsset.scope,
        crs: newAsset.crs,
        pipeline_status: newAsset.status,
        metadata_status: newAsset.metadataStatus,
        privacy_level: newAsset.privacyLevel,
        egress_state: newAsset.egressState,
        reviewer: newAsset.reviewer,
        review_note: newAsset.reviewNote,
        submitted_by_name: newAsset.submittedBy,
        size_label: newAsset.size,
        display_code: newId,
        linked_research_code: linked?.code || null,
      });
      if (!error) savedLive = true;
      else console.error('Failed to submit asset to Supabase, falling back to local storage:', error);
    }

    if (!savedLive) {
      try {
        const existing = JSON.parse(localStorage.getItem(STORE_KEY) || '[]');
        localStorage.setItem(STORE_KEY, JSON.stringify([...existing, newAsset]));
      } catch {}
    }

    setName(form.name.trim());
    setSubmitted(true);
    setForm(EMPTY_FORM);
    setFile(null);
  };

  const errCls = (f) => errors[f]
    ? 'border-red-400 bg-red-50/30 focus:border-red-500'
    : 'border-neutral-200 focus:border-[#8b0000]';

  const lbl = (text, required) => (
    <label className="block text-[10px] font-black uppercase tracking-wider text-neutral-500 mb-1 select-none">
      {text}{required && <span className="text-[#8b0000] ml-0.5">*</span>}
    </label>
  );

  return (
    <div className="max-w-3xl font-ibm text-neutral-900 space-y-6">

      {/* Header */}
      <div className="border-b border-neutral-200 pb-3">
        <h2 className="text-sm font-black uppercase tracking-widest text-neutral-800">
          {lang === 'vi' ? 'Nộp tài sản dữ liệu mới' : 'Submit New Data Asset'}
        </h2>
        <p className="text-[11px] text-neutral-500 mt-1">
          {lang === 'vi'
            ? 'Tài sản sẽ vào hàng đợi kiểm duyệt (Central Data Asset Catalog). Phân quyền bảo mật do Data Steward quyết định.'
            : 'The asset will enter the review pipeline in the Central Data Asset Catalog. Privacy level is assigned by the Data Steward.'}
        </p>
      </div>

      {/* Logged-in user badge */}
      <div className="flex items-center gap-2 bg-neutral-50 border border-neutral-200 px-3 py-2 select-none">
        <User className="h-3.5 w-3.5 text-neutral-400 shrink-0" />
        <span className="text-[11px] text-neutral-500">
          {lang === 'vi' ? 'Người nộp:' : 'Submitting as:'}
        </span>
        <span className="text-[11px] font-bold text-neutral-800">{CURRENT_USER}</span>
      </div>

      {/* Success banner */}
      {submitted && (
        <div className="flex items-start gap-3 bg-emerald-50 border border-emerald-200 p-3">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
          <div className="flex-1">
            <p className="text-xs font-bold text-emerald-800">
              {lang === 'vi' ? 'Nộp thành công!' : 'Submission successful!'}
            </p>
            <p className="text-[11px] text-emerald-700 mt-0.5">
              «{submittedName}»{' '}
              {lang === 'vi'
                ? 'đã được thêm vào pipeline kiểm duyệt.'
                : 'has been added to the Central Data Asset Catalog review pipeline.'}
            </p>
          </div>
          <button onClick={() => setSubmitted(false)} className="text-emerald-400 hover:text-emerald-700">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">

        {/* ── 1. File upload (auto-detects format + size) ── */}
        <div>
          {lbl(lang === 'vi' ? 'Tệp dữ liệu' : 'Data File', true)}
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleFileDrop}
            onClick={() => !attachedFile && fileInputRef.current?.click()}
            className={`border-2 border-dashed p-5 text-center transition-colors cursor-pointer ${
              errors.file    ? 'border-red-300 bg-red-50/20' :
              dragOver       ? 'border-[#8b0000] bg-red-50/20' :
              attachedFile   ? 'border-emerald-300 bg-emerald-50/20 cursor-default' :
                               'border-neutral-200 hover:border-neutral-400'
            }`}
          >
            <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileInput} />
            {attachedFile ? (
              <div className="flex items-center justify-center gap-3">
                <File className="h-5 w-5 text-emerald-600 shrink-0" />
                <div className="text-left">
                  <p className="text-xs font-bold text-neutral-800">{attachedFile.name}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="font-mono text-[10px] bg-neutral-100 px-1.5 py-0.5 text-neutral-600">
                      {attachedFile.format}
                    </span>
                    <span className="font-mono text-[10px] text-neutral-500">
                      {attachedFile.size}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setFile(null); }}
                  className="ml-auto text-neutral-400 hover:text-red-500 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <>
                <UploadCloud className="h-7 w-7 mx-auto mb-2 text-neutral-300" />
                <p className="text-xs text-neutral-500">
                  {lang === 'vi' ? 'Kéo thả tệp hoặc ' : 'Drag & drop or '}
                  <span className="text-[#8b0000] font-bold underline cursor-pointer">
                    {lang === 'vi' ? 'chọn từ máy tính' : 'browse'}
                  </span>
                </p>
                <p className="text-[10px] text-neutral-400 mt-1">
                  .shp · .tif · .las · .xlsx · .csv · .json · .dwg · .ifc…
                </p>
                <p className="text-[10px] text-neutral-400 mt-1">
                  {lang === 'vi'
                    ? 'Bộ nhiều tệp (VD: .shp/.shx/.dbf)? Hãy nén thành .zip trước khi tải lên.'
                    : 'Multi-file sets (e.g. .shp/.shx/.dbf)? Zip them before uploading.'}
                </p>
              </>
            )}
          </div>
          {errors.file && (
            <p className="text-[10px] text-red-500 mt-1 flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" />
              {folderDropped
                ? (lang === 'vi'
                    ? 'Không hỗ trợ nộp thư mục. Vui lòng nén thành .zip (VD: bộ shapefile .shp/.shx/.dbf) rồi tải lên.'
                    : 'Folders are not supported. Please compress it into a .zip (e.g. a .shp/.shx/.dbf shapefile set) and upload that instead.')
                : (lang === 'vi' ? 'Vui lòng đính kèm tệp dữ liệu.' : 'Please attach a data file.')}
            </p>
          )}
        </div>

        {/* ── 2. Asset Name ── */}
        <div>
          {lbl(lang === 'vi' ? 'Tên tài sản dữ liệu' : 'Asset Name', true)}
          <input
            type="text"
            value={form.name}
            onChange={(e) => set('name', e.target.value)}
            placeholder={lang === 'vi' ? 'Vd: HCMC District 7 Green Corridor Survey 2026' : 'e.g. HCMC District 7 Green Corridor Survey 2026'}
            className={`w-full border px-3 py-2 text-xs rounded-none focus:outline-none transition-colors ${errCls('name')}`}
          />
          {errors.name && <p className="text-[10px] text-red-500 mt-0.5">{lang === 'vi' ? 'Bắt buộc nhập.' : 'Required.'}</p>}
        </div>

        {/* ── 3. Category + Source/Project ── */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            {lbl(lang === 'vi' ? 'Phân loại dữ liệu' : 'Category', true)}
            <select
              value={form.category}
              onChange={(e) => set('category', e.target.value)}
              className={`w-full border px-3 py-2 text-xs rounded-none focus:outline-none bg-white transition-colors ${errCls('category')}`}
            >
              <option value="">{lang === 'vi' ? '— Chọn loại —' : '— Select category —'}</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            {errors.category && <p className="text-[10px] text-red-500 mt-0.5">{lang === 'vi' ? 'Bắt buộc chọn.' : 'Required.'}</p>}
          </div>

          <div>
            {lbl(lang === 'vi' ? 'Dự án liên kết (Research List)' : 'Linked Project (Research List)', true)}
            <select
              value={form.linkedProjectId}
              onChange={(e) => set('linkedProjectId', e.target.value)}
              className={`w-full border px-3 py-2 text-xs rounded-none focus:outline-none bg-white transition-colors ${errCls('linkedProjectId')}`}
            >
              <option value="">{lang === 'vi' ? '— Chọn dự án —' : '— Select project —'}</option>
              {groupedProjects.map(({ unit, items }) => (
                <optgroup key={unit} label={unit}>
                  {items.map(r => (
                    <option key={r.id} value={r.id}>
                      {r.code ? `[${r.code}] ` : ''}{r.task_name}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
            {errors.linkedProjectId && <p className="text-[10px] text-red-500 mt-0.5">{lang === 'vi' ? 'Bắt buộc chọn.' : 'Required.'}</p>}
            {form.linkedProjectId && (() => {
              const r = researchList.find(x => x.id === form.linkedProjectId);
              return r ? (
                <p className="text-[10px] text-neutral-500 mt-1 font-mono">
                  {r.research_unit} · {r.status} · {r.start_year}{r.end_year ? `–${r.end_year}` : ''}
                </p>
              ) : null;
            })()}
          </div>
        </div>

        {/* ── 4. Geographic Scope ── */}
        <div>
          {lbl(lang === 'vi' ? 'Phạm vi địa lý' : 'Geographic Scope', true)}
          <input
            type="text"
            value={form.scope}
            onChange={(e) => set('scope', e.target.value)}
            placeholder={lang === 'vi' ? 'Vd: HCMC District 7, Hue Heritage Area...' : 'e.g. HCMC District 7, Hue Heritage Area...'}
            className={`w-full border px-3 py-2 text-xs rounded-none focus:outline-none transition-colors ${errCls('scope')}`}
          />
          {errors.scope && <p className="text-[10px] text-red-500 mt-0.5">{lang === 'vi' ? 'Bắt buộc nhập.' : 'Required.'}</p>}
        </div>

        {/* ── 5. Note for reviewer ── */}
        <div>
          {lbl(lang === 'vi' ? 'Ghi chú cho người kiểm duyệt' : 'Note for Reviewer', false)}
          <textarea
            value={form.description}
            onChange={(e) => set('description', e.target.value)}
            rows={3}
            placeholder={lang === 'vi'
              ? 'Bối cảnh thu thập, hạn chế kỹ thuật, trạng thái dữ liệu...'
              : 'Collection context, technical limitations, data status...'}
            className="w-full border border-neutral-200 px-3 py-2 text-xs rounded-none focus:outline-none focus:border-[#8b0000] transition-colors resize-none font-ibm"
          />
        </div>

        {/* ── Privacy notice ── */}
        <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 px-3 py-2.5 text-[11px] text-amber-800 select-none">
          <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5 text-amber-500" />
          <span>
            {lang === 'vi'
              ? 'CRS sẽ được hệ thống ETL xác định tự động. Privacy Level sẽ do Data Steward chỉ định trong quá trình kiểm duyệt.'
              : 'CRS will be auto-detected by the ETL pipeline. Privacy level is assigned by the Data Steward during review.'}
          </span>
        </div>

        {/* ── Submit ── */}
        <div className="flex items-center justify-between pt-2 border-t border-neutral-100">
          <p className="text-[10px] text-neutral-400 italic">
            {lang === 'vi'
              ? '* Tệp sẽ được quét virus trước, sau đó vào hàng chờ "In-Pipeline" để Data Steward kiểm duyệt.'
              : '* File is virus-scanned first, then enters the In-Pipeline queue awaiting steward review.'}
          </p>
          <button
            type="submit"
            className="flex items-center gap-2 bg-neutral-900 hover:bg-[#8b0000] text-white px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            {lang === 'vi' ? 'Nộp tài sản' : 'Submit Asset'}
          </button>
        </div>

      </form>
    </div>
  );
}

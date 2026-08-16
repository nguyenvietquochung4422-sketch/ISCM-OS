import { useEffect, useMemo, useState } from 'react';
import { Search, Plus, X } from 'lucide-react';
import { ISCM_MEMBERS } from '../../data/iscmMembers.js';
import { fetchResearchRows } from '../../data/researchListStore.js';
import { researchList as fallbackResearchRows } from '../../data/researchList.js';
import { useAuth } from '../../auth/AuthContext.jsx';
import {
  DATA_TYPES, FILE_FORMATS, GROUPS, STORAGE_TYPES, SIZE_BUCKETS, ACCESS_LEVELS, SENSITIVITY_OPTIONS,
  LIFECYCLE_OPTIONS, AVAILABILITY_OPTIONS, DATA_CONDITION_OPTIONS,
  createDataset,
} from '../../data/datasetsStore.js';

const TASK_TYPES = ['Research', 'Paper', 'Training', 'New initiative', 'Student research', 'Fund Raising', 'Project', 'Event'];

const EMPTY = {
  name: '', description: '', data_types: [], file_formats: [], lifecycle_status: '',
  lead_group: '', contributing_groups: [], contact_member_id: '', contact_name: '',
  relatedMode: 'none', // 'existing' | 'unregistered' | 'none'
  primary_task_id: '', other_task_ids: [],
  unregistered_activity_name: '', unregistered_activity_task_type: '',
  temporal_from: '', temporal_to: '', spatial_coverage: '',
  storage_locations: [{ storage_type: '', location: '', description: '' }],
  availability: '', approximate_size: '',
  access_level: '', contains_sensitive_data: 'Not sure', data_condition: '',
  notes: '',
};

const sectionLabel = 'text-[11px] font-black uppercase tracking-wider text-[#8b0000] border-b border-neutral-200 pb-1.5 mb-3';
const fieldLabel = 'block text-[10px] font-bold text-neutral-400 uppercase mb-1';
const inputClass = 'w-full border border-neutral-200 bg-white px-2.5 py-1.5 text-xs text-neutral-800 focus:border-[#8b0000] focus:outline-none rounded-none';
const hintClass = 'text-[10px] text-neutral-400 mt-1 leading-relaxed';

export default function RegisterDatasetForm({ lang, onSaved }) {
  const vi = lang === 'vi';
  const { user: authUser } = useAuth();
  const [form, setForm] = useState(EMPTY);
  const [taskRows, setTaskRows] = useState([]);
  const [taskQuery, setTaskQuery] = useState('');
  const [otherTaskQuery, setOtherTaskQuery] = useState('');
  const [saving, setSaving] = useState(null); // null | 'Draft' | 'Submitted'
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  useEffect(() => {
    fetchResearchRows().then((rows) => setTaskRows(rows || fallbackResearchRows));
  }, []);

  const set = (key) => (e) => setForm((p) => ({ ...p, [key]: e.target.value }));

  const toggleMulti = (key, value) => {
    setForm((p) => ({
      ...p,
      [key]: p[key].includes(value) ? p[key].filter((v) => v !== value) : [...p[key], value],
    }));
  };

  const primaryTask = form.primary_task_id
    ? taskRows.find((r) => String(r.id) === String(form.primary_task_id))
    : null;

  const filteredTasks = useMemo(() => {
    const q = taskQuery.trim().toLowerCase();
    const list = q ? taskRows.filter((r) => (r.task_name || '').toLowerCase().includes(q)) : taskRows;
    return list.slice(0, 30);
  }, [taskRows, taskQuery]);

  const otherFilteredTasks = useMemo(() => {
    const q = otherTaskQuery.trim().toLowerCase();
    return taskRows
      .filter((r) => String(r.id) !== String(form.primary_task_id) && !form.other_task_ids.includes(r.id))
      .filter((r) => !q || (r.task_name || '').toLowerCase().includes(q))
      .slice(0, 20);
  }, [taskRows, otherTaskQuery, form.primary_task_id, form.other_task_ids]);

  const onPickContact = (e) => {
    const id = e.target.value;
    const m = ISCM_MEMBERS.find((x) => x.id === id);
    setForm((p) => ({ ...p, contact_member_id: id, contact_name: m ? m.nameVi : '' }));
  };

  const setStorageRow = (idx, key, value) => {
    setForm((p) => ({
      ...p,
      storage_locations: p.storage_locations.map((row, i) => i === idx ? { ...row, [key]: value } : row),
    }));
  };
  const addStorageRow = () => setForm((p) => ({ ...p, storage_locations: [...p.storage_locations, { storage_type: '', location: '', description: '' }] }));
  const removeStorageRow = (idx) => setForm((p) => ({ ...p, storage_locations: p.storage_locations.filter((_, i) => i !== idx) }));

  const reset = () => setForm(EMPTY);

  const validate = (targetStatus) => {
    if (!form.name.trim()) return vi ? 'Cần nhập Tên bộ dữ liệu.' : 'Dataset Name is required.';
    if (targetStatus === 'Submitted') {
      if (!form.description.trim()) return vi ? 'Cần nhập Mô tả.' : 'Description is required.';
      if (form.data_types.length === 0) return vi ? 'Chọn ít nhất 1 Loại dữ liệu.' : 'Select at least one Data Type.';
      if (!form.lifecycle_status) return vi ? 'Cần chọn Dataset Lifecycle.' : 'Dataset Lifecycle is required.';
      if (!form.lead_group) return vi ? 'Cần chọn Lead Group.' : 'Lead Group is required.';
      if (!form.contact_name.trim()) return vi ? 'Cần chọn Contact Person.' : 'Contact Person is required.';
      if (form.storage_locations.every((s) => !s.storage_type)) return vi ? 'Cần ít nhất 1 Storage Location.' : 'At least one Storage Location is required.';
      if (!form.availability) return vi ? 'Cần chọn Data Availability.' : 'Data Availability is required.';
      if (!form.access_level) return vi ? 'Cần chọn Access Level.' : 'Access Level is required.';
    }
    return '';
  };

  const submit = async (targetStatus) => {
    const err = validate(targetStatus);
    if (err) { setError(err); setNotice(''); return; }
    setError('');
    setSaving(targetStatus);
    try {
      const payload = {
        name: form.name.trim(),
        description: form.description.trim(),
        data_types: form.data_types,
        file_formats: form.file_formats,
        lifecycle_status: form.lifecycle_status || null,
        lead_group: form.lead_group,
        contributing_groups: form.contributing_groups,
        contact_member_id: form.contact_member_id || null,
        contact_name: form.contact_name.trim(),
        primary_task_id: form.relatedMode === 'existing' && form.primary_task_id ? Number(form.primary_task_id) : null,
        other_task_ids: form.relatedMode === 'existing' ? form.other_task_ids : [],
        unregistered_activity_name: form.relatedMode === 'unregistered' ? form.unregistered_activity_name.trim() || null : null,
        unregistered_activity_task_type: form.relatedMode === 'unregistered' ? form.unregistered_activity_task_type || null : null,
        temporal_from: form.temporal_from.trim() || null,
        temporal_to: form.temporal_to.trim() || null,
        spatial_coverage: form.spatial_coverage.trim() || null,
        storage_locations: form.storage_locations.filter((s) => s.storage_type || s.location || s.description),
        availability: form.availability || null,
        approximate_size: form.approximate_size || null,
        access_level: form.access_level || 'Internal',
        contains_sensitive_data: form.contains_sensitive_data,
        data_condition: form.data_condition || null,
        status: targetStatus,
        notes: form.notes.trim() || null,
      };
      await createDataset(payload, authUser?.id);
      setNotice(targetStatus === 'Draft'
        ? (vi ? 'Đã lưu bản nháp.' : 'Draft saved.')
        : (vi ? 'Đã gửi đăng ký dữ liệu.' : 'Dataset registered.'));
      reset();
      onSaved?.();
    } catch (e) {
      setError(e.message || (vi ? 'Lưu thất bại.' : 'Save failed.'));
    } finally {
      setSaving(null);
    }
  };

  return (
    <div className="space-y-6 font-sans max-w-3xl">
      <div>
        <h2 className="font-barlow text-lg font-black uppercase tracking-wide text-neutral-900">
          {vi ? 'Đăng Ký Dữ Liệu' : 'Register Dataset'}
        </h2>
        <p className="text-xs text-neutral-500 mt-0.5">
          {vi
            ? 'Một dataset là một bộ dữ liệu có cùng nội dung và mục đích, có thể gồm nhiều file — không phải một file đơn lẻ.'
            : 'A dataset is a meaningful collection of related data, not necessarily a single file.'}
        </p>
        <p className="text-[10px] text-neutral-400 mt-1">
          {vi ? 'Ví dụ tốt: "Public Space Survey 2025" — Tránh: "survey_final_v2.xlsx"' : 'Good: "Public Space Survey 2025" — Avoid: "survey_final_v2.xlsx"'}
        </p>
      </div>

      {/* A. Basic Information */}
      <section>
        <div className={sectionLabel}>A. {vi ? 'Thông tin cơ bản' : 'Basic Information'}</div>
        <div className="space-y-3">
          <div>
            <label className={fieldLabel}>{vi ? 'Tên bộ dữ liệu *' : 'Dataset Name *'}</label>
            <input className={inputClass} value={form.name} onChange={set('name')} placeholder="Public Space Survey 2025" />
          </div>
          <div>
            <label className={fieldLabel}>{vi ? 'Mô tả *' : 'Description *'}</label>
            <textarea rows={2} className={inputClass} value={form.description} onChange={set('description')}
              placeholder={vi ? 'Mô tả ngắn gọn dữ liệu này chứa gì...' : 'Briefly describe what this dataset contains...'} />
          </div>
          <div>
            <label className={fieldLabel}>{vi ? 'Loại dữ liệu *' : 'Data Type *'}</label>
            <div className="grid grid-cols-3 gap-1.5">
              {DATA_TYPES.map((t) => (
                <label key={t} className="flex items-center gap-1.5 text-xs text-neutral-700">
                  <input type="checkbox" checked={form.data_types.includes(t)} onChange={() => toggleMulti('data_types', t)} className="accent-[#8b0000]" />
                  {t}
                </label>
              ))}
            </div>
          </div>
          <div>
            <label className={fieldLabel}>{vi ? 'Định dạng file' : 'File Format'}</label>
            <div className="grid grid-cols-4 gap-1.5">
              {FILE_FORMATS.map((f) => (
                <label key={f} className="flex items-center gap-1.5 text-xs text-neutral-700">
                  <input type="checkbox" checked={form.file_formats.includes(f)} onChange={() => toggleMulti('file_formats', f)} className="accent-[#8b0000]" />
                  {f}
                </label>
              ))}
            </div>
          </div>
          <div>
            <label className={fieldLabel}>{vi ? 'Vòng đời dữ liệu *' : 'Dataset Lifecycle *'}</label>
            <select className={inputClass} value={form.lifecycle_status} onChange={set('lifecycle_status')}>
              <option value="">{vi ? '— Chọn —' : '— Select —'}</option>
              {LIFECYCLE_OPTIONS.map((l) => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
        </div>
      </section>

      {/* B. Ownership */}
      <section>
        <div className={sectionLabel}>B. {vi ? 'Đơn vị / Người phụ trách' : 'Ownership'}</div>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={fieldLabel}>{vi ? 'Lead Group *' : 'Lead Group *'}</label>
              <select className={inputClass} value={form.lead_group} onChange={(e) => {
                const g = e.target.value;
                setForm((p) => ({ ...p, lead_group: g, contributing_groups: p.contributing_groups.filter((x) => x !== g) }));
              }}>
                <option value="">{vi ? '— Nhóm chịu trách nhiệm chính —' : '— Select one group —'}</option>
                {GROUPS.map((g) => <option key={g} value={g}>{g}</option>)}
              </select>
              <p className={hintClass}>{vi ? 'Nhóm chịu trách nhiệm chính.' : 'The group primarily responsible.'}</p>
            </div>
            <div>
              <label className={fieldLabel}>{vi ? 'Contact Person *' : 'Contact Person *'}</label>
              <select className={inputClass} value={form.contact_member_id} onChange={onPickContact}>
                <option value="">{vi ? '— Chọn thành viên —' : '— Select Member —'}</option>
                {ISCM_MEMBERS.map((m) => <option key={m.id} value={m.id}>{m.nameVi}</option>)}
              </select>
              <p className={hintClass}>{vi ? 'Người liên hệ trực tiếp về dữ liệu này.' : 'Direct point of contact for this dataset.'}</p>
            </div>
          </div>
          <div>
            <label className={fieldLabel}>{vi ? 'Contributing Groups (không bắt buộc)' : 'Contributing Groups (optional)'}</label>
            <div className="flex flex-wrap gap-3">
              {GROUPS.filter((g) => g !== form.lead_group).map((g) => (
                <label key={g} className="flex items-center gap-1.5 text-xs text-neutral-700">
                  <input type="checkbox" checked={form.contributing_groups.includes(g)} onChange={() => toggleMulti('contributing_groups', g)} className="accent-[#8b0000]" />
                  {g}
                </label>
              ))}
            </div>
            <p className={hintClass}>{vi ? 'Các nhóm khác cùng tham gia tạo/khai thác dữ liệu này.' : 'Other groups that co-produced or co-use this dataset.'}</p>
          </div>
        </div>
      </section>

      {/* C. Related Activity */}
      <section>
        <div className={sectionLabel}>C. {vi ? 'Hoạt động liên quan' : 'Related Activity'}</div>
        <div className="flex flex-wrap gap-4 mb-3">
          {[
            ['existing', vi ? 'Chọn hoạt động có sẵn' : 'Select existing activity'],
            ['unregistered', vi ? 'Hoạt động chưa được đăng ký' : 'Activity is not registered yet'],
            ['none', vi ? 'Không liên quan hoạt động nào' : 'Not related to an activity'],
          ].map(([val, label]) => (
            <label key={val} className="flex items-center gap-1.5 text-xs text-neutral-700">
              <input type="radio" name="relatedMode" checked={form.relatedMode === val} onChange={() => setForm((p) => ({ ...p, relatedMode: val }))} className="accent-[#8b0000]" />
              {label}
            </label>
          ))}
        </div>

        {form.relatedMode === 'existing' && (
          <div className="space-y-3">
            <div>
              <label className={fieldLabel}>{vi ? 'Hoạt động chính (Primary)' : 'Primary Activity'}</label>
              {primaryTask ? (
                <div className="flex items-center justify-between border border-neutral-200 bg-neutral-50 px-2.5 py-1.5 text-xs">
                  <div>
                    <span className="font-semibold text-neutral-800">{primaryTask.task_name}</span>
                    {primaryTask.task_type && <span className="ml-2 text-[10px] text-neutral-400">Task Type: {primaryTask.task_type}</span>}
                  </div>
                  <button type="button" onClick={() => setForm((p) => ({ ...p, primary_task_id: '' }))} className="text-neutral-400 hover:text-[#8b0000] text-[10px] font-bold uppercase">
                    {vi ? 'Bỏ chọn' : 'Clear'}
                  </button>
                </div>
              ) : (
                <div className="border border-neutral-200">
                  <div className="relative p-1.5 border-b border-neutral-100">
                    <Search className="pointer-events-none absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-400" />
                    <input
                      type="text" value={taskQuery} onChange={(e) => setTaskQuery(e.target.value)}
                      placeholder={vi ? 'Tìm tác vụ/hoạt động...' : 'Search existing task/activity...'}
                      className="w-full border border-neutral-200 bg-white py-1.5 pl-8 pr-2.5 text-xs focus:border-[#8b0000] focus:outline-none"
                    />
                  </div>
                  <div className="max-h-36 overflow-y-auto divide-y divide-neutral-100">
                    {filteredTasks.map((r) => (
                      <button key={r.id} type="button" onClick={() => setForm((p) => ({ ...p, primary_task_id: r.id }))}
                        className="w-full text-left px-2.5 py-1.5 text-xs text-neutral-700 hover:bg-neutral-50">
                        {r.task_name} <span className="text-neutral-400">· {r.research_unit}</span>
                      </button>
                    ))}
                    {filteredTasks.length === 0 && <div className="px-2.5 py-3 text-center text-[11px] text-neutral-400">{vi ? 'Không tìm thấy.' : 'No matches.'}</div>}
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className={fieldLabel}>{vi ? 'Hoạt động liên quan khác (không bắt buộc)' : 'Other Related Activities (optional)'}</label>
              <div className="flex flex-wrap gap-1.5 mb-1.5">
                {form.other_task_ids.map((id) => {
                  const t = taskRows.find((r) => r.id === id);
                  return (
                    <span key={id} className="inline-flex items-center gap-1 border border-neutral-200 bg-neutral-50 px-2 py-0.5 text-[10px] text-neutral-700">
                      {t?.task_name || id}
                      <button type="button" onClick={() => setForm((p) => ({ ...p, other_task_ids: p.other_task_ids.filter((x) => x !== id) }))} className="text-neutral-400 hover:text-[#8b0000]">
                        <X className="h-2.5 w-2.5" />
                      </button>
                    </span>
                  );
                })}
              </div>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-400" />
                <input
                  type="text" value={otherTaskQuery} onChange={(e) => setOtherTaskQuery(e.target.value)}
                  placeholder={vi ? 'Tìm và thêm hoạt động khác...' : 'Search and add more activities...'}
                  className="w-full border border-neutral-200 bg-white py-1.5 pl-8 pr-2.5 text-xs focus:border-[#8b0000] focus:outline-none"
                />
              </div>
              {otherTaskQuery && (
                <div className="border border-t-0 border-neutral-200 max-h-32 overflow-y-auto divide-y divide-neutral-100">
                  {otherFilteredTasks.map((r) => (
                    <button key={r.id} type="button"
                      onClick={() => { setForm((p) => ({ ...p, other_task_ids: [...p.other_task_ids, r.id] })); setOtherTaskQuery(''); }}
                      className="w-full text-left px-2.5 py-1.5 text-xs text-neutral-700 hover:bg-neutral-50">
                      {r.task_name} <span className="text-neutral-400">· {r.research_unit}</span>
                    </button>
                  ))}
                  {otherFilteredTasks.length === 0 && <div className="px-2.5 py-2 text-center text-[11px] text-neutral-400">{vi ? 'Không tìm thấy.' : 'No matches.'}</div>}
                </div>
              )}
            </div>
          </div>
        )}

        {form.relatedMode === 'unregistered' && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={fieldLabel}>{vi ? 'Tên hoạt động' : 'Activity name'}</label>
              <input className={inputClass} value={form.unregistered_activity_name} onChange={set('unregistered_activity_name')} />
            </div>
            <div>
              <label className={fieldLabel}>{vi ? 'Loại tác vụ' : 'Task type'}</label>
              <select className={inputClass} value={form.unregistered_activity_task_type} onChange={set('unregistered_activity_task_type')}>
                <option value="">{vi ? '— Chọn —' : '— Select —'}</option>
                {TASK_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <p className="col-span-2 text-[10px] text-neutral-400">
              {vi ? 'Thông tin này chỉ lưu tạm để admin kiểm tra, hệ thống không tự tạo tác vụ mới.' : 'Saved for admin review only — this does not automatically create a new task.'}
            </p>
          </div>
        )}
      </section>

      {/* D. Data Information */}
      <section>
        <div className={sectionLabel}>D. {vi ? 'Thông tin dữ liệu' : 'Data Information'}</div>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={fieldLabel}>{vi ? 'Thời gian: Từ' : 'Time Coverage: From'}</label>
              <input className={inputClass} value={form.temporal_from} onChange={set('temporal_from')} placeholder="2024" />
            </div>
            <div>
              <label className={fieldLabel}>{vi ? 'Đến' : 'To'}</label>
              <input className={inputClass} value={form.temporal_to} onChange={set('temporal_to')} placeholder="2025" />
            </div>
          </div>
          <div>
            <label className={fieldLabel}>{vi ? 'Phạm vi không gian' : 'Spatial Coverage'}</label>
            <input className={inputClass} value={form.spatial_coverage} onChange={set('spatial_coverage')} placeholder="Ho Chi Minh City, Vietnam" />
          </div>
        </div>
      </section>

      {/* E. Storage */}
      <section>
        <div className={sectionLabel}>E. {vi ? 'Lưu trữ' : 'Storage'}</div>
        <div className="space-y-3">
          <div>
            <label className={fieldLabel}>{vi ? 'Vị trí lưu trữ *' : 'Storage Locations *'}</label>
            <div className="space-y-2">
              {form.storage_locations.map((row, idx) => (
                <div key={idx} className="border border-neutral-200 p-2.5 space-y-1.5 bg-neutral-50/50">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-neutral-400 uppercase">{vi ? `Vị trí ${idx + 1}` : `Location ${idx + 1}`}</span>
                    {form.storage_locations.length > 1 && (
                      <button type="button" onClick={() => removeStorageRow(idx)} className="text-neutral-400 hover:text-[#8b0000]"><X className="h-3.5 w-3.5" /></button>
                    )}
                  </div>
                  <select className={inputClass} value={row.storage_type} onChange={(e) => setStorageRow(idx, 'storage_type', e.target.value)}>
                    <option value="">{vi ? '— Loại lưu trữ —' : '— Storage Type —'}</option>
                    {STORAGE_TYPES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <input className={inputClass} value={row.location} onChange={(e) => setStorageRow(idx, 'location', e.target.value)}
                    placeholder={vi ? 'Đường dẫn/vị trí — vd: https://drive.google.com/... hoặc "Personal computer – liên hệ chủ dữ liệu"' : 'Link/location — e.g. https://drive.google.com/... or "Personal computer – contact data owner"'} />
                  <input className={inputClass} value={row.description} onChange={(e) => setStorageRow(idx, 'description', e.target.value)}
                    placeholder={vi ? 'Ghi chú ngắn (vd: bản đã làm sạch, ảnh gốc...)' : 'Short note (e.g. cleaned files, original photos...)'} />
                </div>
              ))}
            </div>
            <button type="button" onClick={addStorageRow} className="mt-1.5 inline-flex items-center gap-1 text-[10px] font-bold uppercase text-[#8b0000] hover:underline">
              <Plus className="h-3 w-3" /> {vi ? 'Thêm vị trí khác' : 'Add another location'}
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={fieldLabel}>{vi ? 'Tình trạng truy cập *' : 'Data Availability *'}</label>
              <select className={inputClass} value={form.availability} onChange={set('availability')}>
                <option value="">{vi ? '— Chọn —' : '— Select —'}</option>
                {AVAILABILITY_OPTIONS.map((a) => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
            <div>
              <label className={fieldLabel}>{vi ? 'Dung lượng ước tính' : 'Approximate Size'}</label>
              <select className={inputClass} value={form.approximate_size} onChange={set('approximate_size')}>
                <option value="">{vi ? '— Chọn —' : '— Select —'}</option>
                {SIZE_BUCKETS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* F. Access & Status */}
      <section>
        <div className={sectionLabel}>F. {vi ? 'Truy cập & Trạng thái' : 'Access & Status'}</div>
        <div className="space-y-3">
          <div>
            <label className={fieldLabel}>{vi ? 'Mức truy cập *' : 'Access Level *'}</label>
            <div className="flex flex-wrap gap-4">
              {ACCESS_LEVELS.map((a) => (
                <label key={a} className="flex items-center gap-1.5 text-xs text-neutral-700" title={
                  a === 'Public' ? (vi ? 'Có thể công khai.' : 'Dataset may be publicly shared.')
                  : a === 'Internal' ? (vi ? 'Chỉ dùng trong ISCM.' : 'Available to authorized ISCM members.')
                  : (vi ? 'Cần được cấp quyền.' : 'Access requires approval from the owner.')
                }>
                  <input type="radio" name="access_level" checked={form.access_level === a} onChange={() => setForm((p) => ({ ...p, access_level: a }))} className="accent-[#8b0000]" />
                  {a}
                </label>
              ))}
            </div>
          </div>
          <div>
            <label className={fieldLabel}>{vi ? 'Có dữ liệu nhạy cảm / cá nhân?' : 'Sensitive / Personal Data?'}</label>
            <div className="flex flex-wrap gap-4">
              {SENSITIVITY_OPTIONS.map((s) => (
                <label key={s} className="flex items-center gap-1.5 text-xs text-neutral-700">
                  <input type="radio" name="sensitive" checked={form.contains_sensitive_data === s} onChange={() => setForm((p) => ({ ...p, contains_sensitive_data: s }))} className="accent-[#8b0000]" />
                  {s}
                </label>
              ))}
            </div>
          </div>
          <div>
            <label className={fieldLabel}>{vi ? 'Tình trạng dữ liệu hiện tại' : 'Current Data Condition'}</label>
            <select className={inputClass} value={form.data_condition} onChange={set('data_condition')}>
              <option value="">{vi ? '— Chọn —' : '— Select —'}</option>
              {DATA_CONDITION_OPTIONS.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
            <p className={hintClass}>{vi ? 'Tự đánh giá ban đầu, không phải điểm chất lượng chính thức.' : 'A first self-assessment, not a formal quality score.'}</p>
          </div>
          <div>
            <label className={fieldLabel}>{vi ? 'Ghi chú' : 'Notes'}</label>
            <textarea rows={2} className={inputClass} value={form.notes} onChange={set('notes')} placeholder={vi ? 'Thông tin bổ sung...' : 'Additional information...'} />
          </div>
        </div>
      </section>

      {error && <p className="text-[11px] font-semibold text-red-700 bg-red-50 border border-red-200 px-2.5 py-1.5">{error}</p>}
      {notice && <p className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1.5">{notice}</p>}

      <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-100">
        <button
          type="button" onClick={() => submit('Draft')} disabled={saving !== null}
          className="border border-neutral-300 text-neutral-600 hover:border-neutral-900 hover:text-neutral-900 disabled:opacity-60 text-[11px] font-bold uppercase px-4 py-2 transition-colors"
        >
          {saving === 'Draft' ? (vi ? 'Đang lưu...' : 'Saving...') : (vi ? 'Lưu nháp' : 'Save Draft')}
        </button>
        <button
          type="button" onClick={() => submit('Submitted')} disabled={saving !== null}
          className="bg-[#8b0000] hover:bg-[#6d0000] disabled:opacity-60 text-white text-[11px] font-bold uppercase px-5 py-2 transition-colors"
        >
          {saving === 'Submitted' ? (vi ? 'Đang gửi...' : 'Submitting...') : (vi ? 'Gửi đăng ký' : 'Submit')}
        </button>
      </div>
    </div>
  );
}

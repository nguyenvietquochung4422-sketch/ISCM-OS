import { useState } from 'react';
import { X, ExternalLink, ShieldCheck, AlertTriangle, Lock } from 'lucide-react';
import { updateDataset } from '../../data/datasetsStore.js';

const STATUS_STYLE = {
  Draft: 'bg-neutral-100 text-neutral-600 border-neutral-300',
  Submitted: 'bg-amber-50 text-amber-700 border-amber-300',
  Registered: 'bg-emerald-50 text-emerald-700 border-emerald-300',
  'Needs Update': 'bg-red-50 text-red-700 border-red-300',
};
const ACCESS_STYLE = {
  Public: 'bg-emerald-50 text-emerald-700 border-emerald-300',
  Internal: 'bg-blue-50 text-blue-700 border-blue-300',
  Restricted: 'bg-red-50 text-red-700 border-red-300',
};

function Row({ label, value }) {
  if (!value) return null;
  return (
    <div className="grid grid-cols-3 gap-2 py-1.5 text-xs">
      <span className="text-neutral-400 font-semibold uppercase text-[10px] col-span-1">{label}</span>
      <span className="col-span-2 text-neutral-800">{value}</span>
    </div>
  );
}

export default function DatasetDetailModal({ vi, dataset, taskLabel, otherTaskLabels, isAdmin, canSeeStorageLinks, onClose, onChanged }) {
  const [busy, setBusy] = useState(false);

  const setStatus = async (status) => {
    setBusy(true);
    try {
      await updateDataset(dataset.id, { status });
      onChanged();
    } catch (e) {
      window.alert(e.message || (vi ? 'Cập nhật thất bại.' : 'Update failed.'));
    } finally {
      setBusy(false);
    }
  };

  const storageLocations = dataset.storage_locations || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-xl max-h-[85vh] overflow-y-auto bg-white border border-neutral-200 shadow-xl font-sans"
      >
        <div className="flex items-start justify-between px-5 py-3.5 border-b border-neutral-100 bg-neutral-900 text-white">
          <div className="min-w-0 pr-3">
            <h2 className="font-barlow text-base font-black uppercase tracking-wide truncate">{dataset.name}</h2>
            <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
              {dataset.data_types.map((t) => (
                <span key={t} className="text-[9px] font-bold uppercase border border-white/30 text-white/80 px-1.5 py-0.2">{t}</span>
              ))}
              <span className={`text-[9px] font-bold uppercase border px-1.5 py-0.2 ${ACCESS_STYLE[dataset.access_level] || ''}`}>{dataset.access_level}</span>
              <span className={`text-[9px] font-bold uppercase border px-1.5 py-0.2 flex items-center gap-1 ${STATUS_STYLE[dataset.status] || ''}`}>
                {dataset.status === 'Registered' && <ShieldCheck className="h-2.5 w-2.5" />}
                {dataset.status === 'Needs Update' && <AlertTriangle className="h-2.5 w-2.5" />}
                {dataset.status}
              </span>
              {dataset.lifecycle_status && (
                <span className="text-[9px] font-bold uppercase border border-white/30 text-white/80 px-1.5 py-0.2">{dataset.lifecycle_status}</span>
              )}
            </div>
          </div>
          <button onClick={onClose} className="text-neutral-400 hover:text-white shrink-0"><X className="h-4 w-4" /></button>
        </div>

        <div className="p-5 space-y-5 text-neutral-800">
          {dataset.description && <p className="text-xs leading-relaxed text-neutral-600">{dataset.description}</p>}

          <div>
            <span className="block text-[10px] font-black uppercase tracking-wider text-[#8b0000] border-b border-neutral-100 pb-1 mb-1">
              {vi ? 'Thông tin cơ bản' : 'Basic Information'}
            </span>
            <Row label={vi ? 'Loại dữ liệu' : 'Data Type'} value={dataset.data_types.join(' / ')} />
            <Row label={vi ? 'Định dạng' : 'File Format'} value={dataset.file_formats.join(', ')} />
            <Row label={vi ? 'Vòng đời' : 'Lifecycle'} value={dataset.lifecycle_status} />
            <Row label={vi ? 'Thời gian' : 'Time Coverage'} value={[dataset.temporal_from, dataset.temporal_to].filter(Boolean).join(' – ')} />
            <Row label={vi ? 'Không gian' : 'Spatial Coverage'} value={dataset.spatial_coverage} />
          </div>

          <div>
            <span className="block text-[10px] font-black uppercase tracking-wider text-[#8b0000] border-b border-neutral-100 pb-1 mb-1">
              {vi ? 'Đơn vị / Người phụ trách' : 'Ownership'}
            </span>
            <Row label={vi ? 'Lead Group' : 'Lead Group'} value={dataset.lead_group} />
            <Row label={vi ? 'Contributing Groups' : 'Contributing Groups'} value={(dataset.contributing_groups || []).join(', ')} />
            <Row label={vi ? 'Contact Person' : 'Contact Person'} value={dataset.contact_name} />
          </div>

          {(taskLabel || (otherTaskLabels && otherTaskLabels.length > 0) || dataset.unregistered_activity_name) && (
            <div>
              <span className="block text-[10px] font-black uppercase tracking-wider text-[#8b0000] border-b border-neutral-100 pb-1 mb-1">
                {vi ? 'Hoạt động liên quan' : 'Related Activity'}
              </span>
              {taskLabel && (
                <div className="mb-1">
                  <p className="text-xs font-semibold text-neutral-800">{taskLabel.task_name}</p>
                  {taskLabel.task_type && <p className="text-[10px] text-neutral-400">Task Type: {taskLabel.task_type}</p>}
                </div>
              )}
              {otherTaskLabels && otherTaskLabels.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1">
                  {otherTaskLabels.map((t) => (
                    <span key={t.id} className="text-[10px] border border-neutral-200 bg-neutral-50 px-1.5 py-0.5 text-neutral-600">{t.task_name}</span>
                  ))}
                </div>
              )}
              {dataset.unregistered_activity_name && (
                <p className="text-xs text-neutral-600 italic">
                  {vi ? 'Hoạt động chưa đăng ký: ' : 'Not yet registered: '}
                  {dataset.unregistered_activity_name}
                  {dataset.unregistered_activity_task_type && ` (${dataset.unregistered_activity_task_type})`}
                </p>
              )}
            </div>
          )}

          <div>
            <span className="block text-[10px] font-black uppercase tracking-wider text-[#8b0000] border-b border-neutral-100 pb-1 mb-1">
              {vi ? 'Lưu trữ' : 'Storage'}
            </span>
            {storageLocations.length === 0 && <p className="text-xs text-neutral-400 italic">{vi ? 'Chưa có thông tin.' : 'No storage info.'}</p>}
            {storageLocations.map((s, i) => (
              <div key={i} className="py-1.5 border-b border-neutral-50 last:border-none">
                <Row label={vi ? 'Nơi lưu' : 'Storage'} value={s.storage_type} />
                {canSeeStorageLinks ? (
                  <>
                    {s.location && (
                      s.location.startsWith('http') ? (
                        <a href={s.location} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs font-semibold text-blue-700 hover:underline mt-0.5">
                          {vi ? 'Mở vị trí dữ liệu' : 'Open Data Location'} <ExternalLink className="h-3 w-3" />
                        </a>
                      ) : <Row label={vi ? 'Vị trí' : 'Location'} value={s.location} />
                    )}
                    {s.description && <Row label={vi ? 'Ghi chú' : 'Note'} value={s.description} />}
                  </>
                ) : (
                  <p className="flex items-center gap-1 text-[10px] text-neutral-400 italic mt-0.5">
                    <Lock className="h-3 w-3" /> {vi ? 'Vị trí/đường dẫn chỉ hiện cho admin, người phụ trách hoặc người được cấp quyền.' : 'Location/link only visible to admin, the contact person, or an approved viewer.'}
                  </p>
                )}
              </div>
            ))}
            <Row label={vi ? 'Tình trạng truy cập' : 'Availability'} value={dataset.availability} />
            <Row label={vi ? 'Dung lượng' : 'Approximate Size'} value={dataset.approximate_size} />
          </div>

          <div>
            <span className="block text-[10px] font-black uppercase tracking-wider text-[#8b0000] border-b border-neutral-100 pb-1 mb-1">
              {vi ? 'Truy cập' : 'Access'}
            </span>
            <Row label={vi ? 'Mức truy cập' : 'Access Level'} value={dataset.access_level} />
            <Row label={vi ? 'Dữ liệu nhạy cảm' : 'Sensitive Data'} value={dataset.contains_sensitive_data} />
            <Row label={vi ? 'Tình trạng dữ liệu' : 'Data Condition'} value={dataset.data_condition} />
          </div>

          {dataset.notes && (
            <div>
              <span className="block text-[10px] font-black uppercase tracking-wider text-[#8b0000] border-b border-neutral-100 pb-1 mb-1">
                {vi ? 'Ghi chú' : 'Notes'}
              </span>
              <p className="text-xs text-neutral-600">{dataset.notes}</p>
            </div>
          )}
        </div>

        {isAdmin && (
          <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-neutral-100 bg-neutral-50">
            <button disabled={busy} onClick={() => setStatus('Needs Update')} className="flex items-center gap-1.5 border border-neutral-300 hover:border-[#8b0000] hover:text-[#8b0000] disabled:opacity-50 text-neutral-600 text-[10px] font-bold uppercase px-3 py-1.5">
              <AlertTriangle className="h-3.5 w-3.5" /> {vi ? 'Cần cập nhật' : 'Needs Update'}
            </button>
            <button disabled={busy} onClick={() => setStatus('Registered')} className="flex items-center gap-1.5 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-60 text-white text-[10px] font-bold uppercase px-3 py-1.5">
              <ShieldCheck className="h-3.5 w-3.5" /> {vi ? 'Đăng ký' : 'Register'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

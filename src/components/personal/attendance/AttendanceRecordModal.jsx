import { useState } from 'react';
import { X, Check, Ban } from 'lucide-react';
import { decideAttendanceRecord, cancelAttendanceRecord, isCancellable } from '../../../data/attendanceStore.js';

const STATUS_STYLE = {
  Draft: 'bg-neutral-100 text-neutral-600 border-neutral-300',
  Pending: 'bg-amber-50 text-amber-700 border-amber-300',
  Approved: 'bg-emerald-50 text-emerald-700 border-emerald-300',
  Rejected: 'bg-red-50 text-red-700 border-red-300',
  Cancelled: 'bg-neutral-100 text-neutral-400 border-neutral-300',
  'No Permission': 'bg-red-50 text-red-700 border-red-300',
};

function fmtDate(d) {
  if (!d) return '';
  return new Date(d).toLocaleDateString('vi-VN');
}

function Row({ label, value }) {
  if (!value) return null;
  return (
    <div className="grid grid-cols-3 gap-2 py-1 text-xs">
      <span className="text-neutral-400 font-semibold uppercase text-[10px]">{label}</span>
      <span className="col-span-2 text-neutral-800">{value}</span>
    </div>
  );
}

/** Shared detail view for one attendance record — used by both the member's
    own calendar (no admin actions) and the institute-wide admin views
    (approve/reject/cancel shown when `isAdmin`). */
export default function AttendanceRecordModal({ vi, record, memberLabel, isAdmin, viewerId, canCancel, onClose, onChanged }) {
  const [busy, setBusy] = useState(false);
  const [comment, setComment] = useState('');
  const [cancelling, setCancelling] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  const wasApproved = record.approval_status === 'Approved';

  const decide = async (status) => {
    setBusy(true);
    try {
      await decideAttendanceRecord(record, status, viewerId, comment);
      onChanged();
    } catch (err) {
      window.alert(err.message || (vi ? 'Cập nhật thất bại.' : 'Update failed.'));
      onChanged(); // refresh so the UI reflects whatever the other admin actually set
    } finally {
      setBusy(false);
    }
  };

  const confirmCancel = async () => {
    if (wasApproved && !cancelReason.trim()) return; // required once a plan was already approved
    setBusy(true);
    try {
      await cancelAttendanceRecord(record, viewerId, cancelReason.trim() || null);
      onChanged();
    } finally {
      setBusy(false);
    }
  };

  const dateLabel = record.end_date && record.end_date !== record.attendance_date
    ? `${fmtDate(record.attendance_date)} – ${fmtDate(record.end_date)}`
    : fmtDate(record.attendance_date);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-md bg-white border border-neutral-200 shadow-xl font-sans">
        <div className="flex items-start justify-between px-4 py-3 border-b border-neutral-100 bg-neutral-900 text-white">
          <div>
            <h2 className="font-barlow text-sm font-black uppercase tracking-wide">{record.attendance_type}</h2>
            <p className="text-[10px] text-white/60 mt-0.5">{dateLabel} · {record.duration_type}</p>
          </div>
          <button onClick={onClose} className="text-neutral-400 hover:text-white shrink-0"><X className="h-4 w-4" /></button>
        </div>

        <div className="p-4 space-y-1">
          {memberLabel && <Row label={vi ? 'Thành viên' : 'Member'} value={memberLabel} />}
          <Row label={vi ? 'Lý do' : 'Reason'} value={record.reason} />
          <Row label={vi ? 'Địa điểm' : 'Location'} value={record.location} />
          <Row label={vi ? 'Loại công tác' : 'Category'} value={record.outside_category} />
          <Row label={vi ? 'Giờ dự kiến đến' : 'Expected Arrival'} value={record.expected_arrival} />
          {record.duration_type === 'Custom Time' && (
            <Row label={vi ? 'Giờ' : 'Time'} value={[record.start_time, record.end_time].filter(Boolean).join(' – ')} />
          )}
          <div className="flex items-center gap-2 py-1.5">
            <span className="text-neutral-400 font-semibold uppercase text-[10px]">{vi ? 'Phê duyệt' : 'Approval'}</span>
            <span className={`text-[10px] font-bold uppercase border px-1.5 py-0.2 ${STATUS_STYLE[record.approval_status] || ''}`}>{record.approval_status}</span>
          </div>
          {record.approval_comment && <Row label={vi ? 'Ghi chú duyệt' : 'Approval Comment'} value={record.approval_comment} />}
          {record.approval_status === 'Cancelled' && (
            <>
              {record.previous_status && <Row label={vi ? 'Trạng thái trước khi huỷ' : 'Status Before Cancel'} value={record.previous_status} />}
              {record.cancellation_reason && <Row label={vi ? 'Lý do huỷ' : 'Cancellation Reason'} value={record.cancellation_reason} />}
            </>
          )}
        </div>

        {isAdmin && record.approval_status === 'Pending' && (
          <div className="px-4 pb-3 space-y-2">
            <input
              value={comment} onChange={(e) => setComment(e.target.value)}
              placeholder={vi ? 'Ghi chú duyệt (không bắt buộc)' : 'Approval comment (optional)'}
              className="w-full border border-neutral-200 bg-white px-2.5 py-1.5 text-xs focus:border-[#8b0000] focus:outline-none"
            />
            <div className="flex gap-2">
              <button disabled={busy} onClick={() => decide('Approved')} className="flex-1 flex items-center justify-center gap-1.5 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-60 text-white text-[10px] font-bold uppercase px-3 py-1.5">
                <Check className="h-3.5 w-3.5" /> {vi ? 'Duyệt' : 'Approve'}
              </button>
              <button disabled={busy} onClick={() => decide('Rejected')} className="flex-1 flex items-center justify-center gap-1.5 border border-neutral-300 hover:border-red-400 hover:text-red-700 disabled:opacity-50 text-neutral-600 text-[10px] font-bold uppercase px-3 py-1.5">
                <X className="h-3.5 w-3.5" /> {vi ? 'Từ chối' : 'Reject'}
              </button>
            </div>
          </div>
        )}

        {canCancel && isCancellable(record) && (
          <div className="px-4 pb-4">
            {!cancelling ? (
              <button disabled={busy} onClick={() => setCancelling(true)} className="w-full flex items-center justify-center gap-1.5 border border-neutral-300 hover:border-[#8b0000] hover:text-[#8b0000] disabled:opacity-50 text-neutral-600 text-[10px] font-bold uppercase px-3 py-1.5">
                <Ban className="h-3.5 w-3.5" /> {vi ? 'Huỷ yêu cầu' : 'Cancel Request'}
              </button>
            ) : (
              <div className="space-y-1.5 border border-neutral-200 bg-neutral-50 p-2.5">
                {wasApproved && (
                  <p className="text-[10px] text-amber-700 bg-amber-50 border border-amber-200 px-2 py-1">
                    {vi
                      ? 'Yêu cầu này đã được duyệt — huỷ nghĩa là thay đổi một kế hoạch đã chốt, không phải rút một yêu cầu đang chờ. Người đã duyệt sẽ được báo.'
                      : 'This was already approved — cancelling changes a confirmed plan, not just withdrawing a pending ask. The approver will be notified.'}
                  </p>
                )}
                <input
                  value={cancelReason} onChange={(e) => setCancelReason(e.target.value)}
                  placeholder={wasApproved
                    ? (vi ? 'Lý do huỷ (bắt buộc)' : 'Reason for cancelling (required)')
                    : (vi ? 'Lý do huỷ (không bắt buộc)' : 'Reason for cancelling (optional)')}
                  className="w-full border border-neutral-200 bg-white px-2.5 py-1.5 text-xs focus:border-[#8b0000] focus:outline-none"
                />
                <div className="flex gap-2">
                  <button disabled={busy} onClick={() => { setCancelling(false); setCancelReason(''); }} className="flex-1 text-[10px] font-bold uppercase text-neutral-500 hover:text-neutral-900 px-3 py-1.5">
                    {vi ? 'Đóng' : 'Back'}
                  </button>
                  <button
                    disabled={busy || (wasApproved && !cancelReason.trim())}
                    onClick={confirmCancel}
                    className="flex-1 flex items-center justify-center gap-1.5 bg-[#8b0000] hover:bg-[#6d0000] disabled:opacity-50 text-white text-[10px] font-bold uppercase px-3 py-1.5"
                  >
                    <Ban className="h-3.5 w-3.5" /> {vi ? 'Xác nhận huỷ' : 'Confirm Cancel'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

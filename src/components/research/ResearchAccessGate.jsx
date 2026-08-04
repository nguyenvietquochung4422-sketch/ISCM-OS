import { useEffect, useState } from 'react';
import { LockKeyhole, Send } from 'lucide-react';
import {
  fetchMyResearchAccess, requestResearchAccess, myRequestStatus,
} from '../../data/researchAccessStore.js';

/**
 * Wraps content that's gated behind Research Head approval — a Research
 * Unit's or task's Documents. Renders the children straight through when
 * the viewer already has implicit access (coordinator/member of the task,
 * Research Head, or top admin) or an approved grant; otherwise shows a
 * locked placeholder with a "Request Access" flow.
 */
export default function ResearchAccessGate({
  vi, userId, resourceType, resourceId, resourceLabel, hasImplicitAccess, children,
  // A task-level gate also honours a broader approved 'unit' grant covering
  // its Research Unit — pass the unit name so one approval unlocks every
  // task's documents in that unit instead of requiring one per task.
  unitResourceId,
}) {
  const [status, setStatus] = useState(hasImplicitAccess ? 'approved' : 'checking');
  const [showForm, setShowForm] = useState(false);
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);

  const reload = () => {
    if (hasImplicitAccess) { setStatus('approved'); return; }
    if (!userId) { setStatus('none'); return; }
    fetchMyResearchAccess(userId).then((rows) => {
      const own = myRequestStatus(rows, resourceType, resourceId);
      if (own === 'approved') { setStatus('approved'); return; }
      if (unitResourceId && myRequestStatus(rows, 'unit', unitResourceId) === 'approved') {
        setStatus('approved');
        return;
      }
      setStatus(own || 'none');
    });
  };
  useEffect(() => { reload(); }, [hasImplicitAccess, resourceType, resourceId, unitResourceId, userId]);

  if (status === 'approved') return children;

  if (status === 'checking') {
    return <div className="p-3 text-xs text-neutral-400">{vi ? 'Đang kiểm tra quyền truy cập...' : 'Checking access...'}</div>;
  }

  const submit = async () => {
    setBusy(true);
    try {
      await requestResearchAccess({ userId, resourceType, resourceId, resourceLabel, reason });
      setShowForm(false);
      setReason('');
      reload();
    } catch (err) {
      window.alert(err.message || (vi ? 'Gửi yêu cầu thất bại.' : 'Failed to send the request.'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="border border-neutral-200 bg-neutral-50 p-4 text-center space-y-2.5">
      <LockKeyhole className="h-5 w-5 mx-auto text-neutral-400" />
      <p className="text-xs text-neutral-500 leading-relaxed">
        {status === 'pending'
          ? (vi
              ? 'Yêu cầu truy cập đang chờ Trưởng bộ phận Nghiên cứu Khoa học duyệt.'
              : 'Your access request is pending Research Head approval.')
          : status === 'denied'
            ? (vi
                ? 'Yêu cầu truy cập trước đó đã bị từ chối. Bạn có thể gửi lại yêu cầu mới.'
                : 'A previous access request was denied. You can send a new one.')
            : (vi
                ? 'Nội dung này bị giới hạn truy cập — cần Trưởng bộ phận Nghiên cứu Khoa học duyệt trước khi xem.'
                : 'This content is access-restricted — the Research Head needs to approve before you can view it.')}
      </p>

      {status !== 'pending' && !showForm && (
        <button
          type="button"
          onClick={() => setShowForm(true)}
          className="inline-flex items-center gap-1.5 bg-[#8b0000] hover:bg-[#6d0000] text-white text-[10px] font-bold uppercase px-3 py-1.5"
        >
          {vi ? 'Yêu cầu quyền truy cập' : 'Request access'}
        </button>
      )}

      {showForm && (
        <div className="mx-auto max-w-xs space-y-1.5">
          <textarea
            rows={2}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder={vi ? 'Lý do cần truy cập (không bắt buộc)' : 'Why you need access (optional)'}
            className="w-full border border-neutral-200 bg-white px-2 py-1 text-xs text-neutral-800 focus:border-[#8b0000] focus:outline-none"
          />
          <div className="flex justify-center gap-1.5">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="text-[10px] font-bold uppercase text-neutral-500 hover:text-neutral-900 px-2 py-1"
            >
              {vi ? 'Huỷ' : 'Cancel'}
            </button>
            <button
              type="button"
              onClick={submit}
              disabled={busy}
              className="inline-flex items-center gap-1.5 bg-[#8b0000] hover:bg-[#6d0000] disabled:opacity-60 text-white text-[10px] font-bold uppercase px-3 py-1.5"
            >
              <Send className="h-3 w-3" />
              {busy ? (vi ? 'Đang gửi...' : 'Sending...') : (vi ? 'Gửi yêu cầu' : 'Send request')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

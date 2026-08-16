import { useEffect, useMemo, useState } from 'react';
import { Clock } from 'lucide-react';
import { fetchAuditLogsForRecordIds } from '../../../data/attendanceAuditStore.js';

function fmtDateTime(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

const ACTION_LABEL = {
  vi: { created: 'Gửi yêu cầu', approved: 'Đã duyệt', rejected: 'Đã từ chối', cancelled: 'Đã huỷ', corrected: 'Đã điều chỉnh', admin_updated: 'Admin cập nhật' },
  en: { created: 'Request submitted', approved: 'Approved', rejected: 'Rejected', cancelled: 'Cancelled', corrected: 'Corrected', admin_updated: 'Admin updated' },
};

/** One member's attendance-record history, built from the real,
    append-only attendance_audit_logs table (Phase 3B) — who did what and
    when, not just an approximation from the record's own timestamp
    columns. Records created before the audit log existed have no logged
    events; those fall back to the old timestamp-derived reconstruction so
    older history doesn't just disappear. */
export default function ApprovalTimeline({ vi, records }) {
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const recordIds = useMemo(() => records.map((r) => r.id), [records]);
  useEffect(() => {
    setLoading(true);
    fetchAuditLogsForRecordIds(recordIds).then((logs) => { setAuditLogs(logs); setLoading(false); });
  }, [recordIds.join(',')]);

  const recordById = useMemo(() => new Map(records.map((r) => [r.id, r])), [records]);
  const loggedRecordIds = useMemo(() => new Set(auditLogs.map((l) => l.entity_id)), [auditLogs]);

  const events = useMemo(() => {
    const fromAudit = auditLogs.map((l) => ({
      at: l.performed_at, kind: l.action, record: recordById.get(l.entity_id),
      performer: l.performer?.full_name || l.performer?.email,
      reason: l.reason, previousValues: l.previous_values, newValues: l.new_values, audited: true,
    })).filter((e) => e.record);

    // Legacy fallback: only for records with zero real audit rows (created
    // before this table existed).
    const legacy = [];
    records.forEach((r) => {
      if (loggedRecordIds.has(String(r.id))) return;
      legacy.push({ at: r.created_at, kind: 'created', record: r, audited: false });
      if (r.approved_at) legacy.push({ at: r.approved_at, kind: r.approval_status === 'Rejected' ? 'rejected' : 'approved', record: r, audited: false });
      if (r.cancelled_at) legacy.push({ at: r.cancelled_at, kind: 'cancelled', record: r, audited: false, reason: r.cancellation_reason });
    });

    return [...fromAudit, ...legacy].filter((e) => e.at).sort((a, b) => new Date(b.at) - new Date(a.at)).slice(0, 30);
  }, [auditLogs, records, loggedRecordIds]);

  if (loading) return <p className="text-[11px] text-neutral-400 italic p-2">{vi ? 'Đang tải...' : 'Loading...'}</p>;
  if (events.length === 0) {
    return <p className="text-[11px] text-neutral-400 italic p-2">{vi ? 'Chưa có hoạt động nào.' : 'No activity yet.'}</p>;
  }

  const describe = (e) => {
    const r = e.record;
    const label = `${r.attendance_type} (${r.attendance_date})`;
    const actionLabel = ACTION_LABEL[vi ? 'vi' : 'en'][e.kind] || e.kind;
    return `${actionLabel} — ${label}`;
  };

  return (
    <div className="space-y-2">
      <p className="flex items-center gap-1.5 font-ibm text-xs font-semibold text-iscm-charcoal">
        <Clock className="h-3.5 w-3.5 text-iscm-crimson" />
        {vi ? 'Dòng thời gian phê duyệt' : 'Approval Timeline'}
      </p>
      <ul className="space-y-1.5">
        {events.map((e, i) => (
          <li key={i} className="border-l-2 border-neutral-200 pl-2.5 py-0.5">
            <p className="text-[11px] text-neutral-700">{describe(e)}</p>
            <p className="text-[10px] text-neutral-400">
              {fmtDateTime(e.at)}{e.performer ? ` · ${e.performer}` : ''}
              {!e.audited && <span className="italic"> · {vi ? '(dựng từ mốc thời gian cũ)' : '(reconstructed, pre-audit-log)'}</span>}
            </p>
            {e.reason && <p className="text-[10px] text-neutral-500 italic">{vi ? 'Lý do' : 'Reason'}: {e.reason}</p>}
          </li>
        ))}
      </ul>
    </div>
  );
}

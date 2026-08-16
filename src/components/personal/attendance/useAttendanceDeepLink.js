import { useEffect, useState } from 'react';

/** Listens for the 'attendance:open-record' event a notification click
    dispatches (see NavBar.jsx handleOpenNotification) and resolves it
    against whatever record set the calling panel already has loaded.
    Handles the two timing/edge cases a click-to-deep-link flow has to:
    the event can arrive before `records` has finished loading (queued
    until `loading` goes false), and the record can turn out to be one
    this viewer can't see or that's gone — surfaced as `missingRecordId`
    so the caller can show a graceful message instead of nothing/a crash. */
export default function useAttendanceDeepLink(records, loading) {
  const [pendingId, setPendingId] = useState(null);
  const [focusedRecord, setFocusedRecord] = useState(null);
  const [missingRecordId, setMissingRecordId] = useState(null);

  useEffect(() => {
    const handler = (e) => {
      setMissingRecordId(null);
      setPendingId(e.detail?.recordId || null);
    };
    window.addEventListener('attendance:open-record', handler);
    return () => window.removeEventListener('attendance:open-record', handler);
  }, []);

  useEffect(() => {
    if (!pendingId || loading) return;
    const match = records.find((r) => String(r.id) === String(pendingId));
    if (match) setFocusedRecord(match);
    else setMissingRecordId(pendingId);
    setPendingId(null);
  }, [pendingId, loading, records]);

  const clear = () => { setFocusedRecord(null); setMissingRecordId(null); };
  return { focusedRecord, missingRecordId, clear };
}

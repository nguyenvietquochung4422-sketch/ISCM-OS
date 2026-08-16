import { useEffect, useMemo, useState } from 'react';
import { Plus, X, Check, Undo2, AlertTriangle, Ban, ChevronLeft } from 'lucide-react';
import { useAuth } from '../../auth/AuthContext.jsx';
import {
  EVENT_TYPES, canManageEvents, fetchEvents, createEvent, cancelEvent,
  fetchEventParticipants, checkInParticipant, undoCheckIn, getLeaveConflict,
} from '../../data/eventStore.js';
import { fetchAllAccounts, fetchAllAttendanceRecords } from '../../data/attendanceStore.js';

const inputClass = 'w-full rounded-none border border-neutral-300 bg-white px-2.5 py-1.5 font-ibm text-xs text-iscm-charcoal focus:border-iscm-crimson focus:outline-none';
const labelClass = 'block text-[10px] font-bold text-neutral-400 uppercase mb-1';

const EMPTY_FORM = { title: '', description: '', event_type: 'Meeting', event_date: '', start_time: '', end_time: '', location: '', mandatory: false };

/** Organizer/admin side of Event Attendance (Phase 3D) — gated by
    canManageEvents() (is_top_admin, or delegated via content_permissions
    for 'my-events', same convention as attendance-log). Create events,
    invite an audience (whole institute or hand-picked), then track
    RSVP + check-in per participant. Data-independent from the personal
    leave-type Attendance module — the only bridge is a read-time leave
    conflict check against attendance_records. */
export default function EventManagementPanel({ lang = 'vi' }) {
  const vi = lang === 'vi';
  const { user: authUser } = useAuth();
  const [canManage, setCanManage] = useState(false);
  const [checked, setChecked] = useState(false);
  const [events, setEvents] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [audienceMode, setAudienceMode] = useState('all'); // 'all' | 'pick'
  const [pickedIds, setPickedIds] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [participants, setParticipants] = useState([]);

  const reload = () => {
    setLoading(true);
    Promise.all([fetchEvents(), fetchAllAccounts(), fetchAllAttendanceRecords()]).then(([ev, acc, records]) => {
      setEvents(ev);
      setAccounts(acc);
      setAttendanceRecords(records);
      setLoading(false);
    });
  };

  useEffect(() => {
    canManageEvents().then((ok) => {
      setCanManage(ok);
      setChecked(true);
      if (ok) reload(); else setLoading(false);
    });
  }, []);

  const openEvent = (event) => {
    setSelectedEvent(event);
    fetchEventParticipants(event.id).then(setParticipants);
  };
  const closeEvent = () => { setSelectedEvent(null); setParticipants([]); };

  const submit = async () => {
    if (!form.title.trim() || !form.event_date) {
      setError(vi ? 'Cần nhập tiêu đề và ngày.' : 'Title and date are required.');
      return;
    }
    setError('');
    setSaving(true);
    try {
      const audience = audienceMode === 'all' ? accounts.map((a) => a.id) : pickedIds;
      await createEvent({
        title: form.title.trim(), description: form.description.trim() || null,
        event_type: form.event_type, event_date: form.event_date,
        start_time: form.start_time || null, end_time: form.end_time || null,
        location: form.location.trim() || null, mandatory: form.mandatory,
      }, authUser?.id, audience);
      setForm(EMPTY_FORM); setAudienceMode('all'); setPickedIds([]); setShowForm(false);
      reload();
    } catch (e) {
      setError(e.message || (vi ? 'Tạo sự kiện thất bại.' : 'Failed to create event.'));
    } finally {
      setSaving(false);
    }
  };

  const doCancelEvent = async (event) => {
    if (!window.confirm(vi ? `Huỷ sự kiện "${event.title}"? Mọi người tham gia sẽ được báo.` : `Cancel "${event.title}"? All participants will be notified.`)) return;
    await cancelEvent(event, authUser?.id);
    reload();
    if (selectedEvent?.id === event.id) closeEvent();
  };

  const doCheckIn = async (p) => { await checkInParticipant(p.id, authUser?.id); openEvent(selectedEvent); };
  const doUndoCheckIn = async (p) => { await undoCheckIn(p.id); openEvent(selectedEvent); };

  const sortedEvents = useMemo(() => [...events].sort((a, b) => b.event_date.localeCompare(a.event_date)), [events]);

  if (!checked) return <div className="font-sans text-xs text-neutral-400 p-4">{vi ? 'Đang kiểm tra quyền...' : 'Checking permissions...'}</div>;
  if (!canManage) {
    return (
      <div className="font-sans text-xs text-red-700 p-4 border border-red-200 bg-red-50">
        {vi
          ? 'Bạn không có quyền truy cập mục này. Chỉ Admin, Director, Vice Director, hoặc tài khoản được cấp quyền quản lý sự kiện mới xem được.'
          : 'You do not have access to this page. Only Admin, Director, Vice Director, or an account granted event-management rights can view this.'}
      </div>
    );
  }

  if (selectedEvent) {
    return (
      <div className="space-y-3 rounded-lg border border-gray-200 bg-white p-3.5 font-sans">
        <button onClick={closeEvent} className="flex items-center gap-1 text-[10px] font-bold uppercase text-neutral-500 hover:text-iscm-crimson">
          <ChevronLeft className="h-3.5 w-3.5" /> {vi ? 'Danh sách sự kiện' : 'Back to events'}
        </button>
        <div className="flex items-start justify-between">
          <div>
            <p className="font-barlow text-sm font-black uppercase text-neutral-900">{selectedEvent.title}</p>
            <p className="text-[10px] text-neutral-400 mt-0.5">
              {selectedEvent.event_date} · {selectedEvent.event_type}{selectedEvent.mandatory ? ` · ${vi ? 'Bắt buộc' : 'Mandatory'}` : ''}{selectedEvent.location ? ` · ${selectedEvent.location}` : ''}
            </p>
          </div>
          {selectedEvent.status === 'Scheduled' && (
            <button onClick={() => doCancelEvent(selectedEvent)} className="flex items-center gap-1 text-[10px] font-bold uppercase text-neutral-500 hover:text-red-700">
              <Ban className="h-3.5 w-3.5" /> {vi ? 'Huỷ sự kiện' : 'Cancel event'}
            </button>
          )}
          {selectedEvent.status === 'Cancelled' && (
            <span className="text-[10px] font-bold uppercase text-red-700 border border-red-200 bg-red-50 px-2 py-1">{vi ? 'Đã huỷ' : 'Cancelled'}</span>
          )}
        </div>

        <div className="border border-neutral-200 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-neutral-900 text-white font-barlow text-[9px] font-bold uppercase tracking-wider">
                <th className="px-2.5 py-2">{vi ? 'Thành viên' : 'Member'}</th>
                <th className="px-2.5 py-2">RSVP</th>
                <th className="px-2.5 py-2">{vi ? 'Điểm danh' : 'Check-in'}</th>
                <th className="px-2.5 py-2">{vi ? 'Xung đột' : 'Conflict'}</th>
                <th className="px-2.5 py-2" />
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {participants.map((p) => {
                const conflict = getLeaveConflict(attendanceRecords, p.member_id, selectedEvent.event_date);
                return (
                  <tr key={p.id} className="hover:bg-neutral-50/80">
                    <td className="px-2.5 py-2 font-semibold text-neutral-800">{p.member?.full_name || p.member?.email}</td>
                    <td className="px-2.5 py-2 text-neutral-600">{p.rsvp_status}</td>
                    <td className="px-2.5 py-2">
                      {p.checked_in ? <span className="text-emerald-700 font-bold text-[10px] uppercase">{vi ? 'Đã có mặt' : 'Checked in'}</span> : <span className="text-neutral-400 text-[10px]">{vi ? 'Chưa' : 'Not yet'}</span>}
                    </td>
                    <td className="px-2.5 py-2">
                      {conflict && (
                        <span className="flex items-center gap-1 text-amber-700 text-[10px] font-semibold" title={`${conflict.attendance_type} (${conflict.attendance_date})`}>
                          <AlertTriangle className="h-3 w-3" /> {conflict.attendance_type}
                        </span>
                      )}
                    </td>
                    <td className="px-2.5 py-2 text-right">
                      {p.checked_in ? (
                        <button onClick={() => doUndoCheckIn(p)} className="flex items-center gap-1 ml-auto text-[9px] font-bold uppercase text-neutral-400 hover:text-neutral-800"><Undo2 className="h-3 w-3" /> {vi ? 'Bỏ điểm danh' : 'Undo'}</button>
                      ) : (
                        <button onClick={() => doCheckIn(p)} className="flex items-center gap-1 ml-auto text-[9px] font-bold uppercase text-emerald-700 hover:text-emerald-900"><Check className="h-3 w-3" /> {vi ? 'Điểm danh' : 'Check in'}</button>
                      )}
                    </td>
                  </tr>
                );
              })}
              {participants.length === 0 && (
                <tr><td colSpan={5} className="px-3 py-6 text-center text-neutral-400 italic">{vi ? 'Chưa có ai được mời.' : 'No one invited yet.'}</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3 rounded-lg border border-gray-200 bg-white p-3.5 font-sans">
      <div className="flex items-center justify-between">
        <p className="font-ibm text-xs font-semibold text-iscm-charcoal">{vi ? 'Quản lý sự kiện' : 'Event Management'}</p>
        <button onClick={() => setShowForm((s) => !s)} className="flex items-center gap-1.5 border border-neutral-300 px-3 py-1.5 text-[10px] font-bold uppercase text-neutral-600 hover:border-iscm-crimson hover:text-iscm-crimson">
          {showForm ? <X className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />} {showForm ? (vi ? 'Đóng' : 'Close') : (vi ? 'Tạo sự kiện' : 'New Event')}
        </button>
      </div>

      {showForm && (
        <div className="space-y-3 border border-neutral-200 p-3">
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className={labelClass}>{vi ? 'Tiêu đề' : 'Title'}</label>
              <input value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>{vi ? 'Loại' : 'Type'}</label>
              <select value={form.event_type} onChange={(e) => setForm((p) => ({ ...p, event_type: e.target.value }))} className={inputClass}>
                {EVENT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2.5">
            <div>
              <label className={labelClass}>{vi ? 'Ngày' : 'Date'}</label>
              <input type="date" value={form.event_date} onChange={(e) => setForm((p) => ({ ...p, event_date: e.target.value }))} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>{vi ? 'Bắt đầu' : 'Start'}</label>
              <input type="time" value={form.start_time} onChange={(e) => setForm((p) => ({ ...p, start_time: e.target.value }))} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>{vi ? 'Kết thúc' : 'End'}</label>
              <input type="time" value={form.end_time} onChange={(e) => setForm((p) => ({ ...p, end_time: e.target.value }))} className={inputClass} />
            </div>
          </div>
          <div>
            <label className={labelClass}>{vi ? 'Địa điểm' : 'Location'}</label>
            <input value={form.location} onChange={(e) => setForm((p) => ({ ...p, location: e.target.value }))} className={inputClass} />
          </div>
          <label className="flex items-center gap-1.5 text-xs text-neutral-700">
            <input type="checkbox" checked={form.mandatory} onChange={(e) => setForm((p) => ({ ...p, mandatory: e.target.checked }))} />
            {vi ? 'Bắt buộc tham gia' : 'Mandatory attendance'}
          </label>

          <div>
            <label className={labelClass}>{vi ? 'Đối tượng mời' : 'Audience'}</label>
            <div className="flex border border-neutral-200 text-[10px] font-bold uppercase w-fit">
              <button onClick={() => setAudienceMode('all')} className={`px-2.5 py-1.5 ${audienceMode === 'all' ? 'bg-neutral-900 text-white' : 'text-neutral-600 hover:bg-neutral-50'}`}>{vi ? 'Toàn viện' : 'Whole institute'}</button>
              <button onClick={() => setAudienceMode('pick')} className={`px-2.5 py-1.5 ${audienceMode === 'pick' ? 'bg-neutral-900 text-white' : 'text-neutral-600 hover:bg-neutral-50'}`}>{vi ? 'Chọn người' : 'Pick people'}</button>
            </div>
            {audienceMode === 'pick' && (
              <div className="mt-1.5 max-h-32 overflow-y-auto border border-neutral-200 divide-y divide-neutral-100">
                {accounts.map((a) => (
                  <label key={a.id} className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-neutral-700 hover:bg-neutral-50">
                    <input type="checkbox" checked={pickedIds.includes(a.id)}
                      onChange={(e) => setPickedIds((p) => e.target.checked ? [...p, a.id] : p.filter((id) => id !== a.id))} />
                    {a.full_name || a.email}
                  </label>
                ))}
              </div>
            )}
          </div>

          {error && <p className="rounded-none border border-red-200 bg-red-50 px-2 py-1 font-ibm text-[10px] text-red-700">{error}</p>}
          <button disabled={saving} onClick={submit} className="px-3 py-1.5 text-[10px] font-bold uppercase text-white bg-iscm-crimson hover:bg-[#7a0010] disabled:bg-neutral-300">
            {saving ? (vi ? 'Đang tạo...' : 'Creating...') : (vi ? 'Tạo sự kiện' : 'Create Event')}
          </button>
        </div>
      )}

      {loading ? (
        <p className="font-ibm text-[11px] text-gray-400 p-2">{vi ? 'Đang tải...' : 'Loading...'}</p>
      ) : (
        <div className="border border-neutral-200 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-neutral-900 text-white font-barlow text-[9px] font-bold uppercase tracking-wider">
                <th className="px-2.5 py-2">{vi ? 'Ngày' : 'Date'}</th>
                <th className="px-2.5 py-2">{vi ? 'Tiêu đề' : 'Title'}</th>
                <th className="px-2.5 py-2">{vi ? 'Loại' : 'Type'}</th>
                <th className="px-2.5 py-2">{vi ? 'Trạng thái' : 'Status'}</th>
                <th className="px-2.5 py-2" />
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {sortedEvents.map((ev) => (
                <tr key={ev.id} className="hover:bg-neutral-50/80 cursor-pointer" onClick={() => openEvent(ev)}>
                  <td className="px-2.5 py-2 text-neutral-600 whitespace-nowrap">{ev.event_date}</td>
                  <td className="px-2.5 py-2 font-semibold text-neutral-800">{ev.title}{ev.mandatory && <span className="ml-1.5 text-[9px] font-bold uppercase text-iscm-crimson">{vi ? 'Bắt buộc' : 'Mandatory'}</span>}</td>
                  <td className="px-2.5 py-2 text-neutral-600">{ev.event_type}</td>
                  <td className="px-2.5 py-2">
                    <span className={`text-[9px] font-bold uppercase ${ev.status === 'Cancelled' ? 'text-red-700' : 'text-emerald-700'}`}>{ev.status}</span>
                  </td>
                  <td className="px-2.5 py-2 text-right text-[9px] font-bold uppercase text-neutral-400">{vi ? 'Xem →' : 'View →'}</td>
                </tr>
              ))}
              {sortedEvents.length === 0 && (
                <tr><td colSpan={5} className="px-3 py-8 text-center text-neutral-400 italic">{vi ? 'Chưa có sự kiện nào.' : 'No events yet.'}</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

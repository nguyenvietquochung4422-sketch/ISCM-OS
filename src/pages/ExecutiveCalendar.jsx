import { useState } from 'react';
import { Calendar as CalendarIcon, Clock, MapPin, Users, Plus, RefreshCw, AlertCircle } from 'lucide-react';

const INITIAL_EVENTS = [
  {
    id: 'e1',
    title: 'Họp giao ban điều hành Tuần - Ban Giám đốc',
    start_time: '2026-07-06T09:00',
    end_time: '2026-07-06T11:00',
    location: 'Phòng StudioLab A, Tầng 1, ISCM',
    attendees_emails: 'tuianh.trinh@ueh.edu.vn, lan.tran@ueh.edu.vn, minh.pham@ueh.edu.vn',
    sync_source: 'Google Calendar'
  },
  {
    id: 'e2',
    title: 'Ký kết hợp tác MOU với Grab Vietnam',
    start_time: '2026-07-07T14:30',
    end_time: '2026-07-07T15:30',
    location: 'Phòng Hội thảo CTD, 232 Nguyễn Thị Minh Khai',
    attendees_emails: 'tuianh.trinh@ueh.edu.vn, partner-relations@grab.com, my.dang@ueh.edu.vn',
    sync_source: 'Outlook Calendar'
  },
  {
    id: 'e3',
    title: 'Thẩm định Đề xuất dự án HCMC Walkability Atlas 2026',
    start_time: '2026-07-09T10:00',
    end_time: '2026-07-09T12:00',
    location: 'Meeting Room C, ISCM Hub',
    attendees_emails: 'tuianh.trinh@ueh.edu.vn, khoa.vo@ueh.edu.vn, thao.le@ueh.edu.vn',
    sync_source: 'Google Calendar'
  }
];

export default function ExecutiveCalendar() {
  const [events, setEvents] = useState(INITIAL_EVENTS);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState('Đồng bộ thành công cách đây 3 phút');

  // Form states
  const [title, setTitle] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [location, setLocation] = useState('');
  const [attendees, setAttendees] = useState('');
  const [formError, setFormError] = useState('');

  const triggerSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      setSyncStatus('Đồng bộ thành công vừa xong');
    }, 1200);
  };

  const handleAddEvent = (e) => {
    e.preventDefault();
    if (!title || !startTime || !endTime || !location || !attendees) {
      setFormError('Vui lòng nhập đầy đủ các trường thông tin bắt buộc.');
      return;
    }
    
    if (new Date(startTime) >= new Date(endTime)) {
      setFormError('Thời gian bắt đầu phải trước thời gian kết thúc.');
      return;
    }

    const newEvent = {
      id: Date.now().toString(),
      title,
      start_time: startTime,
      end_time: endTime,
      location,
      attendees_emails: attendees,
      sync_source: 'Google Calendar' // local scheduler simulates google calendar sync
    };

    setEvents([newEvent, ...events]);
    setTitle('');
    setStartTime('');
    setEndTime('');
    setLocation('');
    setAttendees('');
    setFormError('');
  };

  const formatDateTime = (isoString) => {
    const d = new Date(isoString);
    const dateStr = d.toLocaleDateString('vi-VN', { weekday: 'short', day: '2-digit', month: '2-digit' });
    const timeStr = d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false });
    return { dateStr, timeStr };
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3 border-l-4 border-iscm-crimson pl-4 py-1">
        <div>
          <h1 className="font-barlow text-3xl font-extrabold uppercase tracking-wider text-iscm-charcoal">
            My Executive Calendar
          </h1>
          <p className="font-ibm text-sm uppercase tracking-wider text-gray-500 mt-1">
            Agenda cá nhân Viện trưởng kết nối hạ tầng đồng bộ Google/Outlook Calendar.
          </p>
        </div>
        
        {/* Sync Controls */}
        <div className="flex items-center gap-3">
          <span className="font-ibm text-xs text-gray-500 bg-gray-100 px-3 py-1.5 rounded-lg border border-gray-200">
            {syncStatus}
          </span>
          <button
            onClick={triggerSync}
            disabled={isSyncing}
            className="flex items-center justify-center p-2 rounded-lg bg-iscm-cta hover:bg-iscm-charcoal text-white transition-colors"
            title="Đồng bộ ngay"
          >
            <RefreshCw className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </header>

      {/* Main Grid */}
      <div className="grid gap-6 lg:grid-cols-5">
        
        {/* Left Column: Agenda List (60% width equivalent) */}
        <section className="glass-card p-5 lg:col-span-3">
          <h2 className="mb-4 font-barlow text-xl font-bold text-iscm-charcoal border-l-2 border-iscm-crimson pl-2">
            Executive Agenda
          </h2>

          <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
            {events.map((evt) => {
              const start = formatDateTime(evt.start_time);
              const end = formatDateTime(evt.end_time);
              return (
                <div key={evt.id} className="border border-gray-100 bg-white/80 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
                  {/* Left line indicator */}
                  <span className="absolute left-0 top-0 bottom-0 w-1 bg-iscm-crimson" />
                  
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <h3 className="font-barlow text-base font-bold text-iscm-charcoal">{evt.title}</h3>
                    <span className="font-barlow-condensed text-xs uppercase bg-iscm-crimson/10 text-iscm-crimson px-1.5 py-0.5 rounded font-semibold shrink-0">
                      {evt.sync_source}
                    </span>
                  </div>

                  <div className="grid gap-2 sm:grid-cols-2 text-sm text-gray-600 font-ibm mt-3">
                    <div>
                      <span className="font-semibold text-gray-400 mr-1 text-xs uppercase">Time:</span>
                      <span className="font-barlow-condensed font-semibold">
                        {start.timeStr} - {end.timeStr} ({start.dateStr})
                      </span>
                    </div>

                    <div>
                      <span className="font-semibold text-gray-400 mr-1 text-xs uppercase">Location:</span>
                      <span className="truncate">{evt.location}</span>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <div className="text-[11px] text-gray-500 font-ibm break-all">
                      <span className="font-semibold text-gray-600 block mb-0.5">Attendees:</span>
                      {evt.attendees_emails}
                    </div>
                  </div>
                </div>
              );
            })}
            {events.length === 0 && (
              <div className="py-12 text-center text-gray-400 font-ibm text-sm">
                Không có sự kiện lịch họp nào được ghi nhận.
              </div>
            )}
          </div>
        </section>

        {/* Right Column: Schedule Form (40% width equivalent) */}
        <section className="glass-card p-5 lg:col-span-2">
          <h2 className="mb-2 font-barlow text-lg font-bold text-iscm-charcoal flex items-center gap-2">
            <Plus className="h-5 w-5 text-iscm-crimson" /> Schedule New Meeting
          </h2>
          <p className="mb-4 font-ibm text-xs text-gray-500">
            Lên lịch cuộc họp điều hành mới. Sự kiện sẽ tự động đồng bộ sang tài khoản Google/Outlook.
          </p>

          <form onSubmit={handleAddEvent} className="space-y-4">
            <label className="block">
              <span className="mb-1 block font-barlow-condensed text-[11px] font-bold uppercase tracking-wider text-gray-400">Tiêu đề cuộc họp *</span>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="VD: Họp báo cáo tiến độ tuần"
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 font-ibm text-xs focus:border-iscm-crimson focus:outline-none text-iscm-charcoal"
              />
            </label>

            <div className="grid gap-3 grid-cols-2">
              <label className="block">
                <span className="mb-1 block font-barlow-condensed text-[11px] font-bold uppercase tracking-wider text-gray-400">Bắt đầu *</span>
                <input
                  type="datetime-local"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 font-ibm text-xs focus:border-iscm-crimson focus:outline-none text-iscm-charcoal"
                />
              </label>

              <label className="block">
                <span className="mb-1 block font-barlow-condensed text-[11px] font-bold uppercase tracking-wider text-gray-400">Kết thúc *</span>
                <input
                  type="datetime-local"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 font-ibm text-xs focus:border-iscm-crimson focus:outline-none text-iscm-charcoal"
                />
              </label>
            </div>

            <label className="block">
              <span className="mb-1 block font-barlow-condensed text-[11px] font-bold uppercase tracking-wider text-gray-400">Địa điểm *</span>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="VD: Phòng họp số 3, Hub ISCM"
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 font-ibm text-xs focus:border-iscm-crimson focus:outline-none text-iscm-charcoal"
              />
            </label>

            <label className="block">
              <span className="mb-1 block font-barlow-condensed text-[11px] font-bold uppercase tracking-wider text-gray-400">Email người tham dự * (cách nhau bằng dấu phẩy)</span>
              <textarea
                value={attendees}
                onChange={(e) => setAttendees(e.target.value)}
                placeholder="email1@ueh.edu.vn, email2@ueh.edu.vn"
                rows="3"
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 font-ibm text-xs focus:border-iscm-crimson focus:outline-none text-iscm-charcoal"
              />
            </label>

            {formError && (
              <div className="flex items-center gap-1.5 text-red-600 font-ibm text-xs bg-red-50 p-2.5 rounded-lg">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-iscm-cta hover:bg-iscm-charcoal text-white font-ibm text-xs font-semibold py-2.5 rounded-lg transition-colors flex items-center justify-center gap-1"
            >
              <Plus className="h-4 w-4" /> Schedule Agenda
            </button>
          </form>
        </section>

      </div>
    </div>
  );
}

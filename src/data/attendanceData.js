/**
 * Extracted from "iscm daily attendance checklist.xlsx" (Description,
 * 2026_Daily attendance record, Jul sheets). Powers the Daily Attendance Log
 * pane inside My Site. Deadlines below are institutional policy, not in the
 * sheet itself.
 */

export const ATTENDANCE_DEADLINES = {
  officeCheckIn: '08:15',   // office-based teams clock in
  formLock: '08:30',        // general daily form locks — late entries need approval
  okrFinalLog: '17:00',     // end-of-day OKR / task log cutoff
};

// The 8 status keywords defined on the workbook's "Description" sheet
// (bilingual text below is the exact wording from the ISCM keyword reference sheet)
export const ATTENDANCE_LEGEND = [
  { key: 'annual_leave', label: 'Annual Leave (12 days)', vi: 'Nghỉ phép năm', requestable: true, leadTime: '6mo',
    desc: 'Planned leave days taken in advance for personal purposes such as travel, rest, or family activities. Must be registered and approved beforehand by ISCM Director.',
    descVi: 'Nghỉ phép có kế hoạch trước, dùng cho mục đích cá nhân như du lịch, nghỉ ngơi hoặc tham gia hoạt động gia đình. Cần đăng ký trước (ít nhất 6 tháng) và được phê duyệt theo chế độ nghỉ phép năm. Trường hợp nghỉ phép dài hạn, trong thời gian nghỉ không làm các việc của UEH/ISCM, làm đơn xin phép UEH theo quy định.' },
  { key: 'absence_permit', label: 'Absence with Permission', vi: 'Nghỉ có phép', requestable: true, leadTime: '24h',
    desc: 'Unplanned or short-notice absence due to unexpected situations, with prior notification and approval from ISCM Director. Common reasons include sudden illness, family emergencies, or urgent personal matters.',
    descVi: 'Nghỉ không có kế hoạch trước do các tình huống đột xuất, nhưng đã xin phép và được lãnh đạo Viện chấp thuận. Thường bao gồm nghỉ ốm, việc gia đình gấp hoặc các việc cá nhân khẩn cấp, thời gian ngắn.' },
  { key: 'absence_no_permit', label: 'Absence without Permission', vi: 'Nghỉ không phép', requestable: false,
    desc: 'Absent from work without prior approval.', descVi: 'Vắng mặt không xin phép.' },
  { key: 'wfh', label: 'Work from Home with Permission', vi: 'Làm việc tại nhà', requestable: true, leadTime: '24h',
    desc: 'Working remotely with prior approval from ISCM Director.', descVi: 'Làm việc tại nhà có xin phép và được lãnh đạo Viện chấp thuận.' },
  { key: 'outside_fullday', label: 'Work Outside Fullday with Permission', vi: 'Công tác cả ngày', requestable: true, leadTime: '24h',
    desc: 'Working off-site fullday (e.g., meetings, fieldwork) with approval.', descVi: 'Làm việc ngoài văn phòng cả ngày (ví dụ: họp, công tác...) và được lãnh đạo Viện chấp thuận.' },
  { key: 'outside_halfday', label: 'Work Outside Halfday with Permission', vi: 'Công tác nửa ngày', requestable: true, leadTime: '24h',
    desc: 'Working off-site halfday (e.g., meetings, fieldwork) with approval.', descVi: 'Làm việc ngoài văn phòng nửa ngày (ví dụ: họp, công tác...) và được lãnh đạo Viện chấp thuận.' },
  { key: 'late_permit', label: 'Late with Permission', vi: 'Trễ có phép', requestable: true, leadTime: '24h',
    desc: 'Late arrival with prior notice and approval.', descVi: 'Đi làm trễ có xin phép và được chấp thuận trước.' },
  { key: 'late_no_permit', label: 'Late without Permission', vi: 'Trễ không phép', requestable: false,
    desc: 'Late arrival without prior notice or valid reason.', descVi: 'Đi làm trễ không xin phép.' },
];

// Two additional record types the workbook also governs — not per-day statuses
// a member selects, but scopes of what "Daily Attendance" as a whole tracks.
export const ATTENDANCE_RECORD_TYPES = [
  { key: 'event_participation', label: 'ISCM event participation record',
    desc: 'A record of mandatory ISCM events that all members are required to attend. Absences must be approved in advance by ISCM leadership.',
    descVi: 'Ghi nhận các hoạt động bắt buộc của ISCM mà tất cả thành viên phải tham gia. Nếu vắng mặt, cần xin phép trước với lãnh đạo Viện.' },
  { key: 'daily_attendance', label: 'Daily attendance record',
    desc: 'A daily record of working attendance during official working hours at ISCM.',
    descVi: 'Ghi nhận thời gian làm việc hằng ngày trong giờ hành chính tại ISCM.' },
];

// Header roster, "2026_Daily attendance record" sheet, row 2
export const STAFF_ROSTER = [
  'Bình', 'Khôi', 'Tài', 'Trâm', 'Hiển', 'Hải', 'Khang', 'Hoài', 'Mai', 'Dung',
  'Lan', 'Quang', 'An', 'Tâm', 'Phúc', 'Vũ', 'Daniela', 'Chi', 'T.Nguyên',
  'Dung nhỏ', 'Hùng', 'Khuê', 'Tiên', 'Minh Huy', 'Cẩm Tiên', 'Thành Đạt',
  'Thuý An', 'Ngọc Thiện',
];

// Signed-in demo profile ties to the "Hùng" column, 2026_Daily attendance record
export const MY_YTD_ATTENDANCE = {
  annual_leave: 0,
  absence_permit: 4,
  absence_no_permit: 3,
  wfh: 1,
  outside_fullday: 3,
  outside_halfday: 1,
  late_permit: 0,
  late_no_permit: 0,
};

// Institute-wide column sums across all 28 staff, 2026_Daily attendance record
export const INSTITUTE_YTD_TOTALS = {
  annual_leave: 11,
  absence_permit: 105,
  absence_no_permit: 92,
  wfh: 67,
  outside_fullday: 132,
  late_permit: 19,
  late_no_permit: 9,
  outside_halfday: 47,
};

// Representative real entries, "Jul" monthly sheet (2025-07-01 → 2025-07-09)
export const RECENT_LOG_SAMPLE = [
  { date: '2025-07-01', day: 'Tue', staff: 'Quỳnh', status: 'Absence w Permission' },
  { date: '2025-07-02', day: 'Wed', staff: 'Hiển', status: 'Absence without Permission' },
  { date: '2025-07-02', day: 'Wed', staff: 'Đạo', status: 'Work Outside w Permission' },
  { date: '2025-07-03', day: 'Thu', staff: 'Hoài', status: 'Late with Permission' },
  { date: '2025-07-07', day: 'Mon', staff: 'Mai', status: 'Work from Home w Approval' },
  { date: '2025-07-08', day: 'Tue', staff: 'Khôi', status: 'Work Outside w Permission' },
  { date: '2025-07-09', day: 'Wed', staff: 'Hải', status: 'Absence without Permission' },
];

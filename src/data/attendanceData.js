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
export const ATTENDANCE_LEGEND = [
  { key: 'annual_leave', label: 'Annual Leave (12 days)', vi: 'Nghỉ phép năm', desc: 'Planned leave registered ≥ 6 months ahead, approved by ISCM Director.' },
  { key: 'absence_permit', label: 'Absence with Permission', vi: 'Nghỉ có phép', desc: 'Unplanned absence (illness, family emergency) approved in advance.' },
  { key: 'absence_no_permit', label: 'Absence without Permission', vi: 'Nghỉ không phép', desc: 'Absent from work without prior approval.' },
  { key: 'wfh', label: 'Work from Home with Permission', vi: 'Làm việc tại nhà', desc: 'Remote work approved in advance by ISCM Director.' },
  { key: 'outside_fullday', label: 'Work Outside Fullday with Permission', vi: 'Công tác cả ngày', desc: 'Off-site full day (meetings, fieldwork) with approval.' },
  { key: 'outside_halfday', label: 'Work Outside Halfday with Permission', vi: 'Công tác nửa ngày', desc: 'Off-site half day with approval.' },
  { key: 'late_permit', label: 'Late with Permission', vi: 'Trễ có phép', desc: 'Late arrival with prior notice and approval.' },
  { key: 'late_no_permit', label: 'Late without Permission', vi: 'Trễ không phép', desc: 'Late arrival without prior notice or valid reason.' },
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

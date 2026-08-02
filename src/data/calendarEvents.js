/**
 * Shared institute calendar — same event list "My Calendar" (My Portal) and
 * "Institute Calendar" (Admin) both read from. `attendees` is either the
 * string 'all' (institute-wide, e.g. all-hands/seminars) or an array of
 * exact ISCM_MEMBERS.nameVi strings for events scoped to specific staff —
 * lets the Admin per-member filter match on name.
 */
export const WS_EVENTS = [
  { id: 'e1', title: 'Họp giao ban điều hành Tuần', start: '2026-07-06T09:00', end: '2026-07-06T11:00', location: 'StudioLab A, T1, ISCM', tag: 'Internal', tagColor: 'bg-neutral-100 text-neutral-800 border-neutral-200', attendees: ['PGS. TS. Trịnh Tú Anh', 'ThS. KTS. Trần Thị Quỳnh Mai', 'TS. KTS. Hoàng Ngọc Lan', 'TS. KTS. Huỳnh Văn Khang', 'ThS. Lại Phương Dung', 'Lê Thị Thủy Tiên'] },
  { id: 'e2', title: 'Ký kết MOU với Grab Vietnam', start: '2026-07-07T14:30', end: '2026-07-07T15:30', location: 'Hội thảo CTD', tag: 'Partnership', tagColor: 'bg-neutral-100 text-neutral-800 border-neutral-200', attendees: ['PGS. TS. Trịnh Tú Anh', 'ThS. Lại Phương Dung'] },
  { id: 'e3', title: 'Thẩm định đề xuất HCMC Walkability Atlas', start: '2026-07-09T10:00', end: '2026-07-09T12:00', location: 'Meeting Room C, ISCM OS', tag: 'Research', tagColor: 'bg-neutral-100 text-neutral-800 border-neutral-200', attendees: ['TS. Phạm Nguyễn Hoài', 'ThS. Đỗ Lê Phúc Tâm', 'TS. Vương Trần Quang'] },
  { id: 'e4', title: 'ISCM-UEH Academic Seminar', start: '2026-07-10T13:30', end: '2026-07-10T16:00', location: 'Hội trường CTD', tag: 'Seminar', tagColor: 'bg-neutral-100 text-neutral-800 border-neutral-200', attendees: 'all' },
  { id: 'e5', title: 'Board Meeting — Director Level', start: '2026-07-10T09:00', end: '2026-07-10T10:30', location: 'Văn phòng Giám đốc, T3', tag: 'Admin', tagColor: 'bg-[#990000] text-white border-[#990000]', attendees: ['PGS. TS. Trịnh Tú Anh', 'ThS. KTS. Trần Thị Quỳnh Mai'] },
  { id: 'e6', title: 'All-hands Core Team Sync', start: '2026-07-06T13:00', end: '2026-07-06T14:00', location: 'Online (Google Meet)', tag: 'Internal', tagColor: 'bg-neutral-100 text-neutral-800 border-neutral-200', attendees: 'all' },
];

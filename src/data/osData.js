/**
 * ISCM OS — dữ liệu vận hành theo Tờ trình 08/7/2026 (Đề án 1 & Đề án 2).
 * Bao phủ: phân tầng Lab → Chương trình → Dự án → Task, Timesheet Engine,
 * Task ngoài dự án, ISCM-Equipment Tracking, Bypass Approval Engine,
 * tài khoản khách mời (Google OAuth2), Audit Log và catalog ISCM CORE.
 */

export const TODAY = '2026-07-08';

/* ---------------- Nhân sự 5 khối chức năng gốc (Matrix HR) ---------------- */
export const OS_GROUPS = [
  'Nhóm Vận hành & Tài chính', 'Nhóm Học thuật', 'Nhóm Nghiên cứu',
  'Nhóm Gắn kết cộng đồng', 'Nhóm Quan hệ đối tác',
];

export const OS_STAFF = [
  { id: 's1', name: 'Trịnh Tú Anh', group: 'Ban Giám đốc', title: 'Viện trưởng' },
  { id: 's2', name: 'Trần Ngọc Lan', group: 'Nhóm Nghiên cứu', title: 'Head Lab — Public Space' },
  { id: 's3', name: 'Phạm Quang Minh', group: 'Nhóm Gắn kết cộng đồng', title: 'Nghiên cứu viên' },
  { id: 's4', name: 'Lê Thu Thảo', group: 'Nhóm Học thuật', title: 'Giảng viên - Nghiên cứu viên' },
  { id: 's5', name: 'Võ Anh Khoa', group: 'Nhóm Nghiên cứu', title: 'Nghiên cứu viên' },
  { id: 's6', name: 'Đặng Trà My', group: 'Nhóm Vận hành & Tài chính', title: 'Chuyên viên hành chính - tài vụ' },
  { id: 's7', name: 'Nguyễn Việt Quốc Hùng', group: 'Nhóm Nghiên cứu', title: 'Cộng tác viên (CTV)' },
  { id: 's8', name: 'Đỗ Hải Yến', group: 'Nhóm Quan hệ đối tác', title: 'Chuyên viên đối ngoại' },
];
export const staffById = Object.fromEntries(OS_STAFF.map((s) => [s.id, s]));

/** Vai trò động theo Đề án 1 (Context-based RBAC) */
export const DYNAMIC_ROLES = ['Project Lead', 'Data Collector', 'Editor', 'Viewer'];

/* ---------------- Phân tầng: Lab → Chương trình → Dự án ---------------- */
export const OS_HIERARCHY = [
  {
    lab: 'Public Space Lab', lab_code: 'PUBLIC_SPACE',
    programs: [
      {
        program: 'Public Space Atlas',
        projects: [
          { id: 'prj-psa-q1', name: 'Atlas HCMC — Quận 1', status: 'Đang triển khai', core_assets: 4, pilot: true },
          { id: 'prj-psa-hcr', name: 'Atlas HCMC — Hồ Con Rùa', status: 'Đang triển khai', core_assets: 2 },
        ],
      },
      {
        program: 'HCR-PDPhung',
        projects: [
          { id: 'prj-hcr', name: 'Cải tạo không gian Phan Đình Phùng', status: 'Thẩm định', core_assets: 1 },
        ],
      },
    ],
  },
  {
    lab: 'MOVE System Lab', lab_code: 'MOVE',
    programs: [
      {
        program: 'Smart Mobility',
        projects: [
          { id: 'prj-drt', name: 'UEH DRT Bus', status: 'Đang triển khai', core_assets: 2 },
          { id: 'prj-emoto', name: 'Nghiên cứu E-motorbike', status: 'Đang triển khai', core_assets: 1 },
        ],
      },
    ],
  },
  {
    lab: 'Data Driven & Urban Design Lab', lab_code: 'DDUD',
    programs: [
      {
        program: 'Urban Heat',
        projects: [
          { id: 'prj-heat', name: 'Bản đồ Đảo nhiệt Đô thị HCMC', status: 'Đang triển khai', core_assets: 3 },
        ],
      },
    ],
  },
];

export const projectIndex = Object.fromEntries(
  OS_HIERARCHY.flatMap((l) =>
    l.programs.flatMap((pg) =>
      pg.projects.map((p) => [p.id, { ...p, lab: l.lab, lab_code: l.lab_code, program: pg.program }])
    )
  )
);

/* ---------------- Gói công việc (Tasks) — có ngày cho Gantt ---------------- */
// column: todo | doing | review | done
export const OS_TASKS = [
  { id: 'T-101', project_id: 'prj-psa-q1', title: 'Khảo sát thực địa vỉa hè Quận 1 (đợt 2)', assignee: 's5', column: 'doing', start: '2026-07-01', end: '2026-07-18', hours_est: 60 },
  { id: 'T-102', project_id: 'prj-psa-q1', title: 'Số hóa bản vẽ hiện trạng 12 tuyến phố', assignee: 's7', column: 'doing', start: '2026-07-06', end: '2026-07-25', hours_est: 48 },
  { id: 'T-103', project_id: 'prj-psa-q1', title: 'Chuẩn hóa phiếu khảo sát về schema Atlas', assignee: 's2', column: 'review', start: '2026-06-28', end: '2026-07-10', hours_est: 24 },
  { id: 'T-104', project_id: 'prj-psa-q1', title: 'Biên tập chương Atlas — Không gian mở', assignee: 's4', column: 'todo', start: '2026-07-20', end: '2026-08-15', hours_est: 40 },
  { id: 'T-105', project_id: 'prj-psa-q1', title: 'Nghiệm thu nội bộ dữ liệu đợt 1', assignee: 's1', column: 'done', start: '2026-06-20', end: '2026-07-02', hours_est: 8 },
  { id: 'T-201', project_id: 'prj-psa-hcr', title: 'Bay drone chụp trắc địa Hồ Con Rùa', assignee: 's5', column: 'todo', start: '2026-07-14', end: '2026-07-22', hours_est: 20 },
  { id: 'T-202', project_id: 'prj-psa-hcr', title: 'Dựng mô hình điểm mây (point cloud)', assignee: 's7', column: 'todo', start: '2026-07-23', end: '2026-08-20', hours_est: 56 },
  { id: 'T-301', project_id: 'prj-hcr', title: 'Hồ sơ thẩm định phương án cải tạo', assignee: 's2', column: 'review', start: '2026-07-01', end: '2026-07-30', hours_est: 32 },
  { id: 'T-401', project_id: 'prj-drt', title: 'Phân tích dữ liệu chuyến đi tuần 1-4', assignee: 's5', column: 'doing', start: '2026-07-02', end: '2026-07-28', hours_est: 44 },
  { id: 'T-402', project_id: 'prj-drt', title: 'Khảo sát hài lòng hành khách DRT', assignee: 's3', column: 'doing', start: '2026-07-08', end: '2026-08-08', hours_est: 36 },
  { id: 'T-403', project_id: 'prj-drt', title: 'Báo cáo giữa kỳ gửi KICT', assignee: 's4', column: 'todo', start: '2026-08-10', end: '2026-09-05', hours_est: 30 },
  { id: 'T-501', project_id: 'prj-emoto', title: 'Phỏng vấn sâu 20 người dùng xe điện', assignee: 's3', column: 'doing', start: '2026-07-05', end: '2026-07-31', hours_est: 40 },
  { id: 'T-601', project_id: 'prj-heat', title: 'Xử lý ảnh Landsat LST 2020-2026', assignee: 's7', column: 'doing', start: '2026-07-01', end: '2026-07-20', hours_est: 50 },
  { id: 'T-602', project_id: 'prj-heat', title: 'Hiệu chỉnh trạm quan trắc mặt đất', assignee: 's5', column: 'todo', start: '2026-07-21', end: '2026-08-12', hours_est: 28 },
  { id: 'T-603', project_id: 'prj-heat', title: 'Bản đồ nhiệt độ bề mặt theo phường', assignee: 's2', column: 'todo', start: '2026-08-13', end: '2026-09-20', hours_est: 46 },
];

/* ---------------- Task cá nhân / ngoài dự án (Ad-hoc) ---------------- */
export const ADHOC_TASKS = [
  { id: 'AH-01', title: 'Chuẩn bị hồ sơ đón đoàn Hochschule Worms', assignee: 's8', due: '2026-07-11', hours: 6, status: 'doing' },
  { id: 'AH-02', title: 'Kiểm kê văn phòng phẩm quý III', assignee: 's6', due: '2026-07-15', hours: 4, status: 'todo' },
  { id: 'AH-03', title: 'Hỗ trợ setup phòng hội thảo RTD 2026', assignee: 's7', due: '2026-07-14', hours: 8, status: 'todo' },
  { id: 'AH-04', title: 'Cập nhật danh bạ liên hệ đối tác', assignee: 's8', due: '2026-07-09', hours: 3, status: 'done' },
];

/* ---------------- Timesheet Engine (tuần 06-12/07/2026) ---------------- */
// hours: [T2, T3, T4, T5, T6] — chuẩn năng lực 40h/tuần
export const TIMESHEET_WEEK = { label: 'Tuần 06/07 – 12/07/2026', capacity: 40 };
export const TIMESHEET = [
  { staff: 's2', rows: [
    { ref: 'Atlas HCMC — Quận 1', hours: [4, 4, 4, 2, 4] },
    { ref: 'Cải tạo KG Phan Đình Phùng', hours: [4, 4, 2, 4, 4] },
  ], status: 'Đã duyệt' },
  { staff: 's5', rows: [
    { ref: 'Atlas HCMC — Quận 1', hours: [6, 6, 4, 6, 4] },
    { ref: 'UEH DRT Bus', hours: [4, 4, 6, 4, 4] },
  ], status: 'Chờ duyệt' },
  { staff: 's7', rows: [
    { ref: 'Atlas HCMC — Quận 1', hours: [4, 4, 4, 4, 4] },
    { ref: 'Bản đồ Đảo nhiệt HCMC', hours: [4, 4, 4, 4, 2] },
    { ref: 'Ad-hoc: Setup RTD 2026', hours: [0, 2, 2, 2, 2] },
  ], status: 'Chờ duyệt' },
  { staff: 's3', rows: [
    { ref: 'UEH DRT Bus', hours: [4, 4, 4, 4, 4] },
    { ref: 'E-motorbike', hours: [3, 3, 3, 3, 2] },
  ], status: 'Đã duyệt' },
  { staff: 's6', rows: [
    { ref: 'Vận hành văn phòng', hours: [8, 8, 8, 8, 8] },
    { ref: 'Ad-hoc: Kiểm kê quý III', hours: [0, 0, 2, 2, 0] },
  ], status: 'Chờ duyệt' },
];

export const timesheetTotal = (entry) =>
  entry.rows.reduce((sum, r) => sum + r.hours.reduce((a, b) => a + b, 0), 0);

/* ---------------- ISCM-Equipment Tracking ---------------- */
export const EQUIPMENT = [
  { id: 'EQP-001', name: 'Kính VR Meta Quest Pro — Bộ A', type: 'Kính VR', qr: 'ISCM-VR-001', status: 'Đang mượn', borrower: 's7', due: '2026-07-15', next_maintenance: '2026-09-01' },
  { id: 'EQP-002', name: 'Kính VR Meta Quest Pro — Bộ B', type: 'Kính VR', qr: 'ISCM-VR-002', status: 'Sẵn sàng', borrower: null, due: null, next_maintenance: '2026-09-01' },
  { id: 'EQP-003', name: 'Drone DJI Mavic 3 Enterprise', type: 'Máy quét Drone', qr: 'ISCM-DR-001', status: 'Đang mượn', borrower: 's5', due: '2026-07-10', next_maintenance: '2026-07-06' },
  { id: 'EQP-004', name: 'Máy ảnh Sony A7 IV + gimbal', type: 'Máy ảnh', qr: 'ISCM-CAM-01', status: 'Sẵn sàng', borrower: null, due: null, next_maintenance: '2026-10-15' },
  { id: 'EQP-005', name: 'Máy trắc địa Leica TS16', type: 'Máy trắc địa', qr: 'ISCM-SUR-01', status: 'Bảo trì', borrower: null, due: null, next_maintenance: '2026-07-05' },
  { id: 'EQP-006', name: 'Trạm xử lý không gian RTX 4090 #2', type: 'Máy tính hiệu năng cao', qr: 'ISCM-RIG-02', status: 'Đang mượn', borrower: 's7', due: '2026-08-30', next_maintenance: '2026-12-01' },
];

/* ---------------- Bypass Approval Engine (tờ trình số) ---------------- */
export const APPROVAL_TYPES = [
  { key: 'funding', label: 'Xin kinh phí nghiên cứu' },
  { key: 'procurement', label: 'Đề xuất mua sắm thiết bị' },
  { key: 'data-access', label: 'Xin cấp dữ liệu ngoại khối' },
];

// level: 1 = chờ Head Lab, 2 = phòng chờ Viện trưởng
export const APPROVALS = [
  { id: 'TT-2026-041', type: 'funding', title: 'Kinh phí khảo sát thực địa Atlas Quận 1 (đợt 3)', requester: 's2', amount: '48.000.000 ₫', created: '2026-07-06', level: 2, status: 'Chờ duyệt', signed: true, sla_hours: 46 },
  { id: 'TT-2026-042', type: 'procurement', title: 'Mua 02 pin dự phòng drone DJI Mavic 3E', requester: 's5', amount: '14.500.000 ₫', created: '2026-07-07', level: 1, status: 'Chờ duyệt', signed: true, sla_hours: 22 },
  { id: 'TT-2026-043', type: 'data-access', title: 'Xin cấp dữ liệu footfall Nhóm Gắn kết cho DRT Bus', requester: 's3', amount: '—', created: '2026-07-05', level: 2, status: 'Yêu cầu bổ sung', signed: true, sla_hours: 70 },
  { id: 'TT-2026-040', type: 'funding', title: 'Kinh phí hội thảo giữa kỳ Urban Heat', requester: 's7', amount: '22.000.000 ₫', created: '2026-07-02', level: 2, status: 'Đã duyệt', signed: true, sla_hours: 31 },
  { id: 'TT-2026-039', type: 'procurement', title: 'Nâng cấp RAM trạm xử lý RIG-02', requester: 's7', amount: '9.800.000 ₫', created: '2026-06-30', level: 2, status: 'Từ chối', signed: true, sla_hours: 55 },
];

/** Thông báo in-app + email (@ueh.edu.vn) khi trạng thái tờ trình đổi */
export const APPROVAL_NOTIFICATIONS = [
  { id: 'n1', at: '2026-07-08 09:12', channel: ['in-app', 'email'], text: 'TT-2026-040 đã được Viện trưởng PHÊ DUYỆT — email xác nhận gửi tới hung.nvq@ueh.edu.vn' },
  { id: 'n2', at: '2026-07-07 16:40', channel: ['in-app'], text: 'TT-2026-042 được chuyển lên cấp Head Lab — MOVE System' },
  { id: 'n3', at: '2026-07-07 10:05', channel: ['in-app', 'email'], text: 'TT-2026-043 bị YÊU CẦU BỔ SUNG: làm rõ phạm vi chia sẻ dữ liệu footfall' },
  { id: 'n4', at: '2026-07-06 14:20', channel: ['in-app', 'email'], text: 'TT-2026-039 bị TỪ CHỐI — lý do: gộp vào kế hoạch mua sắm quý IV' },
];

/* ---------------- Tài khoản khách mời (Google OAuth2) ---------------- */
export const GUEST_ACCOUNTS = [
  { id: 'g1', name: 'Lê Minh Anh', email: 'intern.minhanh@gmail.com', scope: 'Atlas HCMC — Quận 1', role: 'Data Collector', expires: '2026-09-15', status: 'Hoạt động', approved_by: 'Head Lab — Public Space' },
  { id: 'g2', name: 'Trần Thanh Tâm', email: 'ctv.thanhtam@gmail.com', scope: 'UEH DRT Bus', role: 'Viewer', expires: '2026-07-31', status: 'Hoạt động', approved_by: 'Head Lab — MOVE' },
  { id: 'g3', name: 'Phan Quốc Bảo', email: 'bao.phan.arch@gmail.com', scope: 'Bản đồ Đảo nhiệt HCMC', role: 'Editor', expires: '2026-06-30', status: 'Hết hạn — đã thu hồi', approved_by: 'Ban Giám đốc' },
];

/* ---------------- Audit Log (Matrix HR & RBAC) ---------------- */
export const AUDIT_LOG = [
  { at: '2026-07-08 08:45', actor: 'Trịnh Tú Anh', action: 'Điều động Võ Anh Khoa → UEH DRT Bus (Data Collector)' },
  { at: '2026-07-07 15:30', actor: 'Head Lab — Public Space', action: 'Nâng vai trò Nguyễn Việt Quốc Hùng: Viewer → Editor tại Atlas HCMC — Quận 1' },
  { at: '2026-07-05 09:10', actor: 'Hệ thống (RBAC)', action: 'Tự động thu hồi quyền khách mời bao.phan.arch@gmail.com — hết hạn hợp tác 30/06' },
  { at: '2026-07-03 11:22', actor: 'Trịnh Tú Anh', action: 'Phê duyệt tài khoản khách mời intern.minhanh@gmail.com (hiệu lực đến 15/09/2026)' },
  { at: '2026-07-01 08:00', actor: 'UEH AD SSO', action: 'Đồng bộ 8 tài khoản @ueh.edu.vn từ Microsoft Azure AD' },
];

/* ---------------- ISCM CORE — catalog & pipeline (Đề án 2) ---------------- */
// stage: uploaded → scanning → pending (chờ duyệt, ticket sang OS) → etl → stored | rejected
export const CORE_FILES = [
  { asset_id: 'PSA-0007', lab_code: 'PUBLIC_SPACE', project_id: 'prj-psa-q1', file_name: 'khao_sat_via_he_Q1_dot2.xlsx', file_type: 'EXCEL', privacy_status: 'Draft', uploaded_by: 'khoa.vo@ueh.edu.vn', created_at: '2026-07-08 07:55', stage: 'scanning', flow: 'lab', size_mb: 4.2 },
  { asset_id: 'PSA-0006', lab_code: 'PUBLIC_SPACE', project_id: 'prj-psa-q1', file_name: 'ranh_gioi_khong_gian_mo_Q1.geojson', file_type: 'GEOJSON', privacy_status: 'Draft', uploaded_by: 'hung.nvq@ueh.edu.vn', created_at: '2026-07-07 16:31', stage: 'pending', flow: 'lab', size_mb: 12.8, source_crs: 'EPSG:4326' },
  { asset_id: 'MOV-0031', lab_code: 'MOVE', project_id: 'prj-drt', file_name: 'drt_trip_log_tuan4.csv', file_type: 'EXCEL', privacy_status: 'Draft', uploaded_by: 'minh.pham@ueh.edu.vn', created_at: '2026-07-07 14:02', stage: 'etl', flow: 'lab', size_mb: 22.4, etl_step: 'Pandas: chuẩn hóa UTF-8, khử 218 dòng trống' },
  { asset_id: 'PSA-0005', lab_code: 'PUBLIC_SPACE', project_id: 'prj-psa-q1', file_name: 'public_space_atlas_hcmc_v2_20260705.shp', file_type: 'SHAPEFILE', privacy_status: 'Internal_Open', uploaded_by: 'lan.tran@ueh.edu.vn', created_at: '2026-07-05 10:12', stage: 'stored', flow: 'lab', size_mb: 86.0, source_crs: 'EPSG:4326', target_crs: 'EPSG:5899', total_features: 1284, version: 'v2_20260705' },
  { asset_id: 'DDU-0012', lab_code: 'DDUD', project_id: 'prj-heat', file_name: 'landsat_lst_2026_q2.tif', file_type: 'GEOTIFF', privacy_status: 'Internal_Open', uploaded_by: 'hung.nvq@ueh.edu.vn', created_at: '2026-07-04 09:45', stage: 'stored', flow: 'lab', size_mb: 310.5, source_crs: 'EPSG:4326', target_crs: 'EPSG:5899', total_features: 0 },
  { asset_id: 'PUB-0002', lab_code: 'PUBLIC_SPACE', project_id: 'prj-psa-hcr', file_name: 'gop_y_cong_dong_HCR.xlsx', file_type: 'EXCEL', privacy_status: 'Draft', uploaded_by: 'doi_tac_ngoai (OTP)', created_at: '2026-07-06 20:18', stage: 'pending', flow: 'public', size_mb: 1.1 },
  { asset_id: 'HUE-0044', lab_code: 'PUBLIC_SPACE', project_id: 'prj-hcr', file_name: 'ban_do_hien_trang_hue.dwg', file_type: 'CAD', privacy_status: 'Confidential', uploaded_by: 'lan.tran@ueh.edu.vn', created_at: '2026-07-03 11:30', stage: 'stored', flow: 'lab', size_mb: 45.7, source_crs: 'EPSG:4326', target_crs: 'VN2000 / KTT 107°30′', total_features: 342 },
  { asset_id: 'MOV-0030', lab_code: 'MOVE', project_id: 'prj-drt', file_name: 'virus_test_macro.xlsm', file_type: 'EXCEL', privacy_status: 'Draft', uploaded_by: 'unknown (OTP)', created_at: '2026-07-06 03:12', stage: 'rejected', flow: 'public', size_mb: 0.8, reject_reason: 'ClamAV: phát hiện macro độc hại — cách ly tại Sandbox' },
];

export const CORE_STAGES = [
  { key: 'uploaded', label: 'Thu nạp', hint: 'API Gateway (FastAPI) — Widget Lab / Cổng công cộng' },
  { key: 'scanning', label: 'Sandbox — Quét ClamAV', hint: 'Cách ly hoàn toàn khỏi hệ thống chính' },
  { key: 'pending', label: 'Chờ phê duyệt', hint: 'Ticket bắn về ISCM OS — Lãnh đạo Lab/Viện' },
  { key: 'etl', label: 'ETL Engine', hint: 'Pandas làm sạch · GeoPandas ép VN2000' },
  { key: 'stored', label: 'Kho tổng', hint: 'Data Lake (file gốc) + Warehouse PostGIS' },
];

/** Link chia sẻ mã hóa tự hủy: hết hạn = hiện tại + 24 giờ */
export const EGRESS_LINKS = [
  { id: 'lnk1', asset_id: 'PSA-0005', token: 'c9f3…a71d', issued: '2026-07-07 15:00', expires: '2026-07-08 15:00', to: 'Sở QH-KT TP.HCM' },
];

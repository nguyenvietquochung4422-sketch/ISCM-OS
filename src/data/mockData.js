/**
 * Demo dataset mirroring the Supabase schema (supabase/schema.sql).
 * Swap for live queries via src/lib/supabaseClient.js when credentials exist.
 */

export const FUNCTIONAL_GROUPS = [
  'Operation & Finance', 'PR & Communication', 'Partnership',
  'Đào tạo Học thuật', 'Nghiên cứu Khoa học', 'Gắn kết Cộng đồng',
];

// NOTE: `phone` left blank — real numbers weren't provided; fill in when available
// (deliberately not fabricated, since these are real named ISCM staff).
export const users = [
  // users[0] is the persona shown before a real Google sign-in — a generic
  // guest, deliberately NOT one of the named staff below.
  { id: '00000000-0000-0000-0000-000000000000', email: 'guest@iscm.ueh.edu.vn', full_name: 'GUEST',          phone: '', base_functional_group: 'ISCM',             system_role: 'Guest' },

  // — ISCM leadership (Ban Giám đốc / Quản lý bộ phận) —
  { id: '11111111-1111-1111-1111-111111111111', email: 'trinhtuanh@ueh.edu.vn',  full_name: 'Trịnh Tú Anh',   phone: '', base_functional_group: 'Management Board', system_role: 'Director' },
  { id: '77777777-7777-7777-7777-777777777777', email: 'ttqmai@ueh.edu.vn',      full_name: 'Trần Thị Quỳnh Mai',    phone: '', base_functional_group: 'Operation & Finance', system_role: 'Vice Director' },
  { id: '88888888-8888-8888-8888-888888888888', email: 'hoaipm@ueh.edu.vn',      full_name: 'Phạm Nguyễn Hoài',      phone: '', base_functional_group: 'Nghiên cứu Khoa học', system_role: 'Group Head' },
  { id: '99999999-9999-9999-9999-999999999999', email: 'lanhn@ueh.edu.vn',       full_name: 'Hoàng Ngọc Lan',        phone: '', base_functional_group: 'Đào tạo Học thuật',   system_role: 'Group Head' },
  { id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', email: 'khanghv@ueh.edu.vn',      full_name: 'Huỳnh Văn Khang',       phone: '', base_functional_group: 'Gắn kết Cộng đồng',   system_role: 'Group Head' },
  { id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', email: 'dunglp@ueh.edu.vn',       full_name: 'Lại Phương Dung',       phone: '', base_functional_group: 'Partnership',         system_role: 'Group Head' },

  // — Giám đốc chương trình / Quản lý bộ phận —
  { id: 'm03', email: 'hiendt@ueh.edu.vn',    full_name: 'Đặng Thế Hiển',       phone: '', base_functional_group: 'Đào tạo Học thuật',   system_role: 'Group Head' },
  { id: 'm08', email: 'tienltt@ueh.edu.vn',   full_name: 'Lê Thị Thủy Tiên',    phone: '', base_functional_group: 'PR & Communication',  system_role: 'Group Head' },

  // — Giảng viên —
  { id: 'm09', email: 'tamdlp@ueh.edu.vn',    full_name: 'Đỗ Lê Phúc Tâm',      phone: '', base_functional_group: 'Đào tạo Học thuật',   system_role: 'Researcher' },
  { id: 'm12', email: 'chivd@ueh.edu.vn',     full_name: 'Võ Dao Chi',          phone: '', base_functional_group: 'Nghiên cứu Khoa học', system_role: 'Researcher' },
  { id: 'm13', email: 'quangvt@ueh.edu.vn',   full_name: 'Vương Trần Quang',    phone: '', base_functional_group: 'Nghiên cứu Khoa học', system_role: 'Researcher' },
  { id: 'm15', email: 'haihln@ueh.edu.vn',    full_name: 'Hoàng Lê Nam Hải',    phone: '', base_functional_group: 'Đào tạo Học thuật',   system_role: 'Researcher' },
  { id: 'm16', email: 'dahurtarte@ueh.edu.vn', full_name: 'Daniela Hurtarte',   phone: '', base_functional_group: 'Nghiên cứu Khoa học', system_role: 'Researcher' },
  { id: 'm17', email: 'trungnt@ueh.edu.vn',   full_name: 'Nguyễn Tấn Trung',    phone: '', base_functional_group: 'Nghiên cứu Khoa học', system_role: 'Researcher' },

  // — Chuyên viên & Cộng tác viên —
  { id: 'm18', email: 'anlpt@ueh.edu.vn',     full_name: 'Lê Phan Trường An',   phone: '', base_functional_group: 'Operation & Finance', system_role: 'Assistant' },
  { id: 'm19', email: 'phucnh@ueh.edu.vn',    full_name: 'Nguyễn Hoàng Phúc',   phone: '', base_functional_group: 'Operation & Finance', system_role: 'Assistant' },
  { id: 'm21', email: 'vuta@ueh.edu.vn',      full_name: 'Thái Anh Vũ',         phone: '', base_functional_group: 'Operation & Finance', system_role: 'Researcher' },
  { id: 'm22', email: 'tramnq@ueh.edu.vn',    full_name: 'Nguyễn Quỳnh Trâm',   phone: '', base_functional_group: 'Operation & Finance', system_role: 'Assistant' },
  { id: 'm23', email: 'binhlpt@ueh.edu.vn',   full_name: 'Lưu Phạm Thanh Bình', phone: '', base_functional_group: 'Gắn kết Cộng đồng',   system_role: 'Assistant' },
  { id: 'm24', email: 'taitv@ueh.edu.vn',     full_name: 'Trần Vĩnh Tài',       phone: '', base_functional_group: 'Gắn kết Cộng đồng',   system_role: 'Assistant' },

  // — Thực tập sinh —
  { id: 'i01', email: 'hdungworkspace@gmail.com', full_name: 'Phạm Võ Hồng Dung',  phone: '', base_functional_group: 'PR & Communication',  system_role: 'Assistant' },
  { id: 'i02', email: 'btnguyen1505@gmail.com',   full_name: 'Bùi Thảo Nguyên',    phone: '', base_functional_group: 'PR & Communication',  system_role: 'Assistant' },
  { id: 'i03', email: 'hctien.ng@gmail.com',      full_name: 'Nguyễn Hà Cẩm Tiên', phone: '', base_functional_group: 'PR & Communication',  system_role: 'Assistant' },
  { id: 'i04', email: 'luongthithuyan476@gmail.com', full_name: 'Lương Thị Thuý An', phone: '', base_functional_group: 'PR & Communication', system_role: 'Assistant' },
  { id: 'i07', email: 'thiennguyen.31231021200@st.ueh.edu.vn', full_name: 'Nguyễn Ngọc Thiện',    phone: '', base_functional_group: 'Nghiên cứu Khoa học', system_role: 'Assistant' },
  { id: 'i09', email: 'thunguyen.31241022253@st.ueh.edu.vn',   full_name: 'Nguyễn Lương Minh Thư', phone: '', base_functional_group: 'Nghiên cứu Khoa học', system_role: 'Assistant' },
  { id: 'i10', email: 'htttiendat@gmail.com',     full_name: 'Hoàng Trương Tiến Đạt', phone: '', base_functional_group: 'Nghiên cứu Khoa học', system_role: 'Assistant' },
  { id: 'i11', email: 'anphu.fw@gmail.com',       full_name: 'Ngô An Phú',         phone: '', base_functional_group: 'Nghiên cứu Khoa học', system_role: 'Assistant' },
];

export const projects = [
  {
    id: 'a1111111-1111-1111-1111-111111111111',
    project_code: 'HCMC-ATLAS-26',
    project_name: 'HCMC Walkability Atlas',
    description: '2SFCA accessibility modelling of pedestrian infrastructure across District 1 & 3.',
    location: 'HCMC',
    status: 'In Progress',
    created_at: '2026-03-12',
    center: [10.7769, 106.7009],
    sdg_tags: [3, 11, 13],
    phases: [
      { phase_name: 'Field Survey', start_date: '2026-03-15', end_date: '2026-05-30', is_current: false },
      { phase_name: '2SFCA Analysis', start_date: '2026-06-01', end_date: '2026-08-15', is_current: true },
      { phase_name: 'Atlas Design', start_date: '2026-08-16', end_date: '2026-10-30', is_current: false },
    ],
  },
  {
    id: 'a2222222-2222-2222-2222-222222222222',
    project_code: 'NT-NIGHT-26',
    project_name: 'Nha Trang Night Economy Mapping',
    description: 'Spatio-temporal survey of night-time commercial activity along the coastal strip.',
    location: 'Nha Trang',
    status: 'Review',
    created_at: '2026-01-28',
    center: [12.2388, 109.1967],
    sdg_tags: [8, 11, 17],
    phases: [
      { phase_name: 'Night Surveys', start_date: '2026-02-01', end_date: '2026-05-15', is_current: false },
      { phase_name: 'KDE Modelling', start_date: '2026-05-16', end_date: '2026-06-30', is_current: false },
      { phase_name: 'Peer Review', start_date: '2026-07-01', end_date: '2026-07-31', is_current: true },
    ],
  },
  {
    id: 'a3333333-3333-3333-3333-333333333333',
    project_code: 'HUE-HERIT-25',
    project_name: 'Hue Heritage Buffer Zones',
    description: 'GIS delineation of UNESCO heritage protection buffers for the Citadel complex.',
    location: 'Hue',
    status: 'Completed',
    created_at: '2025-11-04',
    center: [16.4674, 107.5905],
    sdg_tags: [11, 17],
    phases: [
      { phase_name: 'GIS Delineation', start_date: '2025-11-10', end_date: '2026-02-28', is_current: false },
      { phase_name: 'Final Handover', start_date: '2026-03-01', end_date: '2026-03-31', is_current: false },
    ],
  },
];

// Matrix organization (ERP Gien): same user, different contextual role per
// workspace. is_cross_line = Director-approved assignment outside base group.
export const projectMembers = [
  { project_id: 'a1111111-1111-1111-1111-111111111111', user_id: 'u-tuanh', project_role: 'Host', is_cross_line: false },
  { project_id: 'a1111111-1111-1111-1111-111111111111', user_id: 'u-lan', project_role: 'Lead', is_cross_line: false },
  { project_id: 'a1111111-1111-1111-1111-111111111111', user_id: 'u-hai', project_role: 'Coordinator', is_cross_line: true },
  { project_id: 'a1111111-1111-1111-1111-111111111111', user_id: 'u-hoai', project_role: 'Member', is_cross_line: false },
  { project_id: 'a1111111-1111-1111-1111-111111111111', user_id: 'u-tram', project_role: 'Manager', is_cross_line: true },
  { project_id: 'a2222222-2222-2222-2222-222222222222', user_id: 'u-khang', project_role: 'Lead', is_cross_line: false },
  { project_id: 'a2222222-2222-2222-2222-222222222222', user_id: 'u-quang', project_role: 'Manager', is_cross_line: false },
  { project_id: 'a2222222-2222-2222-2222-222222222222', user_id: 'u-tai', project_role: 'Member', is_cross_line: true },
  { project_id: 'a3333333-3333-3333-3333-333333333333', user_id: 'u-lan', project_role: 'Host', is_cross_line: false },
  { project_id: 'a3333333-3333-3333-3333-333333333333', user_id: 'u-tram', project_role: 'Coordinator', is_cross_line: true },
];

// CRM Gien — multi-layer stakeholder network per workspace
export const partners = [
  { id: 'pt1', project_id: 'a1111111-1111-1111-1111-111111111111', partner_name: 'Sở Quy hoạch – Kiến trúc TP.HCM', partner_type: 'Authority', contact_person: 'Ông Trần Văn Bình — Phòng Hạ tầng', details: 'Data-sharing MOU signed 03/2026; sidewalk inventory access.' },
  { id: 'pt2', project_id: 'a1111111-1111-1111-1111-111111111111', partner_name: 'Grab Vietnam', partner_type: 'Industry', contact_person: 'Ms. Đỗ Hải Yến — GrabMaps Partnerships', details: 'Anonymized trip heatmaps for accessibility calibration.' },
  { id: 'pt3', project_id: 'a1111111-1111-1111-1111-111111111111', partner_name: 'Politecnico di Milano — DAStU', partner_type: 'Academia', contact_person: 'Prof. L. Rossi', details: 'Joint Q1 publication on 2SFCA methodology.' },
  { id: 'pt4', project_id: 'a2222222-2222-2222-2222-222222222222', partner_name: 'UBND TP. Nha Trang', partner_type: 'Authority', contact_person: 'Bà Nguyễn Thị Hòa — Văn phòng UBND', details: 'Night-market licensing dataset & survey permits.' },
  { id: 'pt5', project_id: 'a2222222-2222-2222-2222-222222222222', partner_name: 'Hochschule Worms', partner_type: 'Academia', contact_person: 'Prof. K. Weber', details: 'Comparative night-economy framework, RTD 2026 panel.' },
  { id: 'pt6', project_id: 'a3333333-3333-3333-3333-333333333333', partner_name: 'Trung tâm Bảo tồn Di tích Cố đô Huế', partner_type: 'Authority', contact_person: 'Ông Lê Minh Đức', details: 'Heritage buffer validation & UNESCO reporting.' },
];

// Kho Biểu mẫu Chuẩn — global standardized templates & brand assets (KMS Gien)
export const templates = [
  { id: 'e1111111-1111-1111-1111-111111111111', asset_name: 'Biểu mẫu Đề xuất Dự án.docx', asset_type: 'Template', file_extension: '.docx', storage_url: '#', category: 'Biểu mẫu hành chính', version: 3, file_size_kb: 210 },
  { id: 'e2222222-2222-2222-2222-222222222222', asset_name: 'Bảng Quyết toán Kinh phí SO-TCKT.xlsx', asset_type: 'Template', file_extension: '.xlsx', storage_url: '#', category: 'Biểu mẫu hành chính', version: 5, file_size_kb: 180 },
  { id: 'e3333333-3333-3333-3333-333333333333', asset_name: 'Biên bản Họp chuẩn ISCM.docx', asset_type: 'Template', file_extension: '.docx', storage_url: '#', category: 'Biểu mẫu hành chính', version: 2, file_size_kb: 95 },
  { id: 'e4444444-4444-4444-4444-444444444444', asset_name: 'ISCM Corporate Slide Deck 2026.pptx', asset_type: 'Template', file_extension: '.pptx', storage_url: '#', category: 'Brand assets', version: 4, file_size_kb: 8600 },
  { id: 'e5555555-5555-5555-5555-555555555555', asset_name: 'ISCM Official Logo Pack.zip', asset_type: 'Template', file_extension: '.zip', storage_url: '#', category: 'Brand assets', version: 2, file_size_kb: 12400 },
  { id: 'e6666666-6666-6666-6666-666666666666', asset_name: 'ISCM Institutional Profile 2026.pdf', asset_type: 'Report', file_extension: '.pdf', storage_url: '#', category: 'Brand assets', version: 1, file_size_kb: 5200 },
];

export const assets = [
  // p1 — HCMC Walkability Atlas
  { id: 'd1111111-1111-1111-1111-111111111111', project_id: 'a1111111-1111-1111-1111-111111111111', asset_name: 'Fieldwork Protocol D1.docx',    asset_type: 'Document',    file_extension: '.docx',    storage_url: '#', uploaded_by: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', security_level: 'Internal Open', file_size_kb: 842,  created_at: '2026-06-28', version: 3 },
  { id: 'd2222222-2222-2222-2222-222222222222', project_id: 'a1111111-1111-1111-1111-111111111111', asset_name: 'Sidewalk Audit Sheet.xlsx',     asset_type: 'Document',    file_extension: '.xlsx',    storage_url: '#', uploaded_by: '77777777-7777-7777-7777-777777777777', security_level: 'Draft',         file_size_kb: 305,  created_at: '2026-06-30', version: 1 },
  { id: 'd3333333-3333-3333-3333-333333333333', project_id: 'a1111111-1111-1111-1111-111111111111', asset_name: 'Q2 Progress Report.pdf',        asset_type: 'Report',      file_extension: '.pdf',     storage_url: '#', uploaded_by: '99999999-9999-9999-9999-999999999999', security_level: 'Confidential',  file_size_kb: 1920, created_at: '2026-07-01', version: 2 },
  { id: 'd4444444-4444-4444-4444-444444444444', project_id: 'a1111111-1111-1111-1111-111111111111', asset_name: 'Atlas Stakeholder Briefing.pptx', asset_type: 'Document', file_extension: '.pptx',    storage_url: '#', uploaded_by: '99999999-9999-9999-9999-999999999999', security_level: 'Draft',         file_size_kb: 6400, created_at: '2026-07-02', version: 2 },
  { id: 'd5555555-5555-5555-5555-555555555555', project_id: 'a1111111-1111-1111-1111-111111111111', asset_name: '2SFCA_script.py',               asset_type: 'Source Code', file_extension: '.py',      storage_url: '#', uploaded_by: '88888888-8888-8888-8888-888888888888', security_level: 'Internal Open', file_size_kb: 44,   created_at: '2026-07-02' },
  { id: 'd6666666-6666-6666-6666-666666666666', project_id: 'a1111111-1111-1111-1111-111111111111', asset_name: 'network-analysis.ipynb',        asset_type: 'Source Code', file_extension: '.ipynb',   storage_url: '#', uploaded_by: '77777777-7777-7777-7777-777777777777', security_level: 'Draft',         file_size_kb: 512,  created_at: '2026-06-25' },
  { id: 'd7777777-7777-7777-7777-777777777777', project_id: 'a1111111-1111-1111-1111-111111111111', asset_name: 'walkability-atlas (GitHub)',    asset_type: 'Hyperlink',   file_extension: 'url',      storage_url: 'https://github.com/iscm-ueh/walkability-atlas', uploaded_by: '88888888-8888-8888-8888-888888888888', security_level: 'Internal Open', created_at: '2026-06-20' },
  { id: 'd8888888-8888-8888-8888-888888888888', project_id: 'a1111111-1111-1111-1111-111111111111', asset_name: 'Atlas UI Board (Figma)',        asset_type: 'Hyperlink',   file_extension: 'url',      storage_url: 'https://figma.com/file/atlas-ui', uploaded_by: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', security_level: 'Draft', created_at: '2026-06-18' },
  { id: 'd9999999-9999-9999-9999-999999999999', project_id: 'a2222222-2222-2222-2222-222222222222', asset_name: 'Vendor Survey Form.docx',       asset_type: 'Document',    file_extension: '.docx',    storage_url: '#', uploaded_by: '88888888-8888-8888-8888-888888888888', security_level: 'Internal Open', file_size_kb: 610,  created_at: '2026-06-15', version: 4 },
  { id: 'daaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', project_id: 'a2222222-2222-2222-2222-222222222222', asset_name: 'Night Footfall Data.xlsx',      asset_type: 'Document',    file_extension: '.xlsx',    storage_url: '#', uploaded_by: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', security_level: 'Confidential',  file_size_kb: 3400, created_at: '2026-06-22', version: 2 },
  { id: 'dbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', project_id: 'a2222222-2222-2222-2222-222222222222', asset_name: 'heatmap_kde.py',                asset_type: 'Source Code', file_extension: '.py',      storage_url: '#', uploaded_by: '88888888-8888-8888-8888-888888888888', security_level: 'Internal Open', file_size_kb: 38,   created_at: '2026-06-27' },
  { id: 'dccccccc-cccc-cccc-cccc-cccccccccccc', project_id: 'a2222222-2222-2222-2222-222222222222', asset_name: 'Survey Route Board (Miro)',     asset_type: 'Hyperlink',   file_extension: 'url',      storage_url: 'https://miro.com/app/board/night-routes', uploaded_by: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', security_level: 'Internal Open', created_at: '2026-06-10' },
  { id: 'dddddddd-dddd-dddd-dddd-dddddddddddd', project_id: 'a3333333-3333-3333-3333-333333333333', asset_name: 'Buffer Methodology.pdf',        asset_type: 'Report',      file_extension: '.pdf',     storage_url: '#', uploaded_by: '99999999-9999-9999-9999-999999999999', security_level: 'Internal Open', file_size_kb: 2100, created_at: '2025-12-12', version: 1 },
];

export const tasks = [
  { id: 't1', project_id: 'a1111111-1111-1111-1111-111111111111', title: 'Digitize D3 sidewalk network',      column_key: 'todo',        assignee_id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', due_date: '2026-07-18' },
  { id: 't2', project_id: 'a1111111-1111-1111-1111-111111111111', title: 'Clean POI dataset (OSM + field)',   column_key: 'todo',        assignee_id: '77777777-7777-7777-7777-777777777777', due_date: '2026-07-25' },
  { id: 't3', project_id: 'a1111111-1111-1111-1111-111111111111', title: 'Run 2SFCA baseline scenario',       column_key: 'in_progress', assignee_id: '88888888-8888-8888-8888-888888888888', due_date: '2026-07-10' },
  { id: 't4', project_id: 'a1111111-1111-1111-1111-111111111111', title: 'Draft cartographic style guide',    column_key: 'in_progress', assignee_id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', due_date: '2026-07-15' },
  { id: 't5', project_id: 'a1111111-1111-1111-1111-111111111111', title: 'Validate walking-speed parameters', column_key: 'review',      assignee_id: '99999999-9999-9999-9999-999999999999', due_date: '2026-07-08' },
  { id: 't6', project_id: 'a1111111-1111-1111-1111-111111111111', title: 'District 1 field audit',            column_key: 'done',        assignee_id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', due_date: '2026-06-20' },
  { id: 't7', project_id: 'a2222222-2222-2222-2222-222222222222', title: 'Night vendor interviews — week 4',  column_key: 'in_progress', assignee_id: '88888888-8888-8888-8888-888888888888', due_date: '2026-07-12' },
  { id: 't8', project_id: 'a2222222-2222-2222-2222-222222222222', title: 'KDE heatmap of venue density',      column_key: 'review',      assignee_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', due_date: '2026-07-09' },
  { id: 't9', project_id: 'a2222222-2222-2222-2222-222222222222', title: 'Coastal strip base map',            column_key: 'done',        assignee_id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', due_date: '2026-06-15' },
  { id: 't10', project_id: 'a3333333-3333-3333-3333-333333333333', title: 'Final report handover',            column_key: 'done',        assignee_id: '99999999-9999-9999-9999-999999999999', due_date: '2026-03-25' },
];

export const activityFeed = [
  { id: 'f1', actor_id: '88888888-8888-8888-8888-888888888888', project_id: 'a1111111-1111-1111-1111-111111111111', verb: 'uploaded',          object_ref: '2SFCA_script.py',        created_at: '2026-07-02T14:32:00' },
  { id: 'f2', actor_id: '99999999-9999-9999-9999-999999999999', project_id: 'a1111111-1111-1111-1111-111111111111', verb: 'approved stage',    object_ref: 'Data Collection → Analysis', created_at: '2026-07-02T09:10:00' },
  { id: 'f3', actor_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', project_id: 'a2222222-2222-2222-2222-222222222222', verb: 'moved to Review',   object_ref: 'KDE heatmap of venue density', created_at: '2026-07-01T18:45:00' },
  { id: 'f4', actor_id: '77777777-7777-7777-7777-777777777777', project_id: 'a1111111-1111-1111-1111-111111111111', verb: 'uploaded',          object_ref: 'Sidewalk Audit Sheet.xlsx', created_at: '2026-06-30T11:20:00' },
  { id: 'f5', actor_id: '11111111-1111-1111-1111-111111111111', project_id: 'a2222222-2222-2222-2222-222222222222', verb: 'assigned member',   object_ref: 'Lại Phương Dung (cross-line)', created_at: '2026-06-29T16:05:00' },
  { id: 'f6', actor_id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', project_id: 'a1111111-1111-1111-1111-111111111111', verb: 'uploaded',          object_ref: 'd1_sidewalks.geojson',   created_at: '2026-06-29T10:50:00' },
];

/* Official UN SDG palette (subset used by ISCM research lines) */
export const SDG_COLORS = {
  3: '#4C9F38', 8: '#A21942', 9: '#FD6925', 11: '#FD9D24', 13: '#3F7E44', 17: '#19486A',
};

/* Convenience lookups */
export const userById = Object.fromEntries(users.map((u) => [u.id, u]));
export const projectById = Object.fromEntries(projects.map((p) => [p.id, p]));

export const LOCATION_CENTERS = {
  'Nha Trang': [12.2388, 109.1967],
  HCMC: [10.7769, 106.7009],
  Hue: [16.4674, 107.5905],
};

/* Vietnamese status tags shown on the workspace Focus Card (public-site style) */
export const STATUS_TAGS_VI = {
  'In Progress': '[ĐANG DIỄN RA]',
  Review: '[ĐANG THẨM ĐỊNH]',
  Completed: '[ĐÃ HOÀN THÀNH]',
};

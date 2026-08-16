export const NAVIGATION_LOCALIZATION = {
  vi: {
    // Top Navbar
    WORKSPACE: 'Không Gian Làm Việc',
    MY_WORKSPACE: 'Không gian của tôi',
    MY_WORKSPACE_DESC: '',
    HR_MANAGEMENT: 'Quản lý nhân sự',
    PROJECT_MANAGEMENT: 'Quản lý Dự án',
    APPROVAL_WORKFLOW: 'Trình ký và phê duyệt',
    ISCM_CORE: 'ISCM CORE',

    GROUP_MANAGEMENT: 'QUẢN LÝ KHỐI CHỨC NĂNG',
    OP_FINANCE: 'Vận hành & Tài chính',
    ACADEMIA: 'Học thuật & Đào tạo',
    RESEARCH: 'Nghiên cứu khoa học & Dự án',
    COMMUNITY: 'Gắn kết cộng đồng',
    PARTNERSHIP: 'Hợp tác chiến lược',

    DATA_MANAGEMENT: 'QUẢN LÝ DỮ LIỆU',
    DATA_CATALOG: 'Tổng kho dữ liệu',
    REGISTER_DATASET: 'Đăng ký dữ liệu',

    ISCM_OVERVIEW: 'TỔNG QUAN ISCM',
    ISCM_ORGANIZATION: 'Cơ cấu tổ chức ISCM',

    // Profile Trigger & General
    USER_ADMIN: 'Admin',
    USER_PORTAL: 'Hồ sơ của tôi',
    USER_OF: 'Vận hành & Tài chính',
    LOGOUT: 'Đăng xuất',
    SIGN_IN_GOOGLE: 'Đăng nhập bằng Google',
    LANGUAGE_LABEL: 'Vi',

    // Workspace Calendar Panel
    WORKSPACE_HEADER: 'KHÔNG GIAN LÀM VIỆC CỦA TÔI',
    WORKSPACE_SUBHEADER: 'Lịch làm việc & Sự kiện — Đồng bộ Google Calendar · Outlook',
    FULL_CALENDAR: 'Mở lịch đầy đủ',
    UPCOMING_EVENTS: 'Sắp Diễn Ra',
    WEEKLY_SCHEDULE: 'Lịch tuần này',
    SCHEDULE_DETAILS: 'Chi tiết lịch hôm nay',
    NO_EVENTS: 'Không có sự kiện nào hôm nay.',
    SYNC_SUCCESS: 'Đồng bộ thành công · 3 phút trước',
    MY_TASKS_WIDGET: 'Nhiệm vụ',
    PENDING_APPROVALS: 'Hồ sơ đang chờ phê duyệt',
    MY_REQUESTS_WIDGET: 'Đơn từ gửi đi',
    MY_ASSETS_WIDGET: 'Thiết bị đang mượn',
    MY_ASSIGNED_TASKS_WIDGET: 'Nhiệm vụ được giao',
    VIEW_QUEUE: 'Mở luồng phê duyệt',
    TRACK_STATUS: 'Theo dõi tiến độ',
    OPEN_TASKS: 'đang chờ',
    PENDING_FORMS: 'chưa duyệt',
    ASSETS_COUNT: 'thiết bị',
    PERMANENT: 'Trọn đời',
    DUE: 'Hạn trả',

    // Right Viewport details
    BIO_TITLE: 'Hồ sơ & Tiểu sử',
    BIO_SUB: 'Cổng tác nghiệp cá nhân · Hệ thống Smart Office',
    BIO_NAME_LABEL: 'Họ và tên',
    BIO_ROLE_LABEL: 'Vai trò hệ thống',
    BIO_NCKH_LABEL: 'Số lượng tham gia đề tài',
    ATTENDANCE_TITLE: 'Chấm công hàng ngày',
    ASSETS_TITLE: 'Tài sản & Thiết bị đang mượn',
    TASKS_TITLE: 'Nhiệm vụ chờ phê duyệt',
    FORMS_TITLE: 'Trạng thái đơn từ',
    FORM_PORTAL_TITLE: 'Cổng biểu mẫu điện tử',
    WIKI_PORTAL_TITLE: 'Cơ sở tri thức dùng chung',

    // Sidebar Tree Structure
    SIDEBAR_TREE: [
      {
        id: 'my-portal',
        label: 'HỒ SƠ CỦA TÔI',
        children: [
          { key: 'profile-bio', label: 'Hồ sơ & Tiểu sử khoa học' },
          { key: 'ws-calendar', label: 'Lịch cá nhân' },
          { key: 'attendance-log', label: 'Chấm công hàng ngày' },
          { key: 'my-events', label: 'Sự kiện của tôi' },
          {
            id: 'monitoring-status',
            label: 'THEO DÕI LUỒNG PHÊ DUYỆT',
            children: [
              { key: 'my-tasks', label: 'Hồ sơ đang chờ phê duyệt' },
              { key: 'my-forms', label: 'Nhật ký theo dõi tiến độ đơn từ' }
            ]
          },
          { key: 'my-assets', label: 'Tài sản & Thiết bị đang mượn' }
        ]
      },
      {
        id: 'admin',
        label: 'ADMIN',
        adminOnly: true,
        children: [
          { key: 'admin-access-requests', label: 'Yêu cầu truy cập' },
          { key: 'admin-content-permissions', label: 'Phân quyền quản trị nội dung' },
          { key: 'admin-attendance', label: 'Chấm công toàn viện' },
          { key: 'admin-events', label: 'Quản lý sự kiện' },
          { key: 'admin-calendar', label: 'Lịch toàn viện' },
          { key: 'admin-library', label: 'Quản trị thư viện' }
        ]
      },
      {
        id: 'operation-finance',
        label: 'VẬN HÀNH & TÀI CHÍNH (O&F)',
        children: [
      {
        id: 'requests-forms',
        label: 'BIỂU MẪU ĐIỆN TỬ (E-FORMS)',
        children: [
          {
            id: 'ef-equipment',
            label: 'Thiết bị & Tài nguyên',
            children: [
              { key: 'form:order-equipment', label: 'Đăng ký mượn thiết bị phòng Lab' },
              { key: 'form:order-book', label: 'Yêu cầu mượn sách/Tài liệu khoa học' },
              { key: 'form:order-gift', label: 'Đăng ký cấp phát quà tặng đối ngoại' }
            ]
          },
          {
            id: 'ef-comms-tech',
            label: 'Truyền thông & Công nghệ',
            children: [
              { key: 'form:order-support-comm', label: 'Đăng ký post bài truyền thông' },
              { key: 'form:technology-request', label: 'Yêu cầu Phát triển/Cải thiện nền tảng số' }
            ]
          },
          {
            id: 'ef-internal-admin',
            label: 'Hành chính Nội bộ',
            children: [
              { key: 'form:training-point-proposal', label: 'Đề nghị Cộng điểm Rèn luyện' },
              { key: 'form:quarterly-performance-evaluation', label: 'Đánh giá hiệu suất theo quý' },
              { key: 'form:team-evaluation', label: 'Đánh giá nhóm' }
            ]
          }
        ]
      },
      {
        id: 'wiki-hub-root',
        label: 'TÀI NGUYÊN',
        children: [
          { key: 'wiki-guidelines-branch', label: 'Hướng dẫn' },
          { key: 'wiki-policies-branch', label: 'Chính sách & Quy định' },
          { key: 'wiki-official-branch', label: 'Văn bản chính thức' },
          { key: 'wiki-templates-branch', label: 'Văn bản mẫu' },
          { key: 'wiki-reference-branch', label: 'Danh mục & Danh bạ' },
          { key: 'wiki-media-branch', label: 'Tư liệu' }
        ]
      }
        ]
      },
      {
        id: 'academia',
        label: 'HỌC THUẬT & ĐÀO TẠO (ACADEMIA)',
        children: [
          {
            id: 'academia-teaching',
            label: 'GIẢNG DẠY',
            children: [
              { key: 'my-teaching-schedule', label: 'Lịch dạy của tôi' },
              { key: 'institute-teaching-schedule', label: 'Lịch dạy toàn viện' },
              { key: 'teaching-assignments', label: 'Phân công giảng dạy' }
            ]
          },
          {
            id: 'academia-resources-root',
            label: 'TÀI NGUYÊN',
            children: [
              { key: 'academia-guidelines-branch', label: 'Hướng dẫn' },
              { key: 'academia-policies-branch', label: 'Chính sách & Quy định' },
              { key: 'academia-official-branch', label: 'Văn bản chính thức' },
              { key: 'academia-templates-branch', label: 'Văn bản mẫu' }
            ]
          }
        ]
      },
      {
        id: 'partnership',
        label: 'ĐỐI NGOẠI (PARTNERSHIP)',
        children: [
          {
            id: 'partnership-partners',
            label: 'ĐỐI TÁC',
            children: [
              { key: 'individual-stakeholders', label: 'Đối tác cá nhân' },
              { key: 'institutional-partners', label: 'Đối tác tổ chức' }
            ]
          },
          {
            id: 'partnership-agreements',
            label: 'THOẢ THUẬN HỢP TÁC',
            children: [
              { key: 'active-mous', label: 'MOU đang hiệu lực' }
            ]
          },
          {
            id: 'partnership-resources-root',
            label: 'TÀI NGUYÊN',
            children: [
              { key: 'partnership-guidelines-branch', label: 'Hướng dẫn' },
              { key: 'partnership-templates-branch', label: 'Văn bản mẫu' }
            ]
          }
        ]
      }
    ],
    ISCM_CORE_TREE: [
      {
        id: 'iscm-core-root',
        label: 'ISCM CORE',
        children: [
          { key: 'core-pipeline', label: 'Sơ đồ luồng dữ liệu' },
          { key: 'core-dashboard', label: 'Tổng kho dữ liệu' },
          { key: 'core-policy', label: 'Chính sách bảo mật thông tin' }
        ]
      }
    ]
  },
  en: {
    // Top Navbar
    WORKSPACE: 'WORKSPACE',
    MY_WORKSPACE: 'My Workspace',
    MY_WORKSPACE_DESC: '',
    HR_MANAGEMENT: 'Human Resource Management',
    PROJECT_MANAGEMENT: 'Project Management',
    APPROVAL_WORKFLOW: 'Approval Workflow',
    ISCM_CORE: 'ISCM CORE',

    GROUP_MANAGEMENT: 'GROUP MANAGEMENT',
    OP_FINANCE: 'Operation & Finance',
    ACADEMIA: 'Academia',
    RESEARCH: 'Research',
    COMMUNITY: 'Community Engagement',
    PARTNERSHIP: 'Partnership',

    DATA_MANAGEMENT: 'DATA MANAGEMENT',
    DATA_CATALOG: 'Data Catalog',
    REGISTER_DATASET: 'Register Dataset',

    ISCM_OVERVIEW: 'ISCM OVERVIEW',
    ISCM_ORGANIZATION: 'ISCM Organizational Structure',

    // Profile Trigger & General
    USER_ADMIN: 'ADMIN',
    USER_PORTAL: 'MY PORTAL',
    USER_OF: 'OPERATION & FINANCE',
    LOGOUT: 'Log Out',
    SIGN_IN_GOOGLE: 'Sign in with Google',
    LANGUAGE_LABEL: 'En',

    // Workspace Calendar Panel
    WORKSPACE_HEADER: 'MY WORKSPACE',
    WORKSPACE_SUBHEADER: 'Work schedule & Events — Sync with Google Calendar · Outlook',
    FULL_CALENDAR: 'Open Full Calendar',
    UPCOMING_EVENTS: 'Upcoming Events',
    WEEKLY_SCHEDULE: 'Weekly Schedule',
    SCHEDULE_DETAILS: 'Today\'s Schedule',
    NO_EVENTS: 'No events scheduled for today.',
    SYNC_SUCCESS: 'Synced successfully · 3 mins ago',
    MY_TASKS_WIDGET: 'My Tasks',
    PENDING_APPROVALS: 'Pending Approvals',
    MY_REQUESTS_WIDGET: 'My Requests',
    MY_ASSETS_WIDGET: 'My Assets',
    MY_ASSIGNED_TASKS_WIDGET: 'Assigned Tasks',
    VIEW_QUEUE: 'View Approval Queue',
    TRACK_STATUS: 'Track Request Status',
    OPEN_TASKS: 'open',
    PENDING_FORMS: 'pending',
    ASSETS_COUNT: 'items',
    PERMANENT: 'Permanent',
    DUE: 'Due',

    // Right Viewport details
    BIO_TITLE: 'Profile & Bio',
    BIO_SUB: 'Personal Operations Hub · Smart Office Systems',
    BIO_NAME_LABEL: 'Full Name',
    BIO_ROLE_LABEL: 'System Role',
    BIO_NCKH_LABEL: 'NCKH Joint Engagements',
    ATTENDANCE_TITLE: 'Daily Attendance',
    ASSETS_TITLE: 'My Assets',
    TASKS_TITLE: 'My Tasks',
    FORMS_TITLE: 'My Request Status',
    FORM_PORTAL_TITLE: 'Form Portal Dashboard',
    WIKI_PORTAL_TITLE: 'Knowledge Commons Dashboard',

    // Sidebar Tree Structure
    SIDEBAR_TREE: [
      {
        id: 'my-portal',
        label: 'MY PORTAL',
        children: [
          { key: 'profile-bio', label: 'Profile & Bio' },
          { key: 'ws-calendar', label: 'My Calendar' },
          { key: 'attendance-log', label: 'Daily Attendance' },
          { key: 'my-events', label: 'My Events' },
          {
            id: 'monitoring-status',
            label: 'APPROVAL FLOW TRACKING',
            children: [
              { key: 'my-tasks', label: 'Pending Approvals' },
              { key: 'my-forms', label: 'Request Status Log' }
            ]
          },
          { key: 'my-assets', label: 'My Assets Checked Out to Me' }
        ]
      },
      {
        id: 'admin',
        label: 'ADMIN',
        adminOnly: true,
        children: [
          { key: 'admin-access-requests', label: 'Access Requests' },
          { key: 'admin-content-permissions', label: 'Content Admin Permissions' },
          { key: 'admin-attendance', label: 'Institute Attendance' },
          { key: 'admin-events', label: 'Event Management' },
          { key: 'admin-calendar', label: 'Institute Calendar' },
          { key: 'admin-library', label: 'Library Admin' }
        ]
      },
      {
        id: 'operation-finance',
        label: 'OPERATION & FINANCE (O&F)',
        children: [
      {
        id: 'requests-forms',
        label: 'E-FORMS',
        children: [
          {
            id: 'ef-equipment',
            label: 'Equipment & Resources',
            children: [
              { key: 'form:order-equipment', label: 'Order Equipment Form' },
              { key: 'form:order-book', label: 'Order Book/Documents Form' },
              { key: 'form:order-gift', label: 'Order ISCM Gift' }
            ]
          },
          {
            id: 'ef-comms-tech',
            label: 'Communication & Technology',
            children: [
              { key: 'form:order-support-comm', label: 'Communication Posting Request' },
              { key: 'form:technology-request', label: 'Technology Request' }
            ]
          },
          {
            id: 'ef-internal-admin',
            label: 'Internal Administration',
            children: [
              { key: 'form:training-point-proposal', label: 'Training Point Proposal' },
              { key: 'form:quarterly-performance-evaluation', label: 'Quarterly Performance Evaluation' },
              { key: 'form:team-evaluation', label: 'Team Evaluation' }
            ]
          }
        ]
      },
      {
        id: 'wiki-hub-root',
        label: 'RESOURCES',
        children: [
          { key: 'wiki-guidelines-branch', label: 'Guidelines' },
          { key: 'wiki-policies-branch', label: 'Policies & Regulations' },
          { key: 'wiki-official-branch', label: 'Official Documents' },
          { key: 'wiki-templates-branch', label: 'Templates' },
          { key: 'wiki-reference-branch', label: 'Lists & Directories' },
          { key: 'wiki-media-branch', label: 'Materials' }
        ]
      }
        ]
      },
      {
        id: 'academia',
        label: 'ACADEMIA',
        children: [
          {
            id: 'academia-teaching',
            label: 'TEACHING',
            children: [
              { key: 'my-teaching-schedule', label: 'My Teaching Schedule' },
              { key: 'institute-teaching-schedule', label: 'Institute Teaching Schedule' },
              { key: 'teaching-assignments', label: 'Teaching Assignments' }
            ]
          },
          {
            id: 'academia-resources-root',
            label: 'RESOURCES',
            children: [
              { key: 'academia-guidelines-branch', label: 'Guidelines' },
              { key: 'academia-policies-branch', label: 'Policies & Regulations' },
              { key: 'academia-official-branch', label: 'Official Documents' },
              { key: 'academia-templates-branch', label: 'Templates' }
            ]
          }
        ]
      },
      {
        id: 'partnership',
        label: 'PARTNERSHIP',
        children: [
          {
            id: 'partnership-partners',
            label: 'PARTNERS',
            children: [
              { key: 'individual-stakeholders', label: 'Individual Stakeholders' },
              { key: 'institutional-partners', label: 'Institutional Partners' }
            ]
          },
          {
            id: 'partnership-agreements',
            label: 'AGREEMENTS',
            children: [
              { key: 'active-mous', label: 'Active MOUs' }
            ]
          },
          {
            id: 'partnership-resources-root',
            label: 'RESOURCES',
            children: [
              { key: 'partnership-guidelines-branch', label: 'Guidelines' },
              { key: 'partnership-templates-branch', label: 'Templates' }
            ]
          }
        ]
      }
    ],
    ISCM_CORE_TREE: [
      {
        id: 'iscm-core-root',
        label: 'ISCM CORE',
        children: [
          { key: 'core-pipeline', label: 'Data Pipeline Map' },
          { key: 'core-dashboard', label: 'Data Catalog Dashboard' },
          { key: 'core-policy', label: 'Information Security Policy' }
        ]
      }
    ]
  }
};

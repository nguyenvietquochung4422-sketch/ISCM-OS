/** ISCM OS — Translation dictionary (vi / en)
 *  Keys are logical identifiers used via t('key') throughout the app.
 *  Add new keys here; missing keys fall back to English, then to the raw key string.
 */
export const translations = {
  vi: {
    // --- NavBar ---
    'nav.myWorkspace':       'Không gian của tôi',
    'nav.executivePortal':   'Cổng điều hành',
    'nav.groupManagement':   'Quản lý nhóm',
    'nav.iscmOverview':      'Tổng quan ISCM',
    'nav.search':            'Tìm kiếm...',
    'nav.logout':            'Đăng xuất',

    // --- GroupManagement sub-items ---
    'nav.gm.opFinance':      'Vận hành & Tài chính',
    'nav.gm.academia':       'Học thuật',
    'nav.gm.research':       'Nghiên cứu khoa học',
    'nav.gm.community':      'Gắn kết cộng đồng',
    'nav.gm.prComms':        'Truyền thông & PR',
    'nav.gm.partnership':    'Hợp tác & Đối tác',

    // --- ISCM Overview sub-items ---
    'nav.io.strategy':       'Chiến lược & Kế hoạch ISCM',
    'nav.io.uehCtd':         'ISCM & UEH | ISCM & CTD',
    'nav.io.colab':          'ISCM & UEH Co-Lab',
    'nav.io.techHub':        'ISCM & Convergence Tech Hub',
    'nav.io.makerSpace':     'ISCM & MakerSpace',
    'nav.io.orgStructure':   'Cơ cấu tổ chức ISCM',
    'nav.io.evaluation':     'Đánh giá ISCM',

    // --- Executive Portal sub-items ---
    'nav.ep.dashboard':      'Bảng điều hành',
    'nav.ep.matrix':         'Phân công ma trận',
    'nav.ep.projects':       'Dự án phân tầng',
    'nav.ep.approvals':      'Trình ký & Phê duyệt',
    'nav.ep.equipment':      'Thiết bị & Tài sản',
    'nav.iscmCore':          'ISCM CORE',

    // --- Personal Dashboard categories ---
    'cat.myPortal':          'MY PORTAL',
    'cat.requests':          'YÊU CẦU & BIỂU MẪU',
    'cat.wiki':              'KHO TRI THỨC',
    'cat.contacts':          'DANH BẠ',
    'cat.supports':          'HỖ TRỢ',

    // --- Workspace hub ---
    'ws.greeting':           'Chào buổi sáng',
    'ws.pendingTasks':       'Công việc chờ',
    'ws.myForms':            'Biểu mẫu của tôi',
    'ws.punchIn':            'Điểm danh',
    'ws.todayEvents':        'Sự kiện hôm nay',
    'ws.viewAll':            'Xem tất cả →',
    'ws.viewCalendar':       'Xem lịch →',
    'ws.quickAccess':        'Truy cập nhanh',
    'ws.recentRequests':     'Yêu cầu gần đây',
    'ws.attendance':         'Điểm danh & Hiện diện',

    // --- Table common ---
    'tbl.status':            'Trạng thái',
    'tbl.date':              'Ngày',
    'tbl.type':              'Loại',
    'tbl.form':              'Biểu mẫu',
    'tbl.group':             'Nhóm',
    'tbl.submittedDate':     'Ngày gửi',
    'tbl.noData':            'Không có dữ liệu phù hợp.',

    // --- Research workspace ---
    'rw.title':              'Không gian Nghiên cứu Khoa học',
    'rw.subtitle':           'Quản trị & Kiểm soát hoạt động nghiên cứu khoa học',
    'rw.headOfResearch':     'Trưởng bộ phận Nghiên cứu',

    // --- Governance Regulations ---
    'gov.cr1.subtitle':      'Quy định vận hành & Nội quy làm việc nội bộ tại ISCM.',
    'gov.cr2.subtitle':      'Quy chế chi tiêu và quy trình thanh toán tài chính ISCM.',
    'gov.cr3.subtitle':      'Quy chế làm việc, hệ thống cuộc họp và lưu trữ biên bản ISCM.',
  },

  en: {
    // --- NavBar ---
    'nav.myWorkspace':       'My Workspace',
    'nav.executivePortal':   'Executive Portal',
    'nav.groupManagement':   'Group Management',
    'nav.iscmOverview':      'ISCM Overview',
    'nav.search':            'Search...',
    'nav.logout':            'Sign Out',

    // --- GroupManagement sub-items ---
    'nav.gm.opFinance':      'Operation & Finance',
    'nav.gm.academia':       'Academia',
    'nav.gm.research':       'Research',
    'nav.gm.community':      'Community Engagement',
    'nav.gm.prComms':        'PR & Communication',
    'nav.gm.partnership':    'Partnership',

    // --- ISCM Overview sub-items ---
    'nav.io.strategy':       'ISCM Strategy + Plan',
    'nav.io.uehCtd':         'ISCM & UEH | ISCM & CTD',
    'nav.io.colab':          'ISCM & UEH Co-Lab',
    'nav.io.techHub':        'ISCM & Convergence Tech Hub',
    'nav.io.makerSpace':     'ISCM & MakerSpace',
    'nav.io.orgStructure':   'ISCM Organizational Structure',
    'nav.io.evaluation':     'ISCM Evaluation',

    // --- Executive Portal sub-items ---
    'nav.ep.dashboard':      'Executive Dashboard',
    'nav.ep.matrix':         'Matrix Assigner',
    'nav.ep.projects':       'Hierarchical Projects',
    'nav.ep.approvals':      'Approvals & E-Sign',
    'nav.ep.equipment':      'Equipment & Assets',
    'nav.iscmCore':          'ISCM CORE',

    // --- Personal Dashboard categories ---
    'cat.myPortal':          'MY PORTAL',
    'cat.requests':          'REQUESTS & E-FORMS',
    'cat.wiki':              'WIKI HUB',
    'cat.contacts':          'CONTACTS',
    'cat.supports':          'SUPPORTS',

    // --- Workspace hub ---
    'ws.greeting':           'Good morning',
    'ws.pendingTasks':       'Pending Tasks',
    'ws.myForms':            'My Forms',
    'ws.punchIn':            'Punch-In',
    'ws.todayEvents':        "Today's Events",
    'ws.viewAll':            'View all →',
    'ws.viewCalendar':       'View calendar →',
    'ws.quickAccess':        'Quick Access',
    'ws.recentRequests':     'My Recent Requests',
    'ws.attendance':         'Attendance & Presence',

    // --- Table common ---
    'tbl.status':            'Status',
    'tbl.date':              'Date',
    'tbl.type':              'Type',
    'tbl.form':              'Form',
    'tbl.group':             'Group',
    'tbl.submittedDate':     'Submitted',
    'tbl.noData':            'No matching records.',

    // --- Research workspace ---
    'rw.title':              'Scientific Research Sub-Workspace',
    'rw.subtitle':           'Governance & Control of Research Activities',
    'rw.headOfResearch':     'Head of Research',

    // --- Governance Regulations ---
    'gov.cr1.subtitle':      'Internal working regulations at ISCM.',
    'gov.cr2.subtitle':      'Financial spending regulations & payment procedures.',
    'gov.cr3.subtitle':      'Meeting regulations, documentation & minutes system.',
  },
};

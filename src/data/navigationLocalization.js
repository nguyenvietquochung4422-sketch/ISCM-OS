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

    GROUP_MANAGEMENT: 'QUẢN LÝ KHỐI CHỨC NĂNG MA TRẬN',
    OP_FINANCE: 'Vận hành & Tài chính',
    ACADEMIA: 'Học thuật & Đào tạo',
    RESEARCH: 'Nghiên cứu khoa học & Dự án',
    COMMUNITY: 'Gắn kết cộng đồng',
    PARTNERSHIP: 'Hợp tác chiến lược',

    ISCM_OVERVIEW: 'TỔNG QUAN HỆ SINH THÁI ISCM',
    UEH_UNITS: 'UEH & Các đơn vị thành viên',
    ISCM_ORGANIZATION: 'Cơ cấu tổ chức ISCM',
    ISCM_UNITS: 'ISCM & Các đối tác ngoại khối',

    // Profile Trigger & General
    USER_PORTAL: 'Hồ sơ của tôi',
    USER_FORMS: 'Biểu mẫu',
    USER_WIKI: 'Tri thức dùng chung',
    USER_CONTACTS: 'Danh bạ',
    LOGOUT: 'Đăng xuất',
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
    CONTACT_OPS: 'Liên hệ Hỗ trợ',
    ATTENDANCE_TITLE: 'Chấm công hàng ngày',
    ASSETS_TITLE: 'Tài sản & Thiết bị đang mượn',
    TASKS_TITLE: 'Nhiệm vụ chờ phê duyệt',
    FORMS_TITLE: 'Trạng thái đơn từ',
    FORM_PORTAL_TITLE: 'Cổng biểu mẫu điện tử',
    WIKI_PORTAL_TITLE: 'Cơ sở tri thức dùng chung',
    CONTACTS_PORTAL_TITLE: 'Danh bạ thông tin toàn viện',

    // Sidebar Tree Structure
    SIDEBAR_TREE: [
      {
        id: 'my-portal',
        label: 'HỒ SƠ CỦA TÔI',
        children: [
          { key: 'profile-bio', label: 'Hồ sơ & Tiểu sử khoa học' },
          { key: 'attendance-log', label: 'Chấm công hàng ngày' },
          { key: 'form:payment-request', label: 'Quyết toán quỹ nội bộ Viện' },
          { key: 'my-assets', label: 'Tài sản & Thiết bị đang mượn' }
        ]
      },
      {
        id: 'requests-forms',
        label: 'HỆ THỐNG BIỂU MẪU ĐIỆN TỬ',
        children: [
          {
            id: 'hr-services',
            label: 'NHÂN SỰ & HÀNH CHÍNH',
            badge: 'HR',
            children: [
              { key: 'form:resignation', label: 'Đơn xin thôi việc' },
              { key: 'form:recruitment-request', label: 'Đề xuất tuyển dụng CTV/Thực tập sinh' },
              { key: 'form:training-register', label: 'Đăng ký đào tạo nội bộ' },
              { key: 'form:ask-anything', label: 'Câu hỏi hỗ trợ chung' },
              { key: 'form:wfh', label: 'Đăng ký làm việc tại nhà' },
              { key: 'form:leave', label: 'Đơn xin nghỉ phép' },
              { key: 'form:travel-auth', label: 'Cấp phép đi thực địa/Công tác' },
              { key: 'form:benefit-hr', label: 'Chế độ đãi ngộ' },
              { key: 'form:member-partner-info', label: 'Khai báo thành viên & Đối tác' },
              { key: 'form:team-eval', label: 'Đánh giá làm việc nhóm' },
              { key: 'form:quarterly-perf-eval', label: 'Đánh giá hiệu suất định kỳ theo Quý' }
            ]
          },
          {
            id: 'it-services',
            label: 'VẬN HÀNH SẢN PHẨM & THIẾT BỊ',
            badge: 'IT',
            children: [
              { key: 'form:purchase-permission', label: 'Xin chủ trương mua sắm công nghệ' },
              { key: 'form:order-equipment', label: 'Đăng ký mượn thiết bị phòng Lab' },
              { key: 'form:order-book', label: 'Yêu cầu mượn sách/Tài liệu khoa học' },
              { key: 'form:tech-request', label: 'Yêu cầu cải thiện nền tảng số' }
            ]
          },
          {
            id: 'fa-services',
            label: 'TÀI CHÍNH & KẾ TOÁN',
            badge: 'FA',
            children: [
              { key: 'form:payment-request', label: 'Yêu cầu chi trả/Thanh toán' },
              { key: 'form:expense-report', label: 'Báo cáo quyết toán hoàn ứng' }
            ]
          },
          {
            id: 'comms-services',
            label: 'TRUYỀN THÔNG & THIẾT KẾ',
            badge: 'IT',
            children: [
              { key: 'form:order-design', label: 'Đăng ký đặt hàng thiết kế' },
              { key: 'form:order-support-comm', label: 'Đăng ký hỗ trợ truyền thông' },
              { key: 'form:order-gift', label: 'Đăng ký cấp phát quà tặng đối ngoại' }
            ]
          },
          {
            id: 'rm-services',
            label: 'KHAI BÁO NGHIÊN CỨU KHOA HỌC',
            badge: 'RM',
            children: [
              { key: 'form:quarterly-research-reg', label: 'Đăng ký đề tài/Dự án mới' },
              { key: 'form:internal-seminar-reg', label: 'Đăng ký tham gia Internal Seminar' },
              { key: 'form:quarterly-progress-report', label: 'Khai báo tiến độ nghiên cứu định kỳ' },
              { key: 'form:fundraising-proposal-progress', label: 'Theo dõi tiến độ hồ sơ gọi Quỹ' },
              { key: 'form:publications-submission', label: 'Khai báo công bố khoa học quốc tế mới' }
            ]
          },
          {
            id: 'af-services',
            label: 'DỊCH VỤ QUẢN TRỊ CƠ SỞ',
            badge: 'AF',
            children: [
              { key: 'form:cctv-history', label: 'Xin trích xuất camera an ninh' },
              { key: 'form:annual-student-survey', label: 'Khảo sát sinh viên thường niên' },
              { key: 'form:student-pigeon-post', label: 'Hòm thư bồ câu số sinh viên' },
              { key: 'form:training-point-proposal', label: 'Đề nghị cộng điểm rèn luyện DRS' }
            ]
          },
          {
            id: 'monitoring-status',
            label: 'THEO DÕI LUỒNG PHÊ DUYỆT',
            children: [
              { key: 'my-tasks', label: 'Hồ sơ đang chờ phê duyệt' },
              { key: 'my-forms', label: 'Nhật ký theo dõi tiến độ đơn từ' }
            ]
          }
        ]
      },
      {
        id: 'wiki-hub-root',
        label: 'TRUNG TÂM TRI THỨC DÙNG CHUNG',
        children: [
          {
            id: 'wiki-guidelines-branch',
            label: 'Cẩm nang Hướng dẫn Thực hiện',
            children: [
              {
                id: 'wiki-of-g',
                label: 'Vận hành & Hành chính',
                children: [
                  { key: 'wiki-doc:Hướng dẫn sử dụng UEHer', label: 'Hướng dẫn sử dụng UEHer' },
                  { key: 'wiki-doc:Hồ sơ thanh toán', label: 'Hồ sơ thanh toán' },
                  { key: 'wiki-doc:Thể thức trình bày văn bản trình ký', label: 'Thể thức trình bày văn bản trình ký' },
                  { key: 'wiki-doc:Hướng dẫn giao việc trên Smart Office', label: 'Hướng dẫn giao việc trên Smart Office' },
                  { key: 'wiki-doc:Hướng dẫn thanh toán', label: 'Hướng dẫn thanh toán' },
                  { key: 'wiki-doc:Hướng dẫn hồ sơ nhân sự chương trình UEH100', label: 'Hướng dẫn hồ sơ nhân sự chương trình UEH100' }
                ]
              },
              {
                id: 'wiki-rp-g',
                label: 'Nghiên cứu & Đối ngoại',
                children: [
                  { key: 'wiki-doc:Hướng dẫn check đạo văn', label: 'Hướng dẫn check đạo văn' },
                  { key: 'wiki-doc:Hướng dẫn trích dẫn TLTK', label: 'Hướng dẫn trích dẫn TLTK' },
                  { key: 'wiki-doc:Quy trình ký MOU các cấp', label: 'Quy trình ký MOU các cấp' }
                ]
              },
              {
                id: 'wiki-ac-g',
                label: 'Đào tạo & Học thuật',
                children: [
                  { key: 'wiki-doc:Quy trình mở ngành/CTĐT UEH', label: 'Quy trình mở ngành/CTĐT UEH' },
                  { key: 'wiki-doc:Quy trình hồ sơ mở ngành/CTĐT ISCM', label: 'Quy trình hồ sơ mở ngành/CTĐT ISCM' }
                ]
              },
              {
                id: 'wiki-cm-g',
                label: 'Truyền thông & Sự kiện',
                children: [
                  { key: 'wiki-doc:Book khách sạn UEH', label: 'Book khách sạn UEH' },
                  { key: 'wiki-doc:Đăng ký cộng điểm rèn luyện DRS', label: 'Đăng ký cộng điểm rèn luyện DRS' },
                  { key: 'wiki-doc:Xin quà tặng UEH', label: 'Xin quà tặng UEH' },
                  { key: 'wiki-doc:QUY TRÌNH TỔ CHỨC SỰ KIỆN', label: 'QUY TRÌNH TỔ CHỨC SỰ KIỆN' }
                ]
              }
            ]
          },
          {
            id: 'wiki-regulations-branch',
            label: 'Quy chế / Nội quy bắt buộc',
            children: [
              {
                id: 'wiki-oh-r',
                label: 'Tổ chức & Nhân sự',
                children: [
                  { key: 'wiki-doc:Mô hình tổ chức và quản lý tại ISCM', label: 'Mô hình tổ chức và quản lý tại ISCM' },
                  { key: 'wiki-doc:[2026-01-01][ISCM-OD][Cơ cấu tổ chức và sơ đồ phân nhiệm ISCM].pdf', label: 'Cơ cấu tổ chức và sơ đồ phân nhiệm ISCM' },
                  { key: 'wiki-doc:QĐ bổ nhiệm CTD 2025-2030', label: 'QĐ bổ nhiệm CTD 2025-2030' },
                  { key: 'wiki-doc:QĐ thành lập UEH', label: 'QĐ thành lập UEH' },
                  { key: 'wiki-doc:QĐ thành lập ISCM', label: 'QĐ thành lập ISCM' },
                  { key: 'wiki-doc:Quy định chế độ làm việc giảng viên', label: 'Quy định chế độ làm việc giảng viên' },
                  { key: 'wiki-doc:Quy chế tuyển dụng viên chức', label: 'Quy chế tuyển dụng viên chức' },
                  { key: 'wiki-doc:Quy định chế độ trợ giảng', label: 'Quy định chế độ trợ giảng' },
                  { key: 'wiki-doc:Bảng phân công trách nhiệm tổng cục', label: 'Bảng phân công trách nhiệm tổng cục' },
                  { key: 'wiki-doc:Quy chế thành viên Viện', label: 'Quy chế thành viên Viện' }
                ]
              },
              {
                id: 'wiki-af-r',
                label: 'Quản lý Tài sản & Chi tiêu',
                children: [
                  { key: 'wiki-doc:QUY CHẾ CHI TIÊU NỘI BỘ 2026', label: 'QUY CHẾ CHI TIÊU NỘI BỘ 2026' },
                  { key: 'wiki-doc:Quy chế họp nội bộ', label: 'Quy chế họp nội bộ' },
                  { key: 'wiki-doc:Quy định mượn, sử dụng và bảo quản thiết bị', label: 'Quy định mượn, sử dụng và bảo quản thiết bị' },
                  { key: 'wiki-doc:Quy định Order Quà tặng ISCM', label: 'Quy định Order Quà tặng ISCM' },
                  { key: 'wiki-doc:Quy định Quản lý và Cung cấp Văn phòng phẩm', label: 'Quy định Quản lý và Cung cấp Văn phòng phẩm' }
                ]
              }
            ]
          },
          {
            id: 'wiki-policies-branch',
            label: 'Chính sách Chiến lược',
            children: [
              { key: 'wiki-doc:Quy trình đảm bảo tiêu chuẩn giảng dạy', label: 'Quy trình đảm bảo tiêu chuẩn giảng dạy' },
              { key: 'wiki-doc:Hệ thống văn bản mở ngành Bộ GDĐT & UEH', label: 'Hệ thống văn bản mở ngành Bộ GDĐT & UEH' },
              { key: 'wiki-doc:Hồ sơ mở ngành khung', label: 'Hồ sơ mở ngành khung' },
              { key: 'wiki-doc:Nền tảng chính sách Nghiên cứu Khoa học', label: 'Nền tảng chính sách Nghiên cứu Khoa học' }
            ]
          },
          {
            id: 'wiki-templates-branch',
            label: 'Tổng kho Văn bản mẫu',
            children: [
              { key: 'wiki-doc:LLKH thỉnh giảng', label: 'LLKH thỉnh giảng' },
              { key: 'wiki-doc:KPI giảng viên nước ngoài', label: 'KPI giảng viên nước ngoài' },
              { key: 'wiki-doc:Đăng ký mã số thuế', label: 'Đăng ký mã số thuế' },
              { key: 'wiki-doc:Đơn đề nghị tham dự hội thảo', label: 'Đơn đề nghị tham dự hội thảo' },
              { key: 'wiki-doc:Biểu mẫu báo cáo Hội nghị quốc tế', label: 'Biểu mẫu báo cáo Hội nghị quốc tế' },
              { key: 'wiki-doc:Đơn gia nhập công đoàn', label: 'Đơn gia nhập công đoàn' },
              { key: 'wiki-doc:Đơn cam kết thu nhập', label: 'Đơn cam kết thu nhập' },
              { key: 'wiki-doc:Biên bản cuộc họp mẫu', label: 'Biên bản cuộc họp mẫu' },
              { key: 'wiki-doc:Bộ hợp đồng thanh toán', label: 'Bộ hợp đồng thanh toán' },
              { key: 'wiki-doc:Kế hoạch tổ chức sự kiện nội bộ', label: 'Kế hoạch tổ chức sự kiện nội bộ' },
              { key: 'wiki-doc:Công văn giới thiệu khảo sát môn học', label: 'Công văn giới thiệu khảo sát môn học' },
              { key: 'wiki-doc:Đăng ký học ngoại khoá', label: 'Đăng ký học ngoại khoá' },
              { key: 'wiki-doc:Điều chỉnh điểm', label: 'Điều chỉnh điểm' },
              { key: 'wiki-doc:Đơn cam kết SV đi ngoại khoá', label: 'Đơn cam kết SV đi ngoại khoá' },
              { key: 'wiki-doc:Giấy giới thiệu SV đi thực tập', label: 'Giấy giới thiệu SV đi thực tập' },
              { key: 'wiki-doc:Xin giấy phép tổ chức hội thảo quốc tế', label: 'Xin giấy phép tổ chức hội thảo quốc tế' },
              { key: 'wiki-doc:Đăng ký ISBN', label: 'Đăng ký ISBN' },
              { key: 'wiki-doc:Đăng ký nhóm nghiên cứu UEH', label: 'Đăng ký nhóm nghiên cứu UEH' },
              { key: 'wiki-doc:Biên bản xác nhận tài trợ giáo dục', label: 'Biên bản xác nhận tài trợ giáo dục' },
              { key: 'wiki-doc:Invoice tài trợ đơn vị nước ngoài', label: 'Invoice tài trợ đơn vị nước ngoài' },
              { key: 'wiki-doc:Biểu mẫu MOUs', label: 'Biểu mẫu MOUs' },
              { key: 'wiki-doc:Thư mời chuyên gia', label: 'Thư mời chuyên gia' },
              { key: 'wiki-doc:Đề nghị xin quà tặng UEH', label: 'Đề nghị xin quà tặng UEH' },
              { key: 'wiki-doc:Kế hoạch tổ chức sự kiện', label: 'Kế hoạch tổ chức sự kiện' }
            ]
          },
          {
            id: 'wiki-media-branch',
            label: 'Ấn phẩm Thương hiệu',
            children: [
              { key: 'wiki-doc:Bộ nhận diện thương hiệu UEH', label: 'Bộ nhận diện thương hiệu UEH' },
              { key: 'wiki-doc:Khung biểu mẫu Office Kit', label: 'Khung biểu mẫu Office Kit' },
              { key: 'wiki-doc:Hồ sơ năng lực ISCM Portfolio', label: 'Hồ sơ năng lực ISCM Portfolio' },
              { key: 'wiki-doc:Slide giới thiệu tổng cục', label: 'Slide giới thiệu tổng cục' },
              { key: 'wiki-doc:Brochure giới thiệu ISCM', label: 'Brochure giới thiệu ISCM' },
              { key: 'wiki-doc:Brochure chuỗi sự kiện 2026', label: 'Brochure chuỗi sự kiện 2026' },
              { key: 'wiki-doc:Kho lưu trữ Hình ảnh & Video', label: 'Kho lưu trữ Hình ảnh & Video' }
            ]
          },
          {
            id: 'wiki-reference-branch',
            label: 'Hệ thống Danh mục Tra cứu',
            children: [
              { key: 'wiki-doc:Danh sách thành viên CTD', label: 'Danh sách thành viên CTD' },
              { key: 'wiki-doc:Bảng mô tả công việc', label: 'Bảng mô tả công việc' },
              { key: 'wiki-doc:Danh sách nhân sự & Giảng viên thỉnh giảng', label: 'Danh sách nhân sự & Giảng viên thỉnh giảng' },
              { key: 'wiki-doc:Thông tin mã số thuế & Nhà hàng', label: 'Thông tin mã số thuế & Nhà hàng' },
              { key: 'wiki-doc:Danh mục thiết bị & Công cụ phòng Lab', label: 'Danh mục thiết bị & Công cụ phòng Lab' },
              { key: 'wiki-doc:Hệ thống số văn bản nội bộ', label: 'Hệ thống số văn bản nội bộ' },
              { key: 'wiki-doc:Danh sách đối tác cá nhân', label: 'Danh sách đối tác cá nhân' },
              { key: 'wiki-doc:Danh sách đối tác doanh nghiệp', label: 'Danh sách đối tác doanh nghiệp' },
              { key: 'wiki-doc:Danh mục sách thư viện', label: 'Danh mục sách thư viện' },
              { key: 'wiki-doc:Tài khoản ORCiD thành viên', label: 'Tài khoản ORCiD thành viên' },
              { key: 'wiki-doc:Danh mục nộp xin tài trợ', label: 'Danh mục nộp xin tài trợ' },
              { key: 'wiki-doc:Tạp chí uy tín Urban Studies', label: 'Tạp chí uy tín Urban Studies' },
              { key: 'wiki-doc:Tạp chí được Hội đồng Giáo sư Nhà nước công nhận', label: 'Tạp chí được Hội đồng Giáo sư Nhà nước công nhận' }
            ]
          },
          { key: 'wiki-doc:Cẩm nang hội nhập nhân sự mới', label: 'Bắt đầu nhanh' }
        ]
      },
      {
        id: 'contacts-root',
        label: 'DANH BẠ THÔNG TIN TOÀN VIỆN',
        children: [
          { key: 'contacts-support', label: 'Liên hệ khẩn' },
          { key: 'contacts-departments', label: 'Cơ cấu phòng ban' },
          { key: 'contacts-colleagues', label: 'Danh bạ nhân sự' }
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

    ISCM_OVERVIEW: 'ISCM OVERVIEW',
    UEH_UNITS: 'UEH & Other Units',
    ISCM_ORGANIZATION: 'ISCM Organizational Structure',
    ISCM_UNITS: 'ISCM & Other Units',

    // Profile Trigger & General
    USER_PORTAL: 'MY PORTAL',
    USER_FORMS: 'REQUESTS & E-FORMS',
    USER_WIKI: 'WIKI HUB',
    USER_CONTACTS: 'CONTACTS',
    LOGOUT: 'Log Out',
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
    CONTACT_OPS: 'Contact Support',
    ATTENDANCE_TITLE: 'Daily Attendance',
    ASSETS_TITLE: 'My Assets',
    TASKS_TITLE: 'My Tasks',
    FORMS_TITLE: 'My Request Status',
    FORM_PORTAL_TITLE: 'Form Portal Dashboard',
    WIKI_PORTAL_TITLE: 'Knowledge Commons Dashboard',
    CONTACTS_PORTAL_TITLE: 'Directory Dashboard',

    // Sidebar Tree Structure
    SIDEBAR_TREE: [
      {
        id: 'my-portal',
        label: 'MY PORTAL',
        children: [
          { key: 'profile-bio', label: 'Profile & Bio' },
          { key: 'attendance-log', label: 'Daily Attendance' },
          { key: 'form:payment-request', label: 'ISCM Fund Claims' },
          { key: 'my-assets', label: 'My Assets Checked Out to Me' }
        ]
      },
      {
        id: 'requests-forms',
        label: 'REQUESTS & E-FORMS',
        children: [
          {
            id: 'hr-services',
            label: 'HUMAN RESOURCES & ADMIN',
            badge: 'HR',
            children: [
              { key: 'form:resignation', label: 'Resignation' },
              { key: 'form:recruitment-request', label: 'Recruitment request' },
              { key: 'form:training-register', label: 'Training register' },
              { key: 'form:ask-anything', label: 'Ask anything' },
              { key: 'form:wfh', label: 'Work from home' },
              { key: 'form:leave', label: 'Leave' },
              { key: 'form:travel-auth', label: 'Travel authorization' },
              { key: 'form:benefit-hr', label: 'Benefit and HR' },
              { key: 'form:member-partner-info', label: 'Member & Partner Information Form' },
              { key: 'form:team-eval', label: 'Team Evaluation Form' },
              { key: 'form:quarterly-perf-eval', label: 'Quarterly Performance Evaluation' }
            ]
          },
          {
            id: 'it-services',
            label: 'PRODUCT OPERATION & TECH',
            badge: 'IT',
            children: [
              { key: 'form:purchase-permission', label: 'Purchase permission' },
              { key: 'form:order-equipment', label: 'Order Equipment Form' },
              { key: 'form:order-book', label: 'Order Book/Documents Form' },
              { key: 'form:tech-request', label: 'Technology Request Form' }
            ]
          },
          {
            id: 'fa-services',
            label: 'FINANCE AND ACCOUNTING',
            badge: 'FA',
            children: [
              { key: 'form:payment-request', label: 'Payment request' },
              { key: 'form:expense-report', label: 'Expense report request' }
            ]
          },
          {
            id: 'comms-services',
            label: 'COMMUNICATION & ORDERS',
            badge: 'IT',
            children: [
              { key: 'form:order-design', label: 'Order Design' },
              { key: 'form:order-support-comm', label: 'Order Support Communication' },
              { key: 'form:order-gift', label: 'Order ISCM Gift' }
            ]
          },
          {
            id: 'rm-services',
            label: 'RESEARCH FORMS',
            badge: 'RM',
            children: [
              { key: 'form:quarterly-research-reg', label: 'Quarterly Research Registration' },
              { key: 'form:internal-seminar-reg', label: 'Internal Seminar Registration' },
              { key: 'form:quarterly-progress-report', label: 'Quarterly Progress Report' },
              { key: 'form:fundraising-proposal-progress', label: 'Fundraising Proposal Progress' },
              { key: 'form:publications-submission', label: 'Publications Submission Form' }
            ]
          },
          {
            id: 'af-services',
            label: 'ADMINISTRATION SERVICES',
            badge: 'AF',
            children: [
              { key: 'form:cctv-history', label: 'Check CCTV history' },
              { key: 'form:annual-student-survey', label: 'Annual Student Survey' },
              { key: 'form:student-pigeon-post', label: 'ISCM Student Pigeon Post' },
              { key: 'form:training-point-proposal', label: 'Training Point Proposal' }
            ]
          },
        ]
      },
      {
        id: 'wiki-hub-root',
        label: 'WIKI HUB',
        children: [
          {
            id: 'wiki-guidelines-branch',
            label: 'Guidelines',
            children: [
              {
                id: 'wiki-of-g',
                label: 'O&F',
                children: [
                  { key: 'wiki-doc:UEHer platform Guideline', label: 'UEHer platform Guideline' },
                  { key: 'wiki-doc:Payment Progress', label: 'Payment Progress' },
                  { key: 'wiki-doc:Document Format Guideline', label: 'Document Format Guideline' },
                  { key: 'wiki-doc:Task Assignment Guide', label: 'Task Assignment Guide' },
                  { key: 'wiki-doc:Guideline of Payment', label: 'Guideline of Payment' },
                  { key: 'wiki-doc:UEH100 HR Document Guide', label: 'UEH100 HR Document Guide' }
                ]
              },
              {
                id: 'wiki-rp-g',
                label: 'Research & Partner',
                children: [
                  { key: 'wiki-doc:Guideline on plagiarism check', label: 'Guideline on plagiarism check' },
                  { key: 'wiki-doc:Guideline on citation', label: 'Guideline on citation' },
                  { key: 'wiki-doc:MOU Signing Guideline', label: 'MOU Signing Guideline' }
                ]
              },
              {
                id: 'wiki-ac-g',
                label: 'Academia',
                children: [
                  { key: 'wiki-doc:Programme Opening Guideline', label: 'Programme Opening Guideline' },
                  { key: 'wiki-doc:Programme Opening Document Guideline', label: 'Programme Opening Document Guideline' }
                ]
              },
              {
                id: 'wiki-cm-g',
                label: 'Comms',
                children: [
                  { key: 'wiki-doc:Booking UEH hotel', label: 'Booking UEH hotel' },
                  { key: 'wiki-doc:DRS Training Point Guide', label: 'DRS Training Point Guide' },
                  { key: 'wiki-doc:UEH gift order', label: 'UEH gift order' },
                  { key: 'wiki-doc:Event Process Blueprint', label: 'Event Process Blueprint' }
                ]
              }
            ]
          },
          {
            id: 'wiki-regulations-branch',
            label: 'Regulations',
            children: [
              {
                id: 'wiki-oh-r',
                label: 'Org & HR',
                children: [
                  { key: 'wiki-doc:Organizational and Management Model', label: 'Organizational and Management Model' },
                  { key: 'wiki-doc:[2026-01-01][ISCM-OD][ISCM Organizational Structure and Chart].pdf', label: 'ISCM Organizational Structure and Chart' },
                  { key: 'wiki-doc:CTD Appointment 2025-2030', label: 'CTD Appointment 2025-2030' },
                  { key: 'wiki-doc:UEH Establishment Decree', label: 'UEH Establishment Decree' },
                  { key: 'wiki-doc:ISCM Establishment Decree', label: 'ISCM Establishment Decree' },
                  { key: 'wiki-doc:Lecturer Working Hours Regulation', label: 'Lecturer Working Hours Regulation' },
                  { key: 'wiki-doc:Staff Recruitment Regulations', label: 'Staff Recruitment Regulations' },
                  { key: 'wiki-doc:Teaching Assistant Regulations', label: 'Teaching Assistant Regulations' },
                  { key: 'wiki-doc:ISCM Worklist', label: 'ISCM Worklist' },
                  { key: 'wiki-doc:ISCM Member Regulation', label: 'ISCM Member Regulation' }
                ]
              },
              {
                id: 'wiki-af-r',
                label: 'Asset & Finance',
                children: [
                  { key: 'wiki-doc:INTERNAL EXPENDITURE REGULATION 2026', label: 'INTERNAL EXPENDITURE REGULATION 2026' },
                  { key: 'wiki-doc:Internal Meeting Regulation', label: 'Internal Meeting Regulation' },
                  { key: 'wiki-doc:Equipment Use & Maintenance Policy', label: 'Equipment Use & Maintenance Policy' },
                  { key: 'wiki-doc:ISCM Gift Order Policy', label: 'ISCM Gift Order Policy' },
                  { key: 'wiki-doc:Office Supplies Management Policy', label: 'Office Supplies Management Policy' }
                ]
              }
            ]
          },
          {
            id: 'wiki-policies-branch',
            label: 'Policies',
            children: [
              { key: 'wiki-doc:Teaching Standards Quality Assurance', label: 'Teaching Standards Quality Assurance' },
              { key: 'wiki-doc:MoET & UEH Program Opening Policy', label: 'MoET & UEH Program Opening Policy' },
              { key: 'wiki-doc:Framework Curriculum', label: 'Framework Curriculum' },
              { key: 'wiki-doc:Research Policies Platform (15 files)', label: 'Research Policies Platform (15 files)' }
            ]
          },
          {
            id: 'wiki-templates-branch',
            label: 'Templates & Kits',
            children: [
              { key: 'wiki-doc:Visiting Lecturer CV Template', label: 'Visiting Lecturer CV Template' },
              { key: 'wiki-doc:Foreign Lecturer KPI', label: 'Foreign Lecturer KPI' },
              { key: 'wiki-doc:Tax registration', label: 'Tax registration' },
              { key: 'wiki-doc:Request to participate conference', label: 'Request to participate conference' },
              { key: 'wiki-doc:International Conference Report Form', label: 'International Conference Report Form' },
              { key: 'wiki-doc:Trade Union Application', label: 'Trade Union Application' },
              { key: 'wiki-doc:Income Commitment Form', label: 'Income Commitment Form' },
              { key: 'wiki-doc:Meeting Report Template', label: 'Meeting Report Template' },
              { key: 'wiki-doc:Payment Contract Kit', label: 'Payment Contract Kit' },
              { key: 'wiki-doc:Event Planning & Budget Template', label: 'Event Planning & Budget Template' },
              { key: 'wiki-doc:Course Fieldwork Introduction Letter', label: 'Course Fieldwork Introduction Letter' },
              { key: 'wiki-doc:Outside Class Registration', label: 'Outside Class Registration' },
              { key: 'wiki-doc:Grade Adjustment Form', label: 'Grade Adjustment Form' },
              { key: 'wiki-doc:Student Off-site Commitment Form', label: 'Student Off-site Commitment Form' },
              { key: 'wiki-doc:Internship Introduction Letter', label: 'Internship Introduction Letter' },
              { key: 'wiki-doc:International Conference Permit Application', label: 'International Conference Permit Application' },
              { key: 'wiki-doc:ISBN Registration', label: 'ISBN Registration' },
              { key: 'wiki-doc:UEH Research Lab Registration', label: 'UEH Research Lab Registration' },
              { key: 'wiki-doc:Sponsors Confirmation', label: 'Sponsors Confirmation' },
              { key: 'wiki-doc:Sponsor Invoice', label: 'Sponsor Invoice' },
              { key: 'wiki-doc:MOUs Template', label: 'MOUs Template' },
              { key: 'wiki-doc:Expert Invitation Letter', label: 'Expert Invitation Letter' },
              { key: 'wiki-doc:UEH Gift Request Form', label: 'UEH Gift Request Form' },
              { key: 'wiki-doc:Event Master Plan Template', label: 'Event Master Plan Template' }
            ]
          },
          {
            id: 'wiki-media-branch',
            label: 'Media & Branding Materials',
            children: [
              { key: 'wiki-doc:UEH Branding Kit', label: 'UEH Branding Kit' },
              { key: 'wiki-doc:Office Kit Template', label: 'Office Kit Template' },
              { key: 'wiki-doc:ISCM Portfolio', label: 'ISCM Portfolio' },
              { key: 'wiki-doc:ISCM Introduction Slide', label: 'ISCM Introduction Slide' },
              { key: 'wiki-doc:ISCM Brochure', label: 'ISCM Brochure' },
              { key: 'wiki-doc:Event Series Brochure 2026', label: 'Event Series Brochure 2026' },
              { key: 'wiki-doc:Photo & Video Storage', label: 'Photo & Video Storage' }
            ]
          },
          {
            id: 'wiki-reference-branch',
            label: 'Reference Lists',
            children: [
              { key: 'wiki-doc:CTD List of members', label: 'CTD List of members' },
              { key: 'wiki-doc:Job description', label: 'Job description' },
              { key: 'wiki-doc:List of ISCM members & Visiting Lecturer', label: 'List of ISCM members & Visiting Lecturer' },
              { key: 'wiki-doc:Tax info & Restaurant list', label: 'Tax info & Restaurant list' },
              { key: 'wiki-doc:ISCM Facility & Equipment', label: 'ISCM Facility & Equipment' },
              { key: 'wiki-doc:List of Document code', label: 'List of Document code' },
              { key: 'wiki-doc:Individual stakeholder list', label: 'Individual stakeholder list' },
              { key: 'wiki-doc:ISCM Institutional Partnership', label: 'ISCM Institutional Partnership' },
              { key: 'wiki-doc:ISCM Booklist', label: 'ISCM Booklist' },
              { key: 'wiki-doc:ISCM members\' ORCiD', label: 'ISCM members\' ORCiD' },
              { key: 'wiki-doc:Funding activities', label: 'Funding activities' },
              { key: 'wiki-doc:Reputable journal-conference in Urban Studies', label: 'Reputable journal-conference in Urban Studies' },
              { key: 'wiki-doc:Scientific journals accredited by State Council', label: 'Scientific journals accredited by State Council' }
            ]
          },
          { key: 'wiki-doc:Onboarding Quickstart Kit', label: 'Start' }
        ]
      },
      {
        id: 'contacts-root',
        label: 'CONTACTS',
        children: [
          { key: 'contacts-support', label: 'Support Contacts' },
          { key: 'contacts-departments', label: 'Departments' },
          { key: 'contacts-colleagues', label: 'Colleagues' }
        ]
      }
    ]
  }
};

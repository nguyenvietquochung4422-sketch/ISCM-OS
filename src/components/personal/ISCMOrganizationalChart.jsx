import { useState } from 'react';
import {
  UserCheck, Wallet, GraduationCap, FlaskConical, UsersRound,
  Megaphone, Handshake, Workflow, Cpu, Hammer, Search, ChevronRight, X,
  Layers, Activity, Star
} from 'lucide-react';

const DEPARTMENTS = [
  {
    id: 'director',
    nameVi: 'Director & Management Board (RU0)',
    nameEn: 'Director & Management Board (RU0)',
    roleVi: 'Điều hành tối cao',
    roleEn: 'Supreme Director',
    pic: 'Trịnh Tú Anh',
    icon: UserCheck,
    color: 'border-[#990000] bg-red-50 text-[#990000]',
    descVi: 'Nắm quyền điều hành tối cao tại ISCM; trực tiếp phân công, bổ nhiệm các vị trí: Head, Lead, Manager, Coordinator, Host.',
    descEn: 'Supreme executive authority at ISCM; directly assigns and appoints Head, Lead, Manager, Coordinator, Host positions.',
    members: [
      { roleVi: 'Viện trưởng / Director', name: 'Trịnh Tú Anh' }
    ]
  },
  {
    id: 'of',
    nameVi: 'Operation & Finance (O&F)',
    nameEn: 'Operation & Finance (O&F)',
    roleVi: 'Trưởng bộ phận (Head)',
    roleEn: 'Head of Department',
    pic: 'Mai',
    icon: Wallet,
    color: 'border-emerald-600 bg-emerald-50 text-emerald-800',
    descVi: 'Bảo đảm nền tảng vận hành ổn định, hiệu quả và minh bạch cho toàn bộ hoạt động của ISCM; quản lý tài chính, nhân sự, thiết bị và hạ tầng.',
    descEn: 'Ensure a stable, efficient, and transparent operational foundation for all activities of ISCM; manage finance, HR, equipment and infrastructure.',
    subgroups: [
      { nameVi: 'HR & Internal Affairs', nameEn: 'HR & Internal Affairs', pic: 'Trâm', descVi: 'Quản lý hợp đồng, database thành viên (Cơ hữu, Thỉnh giảng, Cố vấn); thanh quyết toán Event Series; quản lý email ISCM & thông báo.', descEn: 'Manage contracts, member database (Full-time, Adjunct, Advisor); settle Event Series payments; manage email & announcements.' },
      { nameVi: 'Facility B (Cơ sở B)', nameEn: 'Facility B', pic: 'Phúc', descVi: 'Giám sát an toàn, thiết bị và tối ưu hóa việc sử dụng hai StudioLab cho sinh viên và nhà nghiên cứu.', descEn: 'Supervise safety, equipment and optimize StudioLab usage for students and researchers.' },
      { nameVi: 'Facility V (Cơ sở V)', nameEn: 'Facility V', pic: 'An', descVi: 'Trực tiếp quản lý vận hành tại V; kiểm kê, cấp phát và bảo trì toàn bộ thiết bị.', descEn: 'Directly manage operations at V; inventory, allocate and maintain all equipment.' },
      { nameVi: 'All Equipment (Thiết bị)', nameEn: 'All Equipment', pic: 'Vũ', descVi: 'Trực tiếp quản lý vận hành, kiểm kê, cấp phát và bảo trì toàn bộ thiết bị trong các dự án.', descEn: 'Directly manage operations, inventory, allocation and maintenance of all project equipment.' },
      { nameVi: 'Document: International', nameEn: 'Document: International', pic: 'An', descVi: 'Soạn thảo, trình duyệt Tờ trình/Kế hoạch trên Smart Office; thanh toán quốc tế; booking phòng/xe/khách sạn; cấp điểm rèn luyện.', descEn: 'Draft/approve proposals on Smart Office; international payments; book room/car/hotel; student training points.' },
      { nameVi: 'Document: Domestic', nameEn: 'Document: Domestic', pic: 'Vũ', descVi: 'Soạn thảo, trình duyệt Tờ trình/Kế hoạch trên Smart Office; thanh toán nội địa cho các sự kiện trong nước.', descEn: 'Draft/approve proposals on Smart Office; domestic payments for local events.' },
      { nameVi: 'Booklist', nameEn: 'Booklist', pic: 'O&F Team', descVi: 'Vận hành hệ thống sách vật lý & sách điện tử; phối hợp biên tập, trình bày ấn phẩm sách, tạp chí.', descEn: 'Operate physical and digital book system; coordinate editing and presentation of publications.' }
    ],
    members: [
      { roleVi: 'Head (Trưởng bộ phận)', name: 'Mai' },
      { roleVi: 'HR & Internal Affairs', name: 'Trâm' },
      { roleVi: 'Facility B (Cơ sở B)', name: 'Phúc' },
      { roleVi: 'Facility V (Cơ sở V)', name: 'An' },
      { roleVi: 'All Equipment (Thiết bị)', name: 'Vũ' },
      { roleVi: 'Document International', name: 'An' },
      { roleVi: 'Document Domestic', name: 'Vũ' }
    ]
  },
  {
    id: 'academia',
    nameVi: 'Academia (Học thuật & Đào tạo)',
    nameEn: 'Academia',
    roleVi: 'Trưởng bộ phận (Head)',
    roleEn: 'Head of Department',
    pic: 'Lan',
    icon: GraduationCap,
    color: 'border-blue-600 bg-blue-50 text-blue-800',
    descVi: 'Bảo đảm chất lượng và đổi mới trong giảng dạy, đào tạo, và phát triển năng lực toàn cầu cho sinh viên; thiết kế chương trình dài hạn và ngắn hạn.',
    descEn: 'Ensure quality and innovation in teaching, training, and global capacity development for students; design long and short-term programs.',
    subgroups: [
      { nameVi: 'Head & Academic Affairs', nameEn: 'Head & Academic Affairs', pic: 'Lan', descVi: 'Quản lý phân công giảng dạy, đề xuất tuyển dụng giảng viên và giám sát triển khai kế hoạch năm (chuẩn ASIIN).', descEn: 'Manage teaching assignments, propose lecturer recruitment and monitor annual plan (ASIIN standard).' },
      { nameVi: 'Admission & Outreach', nameEn: 'Admission & Outreach', pic: 'Mai', descVi: 'Xây dựng và điều phối kế hoạch tuyển sinh toàn bộ chương trình Đại học và Thạc sĩ; quản lý nhập học.', descEn: 'Build and coordinate admission plan for all Bachelor and Master programs; manage enrollment.' },
      { nameVi: 'Non-Degree Coordinator', nameEn: 'Non-Degree Coordinator', pic: 'Hải', descVi: 'Thiết kế Syllabus, xây dựng nội dung khóa học ngắn hạn và tuyển chọn giảng viên chuyên gia.', descEn: 'Design Syllabus, construct short-course content and recruit expert lecturers.' },
      { nameVi: 'Academic Programs (Giám đốc CTĐT)', nameEn: 'Academic Programs (Directors)', pic: 'Lan / Hoài', descVi: 'Đầu mối phụ trách thiết kế triết lý, syllabus, quy chuẩn kỹ thuật và giám sát chất lượng đồ án sinh viên.', descEn: 'Responsible for designing philosophy, syllabus, technical standards and monitoring student project quality.', isProgramBranch: true }
    ],
    programDirectors: [
      { name: 'BAUD.d (Quy hoạch)', pic: 'Mai' },
      { name: 'BAUD.a (Thiết kế)', pic: 'Hiển' },
      { name: 'BMOM (Smart Mobility)', pic: 'Hoài' },
      { name: 'SCIM (Data Science)', pic: 'Lan' },
      { name: 'Event Coordinator', pic: 'Host' },
      { name: 'Glocal Design Theory', pic: 'Mai' },
      { name: 'Smart City Innovation', pic: 'Tâm' },
      { name: 'Glocal StudioLab', pic: 'Hiển' },
      { name: 'Engineering Systems', pic: 'Hoài' }
    ],
    members: [
      { roleVi: 'Head & Academic Affairs', name: 'Lan' },
      { roleVi: 'Admission & Outreach', name: 'Mai' },
      { roleVi: 'Non-Degree Coordinator', name: 'Hải' }
    ]
  },
  {
    id: 'research',
    nameVi: 'Research (Nghiên cứu khoa học)',
    nameEn: 'Research',
    roleVi: 'Trưởng bộ phận (Head)',
    roleEn: 'Head of Department',
    pic: 'Hoài',
    icon: FlaskConical,
    color: 'border-amber-600 bg-amber-50 text-amber-800',
    descVi: 'Thúc đẩy tri thức học thuật và chuyển giao giải pháp đô thị bền vững; hoạch định lộ trình nghiên cứu quốc tế, quản trị hệ thống ấn phẩm.',
    descEn: 'Promote academic knowledge and transfer sustainable urban solutions; plan international research roadmap, manage publications system.',
    subgroups: [
      { nameVi: 'Seminar', nameEn: 'Seminar Series', pic: 'Quang', descVi: 'Tổ chức và điều phối chuỗi hội thảo khoa học nội bộ để trao đổi tri thức; tập huấn kỹ thuật viết bài, phương pháp luận.', descEn: 'Organize and coordinate internal scientific seminars; train in article writing and methodologies.' },
      { nameVi: 'Research Progress & Publication', nameEn: 'Research Progress & Publication', pic: 'Hoài / Quang', descVi: 'Theo dõi tiến độ đề tài; điều hành hệ thống lưu trữ bài báo; thống kê KPIs/OKRs học thuật.', descEn: 'Track project progress; run article storage system; compile academic KPIs/OKRs.' },
      { nameVi: 'Fund Raising', nameEn: 'Fund Raising', pic: 'Quang', descVi: 'Xây dựng Danh mục Quỹ (Fund Mapping); đánh giá khả năng trúng thầu; điều phối viết hồ sơ xin quỹ.', descEn: 'Build Fund Mapping directory; evaluate bidding feasibility; coordinate application writing.' },
      { nameVi: 'Research Units & Labs', nameEn: 'Research Units & Labs', pic: 'Hoài / Tâm', descVi: 'Dẫn dắt các nhóm nghiên cứu, Centers và Labs tập trung vào các hướng mũi nhọn.', descEn: 'Lead research units, centers and labs focused on specialized academic streams.', isResearchBranch: true }
    ],
    researchUnits: [
      { name: 'Move System - IRL', pic: 'Hoài' },
      { name: 'Smart City - RL', pic: 'Tâm' },
      { name: 'Data Driven & UD', pic: 'Chi' },
      { name: 'New Economy - PL', pic: 'Hoài' },
      { name: 'Governance & Planning', pic: 'Mai' },
      { name: 'Public Space Lab', pic: 'Dani' },
      { name: 'Net Zero Open - PL', pic: 'Sandhya' },
      { name: 'Immersive Tech (TIL)', pic: 'Tâm' }
    ],
    members: [
      { roleVi: 'Head (Trưởng bộ phận)', name: 'Hoài' },
      { roleVi: 'Seminar Coordinator', name: 'Quang' },
      { roleVi: 'Research Progress & Pubs', name: 'Hoài / Quang' }
    ]
  },
  {
    id: 'community',
    nameVi: 'Community Engagement (Cộng đồng)',
    nameEn: 'Community Engagement',
    roleVi: 'Trưởng bộ phận (Head)',
    roleEn: 'Head of Department',
    pic: 'Khang',
    icon: UsersRound,
    color: 'border-purple-600 bg-purple-50 text-purple-800',
    descVi: 'Hạt nhân kết nối hệ sinh thái ISCM qua tinh thần đồng sáng tạo (Co-creation) của sinh viên, cựu sinh viên, nghệ sĩ và doanh nghiệp.',
    descEn: 'Core connector of ISCM ecosystem through co-creation spirit of students, alumni, artists, and enterprises.',
    subgroups: [
      { nameVi: 'ISCM Club', nameEn: 'ISCM Club', pic: 'Khang', descVi: 'Trực tiếp điều phối, định hướng hoạt động Câu lạc bộ sinh viên; tổ chức sân chơi phát triển kỹ năng sáng tạo.', descEn: 'Directly coordinate and orient Student Club activities; organize creative skill playgrounds.' },
      { nameVi: 'RED Series', nameEn: 'RED Series', pic: 'Khang', descVi: 'Lên kế hoạch và tổ chức chuỗi sự kiện RED (Read - Engagement - Design), kết nối học thuật với cộng đồng.', descEn: 'Plan and organize RED (Read - Engagement - Design) series, bridging academia and community.' },
      { nameVi: 'Curator & Student Product', nameEn: 'Curator & Student Product', pic: 'Khang / Tài', descVi: 'Chỉ đạo tuyển chọn sản phẩm xuất sắc; điều phối lưu trữ đồ án sinh viên phục vụ triển lãm.', descEn: 'Direct selection of student products; coordinate archive of student works for exhibitions.' },
      { nameVi: 'Alumni Network', nameEn: 'Alumni Network', pic: 'Hoài', descVi: 'Duy trì database cựu sinh viên; huy động tham gia cố vấn (Mentoring) và giới thiệu cơ hội việc làm.', descEn: 'Maintain alumni database; mobilize mentoring participation and job opportunity referrals.' }
    ],
    members: [
      { roleVi: 'Head & ISCM Club / RED', name: 'Khang' },
      { roleVi: 'Curator', name: 'Khang' },
      { roleVi: 'Student Product', name: 'Tài' },
      { roleVi: 'Alumni Network', name: 'Hoài' }
    ]
  },
  {
    id: 'pr',
    nameVi: 'PR & Communication (Truyền thông)',
    nameEn: 'PR & Communication',
    roleVi: 'Trưởng bộ phận (Head)',
    roleEn: 'Head of Department',
    pic: 'Tiên',
    icon: Megaphone,
    color: 'border-indigo-600 bg-indigo-50 text-indigo-800',
    descVi: 'Quản trị thương hiệu và lan tỏa ảnh hưởng tri thức toàn cầu của Viện; quản lý báo chí, thiết kế ấn phẩm và mạng xã hội.',
    descEn: 'Brand management and global dissemination of the Institute\'s academic influence; manage media relations, design publications and social networks.',
    subgroups: [
      { nameVi: 'Branding & Media Relations', nameEn: 'Branding & Media Relations', pic: 'Tiên', descVi: 'Thực thi chiến lược định vị thương hiệu; quảng bá các dự án hợp tác; quản trị khủng hoảng thông tin.', descEn: 'Implement brand positioning strategy; promote collaborative projects; manage information risks.' },
      { nameVi: 'Content & Social Media', nameEn: 'Content & Social Media', pic: 'Dung / Nguyên', descVi: 'Xây dựng nội dung sáng tạo cho các chiến dịch tuyển sinh, event; quản trị trực tiếp các trang mạng xã hội.', descEn: 'Create content for enrollment campaigns and events; directly manage social media channels.' },
      { nameVi: 'IT Digital & Web', nameEn: 'IT Digital & Web', pic: 'Tiên', descVi: 'Thiết kế giao diện (UI/UX) và quản trị vận hành Website ISCM; quản lý kho dữ liệu số (hình ảnh, video).', descEn: 'Design UI/UX and operate the ISCM Website; manage digital media library (photos, videos).' },
      { nameVi: 'Design Team', nameEn: 'Design Team', pic: 'Design Team', descVi: 'Thiết kế trọn gói bộ nhận diện sự kiện (Key visual, Backdrop, Standee, Brochure, Office Kit).', descEn: 'Provide end-to-end event branding designs (Key visual, Backdrop, Standee, Brochure, Office Kit).' }
    ],
    members: [
      { roleVi: 'Head (Trưởng bộ phận)', name: 'Tiên' },
      { roleVi: 'Content & Social Media', name: 'Hồng Dung / Nguyên' },
      { roleVi: 'IT Digital', name: 'Tiên' }
    ]
  },
  {
    id: 'partnership',
    nameVi: 'Partnership (Đối tác chiến lược)',
    nameEn: 'Partnership',
    roleVi: 'Phụ trách (P.I.C)',
    roleEn: 'P.I.C',
    pic: 'Huyền',
    icon: Handshake,
    color: 'border-cyan-600 bg-cyan-50 text-cyan-800',
    descVi: 'Xây dựng mối quan hệ đa tầng (Chính quyền - Doanh nghiệp - Nhà trường) và huy động tài trợ, học bổng cho ISCM.',
    descEn: 'Build multi-tier relations (Triple Helix: Government - Industry - Academia) and mobilize sponsorships/scholarships.',
    subgroups: [
      { nameVi: 'Triple Helix Net', nameEn: 'Triple Helix Net', pic: 'Huyền', descVi: 'Kết nối Doanh nghiệp, Trường Đại học và Cơ quan Nhà nước phục vụ hoạt động đào tạo, nghiên cứu của Viện.', descEn: 'Connect Industry, Academia and Government for training and research activities.' },
      { nameVi: 'Resource Mobilization', nameEn: 'Resource Mobilization', pic: 'Huyền', descVi: 'Huy động tài trợ, học bổng, thiết bị và chuẩn bị hồ sơ ký kết MOU/MOA.', descEn: 'Mobilize sponsorships, scholarships and equipment; prepare MOU/MOA agreements.' }
    ],
    members: [
      { roleVi: 'Partnership Coordinator', name: 'Huyền' },
      { roleVi: 'Student Mentors/Crew', name: 'Phúc' }
    ]
  },
  {
    id: 'colab',
    nameVi: 'UEH CoLab',
    nameEn: 'UEH CoLab',
    roleVi: 'Ban điều hành',
    roleEn: 'Executive Board',
    pic: 'Christopher Han',
    icon: Workflow,
    color: 'border-teal-600 bg-teal-50 text-teal-800',
    descVi: 'Thúc đẩy đổi mới sáng tạo, chuyển giao tri thức và phát triển bền vững đa ngành trực thuộc Đại học UEH.',
    descEn: 'Drive innovation, knowledge transfer, and transdisciplinary sustainable development under UEH University.',
    subgroups: [
      { nameVi: 'Digital & Data Governance', nameEn: 'Digital & Data Governance', pic: 'Christopher Han / Lương', descVi: 'Vận hành Smart Data Platform; xây dựng Dashboard thông minh; thúc đẩy thương mại hóa tài sản trí tuệ (IP) và spin-off.', descEn: 'Operate Smart Data Platform; build intelligent dashboards; promote IP commercialization and spin-offs.' },
      { nameVi: 'UEH Green Office', nameEn: 'UEH Green Office', pic: 'Hạnh An / Thu', descVi: 'Thực hiện Chương trình Net Zero Campus, quản lý các Living Labs và lập báo cáo xếp hạng UI GreenMetric.', descEn: 'Implement Net Zero Campus Program, manage Living Labs and prepare UI GreenMetric reports.' },
      { nameVi: 'Co-creation & Operations', nameEn: 'Co-creation & Operations', pic: 'Trâm', descVi: 'Đầu mối điều phối hành chính - tài chính liên kết; mở rộng mạng lưới Social Impact Network và Creative Hub.', descEn: 'Administrative-finance coordination link; expand Social Impact Network and Creative Hub.' },
      { nameVi: 'Sub-projects (Living Labs)', nameEn: 'Sub-projects (Living Labs)', pic: 'Tâm / Hiển', descVi: 'smART-Hub (Hiển), Mekong (Mai), Nexus (Tâm). Điều phối tiến độ, thi công và vận hành.', descEn: 'smART-Hub (Hiển), Mekong (Mai), Nexus (Tâm). Coordinate progress, construction and operations.', isColabBranch: true }
    ],
    colabProjects: [
      { name: 'smART-Hub (Living Lab)', pic: 'Hiển' },
      { name: 'MeKong (Living Lab)', pic: 'Mai' },
      { name: 'Nexus (Living Lab)', pic: 'Tâm' }
    ],
    members: [
      { roleVi: 'Director of CoLab', name: 'Christopher Han' },
      { roleVi: 'UEH Green Office Lead', name: 'Hạnh An' },
      { roleVi: 'Co-creation Coordinator', name: 'Trâm' }
    ]
  },
  {
    id: 'tech_hub',
    nameVi: 'Tech Convergence Hub',
    nameEn: 'Tech Convergence Hub',
    roleVi: 'Điều phối viên (Coordinator)',
    roleEn: 'Coordinator',
    pic: 'Tâm',
    icon: Cpu,
    color: 'border-violet-600 bg-violet-50 text-violet-800',
    descVi: 'Hội tụ công nghệ liên ngành, quản lý sở hữu trí tuệ, ươm tạo và chuyển giao sản phẩm công nghệ (Tech Transfer).',
    descEn: 'Converge interdisciplinary tech, manage IP portfolio, incubate prototypes and conduct tech transfer processes.',
    subgroups: [
      { nameVi: 'Tech Integration', nameEn: 'Tech Integration', pic: 'Tâm', descVi: 'Đảm bảo tính hội tụ công nghệ trong các dự án liên ngành; lập kế hoạch phát triển hệ sinh thái Hub.', descEn: 'Ensure tech convergence in interdisciplinary projects; plan Hub ecosystem development.' },
      { nameVi: 'Operation & Quality Control', nameEn: 'Operation & Quality Control', pic: 'Cường', descVi: 'Quản lý các hoạt động đào tạo, nghiên cứu dùng chung; quản lý sở hữu trí tuệ và pháp lý.', descEn: 'Manage shared training/research activities; manage intellectual property and compliance.' },
      { nameVi: 'Events & Equipment', nameEn: 'Events & Equipment', pic: 'ISC / Tài', descVi: 'Tổ chức các buổi triển lãm Showcase; điều phối Workshop; quản lý hệ thống thiết bị dùng chung.', descEn: 'Organize Showcase exhibitions; coordinate Workshops; manage shared high-tech equipment.' }
    ],
    members: [
      { roleVi: 'Coordinator', name: 'Tâm' },
      { roleVi: 'Operation Manager', name: 'Cường' },
      { roleVi: 'Events & Showcase', name: 'ISC' },
      { roleVi: 'Equipment Manager', name: 'Tài' }
    ]
  },
  {
    id: 'maker_space',
    nameVi: 'Maker Space (Không gian Sáng chế)',
    nameEn: 'Maker Space',
    roleVi: 'Quản trị viên (Admin)',
    roleEn: 'Admin Manager',
    pic: 'Zioo',
    icon: Hammer,
    color: 'border-rose-600 bg-rose-50 text-rose-800',
    descVi: 'Không gian thực nghiệm, gia công mẫu chế tác (in 3D, cắt laser, CNC...) phục vụ giảng dạy, nghiên cứu và dịch vụ doanh nghiệp.',
    descEn: 'Experimental workspace, prototyping (3D print, laser cut, CNC...) for academic learning, research, and corporate R&D services.',
    subgroups: [
      { nameVi: 'Management & Safety', nameEn: 'Management & Safety', pic: 'Manager', descVi: 'Thiết lập quy trình vận hành; đảm bảo các tiêu chuẩn an toàn (Safety Protocols) tại Campus B.', descEn: 'Establish operational processes; ensure safety protocols at Campus B.' },
      { nameVi: 'R&D & Production', nameEn: 'R&D & Production', pic: 'Phúc / Zioo', descVi: 'Gia công nguyên mẫu (Prototype), mô hình kiến trúc/đô thị theo đơn hàng; quản lý vật tư tiêu hao.', descEn: 'Fabricate prototypes, architectural models per order; manage consumables.' },
      { nameVi: 'PR & Engagement', nameEn: 'PR & Engagement', pic: 'Tiên / Thảo Nguyên', descVi: 'Quảng bá các câu chuyện "Maker"; tổ chức các cuộc thi thiết kế; vận hành nhóm sinh viên MS Interns.', descEn: 'Promote Maker stories; organize design competitions; run MS Interns team.' }
    ],
    members: [
      { roleVi: 'Admin Coordinator', name: 'Zioo' },
      { roleVi: 'Operation & Product', name: 'Phúc' },
      { roleVi: 'PR & Communication', name: 'Tiên / Thảo Nguyên' },
      { roleVi: 'Partnership', name: 'Huyền' }
    ]
  }
];

const SIMULATED_USERS = [
  // ROLE A
  { id: 'u1', name: 'Assoc.Prof. Tu Anh Trinh, PhD', role: 'ROLE A: GOVERNANCE BOARD', title: 'Director', roleType: 'A', email: 'tuanh.trinh@ueh.edu.vn' },
  { id: 'u2', name: 'Hung Quoc Viet Nguyen, B.A', role: 'ROLE A: ARCHITECT', title: 'Smart City - Data Core Architect', roleType: 'A', email: 'hung.nvq@ueh.edu.vn' },
  // ROLE B
  { id: 'u3', name: 'Mai Quynh Thi Tran, M.Arch', role: 'ROLE B: DATA STEWARD', title: 'Director of Bachelor Program - Dual Degree', roleType: 'B', email: 'mai.tran@ueh.edu.vn' },
  { id: 'u4', name: 'Hien The Dang, M.Sc', role: 'ROLE B: DATA STEWARD', title: 'Director of Bachelor Program - Architect', roleType: 'B', email: 'hien.dang@ueh.edu.vn' },
  { id: 'u5', name: 'Hoai Nguyen Pham, PhD', role: 'ROLE B: DATA STEWARD', title: 'Director of Bachelor Program - Smart Mobility', roleType: 'B', email: 'hoai.pham@ueh.edu.vn' },
  { id: 'u6', name: 'Dr. Arch, Lan Ngoc Hoang', role: 'ROLE B: DATA STEWARD', title: 'Head of Academia', roleType: 'B', email: 'lan.hoang@ueh.edu.vn' },
  { id: 'u7', name: 'Dr. Arch, Khang Van Huynh', role: 'ROLE B: DATA STEWARD', title: 'Head of Community Engagement', roleType: 'B', email: 'khang.huynh@ueh.edu.vn' },
  { id: 'u8', name: 'Dung Lai Phuong, M.A', role: 'ROLE B: DATA STEWARD', title: 'Head of Partnership', roleType: 'B', email: 'dung.lai@ueh.edu.vn' },
  { id: 'u9', name: 'Tien Thuy Thi Le, B.E', role: 'ROLE B: DATA STEWARD', title: 'Head of PR & Communication', roleType: 'B', email: 'tien.le@ueh.edu.vn' },
  // ROLE C
  { id: 'u10', name: 'Tam Phuc Le Do, M.Sc', role: 'ROLE C: RESEARCHER', title: 'Lecturer - Smart Urban Development', roleType: 'C', email: 'tam.le@ueh.edu.vn' },
  { id: 'u11', name: 'Nam Thanh Le, PhD', role: 'ROLE C: RESEARCHER', title: 'Lecturer - Urban Infrastructure & Sustainable Development', roleType: 'C', email: 'nam.le@ueh.edu.vn' },
  { id: 'u12', name: 'Long Phi Hoang, PhD', role: 'ROLE C: RESEARCHER', title: 'Adjunct Lecturer - Environmental Science', roleType: 'C', email: 'long.hoang@ueh.edu.vn' },
  { id: 'u13', name: 'Dao Chi Vo, PhD', role: 'ROLE C: RESEARCHER', title: 'Lecturer - Urban Infrastructure & Sustainable Development', roleType: 'C', email: 'dao.vo@ueh.edu.vn' },
  { id: 'u14', name: 'Quang Tran Vuong, PhD', role: 'ROLE C: RESEARCHER', title: 'Lecturer - Environmental Science', roleType: 'C', email: 'quang.vuong@ueh.edu.vn' },
  { id: 'u15', name: 'Sandhya Rao, M.Arch', role: 'ROLE C: RESEARCHER', title: 'Lecturer - Architecture & Urban Design', roleType: 'C', email: 'sandhya.rao@ueh.edu.vn' },
  { id: 'u16', name: 'Nam-Hai Hoang, M.Arch', role: 'ROLE C: RESEARCHER', title: 'Lecturer - Architecture & Urban Design', roleType: 'C', email: 'namhai.hoang@ueh.edu.vn' },
  { id: 'u17', name: 'Daniela Hurtarte, M.Sc', role: 'ROLE C: RESEARCHER', title: 'Lecturer - Urban Planning & Design', roleType: 'C', email: 'daniela.hurtarte@ueh.edu.vn' },
  { id: 'u18', name: 'Trung Nguyen Tan, PhD', role: 'ROLE C: RESEARCHER', title: 'Lecturer - Environmental Engineering & Science', roleType: 'C', email: 'trung.nguyen@ueh.edu.vn' },
  { id: 'u19', name: 'An Truong Phan Le, MUD', role: 'ROLE C: RESEARCHER', title: 'Officer - Smart Mobility', roleType: 'C', email: 'an.le@ueh.edu.vn' },
  { id: 'u20', name: 'Phuc Hoang Nguyen, B.Arch', role: 'ROLE C: RESEARCHER', title: 'Officer MakerSpace', roleType: 'C', email: 'phuc.nguyen@ueh.edu.vn' },
  { id: 'u21', name: 'Toan Phuc Le, B.E', role: 'ROLE C: RESEARCHER', title: 'Designer', roleType: 'C', email: 'toan.le@ueh.edu.vn' },
  { id: 'u22', name: 'Vu Anh Thai, M.Sc', role: 'ROLE C: RESEARCHER', title: 'Researcher - Smart City', roleType: 'C', email: 'thai.vu@ueh.edu.vn' },
  { id: 'u23', name: 'Tram Quynh Nguyen, B.A', role: 'ROLE C: RESEARCHER', title: 'Coordinator - UEH CoLab', roleType: 'C', email: 'tram.nguyen@ueh.edu.vn' },
  { id: 'u24', name: 'Binh Thanh Pham Luu, B.A', role: 'ROLE C: RESEARCHER', title: 'Design Collaborator - UEH CoLab', roleType: 'C', email: 'binh.pham@ueh.edu.vn' },
  { id: 'u25', name: 'Tai Vinh Tran, B.A', role: 'ROLE C: RESEARCHER', title: 'Collaborator - Studio Lab', roleType: 'C', email: 'tai.tran@ueh.edu.vn' },
  // ROLE D
  { id: 'u26', name: 'Dung Hong Vo Pham, B.A', role: 'ROLE D: INTERN', title: 'PR & Communication Intern', roleType: 'D', email: 'intern.dung@ueh.edu.vn' },
  { id: 'u27', name: 'Bùi Thảo Nguyên', role: 'ROLE D: INTERN', title: 'PR & Communication Intern', roleType: 'D', email: 'intern.nguyen@ueh.edu.vn' },
  { id: 'u28', name: 'Nguyen Ha Cam Tien', role: 'ROLE D: INTERN', title: 'PR & Communication Intern', roleType: 'D', email: 'intern.tien@ueh.edu.vn' },
  { id: 'u29', name: 'Luong Thi Thuy An', role: 'ROLE D: INTERN', title: 'Design Intern', roleType: 'D', email: 'intern.an@ueh.edu.vn' },
  { id: 'u30', name: 'Nguyen Minh Huy', role: 'ROLE D: INTERN', title: 'Design Intern', roleType: 'D', email: 'intern.huy@ueh.edu.vn' },
  { id: 'u31', name: 'Truong Thanh Dat', role: 'ROLE D: INTERN', title: 'IT Digital Platform Intern', roleType: 'D', email: 'intern.dat@ueh.edu.vn' },
  { id: 'u32', name: 'Nguyen Ngọc Thien', role: 'ROLE D: INTERN', title: 'Tech Convergence Hub Intern', roleType: 'D', email: 'intern.thien@ueh.edu.vn' },
  { id: 'u33', name: 'Ngô An Phú', role: 'ROLE D: INTERN', title: 'smART Hub Intern', roleType: 'D', email: 'intern.phu@ueh.edu.vn' },
  { id: 'u34', name: 'Nguyễn Lương Minh Thư', role: 'ROLE D: INTERN', title: 'Public Space Living Lab Intern', roleType: 'D', email: 'intern.thu@ueh.edu.vn' },
  { id: 'u35', name: 'Hoàng Trương Tiến Đạt', role: 'ROLE D: INTERN', title: 'Public Space Living Lab Intern', roleType: 'D', email: 'intern.tiendat@ueh.edu.vn' }
];

export default function ISCMOrganizationalChart({ lang = 'vi' }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState(null);
  const [viewMode, setViewMode] = useState('chart'); // 'chart' or 'matrix' or 'directory'
  const [hoveredPic, setHoveredPic] = useState(null);
  const [selectedPic, setSelectedPic] = useState(null);

  const filteredUsers = useMemo(() => {
    if (!searchTerm) return SIMULATED_USERS;
    const query = searchTerm.toLowerCase();
    return SIMULATED_USERS.filter(u => 
      u.name.toLowerCase().includes(query) ||
      u.title.toLowerCase().includes(query) ||
      u.role.toLowerCase().includes(query) ||
      u.email.toLowerCase().includes(query)
    );
  }, [searchTerm]);

  // Search filter matching
  const matchesSearch = (dept) => {
    if (!searchTerm) return false;
    const query = searchTerm.toLowerCase();
    const nameMatch = dept.nameVi.toLowerCase().includes(query) || dept.nameEn.toLowerCase().includes(query);
    const picMatch = dept.pic.toLowerCase().includes(query);
    const subgroupMatch = dept.subgroups?.some(s => 
      s.nameVi.toLowerCase().includes(query) || 
      s.nameEn.toLowerCase().includes(query) || 
      s.pic.toLowerCase().includes(query)
    );
    const programMatch = dept.programDirectors?.some(p => 
      p.name.toLowerCase().includes(query) || 
      p.pic.toLowerCase().includes(query)
    );
    const unitMatch = dept.researchUnits?.some(u => 
      u.name.toLowerCase().includes(query) || 
      u.pic.toLowerCase().includes(query)
    );
    return nameMatch || picMatch || subgroupMatch || programMatch || unitMatch;
  };

  const matchesSubgroup = (sub) => {
    if (!searchTerm) return false;
    const query = searchTerm.toLowerCase();
    return sub.nameVi.toLowerCase().includes(query) || 
           sub.nameEn.toLowerCase().includes(query) || 
           sub.pic.toLowerCase().includes(query);
  };

  const matchesDirectItem = (item) => {
    if (!searchTerm) return false;
    const query = searchTerm.toLowerCase();
    return item.name.toLowerCase().includes(query) || 
           item.pic.toLowerCase().includes(query);
  };

  // Find all departments a person is involved in
  const getInvolvedDepts = (picName) => {
    if (!picName) return [];
    return DEPARTMENTS.filter(d => 
      d.pic.toLowerCase().includes(picName.toLowerCase()) ||
      d.members.some(m => m.name.toLowerCase().includes(picName.toLowerCase())) ||
      d.subgroups?.some(s => s.pic.toLowerCase().includes(picName.toLowerCase())) ||
      d.programDirectors?.some(p => p.pic.toLowerCase().includes(picName.toLowerCase())) ||
      d.researchUnits?.some(u => u.pic.toLowerCase().includes(picName.toLowerCase()))
    ).map(d => d.id);
  };

  const activePic = hoveredPic || selectedPic;
  const activeHoveredDepts = getInvolvedDepts(activePic);

  return (
    <div className="space-y-6 font-sans text-neutral-800">
      
      {/* Custom Styles Injection for springy micro-animations */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes pulseGlowRed {
          0% { box-shadow: 0 0 0 0 rgba(153, 0, 0, 0.4); }
          70% { box-shadow: 0 0 0 10px rgba(153, 0, 0, 0); }
          100% { box-shadow: 0 0 0 0 rgba(153, 0, 0, 0); }
        }
        @keyframes flowDash {
          to { stroke-dashoffset: -20; }
        }
        .glow-red {
          animation: pulseGlowRed 1.8s infinite;
        }
        .animated-line {
          stroke-dasharray: 5;
          animation: flowDash 1s linear infinite;
        }
        .card-scale {
          transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
        }
        .card-scale:hover {
          transform: translateY(-4px) scale(1.02);
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}} />

      {/* Header controls: Search & View toggle */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-neutral-100 pb-4 shrink-0">
        
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            placeholder={lang === 'vi' ? 'Tìm kiếm nhân sự, nhóm, vai trò...' : 'Search staff, units, roles...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-9 py-2 border border-neutral-200 bg-white text-xs focus:border-[#990000] focus:outline-none text-iscm-charcoal placeholder:text-gray-400 rounded-none font-ibm"
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* View Mode Toggle */}
        <div className="flex border border-neutral-200 p-0.5 bg-neutral-100 rounded-none font-barlow text-xs font-bold uppercase tracking-wider">
          <button
            onClick={() => setViewMode('chart')}
            className={`py-1.5 px-3 transition-colors flex items-center gap-1.5 rounded-none ${
              viewMode === 'chart' ? 'bg-white text-[#990000] shadow-sm' : 'text-neutral-500 hover:text-neutral-900'
            }`}
          >
            <Layers className="h-3.5 w-3.5" />
            {lang === 'vi' ? 'Sơ đồ cây' : 'Flowchart'}
          </button>
          <button
            onClick={() => setViewMode('matrix')}
            className={`py-1.5 px-3 transition-colors flex items-center gap-1.5 rounded-none ${
              viewMode === 'matrix' ? 'bg-white text-[#990000] shadow-sm' : 'text-neutral-500 hover:text-neutral-900'
            }`}
          >
            <Activity className="h-3.5 w-3.5" />
            {lang === 'vi' ? 'Ma trận' : 'Matrix'}
          </button>
          <button
            onClick={() => setViewMode('directory')}
            className={`py-1.5 px-3 transition-colors flex items-center gap-1.5 rounded-none ${
              viewMode === 'directory' ? 'bg-white text-[#990000] shadow-sm' : 'text-neutral-500 hover:text-neutral-900'
            }`}
          >
            <UsersRound className="h-3.5 w-3.5" />
            {lang === 'vi' ? 'Danh bạ nhân sự' : 'Directory'}
          </button>
        </div>
      </div>

      {/* Staff shortcut highlights bar */}
      <div className="flex flex-nowrap items-center gap-1.5 text-xs border-b border-neutral-100 pb-3 overflow-x-auto select-none no-scrollbar scroll-smooth">
        <span className="text-[10px] uppercase font-bold text-neutral-400 mr-2 tracking-wider shrink-0">
          {lang === 'vi' ? 'Rà soát vai trò nhân sự' : 'Highlight P.I.C Roles'}:
        </span>
        {['Trịnh Tú Anh', 'Mai', 'Trâm', 'Phúc', 'An', 'Vũ', 'Lan', 'Hải', 'Hoài', 'Quang', 'Hiển', 'Host', 'Tâm', 'Chi', 'Dani', 'Sandhya', 'Khang', 'Tài', 'Tiên', 'Hồng Dung', 'Nguyên', 'Huyền', 'Thảo Nguyên', 'Christopher Han', 'Lương', 'Hạnh An', 'Thu', 'Trường', 'Cường', 'ISC', 'Zioo'].map(name => (
          <button
            key={name}
            onMouseEnter={() => setHoveredPic(name)}
            onMouseLeave={() => setHoveredPic(null)}
            onClick={() => setSelectedPic(selectedPic === name ? null : name)}
            className={`px-2 py-0.5 border text-[10px] font-bold uppercase transition-all shrink-0 rounded-none ${
              selectedPic === name || hoveredPic === name
                ? 'bg-[#990000] text-white border-[#990000]'
                : 'bg-white text-neutral-600 border-neutral-200 hover:border-neutral-400'
            }`}
          >
            {name}
          </button>
        ))}
      </div>

      {/* VIEWPORT 1: Global Tree Flowchart with Nested Branches directly in the tree diagram */}
      {viewMode === 'chart' && (
        <div className="border border-neutral-200 p-6 bg-neutral-50/50 relative overflow-x-auto min-w-[1000px] select-none">
          
          {/* Level 0: Ban Giám đốc */}
          <div className="flex justify-center mb-8 relative">
            {DEPARTMENTS.slice(0, 1).map((dept) => {
              const isMatch = matchesSearch(dept);
              const isHoverHighlight = activeHoveredDepts.includes(dept.id);
              const Icon = dept.icon;
              return (
                <button
                  key={dept.id}
                  onClick={() => setSelectedDept(dept)}
                  className={`w-80 border-2 p-4 text-center cursor-pointer transition-all duration-300 transform card-scale relative z-10 ${dept.color} ${
                    isMatch || isHoverHighlight ? 'glow-red border-[#990000] ring-4 ring-[#990000]/10 scale-105' : ''
                  }`}
                >
                  <Icon className="h-6 w-6 mx-auto mb-2 text-[#990000]" />
                  <h3 className="font-bold text-sm uppercase font-barlow tracking-wider">
                    {lang === 'vi' ? dept.nameVi : dept.nameEn}
                  </h3>
                  <p className="text-xs font-semibold text-neutral-500 mt-1">
                    {lang === 'vi' ? dept.roleVi : dept.roleEn}: <span className="font-bold text-neutral-900">{dept.pic}</span>
                  </p>
                </button>
              );
            })}
          </div>

          {/* Connect level 0 to level 1 */}
          <div className="relative h-12 flex justify-center -my-8 z-0">
            <svg className="w-full h-full absolute inset-0 text-neutral-300 pointer-events-none" style={{ minWidth: '1000px' }}>
              <line x1="50%" y1="0" x2="50%" y2="50%" stroke="currentColor" strokeWidth="2" />
              <line x1="16.6%" y1="50%" x2="83.3%" y2="50%" stroke="currentColor" strokeWidth="2" />
              
              <line x1="16.6%" y1="50%" x2="16.6%" y2="100%" stroke="currentColor" strokeWidth="2" />
              <line x1="33.3%" y1="50%" x2="33.3%" y2="100%" stroke="currentColor" strokeWidth="2" />
              <line x1="50%" y1="50%" x2="50%" y2="100%" stroke="currentColor" strokeWidth="2" />
              <line x1="66.6%" y1="50%" x2="66.6%" y2="100%" stroke="currentColor" strokeWidth="2" />
              <line x1="83.3%" y1="50%" x2="83.3%" y2="100%" stroke="currentColor" strokeWidth="2" />

              {activePic && (
                <>
                  <line x1="50%" y1="0" x2="50%" y2="50%" stroke="#990000" strokeWidth="2.5" className="animated-line" />
                  <line x1="16.6%" y1="50%" x2="83.3%" y2="50%" stroke="#990000" strokeWidth="2.5" className="animated-line" />
                  {activeHoveredDepts.map(id => {
                    let pct = "50%";
                    if (id === 'of') pct = "16.6%";
                    if (id === 'academia') pct = "33.3%";
                    if (id === 'research') pct = "50%";
                    if (id === 'community') pct = "66.6%";
                    if (id === 'pr') pct = "83.3%";
                    return (
                      <line key={id} x1={pct} y1="50%" x2={pct} y2="100%" stroke="#990000" strokeWidth="2.5" className="animated-line" />
                    );
                  })}
                </>
              )}
            </svg>
          </div>

          {/* Level 1: Core Departments columns with NESTED sub-branches */}
          <div className="grid grid-cols-5 gap-4 mt-8 relative z-10 items-start">
            
            {DEPARTMENTS.slice(1, 6).map((dept) => {
              const isMatch = matchesSearch(dept);
              const isHoverHighlight = activeHoveredDepts.includes(dept.id);
              const Icon = dept.icon;
              return (
                <div key={dept.id} className="space-y-4">
                  {/* Parent Dept Node */}
                  <button
                    onClick={() => setSelectedDept(dept)}
                    className={`w-full border-2 p-3 text-left cursor-pointer transition-all duration-300 transform bg-white hover:border-[#990000]/60 ${
                      isMatch || isHoverHighlight ? 'border-[#990000] ring-4 ring-[#990000]/10 scale-[1.02] shadow-md' : 'border-neutral-200 shadow-sm'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1 border-b border-neutral-100 pb-1 mb-1">
                      <span className="font-bold text-[10px] uppercase font-barlow tracking-wider text-neutral-900 truncate">
                        {lang === 'vi' ? dept.nameVi.split('(')[0] : dept.nameEn.split('(')[0]}
                      </span>
                      <Icon className="h-3.5 w-3.5 shrink-0 text-[#990000]" />
                    </div>
                    <p className="text-[9px] text-neutral-500 leading-snug">
                      Head: <span className="font-bold text-neutral-800">{dept.pic}</span>
                    </p>
                  </button>

                  {/* Connecting line dropping to subgroups */}
                  <div className="w-0.5 h-4 bg-neutral-300 mx-auto -my-4" />

                  {/* Sub-branches listing tree */}
                  <div className="border-l border-neutral-300 ml-3.5 pl-3.5 space-y-2.5 py-1.5 relative">
                    {dept.subgroups?.map((sub, idx) => {
                      const isSubMatch = matchesSubgroup(sub);
                      const isSubHovered = activePic && sub.pic.toLowerCase().includes(activePic.toLowerCase());
                      
                      return (
                        <div key={idx} className="relative">
                          {/* Horizontal branch line */}
                          <span className="absolute -left-3.5 top-3.5 w-3.5 h-0.5 bg-neutral-300" />
                          
                          {/* Subgroup Card */}
                          <button
                            onClick={() => setSelectedDept(dept)}
                            className={`w-full text-left bg-white border p-2 flex flex-col transition-all cursor-pointer ${
                              isSubMatch || isSubHovered
                                ? 'border-[#990000] bg-[#990000]/5 ring-2 ring-[#990000]/10'
                                : 'border-neutral-200 hover:border-neutral-400'
                            }`}
                          >
                            <span className="font-bold text-[9px] text-neutral-800 leading-tight">
                              {lang === 'vi' ? sub.nameVi.split('(')[0] : sub.nameEn.split('(')[0]}
                            </span>
                            <span className="text-[8px] font-bold text-[#990000] mt-0.5 font-barlow uppercase">
                              P.I.C: {sub.pic}
                            </span>

                            {/* Double nested Program branches for Academia */}
                            {sub.isProgramBranch && (
                              <div className="border-l border-neutral-200 pl-2 ml-1 mt-1.5 space-y-1 relative w-full">
                                {dept.programDirectors?.map((prog, pIdx) => {
                                  const isProgMatch = matchesDirectItem(prog);
                                  const isProgHovered = activePic && prog.pic.toLowerCase().includes(activePic.toLowerCase());
                                  
                                  return (
                                    <div key={pIdx} className={`text-[8px] flex justify-between items-center py-0.5 px-1 ${
                                      isProgMatch || isProgHovered ? 'bg-[#990000]/10 text-[#990000] font-bold' : 'text-neutral-500'
                                    }`}>
                                      <span className="truncate">{prog.name.split('(')[0]}</span>
                                      <span className="font-bold shrink-0">{prog.pic}</span>
                                    </div>
                                  );
                                })}
                              </div>
                            )}

                            {/* Double nested Research units for Research */}
                            {sub.isResearchBranch && (
                              <div className="border-l border-neutral-200 pl-2 ml-1 mt-1.5 space-y-1 relative w-full">
                                {dept.researchUnits?.map((unit, uIdx) => {
                                  const isUnitMatch = matchesDirectItem(unit);
                                  const isUnitHovered = activePic && unit.pic.toLowerCase().includes(activePic.toLowerCase());
                                  
                                  return (
                                    <div key={uIdx} className={`text-[8px] flex justify-between items-center py-0.5 px-1 ${
                                      isUnitMatch || isUnitHovered ? 'bg-[#990000]/10 text-[#990000] font-bold' : 'text-neutral-500'
                                    }`}>
                                      <span className="truncate">{unit.name.split('(')[0]}</span>
                                      <span className="font-bold shrink-0">{unit.pic}</span>
                                    </div>
                                  );
                                })}
                              </div>
                            )}

                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}

          </div>

          {/* Connect core row down to hubs */}
          <div className="relative h-12 flex justify-center z-0">
            <svg className="w-full h-full absolute inset-0 text-neutral-300 pointer-events-none" style={{ minWidth: '1000px' }}>
              <line x1="50%" y1="0" x2="50%" y2="100%" stroke="currentColor" strokeWidth="2" />
              <line x1="25%" y1="50%" x2="75%" y2="50%" stroke="currentColor" strokeWidth="2" />
              <line x1="25%" y1="50%" x2="25%" y2="100%" stroke="currentColor" strokeWidth="2" />
              <line x1="75%" y1="50%" x2="75%" y2="100%" stroke="currentColor" strokeWidth="2" />

              {activePic && (
                <>
                  <line x1="50%" y1="0" x2="50%" y2="100%" stroke="#990000" strokeWidth="2.5" className="animated-line" />
                  <line x1="25%" y1="50%" x2="75%" y2="50%" stroke="#990000" strokeWidth="2.5" className="animated-line" />
                  {activeHoveredDepts.map(id => {
                    let pct = null;
                    if (id === 'colab') pct = "25%";
                    if (id === 'tech_hub') pct = "50%";
                    if (id === 'maker_space') pct = "75%";
                    if (!pct) return null;
                    return (
                      <line key={id} x1={pct} y1="50%" x2={pct} y2="100%" stroke="#990000" strokeWidth="2.5" className="animated-line" />
                    );
                  })}
                </>
              )}
            </svg>
          </div>

          {/* Level 2: Specialized Hubs row with NESTED sub-branches */}
          <div className="grid grid-cols-3 gap-4 mt-2 relative z-10 w-11/12 mx-auto items-start">
            
            {DEPARTMENTS.slice(7).map((dept) => {
              const isMatch = matchesSearch(dept);
              const isHoverHighlight = activeHoveredDepts.includes(dept.id);
              const Icon = dept.icon;
              return (
                <div key={dept.id} className="space-y-4">
                  {/* Parent Hub Node */}
                  <button
                    onClick={() => setSelectedDept(dept)}
                    className={`w-full border-2 p-3 text-left cursor-pointer transition-all duration-300 transform bg-white hover:border-[#990000]/60 ${
                      isMatch || isHoverHighlight ? 'border-[#990000] ring-4 ring-[#990000]/10 scale-[1.02] shadow-md' : 'border-neutral-200 shadow-sm'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1 border-b border-neutral-100 pb-1 mb-1">
                      <span className="font-bold text-[10px] uppercase font-barlow tracking-wider text-neutral-900 truncate">
                        {lang === 'vi' ? dept.nameVi : dept.nameEn}
                      </span>
                      <Icon className="h-3.5 w-3.5 shrink-0 text-[#990000]" />
                    </div>
                    <p className="text-[9px] text-neutral-500 leading-snug">
                      Lead: <span className="font-bold text-neutral-800">{dept.pic}</span>
                    </p>
                  </button>

                  {/* Connecting line dropping to subgroups */}
                  <div className="w-0.5 h-4 bg-neutral-300 mx-auto -my-4" />

                  {/* Sub-branches listing tree */}
                  <div className="border-l border-neutral-300 ml-3.5 pl-3.5 space-y-2.5 py-1.5 relative">
                    {dept.subgroups?.map((sub, idx) => {
                      const isSubMatch = matchesSubgroup(sub);
                      const isSubHovered = activePic && sub.pic.toLowerCase().includes(activePic.toLowerCase());
                      
                      return (
                        <div key={idx} className="relative">
                          {/* Horizontal branch line */}
                          <span className="absolute -left-3.5 top-3.5 w-3.5 h-0.5 bg-neutral-300" />
                          
                          {/* Subgroup Card */}
                          <button
                            onClick={() => setSelectedDept(dept)}
                            className={`w-full text-left bg-white border p-2 flex flex-col transition-all cursor-pointer ${
                              isSubMatch || isSubHovered
                                ? 'border-[#990000] bg-[#990000]/5 ring-2 ring-[#990000]/10'
                                : 'border-neutral-200 hover:border-neutral-400'
                            }`}
                          >
                            <span className="font-bold text-[9px] text-neutral-800 leading-tight">
                              {lang === 'vi' ? sub.nameVi.split('(')[0] : sub.nameEn.split('(')[0]}
                            </span>
                            <span className="text-[8px] font-bold text-[#990000] mt-0.5 font-barlow uppercase">
                              P.I.C: {sub.pic}
                            </span>

                            {/* Double nested Colab Projects for UEH CoLab */}
                            {sub.isColabBranch && (
                              <div className="border-l border-neutral-200 pl-2 ml-1 mt-1.5 space-y-1 relative w-full">
                                {dept.colabProjects?.map((proj, pIdx) => {
                                  const isProjMatch = matchesDirectItem(proj);
                                  const isProjHovered = activePic && proj.pic.toLowerCase().includes(activePic.toLowerCase());
                                  
                                  return (
                                    <div key={pIdx} className={`text-[8px] flex justify-between items-center py-0.5 px-1 ${
                                      isProjMatch || isProjHovered ? 'bg-[#990000]/10 text-[#990000] font-bold' : 'text-neutral-500'
                                    }`}>
                                      <span className="truncate">{proj.name.split('(')[0]}</span>
                                      <span className="font-bold shrink-0">{proj.pic}</span>
                                    </div>
                                  );
                                })}
                              </div>
                            )}

                          </button>
                        </div>
                      );
                    })}
                  </div>

                </div>
              );
            })}
          </div>

        </div>
      )}

      {/* VIEWPORT 2: Detailed Matrix Grid (Fully Expanded Dashboard Cards) */}
      {viewMode === 'matrix' && (
        <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2">
          {DEPARTMENTS.map((dept) => {
            const isMatch = matchesSearch(dept);
            const isHoverHighlight = activeHoveredDepts.includes(dept.id);
            const Icon = dept.icon;
            
            return (
              <div
                key={dept.id}
                className={`border bg-white p-5 space-y-4 transition-all duration-300 ${
                  isMatch || isHoverHighlight ? 'border-[#990000] ring-4 ring-[#990000]/5 shadow-md' : 'border-neutral-200 shadow-sm'
                }`}
              >
                {/* Header */}
                <div className="flex items-center gap-3 border-b border-neutral-200 pb-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center bg-[#990000]/10 text-[#990000]">
                    <Icon className="h-5 w-5" />
                  </span>
                  <div>
                    <h3 className="font-barlow text-sm font-black uppercase tracking-wider text-neutral-900 leading-snug">
                      {lang === 'vi' ? dept.nameVi : dept.nameEn}
                    </h3>
                    <p className="text-[10px] text-neutral-400 uppercase tracking-widest mt-0.5">
                      {lang === 'vi' ? dept.roleVi : dept.roleEn}: <span className="font-bold text-[#990000]">{dept.pic}</span>
                    </p>
                  </div>
                </div>

                {/* Subgroups listing with P.I.C details directly visible */}
                <div className="space-y-2.5">
                  <span className="block font-bold text-neutral-400 uppercase text-[9px] tracking-wider">
                    {lang === 'vi' ? 'Phân nhiệm chi tiết' : 'Sub-departments & P.I.C'}
                  </span>
                  <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
                    {dept.subgroups?.map((sub, idx) => (
                      <div key={idx} className="bg-neutral-50 p-2.5 border border-neutral-200 text-xs">
                        <div className="flex justify-between items-start gap-2 border-b border-neutral-100 pb-1 mb-1">
                          <span className="font-bold text-neutral-800">{lang === 'vi' ? sub.nameVi : sub.nameEn}</span>
                          <span className="font-bold text-[#990000] font-barlow uppercase text-[10px] bg-white border border-[#990000]/30 px-1 py-0.2 shrink-0">{sub.pic}</span>
                        </div>
                        <p className="text-neutral-500 leading-relaxed font-ibm text-[10px]">{lang === 'vi' ? sub.descVi : sub.descEn}</p>
                      </div>
                    ))}
                    {!dept.subgroups && dept.members.map((m, idx) => (
                      <div key={idx} className="flex justify-between items-center bg-neutral-50 py-1.5 px-3 border border-neutral-200 text-xs">
                        <span className="font-medium text-neutral-600">{m.roleVi}</span>
                        <span className="font-bold text-[#990000] font-barlow uppercase tracking-wider">{m.name}</span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* VIEWPORT 3: Personnel Directory Grid */}
      {viewMode === 'directory' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            
            {/* GOVERNANCE BOARD */}
            <div className="bg-white border border-neutral-200 p-4 shadow-sm text-left">
              <div className="border-b border-neutral-100 pb-2 mb-3">
                <span className="block font-black text-[#990000] text-xs uppercase tracking-wide">
                  ROLE A: GOVERNANCE BOARD
                </span>
                <span className="text-[10px] text-neutral-400 font-ibm block mt-0.5">
                  {lang === 'vi' ? 'Ban Giám đốc & Kiến trúc sư Dữ liệu' : 'Director & Core Architects'}
                </span>
              </div>
              <div className="space-y-3">
                {filteredUsers.filter(u => u.roleType === 'A').map(u => (
                  <div key={u.id} className="border-l-2 border-[#990000] pl-2 py-0.5">
                    <p className="font-bold text-xs text-neutral-800">{u.name}</p>
                    <p className="text-[10px] text-neutral-500 leading-tight mt-0.5">{u.title}</p>
                    <p className="text-[9px] font-mono text-neutral-400 mt-0.5">{u.email}</p>
                  </div>
                ))}
                {filteredUsers.filter(u => u.roleType === 'A').length === 0 && (
                  <p className="text-[10px] text-neutral-400">{lang === 'vi' ? 'Không tìm thấy' : 'No records found'}</p>
                )}
              </div>
            </div>

            {/* DATA STEWARDS */}
            <div className="bg-white border border-neutral-200 p-4 shadow-sm text-left">
              <div className="border-b border-neutral-100 pb-2 mb-3">
                <span className="block font-black text-blue-800 text-xs uppercase tracking-wide">
                  ROLE B: DATA STEWARDS
                </span>
                <span className="text-[10px] text-neutral-400 font-ibm block mt-0.5">
                  {lang === 'vi' ? 'Quản trị viên & Trưởng chương trình' : 'Program Directors & Stewards'}
                </span>
              </div>
              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                {filteredUsers.filter(u => u.roleType === 'B').map(u => (
                  <div key={u.id} className="border-l-2 border-blue-600 pl-2 py-0.5">
                    <p className="font-bold text-xs text-neutral-800">{u.name}</p>
                    <p className="text-[10px] text-neutral-500 leading-tight mt-0.5">{u.title}</p>
                    <p className="text-[9px] font-mono text-neutral-400 mt-0.5">{u.email}</p>
                  </div>
                ))}
                {filteredUsers.filter(u => u.roleType === 'B').length === 0 && (
                  <p className="text-[10px] text-neutral-400">{lang === 'vi' ? 'Không tìm thấy' : 'No records found'}</p>
                )}
              </div>
            </div>

            {/* LAB RESEARCHERS */}
            <div className="bg-white border border-neutral-200 p-4 shadow-sm text-left">
              <div className="border-b border-neutral-100 pb-2 mb-3">
                <span className="block font-black text-neutral-800 text-xs uppercase tracking-wide">
                  ROLE C: LAB RESEARCHERS
                </span>
                <span className="text-[10px] text-neutral-400 font-ibm block mt-0.5">
                  {lang === 'vi' ? 'Giảng viên & Nghiên cứu viên các Lab' : 'Research Specialists & Staff'}
                </span>
              </div>
              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                {filteredUsers.filter(u => u.roleType === 'C').map(u => (
                  <div key={u.id} className="border-l-2 border-neutral-400 pl-2 py-0.5">
                    <p className="font-bold text-xs text-neutral-800">{u.name}</p>
                    <p className="text-[10px] text-neutral-500 leading-tight mt-0.5">{u.title}</p>
                    <p className="text-[9px] font-mono text-neutral-400 mt-0.5">{u.email}</p>
                  </div>
                ))}
                {filteredUsers.filter(u => u.roleType === 'C').length === 0 && (
                  <p className="text-[10px] text-neutral-400">{lang === 'vi' ? 'Không tìm thấy' : 'No records found'}</p>
                )}
              </div>
            </div>

            {/* EXTERNAL INTERNS */}
            <div className="bg-white border border-neutral-200 p-4 shadow-sm text-left">
              <div className="border-b border-neutral-100 pb-2 mb-3">
                <span className="block font-black text-red-800 text-xs uppercase tracking-wide">
                  ROLE D: EXTERNAL INTERNS
                </span>
                <span className="text-[10px] text-neutral-400 font-ibm block mt-0.5">
                  {lang === 'vi' ? 'Thực tập sinh & Cộng tác viên' : 'Interns & External Contributors'}
                </span>
              </div>
              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                {filteredUsers.filter(u => u.roleType === 'D').map(u => (
                  <div key={u.id} className="border-l-2 border-red-500 pl-2 py-0.5">
                    <p className="font-bold text-xs text-neutral-800">{u.name}</p>
                    <p className="text-[10px] text-neutral-500 leading-tight mt-0.5">{u.title}</p>
                    <p className="text-[9px] font-mono text-neutral-400 mt-0.5">{u.email}</p>
                  </div>
                ))}
                {filteredUsers.filter(u => u.roleType === 'D').length === 0 && (
                  <p className="text-[10px] text-neutral-400">{lang === 'vi' ? 'Không tìm thấy' : 'No records found'}</p>
                )}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Detail Modal Overlay */}
      {selectedDept && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-neutral-200 max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-xl relative animate-in fade-in zoom-in-95 duration-200 rounded-none flex flex-col">
            
            {/* Sticky close button */}
            <div className="sticky top-0 z-10 bg-white border-b border-neutral-100 flex justify-end px-4 py-2 shrink-0">
              <button
                onClick={() => setSelectedDept(null)}
                className="text-neutral-400 hover:text-neutral-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-0">
            {/* Header */}
            <div className="flex items-center gap-3 border-b border-neutral-200 pb-4 mb-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center bg-[#990000]/10 rounded-none">
                {(() => {
                  const Icon = selectedDept.icon;
                  return <Icon className="h-6 w-6 text-[#990000]" />;
                })()}
              </span>
              <div>
                <h3 className="font-barlow text-lg font-black uppercase tracking-wider text-neutral-900 leading-snug">
                  {lang === 'vi' ? selectedDept.nameVi : selectedDept.nameEn}
                </h3>
                <p className="text-xs text-neutral-500 font-ibm mt-0.5">
                  {lang === 'vi' ? selectedDept.roleVi : selectedDept.roleEn}: <span className="font-bold text-neutral-800">{selectedDept.pic}</span>
                </p>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-4 font-sans text-xs">
              <div className="bg-neutral-50 p-3 border border-neutral-200">
                <span className="block font-bold text-[#990000] uppercase text-[10px] tracking-wider mb-1">
                  {lang === 'vi' ? 'Chức năng & Nhiệm vụ chính' : 'Primary Functions & Mandate'}
                </span>
                <p className="leading-relaxed text-neutral-700">
                  {lang === 'vi' ? selectedDept.descVi : selectedDept.descEn}
                </p>
              </div>

              {/* Sub-groups Listing */}
              {selectedDept.subgroups && (
                <div className="space-y-2">
                  <span className="block font-bold text-neutral-500 uppercase text-[10px] tracking-wider">
                    {lang === 'vi' ? 'Chi tiết bộ phận chức năng' : 'Functional Sub-groups & P.I.C'}
                  </span>
                  <div className="space-y-2 max-h-56 overflow-y-auto border border-neutral-200 p-2 divide-y divide-neutral-100">
                    {selectedDept.subgroups.map((sub, idx) => (
                      <div key={idx} className="py-2 first:pt-0">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-bold text-neutral-950">{lang === 'vi' ? sub.nameVi : sub.nameEn}</span>
                          <span className="font-bold text-[#990000] font-barlow text-sm bg-neutral-100 px-2 py-0.5 uppercase">{sub.pic}</span>
                        </div>
                        <p className="text-neutral-500 leading-relaxed font-ibm text-[10px]">{lang === 'vi' ? sub.descVi : sub.descEn}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Special program directors list if Academia */}
              {selectedDept.id === 'academia' && (
                <div className="space-y-2">
                  <span className="block font-bold text-neutral-500 uppercase text-[10px] tracking-wider">
                    {lang === 'vi' ? 'Điều phối viên Chương trình Đào tạo (Academic Programs)' : 'Academic Program Directors'}
                  </span>
                  <div className="grid grid-cols-2 gap-2 border border-neutral-200 p-2.5 max-h-40 overflow-y-auto">
                    {selectedDept.programDirectors.map((prog, idx) => (
                      <div key={idx} className="bg-neutral-50 p-2 border border-neutral-100 flex justify-between items-center text-[10px]">
                        <span className="font-semibold text-neutral-600">{prog.name}</span>
                        <span className="font-bold text-[#990000] font-barlow uppercase">{prog.pic}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Special research units list if Research */}
              {selectedDept.id === 'research' && (
                <div className="space-y-2">
                  <span className="block font-bold text-neutral-500 uppercase text-[10px] tracking-wider">
                    {lang === 'vi' ? 'Lĩnh vực nghiên cứu & Đơn vị phụ trách (Research Units / Labs / PL)' : 'Specialised Research Units & Centers'}
                  </span>
                  <div className="grid grid-cols-2 gap-2 border border-neutral-200 p-2.5 max-h-40 overflow-y-auto">
                    {selectedDept.researchUnits.map((u, idx) => (
                      <div key={idx} className="bg-neutral-50 p-2 border border-neutral-100 flex justify-between items-center text-[10px]">
                        <span className="font-semibold text-neutral-600">{u.name}</span>
                        <span className="font-bold text-[#990000] font-barlow uppercase">{u.pic}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Members P.I.C List for direct listing */}
              <div className="space-y-2">
                <span className="block font-bold text-neutral-500 uppercase text-[10px] tracking-wider">
                  {lang === 'vi' ? 'Nhân sự chịu trách nhiệm chính' : 'P.I.C Roster'}
                </span>
                <div className="border border-neutral-200 divide-y divide-neutral-100 max-h-40 overflow-y-auto">
                  {selectedDept.members.map((m, idx) => (
                    <div key={idx} className="flex justify-between items-center py-2 px-3 hover:bg-neutral-50/50">
                      <span className="font-medium text-neutral-600">{m.roleVi}</span>
                      <span className="font-bold text-[#990000] font-barlow text-sm uppercase tracking-wide">{m.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer buttons */}
            <div className="mt-6 pt-4 border-t border-neutral-200 flex justify-end">
              <button
                onClick={() => setSelectedDept(null)}
                className="bg-neutral-900 hover:bg-[#990000] text-white font-barlow font-bold text-xs uppercase tracking-widest py-2 px-4 transition-colors rounded-none"
              >
                {lang === 'vi' ? 'Đóng' : 'Close'}
              </button>
            </div> {/* end footer */}

            </div> {/* end p-6 wrapper */}

          </div>
        </div>
      )}

    </div>
  );
}

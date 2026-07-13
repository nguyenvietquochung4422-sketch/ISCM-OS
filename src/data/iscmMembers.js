/**
 * Danh bạ thành viên ISCM — song ngữ VI/EN (nguồn: website ISCM 07/2026).
 * Dùng cho mục "Thông tin thành viên" trong Cơ cấu tổ chức ISCM.
 * group: board | program | head | lecturer | staff | intern
 */

export const MEMBER_GROUPS = [
  { key: 'all', labelVi: 'Tất cả', labelEn: 'All' },
  { key: 'board', labelVi: 'Ban Giám đốc', labelEn: 'Board' },
  { key: 'program', labelVi: 'Giám đốc chương trình', labelEn: 'Program Directors' },
  { key: 'head', labelVi: 'Quản lý bộ phận', labelEn: 'Heads' },
  { key: 'lecturer', labelVi: 'Giảng viên', labelEn: 'Lecturers' },
  { key: 'staff', labelVi: 'Chuyên viên & CTV', labelEn: 'Officers & Collaborators' },
  { key: 'intern', labelVi: 'Thực tập sinh', labelEn: 'Interns' },
];

export const ISCM_MEMBERS = [
  // ---- Ban Giám đốc ----
  // Quy ước học hàm/học vị: VI dùng tiền tố chuẩn VN (PGS. TS. / TS. KTS. / ThS.);
  // EN dùng hậu tố học vị thống nhất (", PhD" / ", M.Arch" / ", M.Sc"...), không dùng "Dr. Arch".
  { id: 'm01', group: 'board', nameVi: 'PGS. TS. Trịnh Tú Anh', nameEn: 'Assoc.Prof. Tu Anh Trinh, PhD', titleVi: 'Viện trưởng', titleEn: 'Director', fieldVi: '', fieldEn: '' },
  { id: 'm02', group: 'board', nameVi: 'ThS. KTS. Trần Thị Quỳnh Mai', nameEn: 'Mai Quynh Thi Tran, M.Arch', titleVi: 'Viện phó', titleEn: 'Vice Director', fieldVi: 'Kiêm Giám đốc chương trình — Kiến trúc và Thiết kế Đô thị Thông minh (Song bằng)', fieldEn: 'Concurrently Director of Bachelor Program — Architectural and Urban Design for Inclusive Smart City (Dual Degree)', duties: ['Head · Operation & Finance', 'Admission & Outreach · Academia', 'BAUD.d · Program', 'Glocal Design Theory', 'Governance & Planning · PL', 'MeKong · Living Lab'] },

  // ---- Giám đốc chương trình ----
  { id: 'm03', group: 'program', nameVi: 'ThS. Đặng Thế Hiển', nameEn: 'Hien The Dang, M.Sc', titleVi: 'Giám đốc chương trình', titleEn: 'Director of Bachelor Program', fieldVi: 'Kiến trúc và Thiết kế Đô thị Thông minh (Kiến trúc sư)', fieldEn: 'Architectural and Urban Design for Inclusive Smart City (Architect)', duties: ['BAUD.a · Program', 'Glocal StudioLab', 'smART-Hub · Living Lab'] },
  { id: 'm04', group: 'program', nameVi: 'TS. Phạm Nguyễn Hoài', nameEn: 'Hoai Nguyen Pham, PhD', titleVi: 'Giám đốc chương trình', titleEn: 'Director of Bachelor Program', fieldVi: 'Quản trị Vận hành và Di chuyển Thông minh', fieldEn: 'Smart Mobility and Operation Management', duties: ['Head · Research', 'Research Progress & Publication', 'BMOM · Program', 'SCIM · Program', 'Engineering Systems & Design', 'Move System · IRL', 'New Economy · PL', 'Alumni · Community'] },

  // ---- Quản lý bộ phận ----
  { id: 'm05', group: 'head', nameVi: 'TS. KTS. Hoàng Ngọc Lan', nameEn: 'Lan Ngoc Hoang, PhD', titleVi: 'Quản lý Đào tạo', titleEn: 'Head of Academia', fieldVi: '', fieldEn: '', duties: ['Head & Academic Affairs · Academia', 'SCIM · Program'] },
  { id: 'm06', group: 'head', nameVi: 'TS. KTS. Huỳnh Văn Khang', nameEn: 'Khang Van Huynh, PhD', titleVi: 'Quản lý Kết nối cộng đồng', titleEn: 'Head of Community Engagement', fieldVi: '', fieldEn: '', duties: ['Head · Community Engagement', 'ISCM Club', 'RED Series', 'Curator'] },
  { id: 'm07', group: 'head', nameVi: 'ThS. Lại Phương Dung', nameEn: 'Dung Lai Phuong, M.A', titleVi: 'Quản lý Đối tác', titleEn: 'Head of Partnership', fieldVi: '', fieldEn: '', duties: ['Head · Partnership', 'G-B-A Network (Academia · Industry · Authority)'] },
  { id: 'm08', group: 'head', nameVi: 'Lê Thị Thủy Tiên', nameEn: 'Tien Thuy Thi Le, B.E', titleVi: 'Quản lý Truyền thông', titleEn: 'Head of PR & Communication', fieldVi: '', fieldEn: '', duties: ['Head · PR & Communication', 'Digital & Data Governance · UEH CoLab', 'PR & Communication · Maker Space'] },

  // ---- Giảng viên ----
  { id: 'm09', group: 'lecturer', nameVi: 'ThS. Đỗ Lê Phúc Tâm', nameEn: 'Tam Phuc Le Do, M.Sc', titleVi: 'Giảng viên', titleEn: 'Lecturer', fieldVi: 'Phát triển Đô thị Thông minh', fieldEn: 'Smart Urban Development', duties: ['Smart City & Urban Innovation · Academia', 'Smart City · RL', 'Immersive Tech Convergence · TIL', 'Coordinator · Tech Convergence Hub', 'Nexus · Living Lab'] },
  { id: 'm10', group: 'lecturer', nameVi: 'TS. Lê Thanh Nam', nameEn: 'Nam Thanh Le, PhD', titleVi: 'Giảng viên', titleEn: 'Lecturer', fieldVi: 'Hạ tầng đô thị & Phát triển bền vững', fieldEn: 'Urban Infrastructure & Sustainable Development' },
  { id: 'm11', group: 'lecturer', nameVi: 'TS. Hoàng Phi Long', nameEn: 'Long Phi Hoang, PhD', titleVi: 'Giáo sư thỉnh giảng', titleEn: 'Adjunct Lecturer', fieldVi: 'Môi trường & Thích ứng biến đổi khí hậu', fieldEn: 'Environmental Science' },
  { id: 'm12', group: 'lecturer', nameVi: 'TS. Võ Dao Chi', nameEn: 'Dao Chi Vo, PhD', titleVi: 'Giảng viên', titleEn: 'Lecturer', fieldVi: 'Hạ tầng đô thị & Phát triển bền vững', fieldEn: 'Urban Infrastructure & Sustainable Development', duties: ['Data Driven & Urban Design · RL'] },
  { id: 'm13', group: 'lecturer', nameVi: 'TS. Vương Trần Quang', nameEn: 'Quang Tran Vuong, PhD', titleVi: 'Giảng viên', titleEn: 'Lecturer', fieldVi: 'Môi trường & Thích ứng biến đổi khí hậu', fieldEn: 'Environmental Science', duties: ['Seminar · Research', 'Research Progress & Publication', 'Fund Raising'] },
  { id: 'm14', group: 'lecturer', nameVi: 'ThS. Sandhya Rao', nameEn: 'Sandhya Rao, M.Arch', titleVi: 'Giảng viên', titleEn: 'Lecturer', fieldVi: 'Kiến trúc & Thiết kế đô thị', fieldEn: 'Architecture & Urban Design', duties: ['Net Zero Open · PL'] },
  { id: 'm15', group: 'lecturer', nameVi: 'ThS. KTS. Hoàng Lê Nam Hải', nameEn: 'Nam-Hai Hoang, M.Arch', titleVi: 'Giảng viên', titleEn: 'Lecturer', fieldVi: 'Kiến trúc & Thiết kế đô thị', fieldEn: 'Architecture & Urban Design', duties: ['Non-Degree Program · Coordinator'] },
  { id: 'm16', group: 'lecturer', nameVi: 'ThS. Daniela Hurtarte', nameEn: 'Daniela Hurtarte, M.Sc', titleVi: 'Giảng viên', titleEn: 'Lecturer', fieldVi: 'Quy hoạch Vùng & Đô thị', fieldEn: 'Urban Planning & Design', duties: ['Public Space Living Lab · PL'] },
  { id: 'm17', group: 'lecturer', nameVi: 'TS. Nguyễn Tấn Trung', nameEn: 'Trung Nguyen Tan, PhD', titleVi: 'Giảng viên', titleEn: 'Lecturer', fieldVi: 'Khoa học & Kỹ thuật Môi trường', fieldEn: 'Environmental Engineering & Science' },

  // ---- Chuyên viên & Cộng tác viên ----
  { id: 'm18', group: 'staff', nameVi: 'ThS. Lê Phan Trường An', nameEn: 'An Truong Phan Le, MUD', titleVi: 'Chuyên viên', titleEn: 'Officer', fieldVi: 'Di chuyển thông minh', fieldEn: 'Smart Mobility', duties: ['Facility V · O&F', 'Document International · O&F'] },
  { id: 'm19', group: 'staff', nameVi: 'Nguyễn Hoàng Phúc', nameEn: 'Phuc Hoang Nguyen, B.Arch', titleVi: 'Chuyên viên MakerSpace', titleEn: 'Officer MakerSpace', fieldVi: '', fieldEn: '', duties: ['Facility B · O&F', 'Operation & Product · Maker Space', 'Student Mentors/Crew · Maker Space'] },
  { id: 'm20', group: 'staff', nameVi: 'Lê Phúc Toàn', nameEn: 'Toan Phuc Le, B.E', titleVi: 'Chuyên viên thiết kế', titleEn: 'Designer', fieldVi: '', fieldEn: '' },
  { id: 'm21', group: 'staff', nameVi: 'ThS. Thái Anh Vũ', nameEn: 'Vu Anh Thai, M.Sc', titleVi: 'Chuyên viên', titleEn: 'Researcher', fieldVi: 'Smart City', fieldEn: 'Smart City', duties: ['All Equipment · O&F', 'Document Domestic · O&F'] },
  { id: 'm22', group: 'staff', nameVi: 'Nguyễn Quỳnh Trâm', nameEn: 'Tram Quynh Nguyen, B.A', titleVi: 'Điều phối viên', titleEn: 'Coordinator', fieldVi: 'UEH CoLab', fieldEn: 'UEH CoLab', duties: ['HR & Internal Affairs · O&F', 'Co-creation · UEH CoLab', 'Operation Coordinator · UEH CoLab'] },
  { id: 'm23', group: 'staff', nameVi: 'Lưu Phạm Thanh Bình', nameEn: 'Binh Thanh Pham Luu, B.A', titleVi: 'Cộng tác viên Thiết kế', titleEn: 'Design Collaborator', fieldVi: 'UEH CoLab', fieldEn: 'UEH CoLab', duties: ['Design & Spatial Innovation · UEH CoLab'] },
  { id: 'm24', group: 'staff', nameVi: 'Trần Vĩnh Tài', nameEn: 'Tai Vinh Tran, B.A', titleVi: 'Cộng tác viên', titleEn: 'Collaborator', fieldVi: 'Studio Lab', fieldEn: 'Studio Lab', duties: ['Student Product · Community', 'Equipment · Tech Convergence Hub'] },

  // ---- Thực tập sinh ----
  { id: 'i01', group: 'intern', nameVi: 'Phạm Võ Hồng Dung', nameEn: 'Dung Hong Vo Pham, B.A', titleVi: 'Thực tập sinh', titleEn: 'Intern', fieldVi: 'Truyền thông', fieldEn: 'PR & Communication', duties: ['Content & Social Media · PR & Comm'] },
  { id: 'i02', group: 'intern', nameVi: 'Bùi Thảo Nguyên', nameEn: 'Bui Thao Nguyen', titleVi: 'Thực tập sinh', titleEn: 'Intern', fieldVi: 'Truyền thông', fieldEn: 'PR & Communication', duties: ['Content & Social Media · PR & Comm', 'PR & Communication · Maker Space'] },
  { id: 'i03', group: 'intern', nameVi: 'Nguyễn Hà Cẩm Tiên', nameEn: 'Nguyen Ha Cam Tien', titleVi: 'Thực tập sinh', titleEn: 'Intern', fieldVi: 'Truyền thông', fieldEn: 'PR & Communication' },
  { id: 'i04', group: 'intern', nameVi: 'Lương Thị Thuý An', nameEn: 'Luong Thi Thuy An', titleVi: 'Thực tập sinh', titleEn: 'Intern', fieldVi: 'Thiết kế', fieldEn: 'Design' },
  { id: 'i05', group: 'intern', nameVi: 'Nguyễn Minh Huy', nameEn: 'Nguyen Minh Huy', titleVi: 'Thực tập sinh', titleEn: 'Intern', fieldVi: 'Thiết kế', fieldEn: 'Design' },
  { id: 'i06', group: 'intern', nameVi: 'Trương Thành Đạt', nameEn: 'Truong Thanh Dat', titleVi: 'Thực tập sinh', titleEn: 'Intern', fieldVi: 'Công nghệ', fieldEn: 'IT Digital Platform' },
  { id: 'i07', group: 'intern', nameVi: 'Nguyễn Ngọc Thiện', nameEn: 'Nguyen Ngoc Thien', titleVi: 'Thực tập sinh', titleEn: 'Intern', fieldVi: 'Tech Convergence Hub', fieldEn: 'Tech Convergence Hub' },
  { id: 'i08', group: 'intern', nameVi: 'Nguyễn Viết Quốc Hùng', nameEn: 'Hung Quoc Viet Nguyen, B.A', titleVi: 'Thực tập sinh', titleEn: 'Intern', fieldVi: 'Smart City', fieldEn: 'Smart City' },
  { id: 'i09', group: 'intern', nameVi: 'Nguyễn Lương Minh Thư', nameEn: 'Nguyen Luong Minh Thu', titleVi: 'Thực tập sinh', titleEn: 'Intern', fieldVi: 'Public Space Living Lab', fieldEn: 'Public Space Living Lab' },
  { id: 'i10', group: 'intern', nameVi: 'Hoàng Trương Tiến Đạt', nameEn: 'Hoang Truong Tien Dat', titleVi: 'Thực tập sinh', titleEn: 'Intern', fieldVi: 'Public Space Living Lab', fieldEn: 'Public Space Living Lab' },
  { id: 'i11', group: 'intern', nameVi: 'Ngô An Phú', nameEn: 'Ngo An Phu', titleVi: 'Thực tập sinh', titleEn: 'Intern', fieldVi: 'smART Hub', fieldEn: 'smART Hub' },
];

/** Chữ cái viết tắt cho avatar — bỏ học hàm/học vị, lấy 2 từ cuối của tên */
export function memberInitials(nameVi) {
  const words = nameVi
    .split(' ')
    .filter((w) => w && !w.includes('.') && w !== 'KTS' && w !== 'ThS' && w !== 'TS' && w !== 'PGS');
  return words.slice(-2).map((w) => w[0]).join('').toUpperCase();
}

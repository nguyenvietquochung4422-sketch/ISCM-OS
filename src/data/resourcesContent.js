/**
 * Operation & Finance > RESOURCES — document content for the 6 category
 * pages (Guidelines / Policies & Regulations / Official Documents /
 * Templates / Lists & Directories / Materials). Deliberately NOT part of
 * SIDEBAR_TREE: the sidebar only goes one level deep (category), because
 * at ~15-20 items per category this would otherwise blow the left nav out
 * to 60-80 rows. The category content pages in PersonalDashboard.jsx read
 * from here and render the subgroup/document breakdown in the main
 * viewport instead.
 *
 * Scoped to Operation & Finance only — Research/Academia/Partnership items
 * that were previously mixed into the old "Wiki Hub" tree are dropped here
 * (they belong to those groups' own Resources once built, not O&F's).
 *
 * Each document uses the same `wiki-doc:<Title>` key convention the rest
 * of the app already uses, so PersonalDashboard's generic wiki-doc detail
 * view (and any of the few hardcoded rich views, e.g. the ISCM org-model
 * doc) keeps working unchanged.
 */

function doc(vi, en) {
  return { key: `wiki-doc:${vi}`, labelVi: vi, labelEn: en || vi };
}

const CATEGORIES_VI = {
  'wiki-guidelines-branch': {
    label: 'Hướng dẫn',
    groups: [
      {
        label: 'Hệ thống & Hành chính',
        docs: [
          doc('Hướng dẫn sử dụng UEHer'),
          doc('Hướng dẫn giao việc trên Smart Office'),
          doc('Thể thức trình bày văn bản trình ký'),
        ],
      },
      {
        label: 'Tài chính',
        docs: [
          doc('Hồ sơ thanh toán'),
          doc('Hướng dẫn thanh toán'),
        ],
      },
      {
        label: 'Nhân sự',
        docs: [
          doc('Hướng dẫn hồ sơ nhân sự chương trình UEH100'),
        ],
      },
      {
        label: 'Sự kiện & Truyền thông',
        docs: [
          doc('Hướng dẫn quy trình thực hiện sự kiện'),
          doc('QUY TRÌNH TỔ CHỨC SỰ KIỆN'),
          doc('Book khách sạn UEH'),
          doc('Đăng ký cộng điểm rèn luyện DRS'),
          doc('Xin quà tặng UEH'),
        ],
      },
    ],
  },
  'wiki-policies-branch': {
    label: 'Chính sách & Quy định',
    groups: [
      {
        label: 'Nhân sự',
        docs: [
          doc('Mô hình tổ chức và quản lý tại ISCM'),
          doc('Quy định chế độ làm việc giảng viên'),
          doc('Quy chế tuyển dụng viên chức'),
          doc('Quy định chế độ trợ giảng'),
          doc('Quy định về Chuyên gia học thuật'),
          doc('Quy định về quy tắc ứng xử và làm việc tại ISCM'),
          doc('Quy chế thành viên Viện'),
        ],
      },
      {
        label: 'Tài chính & Vận hành',
        docs: [
          doc('QUY CHẾ CHI TIÊU NỘI BỘ 2026'),
          doc('Quy chế họp nội bộ'),
          doc('Quy định mượn, sử dụng và bảo quản thiết bị'),
          doc('Quy định Order Quà tặng ISCM'),
          doc('Quy định Quản lý và Cung cấp Văn phòng phẩm'),
        ],
      },
    ],
  },
  'wiki-official-branch': {
    label: 'Văn bản chính thức',
    groups: [
      {
        label: 'Thể chế',
        docs: [
          doc('QĐ thành lập UEH'),
          doc('QĐ thành lập ISCM'),
          doc('QĐ bổ nhiệm CTD 2025-2030'),
          doc('[2026-01-01][ISCM-OD][Cơ cấu tổ chức và sơ đồ phân nhiệm ISCM].pdf', '[2026-01-01][ISCM-OD][ISCM Organizational Structure and Chart].pdf'),
        ],
      },
    ],
  },
  'wiki-templates-branch': {
    label: 'Văn bản mẫu',
    groups: [
      {
        label: 'Nhân sự',
        docs: [
          doc('LLKH thỉnh giảng'),
          doc('KPI giảng viên nước ngoài'),
          doc('Đăng ký mã số thuế'),
          doc('Đơn gia nhập công đoàn'),
          doc('Đơn cam kết thu nhập'),
        ],
      },
      {
        label: 'Tài chính',
        docs: [
          doc('Bộ hợp đồng thanh toán'),
        ],
      },
      {
        label: 'Cuộc họp',
        docs: [
          doc('Biên bản cuộc họp mẫu'),
        ],
      },
      {
        label: 'Sự kiện & Truyền thông',
        docs: [
          doc('Đơn đề nghị tham dự hội thảo'),
          doc('Báo cáo Hội nghị quốc tế — Trước sự kiện / PA03', 'International Conference Report — Before Event / PA03'),
          doc('Báo cáo Hội nghị quốc tế — Sau sự kiện', 'International Conference Report — Post-event Report'),
          doc('Kế hoạch tổ chức sự kiện nội bộ'),
          doc('Kế hoạch tổ chức sự kiện'),
          doc('Mẫu bài viết truyền thông', 'Communication Content Template'),
          doc('Đề nghị xin quà tặng UEH'),
        ],
      },
    ],
  },
  'wiki-reference-branch': {
    label: 'Danh mục & Danh bạ',
    groups: [
      {
        label: 'Nhân sự',
        docs: [
          doc('Danh sách thành viên CTD'),
          doc('Danh sách nhân sự & Giảng viên thỉnh giảng'),
          doc('Bảng mô tả công việc'),
          doc('Folder hồ sơ GV thỉnh giảng', 'Visiting Lecturer Documents Folder'),
        ],
      },
      {
        label: 'Hành chính',
        docs: [
          doc('Hệ thống số văn bản nội bộ'),
          doc('Bảng phân công trách nhiệm tổng cục'),
        ],
      },
      {
        label: 'Tài chính & Cơ sở vật chất',
        docs: [
          doc('Thông tin mã số thuế & Nhà hàng'),
          doc('Danh mục thiết bị & Công cụ phòng Lab'),
        ],
      },
      {
        label: 'Thư viện',
        docs: [
          doc('Danh mục sách thư viện'),
        ],
      },
    ],
  },
  'wiki-media-branch': {
    label: 'Tư liệu',
    groups: [
      {
        label: 'Tư liệu Tập đoàn',
        docs: [
          doc('Hồ sơ năng lực ISCM Portfolio'),
          doc('Brochure giới thiệu ISCM'),
          doc('Slide giới thiệu tổng cục'),
          doc('Brochure chuỗi sự kiện 2026'),
        ],
      },
      {
        label: 'Tài sản Thương hiệu',
        docs: [
          doc('Bộ nhận diện thương hiệu UEH'),
          doc('Kho lưu trữ Hình ảnh & Video'),
          doc('Khung biểu mẫu Office Kit'),
        ],
      },
      {
        label: 'Tài sản Nhận diện',
        docs: [
          doc('Danh thiếp ISCM', 'Business Card'),
          doc('Chữ ký email ISCM', 'ISCM Email Signature'),
          doc('Chữ ký email đa vị trí', 'Multiple-position Email Signature'),
          doc('Ảnh đại diện nhóm', 'Group Avatar'),
        ],
      },
    ],
  },
};

const CATEGORY_LABEL_EN = {
  'wiki-guidelines-branch': 'Guidelines',
  'wiki-policies-branch': 'Policies & Regulations',
  'wiki-official-branch': 'Official Documents',
  'wiki-templates-branch': 'Templates',
  'wiki-reference-branch': 'Lists & Directories',
  'wiki-media-branch': 'Materials',
};

const GROUP_LABEL_EN = {
  'Hệ thống & Hành chính': 'Systems & Administration',
  'Tài chính': 'Finance',
  'Nhân sự': 'Human Resources',
  'Sự kiện & Truyền thông': 'Events & Communication',
  'Tài chính & Vận hành': 'Finance & Operations',
  'Thể chế': 'Institutional',
  'Cuộc họp': 'Meetings',
  'Hành chính': 'Administration',
  'Tài chính & Cơ sở vật chất': 'Finance & Facilities',
  'Thư viện': 'Library',
  'Tư liệu Tập đoàn': 'Corporate Materials',
  'Tài sản Thương hiệu': 'Brand Assets',
  'Tài sản Nhận diện': 'Identity Assets',
};

function toLangShape(lang) {
  const out = {};
  Object.entries(CATEGORIES_VI).forEach(([catKey, cat]) => {
    out[catKey] = {
      label: lang === 'vi' ? cat.label : CATEGORY_LABEL_EN[catKey],
      groups: cat.groups.map((g) => ({
        label: lang === 'vi' ? g.label : (GROUP_LABEL_EN[g.label] || g.label),
        docs: g.docs.map((d) => ({ key: d.key, label: lang === 'vi' ? d.labelVi : d.labelEn })),
      })),
    };
  });
  return out;
}

/** RESOURCES_CONTENT[lang][categoryKey] = { label, groups: [{ label, docs: [{key,label}] }] } */
export const RESOURCES_CONTENT = {
  vi: toLangShape('vi'),
  en: toLangShape('en'),
};

export const RESOURCE_CATEGORY_KEYS = Object.keys(CATEGORIES_VI);

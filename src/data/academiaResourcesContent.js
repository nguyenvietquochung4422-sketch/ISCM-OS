/**
 * Academia > RESOURCES — same pattern as Operation & Finance's
 * resourcesContent.js: sidebar only goes to category level, this file
 * holds the subgroup/document breakdown the category content pages read.
 *
 * Only 4 categories ship in v1 (no Lists & Directories) — there's no real
 * Academia-scoped list/directory document yet, and empty categories don't
 * render rather than showing as an empty shell.
 *
 * A few items are deliberately left out even though they exist in the old
 * source data (Outside Class Registration, Grade Adjustment Form, Student
 * Off-site Commitment Form) because it's unclear whether they're meant to
 * be read-only reference or an actual submit-a-request workflow — safer
 * to omit than to misclassify as a passive Resource when it might need
 * real E-Form treatment later.
 */

function doc(vi, en) {
  return { key: `wiki-doc:${vi}`, labelVi: vi, labelEn: en || vi };
}

const CATEGORIES_VI = {
  'academia-guidelines-branch': {
    label: 'Hướng dẫn',
    groups: [
      {
        label: 'Mở ngành / Chương trình',
        docs: [
          doc('Quy trình mở ngành/CTĐT UEH'),
          doc('Quy trình hồ sơ mở ngành/CTĐT ISCM'),
        ],
      },
      {
        label: 'Giảng dạy',
        docs: [
          doc('Quy trình đảm bảo tiêu chuẩn giảng dạy'),
          doc('Hướng dẫn quy trình khảo sát môn học / đi thực địa', 'Field Visit / Course Survey Guideline'),
        ],
      },
    ],
  },
  'academia-policies-branch': {
    label: 'Chính sách & Quy định',
    groups: [
      {
        label: 'Mở ngành / Chương trình',
        docs: [
          doc('Hệ thống văn bản mở ngành Bộ GDĐT & UEH'),
        ],
      },
    ],
  },
  'academia-official-branch': {
    label: 'Văn bản chính thức',
    groups: [
      {
        label: 'Mở ngành / Chương trình',
        docs: [
          doc('Hồ sơ mở ngành khung'),
        ],
      },
    ],
  },
  'academia-templates-branch': {
    label: 'Văn bản mẫu',
    groups: [
      {
        label: 'Khảo sát & Thực địa',
        docs: [
          doc('Công văn giới thiệu khảo sát môn học'),
          doc('Giấy giới thiệu SV đi thực tập'),
        ],
      },
    ],
  },
};

const CATEGORY_LABEL_EN = {
  'academia-guidelines-branch': 'Guidelines',
  'academia-policies-branch': 'Policies & Regulations',
  'academia-official-branch': 'Official Documents',
  'academia-templates-branch': 'Templates',
};

const GROUP_LABEL_EN = {
  'Mở ngành / Chương trình': 'Programme Opening',
  'Giảng dạy': 'Teaching',
  'Khảo sát & Thực địa': 'Field Visits & Surveys',
};

const DOC_LABEL_EN_OVERRIDE = {
  'wiki-doc:Quy trình mở ngành/CTĐT UEH': 'Programme Opening Guideline',
  'wiki-doc:Quy trình hồ sơ mở ngành/CTĐT ISCM': 'ISCM Programme Opening Document Guideline',
  'wiki-doc:Quy trình đảm bảo tiêu chuẩn giảng dạy': 'Teaching Standard Assurance Process',
  'wiki-doc:Hệ thống văn bản mở ngành Bộ GDĐT & UEH': 'Programme Opening Regulations',
  'wiki-doc:Hồ sơ mở ngành khung': 'Programme Opening Documents',
  'wiki-doc:Công văn giới thiệu khảo sát môn học': 'Field Visit / Course Survey Introduction Letter',
  'wiki-doc:Giấy giới thiệu SV đi thực tập': 'Student Internship Introduction Letter',
};

function toLangShape(lang) {
  const out = {};
  Object.entries(CATEGORIES_VI).forEach(([catKey, cat]) => {
    out[catKey] = {
      label: lang === 'vi' ? cat.label : CATEGORY_LABEL_EN[catKey],
      groups: cat.groups.map((g) => ({
        label: lang === 'vi' ? g.label : (GROUP_LABEL_EN[g.label] || g.label),
        docs: g.docs.map((d) => ({ key: d.key, label: lang === 'vi' ? d.labelVi : (DOC_LABEL_EN_OVERRIDE[d.key] || d.labelEn) })),
      })),
    };
  });
  return out;
}

export const ACADEMIA_RESOURCES_CONTENT = {
  vi: toLangShape('vi'),
  en: toLangShape('en'),
};

export const ACADEMIA_RESOURCE_CATEGORY_KEYS = Object.keys(CATEGORIES_VI);

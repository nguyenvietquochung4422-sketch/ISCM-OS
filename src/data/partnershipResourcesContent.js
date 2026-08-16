/**
 * Partnership > RESOURCES — same category-only-sidebar pattern as O&F and
 * Academia. Only 2 categories ship in v1 (Guidelines, Templates) — no
 * Policies & Regulations / Official Documents / Lists & Directories,
 * because there's no real Partnership-scoped document for those yet.
 *
 * Several of these were originally miscategorized under Operation &
 * Finance's old "Wiki Hub" tree (MOU Signing Guideline, MOU Template,
 * Sponsors Confirmation, Sponsor Invoice, Expert Invitation Letter) and
 * were dropped from O&F's Resources rebuild specifically because they're
 * Partnership-scoped, not O&F — they land here instead, completing that
 * earlier scoping decision rather than duplicating or losing them.
 */

function doc(vi, en) {
  return { key: `wiki-doc:${vi}`, labelVi: vi, labelEn: en || vi };
}

const CATEGORIES_VI = {
  'partnership-guidelines-branch': {
    label: 'Hướng dẫn',
    groups: [
      {
        label: 'MOU & Thoả thuận hợp tác',
        docs: [
          doc('Quy trình ký MOU các cấp'),
        ],
      },
    ],
  },
  'partnership-templates-branch': {
    label: 'Văn bản mẫu',
    groups: [
      {
        label: 'Thoả thuận hợp tác',
        docs: [
          doc('Biểu mẫu MOUs'),
        ],
      },
      {
        label: 'Tài trợ',
        docs: [
          doc('Biên bản xác nhận tài trợ giáo dục'),
          doc('Invoice tài trợ đơn vị nước ngoài'),
        ],
      },
      {
        label: 'Gắn kết đối tác',
        docs: [
          doc('Thư mời tham quan ISCM/UEH/CTD', 'Invitation Letter to Visit ISCM/UEH/CTD'),
        ],
      },
    ],
  },
};

const CATEGORY_LABEL_EN = {
  'partnership-guidelines-branch': 'Guidelines',
  'partnership-templates-branch': 'Templates',
};

const GROUP_LABEL_EN = {
  'MOU & Thoả thuận hợp tác': 'MOU & Agreements',
  'Thoả thuận hợp tác': 'Agreements',
  'Tài trợ': 'Sponsorship',
  'Gắn kết đối tác': 'Partner Engagement',
};

const DOC_LABEL_EN_OVERRIDE = {
  'wiki-doc:Quy trình ký MOU các cấp': 'MOU Signing Guideline',
  'wiki-doc:Biểu mẫu MOUs': 'MOU Template',
  'wiki-doc:Biên bản xác nhận tài trợ giáo dục': 'Educational Sponsorship Confirmation',
  'wiki-doc:Invoice tài trợ đơn vị nước ngoài': 'Sponsor Invoice — International Organization',
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

export const PARTNERSHIP_RESOURCES_CONTENT = {
  vi: toLangShape('vi'),
  en: toLangShape('en'),
};

export const PARTNERSHIP_RESOURCE_CATEGORY_KEYS = Object.keys(CATEGORIES_VI);

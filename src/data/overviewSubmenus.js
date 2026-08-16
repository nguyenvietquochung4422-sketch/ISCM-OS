/**
 * Sub-items under the "ISCM OVERVIEW" navbar dropdown's two groups —
 * UEH & Other Units, and ISCM & Other Units. Each still routes to a generic
 * "Under Construction" placeholder page (App.jsx renderPlaceholder), using
 * the label below instead of a slug-derived title.
 */
export const OVERVIEW_SUBMENUS = [
  {
    id: 'ueh-units',
    labelVi: 'UEH & Các đơn vị thành viên',
    labelEn: 'UEH & Other Units',
    items: [
      { key: 'placeholder-dl2-ueher', labelVi: 'UEHer', labelEn: 'UEHer' },
      { key: 'placeholder-dl2-finance', labelVi: 'Tài chính kế toán', labelEn: 'Finance & Accounting' },
      { key: 'placeholder-dl2-knowledge', labelVi: 'Kho tri thức', labelEn: 'Knowledge Base' },
      { key: 'placeholder-dl2-programs', labelVi: 'Tra cứu chương trình đào tạo', labelEn: 'Training Program Lookup' },
      { key: 'placeholder-dl2-timeline', labelVi: 'Khung thời gian đào tạo', labelEn: 'Training Timeline' },
    ],
  },
  {
    id: 'iscm-units',
    labelVi: 'ISCM & Các đối tác ngoại khối',
    labelEn: 'ISCM & Other Units',
    items: [
      { key: 'placeholder-dl4-strategy', labelVi: 'Chiến lược + Kế hoạch ISCM', labelEn: 'ISCM Strategy & Plan' },
      { key: 'placeholder-dl4-ueh', labelVi: 'ISCM & UEH', labelEn: 'ISCM & UEH' },
      { key: 'placeholder-dl4-ctd', labelVi: 'ISCM & CTD', labelEn: 'ISCM & CTD' },
      { key: 'placeholder-dl4-colab', labelVi: 'ISCM & UEH Co-Lab', labelEn: 'ISCM & UEH Co-Lab' },
      { key: 'placeholder-dl4-techhub', labelVi: 'ISCM & Convergence Tech Hub', labelEn: 'ISCM & Convergence Tech Hub' },
      { key: 'placeholder-dl4-makerspace', labelVi: 'ISCM & MakerSpace', labelEn: 'ISCM & MakerSpace' },
      { key: 'placeholder-dl4-evaluations', labelVi: 'Các đánh giá của ISCM', labelEn: 'ISCM Evaluations' },
    ],
  },
];

/** Flat key -> English label, for App.jsx's generic placeholder page title. */
export const PLACEHOLDER_TITLES = Object.fromEntries(
  OVERVIEW_SUBMENUS.flatMap((g) => g.items.map((i) => [i.key, i.labelEn]))
);

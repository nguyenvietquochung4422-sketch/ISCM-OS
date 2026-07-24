/**
 * Wiki Hub (Knowledge Base) — 4 branches × department sections.
 * Docs carry real-looking filenames so the [Date][Project Name][Document Title]
 * compliance check has both passing and failing examples to flag.
 */

/** Strict naming protocol: [Date][Project Name][Document Title]… */
export const NAMING_PATTERN = /^\[[^\]]+\]\[[^\]]+\]\[[^\]]+\]/;
export const isNameCompliant = (name) => NAMING_PATTERN.test(name);

export const WIKI_BRANCHES = {
  guidelines: {
    label: 'Guidelines', emoji: '📘',
    blurb: 'How-to documents — operational procedures every member follows day to day.',
    sections: [
      { section: 'Communications', topics: ['Communication Support', 'ISCM Corporate Branding'],
        docs: [{ name: '[2026-02-10][ISCM-Comms][Brand Usage Guideline].pdf', updated: '2026-02-10' }] },
      { section: 'Human Resources', topics: ['Internal Grade System', 'Learning & Development', 'Leave registration', 'Onboarding', 'Personal income tax', 'Public Holidays & Leave Calendar', 'Termination Process'],
        docs: [
          { name: '[2026-01-05][ISCM-HR][Leave Registration Guideline].pdf', updated: '2026-01-05' },
          { name: 'onboarding_final_v3.docx', updated: '2025-11-20' },
        ] },
      { section: 'Most Common', topics: ['Fieldwork trip', 'Connect to ISCM network', 'AI-assisted research tools', 'Improve working productivity', 'Information for new employee', 'Information security', 'Information Technology', 'Parcels'],
        docs: [{ name: '[2026-03-01][ISCM-IT][Fieldwork Trip Checklist].pdf', updated: '2026-03-01' }] },
      { section: 'Performance Management', topics: ['OKR Metrics'],
        docs: [{ name: '[2026-01-15][ISCM-HR][OKR Metrics Handbook].pdf', updated: '2026-01-15' }] },
      { section: 'Space & Utilities', topics: ['GIS Data Center', 'First aid room', 'Food & drink services', 'Gym & sports', 'Library', 'Meeting room service', 'Office facilities', 'Parking lot', 'Printing service', 'vPhone service'],
        docs: [{ name: '[2026-04-02][ISCM-AF][Meeting Room Booking Guide].pdf', updated: '2026-04-02' }] },
      { section: 'Multi-Campus Onboarding', topics: ['Starter — UEH Campus B (HCMC)', 'Starter — UEH Mekong Campus (Vĩnh Long)', 'Starter — UEH Nexus Campus (Nha Trang)'],
        docs: [{ name: '[2026-05-20][ISCM-HR][Nexus Campus Starter Pack].pdf', updated: '2026-05-20' }] },
      { section: 'Tools & Systems', topics: ['ISCM OS', 'UEH ERP', 'Smart Office', 'Supabase Console (Admin only)', 'Ticketing'],
        docs: [{ name: '[2026-06-11][ISCM-Hub][Trạm 1 User Manual].pdf', updated: '2026-06-11' }] },
      { section: 'Purchasing – Payment', topics: ['Payment', 'Purchasing', 'Sign contract with e-Sign', 'Template contract'],
        docs: [{ name: 'HD thanh toan 2026.docx', updated: '2026-02-28' }] },
      { section: 'Software & Utilities', topics: ['Software', 'Office & Utility', 'Security', 'Workplaces', 'Related documents'],
        docs: [{ name: '[2026-03-18][ISCM-IT][Approved Software Catalog].xlsx', updated: '2026-03-18' }] },
      { section: 'Scientific Research', topics: ['QGIS & GIS training', 'UEH Knowledge Hub reporting', 'Proposal drafting', 'Templates'],
        docs: [
          { name: '[2026-02-15][ISCM-RD][Hướng dẫn khai báo công trình khoa học trên UEH Platform].pdf', updated: '2026-02-15' },
          { name: '[2026-02-20][ISCM-RD][Hướng dẫn viết đề cương thuyết minh đề tài NCKH UEH].pdf', updated: '2026-02-20' },
          { name: '[2026-03-01][ISCM-RD][Biểu mẫu và biểu mẫu quyết toán kinh phí NCKH].pdf', updated: '2026-03-01' }
        ] },
    ],
  },
  policies: {
    label: 'Policies', emoji: '📕',
    blurb: 'Binding institute policies — the "why and what" behind every rule.',
    sections: [
      { section: 'Communications', topics: ['Communication Policy', 'Institute Policies', 'Institute Rules (Monday Rule · Clean Desk · Office Hours 07:30–17:00)'],
        docs: [{ name: '[2026-01-02][ISCM-Rules][Internal Conduct & Monday Rule].pdf', updated: '2026-01-02' }] },
      { section: 'Finance – Accounting', topics: ['Credit card usage policy', 'Marketing', 'PR expenses', 'Employment authorization regs', 'Traveling'],
        docs: [{ name: '[2026-02-01][ISCM-FA][2-Track 4-Flow Financial Routing].pdf', updated: '2026-02-01' }] },
      { section: 'Human Resources', topics: ['Allowance', 'Bonus pay', 'Employee Benefits', 'Healthcare insurance', 'Teambuilding – Sport', 'Working Hours and Leave'],
        docs: [{ name: '[2026-01-10][ISCM-HR][Working Hours & Leave Policy].pdf', updated: '2026-01-10' }] },
      { section: 'Information Technology', topics: ['Information Security Policy'],
        docs: [{ name: '[2025-12-01][ISCM-IT][Information Security Policy].pdf', updated: '2025-12-01' }] },
      { section: 'Learning and Development', topics: ['Research training', 'HR training & development', 'ISCM Library'],
        docs: [{ name: '[2026-02-20][ISCM-LD][GIS Training Curriculum RU8.2].pdf', updated: '2026-02-20' }] },
      { section: 'Legal and Compliance', topics: ['Power of Attorney', 'Disclosure of Information', 'Legal Entity Establishment', 'Intellectual Property', 'Corporate ID Accounts', 'Seal Management'],
        docs: [{ name: 'IP-policy-DRAFT(2).docx', updated: '2026-04-15' }] },
      { section: 'Talent Acquisition', topics: ['Employee referral program', 'Personal Data Privacy Policy', 'Recruitment policy & process'],
        docs: [{ name: '[2026-03-05][ISCM-HR][CTV & Intern Recruitment Policy].pdf', updated: '2026-03-05' }] },
      { section: 'Trade Union', topics: ['Trade Union', 'Related documents'],
        docs: [{ name: '[2026-01-20][ISCM-Union][Member Benefits 2026].pdf', updated: '2026-01-20' }] },
    ],
  },
  regulations: {
    label: 'Regulations', emoji: '📙',
    blurb: 'Formal regulations with compliance obligations and audit trails.',
    sections: [
      { section: 'Finance – Accounting', topics: ['Inventory Management', 'Payment'],
        docs: [{ name: '[2026-01-08][ISCM-FA][Inventory Management Regulation].pdf', updated: '2026-01-08' }] },
      { section: 'Human Resources', topics: ['Job level system', 'Labor contracts', 'Onboarding', 'Organizational Model'],
        docs: [
          { name: '[2026-01-01][ISCM-Rules][Mô hình tổ chức và quản lý tại ISCM].pdf', updated: '2026-01-01' },
          { name: '[2026-01-01][ISCM-OD][Cơ cấu tổ chức và sơ đồ phân nhiệm ISCM].pdf', updated: '2026-01-01' },
          { name: '[2026-01-01][ISCM-OD][ISCM Organizational Structure and Chart].pdf', updated: '2026-01-01' },
          { name: '[2026-01-12][ISCM-HR][Labor Contract Regulation].pdf', updated: '2026-01-12' }
        ] },
      { section: 'Information Technology', topics: ['Asset regs — overseas partner site', 'Asset regs — domestic partner site', 'Asset regs — UEH campuses', 'Information security', 'IT Department'],
        docs: [{ name: '[2026-02-14][ISCM-IT][Campus Asset Regulation].pdf', updated: '2026-02-14' }] },
      { section: 'Legal & Compliance', topics: ['Contract Drafting & Review Process', 'e-Sign Account Request Process', 'Stamping of Documents'],
        docs: [{ name: '[2026-03-22][ISCM-LG][Contract Review Process].pdf', updated: '2026-03-22' }] },
      { section: 'Office Facilities & Purchasing', topics: ['Service Room', 'Goods & Services Purchasing Process', 'Related documents'],
        docs: [{ name: 'quy trinh mua sam.pdf', updated: '2026-05-02' }] },
      { section: 'Scientific Research', topics: ['UEH Research Grants', 'CTD Student Science Awards', 'Annual KPI Target', 'Form NCKH-01 Registration', 'UEH Research Policy', 'ISCM Research Process'],
        docs: [
          { name: '[2026-01-01][ISCM-RD][Quy định quản lý hoạt động NCKH tại UEH].pdf', updated: '2026-01-01' },
          { name: '[2026-05-12][ISCM-RD][Quy trình 4 bước tham gia NCKH tại ISCM].pdf', updated: '2026-05-12' },
          { name: '[2026-07-02][ISCM-RD][Đăng ký đề tài NCKH UEH 2026 - Mẫu NCKH-01].pdf', updated: '2026-07-02' },
          { name: '[2026-07-01][ISCM-RD][Đăng ký đề tài NCKH UEH Đợt 1 do CTD quản lý].pdf', updated: '2026-07-01' },
          { name: '[2026-06-25][ISCM-RD][Giải Tinh hoa học thuật và khen thưởng KHCN Sinh viên CTD].pdf', updated: '2026-06-25' },
          { name: '[2026-07-08][ISCM-RD][Kế hoạch NCKH 2026 và Chỉ tiêu KPI].pdf', updated: '2026-07-08' }
        ] },
    ],
  },
  start: {
    label: 'Start', emoji: '🚀',
    blurb: 'Orientation branch — the fastest route into ISCM structures and traditions.',
    sections: [
      { section: 'Research Unit Information', topics: ['Public Space Lab', 'Night Economy Lab', 'Data Driven & Urban Design', 'Immersive Tech Convergence Center', 'MOVE System', 'Smart City', 'Net Zero Open Lab', 'New Economy', 'Governance & Planning'],
        docs: [{ name: '[2026-01-30][ISCM-RD][Research Unit Directory 2026].pdf', updated: '2026-01-30' }] },
      { section: 'Event Series', topics: ['RTD Annual Conference', 'ISCM Internal Seminar Series', 'RED Series', 'CTD Scholars Awards Night', 'ISCM Anniversary Day'],
        docs: [{ name: '[2026-04-25][RTD-2026][FutureScape Program Overview].pdf', updated: '2026-04-25' }] },
      { section: 'Promotions', topics: ['Announcements', 'ISCM Connect', 'Related documents'],
        docs: [{ name: '[2026-06-01][ISCM-Comms][ISCM Connect Launch Kit].zip', updated: '2026-06-01' }] },
    ],
  },
};

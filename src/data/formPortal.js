/**
 * Form Portal catalog — Requests & E-Forms (My Site category 4).
 * Expanded to cover all requested forms in the new Information Architecture.
 */

export const FORM_CATEGORIES = [
  { id: 'All', label: 'All' },
  { id: 'HR', label: 'HR Services' },
  { id: 'IT', label: 'IT Services' },
  { id: 'FA', label: 'FA Services' },
  { id: 'RM', label: 'Research Forms' },
  { id: 'AF', label: 'AF Services' }
];

export const FORM_GROUPS = [
  {
    id: 'hr-admin', label: 'Human Resources & Admin',
    forms: [
      { key: 'resignation', label: 'Resignation', cat: 'HR', desc: 'Initiate offboarding and data handover.', special: 'resignation' },
      { key: 'recruitment-request', label: 'Recruitment request', cat: 'HR', desc: 'Request recruitment of new CTV/Interns.' },
      { key: 'training-register', label: 'Training register', cat: 'HR', desc: 'Register for internal courses or seminars.', special: 'training' },
      { key: 'ask-anything', label: 'Ask anything', cat: 'HR', desc: 'Send general HR & administrative inquiries.' },
      { key: 'wfh', label: 'Work from home', cat: 'HR', desc: 'Request remote work allocation.', special: 'wfh' },
      { key: 'leave', label: 'Leave', cat: 'HR', desc: 'Absence/Leave request.', special: 'leave' },
      { key: 'travel-auth', label: 'Travel authorization', cat: 'HR', desc: 'Request authorization for fieldwork/travel.' },
      { key: 'benefit-hr', label: 'Benefit and HR', cat: 'HR', desc: 'Inquire or register for HR benefits.' },
      { key: 'member-partner-info', label: 'Member & Partner Information Form', cat: 'HR', desc: 'Register or update member info.' },
      { key: 'team-eval', label: 'Team Evaluation Form', cat: 'HR', desc: 'Submit peer & team assessments.' },
      { key: 'quarterly-perf-eval', label: 'Quarterly Performance Evaluation', cat: 'HR', desc: 'Submit Q2 OKR & performance review.' }
    ]
  },
  {
    id: 'it-product', label: 'Product Operation & Tech',
    forms: [
      { key: 'purchase-permission', label: 'Purchase permission', cat: 'IT', desc: 'Get pre-approval for technical purchases.' },
      { key: 'order-equipment', label: 'Order Equipment Form', cat: 'IT', desc: 'Order standard laptop or lab peripherals.' },
      { key: 'order-book', label: 'Order Book/Documents Form', cat: 'IT', desc: 'Requisition books for the ISCM library.' },
      { key: 'tech-request', label: 'Technology Request Form', cat: 'IT', desc: 'General IT support & tech request.' }
    ]
  },
  {
    id: 'finance', label: 'Finance and Accounting',
    forms: [
      { key: 'payment-request', label: 'Payment request', cat: 'FA', desc: 'Submit Track 1/Track 2 payment claims.', special: 'payment' },
      { key: 'expense-report', label: 'Expense report request', cat: 'FA', desc: 'Submit post-activity expense statement.' }
    ]
  },
  {
    id: 'it-comms', label: 'Communication & Orders',
    forms: [
      { key: 'order-design', label: 'Order Design', cat: 'IT', desc: 'Request branding/graphic assets design.' },
      { key: 'order-support-comm', label: 'Order Support Communication', cat: 'IT', desc: 'Request PR support / article publishing.' },
      { key: 'order-gift', label: 'Order ISCM Gift', cat: 'IT', desc: 'Requisition ISCM corporate gifts.' }
    ]
  },
  {
    id: 'research-rm', label: 'Research Forms',
    forms: [
      { key: 'quarterly-research-reg', label: 'Quarterly Research Registration', cat: 'RM', desc: 'Register quarterly research outputs.' },
      { key: 'internal-seminar-reg', label: 'Internal Seminar Registration', cat: 'RM', desc: 'Register to present at internal seminar.' },
      { key: 'quarterly-progress-report', label: 'Quarterly Progress Report', cat: 'RM', desc: 'Update progress of research projects.' },
      { key: 'fundraising-proposal-progress', label: 'Fundraising Proposal Progress', cat: 'RM', desc: 'Track external funding proposals.' },
      { key: 'publications-submission', label: 'Publications Submission Form', cat: 'RM', desc: 'Submit Scopus/accredited publication details.' }
    ]
  },
  {
    id: 'admin-af', label: 'Administration Services',
    forms: [
      { key: 'cctv-history', label: 'Check CCTV history', cat: 'AF', desc: 'Request review of campus security footage.' },
      { key: 'annual-student-survey', label: 'Annual Student Survey', cat: 'AF', desc: 'Deploy annual program feedback survey.' },
      { key: 'student-pigeon-post', label: 'ISCM Student Pigeon Post', cat: 'AF', desc: 'Access student-to-admin letter channel.' },
      { key: 'training-point-proposal', label: 'Training Point Proposal', cat: 'AF', desc: 'Propose extra-curricular student credits.' }
    ]
  }
];

/** Flat lookup: key → { ...form, group } */
export const FORM_BY_KEY = Object.fromEntries(
  FORM_GROUPS.flatMap((g) => g.forms.map((f) => [f.key, { ...f, group: g.label }]))
);

export const MY_TASKS = [
  { id: 't1', title: 'Review: Sidewalk Audit Sheet v2', requester: 'Đặng Trà My', form: 'Document review', date: '2026-07-03', status: 'Open' },
  { id: 't2', title: 'Co-sign: Fieldwork advance (Flow 2)', requester: 'Võ Anh Khoa', form: 'Advance request', date: '2026-07-02', status: 'Open' },
  { id: 't3', title: 'Confirm: GIS training attendance (RU8.2)', requester: 'Ms. Chi', form: 'Training register', date: '2026-06-28', status: 'Approved' },
  { id: 't4', title: 'Acknowledge: equipment return — VR Set A', requester: 'Lab Manager', form: 'Return IT equipment', date: '2026-06-25', status: 'Rejected' },
];

export const MY_FORMS_SEED = [
  { id: 'f1', form: 'Work from home', group: 'Human Resources & Admin', date: '2026-07-01', status: 'Open' },
  { id: 'f2', form: 'Leave', group: 'Human Resources & Admin', date: '2026-06-20', status: 'Approved' },
  { id: 'f3', form: 'Payment request', group: 'Finance and Accounting', date: '2026-06-15', status: 'Approved' },
  { id: 'f4', form: 'Overtime register', group: 'Human Resources & Admin', date: '2026-06-10', status: 'Rejected' },
];

export const TRANSACTIONS = [
  { id: 'x1', date: '2026-07-01', desc: 'Thù lao NCKH — Urban Heat (RU8.1)', track: 2, flow: 4, amount: '+2,500,000', status: 'Paid' },
  { id: 'x2', date: '2026-06-28', desc: 'Fieldwork reimbursement — D1 sidewalk audit', track: 1, flow: 1, amount: '+840,000', status: 'Paid' },
  { id: 'x3', date: '2026-06-22', desc: 'CTD Scholars stipend', track: 2, flow: 4, amount: '+1,200,000', status: 'Paid' },
  { id: 'x4', date: '2026-06-15', desc: 'Event logistics — RTD 2026 prep (advance)', track: 1, flow: 2, amount: '+3,000,000', status: 'Advance' },
  { id: 'x5', date: '2026-06-02', desc: 'O&F office supplies (unit charge)', track: 2, flow: 3, amount: '−450,000', status: 'Settled' },
  { id: 'x6', date: '2026-05-30', desc: 'Q2 Scopus incentive — under review', track: 2, flow: 4, amount: '+5,000,000', status: 'Pending' },
];

export const ASSET_TYPES = ['All', 'VR Headset', 'Drone', 'Spatial Computing Rig', 'Monitor', 'Laptop', 'Other'];

export const MY_ASSETS = [
  { id: 'as1', name: 'VR Headset — Quest Pro (Set A)', type: 'VR Headset', checked_out: '2026-06-20', due: '2026-07-15' },
  { id: 'as2', name: 'DJI Mavic 3 Enterprise', type: 'Drone', checked_out: '2026-07-01', due: '2026-07-08' },
  { id: 'as3', name: 'Spatial Computing Rig #2 (RTX 4090)', type: 'Spatial Computing Rig', checked_out: '2026-05-12', due: '2026-08-30' },
  { id: 'as4', name: 'Dell U2723QE Monitor', type: 'Monitor', checked_out: '2026-03-01', due: null },
  { id: 'as5', name: 'USB-C Adapter for laptop', type: 'Other', checked_out: '2026-03-01', due: null },
];

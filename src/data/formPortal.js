/**
 * Form Portal catalog — Requests & E-Forms (My Site category 4).
 * Expanded to cover all requested forms in the new Information Architecture.
 */

export const FORM_CATEGORIES = [
  { id: 'All', label: 'All' },
  { id: 'IT', label: 'IT Services' }
];

export const FORM_GROUPS = [
  {
    id: 'it-product', label: 'Product Operation & Tech',
    forms: [
      { key: 'order-equipment', label: 'Order Equipment Form', cat: 'IT', desc: 'Order standard laptop or lab peripherals.' },
      { key: 'order-book', label: 'Order Book/Documents Form', cat: 'IT', desc: 'Requisition books for the ISCM library.', special: 'library' },
      { key: 'order-gift', label: 'Order ISCM Gift', cat: 'IT', desc: 'Requisition ISCM corporate gifts.' },
      { key: 'order-support-comm', label: 'Order Support Communication', cat: 'IT', desc: 'Request PR support / article publishing.' }
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
  { id: 'f1', form: 'Daily Attendance — Work from Home with Permission', group: 'Human Resources & Admin', date: '2026-07-01', status: 'Open' },
  { id: 'f2', form: 'Daily Attendance — Annual Leave', group: 'Human Resources & Admin', date: '2026-06-20', status: 'Approved' },
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

export const ASSET_TYPES = ['All', 'VR Headset', 'Drone', 'Spatial Computing Rig', 'Monitor', 'Laptop', 'Book', 'Document', 'Journal', 'Other'];

export const MY_ASSETS = [
  { id: 'as1', name: 'VR Headset — Quest Pro (Set A)', type: 'VR Headset', checked_out: '2026-06-20', due: '2026-07-15' },
  { id: 'as2', name: 'DJI Mavic 3 Enterprise', type: 'Drone', checked_out: '2026-07-01', due: '2026-07-08' },
  { id: 'as3', name: 'Spatial Computing Rig #2 (RTX 4090)', type: 'Spatial Computing Rig', checked_out: '2026-05-12', due: '2026-08-30' },
  { id: 'as4', name: 'Dell U2723QE Monitor', type: 'Monitor', checked_out: '2026-03-01', due: null },
  { id: 'as5', name: 'USB-C Adapter for laptop', type: 'Other', checked_out: '2026-03-01', due: null },
];

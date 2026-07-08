import { useEffect, useState } from 'react';
import { FolderKanban, Database, Handshake, TrendingUp, Landmark, Factory, GraduationCap, CheckSquare } from 'lucide-react';
import { supabase, isLive } from '../lib/supabaseClient.js';
import { 
  projects as mockProjects, 
  partners as mockPartners, 
  assets as mockAssets,
  users as mockUsers
} from '../data/mockData.js';
import { KpiNumber } from '../components/ui.jsx';
import {
  APPROVALS, EQUIPMENT, TIMESHEET, TIMESHEET_WEEK, timesheetTotal, CORE_FILES, TODAY,
} from '../data/osData.js';

const PARTNER_ICONS = { Authority: Landmark, Industry: Factory, Academia: GraduationCap };

/** Dải chỉ số vận hành liên thông Đề án 1 & 2 — bấm để mở module tương ứng */
function OsOperationsStrip({ onNavigate }) {
  const pendingApprovals = APPROVALS.filter((a) => a.status === 'Chờ duyệt').length;
  const overAlloc = TIMESHEET.filter((e) => timesheetTotal(e) > TIMESHEET_WEEK.capacity).length;
  const equipAlerts = EQUIPMENT.filter((e) => e.next_maintenance <= TODAY || (e.status === 'Đang mượn' && e.due && e.due < TODAY)).length;
  const corePending = CORE_FILES.filter((f) => ['scanning', 'pending', 'etl'].includes(f.stage)).length;

  const cells = [
    { label: 'Tờ trình chờ duyệt', value: pendingApprovals, route: 'approval-engine', tone: pendingApprovals > 0 ? 'text-amber-600' : 'text-emerald-600', hint: 'Bypass Approval Engine' },
    { label: 'Nhân sự quá tải giờ công', value: overAlloc, route: 'hierarchical-projects', tone: overAlloc > 0 ? 'text-iscm-crimson' : 'text-emerald-600', hint: 'Timesheet · over-allocation' },
    { label: 'Cảnh báo thiết bị', value: equipAlerts, route: 'equipment-tracking', tone: equipAlerts > 0 ? 'text-amber-600' : 'text-emerald-600', hint: 'Bảo trì / mượn quá hạn' },
    { label: 'File trong pipeline CORE', value: corePending, route: 'iscm-core', tone: 'text-blue-600', hint: 'Sandbox · ETL · chờ duyệt' },
  ];

  return (
    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {cells.map((c) => (
        <button key={c.label} onClick={() => onNavigate?.(c.route)}
          className="glass-card glass-card-hover flex items-center gap-3 p-4 text-left">
          <span className={`font-barlow-condensed text-4xl font-bold ${c.tone}`}>{c.value}</span>
          <span>
            <span className="block font-barlow text-sm font-semibold text-iscm-charcoal">{c.label}</span>
            <span className="block font-ibm text-[11px] text-gray-500">{c.hint} →</span>
          </span>
        </button>
      ))}
    </section>
  );
}

export default function ExecutiveDashboard({ onNavigate }) {
  const [activeProjects, setActiveProjects] = useState(0);
  const [totalAssets, setTotalAssets] = useState(0);
  const [totalPartners, setTotalPartners] = useState(0);
  const [staffCount, setStaffCount] = useState(0);

  const [activeTab, setActiveTab] = useState('Academia'); // Academia | Industry | Authority
  const [partnersList, setPartnersList] = useState([]);
  const [loadingPartners, setLoadingPartners] = useState(false);

  // Fetch counts & CRM directory lists
  const fetchDashboardStats = async () => {
    if (isLive) {
      try {
        // 1. Fetch counts
        const { count: projCount } = await supabase
          .from('projects')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'In Progress');

        const { count: assetCount } = await supabase
          .from('digital_assets')
          .select('*', { count: 'exact', head: true });

        const { count: partnerCount } = await supabase
          .from('project_partners')
          .select('*', { count: 'exact', head: true });

        const { count: uCount } = await supabase
          .from('users_profiles')
          .select('*', { count: 'exact', head: true });

        setActiveProjects(projCount || 0);
        setTotalAssets(assetCount || 0);
        setTotalPartners(partnerCount || 0);
        setStaffCount(uCount || 0);
      } catch (err) {
        console.error('Error fetching aggregates:', err);
      }
    } else {
      // Mock stats
      setActiveProjects(mockProjects.filter(p => p.status === 'In Progress').length);
      setTotalAssets(mockAssets.length);
      setTotalPartners(mockPartners.length);
      setStaffCount(mockUsers.length);
    }
  };

  const fetchCRMDirectory = async () => {
    setLoadingPartners(true);
    if (isLive) {
      try {
        const { data, error } = await supabase
          .from('project_partners')
          .select('*, projects(project_name)')
          .eq('partner_type', activeTab)
          .order('partner_name');
        if (data) setPartnersList(data);
      } catch (err) {
        console.error('Error fetching CRM directory:', err);
      } finally {
        setLoadingPartners(false);
      }
    } else {
      // Fallback: Filter local partners
      const list = mockPartners
        .filter((p) => p.partner_type === activeTab)
        .map((p) => ({
          ...p,
          projects: { project_name: mockProjects.find(proj => proj.id === p.project_id)?.project_name ?? 'Không xác định' }
        }));
      setPartnersList(list);
      setLoadingPartners(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  useEffect(() => {
    fetchCRMDirectory();
  }, [activeTab]);

  // SVG Radial progress calculations
  const budgetBurnRate = 68.4; // 68.4%
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (budgetBurnRate / 100) * circumference;

  return (
    <div className="mx-auto max-w-[1600px] space-y-6">
      <header className="border-l-4 border-iscm-crimson pl-4 py-1">
        <h1 className="font-barlow text-3xl font-extrabold uppercase tracking-wider text-iscm-charcoal">
          Institute Executive Dashboard
        </h1>
        <p className="font-ibm text-sm uppercase tracking-wider text-gray-500 mt-1">
          Live aggregations, macro budgeting indexes, and stakeholder network directory.
        </p>
      </header>

      {/* 1. Metric widgets — numbers set in Barlow Condensed */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="glass-card glass-card-hover p-5 border-t-2 border-iscm-crimson">
          <KpiNumber value={activeProjects} />
          <div className="font-barlow text-base font-semibold text-iscm-charcoal mt-1">Active Projects</div>
          <div className="font-ibm text-sm text-gray-500">ERP · In Progress</div>
        </div>

        <div className="glass-card glass-card-hover p-5 border-t-2 border-iscm-crimson">
          <KpiNumber value={totalAssets} />
          <div className="font-barlow text-base font-semibold text-iscm-charcoal mt-1">Total Assets</div>
          <div className="font-ibm text-sm text-gray-500">KMS · Files &amp; Templates</div>
        </div>

        <div className="glass-card glass-card-hover p-5 border-t-2 border-iscm-crimson">
          <KpiNumber value={totalPartners} />
          <div className="font-barlow text-base font-semibold text-iscm-charcoal mt-1">Network Partners</div>
          <div className="font-ibm text-sm text-gray-500">CRM · Strategic alliances</div>
        </div>

        <div className="glass-card glass-card-hover p-5 border-t-2 border-iscm-crimson">
          <KpiNumber value={staffCount} />
          <div className="font-barlow text-base font-semibold text-iscm-charcoal mt-1">Staff on Matrix</div>
          <div className="font-ibm text-sm text-gray-500">Cross-line roster size</div>
        </div>
      </section>

      {/* 1b. Dải vận hành ISCM OS ↔ CORE (Đề án 1 & 2) */}
      <OsOperationsStrip onNavigate={onNavigate} />

      {/* 2. Asymmetric Grid: Budget/Milestones (40%) and CRM Stakeholder Directory (60%) */}
      <div className="grid gap-6 lg:grid-cols-5">
        
        {/* Left Column: Visual Budget Ring + Milestones (40%) */}
        <div className="space-y-6 lg:col-span-2">
          {/* Custom SVG Budget Gauge */}
          <section className="glass-card p-5 flex flex-col items-center justify-center text-center">
            <h2 className="mb-4 font-barlow text-xl font-bold text-iscm-charcoal self-start border-l-2 border-iscm-crimson pl-2">
              Overall Budget Burn-Rate
            </h2>
            
            <div className="relative flex items-center justify-center h-36 w-36">
              <svg className="h-full w-full rotate-[-90deg]">
                {/* Track circle */}
                <circle
                  cx="72"
                  cy="72"
                  r={radius}
                  stroke="#F1F3F5"
                  strokeWidth="10"
                  fill="transparent"
                />
                {/* Burn rate circle */}
                <circle
                  cx="72"
                  cy="72"
                  r={radius}
                  stroke="#990000"
                  strokeWidth="10"
                  fill="transparent"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  className="transition-all duration-500"
                />
              </svg>
              {/* Central Text */}
              <div className="absolute flex flex-col items-center justify-center">
                <span className="font-barlow-condensed text-3xl font-extrabold text-iscm-charcoal">{budgetBurnRate}%</span>
                <span className="font-ibm text-[9px] uppercase tracking-wide text-gray-400">Burned</span>
              </div>
            </div>
            <p className="mt-4 font-ibm text-sm text-gray-500">
              Tổng ngân sách nghiên cứu &amp; vận hành năm 2026 đã giải ngân: <span className="font-semibold text-iscm-crimson">2.45B / 3.58B VND</span>.
            </p>
          </section>

          {/* Progress Milestones */}
          <section className="glass-card p-5">
            <h2 className="mb-3 font-barlow text-xl font-bold text-iscm-charcoal border-l-2 border-iscm-crimson pl-2">
              Key Milestones &amp; Progress
            </h2>
            <ul className="space-y-3 font-ibm text-sm">
              <li className="space-y-1">
                <div className="flex justify-between font-semibold text-iscm-charcoal">
                  <span>HCMC Walkability Atlas (Phase 2)</span>
                  <span className="font-barlow-condensed text-sm">70%</span>
                </div>
                <div className="h-1.5 w-full bg-iscm-surface rounded-full overflow-hidden">
                  <div className="h-full bg-iscm-crimson rounded-full" style={{ width: '70%' }} />
                </div>
              </li>
              <li className="space-y-1">
                <div className="flex justify-between font-semibold text-iscm-charcoal">
                  <span>Nha Trang Night Economy (KDE Delineation)</span>
                  <span className="font-barlow-condensed text-sm">45%</span>
                </div>
                <div className="h-1.5 w-full bg-iscm-surface rounded-full overflow-hidden">
                  <div className="h-full bg-iscm-charcoal rounded-full" style={{ width: '45%' }} />
                </div>
              </li>
              <li className="space-y-1">
                <div className="flex justify-between font-semibold text-iscm-charcoal">
                  <span>Hue Citadel UNESCO Heritage Buffer Zones</span>
                  <span className="font-barlow-condensed text-sm">100%</span>
                </div>
                <div className="h-1.5 w-full bg-iscm-surface rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-600 rounded-full" style={{ width: '100%' }} />
                </div>
              </li>
            </ul>
          </section>
        </div>

        {/* Right Column: Component 3: CRM Stakeholder Directory (60%) */}
        <section className="glass-card p-5 lg:col-span-3 flex flex-col justify-between">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 pb-3 mb-4">
              <div>
                <h2 className="font-barlow text-xl font-bold text-iscm-charcoal border-l-2 border-iscm-crimson pl-2">
                  Stakeholder Network Directory
                </h2>
                <p className="font-ibm text-sm text-gray-500">Mạng lưới đối tác liên kết của ISCM.</p>
              </div>

              {/* Tab Toggles */}
              <div className="flex gap-1 bg-iscm-surface p-1 rounded-lg">
                {['Academia', 'Industry', 'Authority'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-3 py-1 font-ibm text-sm font-semibold rounded transition-colors ${
                      activeTab === tab 
                        ? 'bg-iscm-crimson text-white shadow-sm' 
                        : 'text-gray-600 hover:bg-white/60'
                    }`}
                  >
                    {tab === 'Academia' && 'Academia'}
                    {tab === 'Industry' && 'Industry'}
                    {tab === 'Authority' && 'Authority'}
                  </button>
                ))}
              </div>
            </div>

            {/* List */}
            {loadingPartners ? (
              <div className="py-12 text-center text-gray-400 font-ibm text-sm">Loading partners...</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left font-ibm text-sm">
                  <thead className="bg-iscm-surface font-barlow-condensed text-xs uppercase tracking-wider text-gray-400">
                    <tr>
                      <th className="py-2.5 px-3">Tên đối tác</th>
                      <th className="py-2.5 px-3">Đại diện / Liên hệ</th>
                      <th className="py-2.5 px-3">Dự án liên kết</th>
                      <th className="py-2.5 px-3">Biên bản hợp tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {partnersList.map((partner) => {
                      const PartnerIcon = PARTNER_ICONS[partner.partner_type] || Landmark;
                      return (
                        <tr key={partner.id} className="hover:bg-iscm-surface/20">
                          <td className="py-2.5 px-3 font-semibold text-iscm-charcoal">
                            <span className="truncate max-w-[200px]" title={partner.partner_name}>
                              {partner.partner_name}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-gray-700">{partner.contact_person || 'N/A'}</td>
                          <td className="py-2.5 px-3 font-medium text-iscm-charcoal truncate max-w-[150px]" title={partner.projects?.project_name}>
                            {partner.projects?.project_name}
                          </td>
                          <td className="py-2.5 px-3 text-gray-500 max-w-[200px] truncate" title={partner.details}>
                            {partner.details}
                          </td>
                        </tr>
                      );
                    })}
                    {partnersList.length === 0 && (
                      <tr>
                        <td colSpan="4" className="py-8 text-center text-gray-400">
                          Chưa có đối tác liên kết nào được khai báo.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>

      </div>
    </div>
  );
}

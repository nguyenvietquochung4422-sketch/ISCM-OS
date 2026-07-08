import { useState } from 'react';
import {
  Folder, FolderOpen, FileText, ChevronRight, ChevronDown,
  Search, BookOpen, AlertCircle, Info, Landmark, HelpCircle, Download, GraduationCap,
  Table2, Database
} from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext.jsx';
import ResearchListTable from '../components/research/ResearchListTable.jsx';

// Structured document data
const DOCUMENT_CONTENTS = {
  'research-list': {
    title: 'Research List — 2026 ISCM Research Activities',
    updated: 'Đồng bộ trực tiếp từ Supabase (iscm_research_list)',
    author: 'Hoài (Head of Research)',
    icon: Table2,
    body: <ResearchListTable />,
  },


  'activities-list': {
    title: 'Internal Seminar Series / Chuỗi sinh hoạt học thuật định kỳ',
    updated: 'Cập nhật: 20/06/2026',
    author: 'ISCM Lab Team',
    icon: HelpCircle,
    body: (
      <div className="space-y-4 text-xs font-ibm text-iscm-charcoal">
        <p>Danh sách các buổi sinh hoạt khoa học, chuyên đề (Seminar) định kỳ tại ISCM:</p>
        <ul className="space-y-2">
          <li className="bg-iscm-surface p-2.5 rounded border-l-4 border-iscm-crimson">
            <div className="font-semibold text-iscm-charcoal">Seminar #12: Spatio-Temporal modelling in urban night-economy</div>
            <div className="text-[10px] text-gray-500">Diễn giả: Võ Anh Khoa · Thời gian: 15/07/2026</div>
          </li>
          <li className="bg-iscm-surface p-2.5 rounded border-l-4 border-iscm-crimson">
            <div className="font-semibold text-iscm-charcoal">Seminar #13: Sidewalk walkability audit and accessibility calibration</div>
            <div className="text-[10px] text-gray-500">Diễn giả: Lê Thu Thảo · Thời gian: 22/07/2026</div>
          </li>
        </ul>
      </div>
    )
  },
  'publication-list': {
    title: 'Các công bố khoa học / Publication',
    updated: 'Cập nhật: 03/07/2026',
    author: 'ISCM Authors',
    icon: BookOpen,
    body: (
      <div className="space-y-4 text-xs font-ibm text-iscm-charcoal">
        <p className="font-semibold text-iscm-crimson">Danh sách các bài báo nghiên cứu khoa học của ISCM được xuất bản trên tạp chí quốc tế Q1/Q2:</p>
        <ul className="divide-y divide-gray-100 space-y-3">
          <li className="pt-2">
            <div className="font-semibold text-iscm-charcoal">"2SFCA Walkability modeling: Sidney and HCMC comparison audit"</div>
            <div className="text-gray-500 italic mt-0.5">Journal of Transport Geography (Q1 Scopus) - 2026</div>
            <div className="text-gray-400 text-[10px]">Tác giả: Trần Ngọc Lan, Võ Anh Khoa</div>
          </li>
          <li className="pt-2">
            <div className="font-semibold text-iscm-charcoal">"Night-time economy and spatio-temporal surveys along coastal Nha Trang"</div>
            <div className="text-gray-500 italic mt-0.5">Cities (Q1 Scopus) - 2025</div>
            <div className="text-gray-400 text-[10px]">Tác giả: Nguyễn Việt Quốc Hưng, Phạm Quang Minh</div>
          </li>
        </ul>
      </div>
    )
  }
};

export default function ResearchSubWorkspace() {
  const { lang } = useLanguage();
  const [selectedNode, setSelectedNode] = useState('research-list');
  const [expandedFolders, setExpandedFolders] = useState({
    calls: true,
    data: true,
    pubs: true,
    iscmInfo: true,
    uehInfo: true
  });

  const toggleFolder = (key) => {
    setExpandedFolders((prev) => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleSelectNode = (key) => {
    setSelectedNode(key);
  };

  const activeDoc = DOCUMENT_CONTENTS[selectedNode] || DOCUMENT_CONTENTS['research-list'];
  const isResearchList = selectedNode === 'research-list';
  const DocIcon = activeDoc.icon || FileText;

  const treeNodeClass = (key) =>
    `w-full text-left font-sans text-[11px] font-bold uppercase py-1.5 px-2 border-b border-neutral-100 transition-colors flex items-center justify-between rounded-none mt-1 mb-0.5 ${
      selectedNode === key
        ? '!bg-[#990000] !text-white !font-bold'
        : 'text-neutral-900 hover:bg-neutral-50'
    }`;

  return (
    <div className="w-full flex flex-col gap-5 h-full">
      <header className="border-l-4 border-[#990000] pl-4 py-1 mb-2 flex flex-wrap items-start justify-between gap-3 rounded-none">
        <div>
          <h1 className="font-barlow text-3xl font-extrabold uppercase tracking-wider text-iscm-charcoal">
            {lang === 'vi' ? 'KHÔNG GIAN NGHIÊN CỨU KHOA HỌC' : 'Scientific Research Sub-Workspace'}
          </h1>
          <p className="font-ibm text-xs uppercase tracking-wider text-gray-500 mt-1">
            {lang === 'vi' ? 'Quản trị & Kiểm soát hoạt động nghiên cứu khoa học' : 'Scientific Research Operations Control'} · {lang === 'vi' ? 'Trưởng bộ phận' : 'Head of Department'}: <span className="font-semibold text-iscm-crimson font-barlow">Hoài (Head of Research)</span>.
          </p>
        </div>
        <div className="flex items-center gap-1.5 bg-iscm-crimson text-white font-barlow text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full scale-90">
          IP Restricted Library
        </div>
      </header>

      {/* Two Column Layout: Sidebar + Content Area (aligned dimensions with Personal Dashboard) */}
      <div className="grid gap-6 md:grid-cols-10 items-start">

        {/* Left Side: Navigation Directory Sidebar (identical to Personal Dashboard layout) */}
        <aside className="border border-neutral-200 bg-white p-2.5 md:col-span-2 rounded-none flex flex-col min-h-[600px]">
          
          {/* Header block exactly matching Personal Dashboard */}
          <div className="text-[10px] font-bold uppercase tracking-wider text-[#990000] bg-neutral-50 border-b border-neutral-200 py-1.5 px-2 mb-2 select-none text-left font-sans">
            {lang === 'vi' ? 'NGHIÊN CỨU KHOA HỌC' : 'SCIENTIFIC RESEARCH'}
          </div>

          <div className="relative mb-3 shrink-0">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder={lang === 'vi' ? 'Tìm kiếm tài liệu NCKH...' : 'Search research materials...'}
              className="w-full pl-8 pr-3 py-1.5 border border-neutral-200 bg-white font-ibm text-xs focus:border-[#990000] focus:outline-none text-iscm-charcoal placeholder:text-gray-400 rounded-none"
            />
          </div>

          <div className="flex-1 min-h-0 space-y-2 overflow-y-auto pr-1">
            {/* ⚡ INDEPENDENT ROOT LINKS */}
            <div className="space-y-0.5">
              <button onClick={() => handleSelectNode('research-list')} className={treeNodeClass('research-list')}>
                <span className="truncate">{lang === 'vi' ? 'Danh sách đề tài NCKH' : 'Research List'}</span>
                <ChevronRight className={`h-3 w-3 shrink-0 ${selectedNode === 'research-list' ? 'text-white' : 'text-neutral-400'}`} />
              </button>
              <button onClick={() => handleSelectNode('activities-list')} className={treeNodeClass('activities-list')}>
                <span className="truncate">{lang === 'vi' ? 'Chuỗi sinh hoạt khoa học' : 'Internal Seminar Series'}</span>
                <ChevronRight className={`h-3 w-3 shrink-0 ${selectedNode === 'activities-list' ? 'text-white' : 'text-neutral-400'}`} />
              </button>
              <button onClick={() => handleSelectNode('publication-list')} className={treeNodeClass('publication-list')}>
                <span className="truncate">{lang === 'vi' ? 'Công báo khoa học' : 'Publications'}</span>
                <ChevronRight className={`h-3 w-3 shrink-0 ${selectedNode === 'publication-list' ? 'text-white' : 'text-neutral-400'}`} />
              </button>
            </div>
          </div>
        </aside>

        {/* Right Side: Content Area (identical to Personal Dashboard layout) */}
        <main className="border border-neutral-200 bg-white p-5 md:col-span-8 rounded-none min-h-[600px] flex flex-col min-h-0">
          <div className="border-l-4 border-[#990000] pl-4 py-1 mb-6 flex items-start justify-between rounded-none shrink-0">
            <div>
              <h2 className="font-barlow text-xl font-extrabold uppercase tracking-wider text-iscm-charcoal flex items-center gap-2">
                <DocIcon className="h-5 w-5 text-[#990000] shrink-0" /> {activeDoc.title}
              </h2>
              <p className="font-ibm text-[10px] uppercase tracking-wider text-gray-500 mt-1">
                {lang === 'vi' ? 'QUẢN TRỊ NGHIÊN CỨU KHOA HỌC' : 'SCIENTIFIC RESEARCH OPERATIONS'} · {lang === 'vi' ? 'Phụ trách' : 'P.I.C'}: {activeDoc.author} · {activeDoc.updated}
              </p>
            </div>
          </div>

          {/* Body content */}
          {isResearchList ? (
            <div className="min-h-0 flex-1">{activeDoc.body}</div>
          ) : (
            <div className="space-y-4 flex-1">
              <div className="pt-2">{activeDoc.body}</div>
            </div>
          )}

          {!isResearchList && (
            <div className="mt-8 pt-4 border-t border-gray-100 flex items-center justify-between text-[10px] text-gray-400 font-ibm">
              <span>© Institute of Smart City and Management (ISCM-UEH)</span>
              <span>Security Protocol: SSL v3 + RLS Enabled</span>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext.jsx';
import DataCatalogView from '../components/dataManagement/DataCatalogView.jsx';
import RegisterDatasetForm from '../components/dataManagement/RegisterDatasetForm.jsx';

/** Standalone top-level "DATA MANAGEMENT" workspace — Data Catalog (what
    data ISCM already has) and Register Dataset (form for anyone to declare
    data they hold), backed by public.datasets. */
export default function DataManagementWorkspace() {
  const { lang } = useLanguage();
  const [selectedNode, setSelectedNode] = useState('data-catalog');
  const [catalogKey, setCatalogKey] = useState(0);

  useEffect(() => {
    const handleSelect = (e) => {
      if (e.detail === 'data-catalog' || e.detail === 'data-submit') setSelectedNode(e.detail);
    };
    window.addEventListener('select-dashboard', handleSelect);
    return () => window.removeEventListener('select-dashboard', handleSelect);
  }, []);

  const treeNodeClass = (key) =>
    `w-full text-left font-sans text-[11px] font-bold uppercase py-2 px-2.5 border-b border-neutral-100 transition-colors flex items-center justify-between rounded-none mt-1 mb-0.5 ${
      selectedNode === key ? '!bg-[#8b0000] !text-white !font-bold' : 'text-neutral-900 hover:bg-neutral-50'
    }`;

  return (
    <div className="w-full flex flex-col gap-5 h-full relative">
      <div className="grid gap-6 md:grid-cols-10 items-start">

        {/* Left Side: Navigation Directory Sidebar */}
        <aside className="border border-neutral-200 bg-white p-2.5 md:col-span-2 rounded-none flex flex-col min-h-[600px]">
          <div className="mb-2 border-b border-neutral-200 bg-neutral-50 px-2 py-1.5 text-left">
            <div className="text-[10px] font-bold uppercase tracking-wider text-[#8b0000] select-none font-sans">
              {lang === 'vi' ? 'QUẢN LÝ DỮ LIỆU' : 'DATA MANAGEMENT'}
            </div>
          </div>

          <div className="flex-1 min-h-0 space-y-2 overflow-y-auto pr-1">
            <div className="space-y-0.5">
              <button
                onClick={() => { setSelectedNode('data-catalog'); setCatalogKey((k) => k + 1); }}
                className={treeNodeClass('data-catalog')}
              >
                <span className="truncate">{lang === 'vi' ? 'Tổng kho dữ liệu' : 'Data Catalog'}</span>
                <ChevronRight className={`h-3 w-3 shrink-0 ${selectedNode === 'data-catalog' ? 'text-white' : 'text-neutral-400'}`} />
              </button>

              <button onClick={() => setSelectedNode('data-submit')} className={treeNodeClass('data-submit')}>
                <span className="truncate">{lang === 'vi' ? 'Đăng ký dữ liệu' : 'Register Dataset'}</span>
                <ChevronRight className={`h-3 w-3 shrink-0 ${selectedNode === 'data-submit' ? 'text-white' : 'text-neutral-400'}`} />
              </button>
            </div>
          </div>
        </aside>

        {/* Right Side: Content Area */}
        <main className="border border-neutral-200 bg-white p-5 md:col-span-8 rounded-none min-h-[600px] flex flex-col min-h-0">
          <div className="min-h-0 flex-1">
            {selectedNode === 'data-submit'
              ? (
                <RegisterDatasetForm
                  lang={lang}
                  onSaved={() => { setSelectedNode('data-catalog'); setCatalogKey((k) => k + 1); }}
                />
              )
              : <DataCatalogView key={catalogKey} lang={lang} onRegister={() => setSelectedNode('data-submit')} />}
          </div>

          <div className="mt-8 pt-4 border-t border-gray-100 flex items-center justify-between text-[10px] text-gray-400 font-ibm">
            <span>© Institute of Smart City and Management (ISCM-UEH)</span>
            <span>Security Protocol: SSL v3 + RLS Enabled</span>
          </div>
        </main>
      </div>
    </div>
  );
}

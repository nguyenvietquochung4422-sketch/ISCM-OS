import { UsersRound } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext.jsx';
import ISCMOrganizationalChart from '../components/personal/ISCMOrganizationalChart.jsx';

/** Home — landing page shown on login and via the navbar logo. */
export default function Home() {
  const { lang } = useLanguage();
  const vi = lang === 'vi';

  return (
    <div className="w-full space-y-4 pb-10">
      <header className="flex flex-wrap items-start justify-between gap-3 border-l-4 border-[#990000] pl-4 py-1">
        <div>
          <h1 className="flex items-center gap-2 font-barlow text-3xl font-extrabold uppercase tracking-wider text-neutral-900">
            <UsersRound className="h-7 w-7 text-[#990000]" />
            {vi ? 'CƠ CẤU TỔ CHỨC ISCM' : 'ISCM ORGANIZATIONAL STRUCTURE'}
          </h1>
          <p className="mt-1 font-ibm text-xs uppercase tracking-wider text-neutral-500">
            {vi ? 'Sơ đồ phân nhiệm chi tiết các bộ phận và nhân sự' : 'Detailed functional structure and staff mapping'}
          </p>
        </div>
      </header>

      <div className="bg-white border border-neutral-200 p-6 shadow-sm">
        <ISCMOrganizationalChart lang={lang} />
      </div>
    </div>
  );
}

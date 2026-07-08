import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Power, Menu, X } from 'lucide-react';
import GlobalSearch from './GlobalSearch.jsx';
import { users } from '../data/mockData.js';
import { supabase, isLive } from '../lib/supabaseClient.js';
import { useLanguage } from '../i18n/LanguageContext.jsx';
import { NAVIGATION_LOCALIZATION } from '../data/navigationLocalization.js';

export default function NavBar({ active, onNavigate, onOpenAsset }) {
  const { lang, toggle } = useLanguage();
  const [openMenu, setOpenMenu] = useState(null); // 'workspace' | 'group' | 'overview' | 'profile-dropdown' | null
  const [mobileOpen, setMobileOpen] = useState(false);
  const closeTimer = useRef(null);
  
  // Profile state
  const [dbUser, setDbUser] = useState(null);

  useEffect(() => {
    if (!isLive) return;
    const fetchUser = async () => {
      try {
        const { data } = await supabase
          .from('users_profiles')
          .select('*')
          .eq('global_system_role', 'Director')
          .limit(1)
          .single();
        if (data) setDbUser(data);
      } catch (e) {
        console.error('Failed to load user email in Navbar:', e);
      }
    };
    fetchUser();
  }, []);

  const currentUser = dbUser || users[0];

  const openAt = (key) => {
    clearTimeout(closeTimer.current);
    setOpenMenu(key);
  };

  const scheduleClose = () => {
    closeTimer.current = setTimeout(() => {
      setOpenMenu(null);
    }, 180);
  };

  const closeAll = () => {
    setOpenMenu(null);
    setMobileOpen(false);
  };

  const navigateTo = (route, subView = null) => {
    onNavigate(route);
    if (subView) {
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('select-dashboard', { detail: subView }));
      }, 50);
    }
    closeAll();
  };

  const topBtnClass = (key, isActive) =>
    `flex items-center gap-1 px-3.5 font-sans text-[11px] font-bold uppercase tracking-wider transition-colors h-full border-b ${
      isActive || openMenu === key
        ? 'text-[#990000] border-[#990000] bg-neutral-50'
        : 'text-neutral-600 border-transparent hover:text-neutral-950 hover:bg-neutral-50'
    }`;

  const dropdownClass =
    'absolute top-12 bg-white border border-neutral-200 shadow-none rounded-none z-50 p-1 transition-all duration-150';

  // Get active translation dictionary
  const t = NAVIGATION_LOCALIZATION[lang] || NAVIGATION_LOCALIZATION.en;

  return (
    <header className="relative z-40 h-12 shrink-0 bg-white text-neutral-900 border-b border-neutral-200 border-t-2 border-t-[#990000] font-sans">
      <div className="w-full h-full px-4 flex items-center justify-between">
        
        {/* Brand logo block */}
        <button
          onClick={() => navigateTo('personal-dashboard')}
          className="flex h-full w-40 shrink-0 items-center justify-center border-r border-neutral-200 transition-colors hover:bg-neutral-50 -ml-4 mr-4"
          title="ISCM Control Panel"
        >
          <img
            src="https://iscm.ueh.edu.vn/_next/image?url=%2Fimages%2Flogoiscm.png&w=384&q=75"
            alt="ISCM Logo"
            className="h-7 w-auto object-contain brightness-0"
          />
        </button>

        {/* Main Nav Tree (Desktop) */}
        <nav className="hidden lg:flex items-stretch h-full flex-1" onMouseLeave={scheduleClose}>
          
          {/* WORKSPACE Dropdown */}
          <div className="relative flex items-stretch h-full" onMouseEnter={() => openAt('workspace')}>
            <button
              onClick={() => (openMenu === 'workspace' ? setOpenMenu(null) : openAt('workspace'))}
              className={topBtnClass('workspace', ['personal-dashboard', 'matrix-assigner', 'hierarchical-projects', 'approval-engine', 'iscm-core'].includes(active))}
            >
              {t.WORKSPACE}
              <ChevronDown className="h-3 w-3" />
            </button>
            {openMenu === 'workspace' && (
              <div 
                className={`${dropdownClass} w-96 left-0`}
                onMouseEnter={() => openAt('workspace')}
              >
                <ul className="space-y-0.5">
                  <li>
                    <button
                      onClick={() => navigateTo('personal-dashboard', 'workspace-calendar')}
                      className="w-full text-left rounded-none px-3 py-1.5 text-xs hover:bg-[#990000] hover:text-white transition-colors font-bold text-neutral-800"
                    >
                      {t.MY_WORKSPACE}
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => navigateTo('matrix-assigner')}
                      className="w-full text-left rounded-none px-3 py-1.5 text-xs hover:bg-[#990000] hover:text-white transition-colors font-bold text-neutral-800"
                    >
                      {t.HR_MANAGEMENT}
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => navigateTo('hierarchical-projects')}
                      className="w-full text-left rounded-none px-3 py-1.5 text-xs hover:bg-[#990000] hover:text-white transition-colors font-bold text-neutral-800"
                    >
                      {t.PROJECT_MANAGEMENT}
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => navigateTo('approval-engine')}
                      className="w-full text-left rounded-none px-3 py-1.5 text-xs hover:bg-[#990000] hover:text-white transition-colors font-bold text-neutral-800"
                    >
                      {t.APPROVAL_WORKFLOW}
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => navigateTo('iscm-core')}
                      className="w-full text-left rounded-none px-3 py-1.5 text-xs hover:bg-[#990000] hover:text-white transition-colors font-bold text-neutral-800"
                    >
                      {t.ISCM_CORE}
                    </button>
                  </li>
                </ul>
              </div>
            )}
          </div>

          {/* GROUP MANAGEMENT Dropdown */}
          <div className="relative flex items-stretch h-full" onMouseEnter={() => openAt('group')}>
            <button
              onClick={() => (openMenu === 'group' ? setOpenMenu(null) : openAt('group'))}
              className={topBtnClass('group', ['research-sub-workspace', 'placeholder-cl1', 'placeholder-cl2', 'placeholder-cl4', 'placeholder-cl5', 'placeholder-cl6'].includes(active))}
            >
              {t.GROUP_MANAGEMENT}
              <ChevronDown className="h-3 w-3" />
            </button>
            {openMenu === 'group' && (
              <div 
                className={`${dropdownClass} w-96 left-0`}
                onMouseEnter={() => openAt('group')}
              >
                <ul className="space-y-0.5">
                  <li>
                    <button
                      onClick={() => navigateTo('placeholder-cl1')}
                      className="w-full text-left rounded-none px-3 py-1.5 text-xs hover:bg-[#990000] hover:text-white transition-colors font-bold text-neutral-800"
                    >
                      {t.OP_FINANCE}
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => navigateTo('placeholder-cl2')}
                      className="w-full text-left rounded-none px-3 py-1.5 text-xs hover:bg-[#990000] hover:text-white transition-colors font-bold text-neutral-800"
                    >
                      {t.ACADEMIA}
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => navigateTo('research-sub-workspace')}
                      className="w-full text-left rounded-none px-3 py-1.5 text-xs hover:bg-[#990000] hover:text-white transition-colors font-bold text-neutral-800 flex items-center justify-between"
                    >
                      <span>{t.RESEARCH}</span>
                      <span className="text-[9px] uppercase border border-neutral-900 px-1 py-0.2 scale-90 font-bold text-neutral-900 bg-neutral-100">Active</span>
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => navigateTo('placeholder-cl4')}
                      className="w-full text-left rounded-none px-3 py-1.5 text-xs hover:bg-[#990000] hover:text-white transition-colors font-bold text-neutral-800"
                    >
                      {t.COMMUNITY}
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => navigateTo('placeholder-cl5')}
                      className="w-full text-left rounded-none px-3 py-1.5 text-xs hover:bg-[#990000] hover:text-white transition-colors font-bold text-neutral-800"
                    >
                      {t.PARTNERSHIP}
                    </button>
                  </li>
                </ul>
              </div>
            )}
          </div>

          {/* ISCM OVERVIEW Dropdown */}
          <div className="relative flex items-stretch h-full" onMouseEnter={() => openAt('overview')}>
            <button
              onClick={() => (openMenu === 'overview' ? setOpenMenu(null) : openAt('overview'))}
              className={topBtnClass('overview', ['placeholder-dl2', 'placeholder-dl3', 'placeholder-dl4'].includes(active))}
            >
              {t.ISCM_OVERVIEW}
              <ChevronDown className="h-3 w-3" />
            </button>
            {openMenu === 'overview' && (
              <div 
                className={`${dropdownClass} w-96 left-0`}
                onMouseEnter={() => openAt('overview')}
              >
                <ul className="space-y-0.5">
                  <li>
                    <button
                      onClick={() => navigateTo('placeholder-dl2')}
                      className="w-full text-left rounded-none px-3 py-1.5 text-xs hover:bg-[#990000] hover:text-white transition-colors font-bold text-neutral-800"
                    >
                      {t.UEH_UNITS}
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => navigateTo('placeholder-dl3')}
                      className="w-full text-left rounded-none px-3 py-1.5 text-xs hover:bg-[#990000] hover:text-white transition-colors font-bold text-neutral-800"
                    >
                      {t.ISCM_ORGANIZATION}
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => navigateTo('placeholder-dl4')}
                      className="w-full text-left rounded-none px-3 py-1.5 text-xs hover:bg-[#990000] hover:text-white transition-colors font-bold text-neutral-800"
                    >
                      {t.ISCM_UNITS}
                    </button>
                  </li>
                </ul>
              </div>
            )}
          </div>
        </nav>

        {/* Far-right Search & Profile info */}
        <div className="flex items-center gap-2 ml-auto h-full">
          <div className="w-40 sm:w-44 md:w-48">
            <GlobalSearch onOpenAsset={onOpenAsset} />
          </div>

          {/* VN/EN Language Toggle */}
          <button
            onClick={toggle}
            title={lang === 'vi' ? 'Switch to English' : 'Chuyển sang Tiếng Việt'}
            className="flex items-center gap-1 rounded-none border border-neutral-300 px-2.5 py-1 text-[10px] font-bold text-neutral-600 hover:border-[#990000] hover:text-[#990000] hover:bg-neutral-50 transition-colors shrink-0 uppercase"
          >
            <span>{lang === 'vi' ? 'VN' : 'EN'}</span>
          </button>

          {/* User profile dropdown trigger */}
          <button
            onClick={() => setOpenMenu(openMenu === 'profile-dropdown' ? null : 'profile-dropdown')}
            className="hidden xl:flex flex-col justify-center h-full px-2 border-l border-neutral-100 text-right hover:bg-neutral-50 transition-colors focus:outline-none"
            title="Open Profile Navigation"
          >
            <span className="font-sans text-[11px] font-bold text-neutral-900 uppercase leading-none">{currentUser.full_name || 'TRỊNH TÚ ANH'}</span>
            <span className="font-sans text-[9px] text-neutral-500 mt-1 leading-none truncate max-w-[150px]">{currentUser.email}</span>
          </button>
          
          {openMenu === 'profile-dropdown' && (
            <div className={`${dropdownClass} w-64 right-12 top-12 text-left`}>
              <div className="px-3 py-2 border-b border-neutral-100 mb-1">
                <span className="block font-sans text-xs font-bold text-neutral-900 uppercase">
                  {currentUser.full_name || 'TRỊNH TÚ ANH'}
                </span>
                <span className="block font-sans text-[9px] text-neutral-400 uppercase tracking-widest mt-0.5">
                  {currentUser.system_role || 'Director'}
                </span>
              </div>
              <ul className="space-y-0.5 text-xs text-neutral-700">
                {[
                  { label: t.USER_PORTAL, key: 'my-portal' },
                  { label: t.USER_FORMS, key: 'cat-forms' },
                  { label: t.USER_WIKI, key: 'cat-wiki' },
                  { label: t.USER_CONTACTS, key: 'cat-contacts' }
                ].map((item) => (
                  <li key={item.key}>
                    <button
                      onClick={() => {
                        navigateTo('personal-dashboard');
                        setTimeout(() => {
                          window.dispatchEvent(new CustomEvent('select-dashboard', { detail: item.key }));
                        }, 50);
                        closeAll();
                      }}
                      className="w-full text-left rounded-none px-3 py-1.5 hover:bg-[#990000] hover:text-white transition-colors font-semibold"
                    >
                      {item.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Log Out Button */}
          <button className="rounded-none border border-neutral-300 p-1.5 hover:border-[#990000] hover:bg-[#990000] hover:text-white transition-colors" title={t.LOGOUT}>
            <Power className="h-3.5 w-3.5" />
          </button>

          {/* Mobile responsive toggle */}
          <button 
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden p-1 rounded-none border border-neutral-300 hover:bg-neutral-50 transition-colors"
          >
            {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="absolute inset-x-0 top-12 max-h-[85vh] overflow-y-auto bg-white border-t border-neutral-200 p-4 shadow-none lg:hidden flex flex-col gap-4">
          <div>
            <div className="text-[10px] font-bold uppercase text-[#990000] mb-1">{t.WORKSPACE}</div>
            <button onClick={() => navigateTo('personal-dashboard', 'workspace-calendar')} className="block w-full text-left px-2 py-1 text-xs text-neutral-700 hover:bg-neutral-50">{t.MY_WORKSPACE}</button>
            <button onClick={() => navigateTo('matrix-assigner')} className="block w-full text-left px-2 py-1 text-xs text-neutral-700 hover:bg-neutral-50">{t.HR_MANAGEMENT}</button>
            <button onClick={() => navigateTo('hierarchical-projects')} className="block w-full text-left px-2 py-1 text-xs text-neutral-700 hover:bg-neutral-50">{t.PROJECT_MANAGEMENT}</button>
            <button onClick={() => navigateTo('approval-engine')} className="block w-full text-left px-2 py-1 text-xs text-neutral-700 hover:bg-neutral-50">{t.APPROVAL_WORKFLOW}</button>
            <button onClick={() => navigateTo('iscm-core')} className="block w-full text-left px-2 py-1 text-xs text-neutral-700 hover:bg-neutral-50">{t.ISCM_CORE}</button>
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase text-[#990000] mb-1">{t.GROUP_MANAGEMENT}</div>
            <button onClick={() => navigateTo('placeholder-cl1')} className="block w-full text-left px-2 py-1 text-xs text-neutral-700 hover:bg-neutral-50">{t.OP_FINANCE}</button>
            <button onClick={() => navigateTo('placeholder-cl2')} className="block w-full text-left px-2 py-1 text-xs text-neutral-700 hover:bg-neutral-50">{t.ACADEMIA}</button>
            <button onClick={() => navigateTo('research-sub-workspace')} className="block w-full text-left px-2 py-1 text-xs text-neutral-700 hover:bg-neutral-50">{t.RESEARCH}</button>
            <button onClick={() => navigateTo('placeholder-cl4')} className="block w-full text-left px-2 py-1 text-xs text-neutral-700 hover:bg-neutral-50">{t.COMMUNITY}</button>
            <button onClick={() => navigateTo('placeholder-cl5')} className="block w-full text-left px-2 py-1 text-xs text-neutral-700 hover:bg-neutral-50">{t.PARTNERSHIP}</button>
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase text-[#990000] mb-1">{t.ISCM_OVERVIEW}</div>
            <button onClick={() => navigateTo('placeholder-dl2')} className="block w-full text-left px-2 py-1 text-xs text-neutral-700 hover:bg-neutral-50">{t.UEH_UNITS}</button>
            <button onClick={() => navigateTo('placeholder-dl3')} className="block w-full text-left px-2 py-1 text-xs text-neutral-700 hover:bg-neutral-50">{t.ISCM_ORGANIZATION}</button>
            <button onClick={() => navigateTo('placeholder-dl4')} className="block w-full text-left px-2 py-1 text-xs text-neutral-700 hover:bg-neutral-50">{t.ISCM_UNITS}</button>
          </div>
        </div>
      )}
    </header>
  );
}

import { useState, useRef, useEffect } from 'react';
import { Bell, ChevronDown, LogIn, LogOut, Menu, X } from 'lucide-react';
import GlobalSearch from './GlobalSearch.jsx';
import { users } from '../data/mockData.js';
import { supabase, isLive } from '../lib/supabaseClient.js';
import { useLanguage } from '../i18n/LanguageContext.jsx';
import { useAuth } from '../auth/AuthContext.jsx';
import { NAVIGATION_LOCALIZATION } from '../data/navigationLocalization.js';
import { fetchNotifications, markNotificationRead, markAllNotificationsRead, subscribeToNotifications } from '../lib/notifications.js';

function timeAgo(iso, lang) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return lang === 'vi' ? 'Vừa xong' : 'Just now';
  if (mins < 60) return lang === 'vi' ? `${mins} phút trước` : `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return lang === 'vi' ? `${hours} giờ trước` : `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return lang === 'vi' ? `${days} ngày trước` : `${days}d ago`;
}

export default function NavBar({ active, onNavigate, onOpenAsset }) {
  const { lang, toggle } = useLanguage();
  const { user: authUser, signInWithGoogle, signOut } = useAuth();
  const [openMenu, setOpenMenu] = useState(null); // 'workspace' | 'group' | 'overview' | 'profile-dropdown' | null
  const [mobileOpen, setMobileOpen] = useState(false);
  const closeTimer = useRef(null);
  
  // Profile state
  const [dbUser, setDbUser] = useState(null);

  useEffect(() => {
    if (!isLive || !authUser) { setDbUser(null); return; }
    const fetchUser = async () => {
      try {
        // Look up the signed-in Google account's own row — this is what
        // determines their real global_system_role (e.g. 'Director'/admin),
        // not just "whichever profile happens to be flagged Director".
        const { data } = await supabase
          .from('users_profiles')
          .select('*')
          .eq('id', authUser.id)
          .single();
        if (data) setDbUser(data);
      } catch (e) {
        console.error('Failed to load signed-in user profile in Navbar:', e);
      }
    };
    fetchUser();
  }, [authUser]);

  // Notifications
  const [notifications, setNotifications] = useState([]);
  const unreadCount = notifications.filter((n) => !n.is_read).length;

  useEffect(() => {
    if (!isLive || !authUser) { setNotifications([]); return; }
    fetchNotifications(authUser.id).then(setNotifications);
    const unsubscribe = subscribeToNotifications(authUser.id, (row) => {
      setNotifications((prev) => [row, ...prev]);
    });
    return unsubscribe;
  }, [authUser]);

  const handleOpenNotification = async (n) => {
    if (!n.is_read) {
      setNotifications((prev) => prev.map((x) => (x.id === n.id ? { ...x, is_read: true } : x)));
      markNotificationRead(n.id);
    }
  };

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((x) => ({ ...x, is_read: true })));
    if (authUser) markAllNotificationsRead(authUser.id);
  };

  const currentUser = dbUser || users[0];
  // A real Google sign-in (via Supabase Auth) overrides the mock/demo profile above.
  const displayName = authUser?.user_metadata?.full_name || authUser?.user_metadata?.name || currentUser.full_name || 'TRỊNH TÚ ANH';
  const displayEmail = authUser?.email || currentUser.email;
  // DB rows use `global_system_role`; the mock fallback array uses `system_role`.
  const displayRole = currentUser.global_system_role || currentUser.system_role || 'Director';

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
    `flex items-center gap-1.5 px-4 font-sans text-xs font-bold uppercase tracking-wider transition-colors h-full border-b-2 ${
      isActive || openMenu === key
        ? 'text-[#ff4d4d] border-[#990000] bg-neutral-900/50'
        : 'text-neutral-300 border-transparent hover:text-white hover:bg-neutral-800'
    }`;

  const dropdownClass =
    'absolute top-14 bg-white border border-neutral-200 shadow-lg rounded-none z-50 p-1 transition-all duration-150 text-neutral-900';

  // Get active translation dictionary
  const t = NAVIGATION_LOCALIZATION[lang] || NAVIGATION_LOCALIZATION.en;

  return (
    <header className="relative z-40 h-14 shrink-0 bg-[#1c1c1c] text-white border-b border-neutral-800 font-sans shadow-md">
      <div className="w-full h-full px-4 flex items-center justify-between">
        
        {/* Brand logo block */}
        <button
          onClick={() => navigateTo('personal-dashboard')}
          className="flex h-full px-6 shrink-0 items-center justify-center bg-[#990000] hover:bg-[#b30000] text-white font-barlow text-2xl font-black uppercase tracking-widest transition-colors -ml-4 mr-4"
          title="ISCM Control Panel"
        >
          ISCM
        </button>

        {/* Main Nav Tree (Desktop) */}
        <nav className="hidden lg:flex items-stretch h-full flex-1" onMouseLeave={scheduleClose}>
          
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
            className="flex items-center gap-1 rounded-none border border-neutral-700 bg-neutral-800 px-2.5 py-1 text-[10px] font-bold text-neutral-300 hover:border-[#990000] hover:text-white hover:bg-neutral-700 transition-colors shrink-0 uppercase"
          >
            <span>{lang === 'vi' ? 'VN' : 'EN'}</span>
          </button>

          {/* Notifications bell */}
          {authUser && (
            <div className="relative flex items-stretch h-full">
              <button
                onClick={() => setOpenMenu(openMenu === 'notifications' ? null : 'notifications')}
                title={lang === 'vi' ? 'Thông báo' : 'Notifications'}
                className="relative flex items-center justify-center px-2.5 rounded-none border border-neutral-700 bg-neutral-800 text-neutral-300 hover:border-[#990000] hover:text-white hover:bg-neutral-700 transition-colors shrink-0"
              >
                <Bell className="h-4 w-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[#ff3b30] px-1 text-[9px] font-bold leading-none text-white">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {openMenu === 'notifications' && (
                <div className={`${dropdownClass} w-80 right-0 top-14 text-left`}>
                  <div className="flex items-center justify-between px-3 py-2 border-b border-neutral-100 mb-1">
                    <span className="font-sans text-xs font-bold uppercase text-neutral-900">
                      {lang === 'vi' ? 'Thông báo' : 'Notifications'}
                    </span>
                    {unreadCount > 0 && (
                      <button onClick={handleMarkAllRead} className="font-sans text-[10px] font-semibold text-[#990000] hover:underline">
                        {lang === 'vi' ? 'Đánh dấu đã đọc' : 'Mark all read'}
                      </button>
                    )}
                  </div>
                  <ul className="max-h-80 overflow-y-auto space-y-0.5">
                    {notifications.length === 0 && (
                      <li className="px-3 py-6 text-center font-sans text-[11px] text-neutral-400">
                        {lang === 'vi' ? 'Chưa có thông báo nào' : 'No notifications yet'}
                      </li>
                    )}
                    {notifications.map((n) => (
                      <li key={n.id}>
                        <button
                          onClick={() => handleOpenNotification(n)}
                          className={`w-full text-left rounded-none px-3 py-2 text-xs transition-colors hover:bg-neutral-50 ${!n.is_read ? 'bg-red-50/40' : ''}`}
                        >
                          <div className="flex items-start gap-1.5">
                            {!n.is_read && <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[#990000]" />}
                            <div className={`min-w-0 flex-1 ${n.is_read ? 'pl-3' : ''}`}>
                              <p className="font-semibold text-neutral-800 leading-tight">{n.title}</p>
                              {n.body && <p className="mt-0.5 text-[10px] text-neutral-500 leading-snug">{n.body}</p>}
                              <p className="mt-0.5 text-[9px] text-neutral-400">{timeAgo(n.created_at, lang)}</p>
                            </div>
                          </div>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* User profile dropdown trigger */}
          <button
            onClick={() => setOpenMenu(openMenu === 'profile-dropdown' ? null : 'profile-dropdown')}
            className="hidden xl:flex flex-col justify-center h-full px-4 border-l border-neutral-800 text-right hover:bg-neutral-800 transition-colors focus:outline-none"
            title="Open Profile Navigation"
          >
            <span className="font-sans text-[11px] font-bold text-white uppercase leading-none">{displayName}</span>
            <span className="font-sans text-[9px] text-neutral-400 mt-1 leading-none truncate max-w-[150px]">{displayEmail}</span>
          </button>

          {openMenu === 'profile-dropdown' && (
            <div className={`${dropdownClass} w-64 right-12 top-14 text-left`}>
              <div className="px-3 py-2 border-b border-neutral-100 mb-1">
                <span className="block font-sans text-xs font-bold text-neutral-900 uppercase">
                  {displayName}
                </span>
                <span className="block font-sans text-[9px] text-neutral-400 uppercase tracking-widest mt-0.5">
                  {displayRole}
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
              <ul className="space-y-0.5 text-xs text-neutral-700 mt-1 pt-1 border-t border-neutral-100">
                {authUser ? (
                  <li>
                    <button
                      onClick={() => { signOut(); closeAll(); }}
                      className="w-full flex items-center gap-1.5 text-left rounded-none px-3 py-1.5 hover:bg-[#990000] hover:text-white transition-colors font-semibold"
                    >
                      <LogOut className="h-3 w-3" /> {t.LOGOUT}
                    </button>
                  </li>
                ) : (
                  <li>
                    <button
                      onClick={() => { signInWithGoogle(); closeAll(); }}
                      className="w-full flex items-center gap-1.5 text-left rounded-none px-3 py-1.5 hover:bg-[#990000] hover:text-white transition-colors font-semibold"
                    >
                      <LogIn className="h-3 w-3" /> {t.SIGN_IN_GOOGLE}
                    </button>
                  </li>
                )}
              </ul>
            </div>
          )}

          {/* Mobile responsive toggle */}
          <button 
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden p-1 rounded-none border border-neutral-700 bg-neutral-800 text-neutral-300 hover:bg-neutral-700 transition-colors"
          >
            {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="absolute inset-x-0 top-14 max-h-[85vh] overflow-y-auto bg-white border-t border-neutral-200 p-4 shadow-lg lg:hidden flex flex-col gap-4 text-neutral-900">
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
          <div>
            <div className="text-[10px] font-bold uppercase text-[#990000] mb-1">{t.ISCM_CORE}</div>
            <button onClick={() => navigateTo('iscm-core', 'core-pipeline')} className="block w-full text-left px-2 py-1 text-xs text-neutral-700 hover:bg-neutral-50">{lang === 'vi' ? 'Sơ đồ luồng dữ liệu' : 'Data Pipeline Map'}</button>
            <button onClick={() => navigateTo('iscm-core', 'core-dashboard')} className="block w-full text-left px-2 py-1 text-xs text-neutral-700 hover:bg-neutral-50">{lang === 'vi' ? 'Tổng kho dữ liệu' : 'Data Catalog Dashboard'}</button>
            <button onClick={() => navigateTo('iscm-core', 'core-policy')} className="block w-full text-left px-2 py-1 text-xs text-neutral-700 hover:bg-neutral-50">{lang === 'vi' ? 'Chính sách bảo mật thông tin' : 'Information Security Policy'}</button>
          </div>
        </div>
      )}
    </header>
  );
}

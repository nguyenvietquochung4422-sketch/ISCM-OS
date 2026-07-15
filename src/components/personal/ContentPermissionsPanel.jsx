import { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronDown, Search, ShieldCheck } from 'lucide-react';
import { supabase, isLive } from '../../lib/supabaseClient.js';
import { useAuth } from '../../auth/AuthContext.jsx';
import { useLanguage } from '../../i18n/LanguageContext.jsx';
import { NAVIGATION_LOCALIZATION } from '../../data/navigationLocalization.js';
import { ISCM_MEMBERS } from '../../data/iscmMembers.js';
import { createNotification } from '../../lib/notifications.js';

// Personal pages that always belong to the account viewing them — there is
// no "admin of someone else's data" to assign here, each is either a
// self-synced view or a personal inbox/log, so they're excluded entirely.
// (attendance-log is NOT here — it also holds WFH/leave/absence requests
// from everyone else that need an approver, so it's a real permission.)
const SELF_OWNED_KEYS = new Set(['profile-bio', 'my-assets', 'my-tasks', 'my-forms']);

// Content keys that actually gate real edit/moderate behavior in the app
// today (checked via can_manage_content()). Every other item below is a
// forward-looking placeholder — granting it is recorded but nothing in the
// app currently reads that grant to change what that account can do.
const ENFORCED_KEYS = new Set(['form:order-book', 'attendance-log']);

/** Flatten the sidebar nav tree into a flat list of manageable content leaves. */
function flattenContentItems(nodes, out = []) {
  nodes.forEach((node) => {
    if (node.adminOnly) return; // never let this panel govern itself
    if (node.children) {
      flattenContentItems(node.children, out);
    } else if (node.key && !SELF_OWNED_KEYS.has(node.key)) {
      out.push({ key: node.key, label: node.label });
    }
  });
  return out;
}

export default function ContentPermissionsPanel() {
  const { lang } = useLanguage();
  const { user: authUser } = useAuth();
  const [authorized, setAuthorized] = useState(null); // null = checking, true/false = resolved
  const [grants, setGrants] = useState({}); // { [contentKey]: Set(email) }
  const [loading, setLoading] = useState(true);

  // The full member roster (not just accounts that have already signed in) —
  // anyone in the directory can be granted a permission ahead of their first
  // sign-in, same precedent as role_presets.
  const allUsers = useMemo(
    () => ISCM_MEMBERS
      .filter((m) => m.email)
      .map((m) => ({ email: m.email, name: lang === 'vi' ? m.nameVi : (m.nameEn || m.nameVi) }))
      .sort((a, b) => a.name.localeCompare(b.name)),
    [lang]
  );
  const [query, setQuery] = useState('');
  const [openKey, setOpenKey] = useState(null);
  const panelRef = useRef(null);

  useEffect(() => {
    if (!openKey) return;
    const handleClickOutside = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) setOpenKey(null);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openKey]);

  const contentItems = useMemo(
    () => flattenContentItems(NAVIGATION_LOCALIZATION[lang]?.SIDEBAR_TREE || []),
    [lang]
  );

  useEffect(() => {
    if (!isLive || !authUser) { setAuthorized(false); return; }
    supabase.rpc('is_top_admin').then(({ data, error }) => {
      setAuthorized(!error && Boolean(data));
    });
  }, [authUser]);

  useEffect(() => {
    if (!isLive || authorized !== true) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      const { data: perms } = await supabase.from('content_permissions').select('content_key, email');
      if (cancelled) return;
      const map = {};
      (perms || []).forEach((p) => {
        if (!map[p.content_key]) map[p.content_key] = new Set();
        map[p.content_key].add(p.email);
      });
      setGrants(map);
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [authorized]);

  const handleToggleWithConfirm = (item, user) => {
    const isSelected = (grants[item.key] || new Set()).has(user.email);
    const willGrant = !isSelected;
    const msg = willGrant
      ? (lang === 'vi'
          ? `Bạn có chắc chắn muốn cấp quyền quản trị "${item.label}" cho ${user.name}?`
          : `Grant admin rights over "${item.label}" to ${user.name}?`)
      : (lang === 'vi'
          ? `Bạn có chắc chắn muốn thu hồi quyền quản trị "${item.label}" của ${user.name}?`
          : `Revoke admin rights over "${item.label}" from ${user.name}?`);
    if (!window.confirm(msg)) return;
    toggleGrant(item.key, item.label, user.email, willGrant);
  };

  const toggleGrant = async (contentKey, contentLabel, email, willGrant) => {
    setGrants((prev) => {
      const next = { ...prev, [contentKey]: new Set(prev[contentKey] || []) };
      if (willGrant) next[contentKey].add(email); else next[contentKey].delete(email);
      return next;
    });

    if (willGrant) {
      const { error } = await supabase.from('content_permissions').insert({
        content_key: contentKey,
        content_label: contentLabel,
        email,
        granted_by: authUser.id,
      });
      // Only reachable if that person has already signed in at least once —
      // otherwise there's no account yet to attach a notification to.
      if (!error) {
        const { data: target } = await supabase.from('users_profiles').select('id').eq('email', email).maybeSingle();
        if (target) {
          createNotification({
            userId: target.id,
            title: lang === 'vi' ? 'Bạn vừa được cấp quyền quản trị' : 'You were granted admin rights',
            body: contentLabel,
          });
        }
      }
    } else {
      await supabase.from('content_permissions').delete().eq('content_key', contentKey).eq('email', email);
    }
  };

  const filteredItems = contentItems.filter((i) => i.label.toLowerCase().includes(query.trim().toLowerCase()));

  if (!isLive) {
    return (
      <div className="font-sans text-xs text-neutral-500 p-4 border border-neutral-200 bg-neutral-50">
        {lang === 'vi' ? 'Tính năng này cần kết nối Supabase (chế độ demo không hỗ trợ).' : 'This feature requires a live Supabase connection (not available in demo mode).'}
      </div>
    );
  }

  if (authorized === null) {
    return <div className="font-sans text-xs text-neutral-400 p-4">{lang === 'vi' ? 'Đang kiểm tra quyền...' : 'Checking permissions...'}</div>;
  }

  if (authorized === false) {
    return (
      <div className="font-sans text-xs text-red-700 p-4 border border-red-200 bg-red-50">
        {lang === 'vi'
          ? 'Bạn không có quyền truy cập mục này. Chỉ Admin, Director, hoặc Vice Director mới có thể phân quyền quản trị nội dung.'
          : 'You do not have access to this page. Only Admin, Director, or Vice Director can manage content permissions.'}
      </div>
    );
  }

  return (
    <div className="space-y-3 font-sans">
      <p className="text-xs text-neutral-500 leading-relaxed">
        {lang === 'vi'
          ? 'Chọn tài khoản có quyền quản trị toàn phần (chỉnh sửa, kiểm duyệt) cho từng mục nội dung bên dưới.'
          : 'Pick which accounts get full admin rights (edit, moderate) over each content item below.'}
      </p>
      <p className="text-[11px] text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1.5 leading-relaxed">
        {lang === 'vi'
          ? 'Các mục có nhãn "Chưa kích hoạt" chưa có chức năng kiểm duyệt thật trong app — quyền vẫn được lưu lại để dùng khi tính năng đó được xây dựng, nhưng hiện tại chưa thay đổi được gì.'
          : 'Items labeled "Not yet enforced" have no real edit/moderate feature in the app yet — the grant is saved for when that feature is built, but it doesn’t change anything today.'}
      </p>

      <div className="relative max-w-sm">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={lang === 'vi' ? 'Tìm mục nội dung...' : 'Search content items...'}
          className="w-full rounded-none border border-neutral-300 bg-white py-1.5 pl-8 pr-2.5 text-xs focus:border-neutral-900 focus:outline-none"
        />
      </div>

      {loading ? (
        <div className="text-xs text-neutral-400 p-4">{lang === 'vi' ? 'Đang tải...' : 'Loading...'}</div>
      ) : (
        <div className="border border-neutral-200 divide-y divide-neutral-100">
          {filteredItems.map((item) => {
            const selectedEmails = grants[item.key] || new Set();
            const selectedUsers = allUsers.filter((u) => selectedEmails.has(u.email));
            const isOpen = openKey === item.key;
            return (
              <div key={item.key} className="flex flex-col gap-1.5 p-3 sm:flex-row sm:items-center sm:gap-4">
                <div className="flex items-center gap-1.5 sm:w-64 shrink-0">
                  <ShieldCheck className="h-3.5 w-3.5 text-[#990000] shrink-0" />
                  <span className="text-xs font-semibold text-neutral-800">{item.label}</span>
                  {ENFORCED_KEYS.has(item.key) ? (
                    <span className="shrink-0 border border-emerald-300 bg-emerald-50 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-emerald-700">
                      {lang === 'vi' ? 'Đang áp dụng' : 'Active'}
                    </span>
                  ) : (
                    <span className="shrink-0 border border-neutral-200 bg-neutral-50 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-neutral-400">
                      {lang === 'vi' ? 'Chưa kích hoạt' : 'Not yet enforced'}
                    </span>
                  )}
                </div>

                <div className="relative flex-1" ref={isOpen ? panelRef : null}>
                  <button
                    type="button"
                    onClick={() => setOpenKey(isOpen ? null : item.key)}
                    className="flex w-full items-center justify-between gap-2 rounded-none border border-neutral-200 bg-white px-2.5 py-1.5 text-left text-xs focus:border-[#990000] focus:outline-none"
                  >
                    <span className="truncate text-neutral-700">
                      {selectedUsers.length > 0
                        ? selectedUsers.map((u) => u.name).join(', ')
                        : <span className="italic text-neutral-400">{lang === 'vi' ? 'Chưa có ai — bấm để chọn' : 'No one yet — click to pick'}</span>}
                    </span>
                    <ChevronDown className={`h-3.5 w-3.5 shrink-0 text-neutral-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {isOpen && (
                    <div className="absolute left-0 right-0 top-full z-20 mt-1 max-h-64 overflow-y-auto border border-neutral-200 bg-white shadow-lg">
                      {allUsers.map((u) => {
                        const checked = selectedEmails.has(u.email);
                        return (
                          <label key={u.email} className="flex cursor-pointer items-center gap-2 px-2.5 py-1.5 text-xs hover:bg-neutral-50">
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => handleToggleWithConfirm(item, u)}
                              className="accent-[#990000]"
                            />
                            <span className="min-w-0 flex-1 truncate text-neutral-700">{u.name} — {u.email}</span>
                          </label>
                        );
                      })}
                    </div>
                  )}
                </div>

                <span className="text-[10px] text-neutral-400 shrink-0 sm:w-16 text-right">
                  {selectedEmails.size} {lang === 'vi' ? 'người' : 'admin(s)'}
                </span>
              </div>
            );
          })}
          {filteredItems.length === 0 && (
            <div className="p-6 text-center text-xs text-neutral-400">
              {lang === 'vi' ? 'Không tìm thấy mục nào.' : 'No content items found.'}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

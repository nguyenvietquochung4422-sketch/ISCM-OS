import { useEffect, useMemo, useState } from 'react';
import { Search, ShieldCheck } from 'lucide-react';
import { supabase, isLive } from '../../lib/supabaseClient.js';
import { useAuth } from '../../auth/AuthContext.jsx';
import { useLanguage } from '../../i18n/LanguageContext.jsx';
import { NAVIGATION_LOCALIZATION } from '../../data/navigationLocalization.js';
import { createNotification } from '../../lib/notifications.js';

/** Flatten the sidebar nav tree into a flat list of manageable content leaves. */
function flattenContentItems(nodes, out = []) {
  nodes.forEach((node) => {
    if (node.adminOnly) return; // never let this panel govern itself
    if (node.children) {
      flattenContentItems(node.children, out);
    } else if (node.key) {
      out.push({ key: node.key, label: node.label });
    }
  });
  return out;
}

export default function ContentPermissionsPanel() {
  const { lang } = useLanguage();
  const { user: authUser } = useAuth();
  const [authorized, setAuthorized] = useState(null); // null = checking, true/false = resolved
  const [allUsers, setAllUsers] = useState([]);
  const [grants, setGrants] = useState({}); // { [contentKey]: Set(userId) }
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');

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
      const [{ data: users }, { data: perms }] = await Promise.all([
        supabase.from('users_profiles').select('id, full_name, email, global_system_role').order('full_name'),
        supabase.from('content_permissions').select('content_key, user_id'),
      ]);
      if (cancelled) return;
      setAllUsers(users || []);
      const map = {};
      (perms || []).forEach((p) => {
        if (!map[p.content_key]) map[p.content_key] = new Set();
        map[p.content_key].add(p.user_id);
      });
      setGrants(map);
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [authorized]);

  const toggleGrant = async (contentKey, contentLabel, userId, willGrant) => {
    setGrants((prev) => {
      const next = { ...prev, [contentKey]: new Set(prev[contentKey] || []) };
      if (willGrant) next[contentKey].add(userId); else next[contentKey].delete(userId);
      return next;
    });

    if (willGrant) {
      const { error } = await supabase.from('content_permissions').insert({
        content_key: contentKey,
        content_label: contentLabel,
        user_id: userId,
        granted_by: authUser.id,
      });
      if (!error) {
        createNotification({
          userId,
          title: lang === 'vi' ? 'Bạn vừa được cấp quyền quản trị' : 'You were granted admin rights',
          body: contentLabel,
        });
      }
    } else {
      await supabase.from('content_permissions').delete().eq('content_key', contentKey).eq('user_id', userId);
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
            const selectedIds = grants[item.key] || new Set();
            return (
              <div key={item.key} className="flex flex-col gap-1.5 p-3 sm:flex-row sm:items-center sm:gap-4">
                <div className="flex items-center gap-1.5 sm:w-64 shrink-0">
                  <ShieldCheck className="h-3.5 w-3.5 text-[#990000] shrink-0" />
                  <span className="text-xs font-semibold text-neutral-800">{item.label}</span>
                </div>
                <select
                  multiple
                  value={Array.from(selectedIds)}
                  onChange={(e) => {
                    const chosen = new Set(Array.from(e.target.selectedOptions).map((o) => o.value));
                    allUsers.forEach((u) => {
                      const wasSelected = selectedIds.has(u.id);
                      const isSelected = chosen.has(u.id);
                      if (wasSelected !== isSelected) toggleGrant(item.key, item.label, u.id, isSelected);
                    });
                  }}
                  className="w-full flex-1 rounded-none border border-neutral-200 bg-white px-2 py-1 text-xs focus:border-[#990000] focus:outline-none"
                  size={4}
                >
                  {allUsers.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.full_name} — {u.email}
                    </option>
                  ))}
                </select>
                <span className="text-[10px] text-neutral-400 shrink-0 sm:w-16 text-right">
                  {selectedIds.size} {lang === 'vi' ? 'người' : 'admin(s)'}
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

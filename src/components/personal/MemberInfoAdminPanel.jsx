import { useEffect, useMemo, useState } from 'react';
import { Plus, Pencil, Trash2, X, Save, Search, UserRound, Users } from 'lucide-react';
import { supabase, isLive } from '../../lib/supabaseClient.js';
import { useAuth } from '../../auth/AuthContext.jsx';
import { useLanguage } from '../../i18n/LanguageContext.jsx';
import { MEMBER_GROUPS } from '../../data/iscmMembers.js';
import { fetchMembers, saveMember, deleteMember, newMemberId } from '../../data/iscmMembersStore.js';
import { fetchAllRoleRows, saveRoleAssignment } from '../../data/orgRoleAssignments.js';
import { fetchExternalMembers, saveExternalMember } from '../../data/externalMembersStore.js';

const inputClass = 'w-full rounded-none border border-neutral-200 bg-white px-2.5 py-1.5 text-xs text-neutral-800 focus:border-[#990000] focus:outline-none';
const labelClass = 'block text-[10px] font-bold uppercase tracking-wide text-neutral-400 mb-1';

/** iscm_members.nameVi carries academic titles ("PGS. TS. ..."); the chart
    displays plain names. Strip the title(s) so the chart card stays short. */
function stripAcademicTitle(nameVi) {
  return nameVi.replace(/^((PGS|TS|ThS|KTS)\.\s*)+/i, '').trim();
}

/* ------------------------------------------------------------------ */
/* Shared — org-chart roles held by one person, embedded in their      */
/* member record instead of a standalone role-by-role list. Matching   */
/* is by member_id for ISCM members (name-text matching broke as soon  */
/* as a title prefix differed) and by exact name for external people.  */
/* Each checkbox toggle saves immediately (same instant-save pattern   */
/* as ContentPermissionsPanel), so it's never bundled into — and can't */
/* be lost by — an unrelated profile-field save.                       */
/* ------------------------------------------------------------------ */

function RoleChecklist({ vi, person }) {
  // person: { id, displayName, isExternal } — id is null for external people.
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [pending, setPending] = useState(null); // role_key currently saving

  const reload = () => {
    setLoading(true);
    fetchAllRoleRows().then((r) => { setRows(r); setLoading(false); });
  };
  useEffect(() => { reload(); }, []);

  // Roles held by more than one person (e.g. "Hoàng Ngọc Lan / Phạm Nguyễn
  // Hoài") can't be captured by a single member_id column, so on top of the
  // exact member_id match, also fall back to splitting pic_name on '/' —
  // this is what lets both co-holders see the role pre-checked.
  const isHeldBy = (row) => {
    if (row.member_id && person.id) return row.member_id === person.id;
    const names = (row.pic_name || '').split('/').map((s) => s.trim()).filter(Boolean);
    return names.includes(person.displayName);
  };

  const filtered = rows.filter((r) =>
    !query.trim() || r.role_label.toLowerCase().includes(query.trim().toLowerCase()));

  const toggle = async (row) => {
    const currentNames = (row.pic_name || '').split('/').map((s) => s.trim()).filter(Boolean);
    const already = currentNames.includes(person.displayName);
    const nextNames = already
      ? currentNames.filter((n) => n !== person.displayName)
      : [...currentNames, person.displayName];

    setPending(row.role_key);
    try {
      await saveRoleAssignment({
        roleKey: row.role_key, roleLabel: row.role_label,
        picName: nextNames.join(' / '),
        isExternal: already ? row.is_external : (row.is_external || person.isExternal),
        // A clean single-owner FK link only makes sense when exactly one
        // name remains and it's the person just checked — otherwise (now
        // vacant, or still shared with someone else) fall back to the
        // text-list match above rather than guess at someone else's id.
        memberId: !already && nextNames.length === 1 ? person.id : null,
      });
      reload();
    } finally {
      setPending(null);
    }
  };

  if (!person.displayName.trim()) {
    return (
      <p className="text-[11px] text-neutral-400 italic p-2">
        {vi ? 'Nhập tên trước khi gán vai trò.' : 'Enter a name before assigning roles.'}
      </p>
    );
  }

  return (
    <div className="border border-neutral-200">
      <div className="p-2 border-b border-neutral-200 bg-neutral-50">
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-400" />
          <input
            type="text" value={query} onChange={(e) => setQuery(e.target.value)}
            placeholder={vi ? 'Tìm phòng ban / bộ phận...' : 'Search department / unit...'}
            className="w-full rounded-none border border-neutral-300 bg-white py-1.5 pl-8 pr-2.5 text-xs focus:border-neutral-900 focus:outline-none"
          />
        </div>
      </div>
      <div className="max-h-56 overflow-y-auto divide-y divide-neutral-100">
        {loading ? (
          <div className="text-xs text-neutral-400 p-3">{vi ? 'Đang tải...' : 'Loading...'}</div>
        ) : filtered.map((row) => {
          const isHeld = isHeldBy(row);
          return (
            <label key={row.role_key} className="flex items-center gap-2 px-2.5 py-1.5 text-xs hover:bg-neutral-50 cursor-pointer">
              <input
                type="checkbox"
                checked={isHeld}
                disabled={pending === row.role_key}
                onChange={() => toggle(row)}
                className="accent-[#990000]"
              />
              <span className="min-w-0 flex-1 truncate text-neutral-700">{row.role_label}</span>
              {!isHeld && row.pic_name && (
                <span className="shrink-0 text-[10px] text-neutral-400" title={vi ? 'Người hiện đang giữ vai trò này' : 'Who currently holds this role'}>
                  {vi ? 'hiện tại: ' : 'currently: '}{row.pic_name}
                </span>
              )}
            </label>
          );
        })}
        {!loading && filtered.length === 0 && (
          <div className="p-3 text-center text-xs text-neutral-400">{vi ? 'Không tìm thấy.' : 'No matches.'}</div>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Tab 1 — ISCM members (internal roster, iscm_members table)          */
/* ------------------------------------------------------------------ */

const EMPTY_FORM = {
  id: '', group: 'staff', nameVi: '', nameEn: '', titleVi: '', titleEn: '',
  fieldVi: '', fieldEn: '', email: '', dutiesText: '', sortOrder: 0,
};

function memberToForm(m) {
  return {
    id: m.id, group: m.group, nameVi: m.nameVi, nameEn: m.nameEn,
    titleVi: m.titleVi || '', titleEn: m.titleEn || '',
    fieldVi: m.fieldVi || '', fieldEn: m.fieldEn || '', email: m.email || '',
    dutiesText: (m.duties || []).join(', '), sortOrder: m.sortOrder ?? 0,
  };
}

function formToMember(f) {
  return {
    id: f.id, group: f.group, nameVi: f.nameVi.trim(), nameEn: f.nameEn.trim(),
    titleVi: f.titleVi.trim(), titleEn: f.titleEn.trim(),
    fieldVi: f.fieldVi.trim(), fieldEn: f.fieldEn.trim(),
    email: f.email.trim(),
    duties: f.dutiesText.split(',').map((s) => s.trim()).filter(Boolean),
    sortOrder: Number(f.sortOrder) || 0,
  };
}

function InternalMembersTab({ vi }) {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [editing, setEditing] = useState(null); // null | form object
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const reload = () => {
    setLoading(true);
    fetchMembers().then((data) => { setMembers(data); setLoading(false); });
  };
  useEffect(() => { reload(); }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return members;
    return members.filter((m) =>
      [m.nameVi, m.nameEn, m.titleVi, m.titleEn, m.email].some((f) => f && f.toLowerCase().includes(q)));
  }, [members, query]);

  const openNew = () => { setError(''); setEditing({ ...EMPTY_FORM, id: newMemberId(), isNew: true }); };
  const openEdit = (m) => { setError(''); setEditing({ ...memberToForm(m), isNew: false }); };
  const closeForm = () => setEditing(null);

  const submitForm = async (e) => {
    e.preventDefault();
    if (!editing.nameVi.trim() || !editing.nameEn.trim()) {
      setError(vi ? 'Cần nhập tên (VI và EN).' : 'Name (VI and EN) is required.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await saveMember(formToMember(editing));
      closeForm();
      reload();
    } catch (err) {
      setError(err.message || (vi ? 'Lưu thất bại.' : 'Save failed.'));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (m) => {
    const msg = vi
      ? `Xoá thành viên "${m.nameVi}" khỏi danh bạ ISCM?`
      : `Delete "${m.nameEn}" from the ISCM directory?`;
    if (!window.confirm(msg)) return;
    try {
      await deleteMember(m.id);
      reload();
    } catch (err) {
      window.alert(err.message || (vi ? 'Xoá thất bại.' : 'Delete failed.'));
    }
  };

  return (
    <div className="space-y-3">
      <p className="text-xs text-neutral-500 leading-relaxed">
        {vi
          ? 'Thêm, sửa, xoá thành viên hiển thị trong tab "Thông tin thành viên" của Cơ cấu tổ chức. Thay đổi lưu trực tiếp vào cơ sở dữ liệu, mọi người dùng đều thấy.'
          : 'Add, edit, or remove members shown in the "Member Information" tab of the Org Chart. Changes save directly to the database and are visible to everyone.'}
      </p>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="relative max-w-sm flex-1 min-w-[200px]">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={vi ? 'Tìm thành viên...' : 'Search members...'}
            className="w-full rounded-none border border-neutral-300 bg-white py-1.5 pl-8 pr-2.5 text-xs focus:border-neutral-900 focus:outline-none"
          />
        </div>
        <button
          onClick={openNew}
          className="flex items-center gap-1.5 bg-[#990000] hover:bg-neutral-900 text-white font-bold text-[10px] uppercase tracking-wide px-3 py-1.5 transition-colors"
        >
          <Plus className="h-3.5 w-3.5" /> {vi ? 'Thêm thành viên' : 'Add Member'}
        </button>
      </div>

      {loading ? (
        <div className="text-xs text-neutral-400 p-4">{vi ? 'Đang tải...' : 'Loading...'}</div>
      ) : (
        <div className="border border-neutral-200 divide-y divide-neutral-100">
          {filtered.map((m) => (
            <div key={m.id} className="flex flex-col gap-1.5 p-3 sm:flex-row sm:items-center sm:gap-4">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-xs font-bold text-neutral-900">{vi ? m.nameVi : m.nameEn}</span>
                  <span className="shrink-0 border border-neutral-200 bg-neutral-50 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-neutral-500">
                    {MEMBER_GROUPS.find((g) => g.key === m.group)?.[vi ? 'labelVi' : 'labelEn'] || m.group}
                  </span>
                </div>
                <p className="text-[10px] text-neutral-400 mt-0.5 truncate">
                  {(vi ? m.titleVi : m.titleEn) || '—'}{m.email ? ` · ${m.email}` : ''}
                </p>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => openEdit(m)}
                  className="flex items-center justify-center h-7 w-7 border border-neutral-200 text-neutral-500 hover:border-[#990000] hover:text-[#990000] transition-colors"
                  title={vi ? 'Sửa' : 'Edit'}
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(m)}
                  className="flex items-center justify-center h-7 w-7 border border-neutral-200 text-neutral-500 hover:border-[#990000] hover:text-[#990000] transition-colors"
                  title={vi ? 'Xoá' : 'Delete'}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="p-6 text-center text-xs text-neutral-400">
              {vi ? 'Không tìm thấy thành viên nào.' : 'No members found.'}
            </div>
          )}
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={closeForm}>
          <form
            onClick={(e) => e.stopPropagation()}
            onSubmit={submitForm}
            className="w-full max-w-lg max-h-[85vh] overflow-y-auto bg-white border border-neutral-200 shadow-xl"
          >
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-neutral-200 bg-neutral-900">
              <span className="text-xs font-bold uppercase tracking-wide text-white">
                {vi ? 'Thông tin thành viên' : 'Member Information'}
              </span>
              <button type="button" onClick={closeForm} className="text-neutral-400 hover:text-white transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>{vi ? 'Họ tên (VI)' : 'Name (VI)'}</label>
                  <input required className={inputClass} value={editing.nameVi} onChange={(e) => setEditing((p) => ({ ...p, nameVi: e.target.value }))} />
                </div>
                <div>
                  <label className={labelClass}>{vi ? 'Họ tên (EN)' : 'Name (EN)'}</label>
                  <input required className={inputClass} value={editing.nameEn} onChange={(e) => setEditing((p) => ({ ...p, nameEn: e.target.value }))} />
                </div>
                <div>
                  <label className={labelClass}>{vi ? 'Chức danh (VI)' : 'Title (VI)'}</label>
                  <input className={inputClass} value={editing.titleVi} onChange={(e) => setEditing((p) => ({ ...p, titleVi: e.target.value }))} />
                </div>
                <div>
                  <label className={labelClass}>{vi ? 'Chức danh (EN)' : 'Title (EN)'}</label>
                  <input className={inputClass} value={editing.titleEn} onChange={(e) => setEditing((p) => ({ ...p, titleEn: e.target.value }))} />
                </div>
                <div>
                  <label className={labelClass}>{vi ? 'Lĩnh vực (VI)' : 'Field (VI)'}</label>
                  <input className={inputClass} value={editing.fieldVi} onChange={(e) => setEditing((p) => ({ ...p, fieldVi: e.target.value }))} />
                </div>
                <div>
                  <label className={labelClass}>{vi ? 'Lĩnh vực (EN)' : 'Field (EN)'}</label>
                  <input className={inputClass} value={editing.fieldEn} onChange={(e) => setEditing((p) => ({ ...p, fieldEn: e.target.value }))} />
                </div>
                <div>
                  <label className={labelClass}>{vi ? 'Nhóm' : 'Group'}</label>
                  <select className={inputClass} value={editing.group} onChange={(e) => setEditing((p) => ({ ...p, group: e.target.value }))}>
                    {MEMBER_GROUPS.filter((g) => g.key !== 'all').map((g) => (
                      <option key={g.key} value={g.key}>{vi ? g.labelVi : g.labelEn}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Email</label>
                  <input type="email" className={inputClass} value={editing.email} onChange={(e) => setEditing((p) => ({ ...p, email: e.target.value }))} placeholder="you@ueh.edu.vn" />
                </div>
              </div>

              <div>
                <label className={labelClass}>
                  {vi ? 'Chức vụ phụ trách (P.I.C) — cách nhau bởi dấu phẩy' : 'P.I.C duties — comma separated'}
                </label>
                <textarea
                  rows={2}
                  className={inputClass}
                  value={editing.dutiesText}
                  onChange={(e) => setEditing((p) => ({ ...p, dutiesText: e.target.value }))}
                  placeholder="Head · Operation & Finance, BAUD.d · Program"
                />
              </div>

              <div>
                <label className={labelClass}>{vi ? 'Thứ tự hiển thị' : 'Sort order'}</label>
                <input
                  type="number"
                  className={`${inputClass} max-w-[120px]`}
                  value={editing.sortOrder}
                  onChange={(e) => setEditing((p) => ({ ...p, sortOrder: e.target.value }))}
                />
              </div>

              <div>
                <label className={labelClass}>
                  {vi ? 'Vai trò trong sơ đồ tổ chức' : 'Org chart roles'}
                </label>
                {editing.isNew ? (
                  <p className="text-[11px] text-neutral-400 italic p-2 border border-neutral-200">
                    {vi ? 'Lưu thành viên trước, sau đó mở lại để gán vai trò.' : 'Save the member first, then reopen to assign roles.'}
                  </p>
                ) : (
                  <RoleChecklist vi={vi} person={{ id: editing.id, displayName: stripAcademicTitle(editing.nameVi.trim()), isExternal: false }} />
                )}
              </div>

              {error && (
                <p className="text-[11px] font-semibold text-red-700 bg-red-50 border border-red-200 px-2.5 py-1.5">{error}</p>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 px-4 py-3 border-t border-neutral-200 bg-neutral-50">
              <button type="button" onClick={closeForm} className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide text-neutral-500 hover:text-neutral-900 transition-colors">
                {vi ? 'Huỷ' : 'Cancel'}
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-1.5 bg-[#990000] hover:bg-neutral-900 disabled:opacity-60 text-white font-bold text-[10px] uppercase tracking-wide px-3 py-1.5 transition-colors"
              >
                <Save className="h-3.5 w-3.5" />
                {saving ? (vi ? 'Đang lưu...' : 'Saving...') : (vi ? 'Lưu' : 'Save')}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Tab 2 — Members outside ISCM (external_members table)               */
/* ------------------------------------------------------------------ */

function ExternalMembersTab({ vi }) {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ degree: '', full_name: '', affiliation: '' });
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState('');
  const [expanded, setExpanded] = useState(null); // full_name currently showing its role checklist

  const reload = () => {
    setLoading(true);
    fetchExternalMembers().then((m) => { setMembers(m); setLoading(false); });
  };
  useEffect(() => { reload(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    if (!form.full_name.trim()) return;
    setSaving(true);
    setNotice('');
    try {
      const { persisted } = await saveExternalMember(form);
      setNotice(persisted
        ? (vi ? 'Đã lưu.' : 'Saved.')
        : (vi ? 'Đã lưu tạm trong trình duyệt này (chưa đồng bộ).' : 'Saved locally in this browser only (not synced).'));
      setForm({ degree: '', full_name: '', affiliation: '' });
      reload();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-3">
      <p className="text-xs text-neutral-500 leading-relaxed">
        {vi
          ? 'Những người giữ vai trò trong sơ đồ tổ chức nhưng không thuộc danh bạ ISCM (đối tác, cộng tác viên ngoài Viện...). Thêm ở đây, sau đó bấm "Vai trò" trên từng người để gán vào sơ đồ tổ chức.'
          : 'People who hold a role on the org chart but aren\'t in the ISCM roster (external partners, outside collaborators...). Add them here, then click "Roles" on each person to assign them on the org chart.'}
      </p>

      <form onSubmit={submit} className="flex flex-wrap items-end gap-2 border border-neutral-200 bg-neutral-50 p-3">
        <div>
          <label className={labelClass}>{vi ? 'Học hàm/vị' : 'Degree'}</label>
          <input className={`${inputClass} w-28`} value={form.degree} onChange={(e) => setForm((p) => ({ ...p, degree: e.target.value }))} placeholder="PhD, M.A..." />
        </div>
        <div>
          <label className={labelClass}>{vi ? 'Họ tên *' : 'Full name *'}</label>
          <input required className={`${inputClass} w-48`} value={form.full_name} onChange={(e) => setForm((p) => ({ ...p, full_name: e.target.value }))} />
        </div>
        <div>
          <label className={labelClass}>{vi ? 'Đơn vị / Đối tác' : 'Affiliation'}</label>
          <input className={`${inputClass} w-56`} value={form.affiliation} onChange={(e) => setForm((p) => ({ ...p, affiliation: e.target.value }))} placeholder="UEH CoLab, Grab Vietnam..." />
        </div>
        <button type="submit" disabled={saving} className="flex items-center gap-1.5 bg-[#990000] hover:bg-neutral-900 disabled:opacity-60 text-white font-bold text-[10px] uppercase tracking-wide px-3 py-1.5">
          <Plus className="h-3.5 w-3.5" /> {vi ? 'Thêm' : 'Add'}
        </button>
      </form>
      {notice && <p className="text-[11px] font-semibold text-emerald-700">{notice}</p>}

      {loading ? (
        <div className="text-xs text-neutral-400 p-4">{vi ? 'Đang tải...' : 'Loading...'}</div>
      ) : (
        <div className="border border-neutral-200 divide-y divide-neutral-100">
          {members.map((m, i) => {
            const isOpen = expanded === m.full_name;
            return (
              <div key={i}>
                <div className="flex items-center gap-2 p-2.5">
                  <Users className="h-3.5 w-3.5 text-neutral-400 shrink-0" />
                  <span className="text-xs font-semibold text-neutral-800">
                    {[m.degree, m.full_name].filter(Boolean).join(' ')}
                  </span>
                  {m.affiliation && <span className="text-[10px] text-neutral-400">— {m.affiliation}</span>}
                  <button
                    onClick={() => setExpanded(isOpen ? null : m.full_name)}
                    className="ml-auto shrink-0 border border-neutral-200 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-neutral-600 hover:border-[#990000] hover:text-[#990000] transition-colors"
                  >
                    {vi ? 'Vai trò' : 'Roles'}
                  </button>
                </div>
                {isOpen && (
                  <div className="px-2.5 pb-2.5">
                    <RoleChecklist vi={vi} person={{ id: null, displayName: m.full_name, isExternal: true }} />
                  </div>
                )}
              </div>
            );
          })}
          {members.length === 0 && (
            <div className="p-6 text-center text-xs text-neutral-400">{vi ? 'Chưa có ai.' : 'No one yet.'}</div>
          )}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Shell — auth gate + tab switcher                                    */
/* ------------------------------------------------------------------ */

export default function MemberInfoAdminPanel() {
  const { lang } = useLanguage();
  const vi = lang === 'vi';
  const { user: authUser } = useAuth();
  const [authorized, setAuthorized] = useState(null); // null=checking, true/false
  const [tab, setTab] = useState('internal'); // 'internal' | 'external'

  useEffect(() => {
    if (!isLive || !authUser) { setAuthorized(false); return; }
    supabase.rpc('is_top_admin').then(({ data, error: err }) => setAuthorized(!err && Boolean(data)));
  }, [authUser]);

  if (!isLive) {
    return (
      <div className="font-sans text-xs text-neutral-500 p-4 border border-neutral-200 bg-neutral-50">
        {vi ? 'Tính năng này cần kết nối Supabase (chế độ demo không hỗ trợ).' : 'This feature requires a live Supabase connection (not available in demo mode).'}
      </div>
    );
  }
  if (authorized === null) {
    return <div className="font-sans text-xs text-neutral-400 p-4">{vi ? 'Đang kiểm tra quyền...' : 'Checking permissions...'}</div>;
  }
  if (authorized === false) {
    return (
      <div className="font-sans text-xs text-red-700 p-4 border border-red-200 bg-red-50">
        {vi
          ? 'Bạn không có quyền truy cập mục này. Chỉ Admin, Director, hoặc Vice Director mới có thể chỉnh sửa.'
          : 'You do not have access to this page. Only Admin, Director, or Vice Director can edit this.'}
      </div>
    );
  }

  const TABS = [
    { key: 'internal', label: vi ? 'Thành viên ISCM' : 'ISCM Members', icon: UserRound },
    { key: 'external', label: vi ? 'Thành viên ngoài ISCM' : 'Members Outside ISCM', icon: Users },
  ];

  return (
    <div className="space-y-3 font-sans">
      <div className="flex flex-wrap gap-1.5 border-b border-neutral-200 pb-2">
        {TABS.map((t) => (
          <button key={t.key} type="button" onClick={() => setTab(t.key)}
            className={`flex items-center gap-1.5 border px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide transition-colors ${
              tab === t.key ? 'border-neutral-900 bg-neutral-900 text-white' : 'border-neutral-300 text-neutral-600 hover:border-neutral-900'
            }`}>
            <t.icon className="h-3.5 w-3.5" /> {t.label}
          </button>
        ))}
      </div>

      {tab === 'internal' && <InternalMembersTab vi={vi} />}
      {tab === 'external' && <ExternalMembersTab vi={vi} />}
    </div>
  );
}

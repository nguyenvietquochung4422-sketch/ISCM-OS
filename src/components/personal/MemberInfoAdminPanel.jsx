import { useEffect, useState } from 'react';
import { Plus, Trash2, X, Save, Users } from 'lucide-react';
import { MEMBER_GROUPS } from '../../data/iscmMembers.js';
import { fetchMembers, saveMember, deleteMember, newMemberId } from '../../data/iscmMembersStore.js';
import { fetchExternalMembers, saveExternalMember } from '../../data/externalMembersStore.js';

const inputClass = 'w-full rounded-none border border-neutral-200 bg-white px-2.5 py-1.5 text-xs text-neutral-800 focus:border-[#990000] focus:outline-none';
const labelClass = 'block text-[10px] font-bold uppercase tracking-wide text-neutral-400 mb-1';

/* nameVi/nameEn keep storing one combined string (VI: "PGS. TS. Trịnh Tú
   Anh" — hàm (rank) then vị (degree) as prefixes; EN: "Tu Anh Trinh, PhD" —
   rank as prefix, degree as suffix) — nothing downstream (chart, directory,
   role matching) changes. The admin form just splits that string into
   separate hàm/vị/name boxes for editing, then rejoins on save. */
const RANK_VI_RE = /^(GS|PGS)\.\s*/i;
const DEGREE_VI_RE = /^((?:TS|ThS|KTS|CN|KS)\.\s*)+/i;
const RANK_EN_RE = /^(Assoc\.\s*Prof\.|Prof\.)\s*/i;
const DEGREE_EN_RE = /,\s*([^,]+)$/;

function splitNameVi(nameVi) {
  let rest = nameVi || '';
  const rankM = rest.match(RANK_VI_RE);
  const rank = rankM ? rankM[0].trim() : '';
  if (rankM) rest = rest.slice(rankM[0].length);
  const degreeM = rest.match(DEGREE_VI_RE);
  const degree = degreeM ? degreeM[0].trim() : '';
  if (degreeM) rest = rest.slice(degreeM[0].length);
  return { rank, degree, plain: rest.trim() };
}
function splitNameEn(nameEn) {
  let rest = nameEn || '';
  const rankM = rest.match(RANK_EN_RE);
  const rank = rankM ? rankM[0].trim() : '';
  if (rankM) rest = rest.slice(rankM[0].length);
  const degreeM = rest.match(DEGREE_EN_RE);
  const degree = degreeM ? degreeM[1].trim() : '';
  if (degreeM) rest = rest.slice(0, degreeM.index);
  return { rank, degree, plain: rest.trim() };
}
function joinNameVi(rank, degree, plain) {
  return [rank.trim(), degree.trim(), plain.trim()].filter(Boolean).join(' ');
}
function joinNameEn(rank, degree, plain) {
  const base = [rank.trim(), plain.trim()].filter(Boolean).join(' ');
  return degree.trim() ? `${base}, ${degree.trim()}` : base;
}

/* ------------------------------------------------------------------ */
/* Tab 1 — ISCM members (internal roster, iscm_members table)          */
/* ------------------------------------------------------------------ */

const EMPTY_FORM = {
  id: '', group: 'staff',
  rankVi: '', degreeVi: '', nameVi: '', rankEn: '', degreeEn: '', nameEn: '',
  titleVi: '', titleEn: '', fieldVi: '', fieldEn: '', email: '', dutiesText: '', sortOrder: 0,
};

function memberToForm(m) {
  const vi = splitNameVi(m.nameVi);
  const en = splitNameEn(m.nameEn);
  return {
    id: m.id, group: m.group,
    rankVi: vi.rank, degreeVi: vi.degree, nameVi: vi.plain,
    rankEn: en.rank, degreeEn: en.degree, nameEn: en.plain,
    titleVi: m.titleVi || '', titleEn: m.titleEn || '',
    fieldVi: m.fieldVi || '', fieldEn: m.fieldEn || '', email: m.email || '',
    dutiesText: (m.duties || []).join(', '), sortOrder: m.sortOrder ?? 0,
  };
}

function formToMember(f) {
  return {
    id: f.id, group: f.group,
    nameVi: joinNameVi(f.rankVi, f.degreeVi, f.nameVi), nameEn: joinNameEn(f.rankEn, f.degreeEn, f.nameEn),
    titleVi: f.titleVi.trim(), titleEn: f.titleEn.trim(),
    fieldVi: f.fieldVi.trim(), fieldEn: f.fieldEn.trim(),
    email: f.email.trim(),
    duties: f.dutiesText.split(',').map((s) => s.trim()).filter(Boolean),
    sortOrder: Number(f.sortOrder) || 0,
  };
}

/** Standalone edit/add modal for one ISCM member — `member` is the existing
    record to edit, or null/undefined to add a new one. Used directly from
    the directory grid (click a card → this opens), no separate list view. */
export function MemberEditForm({ vi, member, onClose, onSaved }) {
  const isNew = !member;
  const [form, setForm] = useState(() =>
    member ? memberToForm(member) : { ...EMPTY_FORM, id: newMemberId() });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const submitForm = async (e) => {
    e.preventDefault();
    if (!form.nameVi.trim() || !form.nameEn.trim()) {
      setError(vi ? 'Cần nhập tên (VI và EN).' : 'Name (VI and EN) is required.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await saveMember(formToMember(form));
      onSaved();
    } catch (err) {
      setError(err.message || (vi ? 'Lưu thất bại.' : 'Save failed.'));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    const msg = vi
      ? `Xoá thành viên "${member.nameVi}" khỏi danh bạ ISCM?`
      : `Delete "${member.nameEn}" from the ISCM directory?`;
    if (!window.confirm(msg)) return;
    try {
      await deleteMember(member.id);
      onSaved();
    } catch (err) {
      window.alert(err.message || (vi ? 'Xoá thất bại.' : 'Delete failed.'));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <form
        onClick={(e) => e.stopPropagation()}
        onSubmit={submitForm}
        className="w-full max-w-lg max-h-[85vh] overflow-y-auto bg-white border border-neutral-200 shadow-xl"
      >
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-neutral-200 bg-neutral-900">
          <span className="text-xs font-bold uppercase tracking-wide text-white">
            {isNew ? (vi ? 'Thêm thành viên' : 'Add Member') : (vi ? 'Thông tin thành viên' : 'Member Information')}
          </span>
          <button type="button" onClick={onClose} className="text-neutral-400 hover:text-white transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>{vi ? 'Học hàm (VI)' : 'Academic rank (VI)'}</label>
              <input className={inputClass} value={form.rankVi} onChange={(e) => setForm((p) => ({ ...p, rankVi: e.target.value }))} placeholder="GS. / PGS." />
            </div>
            <div>
              <label className={labelClass}>{vi ? 'Học hàm (EN)' : 'Academic rank (EN)'}</label>
              <input className={inputClass} value={form.rankEn} onChange={(e) => setForm((p) => ({ ...p, rankEn: e.target.value }))} placeholder="Prof. / Assoc.Prof." />
            </div>
            <div>
              <label className={labelClass}>{vi ? 'Học vị (VI)' : 'Degree (VI)'}</label>
              <input className={inputClass} value={form.degreeVi} onChange={(e) => setForm((p) => ({ ...p, degreeVi: e.target.value }))} placeholder="TS. / ThS. KTS. ..." />
            </div>
            <div>
              <label className={labelClass}>{vi ? 'Học vị (EN)' : 'Degree (EN)'}</label>
              <input className={inputClass} value={form.degreeEn} onChange={(e) => setForm((p) => ({ ...p, degreeEn: e.target.value }))} placeholder="PhD / M.Arch / M.Sc ..." />
            </div>
            <div>
              <label className={labelClass}>{vi ? 'Họ tên (VI)' : 'Name (VI)'}</label>
              <input required className={inputClass} value={form.nameVi} onChange={(e) => setForm((p) => ({ ...p, nameVi: e.target.value }))} />
            </div>
            <div>
              <label className={labelClass}>{vi ? 'Họ tên (EN)' : 'Name (EN)'}</label>
              <input required className={inputClass} value={form.nameEn} onChange={(e) => setForm((p) => ({ ...p, nameEn: e.target.value }))} />
            </div>
            <div>
              <label className={labelClass}>{vi ? 'Chức danh (VI)' : 'Title (VI)'}</label>
              <input className={inputClass} value={form.titleVi} onChange={(e) => setForm((p) => ({ ...p, titleVi: e.target.value }))} />
            </div>
            <div>
              <label className={labelClass}>{vi ? 'Chức danh (EN)' : 'Title (EN)'}</label>
              <input className={inputClass} value={form.titleEn} onChange={(e) => setForm((p) => ({ ...p, titleEn: e.target.value }))} />
            </div>
            <div>
              <label className={labelClass}>{vi ? 'Lĩnh vực (VI)' : 'Field (VI)'}</label>
              <input className={inputClass} value={form.fieldVi} onChange={(e) => setForm((p) => ({ ...p, fieldVi: e.target.value }))} />
            </div>
            <div>
              <label className={labelClass}>{vi ? 'Lĩnh vực (EN)' : 'Field (EN)'}</label>
              <input className={inputClass} value={form.fieldEn} onChange={(e) => setForm((p) => ({ ...p, fieldEn: e.target.value }))} />
            </div>
            <div>
              <label className={labelClass}>{vi ? 'Nhóm' : 'Group'}</label>
              <select className={inputClass} value={form.group} onChange={(e) => setForm((p) => ({ ...p, group: e.target.value }))}>
                {MEMBER_GROUPS.filter((g) => g.key !== 'all').map((g) => (
                  <option key={g.key} value={g.key}>{vi ? g.labelVi : g.labelEn}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Email</label>
              <input type="email" className={inputClass} value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} placeholder="you@ueh.edu.vn" />
            </div>
          </div>

          <div>
            <label className={labelClass}>
              {vi ? 'Chức vụ phụ trách (P.I.C) — cách nhau bởi dấu phẩy' : 'P.I.C duties — comma separated'}
            </label>
            <textarea
              rows={2}
              className={inputClass}
              value={form.dutiesText}
              onChange={(e) => setForm((p) => ({ ...p, dutiesText: e.target.value }))}
              placeholder="Head - Operation & Finance, BAUD.d - Program"
            />
          </div>

          <div>
            <label className={labelClass}>{vi ? 'Thứ tự hiển thị' : 'Sort order'}</label>
            <input
              type="number"
              className={`${inputClass} max-w-[120px]`}
              value={form.sortOrder}
              onChange={(e) => setForm((p) => ({ ...p, sortOrder: e.target.value }))}
            />
          </div>

          {error && (
            <p className="text-[11px] font-semibold text-red-700 bg-red-50 border border-red-200 px-2.5 py-1.5">{error}</p>
          )}
        </div>

        <div className="flex items-center justify-between gap-2 px-4 py-3 border-t border-neutral-200 bg-neutral-50">
          {!isNew ? (
            <button
              type="button" onClick={handleDelete}
              className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-red-700 hover:text-red-900 transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5" /> {vi ? 'Xoá thành viên' : 'Delete member'}
            </button>
          ) : <span />}
          <div className="flex items-center gap-2">
            <button type="button" onClick={onClose} className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide text-neutral-500 hover:text-neutral-900 transition-colors">
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
        </div>
      </form>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Tab 2 — Members outside ISCM (external_members table)               */
/* ------------------------------------------------------------------ */

export function ExternalMembersTab({ vi }) {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ degree: '', full_name: '', affiliation: '' });
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState('');

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
          ? 'Những người giữ vai trò trong sơ đồ tổ chức nhưng không thuộc danh bạ ISCM (đối tác, cộng tác viên ngoài Viện...). Thêm ở đây, sau đó gán họ vào một vai trò trực tiếp trên Flowchart/Matrix.'
          : 'People who hold a role on the org chart but aren\'t in the ISCM roster (external partners, outside collaborators...). Add them here, then assign them to a role directly on the Flowchart/Matrix.'}
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
          {members.map((m, i) => (
            <div key={i} className="flex items-center gap-2 p-2.5">
              <Users className="h-3.5 w-3.5 text-neutral-400 shrink-0" />
              <span className="text-xs font-semibold text-neutral-800">
                {[m.degree, m.full_name].filter(Boolean).join(' ')}
              </span>
              {m.affiliation && <span className="text-[10px] text-neutral-400">— {m.affiliation}</span>}
            </div>
          ))}
          {members.length === 0 && (
            <div className="p-6 text-center text-xs text-neutral-400">{vi ? 'Chưa có ai.' : 'No one yet.'}</div>
          )}
        </div>
      )}
    </div>
  );
}


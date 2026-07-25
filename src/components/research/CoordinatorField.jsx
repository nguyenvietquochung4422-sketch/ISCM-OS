import { useState } from 'react';
import { UserPlus } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext.jsx';
import { formatExternalMember } from '../../data/externalMembersStore.js';

/**
 * Person-picker for a "who" metadata field (Coordinator/Manager, Ordered By):
 * the ISCM roster plus anyone in the kho nhân sự công tác (external_members)
 * — the same directory the Outside Members field files people into — with
 * an inline "add new" form so someone who isn't ISCM staff doesn't need to
 * be added as a Member first.
 */
export default function CoordinatorField({
  label = 'Coordinator / Manager', placeholder = 'Select Coordinator...',
  value, onChange, rosterOptions, offRosterValue, externalRoster = [], onSavePerson,
}) {
  const { lang } = useLanguage();
  const vi = lang === 'vi';

  const [adding, setAdding] = useState(false);
  const [degree, setDegree] = useState('');
  const [name, setName] = useState('');
  const [affiliation, setAffiliation] = useState('');

  const canAdd = name.trim() && affiliation.trim() && degree.trim();

  const field = 'w-full border border-neutral-200 bg-white px-2.5 py-1.5 text-xs text-neutral-700 focus:border-[#8b0000] focus:outline-none rounded-none';
  const smallLabel = 'mb-0.5 block text-[9px] font-bold uppercase tracking-wider text-neutral-400';

  const addTyped = () => {
    if (!canAdd) return;
    const person = { degree: degree.trim(), full_name: name.trim(), affiliation: affiliation.trim() };
    onChange(formatExternalMember(person));
    onSavePerson?.(person);
    setDegree('');
    setName('');
    setAffiliation('');
    setAdding(false);
  };

  return (
    <div>
      <label className="text-[10px] font-bold text-neutral-400 uppercase">{label}</label>
      <select
        value={adding ? '' : value}
        onChange={(e) => {
          if (e.target.value === '__add_outside__') { setAdding(true); return; }
          setAdding(false);
          onChange(e.target.value);
        }}
        className={`${field} mt-1`}
      >
        <option value="">{placeholder}</option>
        {/* Plenty of coordinators are external collaborators who aren't on
            the ISCM roster ("Mr. Steven", "Tony", …). Without an option
            carrying their name the select rendered blank and simply opening
            the drawer and saving wiped the field, so keep the stored value. */}
        {offRosterValue && (
          <option value={offRosterValue}>
            {offRosterValue} {vi ? '(ngoài danh sách)' : '(not on roster)'}
          </option>
        )}
        <optgroup label={vi ? 'Nhân sự ISCM' : 'ISCM Roster'}>
          {rosterOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </optgroup>
        {externalRoster.length > 0 && (
          <optgroup label={vi ? 'Ngoài ISCM' : 'Outside ISCM'}>
            {externalRoster.map((p, i) => {
              const formatted = formatExternalMember(p);
              return (
                <option key={`${formatted}-${i}`} value={formatted}>{formatted}</option>
              );
            })}
          </optgroup>
        )}
        <option value="__add_outside__" className="text-[#8b0000] font-bold">
          + {vi ? 'Thêm người ngoài ISCM...' : 'Add outside person...'}
        </option>
      </select>

      {adding && (
        <div className="mt-1.5 border border-neutral-200 bg-neutral-50/50 p-2 grid grid-cols-[70px_1fr_1fr_auto] gap-1.5 items-end">
          <div>
            <label className={smallLabel}>{vi ? 'Học vị' : 'Degree'}</label>
            <input
              type="text"
              value={degree}
              onChange={(e) => setDegree(e.target.value)}
              placeholder={vi ? 'PGS. TS.' : 'Prof. Dr.'}
              className="w-full border border-neutral-200 bg-white px-2 py-1 text-xs focus:border-[#8b0000] focus:outline-none"
            />
          </div>
          <div>
            <label className={smallLabel}>{vi ? 'Họ tên' : 'Full name'}</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={vi ? 'Nguyễn Văn A' : 'Full name'}
              className="w-full border border-neutral-200 bg-white px-2 py-1 text-xs focus:border-[#8b0000] focus:outline-none"
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTyped(); } }}
            />
          </div>
          <div>
            <label className={smallLabel}>{vi ? 'Nơi công tác' : 'Affiliation'}</label>
            <input
              type="text"
              value={affiliation}
              onChange={(e) => setAffiliation(e.target.value)}
              placeholder={vi ? 'Trường ĐH ...' : 'Organisation'}
              className="w-full border border-neutral-200 bg-white px-2 py-1 text-xs focus:border-[#8b0000] focus:outline-none"
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTyped(); } }}
            />
          </div>
          <button
            type="button"
            onClick={addTyped}
            disabled={!canAdd}
            title={canAdd ? undefined : (vi ? 'Điền đủ học vị, họ tên và nơi công tác' : 'Fill in degree, full name and affiliation')}
            className="inline-flex items-center gap-1 bg-neutral-900 hover:bg-[#8b0000] disabled:bg-neutral-200 disabled:cursor-not-allowed text-white px-3 py-1 text-[10px] font-bold uppercase shrink-0 transition-colors"
          >
            <UserPlus className="h-3 w-3" />
            {vi ? 'Thêm' : 'Add'}
          </button>
        </div>
      )}
    </div>
  );
}

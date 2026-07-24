import { useState } from 'react';
import { X, UserPlus } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext.jsx';
import { formatExternalMember } from '../../data/externalMembersStore.js';

/**
 * Members who aren't on the ISCM roster.
 *
 * A name on its own doesn't identify anyone a year later, so all three parts —
 * học vị, họ tên, nơi công tác — are required before ADD. The person is filed
 * in the kho nhân sự công tác at the same time, which is what the dropdown on
 * the left offers so nobody has to be typed twice.
 */
export default function OutsideMembersField({ value, onChange, roster = [], onSavePerson }) {
  const { lang } = useLanguage();
  const vi = lang === 'vi';

  const [degree, setDegree] = useState('');
  const [name, setName] = useState('');
  const [affiliation, setAffiliation] = useState('');
  const [picked, setPicked] = useState('');

  const canAdd = name.trim() && affiliation.trim() && degree.trim();

  const addTag = (tag) => {
    if (!tag) return;
    if (value.some((m) => m.toLowerCase() === tag.toLowerCase())) return;
    onChange([...value, tag]);
  };

  const addTyped = () => {
    if (!canAdd) return;
    const person = { degree: degree.trim(), full_name: name.trim(), affiliation: affiliation.trim() };
    addTag(formatExternalMember(person));
    onSavePerson?.(person);
    setDegree('');
    setName('');
    setAffiliation('');
  };

  const addFromRoster = (index) => {
    setPicked('');
    const person = roster[Number(index)];
    if (person) addTag(formatExternalMember(person));
  };

  const field = 'border border-neutral-200 bg-white px-2 py-1 text-xs focus:border-[#8b0000] focus:outline-none';
  const label = 'mb-0.5 block text-[9px] font-bold uppercase tracking-wider text-neutral-400';

  return (
    <div className="font-ibm mt-1 border border-neutral-200 bg-white p-2 flex flex-col gap-2">
      <div className="flex flex-wrap gap-1 items-center min-h-[24px]">
        {value.length === 0 && (
          <span className="text-neutral-400 text-xs italic">
            {vi ? 'Chưa có nhân sự ngoài ISCM.' : 'No outside members.'}
          </span>
        )}
        {value.map((m) => (
          <span key={m} className="inline-flex items-center gap-1 bg-neutral-100 border border-neutral-200 text-neutral-700 px-2 py-0.5 text-[10px] font-bold">
            {m}
            <button
              type="button"
              onClick={() => onChange(value.filter((x) => x !== m))}
              className="hover:text-black shrink-0"
            >
              <X className="h-2.5 w-2.5" />
            </button>
          </span>
        ))}
      </div>

      {/* Pick someone already in the kho nhân sự công tác */}
      {roster.length > 0 && (
        <select
          value={picked}
          onChange={(e) => addFromRoster(e.target.value)}
          className={`${field} w-full text-neutral-600`}
        >
          <option value="">
            {vi ? 'Chọn từ kho nhân sự công tác…' : 'Pick from the collaborator directory…'}
          </option>
          {roster.map((p, i) => (
            <option key={`${p.full_name}-${p.affiliation}-${i}`} value={i}>
              {formatExternalMember(p)}
            </option>
          ))}
        </select>
      )}

      {/* …or enter a new one — all three parts required */}
      <div className="border-t border-neutral-100 pt-2 mt-1 grid grid-cols-[90px_1fr_1fr_auto] gap-1.5 items-end">
        <div>
          <label className={label}>{vi ? 'Học vị' : 'Degree'}</label>
          <input
            type="text"
            value={degree}
            onChange={(e) => setDegree(e.target.value)}
            placeholder={vi ? 'PGS. TS.' : 'Prof. Dr.'}
            className={`${field} w-full`}
          />
        </div>
        <div>
          <label className={label}>{vi ? 'Họ tên' : 'Full name'}</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={vi ? 'Nguyễn Văn A' : 'Full name'}
            className={`${field} w-full`}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTyped(); } }}
          />
        </div>
        <div>
          <label className={label}>{vi ? 'Nơi công tác' : 'Affiliation'}</label>
          <input
            type="text"
            value={affiliation}
            onChange={(e) => setAffiliation(e.target.value)}
            placeholder={vi ? 'Trường ĐH ...' : 'Organisation'}
            className={`${field} w-full`}
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
      <p className="text-[10px] text-neutral-400">
        {vi
          ? 'Điền đủ học vị, họ tên và nơi công tác. Người được thêm sẽ được lưu vào kho nhân sự công tác.'
          : 'All three fields are required. The person is also filed in the collaborator directory.'}
      </p>
    </div>
  );
}

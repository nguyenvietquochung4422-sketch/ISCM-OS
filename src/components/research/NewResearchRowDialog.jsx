import { useEffect, useMemo, useState } from 'react';
import { X, FolderPlus, Folder, FileText } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext.jsx';
import { compareCodes, suggestAbbreviation } from '../../data/researchCodes.js';

export const NEW = '__new__';
export const NO_SUB = '0';

/**
 * Smallest unused number among a parent's direct children.
 *
 * Deleting a task never renumbers the ones after it — a code has to keep
 * pointing at the same task forever, because it's what reports, folders and
 * links refer to. The number it freed is simply left open, and the next task
 * created under that parent takes it. With no gaps this is just max + 1.
 */
export function nextTaskNumber(rows, parentCode) {
  if (!parentCode) return 1;
  const used = new Set();
  rows.forEach((r) => {
    const code = (r.code || '').trim();
    if (!code.startsWith(parentCode)) return;
    const m = /^\.?(\d+)$/.exec(code.slice(parentCode.length)); // "RU1.CE.3" + legacy "RU1.CE3"
    if (m) used.add(Number(m[1]));
  });
  let n = 1;
  while (used.has(n)) n += 1;
  return n;
}

/** Main Research Unit rows — the ones coded RU1, RU2, … */
function listUnits(rows) {
  return rows
    .filter((r) => /^RU\s*\d+$/.test((r.code || '').trim()))
    .map((r) => ({ code: (r.code || '').trim().replace(/\s+/g, ''), unit: r.research_unit || '' }))
    .sort((a, b) => compareCodes(a.code, b.code));
}

/** Sub Research Unit rows under a main unit — RU1.CE, RU1.SML, … */
function listSubUnits(rows, unitCode) {
  if (!unitCode) return [];
  const re = new RegExp(`^${unitCode}\\.([A-Za-z]+)$`);
  return rows
    .map((r) => ({ m: re.exec((r.code || '').trim()), name: r.task_name || '' }))
    .filter((x) => x.m)
    .map((x) => ({ abbr: x.m[1], name: x.name }))
    .sort((a, b) => a.abbr.localeCompare(b.abbr));
}

function nextUnitCode(rows) {
  let max = 0;
  rows.forEach((r) => {
    const m = /^RU\s*(\d+)$/.exec((r.code || '').trim());
    if (m) max = Math.max(max, Number(m[1]));
  });
  return `RU${max + 1}`;
}

/**
 * One dialog for all three levels of the WBS. The CODE is entered as its
 * three parts — Unit . Sub-unit . Task — and the deepest part you fill in is
 * the row that gets created:
 *
 *   RU (new)                     -> a new Research Unit (main folder)
 *   RU1 . SML (new)              -> a new sub Research Unit
 *   RU1 . SML . 4                -> a task inside that sub-unit
 *   RU1 .  0  . 4                -> a task directly under the main unit
 *
 * The row is handed over as a draft — nothing is written until Save.
 */
export default function NewResearchRowDialog({ open, onClose, rows, onCreate, prefill }) {
  const { lang } = useLanguage();
  const vi = lang === 'vi';

  const [unitSel, setUnitSel] = useState('');
  const [unitName, setUnitName] = useState('');
  const [subSel, setSubSel] = useState(NO_SUB);
  const [subName, setSubName] = useState('');
  const [subAbbr, setSubAbbr] = useState('');
  const [taskNum, setTaskNum] = useState('');
  const [name, setName] = useState('');

  const units = useMemo(() => listUnits(rows), [rows]);
  const subUnits = useMemo(
    () => (unitSel && unitSel !== NEW ? listSubUnits(rows, unitSel) : []),
    [rows, unitSel]
  );

  // Reset to the prefill (the "+" on a sub-unit row) each time it opens.
  useEffect(() => {
    if (!open) return;
    setUnitSel(prefill?.unitCode || units[0]?.code || NEW);
    setSubSel(prefill?.subAbbr || NO_SUB);
    setUnitName('');
    setSubName('');
    setSubAbbr('');
    setName('');
  }, [open]);

  const creating = unitSel === NEW ? 'unit' : subSel === NEW ? 'sub' : 'task';

  // What the task number counts under. With no sub-unit the 0 keeps the
  // sub-unit's place in the code, so the task is RU1.0.4 — the row still
  // nests under RU1 itself (see parentCodeOf).
  const parentCode = unitSel && unitSel !== NEW
    ? `${unitSel}.${subSel === NEW ? '' : subSel}`
    : '';

  // Once Unit (and Sub-unit) are chosen, the task number proposes itself.
  useEffect(() => {
    if (creating !== 'task') return;
    setTaskNum(String(nextTaskNumber(rows, parentCode)));
  }, [parentCode, creating, rows]);

  if (!open) return null;

  const cleanAbbr = subAbbr.trim().toUpperCase().replace(/[^A-Z]/g, '');
  const previewCode =
    creating === 'unit' ? nextUnitCode(rows)
      : creating === 'sub' ? `${unitSel}.${cleanAbbr || '…'}`
        : `${parentCode}.${taskNum || '…'}`;

  const codeTaken = (code) => rows.some((r) => (r.code || '').trim() === code);

  const submit = () => {
    const unitRow = units.find((u) => u.code === unitSel);

    if (creating === 'unit') {
      const trimmed = unitName.trim();
      if (!trimmed) return alert(vi ? 'Nhập tên Đơn vị nghiên cứu.' : 'Enter the Research Unit name.');
      onCreate({
        kind: 'unit',
        code: previewCode,
        task_name: `${trimmed} Main Folder`,
        research_unit: trimmed,
      });
      return onClose();
    }

    if (creating === 'sub') {
      const trimmed = subName.trim();
      if (!trimmed) return alert(vi ? 'Nhập tên nhóm nghiên cứu con.' : 'Enter the sub Research Unit name.');
      if (!cleanAbbr) return alert(vi ? 'Mã viết tắt chỉ gồm chữ cái, ví dụ SML.' : 'The abbreviation must be letters only, e.g. SML.');
      if (codeTaken(previewCode)) return alert(vi ? `Mã "${previewCode}" đã tồn tại.` : `Code "${previewCode}" already exists.`);
      onCreate({
        kind: 'sub',
        code: previewCode,
        task_name: trimmed,
        research_unit: unitRow?.unit || '',
      });
      return onClose();
    }

    const n = parseInt(taskNum, 10);
    if (!n || n < 1) return alert(vi ? 'Nhập số thứ tự tác vụ (1, 2, 3, …).' : 'Enter the task number (1, 2, 3, …).');
    if (codeTaken(previewCode)) return alert(vi ? `Mã "${previewCode}" đã tồn tại.` : `Code "${previewCode}" already exists.`);
    onCreate({
      kind: 'task',
      code: previewCode,
      task_name: name.trim(),
      research_unit: unitRow?.unit || '',
    });
    onClose();
  };

  const boxLabel = 'mb-1 block text-[9px] font-bold uppercase tracking-wider text-neutral-400 font-barlow';
  const boxInput = 'w-full border border-neutral-200 bg-white px-2 py-1.5 text-xs text-neutral-800 focus:border-[#8b0000] focus:outline-none rounded-none';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div
        className="w-full max-w-xl border border-neutral-200 bg-white shadow-xl font-ibm"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-neutral-200 px-5 py-3">
          <h3 className="font-barlow text-sm font-bold uppercase tracking-wide text-neutral-900">
            {vi ? 'Tạo mới' : 'New row'}
          </h3>
          <button type="button" onClick={onClose} className="text-neutral-400 hover:text-[#8b0000]">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-4 px-5 py-4">
          <p className="text-[11px] leading-relaxed text-neutral-500">
            {vi
              ? 'Mã CODE gồm 3 ô: Đơn vị . Nhóm con . Tác vụ. Ô sâu nhất bạn điền chính là hàng được tạo. Không có nhóm con thì chọn 0.'
              : 'The CODE has three parts: Unit . Sub-unit . Task. The deepest part you fill in is the row that gets created. Pick 0 when there is no sub-unit.'}
          </p>

          {/* The three code boxes */}
          <div className="grid grid-cols-[1fr_auto_1fr_auto_90px] items-end gap-2">
            <div>
              <label className={boxLabel}>{vi ? 'Mã Đơn vị' : 'Unit code'}</label>
              <select value={unitSel} onChange={(e) => setUnitSel(e.target.value)} className={boxInput}>
                {units.map((u) => (
                  <option key={u.code} value={u.code}>{u.code} — {u.unit}</option>
                ))}
                <option value={NEW}>{vi ? '＋ Đơn vị mới' : '＋ New unit'}</option>
              </select>
            </div>
            <span className="pb-2 font-mono text-sm text-neutral-400">.</span>
            <div>
              <label className={boxLabel}>{vi ? 'Mã Nhóm con' : 'Sub-unit code'}</label>
              <select
                value={subSel}
                onChange={(e) => setSubSel(e.target.value)}
                disabled={unitSel === NEW}
                className={`${boxInput} disabled:bg-neutral-50 disabled:text-neutral-300`}
              >
                <option value={NO_SUB}>0 — {vi ? 'không có' : 'none'}</option>
                {subUnits.map((s) => (
                  <option key={s.abbr} value={s.abbr}>{s.abbr} — {s.name}</option>
                ))}
                <option value={NEW}>{vi ? '＋ Nhóm con mới' : '＋ New sub-unit'}</option>
              </select>
            </div>
            <span className="pb-2 font-mono text-sm text-neutral-400">.</span>
            <div>
              <label className={boxLabel}>{vi ? 'Số tác vụ' : 'Task no.'}</label>
              <input
                type="number"
                min="0"
                value={creating === 'task' ? taskNum : ''}
                onChange={(e) => setTaskNum(e.target.value)}
                disabled={creating !== 'task'}
                placeholder="0"
                className={`${boxInput} disabled:bg-neutral-50 disabled:placeholder:text-neutral-300`}
              />
            </div>
          </div>

          {/* Whatever the three boxes describe, spelled out */}
          <div className="flex items-center gap-2 border border-neutral-200 bg-neutral-50 px-3 py-2">
            {creating === 'unit' ? <FolderPlus className="h-3.5 w-3.5 shrink-0 text-[#8b0000]" />
              : creating === 'sub' ? <Folder className="h-3.5 w-3.5 shrink-0 text-neutral-400" />
                : <FileText className="h-3.5 w-3.5 shrink-0 text-neutral-400" />}
            <span className="font-mono text-xs font-bold text-neutral-800">{previewCode}</span>
            <span className="text-[11px] text-neutral-500">
              {creating === 'unit' ? (vi ? 'Đơn vị nghiên cứu mới' : 'new Research Unit')
                : creating === 'sub' ? (vi ? 'Nhóm nghiên cứu con mới' : 'new sub Research Unit')
                  : (vi ? 'Tác vụ mới' : 'new task')}
            </span>
          </div>

          {/* Name fields for the level being created */}
          {creating === 'unit' && (
            <div>
              <label className={boxLabel}>{vi ? 'Tên Đơn vị nghiên cứu' : 'Research Unit name'}</label>
              <input value={unitName} onChange={(e) => setUnitName(e.target.value)} className={boxInput} autoFocus />
            </div>
          )}

          {creating === 'sub' && (
            <div className="grid grid-cols-[1fr_120px] gap-2">
              <div>
                <label className={boxLabel}>{vi ? 'Tên nhóm con' : 'Sub-unit name'}</label>
                <input
                  value={subName}
                  onChange={(e) => {
                    setSubName(e.target.value);
                    if (!subAbbr) setSubAbbr(suggestAbbreviation(e.target.value));
                  }}
                  className={boxInput}
                  autoFocus
                />
              </div>
              <div>
                <label className={boxLabel}>{vi ? 'Viết tắt' : 'Abbreviation'}</label>
                <input
                  value={subAbbr}
                  onChange={(e) => setSubAbbr(e.target.value)}
                  placeholder="SML"
                  className={`${boxInput} font-mono uppercase`}
                />
              </div>
            </div>
          )}

          {creating === 'task' && (
            <div>
              <label className={boxLabel}>
                {vi ? 'Tên tác vụ (có thể để trống, điền sau)' : 'Task name (optional, can be filled in later)'}
              </label>
              <input value={name} onChange={(e) => setName(e.target.value)} className={boxInput} autoFocus />
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 border-t border-neutral-200 px-5 py-3">
          <button
            type="button"
            onClick={onClose}
            className="border border-neutral-200 bg-white px-3 py-1.5 text-xs font-semibold text-neutral-600 hover:border-neutral-400 rounded-none"
          >
            {vi ? 'Huỷ' : 'Cancel'}
          </button>
          <button
            type="button"
            onClick={submit}
            className="bg-[#8b0000] px-4 py-1.5 text-xs font-semibold text-white hover:bg-[#6d0000] rounded-none"
          >
            {vi ? 'Tạo' : 'Create'}
          </button>
        </div>
      </div>
    </div>
  );
}

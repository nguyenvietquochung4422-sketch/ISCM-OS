/**
 * Research List code convention.
 *
 *   RU1              main Research Unit          (MOVE System)
 *   RU1.SML          sub Research Unit           (Smart Mobility Lab)
 *   RU1.SML1         task inside that sub-unit   (…_UEH DRT Bus)
 *   RU1.2            task sitting directly under the main unit
 *   RU1.2.1          sub-task of that task
 *
 * A sub-unit segment is letters; its tasks are that same segment with a
 * running number appended (no extra dot) — which is why the parent of
 * "RU1.SML1" is "RU1.SML" and not "RU1".
 */

/** Splits a code's last dot-segment into its letter and number parts. */
const SEGMENT = /^([A-Za-z]+)(\d+)$/;

/** The code of the row this one nests under, or null for a top-level unit. */
export function parentCodeOf(code) {
  const clean = String(code || '').trim();
  if (!clean) return null;

  const segments = clean.split('.');
  const last = segments[segments.length - 1];

  // "SML1" -> parent is the "SML" sub-unit; "SML" -> parent is everything above.
  const match = SEGMENT.exec(last);
  if (match && segments.length > 1) {
    return [...segments.slice(0, -1), match[1]].join('.');
  }

  if (segments.length <= 1) return null;
  return segments.slice(0, -1).join('.');
}

/** Indentation depth: RU1 = 0, RU1.SML = 1, RU1.SML1 = 2. */
export function codeDepth(code) {
  let depth = 0;
  let current = String(code || '').trim();
  while (depth < 20) {
    const parent = parentCodeOf(current);
    if (!parent) return depth;
    depth += 1;
    current = parent;
  }
  return depth;
}

/** True for a sub-unit code like "RU1.SML" (letters, no trailing number). */
export function isSubUnitCode(code) {
  const clean = String(code || '').trim();
  return /\.[A-Za-z]+$/.test(clean);
}

/** True for a main unit code like "RU1" / "RU 10". */
export function isMainUnitCode(code) {
  return /^RU\s*\d+$/.test(String(code || '').trim());
}

/**
 * Sortable parts — letters and digits are separated so SML2 sorts before
 * SML10 (plain string comparison would put "sml10" first).
 */
export function parseCodeParts(codeStr) {
  if (!codeStr) return [];
  const clean = String(codeStr).replace(/^RU/i, '').trim();
  const parts = [];
  clean.split('.').forEach((raw) => {
    const seg = raw.trim();
    const match = /^([A-Za-z]*)(\d*)$/.exec(seg);
    if (!match) { parts.push(seg.toLowerCase()); return; }
    if (match[1]) parts.push(match[1].toLowerCase());
    if (match[2]) parts.push(parseInt(match[2], 10));
  });
  return parts;
}

export function compareCodes(codeA, codeB) {
  if (!codeA && !codeB) return 0;
  if (!codeA) return 1;
  if (!codeB) return -1;

  const a = parseCodeParts(codeA);
  const b = parseCodeParts(codeB);

  for (let i = 0; i < Math.max(a.length, b.length); i += 1) {
    if (a[i] === undefined) return -1;
    if (b[i] === undefined) return 1;
    if (typeof a[i] === 'number' && typeof b[i] === 'number') {
      if (a[i] !== b[i]) return a[i] - b[i];
    } else {
      const sa = String(a[i]);
      const sb = String(b[i]);
      if (sa !== sb) return sa.localeCompare(sb);
    }
  }
  return 0;
}

/**
 * Suggested abbreviation for a sub-unit name: existing acronyms are kept
 * whole, ordinary words contribute their initial —
 *   "Smart Mobility Lab" -> SML, "SEE Living Lab" -> SEELL.
 * Only a starting point; the caller lets the user edit it (there's no rule
 * that turns "CE-Rail@UEH" into "CE" on its own).
 */
export function suggestAbbreviation(name) {
  const words = String(name || '').split(/[^A-Za-z0-9]+/).filter(Boolean);
  return words
    .map((w) => (w.length > 1 && w === w.toUpperCase() ? w : w[0].toUpperCase()))
    .join('')
    .slice(0, 8);
}

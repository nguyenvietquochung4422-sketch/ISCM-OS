/**
 * Single source of truth for turning the short, informal names stored in the
 * research data ("Mr. Hoài", "Ms. Chi") into real ISCM roster members.
 *
 * This logic used to be copy-pasted across ResearchWorkload, ResearchSubWorkspace
 * and ResearchListTable, and each copy had the same two defects:
 *
 *  1. The title-stripping regex was anchored with `^` but only ever removed ONE
 *     prefix, so "PGS. TS. Trịnh Tú Anh" became "TS. Trịnh Tú Anh" — a value that
 *     matched no <option> and left the Coordinator select blank.
 *  2. Matching was raw substring containment, so a two-letter given name like
 *     "An" matched anything containing those letters: "S(an)dhya", "D(an)iela",
 *     "To(àn)", "Qu(an)g", "L(an)". Matching is now word-based.
 */
import { ISCM_MEMBERS } from './iscmMembers.js';

const TITLE_PREFIX = /^((PGS\.|TS\.|ThS\.|KTS\.|CN\.)\s*)+/;

/** Removes every leading academic title, not just the first one. */
export function stripTitles(name) {
  return String(name || '').replace(TITLE_PREFIX, '').trim();
}

const deaccent = (s) =>
  String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

/** Splits to comparable word tokens, dropping punctuation and honorifics. */
const HONORIFICS = new Set(['mr', 'ms', 'mrs', 'm', 'dr', 'prof']);
const wordsOf = (s) =>
  deaccent(s).split(/[^a-z0-9]+/).filter((w) => w && !HONORIFICS.has(w));

/**
 * The name fragments a member may be referred to by. Vietnamese names put the
 * given name last, so the last word (and last two) identify a person; Western
 * names on the roster ("Sandhya Rao", "Daniela Hurtarte") are given-name-first,
 * so for short two-word names the first word counts too.
 */
export function getShortNamesForMember(member) {
  const out = [];
  const add = (v) => { const t = deaccent(v).trim(); if (t) out.push(t); };

  [stripTitles(member.nameVi), (member.nameEn || '').split(',')[0].trim()].forEach((full) => {
    const w = full.split(/\s+/).filter(Boolean);
    if (w.length === 0) return;
    add(full);
    add(w[w.length - 1]);
    if (w.length >= 2) add(w.slice(-2).join(' '));
    if (w.length <= 2) add(w[0]);
  });

  if (member.id === 'm01') ['tú anh', 'tuanh-lead', 'tuanh'].forEach(add);
  return [...new Set(out)];
}

/** True when `termWords` appears as a consecutive run inside `targetWords`. */
function hasWordRun(targetWords, termWords) {
  if (termWords.length === 0 || termWords.length > targetWords.length) return false;
  for (let i = 0; i + termWords.length <= targetWords.length; i += 1) {
    if (termWords.every((w, j) => targetWords[i + j] === w)) return true;
  }
  return false;
}

export function isMemberMatch(member, targetStr) {
  if (!targetStr) return false;
  const targetWords = wordsOf(targetStr);
  if (targetWords.length === 0) return false;
  return getShortNamesForMember(member).some((term) =>
    hasWordRun(targetWords, wordsOf(term))
  );
}

/** The roster member a stored short name refers to, or null when nobody matches. */
export function findMember(shortName) {
  if (!shortName) return null;
  return ISCM_MEMBERS.find((m) => isMemberMatch(m, shortName)) || null;
}

/** Full name without titles — falls back to the raw string for non-roster people. */
export function resolveMemberFullName(shortName) {
  const member = findMember(shortName);
  return member ? stripTitles(member.nameVi) : String(shortName || '').trim();
}

/** Full name *with* titles — falls back to the raw string for non-roster people. */
export function resolveMemberNameAndTitle(shortName) {
  const member = findMember(shortName);
  return member ? member.nameVi : String(shortName || '').trim();
}

/** The value each member's <option> carries in the Coordinator/Members pickers. */
export const memberOptionValue = (member) => stripTitles(member.nameVi);

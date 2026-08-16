/**
 * Kho nhân sự công tác — people who work with ISCM without being on the
 * roster (public.external_members).
 *
 * Everyone added as an "outside member" of a research task is filed here, so
 * the next task can pick them from the list instead of retyping the name.
 * Writes go through the same RLS gate as the Research List
 * (`can_manage_group('Nghiên cứu Khoa học')`); when the write is refused the
 * person is still added to the task, and kept in this browser's copy of the
 * roster, so nothing the user typed is lost.
 */
import { supabase, isLive } from '../lib/supabaseClient.js';

const LOCAL_KEY = 'iscm-external-members';

/** How an outside member reads inside the comma-separated `members` field. */
export function formatExternalMember({ degree, full_name, affiliation }) {
  const name = [degree, full_name].map((s) => (s || '').trim()).filter(Boolean).join(' ');
  const place = (affiliation || '').trim();
  return (place ? `${name} (${place})` : name)
    // `members` is comma-separated, so a comma inside one person's details
    // would split them into two members.
    .replace(/,/g, ';')
    .replace(/\s+/g, ' ')
    .trim();
}

function readLocal() {
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeLocal(list) {
  try {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(list));
  } catch {
    /* storage full or disabled — the task itself still keeps the name */
  }
}

const samePerson = (a, b) =>
  (a.full_name || '').trim().toLowerCase() === (b.full_name || '').trim().toLowerCase()
  && (a.affiliation || '').trim().toLowerCase() === (b.affiliation || '').trim().toLowerCase();

/** The whole roster: the shared database plus anyone only this browser has. */
export async function fetchExternalMembers() {
  const local = readLocal();
  if (!isLive) return local;

  const { data, error } = await supabase
    .from('external_members')
    .select('*')
    .order('full_name', { ascending: true });
  if (error || !data) return local;

  const localOnly = local.filter((l) => !data.some((d) => samePerson(d, l)));
  return [...data, ...localOnly].sort((a, b) =>
    (a.full_name || '').localeCompare(b.full_name || '', 'vi'));
}

/**
 * Files a person in the roster. Returns { person, persisted } — `persisted`
 * is false when the row only made it into this browser, so the caller can say
 * so rather than implying it reached the shared roster.
 */
export async function saveExternalMember({ degree, full_name, affiliation }) {
  const person = {
    degree: (degree || '').trim(),
    full_name: (full_name || '').trim(),
    affiliation: (affiliation || '').trim(),
  };

  if (isLive) {
    const { data, error } = await supabase
      .from('external_members')
      .upsert(person, { onConflict: 'full_name,affiliation', ignoreDuplicates: false })
      .select()
      .single();
    if (!error && data) return { person: data, persisted: true };
  }

  const local = readLocal();
  if (!local.some((l) => samePerson(l, person))) writeLocal([...local, person]);
  return { person, persisted: false };
}

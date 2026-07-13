/**
 * Shared "My Forms" submission store (localStorage-backed).
 * Lives in the data layer so both UI components (FormPortalPanel) and
 * other data modules (libraryStore) can read/update it without a
 * component -> component import.
 */
const STORE_KEY = 'iscm_my_forms_submissions';

export function loadSubmissions() {
  try { return JSON.parse(localStorage.getItem(STORE_KEY) || '[]'); } catch { return []; }
}

export function saveSubmission(form, extra = {}) {
  const entry = {
    id: `sub-${Date.now()}`,
    form: form.label,
    group: form.group,
    date: new Date().toISOString().slice(0, 10),
    status: 'Open',
    ...extra,
  };
  localStorage.setItem(STORE_KEY, JSON.stringify([entry, ...loadSubmissions()]));
  return entry;
}

export function updateSubmissionStatus(id, status) {
  const list = loadSubmissions();
  localStorage.setItem(STORE_KEY, JSON.stringify(list.map((s) => (s.id === id ? { ...s, status } : s))));
}

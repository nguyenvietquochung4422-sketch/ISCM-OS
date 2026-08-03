/**
 * Admin-added branches on top of the hardcoded org chart shape (DEPARTMENTS
 * in ISCMOrganizationalChart.jsx) — e.g. a 9th "Specialised Research Unit"
 * nobody wrote into the source file. Each row slots into one department's
 * `field` array (subgroups / programDirectors / researchUnits / prActivities
 * / colabProjects); who holds it is still tracked separately in
 * org_role_assignments, keyed by `item:<deptId>:<field>:custom:<id>` (or
 * `sub:<deptId>:custom:<id>` for subgroups) so it never collides with the
 * positional role_keys the hardcoded items use.
 */
import { supabase, isLive } from '../lib/supabaseClient.js';

export async function fetchCustomItems() {
  if (!isLive) return [];
  const { data, error } = await supabase
    .from('org_custom_items')
    .select('*')
    .order('sort_order', { ascending: true });
  if (error || !data) return [];
  return data;
}

export async function addCustomItem({ deptId, field, nameVi, nameEn, descVi, descEn }) {
  if (!isLive) throw new Error('Supabase is not configured — cannot save.');
  const { data, error } = await supabase
    .from('org_custom_items')
    .insert({
      dept_id: deptId, field,
      name_vi: nameVi.trim(), name_en: (nameEn || '').trim(),
      desc_vi: (descVi || '').trim(), desc_en: (descEn || '').trim(),
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteCustomItem(id) {
  if (!isLive) throw new Error('Supabase is not configured — cannot delete.');
  const { error } = await supabase.from('org_custom_items').delete().eq('id', id);
  if (error) throw error;
}

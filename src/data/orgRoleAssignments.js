/**
 * Admin-editable overrides for "who holds this org-chart role" — department
 * heads and subgroup P.I.C.s. The chart's shape (departments, subgroups,
 * icons, descriptions) stays hardcoded in ISCMOrganizationalChart.jsx;
 * only the person assigned to each slot is database-driven, keyed by a
 * stable role_key (e.g. 'dept:of', 'sub:of:0').
 *
 * `pic_name` is always the display text shown on the chart card. `member_id`
 * is an optional link to iscm_members — when set, it's what "does this
 * person hold this role" actually checks (matching on name text alone broke
 * as soon as a member's nameVi carried an academic title the seed pic_name
 * didn't). External/unlinked assignments just carry pic_name with
 * member_id left null.
 */
import { supabase, isLive } from '../lib/supabaseClient.js';

// Mirrors the chart's Level-1 row order so the role checklist reads
// top-to-bottom the same way the flowchart does, instead of the arbitrary
// alphabetical order role_key sorts to on its own.
const DEPT_ORDER = ['director', 'vice-director', 'of', 'academia', 'research', 'community', 'partnership', 'colab', 'tech_hub', 'maker_space'];
const TYPE_ORDER = { dept: 0, sub: 1, item: 2 };

function roleKeyParts(roleKey) {
  const [type, deptId, ...rest] = roleKey.split(':');
  const idx = rest.length ? Number(rest[rest.length - 1]) : 0;
  return { type, deptId, idx: Number.isNaN(idx) ? 0 : idx };
}

function sortRoleRows(rows) {
  return [...rows].sort((a, b) => {
    const pa = roleKeyParts(a.role_key);
    const pb = roleKeyParts(b.role_key);
    const deptDiff = DEPT_ORDER.indexOf(pa.deptId) - DEPT_ORDER.indexOf(pb.deptId);
    if (deptDiff !== 0) return deptDiff;
    const typeDiff = (TYPE_ORDER[pa.type] ?? 9) - (TYPE_ORDER[pb.type] ?? 9);
    if (typeDiff !== 0) return typeDiff;
    return pa.idx - pb.idx;
  });
}

/** { [role_key]: { picName, isExternal } } */
export async function fetchRoleAssignments() {
  if (!isLive) return {};
  const { data, error } = await supabase.from('org_role_assignments').select('*');
  if (error || !data) return {};
  return Object.fromEntries(data.map((r) => [r.role_key, { picName: r.pic_name, isExternal: r.is_external }]));
}

/** Admin-only per RLS (is_top_admin). Pass memberId when picName is an
    ISCM_MEMBERS pick — leave it null/undefined for free-text or external names. */
export async function saveRoleAssignment({ roleKey, roleLabel, picName, isExternal, memberId = null, updatedBy }) {
  if (!isLive) throw new Error('Supabase is not configured — cannot save.');
  const { error } = await supabase.from('org_role_assignments').upsert({
    role_key: roleKey,
    role_label: roleLabel,
    pic_name: picName,
    is_external: isExternal,
    member_id: memberId,
    updated_by: updatedBy || null,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'role_key' });
  if (error) throw error;
}

export async function fetchAllRoleRows() {
  if (!isLive) return [];
  const { data, error } = await supabase.from('org_role_assignments').select('*');
  if (error || !data) return [];
  return sortRoleRows(data);
}

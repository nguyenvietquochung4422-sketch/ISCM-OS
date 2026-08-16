/**
 * Partnership — public.organizations / organization_contacts /
 * partnership_individuals / partnership_agreements.
 *
 * Person and Organization are kept as separate entities on purpose
 * (partnership_individuals vs organizations) rather than one shared
 * "partners" table — an individual stakeholder may or may not belong to
 * an organization, and collapsing the two would make future domain
 * modeling (people ↔ orgs ↔ projects ↔ events) harder to extend.
 *
 * partnership_agreements is a single MOU/agreement registry (not split
 * into separate Academia/Industry tables) — collaboration_domain is just
 * a column, filtered client-side.
 */
import { supabase, isLive } from '../lib/supabaseClient.js';

export const ORG_TYPES = ['University', 'Government', 'Business', 'NGO', 'Research Institution', 'Community Organization', 'Other'];
export const RELATIONSHIP_STATUSES = ['Prospective', 'Active', 'Inactive', 'Archived'];
export const STAKEHOLDER_TYPES = ['Expert', 'Academic', 'Government Contact', 'Industry Contact', 'Advisor', 'Visiting Collaborator', 'Other'];
export const COLLABORATION_DOMAINS = ['Academia', 'Research', 'Industry', 'Community', 'Other'];
export const AGREEMENT_STATUSES = ['Draft', 'Under Review', 'Active', 'Expired', 'Terminated', 'Archived'];

export async function canManagePartnership() {
  if (!isLive) return false;
  const { data, error } = await supabase.rpc('can_manage_content', { key: 'institutional-partners' });
  return !error && Boolean(data);
}

export async function fetchOrganizations() {
  if (!isLive) return [];
  const { data, error } = await supabase.from('organizations').select('*').order('name');
  if (error || !data) return [];
  return data;
}

export async function createOrganization(fields, userId) {
  if (!isLive) throw new Error('Supabase is not configured — cannot save.');
  const { data, error } = await supabase.from('organizations').insert({ ...fields, created_by: userId }).select().single();
  if (error) throw error;
  return data;
}

export async function fetchIndividuals() {
  if (!isLive) return [];
  const { data, error } = await supabase.from('partnership_individuals').select('*, organization:organization_id(name)').order('full_name');
  if (error || !data) return [];
  return data;
}

export async function createIndividual(fields, userId) {
  if (!isLive) throw new Error('Supabase is not configured — cannot save.');
  const { data, error } = await supabase.from('partnership_individuals').insert({ ...fields, created_by: userId }).select().single();
  if (error) throw error;
  return data;
}

export async function fetchAgreements() {
  if (!isLive) return [];
  const { data, error } = await supabase
    .from('partnership_agreements')
    .select('*, organization:organization_id(name, org_type, country), owner:internal_owner_id(full_name, email)')
    .order('expiry_date', { ascending: true, nullsFirst: false });
  if (error || !data) return [];
  return data;
}

export async function createAgreement(fields, userId) {
  if (!isLive) throw new Error('Supabase is not configured — cannot save.');
  const { data, error } = await supabase.from('partnership_agreements').insert({ ...fields, created_by: userId }).select().single();
  if (error) throw error;
  return data;
}

export async function updateAgreementStatus(id, status) {
  if (!isLive) throw new Error('Supabase is not configured — cannot save.');
  const { error } = await supabase.from('partnership_agreements').update({ status, updated_at: new Date().toISOString() }).eq('id', id);
  if (error) throw error;
}

/** 'Expired' (status says so, or the date's passed) / 'Expiring Soon'
    (within 90 days) / 'Active' — the read-time badge every Agreements
    row shows next to its raw expiry_date. */
export function getExpiryStatus(agreement) {
  if (agreement.status === 'Expired' || agreement.status === 'Terminated' || agreement.status === 'Archived') return agreement.status;
  if (!agreement.expiry_date) return agreement.status;
  const today = new Date();
  const expiry = new Date(`${agreement.expiry_date}T00:00:00`);
  const daysLeft = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
  if (daysLeft < 0) return 'Expired';
  if (daysLeft <= 90) return 'Expiring Soon';
  return agreement.status;
}

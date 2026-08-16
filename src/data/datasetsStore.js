/**
 * Data Management — public.datasets. Deliberately reuses what ISCM OS
 * already has instead of inventing new entities: `lead_group`/
 * `contributing_groups` are FUNCTIONAL_GROUPS values (Group Management),
 * `contact_member_id` links into iscm_members, `primary_task_id`/
 * `other_task_ids` link into iscm_research_list (Task Type is derived from
 * those links, never stored twice). Falls back to an empty catalog in demo
 * mode — there's no meaningful local-only substitute for a shared
 * institute-wide dataset inventory.
 *
 * This only confirms a dataset EXISTS, who holds it, what it's related to,
 * where it lives, and under what access condition — not that it's accurate,
 * clean, or research-grade. That's why registration status uses "Registered"
 * rather than "Verified", and why there's a separate, unrelated
 * lifecycle/condition self-assessment instead of one conflated "quality" flag.
 */
import { supabase, isLive } from '../lib/supabaseClient.js';

export const DATA_TYPES = [
  'Tabular', 'GIS / Spatial', 'Document', 'Image', 'Video', 'Sensor', 'Web / Scraped', 'API', 'Other',
];

export const FILE_FORMATS = [
  'CSV', 'XLSX', 'JSON', 'Parquet', 'SHP', 'GeoJSON', 'GeoPackage', 'GeoTIFF', 'KML',
  'PDF', 'DOCX', 'TXT', 'JPG', 'PNG', 'TIFF', 'MP4', 'MOV', 'Database', 'URL / API', 'Other',
];

export const GROUPS = ['Operation & Finance', 'Partnership', 'Đào tạo Học thuật', 'Nghiên cứu Khoa học', 'Gắn kết Cộng đồng'];

export const STORAGE_TYPES = [
  'Google Drive', 'Personal Computer', 'ISCM Server', 'External Cloud', 'Database', 'Other',
];

export const SIZE_BUCKETS = [
  '< 100 MB', '100 MB – 1 GB', '1 – 10 GB', '10 – 100 GB', '> 100 GB', 'Unknown',
];

export const ACCESS_LEVELS = ['Public', 'Internal', 'Restricted'];
export const SENSITIVITY_OPTIONS = ['No', 'Yes', 'Not sure'];

// Registration Status — confirms the dataset was declared and its record
// reviewed, nothing about the data itself.
export const STATUS_OPTIONS = ['Draft', 'Submitted', 'Registered', 'Needs Update'];

// Dataset Lifecycle — where the data itself is in its own life, independent
// of registration status (a Registered entry can still be "Collecting").
export const LIFECYCLE_OPTIONS = ['Planned', 'Collecting', 'Active', 'Completed', 'Archived', 'Unavailable'];

export const AVAILABILITY_OPTIONS = ['Available now', 'Partially available', 'Temporarily unavailable', 'Location unknown'];
export const DATA_CONDITION_OPTIONS = ['Ready to use', 'Requires cleaning', 'Incomplete', 'Quality unknown'];

export async function fetchDatasets() {
  if (!isLive) return [];
  const { data, error } = await supabase
    .from('datasets')
    .select('*')
    .order('created_at', { ascending: false });
  if (error || !data) return [];
  return data;
}

export async function createDataset(fields, userId) {
  if (!isLive) throw new Error('Supabase is not configured — cannot save.');
  const { data, error } = await supabase
    .from('datasets')
    .insert({ ...fields, created_by: userId })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateDataset(id, patch) {
  if (!isLive) throw new Error('Supabase is not configured — cannot save.');
  const { data, error } = await supabase
    .from('datasets')
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteDataset(id) {
  if (!isLive) throw new Error('Supabase is not configured — cannot delete.');
  const { error } = await supabase.from('datasets').delete().eq('id', id);
  if (error) throw error;
}

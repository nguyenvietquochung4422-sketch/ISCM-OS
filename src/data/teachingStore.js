/**
 * Academia > Teaching — public.academic_courses / teaching_assignments /
 * teaching_sessions. Deliberately separate from attendance_records: a
 * teaching session isn't an attendance exception, it's a scheduled
 * obligation, so it gets its own tables rather than an
 * attendance_type = 'Teaching' hack. The only bridge to Attendance is a
 * read-time conflict check (getScheduleConflict, re-exported from
 * eventStore.js's getLeaveConflict — same "approved leave overlapping a
 * date" logic, no need for a second copy).
 *
 * Hierarchy: academic_courses (what) -> teaching_assignments (who teaches
 * it, which class/semester) -> teaching_sessions (the actual dated,
 * timed occurrences that make up a schedule).
 */
import { supabase, isLive } from '../lib/supabaseClient.js';

export const TEACHING_ROLES = ['Lecturer', 'Co-Lecturer', 'Teaching Assistant', 'Guest Speaker'];
export const SESSION_TYPES = ['Lecture', 'Studio', 'Seminar', 'Lab', 'Exam', 'Other'];

export async function canManageTeaching() {
  if (!isLive) return false;
  const { data, error } = await supabase.rpc('can_manage_content', { key: 'my-teaching-schedule' });
  return !error && Boolean(data);
}

export async function fetchCourses() {
  if (!isLive) return [];
  const { data, error } = await supabase.from('academic_courses').select('*').order('course_code');
  if (error || !data) return [];
  return data;
}

export async function createCourse(fields, userId) {
  if (!isLive) throw new Error('Supabase is not configured — cannot save.');
  const { data, error } = await supabase.from('academic_courses').insert({ ...fields, created_by: userId }).select().single();
  if (error) throw error;
  return data;
}

/** Every assignment, with course + member joined — the base list Teaching
    Assignments (admin) and both schedule views build from. */
export async function fetchAssignments() {
  if (!isLive) return [];
  const { data, error } = await supabase
    .from('teaching_assignments')
    .select('*, course:course_id(*), member:member_id(full_name, email)')
    .order('academic_year', { ascending: false });
  if (error || !data) return [];
  return data;
}

export async function createAssignment(fields, userId) {
  if (!isLive) throw new Error('Supabase is not configured — cannot save.');
  const { data, error } = await supabase.from('teaching_assignments').insert({ ...fields, created_by: userId }).select().single();
  if (error) throw error;
  return data;
}

export async function deleteAssignment(id) {
  if (!isLive) throw new Error('Supabase is not configured — cannot delete.');
  const { error } = await supabase.from('teaching_assignments').delete().eq('id', id);
  if (error) throw error;
}

/** Every session institute-wide, with assignment+course+member joined —
    the single source both "My Teaching Schedule" (filtered client-side by
    member) and "Institute Teaching Schedule" read from, so the two views
    can never disagree about what's scheduled. */
export async function fetchAllSessions() {
  if (!isLive) return [];
  const { data, error } = await supabase
    .from('teaching_sessions')
    .select('*, assignment:teaching_assignment_id(*, course:course_id(*), member:member_id(id, full_name, email))')
    .order('session_date');
  if (error || !data) return [];
  return data;
}

export async function createSession(fields, userId) {
  if (!isLive) throw new Error('Supabase is not configured — cannot save.');
  const { data, error } = await supabase.from('teaching_sessions').insert({ ...fields, created_by: userId }).select().single();
  if (error) throw error;
  return data;
}

export async function cancelSession(id) {
  if (!isLive) throw new Error('Supabase is not configured — cannot save.');
  const { error } = await supabase.from('teaching_sessions').update({ status: 'Cancelled' }).eq('id', id);
  if (error) throw error;
}

export async function deleteSession(id) {
  if (!isLive) throw new Error('Supabase is not configured — cannot delete.');
  const { error } = await supabase.from('teaching_sessions').delete().eq('id', id);
  if (error) throw error;
}

/** Sessions belonging to one member (via their assignments), sorted by
    date — what MyTeachingSchedulePanel / a member row in the institute
    view actually renders. */
export function sessionsForMember(allSessions, memberId) {
  return allSessions
    .filter((s) => s.assignment?.member?.id === memberId)
    .sort((a, b) => a.session_date.localeCompare(b.session_date) || a.start_time.localeCompare(b.start_time));
}

export function sessionsOnDate(allSessions, isoDate) {
  return allSessions.filter((s) => s.session_date === isoDate && s.status !== 'Cancelled');
}

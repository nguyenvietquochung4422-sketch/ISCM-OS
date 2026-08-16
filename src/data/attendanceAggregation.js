/**
 * Shared date/aggregation logic for Attendance — the single place History,
 * Monthly Summary, Member Profile, and the Monthly Matrix all pull from, so
 * they can never disagree on what "5 days of Work Outside" means. Nothing
 * here talks to Supabase; it's pure functions over records/policies/
 * calendar days/scopes already fetched via attendanceStore.js and
 * attendancePolicyStore.js.
 *
 * Phase 3A (Attendance Settings) made "what counts as a working day" and
 * "who counts at all, and from when" real, admin-configured policy instead
 * of a Mon–Fri assumption baked into the code — everything below takes an
 * AttendanceContext (buildAttendanceContext()) instead of guessing.
 */
import { ATTENDANCE_TYPES, todayIsoLocal } from './attendanceStore.js';

// Re-exported so components that already import "today" alongside the rest
// of the aggregation helpers don't need a second import line.
export { todayIsoLocal };

// Types that represent time away from a normal on-site working day. Late
// is deliberately excluded — it's an occurrence within an otherwise normal
// working day, not a day (or half-day) taken away from it.
const DAY_OFF_TYPES = ['Annual Leave', 'Absence', 'Work from Home', 'Work Outside'];

// Used only when no admin-configured policy exists yet (fresh install,
// before anyone visits Attendance Settings) — a Mon–Fri/8h fallback so the
// rest of the app still works, but callers can check `hasConfiguredPolicy`
// to decide whether to still call any of this an "estimate".
const FALLBACK_POLICY = {
  id: null, working_days: [1, 2, 3, 4, 5], standard_daily_minutes: 480,
  effective_from: '1970-01-01', effective_to: null, type_rules: {},
};

/* All date math below runs in UTC, deliberately — attendance_date/end_date
   are plain calendar dates (Postgres `date`, no time component), not
   moments in time. Parsing "2026-08-07" as local midnight and then calling
   .toISOString() (which is always UTC) silently shifts the date backward
   for anyone in a timezone ahead of UTC — Vietnam (UTC+7) included, so
   this bit anyone in the country the app is built for. Staying in UTC for
   the whole round-trip (parse with a 'Z' suffix, step with setUTCDate,
   format with toISOString) sidesteps the conversion entirely: the ISO date
   string that goes in is exactly the one that comes back out, regardless
   of the viewer's browser timezone. */
function toIso(d) {
  return d.toISOString().slice(0, 10);
}

function parseIsoUtc(iso) {
  return new Date(`${iso}T00:00:00Z`);
}

/** Every ISO date a record covers — one date for a single-day record, a
    run of dates for a multi-day Annual Leave. */
export function getCoveredDates(record) {
  const end = parseIsoUtc(record.end_date || record.attendance_date);
  const dates = [];
  for (let d = parseIsoUtc(record.attendance_date); d <= end; d.setUTCDate(d.getUTCDate() + 1)) dates.push(toIso(d));
  return dates;
}

/** True when [from, to] (inclusive, ISO dates) intersects the record's own
    date range — the same range-overlap rule used for submit-time
    validation (attendanceStore.hasOverlappingRecord) and for filtering a
    record into a given period for History/Summary/Matrix. */
export function doesRecordOverlapRange(record, from, to) {
  const rEnd = record.end_date || record.attendance_date;
  return record.attendance_date <= to && rEnd >= from;
}

/** Every ISO date a record covers, clipped to [from, to] — a 30 Jul–3 Aug
    Annual Leave summarized for August must only ever count 1–3 Aug, never
    all 5 days. Every aggregation below goes through this, not the
    unclipped getCoveredDates, specifically so a multi-day record can't get
    double-counted across two adjacent months/matrices. */
export function getCoveredDatesWithinRange(record, from, to) {
  return getCoveredDates(record).filter((d) => d >= from && d <= to);
}

/* ------------------------------------------------------------------ */
/* Attendance Settings — policies, calendar exceptions, member scope   */
/* ------------------------------------------------------------------ */

/** Bundles everything a date/day-off calculation needs into one object so
    call sites don't juggle three separate arrays. Build once per page load
    (policies/calendarDays/scopes rarely change) and pass down as `context`. */
export function buildAttendanceContext(policies, calendarDays, scopes) {
  const calendarByDate = new Map((calendarDays || []).map((c) => [c.date, c]));
  const scopeByMember = new Map((scopes || []).map((s) => [s.member_id, s]));
  return {
    policies: policies && policies.length > 0 ? policies : [FALLBACK_POLICY],
    calendarByDate,
    scopeByMember,
    hasConfiguredPolicy: Boolean(policies && policies.length > 0),
  };
}

/** Whichever policy version was actually in force on `isoDate` — the
    newest one whose effective_from has already started and whose
    effective_to (if any) hasn't passed yet. Falls back to the single
    FALLBACK_POLICY if nothing matches (e.g. a date before any policy's
    effective_from), so calculations never throw on unconfigured history. */
export function resolvePolicyForDate(context, isoDate) {
  const candidates = context.policies.filter((p) =>
    p.effective_from <= isoDate && (!p.effective_to || p.effective_to >= isoDate));
  if (candidates.length === 0) return FALLBACK_POLICY;
  return candidates.reduce((latest, p) => (p.effective_from > latest.effective_from ? p : latest));
}

/** A calendar exception always overrides the policy's weekly pattern —
    public/institute holidays and special non-working days are never
    working days regardless of weekday; a special working day always is. */
export function isWorkday(isoDate, context) {
  const exception = context?.calendarByDate?.get(isoDate);
  if (exception) return exception.day_type === 'special_working_day';
  const policy = context ? resolvePolicyForDate(context, isoDate) : FALLBACK_POLICY;
  return policy.working_days.includes(parseIsoUtc(isoDate).getUTCDay());
}

/** Working-day count in [from, to] inclusive, honouring whichever policy
    version and calendar exceptions actually applied on each individual day
    in the range (a range spanning a policy change uses the old policy for
    the days before it took effect, and the new one after). */
export function getWorkingDaysBetween(from, to, context) {
  let count = 0;
  const end = parseIsoUtc(to);
  for (const d = parseIsoUtc(from); d <= end; d.setUTCDate(d.getUTCDate() + 1)) {
    if (isWorkday(toIso(d), context)) count += 1;
  }
  return count;
}

/** True on the date(s) `scope` actually covers — enabled, and within
    start_date/end_date if set. No scope row at all means "in scope,
    unrestricted" (the account exists and hasn't been explicitly limited). */
export function isInMemberScope(scope, isoDate) {
  if (!scope) return true;
  if (scope.enabled === false) return false;
  if (scope.start_date && isoDate < scope.start_date) return false;
  if (scope.end_date && isoDate > scope.end_date) return false;
  return true;
}

/** Clips [from, to] down to whatever part of it the member's scope
    actually covers — e.g. a member starting 15 Aug summarized for all of
    August only accrues Normal Working Days from the 15th on. Returns null
    if the scope doesn't cover any of the range at all (disabled entirely,
    or the range is fully before/after start/end). */
export function clampRangeToScope(from, to, scope) {
  if (!scope) return { from, to };
  if (scope.enabled === false) return null;
  const clampedFrom = scope.start_date && scope.start_date > from ? scope.start_date : from;
  const clampedTo = scope.end_date && scope.end_date < to ? scope.end_date : to;
  if (clampedFrom > clampedTo) return null;
  return { from: clampedFrom, to: clampedTo };
}

/* ------------------------------------------------------------------ */

/** Full Day / Half Day → a day count within [from, to] (calendar-aware —
    weekends and configured holidays excluded, special working days
    included); Custom Time isn't a day fraction and is tracked in minutes
    instead (see getRecordCustomMinutes / getRecordEquivalentDaysFromPolicy
    for converting it, once a standard daily-minutes policy exists). Half
    Day records are always single-day, so clipping just includes/excludes
    the one date. */
export function getRecordEquivalentDaysInRange(record, from, to, context) {
  const dates = getCoveredDatesWithinRange(record, from, to).filter((d) => isWorkday(d, context));
  switch (record.duration_type) {
    case 'Full Day': return dates.length;
    case 'Half Day - Morning':
    case 'Half Day - Afternoon': return 0.5 * dates.length;
    default: return null; // Custom Time
  }
}

/** Custom Time duration in minutes, or null for any other duration type. */
export function getRecordCustomMinutes(record) {
  if (record.duration_type !== 'Custom Time' || !record.start_time || !record.end_time) return null;
  const [sh, sm] = record.start_time.split(':').map(Number);
  const [eh, em] = record.end_time.split(':').map(Number);
  const mins = (eh * 60 + em) - (sh * 60 + sm);
  return mins > 0 ? mins : null;
}

/** Custom Time expressed as a fraction of a standard working day, per the
    policy in force on the record's date — a secondary, opt-in figure.
    Nothing folds this into equivalentDays/Normal Working Days automatically
    (Custom Time still means "occurrences + minutes" everywhere else), since
    whether a short Late arrival should ever consume a fraction of PTO is a
    policy call ISCM hasn't made, not a data-modelling one. */
export function getRecordEquivalentDaysFromPolicy(record, context) {
  const mins = getRecordCustomMinutes(record);
  if (!mins) return null;
  const policy = resolvePolicyForDate(context, record.attendance_date);
  return policy.standard_daily_minutes ? mins / policy.standard_daily_minutes : null;
}

function emptyTypeBucket() {
  return { occurrences: 0, fullDays: 0, halfDays: 0, equivalentDays: 0, customMinutes: 0 };
}

/** The one aggregation function every Attendance view should call instead
    of writing its own reduce over records. `records` should already be
    scoped to one member (or the whole institute) — this only clips each
    record to [from, to] and buckets it by type + approval status.
    `context` (buildAttendanceContext()) supplies working-day rules; a
    scope-based clamp, if any, should already be applied to [from, to]
    before calling this (see getMemberAttendanceSummary).
    Returns:
      {
        approved: { 'Annual Leave': {...}, ... },
        pending:  { same shape },
        statusCounts: { pending, approved, rejected, cancelled },
        normalWorkingDaysEstimate, workingDaysInRange, isEstimate,
      }
    Rejected/Cancelled records are counted in statusCounts only — never in
    the approved/pending type buckets. */
export function summarizeRecords(records, from, to, context) {
  const ctx = context || buildAttendanceContext([], [], []);
  const approved = {};
  const pending = {};
  ATTENDANCE_TYPES.forEach((t) => { approved[t] = emptyTypeBucket(); pending[t] = emptyTypeBucket(); });
  const statusCounts = { pending: 0, approved: 0, rejected: 0, cancelled: 0 };

  let dayOffEquivalent = 0;

  records.forEach((r) => {
    if (!doesRecordOverlapRange(r, from, to)) return;

    if (r.approval_status === 'Rejected') { statusCounts.rejected += 1; return; }
    if (r.approval_status === 'Cancelled') { statusCounts.cancelled += 1; return; }
    if (r.approval_status !== 'Approved' && r.approval_status !== 'Pending') return; // Draft/No Permission: not produced yet

    const bucket = r.approval_status === 'Approved' ? approved : pending;
    if (r.approval_status === 'Approved') statusCounts.approved += 1; else statusCounts.pending += 1;

    const b = bucket[r.attendance_type];
    if (!b) return;
    b.occurrences += 1;
    const days = getRecordEquivalentDaysInRange(r, from, to, ctx);
    if (days !== null) {
      if (r.duration_type === 'Full Day') b.fullDays += days; else b.halfDays += days;
      b.equivalentDays += days;
      if (r.approval_status === 'Approved' && DAY_OFF_TYPES.includes(r.attendance_type)) dayOffEquivalent += days;
    } else {
      const mins = getRecordCustomMinutes(r);
      if (mins) b.customMinutes += mins;
    }
  });

  const workingDaysInRange = getWorkingDaysBetween(from, to, ctx);
  const normalWorkingDaysEstimate = Math.max(workingDaysInRange - dayOffEquivalent, 0);

  return {
    approved, pending, statusCounts, normalWorkingDaysEstimate, workingDaysInRange,
    // Still an estimate until an admin has actually configured a policy —
    // even a real policy can't claim to be authoritative about holidays
    // that were never entered.
    isEstimate: !ctx.hasConfiguredPolicy || ctx.calendarByDate.size === 0,
  };
}

/** Convenience wrapper — one member, one period, automatically clamped to
    their attendance scope (if configured). Returns an all-zero summary
    (not an error) for a period the member's scope doesn't cover at all. */
export function getMemberAttendanceSummary(records, memberId, from, to, context) {
  const ctx = context || buildAttendanceContext([], [], []);
  const scope = ctx.scopeByMember.get(memberId);
  const clamped = clampRangeToScope(from, to, scope);
  if (!clamped) return summarizeRecords([], from, to, ctx);
  return summarizeRecords(records.filter((r) => r.member_id === memberId), clamped.from, clamped.to, ctx);
}

export function monthRange(year, month /* 0-based */) {
  const from = new Date(Date.UTC(year, month, 1)).toISOString().slice(0, 10);
  const to = new Date(Date.UTC(year, month + 1, 0)).toISOString().slice(0, 10);
  return { from, to };
}

export function yearRange(year) {
  return { from: `${year}-01-01`, to: `${year}-12-31` };
}

/** One row per account, built entirely from getMemberAttendanceSummary —
    the Matrix never computes a day/occurrence count on its own, and
    respects the same per-member scope clamp Member Profile does. `accounts`
    should include everyone in scope (even people with zero records this
    month), so nobody quietly disappears from the report. */
export function buildMonthlyMatrix({ accounts, records, year, month, context }) {
  const { from, to } = monthRange(year, month);
  return accounts.map((account) => ({
    account,
    summary: getMemberAttendanceSummary(records, account.id, from, to, context),
  }));
}

/** The exact records behind one Matrix cell — same range + member +
    type filter the cell's own number came from, so drill-down can never
    show a different set than what was counted. `durationGroup` narrows to
    'Full Day' | 'Half Day' | null (any). */
export function getMatrixCellRecords(records, memberId, attendanceType, from, to, durationGroup, includePending) {
  return records.filter((r) => {
    if (r.member_id !== memberId) return false;
    if (r.attendance_type !== attendanceType) return false;
    if (!doesRecordOverlapRange(r, from, to)) return false;
    if (r.approval_status === 'Approved') { /* always included */ }
    else if (r.approval_status === 'Pending' && includePending) { /* included */ }
    else return false;
    if (durationGroup === 'Full Day') return r.duration_type === 'Full Day';
    if (durationGroup === 'Half Day') return r.duration_type === 'Half Day - Morning' || r.duration_type === 'Half Day - Afternoon';
    return true;
  });
}

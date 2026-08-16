/**
 * Role a member holds on a task — a management tag, independent of whether
 * they're an ISCM Roster or an outside member.
 */
import { findMember } from './memberNames.js';

export const MEMBER_ROLES = ['Leader', 'Coordinator', 'Member'];

/** The Director, who leads by default wherever she appears on a task. */
export const DEFAULT_LEADER = 'Trịnh Tú Anh';
const DEFAULT_LEADER_ID = 'm01';

/** True for any way the Director is written down ("TuAnh-Lead", "Ms. Tú Anh", …). */
export function isDefaultLeader(name) {
  return findMember(name)?.id === DEFAULT_LEADER_ID;
}

/**
 * The role to show for a member. Nothing recorded means the Director is
 * Leader — the usual case, so it doesn't have to be set on every task. It's
 * only a fallback: recording any role for her (including "None", stored as an
 * empty string) is kept as-is.
 */
export function roleOf(memberRoles, name) {
  if (memberRoles && Object.prototype.hasOwnProperty.call(memberRoles, name)) {
    return memberRoles[name] || '';
  }
  return isDefaultLeader(name) ? 'Leader' : '';
}

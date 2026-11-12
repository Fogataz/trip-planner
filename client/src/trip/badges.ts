import type { ActivityEntry, ExpenseSummary, Poll } from './tripData'

export interface Badges {
  overview: number
  plan: number
  money: number
  group: number
}

export interface BadgeInput {
  currentUid?: string
  /** May the viewer manage this trip's invitations? One capability, not a role. */
  canManageInvites: boolean
  members: ReadonlyArray<{ status?: string; invitedBy?: string }>
  polls: ReadonlyArray<Poll>
  expenses: ExpenseSummary
  activity: ReadonlyArray<ActivityEntry>
  /** ISO timestamps of this person's last look at Overview and Plan; missing = never, which counts nothing */
  seen: { overview?: string; plan?: string }
}

function newerThan(entry: ActivityEntry, iso?: string): boolean {
  return !!iso && Date.parse(entry.timestamp) > Date.parse(iso)
}

/**
 * The "needs me" counts per destination (spec 004 section 7.6). Zero means no badge.
 * - Plan: open polls I have not voted in, plus itinerary changes by others since I last opened Plan
 * - Money: 1 if my balance is not zero
 * - Group: outstanding invitations (organizer only), those I sent when the server recorded who sent them
 * - Overview: activity by others since I last opened Overview
 */
export function computeBadges(input: BadgeInput): Badges {
  const { currentUid, canManageInvites, members, polls, expenses, activity, seen } = input
  const byOthers = activity.filter((a) => a.userId !== currentUid)

  const unvoted = polls.filter(
    (p) => p.status === 'open' && !p.options.some((o) => !!currentUid && o.votes.includes(currentUid))
  ).length
  // Never opened Plan here but has opened the trip: count from that last visit instead
  const planSeen = seen.plan ?? seen.overview
  const planChanges = byOthers.filter((a) => a.targetType === 'itinerary' && newerThan(a, planSeen)).length

  const myBalance = currentUid ? expenses.balances[currentUid] ?? 0 : 0

  // 'invited' in the spec 011 §6.1 vocabulary: sent, not yet accepted, and
  // counting towards nothing until it is.
  const pending = members.filter((m) => m.status === 'invited')
  const mine = pending.filter((m) => !m.invitedBy || m.invitedBy === currentUid)

  return {
    overview: byOthers.filter((a) => newerThan(a, seen.overview)).length,
    plan: unvoted + planChanges,
    money: Math.abs(myBalance) >= 1 ? 1 : 0,
    group: canManageInvites ? mine.length : 0,
  }
}

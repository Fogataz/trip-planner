import { describe, expect, it } from 'vitest'
import { BadgeInput, computeBadges } from './badges'

const ME = 'me'
const ANA = 'ana'

function input(overrides: Partial<BadgeInput> = {}): BadgeInput {
  return {
    currentUid: ME,
    canManageInvites: false,
    members: [{ status: 'active' }, { status: 'active' }],
    polls: [],
    expenses: { expenses: [], balances: {}, settlements: [] },
    activity: [],
    seen: {},
    ...overrides,
  }
}

const poll = (votes: string[], status: 'open' | 'closed' = 'open') => ({
  _id: Math.random().toString(),
  question: 'Dinner?',
  allowMultiple: false,
  status,
  createdBy: ANA,
  options: [
    { _id: 'a', text: 'A', votes },
    { _id: 'b', text: 'B', votes: [] },
  ],
})

const entry = (userId: string, timestamp: string, targetType = 'itinerary') => ({
  _id: Math.random().toString(),
  action: 'itinerary_added',
  targetType,
  userId,
  timestamp,
})

describe('computeBadges', () => {
  it('shows nothing when nothing needs me (AC21)', () => {
    expect(computeBadges(input())).toEqual({ overview: 0, plan: 0, money: 0, group: 0 })
  })

  it('counts an open poll I have not voted in, and clears once I vote (AC20)', () => {
    expect(computeBadges(input({ polls: [poll([ANA])] })).plan).toBe(1)
    expect(computeBadges(input({ polls: [poll([ANA, ME])] })).plan).toBe(0)
  })

  it('ignores closed polls', () => {
    expect(computeBadges(input({ polls: [poll([], 'closed')] })).plan).toBe(0)
  })

  it('counts itinerary changes by others since I last opened Plan', () => {
    const activity = [entry(ANA, '2026-11-10T10:00:00Z'), entry(ANA, '2026-11-10T08:00:00Z'), entry(ME, '2026-11-10T11:00:00Z')]
    expect(computeBadges(input({ activity, seen: { plan: '2026-11-10T09:00:00Z' } })).plan).toBe(1)
  })

  it('counts Plan changes since the last trip visit when Plan was never opened', () => {
    const activity = [entry(ANA, '2026-11-10T10:00:00Z')]
    expect(computeBadges(input({ activity, seen: { overview: '2026-11-10T09:00:00Z' } })).plan).toBe(1)
  })

  it('counts nothing for a first visit (no stored timestamp)', () => {
    const activity = [entry(ANA, '2026-11-10T10:00:00Z')]
    expect(computeBadges(input({ activity })).plan).toBe(0)
    expect(computeBadges(input({ activity })).overview).toBe(0)
  })

  it('counts all activity by others since I last opened Overview', () => {
    const activity = [entry(ANA, '2026-11-10T10:00:00Z', 'member'), entry(ANA, '2026-11-10T10:30:00Z')]
    expect(computeBadges(input({ activity, seen: { overview: '2026-11-10T09:00:00Z' } })).overview).toBe(2)
  })

  it('shows 1 on Money for any non-zero balance, owing or owed', () => {
    expect(computeBadges(input({ expenses: { expenses: [], balances: { [ME]: -4200 }, settlements: [] } })).money).toBe(1)
    expect(computeBadges(input({ expenses: { expenses: [], balances: { [ME]: 4200 }, settlements: [] } })).money).toBe(1)
    expect(computeBadges(input({ expenses: { expenses: [], balances: { [ME]: 0 }, settlements: [] } })).money).toBe(0)
  })

  it('counts outstanding invitations for the organizer only', () => {
    const members = [{ status: 'active' }, { status: 'invited', invitedBy: ME }, { status: 'invited', invitedBy: ANA }]
    expect(computeBadges(input({ members, canManageInvites: true })).group).toBe(1)
    expect(computeBadges(input({ members, canManageInvites: false })).group).toBe(0)
  })
})

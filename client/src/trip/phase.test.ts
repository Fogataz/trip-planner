import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { isTripLive, tripPhase, TripPhaseInput } from './phase'

// Trip dates as the server stores them: calendar days at UTC midnight
const START = '2026-06-10T00:00:00.000Z'
const END = '2026-06-12T00:00:00.000Z'

const active = { status: 'active' }
const pending = { status: 'invited' }
const stop = { stop: 'Lisbon' }

/** A trip that is past Setup: one itinerary item and two active members */
function trip(overrides: Partial<TripPhaseInput> = {}): TripPhaseInput {
  return { startDate: START, endDate: END, itinerary: [stop], members: [active, active], ...overrides }
}

/** A wall-clock time in whatever TZ is set. Month is 1-based. */
function at(y: number, m: number, d: number, h = 0, min = 0): Date {
  return new Date(y, m - 1, d, h, min)
}

const originalTz = process.env.TZ

function useTz(tz: string) {
  beforeEach(() => {
    process.env.TZ = tz
  })
  afterEach(() => {
    process.env.TZ = originalTz
  })
}

// The same boundaries must hold in the viewer's timezone wherever they are
const zones = ['UTC', 'Pacific/Pago_Pago', 'America/Los_Angeles', 'Europe/Lisbon', 'Asia/Tokyo', 'Pacific/Kiritimati']

describe.each(zones)('tripPhase boundaries in %s', (tz) => {
  useTz(tz)

  it('is Planning 8 days before the start', () => {
    expect(tripPhase(trip(), at(2026, 6, 2, 0, 0))).toBe('planning')
    expect(tripPhase(trip(), at(2026, 6, 2, 23, 59))).toBe('planning')
  })

  it('is Countdown from 7 days before the start', () => {
    expect(tripPhase(trip(), at(2026, 6, 3, 0, 0))).toBe('countdown')
    expect(tripPhase(trip(), at(2026, 6, 3, 23, 59))).toBe('countdown')
  })

  it('is Countdown until 23:59 the day before the start', () => {
    expect(tripPhase(trip(), at(2026, 6, 9, 23, 59))).toBe('countdown')
  })

  it('is Live from 00:00 on the start day', () => {
    expect(tripPhase(trip(), at(2026, 6, 10, 0, 0))).toBe('live')
  })

  it('is Live mid-trip', () => {
    expect(tripPhase(trip(), at(2026, 6, 11, 12, 0))).toBe('live')
  })

  it('is Live until 23:59 on the end day', () => {
    expect(tripPhase(trip(), at(2026, 6, 12, 23, 59))).toBe('live')
  })

  it('is Wrap from 00:00 the day after the end', () => {
    expect(tripPhase(trip(), at(2026, 6, 13, 0, 0))).toBe('wrap')
    expect(tripPhase(trip(), at(2026, 9, 1, 12, 0))).toBe('wrap')
  })

  it('treats a missing end date as a one-day trip', () => {
    const t = trip({ endDate: undefined })
    expect(tripPhase(t, at(2026, 6, 9, 23, 59))).toBe('countdown')
    expect(tripPhase(t, at(2026, 6, 10, 0, 0))).toBe('live')
    expect(tripPhase(t, at(2026, 6, 10, 23, 59))).toBe('live')
    expect(tripPhase(t, at(2026, 6, 11, 0, 0))).toBe('wrap')
  })

  it('uses the longer approximate length when there is no end date (8 to 10 days)', () => {
    const t = trip({ endDate: undefined, durationDays: { min: 8, max: 10 } })
    expect(tripPhase(t, at(2026, 6, 10, 0, 0))).toBe('live')
    // Day 10 is 19 June: still Live until 23:59
    expect(tripPhase(t, at(2026, 6, 19, 23, 59))).toBe('live')
    expect(tripPhase(t, at(2026, 6, 20, 0, 0))).toBe('wrap')
    expect(isTripLive(START, undefined, at(2026, 6, 19, 12, 0), { min: 8, max: 10 })).toBe(true)
  })

  it('prefers a real end date over an approximate length', () => {
    const t = trip({ durationDays: { min: 8, max: 10 } })
    expect(tripPhase(t, at(2026, 6, 13, 0, 0))).toBe('wrap')
  })

  it('keeps isTripLive in step with tripPhase', () => {
    for (const now of [at(2026, 6, 9, 23, 59), at(2026, 6, 10, 0, 0), at(2026, 6, 12, 23, 59), at(2026, 6, 13, 0, 0)]) {
      expect(isTripLive(START, END, now)).toBe(tripPhase(trip(), now) === 'live')
    }
  })
})

describe('tripPhase west of UTC (America/Los_Angeles)', () => {
  useTz('America/Los_Angeles')

  it('does not start the trip early when UTC has already reached the start day', () => {
    // 20:00 on 9 June in LA is 03:00 on 10 June in UTC
    const now = at(2026, 6, 9, 20, 0)
    expect(now.toISOString()).toBe('2026-06-10T03:00:00.000Z')
    expect(tripPhase(trip(), now)).toBe('countdown')
  })

  it('is still Live on the evening of the end day, when UTC is already past it', () => {
    const now = at(2026, 6, 12, 23, 59)
    expect(now.toISOString()).toBe('2026-06-13T06:59:00.000Z')
    expect(tripPhase(trip(), now)).toBe('live')
  })
})

describe('tripPhase east of UTC (Asia/Tokyo)', () => {
  useTz('Asia/Tokyo')

  it('starts the trip at local midnight, while UTC is still on the day before', () => {
    const now = at(2026, 6, 10, 0, 0)
    expect(now.toISOString()).toBe('2026-06-09T15:00:00.000Z')
    expect(tripPhase(trip(), now)).toBe('live')
  })

  it('wraps at local midnight after the end day, while UTC is still on the end day', () => {
    const now = at(2026, 6, 13, 0, 0)
    expect(now.toISOString()).toBe('2026-06-12T15:00:00.000Z')
    expect(tripPhase(trip(), now)).toBe('wrap')
  })
})

describe('tripPhase countdown across a DST change (Europe/Lisbon)', () => {
  useTz('Europe/Lisbon')

  it('counts calendar days, not 24-hour blocks', () => {
    // Clocks go back on 25 Oct 2026, so that week has a 25-hour day
    const t = trip({ startDate: '2026-10-30T00:00:00.000Z', endDate: '2026-11-01T00:00:00.000Z' })
    expect(tripPhase(t, at(2026, 10, 22, 0, 0))).toBe('planning')
    expect(tripPhase(t, at(2026, 10, 23, 0, 0))).toBe('countdown')
  })
})

describe('tripPhase Setup', () => {
  useTz('UTC')
  const farOut = at(2026, 5, 11, 9, 0) // 30 days before the start

  it('is Setup with no itinerary and one member (§9 criterion 6)', () => {
    expect(tripPhase(trip({ itinerary: [], members: [active] }), farOut)).toBe('setup')
  })

  it('is Setup with no itinerary items, even with a group', () => {
    expect(tripPhase(trip({ itinerary: [] }), farOut)).toBe('setup')
  })

  it('is Setup with a plan but fewer than 2 active members', () => {
    expect(tripPhase(trip({ members: [active] }), farOut)).toBe('setup')
  })

  it('does not count invited or removed members as active', () => {
    expect(tripPhase(trip({ members: [active, pending, { status: 'removed' }] }), farOut)).toBe('setup')
  })

  it('is Planning with a plan and 2 active members', () => {
    expect(tripPhase(trip(), farOut)).toBe('planning')
  })

  it('handles missing itinerary and members arrays', () => {
    expect(tripPhase({ startDate: START, endDate: END }, farOut)).toBe('setup')
  })

  it('gives way to the calendar: a 1-member trip starting tomorrow is Countdown', () => {
    expect(tripPhase(trip({ itinerary: [], members: [active] }), at(2026, 6, 9, 9, 0))).toBe('countdown')
  })

  it('gives way to the calendar: a 1-member trip is Live and then Wrap', () => {
    const solo = trip({ itinerary: [], members: [active] })
    expect(tripPhase(solo, at(2026, 6, 10, 0, 0))).toBe('live')
    expect(tripPhase(solo, at(2026, 6, 13, 0, 0))).toBe('wrap')
  })
})

describe('tripPhase without a start date', () => {
  useTz('UTC')
  const now = at(2026, 6, 10, 12, 0)

  it('is Setup or Planning by the Setup rule, never a date phase', () => {
    expect(tripPhase(trip({ startDate: undefined, endDate: undefined }), now)).toBe('planning')
    expect(tripPhase(trip({ startDate: undefined, members: [active] }), now)).toBe('setup')
    expect(isTripLive(undefined, END, now)).toBe(false)
  })
})

describe('tripPhase with an end date before the start', () => {
  useTz('UTC')

  it('treats the trip as one day long', () => {
    const t = trip({ endDate: '2026-06-01T00:00:00.000Z' })
    expect(tripPhase(t, at(2026, 6, 10, 12, 0))).toBe('live')
    expect(tripPhase(t, at(2026, 6, 11, 0, 0))).toBe('wrap')
  })
})

describe('tripPhase default now', () => {
  it('uses the current time when now is omitted', () => {
    expect(tripPhase(trip({ startDate: '2000-01-01T00:00:00.000Z', endDate: '2000-01-02T00:00:00.000Z' }))).toBe('wrap')
  })
})

import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { groupByDay, nowAndNext } from './itineraryDays'

const START = '2026-11-24T00:00:00.000Z'
const originalTz = process.env.TZ

beforeEach(() => {
  process.env.TZ = 'Europe/Madrid'
})
afterEach(() => {
  process.env.TZ = originalTz
})

// Local wall-clock times in Madrid
const at = (d: number, h: number, m = 0) => new Date(2026, 10, d, h, m).toISOString()

describe('groupByDay', () => {
  it('groups stops under their day in chronological order (AC11)', () => {
    const items = [
      { id: 'c', time: at(26, 10) },
      { id: 'a', time: at(24, 9, 40) },
      { id: 'b', time: at(24, 15) },
      { id: 'd', time: at(25, 13) },
    ]
    const groups = groupByDay(items, START, new Date(2026, 10, 1))
    expect(groups.map((g) => [g.dayNumber, g.items.map((i) => i.id)])).toEqual([
      [1, ['a', 'b']],
      [2, ['d']],
      [3, ['c']],
    ])
    expect(groups.some((g) => g.isToday)).toBe(false)
  })

  it('marks today during the trip (AC12)', () => {
    const items = [{ time: at(24, 9) }, { time: at(25, 13) }]
    const groups = groupByDay(items, START, new Date(2026, 10, 25, 8))
    expect(groups.map((g) => g.isToday)).toEqual([false, true])
  })

  it('reads a late-evening stop as that local day, not the UTC day', () => {
    const groups = groupByDay([{ time: at(24, 23, 30) }], START, new Date(2026, 10, 1))
    expect(groups[0].day).toBe('2026-11-24')
    expect(groups[0].dayNumber).toBe(1)
  })

  it('gives no day number to stops before the trip starts', () => {
    const groups = groupByDay([{ time: at(23, 18) }], START, new Date(2026, 10, 1))
    expect(groups[0].dayNumber).toBeNull()
  })
})

describe('nowAndNext', () => {
  const items = [
    { id: 'market', time: at(25, 13) },
    { id: 'palace', time: at(25, 15, 30) },
    { id: 'dinner', time: at(25, 20, 30) },
    { id: 'tomorrow', time: at(26, 9) },
  ]

  it('finds the current and next stop today (AC8)', () => {
    const r = nowAndNext(items, new Date(2026, 10, 25, 14))
    expect(r.now?.id).toBe('market')
    expect(r.next?.id).toBe('palace')
  })

  it('has no current stop before the first one starts', () => {
    const r = nowAndNext(items, new Date(2026, 10, 25, 9))
    expect(r.now).toBeNull()
    expect(r.next?.id).toBe('market')
  })

  it('has no next stop after the last one today', () => {
    const r = nowAndNext(items, new Date(2026, 10, 25, 22))
    expect(r.now?.id).toBe('dinner')
    expect(r.next).toBeNull()
  })
})

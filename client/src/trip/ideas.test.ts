import { describe, expect, it } from 'vitest'
import { chunkIdeas } from './ideas'

describe('chunkIdeas', () => {
  it('starts a card at each heading and cleans markdown', () => {
    const raw = `#### Getting there
- **Train**: AVE from Sants, 2h30
- Flight: 1h10

#### Getting around
Metro card *T-10* works on buses too`
    expect(chunkIdeas(raw)).toEqual([
      { title: 'Getting there', lines: ['Train: AVE from Sants, 2h30', 'Flight: 1h10'] },
      { title: 'Getting around', lines: ['Metro card T-10 works on buses too'] },
    ])
  })

  it('treats "Option A:" and whole-line bold as headings', () => {
    const raw = `Option A: Train
Fast and central
**Where to eat**
Mercado de San Miguel`
    expect(chunkIdeas(raw).map((c) => c.title)).toEqual(['Option A: Train', 'Where to eat'])
  })

  it('keeps text before the first heading as an untitled card', () => {
    expect(chunkIdeas('Madrid is walkable.\n### Tips\nBook the Prado')).toEqual([
      { title: '', lines: ['Madrid is walkable.'] },
      { title: 'Tips', lines: ['Book the Prado'] },
    ])
  })

  it('returns nothing for empty input', () => {
    expect(chunkIdeas('')).toEqual([])
    expect(chunkIdeas(null)).toEqual([])
  })
})

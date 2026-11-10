export interface IdeaCard {
  title: string
  lines: string[]
}

/** Strip the markdown the model writes: heading marks, bold/italic stars, bullets and code ticks */
function clean(line: string): string {
  return line
    .trim()
    .replace(/^#+\s*/, '')
    .replace(/\*\*/g, '')
    .replace(/\*/g, '')
    .replace(/^[-•]\s*/, '')
    .replace(/^\d+[.)]\s+/, '')
    .replace(/`/g, '')
    .trim()
}

function isHeading(line: string): boolean {
  const t = line.trim()
  return (
    /^#{1,6}\s/.test(t) ||
    /^Option\s+[A-Z0-9]+:/i.test(t) ||
    // A whole line in bold, e.g. "**Getting around**"
    /^\*\*[^*]+\*\*:?$/.test(t)
  )
}

/**
 * Splits the AI travel-suggestions essay into cards (spec 004 section 7.7: "chunked into cards").
 * Each heading starts a card; text before the first heading becomes an untitled intro card.
 */
export function chunkIdeas(raw: string | null | undefined): IdeaCard[] {
  if (!raw) return []
  const cards: IdeaCard[] = []
  let current: IdeaCard | null = null
  for (const line of raw.split('\n')) {
    if (!line.trim()) continue
    if (isHeading(line)) {
      current = { title: clean(line).replace(/:$/, ''), lines: [] }
      cards.push(current)
      continue
    }
    if (!current) {
      current = { title: '', lines: [] }
      cards.push(current)
    }
    const text = clean(line)
    if (text) current.lines.push(text)
  }
  return cards.filter((c) => c.title || c.lines.length > 0)
}

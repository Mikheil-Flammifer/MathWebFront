const COLUMN_WIDTH = 200
const ROW_HEIGHT = 150
const PADDING_X = 70
const PADDING_Y = 70

// Places each quest in a column = its distance from a root quest (no prerequisites),
// so the graph always flows left → right as prerequisites are completed.
export function layoutQuestGraph(quests = []) {
  const byId = new Map(quests.map((q) => [q.id, q]))
  const levelCache = new Map()

  const computeLevel = (id, seen = new Set()) => {
    if (levelCache.has(id)) return levelCache.get(id)
    if (seen.has(id)) return 0 // guards against bad/cyclic data
    seen.add(id)
    const prereqs = byId.get(id)?.prerequisiteQuestIds || []
    const level = prereqs.length === 0
      ? 0
      : 1 + Math.max(...prereqs.map((pid) => (byId.has(pid) ? computeLevel(pid, seen) : 0)))
    levelCache.set(id, level)
    return level
  }
  quests.forEach((q) => computeLevel(q.id))

  const columns = new Map()
  quests.forEach((q) => {
    const level = levelCache.get(q.id)
    if (!columns.has(level)) columns.set(level, [])
    columns.get(level).push(q)
  })
  columns.forEach((col) => col.sort((a, b) => (a.orderIndex ?? a.id) - (b.orderIndex ?? b.id)))

  const positions = new Map()
  let maxRows = 0
  columns.forEach((col, level) => {
    maxRows = Math.max(maxRows, col.length)
    col.forEach((q, row) => {
      positions.set(q.id, { x: PADDING_X + level * COLUMN_WIDTH, y: PADDING_Y + row * ROW_HEIGHT })
    })
  })

  const edges = []
  quests.forEach((q) => {
    (q.prerequisiteQuestIds || []).forEach((pid) => {
      if (positions.has(pid) && positions.has(q.id)) {
        edges.push({ from: positions.get(pid), to: positions.get(q.id), fromId: pid, toId: q.id })
      }
    })
  })

  return {
    positions,
    edges,
    width: Math.max(PADDING_X * 2 + (columns.size - 1) * COLUMN_WIDTH + 60, 500),
    height: Math.max(PADDING_Y * 2 + (maxRows - 1) * ROW_HEIGHT + 80, 320),
  }
}
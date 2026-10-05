// Same key for a-b and b-a (edges are undirected)
export const edgeKey = (a, b) => (a < b ? `${a}-${b}` : `${b}-${a}`)

// Problem ids that can't be reached from any start node
export function findUnreachable(nodes, edges) {
  const adj = new Map(nodes.map((n) => [n.problemId, []]))
  edges.forEach((e) => {
    adj.get(e.from)?.push(e.to)
    adj.get(e.to)?.push(e.from)
  })

  const queue = nodes.filter((n) => n.start).map((n) => n.problemId)
  const seen = new Set(queue)

  while (queue.length) {
    const current = queue.shift()
    for (const next of adj.get(current) || []) {
      if (!seen.has(next)) {
        seen.add(next)
        queue.push(next)
      }
    }
  }
  return nodes.filter((n) => !seen.has(n.problemId)).map((n) => n.problemId)
}

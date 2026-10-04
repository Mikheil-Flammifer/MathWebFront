export function computeMapLayout(nodes, padding = 90) {
  if (!nodes.length) {
    return { viewBox: '0 0 800 500', width: 800, height: 500 }
  }
  const xs = nodes.map((n) => n.x)
  const ys = nodes.map((n) => n.y)
  const minX = Math.min(...xs) - padding
  const minY = Math.min(...ys) - padding
  const width = Math.max(Math.max(...xs) - Math.min(...xs) + padding * 2, 400)
  const height = Math.max(Math.max(...ys) - Math.min(...ys) + padding * 2, 300)
  return { viewBox: `${minX} ${minY} ${width} ${height}`, width, height }
}
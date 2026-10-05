import { useRef } from 'react'
import { getCategoryTheme } from '../../utils/constants'
import { edgeKey } from '../../utils/mapEditor'

export const GRID = 20
const R = 24
const MARGIN = R + 10

function snap(v) {
  return Math.round(v / GRID) * GRID
}

function toSvgPoint(svg, e) {
  const pt = svg.createSVGPoint()
  pt.x = e.clientX
  pt.y = e.clientY
  const p = pt.matrixTransform(svg.getScreenCTM().inverse())
  return { x: p.x, y: p.y }
}

export default function EditorCanvas({
  nodes, edges, width, height,
  mode, selectedId, selectedEdgeKey, linkFromId, unreachable,
  onSelectNode, onSelectEdge, onClearSelection, onMove, onLinkPick,
}) {
  const svgRef = useRef(null)
  const dragRef = useRef(null)

  const byId = new Map(nodes.map((n) => [n.problemId, n]))
  const linkMode = mode === 'link'

  const handleDown = (e, node) => {
    e.stopPropagation()
    if (linkMode) {
      onLinkPick(node.problemId)
      return
    }
    e.currentTarget.setPointerCapture(e.pointerId)
    const p = toSvgPoint(svgRef.current, e)
    dragRef.current = { id: node.problemId, dx: p.x - node.x, dy: p.y - node.y }
    onSelectNode(node.problemId)
  }

  const handleMove = (e, node) => {
    const drag = dragRef.current
    if (!drag || drag.id !== node.problemId) return
    const p = toSvgPoint(svgRef.current, e)
    const x = Math.min(Math.max(snap(p.x - drag.dx), MARGIN), width - MARGIN)
    const y = Math.min(Math.max(snap(p.y - drag.dy), MARGIN), height - MARGIN)
    if (x !== node.x || y !== node.y) onMove(node.problemId, x, y)
  }

  const handleUp = (e) => {
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId)
    }
    dragRef.current = null
  }

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${width} ${height}`}
      className="w-full rounded-lg"
      style={{ touchAction: 'none', background: 'rgba(15,23,42,0.6)' }}
      onPointerDown={onClearSelection}
    >
      <defs>
        <pattern id="editor-grid" width={GRID} height={GRID} patternUnits="userSpaceOnUse">
          <path d={`M ${GRID} 0 L 0 0 0 ${GRID}`} fill="none" stroke="#1e293b" strokeWidth="1" />
        </pattern>
      </defs>
      <rect width={width} height={height} fill="url(#editor-grid)" />

      {edges.map((e) => {
        const a = byId.get(e.from)
        const b = byId.get(e.to)
        if (!a || !b) return null
        const key = edgeKey(e.from, e.to)
        const selected = key === selectedEdgeKey
        return (
          <g key={key}>
            <line
              x1={a.x} y1={a.y} x2={b.x} y2={b.y}
              stroke={selected ? '#f87171' : '#64748b'}
              strokeWidth={selected ? 5 : 3}
              strokeLinecap="round"
            />
            {/* wide invisible line so thin links are easy to click */}
            <line
              x1={a.x} y1={a.y} x2={b.x} y2={b.y}
              stroke="transparent" strokeWidth="18"
              style={{ cursor: 'pointer' }}
              onPointerDown={(ev) => {
                ev.stopPropagation()
                onSelectEdge(key)
              }}
            />
          </g>
        )
      })}

      {nodes.map((n) => {
        const theme = getCategoryTheme(n.mainCategoryName)
        const selected = n.problemId === selectedId
        const isLinkFrom = n.problemId === linkFromId
        const isUnreachable = unreachable.includes(n.problemId)
        return (
          <g
            key={n.problemId}
            transform={`translate(${n.x} ${n.y})`}
            style={{ cursor: linkMode ? 'crosshair' : 'grab' }}
            onPointerDown={(e) => handleDown(e, n)}
            onPointerMove={(e) => handleMove(e, n)}
            onPointerUp={handleUp}
            onPointerCancel={handleUp}
          >
            {selected && <circle r={R + 7} fill="none" stroke="#fff" strokeWidth="2" />}
            {isLinkFrom && <circle r={R + 7} fill="none" stroke="#fbbf24" strokeWidth="3" />}
            {isUnreachable && (
              <circle r={R + 5} fill="none" stroke="#f87171" strokeWidth="2" strokeDasharray="4 3" />
            )}
            {n.start && (
              <circle r={R + 4} fill="none" stroke="#fff" strokeDasharray="3 4" strokeOpacity="0.8" />
            )}
            <circle r={R} fill={`${theme.color}33`} stroke={theme.color} strokeWidth="3" />
            <text textAnchor="middle" y="5" fontSize="14" fill="#e2e8f0" style={{ userSelect: 'none' }}>
              {n.problemId}
            </text>
            {n.start && (
              <text textAnchor="middle" y={-R - 10} fontSize="11" fill="#e2e8f0" style={{ userSelect: 'none' }}>
                START
              </text>
            )}
          </g>
        )
      })}
    </svg>
  )
}
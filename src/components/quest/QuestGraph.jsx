import { useMemo } from 'react'
import MapNode from './MapNode'
import { NODE_STATUS } from '../../utils/constants'
import { computeMapLayout } from '../../utils/mapLayout'

export default function QuestGraph({ nodes, edges, selectedId, onSelect }) {
  const byId = useMemo(() => {
    const m = new Map()
    nodes.forEach((n) => m.set(n.problemId, n))
    return m
  }, [nodes])

  const { viewBox } = useMemo(() => computeMapLayout(nodes), [nodes])

  return (
    <svg viewBox={viewBox} className="w-full h-[70vh] min-h-[420px]" preserveAspectRatio="xMidYMid meet">
      {edges.map((e, i) => {
        const a = byId.get(e.from)
        const b = byId.get(e.to)
        if (!a || !b) return null
        const lit = a.status === NODE_STATUS.SOLVED || b.status === NODE_STATUS.SOLVED
        return (
          <line
            key={`${e.from}-${e.to}-${i}`}
            x1={a.x} y1={a.y} x2={b.x} y2={b.y}
            stroke={lit ? '#a78bfa' : '#334155'}
            strokeWidth={lit ? 3 : 2}
            strokeDasharray={lit ? undefined : '6 6'}
            strokeLinecap="round"
          />
        )
      })}

      {nodes.map((n) => (
        <MapNode
          key={n.problemId}
          node={n}
          selected={n.problemId === selectedId}
          onSelect={onSelect}
        />
      ))}
    </svg>
  )
}
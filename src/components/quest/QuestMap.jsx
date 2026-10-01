import { useMemo } from 'react'
import { layoutQuestGraph } from '../layout/questLayout'
import QuestNode from './QuestNode'

function edgePath(from, to) {
  const x1 = from.x + 32, y1 = from.y
  const x2 = to.x - 32, y2 = to.y
  const midX = (x1 + x2) / 2
  return `M ${x1} ${y1} C ${midX} ${y1}, ${midX} ${y2}, ${x2} ${y2}`
}

export default function QuestMap({ quests, onSelect }) {
  const { positions, edges, width, height } = useMemo(() => layoutQuestGraph(quests), [quests])

  return (
    <div className="overflow-x-auto overflow-y-hidden rounded-xl border border-space-500 bg-space-800/50 bg-grid">
      <svg width={width} height={height} className="block" style={{ minWidth: '100%' }}>
        {edges.map(({ from, to, fromId, toId }) => {
          const target = quests.find((q) => q.id === toId)
          const unlocked = quests.find((q) => q.id === fromId)?.status === 'COMPLETED'
          return (
            <path
              key={`${fromId}-${toId}`}
              d={edgePath(from, to)}
              fill="none"
              stroke={unlocked ? '#6366f1' : '#2a3f5f'}
              strokeWidth={2.5}
              strokeDasharray={target?.status === 'LOCKED' ? '5 5' : undefined}
            />
          )
        })}
        {quests.map((q) => {
          const pos = positions.get(q.id)
          return pos ? <QuestNode key={q.id} quest={q} x={pos.x} y={pos.y} onSelect={onSelect} /> : null
        })}
      </svg>
    </div>
  )
}
import { Lock, Star, Flame, CheckCircle2 } from 'lucide-react'
import { DIFFICULTY_LEVELS } from '../../utils/constants'

const STATUS_ICON = { LOCKED: Lock, AVAILABLE: Star, IN_PROGRESS: Flame, COMPLETED: CheckCircle2 }
const STATUS_RING = {
  LOCKED:      'border-space-400 text-chalk-500 bg-space-700',
  AVAILABLE:   'border-sky-400/50 text-sky-400 bg-sky-400/10',
  IN_PROGRESS: 'border-amber-400/60 text-amber-400 bg-amber-400/10 animate-pulse-glow',
  COMPLETED:   'border-emerald-400/60 text-emerald-400 bg-emerald-400/10',
}

export default function QuestNode({ quest, x, y, onSelect }) {
  const Icon = STATUS_ICON[quest.status] || Star
  const ring = STATUS_RING[quest.status] || STATUS_RING.LOCKED
  const diff = DIFFICULTY_LEVELS[quest.difficulty]
  const locked = quest.status === 'LOCKED'

  return (
    <foreignObject x={x - 55} y={y - 32} width={110} height={130} style={{ overflow: 'visible' }}>
      <button
        onClick={() => !locked && onSelect(quest.id)}
        disabled={locked}
        title={locked ? 'Complete the previous quest to unlock' : quest.title}
        className={`w-full flex flex-col items-center gap-2 group ${locked ? 'cursor-not-allowed' : 'cursor-pointer'}`}
      >
        <span className={`w-16 h-16 rounded-2xl border-2 grid place-items-center transition-transform ${ring} ${!locked ? 'group-hover:scale-110' : ''}`}>
          <Icon size={24} />
        </span>
        <span className={`text-xs font-medium text-center line-clamp-2 leading-tight ${locked ? 'text-chalk-600' : 'text-chalk-200'}`}>
          {quest.title}
        </span>
        {diff && <span className={`badge ${diff.badge} !py-0 !text-[10px]`}>{diff.label}</span>}
      </button>
    </foreignObject>
  )
}
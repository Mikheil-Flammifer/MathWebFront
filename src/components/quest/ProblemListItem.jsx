import { CheckCircle2, Lock, ChevronRight } from 'lucide-react'
import { getDifficultyInfo } from '../../utils/helpers'

export default function ProblemListItem({ problem, index, locked, onClick }) {
  const diff = getDifficultyInfo(problem.difficultyLevel)

  return (
    <div
      onClick={() => !locked && onClick(problem.id)}
      className={locked ? 'problem-row opacity-50' : 'problem-row-clickable'}
    >
      <span className={`w-9 h-9 rounded-lg grid place-items-center font-display font-semibold text-sm shrink-0
        ${problem.solved ? 'bg-emerald-500/15 text-emerald-400' : locked ? 'bg-space-600 text-chalk-600' : 'bg-plasma-500/15 text-plasma-300'}`}>
        {problem.solved ? <CheckCircle2 size={18} /> : locked ? <Lock size={14} /> : index + 1}
      </span>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-chalk-100 truncate">{problem.questionText}</p>
        <div className="flex items-center gap-2 mt-1">
          <span className={`badge ${diff.badge} !py-0 !text-[10px]`}>{diff.label}</span>
          <span className="text-xs text-chalk-500">+{problem.xpReward ?? 0} XP</span>
        </div>
      </div>

      {!locked && <ChevronRight size={18} className="text-chalk-600 shrink-0" />}
    </div>
  )
}
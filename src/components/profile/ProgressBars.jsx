import { DIFFICULTY_LEVELS } from '../../utils/constants'

const ORDER = Object.keys(DIFFICULTY_LEVELS)

export default function ProgressBars({ progress = [] }) {
  const byDifficulty = Object.fromEntries(progress.map((p) => [p.difficulty, p]))

  return (
    <div className="space-y-4">
      {ORDER.map((key) => {
        const info = DIFFICULTY_LEVELS[key]
        const p = byDifficulty[key]
        const total = p?.totalProblems ?? 0
        const solved = p?.solvedProblems ?? 0
        const pct = total > 0 ? Math.round((solved / total) * 100) : 0

        return (
          <div key={key}>
            <div className="flex items-center justify-between mb-1.5">
              <span className={`badge ${info.badge}`}>{info.label}</span>
              <span className="text-xs text-chalk-500 font-mono">{solved}/{total}</span>
            </div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${pct}%` }} />
            </div>
          </div>
        )
      })}
    </div>
  )
}
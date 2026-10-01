import { useParams, useNavigate, Link } from 'react-router-dom'
import { Lock, Trophy, AlertTriangle, ArrowLeft } from 'lucide-react'
import useQuestDetail from '../../hooks/useQuestDetail'
import ProblemListItem from '../../components/quest/ProblemListItem'
import EmptyState from '../../components/common/EmptyState'
import { getDifficultyInfo } from '../../utils/helpers'

export default function QuestDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { data: quest, isLoading, isError } = useQuestDetail(id)

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto space-y-5">
        <div className="h-24 skeleton rounded-xl" />
        {Array.from({ length: 4 }, (_, i) => <div key={i} className="h-16 skeleton rounded-xl" />)}
      </div>
    )
  }

  if (isError || !quest) {
    return <EmptyState icon={AlertTriangle} title="Quest not found" subtitle="It may have been removed or the link is incorrect." />
  }

  const locked = quest.status === 'LOCKED'
  const diff = getDifficultyInfo(quest.difficultyLevel)
  const problems = quest.problems ?? []
  const solvedCount = problems.filter((p) => p.solved).length
  const progressPct = problems.length ? Math.round((solvedCount / problems.length) * 100) : 0

  return (
    <div className="max-w-3xl mx-auto">
      <Link to="/quests" className="inline-flex items-center gap-1.5 text-sm text-chalk-400 hover:text-chalk-100 mb-5">
        <ArrowLeft size={15} /> Back to Quest Map
      </Link>

      <div className="card mb-6">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-plasma-500/15 border border-plasma-500/30 grid place-items-center text-plasma-300 shrink-0">
            <Trophy size={24} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <h1 className="text-2xl font-semibold font-display text-chalk-50">{quest.title}</h1>
              <span className={`badge ${diff.badge}`}>{diff.label}</span>
            </div>
            <p className="text-sm text-chalk-400">{quest.description}</p>
          </div>
        </div>

        {locked ? (
          <div className="alert-info mt-5">
            <Lock size={16} className="mt-0.5 shrink-0" />
            Complete the prerequisite quest(s) on the map to unlock this one.
          </div>
        ) : (
          <div className="mt-5">
            <div className="flex items-center justify-between mb-1.5 text-sm">
              <span className="text-chalk-400">{solvedCount} of {problems.length} problems solved</span>
              <span className="text-chalk-500 font-mono">{progressPct}%</span>
            </div>
            <div className="progress-bar">
              <div className="progress-fill-success" style={{ width: `${progressPct}%` }} />
            </div>
          </div>
        )}
      </div>

      {problems.length === 0 ? (
        <EmptyState icon={Trophy} title="No problems yet" subtitle="Check back soon." />
      ) : (
        <div className="space-y-2.5">
          {problems.map((p, i) => (
            <ProblemListItem
              key={p.id}
              problem={p}
              index={i}
              locked={locked}
              onClick={(problemId) => navigate(`/quests/${id}/problems/${problemId}`)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
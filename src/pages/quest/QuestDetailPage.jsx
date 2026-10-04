import { useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { ArrowLeft } from 'lucide-react'
import { useQuestMap } from '../../hooks/useQuestMap'
import QuestGraph from '../../components/quest/QuestGraph'
import { NODE_STATUS, getCategoryTheme } from '../../utils/constants'
import { useCooldown } from '../../hooks/useCooldown'
import { formatCountdown } from '../../utils/helpers'

function NodePanel({ node, onOpen }) {
  const { remaining, active: cooling } = useCooldown(node.retryAvailableAt)
  const theme = getCategoryTheme(node.mainCategoryName)
  const locked = node.status === NODE_STATUS.LOCKED

  return (
    <div className="card p-4 flex flex-wrap items-center justify-between gap-4">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="inline-block w-3 h-3 rounded-full" style={{ background: theme.color }} />
          <span className="font-semibold">{node.mainCategoryName}</span>
          {node.categoryName && node.categoryName !== node.mainCategoryName && (
            <span className="text-sm opacity-70">· {node.categoryName}</span>
          )}
        </div>
        <p className="text-sm opacity-80">
          {node.xpReward} XP · Attempts {node.attemptsUsed}/{node.maxAttempts} ·{' '}
          {node.status === NODE_STATUS.SOLVED ? 'Solved' : locked ? 'Locked' : 'Open'}
        </p>
        {cooling && (
          <p className="text-sm text-red-300 mt-1">
            Cooling down — retry in {formatCountdown(remaining)}
          </p>
        )}
        {locked && (
          <p className="text-sm opacity-70 mt-1">
            Solve a neighbouring location to unlock this one.
          </p>
        )}
      </div>
      <button className="btn-primary" disabled={locked} onClick={() => onOpen(node)}>
        {node.status === NODE_STATUS.SOLVED ? 'Review' : 'Open problem'}
      </button>
    </div>
  )
}

export default function QuestDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { data, isLoading, isError, error } = useQuestMap(id)
  const [selectedId, setSelectedId] = useState(null)

  if (isLoading) return <div className="p-8 opacity-70">Loading map…</div>

  if (isError) {
    return (
      <div className="p-8">
        <p className="mb-2">Couldn’t load this map.</p>
        <p className="text-sm opacity-70">{error?.response?.data?.message || error.message}</p>
      </div>
    )
  }

  const selected = data.nodes.find((n) => n.problemId === selectedId) || null

  const openProblem = (node) => {
    if (node.status === NODE_STATUS.LOCKED) {
      toast('Solve a neighbouring location first')
      return
    }
    navigate(`/problems/${node.problemId}`)
  }

  return (
    <div className="space-y-4">
      <Link to="/quests" className="inline-flex items-center gap-1 text-sm opacity-80 hover:opacity-100">
        <ArrowLeft size={16} /> All quests
      </Link>

      <div>
        <h1 className="text-2xl font-bold">{data.title}</h1>
        <p className="text-sm opacity-70">{data.difficultyLevel}</p>
      </div>

      {data.questUnlocked === false ? (
        <div className="card p-6">This quest is locked. Complete its prerequisites first.</div>
      ) : data.nodes.length === 0 ? (
        <div className="card p-6">This map has no locations yet.</div>
      ) : (
        <>
          <div className="card p-2">
            <QuestGraph
              nodes={data.nodes}
              edges={data.edges}
              selectedId={selectedId}
              onSelect={(n) => setSelectedId(n.problemId)}
            />
          </div>
          {selected && <NodePanel node={selected} onOpen={openProblem} />}
        </>
      )}
    </div>
  )
}
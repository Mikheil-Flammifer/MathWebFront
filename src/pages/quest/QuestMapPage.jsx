import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import {
  AlertTriangle, Map as MapIcon, Lock, Star, Flame, CheckCircle2, MapPin, PlayCircle,
} from 'lucide-react'
import useQuests from '../../hooks/useQuests'
import EmptyState from '../../components/common/EmptyState'
import { DIFFICULTY_LEVELS, QUEST_STATUS } from '../../utils/constants'

const LEVEL_KEYS = Object.keys(DIFFICULTY_LEVELS)

// Icons can't live in constants.js (they're components), so they stay here
const STATUS_ICON = {
  LOCKED: Lock,
  AVAILABLE: Star,
  IN_PROGRESS: Flame,
  COMPLETED: CheckCircle2,
}

function QuestCard({ quest, onOpen }) {
  const statusKey = QUEST_STATUS[quest.userStatus] ? quest.userStatus : 'AVAILABLE'
  const status = QUEST_STATUS[statusKey]
  const StatusIcon = STATUS_ICON[statusKey]
  const locked = statusKey === 'LOCKED'
  const solved = quest.userProblemsSolved ?? 0
  const percent = Math.max(0, Math.min(100, quest.userProgressPercentage ?? 0))

  return (
    <button
      type="button"
      onClick={() => onOpen(quest)}
      className={`card p-4 text-left space-y-3 transition ${
        locked ? 'opacity-60 cursor-not-allowed' : 'hover:-translate-y-0.5'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-semibold text-lg leading-tight">{quest.title}</h3>
        <span className={`badge ${status.badge} shrink-0 inline-flex items-center gap-1.5`}>
          <StatusIcon size={13} /> {status.label}
        </span>
      </div>

      {quest.description && (
        <p className="text-sm text-chalk-400 line-clamp-2">{quest.description}</p>
      )}

      <div className="flex items-center gap-4 text-xs text-chalk-400">
        <span className="flex items-center gap-1">
          <MapPin size={13} /> {quest.totalProblems} locations
        </span>
        {quest.totalVideos > 0 && (
          <span className="flex items-center gap-1">
            <PlayCircle size={13} /> {quest.totalVideos} videos
          </span>
        )}
      </div>

      <div>
        <div className="h-2 rounded-full bg-white/10 overflow-hidden">
          <div
            className="h-full rounded-full bg-emerald-400 transition-all"
            style={{ width: `${percent}%` }}
          />
        </div>
        <p className="text-xs text-chalk-500 mt-1">
          {solved}/{quest.totalProblems} solved
        </p>
      </div>
    </button>
  )
}

export default function QuestMapPage() {
  const navigate = useNavigate()
  const { data: quests, isLoading, isError } = useQuests()

  const groups = useMemo(() => {
    const list = (quests || []).filter((q) => (q.totalProblems ?? 0) > 0)
    return LEVEL_KEYS
      .map((key) => ({
        key,
        info: DIFFICULTY_LEVELS[key],
        quests: list.filter((q) => q.difficultyLevel === key),
      }))
      .filter((g) => g.quests.length > 0)
  }, [quests])

  const openQuest = (quest) => {
    if (quest.userStatus === 'LOCKED') {
      toast('Complete the prerequisite quests first')
      return
    }
    navigate(`/quests/${quest.id}`)
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="page-title">Quests</h1>
        <p className="text-chalk-400 mt-1">
          Pick a map, then solve problems to open the neighbouring locations.
        </p>
      </div>

      {isLoading ? (
        <div className="h-96 skeleton rounded-xl" />
      ) : isError ? (
        <EmptyState
          icon={AlertTriangle}
          title="Couldn't load quests"
          subtitle="Check that the backend is running and try again."
        />
      ) : groups.length === 0 ? (
        <EmptyState
          icon={MapIcon}
          title="No quests yet"
          subtitle="Check back soon for new challenges."
        />
      ) : (
        <div className="space-y-8">
          {groups.map((group) => (
            <section key={group.key}>
              <h2 className="flex items-center gap-3 text-lg font-semibold mb-3">
                <span className={group.info.badge}>Level {group.info.level}</span>
                <span>{group.info.label}</span>
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {group.quests.map((quest) => (
                  <QuestCard key={quest.id} quest={quest} onOpen={openQuest} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  )
}
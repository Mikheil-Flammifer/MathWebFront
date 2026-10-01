import { useNavigate } from 'react-router-dom'
import { AlertTriangle, Map as MapIcon, Lock, Star, Flame, CheckCircle2 } from 'lucide-react'
import useQuests from '../../hooks/useQuests'
import QuestMap from '../../components/quest/QuestMap'
import EmptyState from '../../components/common/EmptyState'

const LEGEND = [
  { icon: Lock,         label: 'Locked',      cls: 'text-chalk-500' },
  { icon: Star,         label: 'Available',   cls: 'text-sky-400' },
  { icon: Flame,        label: 'In progress', cls: 'text-amber-400' },
  { icon: CheckCircle2, label: 'Completed',   cls: 'text-emerald-400' },
]

export default function QuestMapPage() {
  const navigate = useNavigate()
  const { data: quests, isLoading, isError } = useQuests()

  return (
    <div>
      <div className="mb-6">
        <h1 className="page-title">Quest Map</h1>
        <p className="text-chalk-400 mt-1">Complete quests in order to unlock the next challenge.</p>
      </div>

      {isLoading ? (
        <div className="h-96 skeleton rounded-xl" />
      ) : isError ? (
        <EmptyState icon={AlertTriangle} title="Couldn't load quests" subtitle="Check that the backend is running and try again." />
      ) : !quests?.length ? (
        <EmptyState icon={MapIcon} title="No quests yet" subtitle="Check back soon for new challenges." />
      ) : (
        <>
          <QuestMap quests={quests} onSelect={(id) => navigate(`/quests/${id}`)} />
          <div className="flex flex-wrap gap-4 mt-4 text-xs">
            {LEGEND.map(({ icon: Icon, label, cls }) => (
              <span key={label} className={`flex items-center gap-1.5 ${cls}`}>
                <Icon size={13} /> {label}
              </span>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
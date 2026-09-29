import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Flame, CheckCircle2, PlayCircle, Trophy, Crown, Mail, Calendar } from 'lucide-react'
import useAuthStore from '../../store/authStore'
import { useStats, useProgress } from '../../hooks/useProfileData'
import AvatarUpload from '../../components/profile/AvatarUpload'
import StatCard from '../../components/profile/StatCard'
import ProgressBars from '../../components/profile/ProgressBars'
import EditProfileForm from '../../components/profile/EditProfileForm'
import ChangePasswordForm from '../../components/profile/ChangePasswordForm'
import { getFullName, formatDate } from '../../utils/helpers'

const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'edit',      label: 'Edit Profile' },
  { id: 'security',  label: 'Security' },
]

export default function ProfilePage() {
  const user = useAuthStore((s) => s.user)
  const [tab, setTab] = useState('overview')
  const { data: stats, isLoading: statsLoading } = useStats()
  const { data: progress, isLoading: progressLoading } = useProgress()

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="card flex flex-col sm:flex-row items-start sm:items-center gap-5">
        <AvatarUpload />
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2.5 mb-1.5">
            <h1 className="text-2xl font-semibold font-display text-chalk-50">{getFullName(user)}</h1>
            <span className="badge-plasma">{user?.role}</span>
            {user?.hasActiveSubscription && <span className="badge-success"><Crown size={11} /> Premium</span>}
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-chalk-400">
            <span className="flex items-center gap-1.5"><Mail size={13} /> {user?.email}</span>
            <span className="flex items-center gap-1.5"><Calendar size={13} /> Joined {formatDate(user?.createdAt)}</span>
          </div>
        </div>
        {!user?.hasActiveSubscription && (
          <Link to="/subscribe" className="btn-primary shrink-0"><Crown size={16} /> Go Premium</Link>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-space-500">
        {TABS.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)} className={tab === t.id ? 'tab-item-active' : 'tab-item'}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <div className="space-y-6 animate-fade-in">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {statsLoading ? (
              Array.from({ length: 4 }, (_, i) => <div key={i} className="stat-box h-[92px] skeleton" />)
            ) : (
              <>
                <StatCard icon={CheckCircle2} label="Problems solved" value={stats?.problemsSolved ?? 0} accent="text-emerald-400" />
                <StatCard icon={PlayCircle} label="Videos watched" value={stats?.videosWatched ?? 0} accent="text-sky-400" />
                <StatCard icon={Trophy} label="Quests completed" value={stats?.questsCompleted ?? 0} accent="text-plasma-300" />
                <StatCard icon={Flame} label="Current streak" value={`${stats?.currentStreak ?? 0}d`} accent="text-amber-400" />
              </>
            )}
          </div>

          <div className="card">
            <h2 className="section-title mb-5">Progress by level</h2>
            {progressLoading ? (
              <div className="space-y-4">{Array.from({ length: 3 }, (_, i) => <div key={i} className="h-9 skeleton" />)}</div>
            ) : (
              <ProgressBars progress={progress} />
            )}
          </div>
        </div>
      )}

      {tab === 'edit' && (
        <div className="card animate-fade-in">
          <h2 className="section-title mb-5">Edit profile</h2>
          <EditProfileForm />
        </div>
      )}

      {tab === 'security' && (
        <div className="card animate-fade-in">
          <h2 className="section-title mb-5">Change password</h2>
          <ChangePasswordForm />
        </div>
      )}
    </div>
  )
}
import { useMemo } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { AlertTriangle, ArrowLeft, Map as MapIcon, Pencil, Rocket, Eye, Plus, PlusCircle, Settings } from 'lucide-react'
import useAuthStore from '../../store/authStore'
import { DIFFICULTY_LEVELS, ROLES } from '../../utils/constants'
import { questApi } from '../../api/questApi'
import EmptyState from '../../components/common/EmptyState'

const LEVEL_KEYS = Object.keys(DIFFICULTY_LEVELS)

export default function AdminQuestsPage() {
  const queryClient = useQueryClient()
  const role = useAuthStore((s) => s.user?.role)
  const isStaff = role === ROLES.ADMIN || role === ROLES.TEACHER

  const { data: quests, isLoading, isError, error } = useQuery({
    queryKey: ['quests-admin'],
    queryFn: () => questApi.getAdminAll(),
    enabled: isStaff,
    retry: false,
  })

  const publishMutation = useMutation({
    mutationFn: (questId) => questApi.publish(questId),
    onSuccess: () => {
      toast.success('Quest published')
      queryClient.invalidateQueries({ queryKey: ['quests-admin'] })
      queryClient.invalidateQueries({ queryKey: ['quests'] })
      queryClient.invalidateQueries({ queryKey: ['quest'] })
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || 'Could not publish the quest')
    },
  })

  const groups = useMemo(() => {
    const list = quests || []
    return LEVEL_KEYS
      .map((key) => ({
        key,
        info: DIFFICULTY_LEVELS[key],
        quests: list
          .filter((q) => q.difficultyLevel === key)
          .sort((a, b) => a.id - b.id),
      }))
      .filter((g) => g.quests.length > 0)
  }, [quests])

  if (!isStaff) return <Navigate to="/quests" replace />

  return (
    <div className="space-y-6">
      <Link
        to="/quests"
        className="inline-flex items-center gap-1 text-sm opacity-80 hover:opacity-100"
      >
        <ArrowLeft size={16} /> Quests
      </Link>

    <div className="mb-6 flex items-center justify-between gap-3">
      <h1 className="text-2xl font-semibold text-white">Manage quests</h1>
      <Link to="/admin/quests/new" className="btn-primary inline-flex items-center gap-1">
        <Plus size={15} /> New quest
      </Link>
    </div>

      {isLoading ? (
        <div className="h-64 skeleton rounded-xl" />
      ) : isError ? (
        <EmptyState
          icon={AlertTriangle}
          title="Couldn't load quests"
          subtitle={error?.response?.data?.message || 'Check that the backend is running and try again.'}
        />
      ) : groups.length === 0 ? (
        <EmptyState icon={MapIcon} title="No quests yet" subtitle="Create a quest to get started." />
      ) : (
        groups.map((group) => (
          <section key={group.key}>
            <h2 className="flex items-center gap-3 text-lg font-semibold mb-3">
              <span className={group.info.badge}>Level {group.info.level}</span>
              <span>{group.info.label}</span>
            </h2>

            <div className="space-y-2">
              {group.quests.map((quest) => {
                const publishing =
                  publishMutation.isPending && publishMutation.variables === quest.id
                return (
                  <div
                    key={quest.id}
                    className="card p-4 flex flex-wrap items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold">{quest.title}</h3>
                        {quest.published ? (
                          <span className="badge badge-success">Published</span>
                        ) : (
                          <span className="badge badge-warning">Draft</span>
                        )}
                      </div>
                      <p className="text-sm text-chalk-400">
                        #{quest.id} · {quest.totalProblems ?? 0} locations ·{' '}
                        {quest.totalVideos ?? 0} videos
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Link
                        to={`/quests/${quest.id}`}
                        className="btn-secondary inline-flex items-center gap-1"
                      >
                        <Eye size={15} /> Open
                      </Link>
                      <Link
                        to={`/quests/${quest.id}/edit`}
                        className="btn-secondary inline-flex items-center gap-1"
                      >
                        <Pencil size={15} /> Edit map
                      </Link>
                      <Link
                        to={`/admin/quests/${quest.id}/settings`}
                        className="btn-secondary inline-flex items-center gap-1"
                      >
                        <Settings size={15} /> Settings
                      </Link>
                      <Link
                        to={`/admin/problems/new?questId=${quest.id}`}
                        className="btn-secondary inline-flex items-center gap-1"
                      >
                        <PlusCircle size={15} /> Add problem
                      </Link>
                      {!quest.published && (
                        <button
                          className="btn-primary inline-flex items-center gap-1"
                          disabled={publishing || (quest.totalProblems ?? 0) === 0}
                          title={
                            (quest.totalProblems ?? 0) === 0
                              ? 'Add problems and build the map first'
                              : undefined
                          }
                          onClick={() => publishMutation.mutate(quest.id)}
                        >
                          <Rocket size={15} /> {publishing ? 'Publishing…' : 'Publish'}
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        ))
      )}
    </div>
  )
}
import { useParams } from 'react-router-dom'
import ReactPlayer from 'react-player'
import { Eye, AlertTriangle } from 'lucide-react'
import useVideo from '../../hooks/useVideoPlayer'
import useAuthStore from '../../store/authStore'
import PaywallGate from '../../components/video/PaywallGate'
import CommentSection from '../../components/video/CommentSection'
import EmptyState from '../../components/common/EmptyState'
import { getAssetUrl, getDifficultyInfo, getFullName, formatDate } from '../../utils/helpers'

export default function VideoPlayerPage() {
  const { id } = useParams()
  const hasSub = useAuthStore((s) => s.user?.hasActiveSubscription)
  const { data: video, isLoading, isError } = useVideo(id)

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-5">
        <div className="aspect-video skeleton rounded-xl" />
        <div className="h-6 skeleton rounded w-2/3" />
        <div className="h-4 skeleton rounded w-1/3" />
      </div>
    )
  }

  if (isError || !video) {
    return <EmptyState icon={AlertTriangle} title="Video not found" subtitle="It may have been removed or the link is incorrect." />
  }

  const locked = video.isPremium && !hasSub
  const diff = getDifficultyInfo(video.difficulty)

  return (
    <div className="max-w-4xl mx-auto">
      {locked ? (
        <PaywallGate videoTitle={video.title} />
      ) : (
        <div className="aspect-video rounded-xl overflow-hidden bg-black">
          <ReactPlayer
            src={getAssetUrl(video.filePath)}
            controls
            width="100%"
            height="100%"
          />
        </div>
      )}

      <div className="mt-5 mb-6">
        <h1 className="text-2xl font-semibold font-display text-chalk-50 mb-2">{video.title}</h1>
        <div className="flex flex-wrap items-center gap-2.5 text-sm text-chalk-400 mb-3">
          <span className={`badge ${diff.badge}`}>{diff.label}</span>
          {video.mathTopic && <span className="math-tag">{video.mathTopic}</span>}
          <span className="flex items-center gap-1"><Eye size={14} /> {video.viewCount ?? 0} views</span>
          <span>·</span>
          <span>{formatDate(video.createdAt)}</span>
        </div>
        <p className="text-sm text-chalk-500">By {getFullName(video.uploadedBy)}</p>
        {video.description && (
          <p className="text-sm text-chalk-300 mt-3 whitespace-pre-wrap">{video.description}</p>
        )}
      </div>

      <div className="divider mb-6" />
      <CommentSection videoId={id} initialCount={video.commentCount} />
    </div>
  )
}
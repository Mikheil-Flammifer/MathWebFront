import { Link } from 'react-router-dom'
import { Lock, Play } from 'lucide-react'
import { getAssetUrl, formatDuration, timeAgo, getDifficultyInfo, getFullName } from '../../utils/helpers'
import useAuthStore from '../../store/authStore'

export default function VideoCard({ video }) {
  const hasSub = useAuthStore((s) => s.user?.hasActiveSubscription)
  const locked = video.isPremium && !hasSub
  const diff = getDifficultyInfo(video.difficulty)

  return (
    <Link to={`/videos/${video.id}`} className="group block animate-fade-in">
      <div className="thumb-wrap video-overlay-wrap">
        {video.thumbnailUrl ? (
          <img
            src={getAssetUrl(video.thumbnailUrl)}
            alt=""
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full grid place-items-center text-chalk-600">
            <Play size={28} />
          </div>
        )}

        <div className="video-overlay">
          {locked ? <Lock size={22} className="text-amber-400" /> : <Play size={26} className="text-white" fill="white" />}
        </div>

        {video.duration ? <span className="thumb-badge">{formatDuration(video.duration)}</span> : null}
        {locked && (
          <span className="absolute top-2 left-2 badge-warning"><Lock size={10} /> Premium</span>
        )}
      </div>

      <div className="mt-2.5 flex gap-2.5">
        <div className="min-w-0 flex-1">
            {video.categoryName && (
              <p className="text-[11px] font-medium text-plasma-400 mb-0.5 truncate">
                {video.parentCategoryName ? `${video.parentCategoryName} · ${video.categoryName}` : video.categoryName}
              </p>
            )}
          <h3 className="text-sm font-medium text-chalk-100 line-clamp-2 group-hover:text-plasma-300 transition-colors">
            {video.title}
          </h3>
          <p className="text-xs text-chalk-500 mt-1 truncate">{getFullName(video.uploadedBy)}</p>
          <div className="flex items-center gap-1.5 mt-1 text-xs text-chalk-500">
            <span className={`badge ${diff.badge} !py-0`}>{diff.label}</span>
            <span>·</span>
            <span>{timeAgo(video.createdAt)}</span>
          </div>
        </div>
      </div>
    </Link>
  )
}
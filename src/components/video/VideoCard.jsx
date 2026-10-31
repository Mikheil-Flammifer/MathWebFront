import { Link } from 'react-router-dom'
import { Play } from 'lucide-react'
import { getAssetUrl, formatDuration, timeAgo, getDifficultyInfo, getFullName } from '../../utils/helpers'

export default function VideoCard({ video }) {
  const diff = getDifficultyInfo(video.difficultyLevel)

  return (
    <Link to={`/videos/${video.id}`} className="group block animate-fade-in">
      <div className="thumb-wrap video-overlay-wrap">
        {video.thumbnailPath ? (
          <img
            src={getAssetUrl(video.thumbnailPath)}
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
          <Play size={26} className="text-white" fill="white" />
        </div>

        {video.durationSeconds ? <span className="thumb-badge">{formatDuration(video.durationSeconds)}</span> : null}
        {video.free === true && (
          <span className="absolute top-2 left-2 badge-plasma">Free</span>
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
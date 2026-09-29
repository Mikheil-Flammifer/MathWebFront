import { useSearchParams } from 'react-router-dom'
import { SearchX, Compass, AlertTriangle } from 'lucide-react'
import useVideos from '../../hooks/useVideos'
import VideoCard from '../../components/video/VideoCard'
import EmptyState from '../../components/common/EmptyState'

function CardSkeleton() {
  return (
    <div>
      <div className="thumb-wrap skeleton" />
      <div className="mt-2.5 space-y-2">
        <div className="h-3.5 skeleton rounded w-full" />
        <div className="h-3.5 skeleton rounded w-2/3" />
      </div>
    </div>
  )
}

export default function HomePage() {
  const [params] = useSearchParams()
  const query = params.get('q') || ''

  const { data, isLoading, isError, fetchNextPage, hasNextPage, isFetchingNextPage } = useVideos(query)
  const videos = data?.pages.flatMap((p) => p.content) ?? []

  return (
    <div>
      <div className="mb-6">
        <h1 className="page-title">{query ? `Results for "${query}"` : 'Videos'}</h1>
        <p className="text-chalk-400 mt-1">
          {query ? 'Matching lessons across every topic.' : 'Pick a lesson and keep the streak going.'}
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-6">
          {Array.from({ length: 8 }, (_, i) => <CardSkeleton key={i} />)}
        </div>
      ) : isError ? (
        <EmptyState icon={AlertTriangle} title="Couldn't load videos" subtitle="Check that the backend is running and try again." />
      ) : videos.length === 0 ? (
        <EmptyState
          icon={query ? SearchX : Compass}
          title={query ? 'No matches found' : 'No videos yet'}
          subtitle={query ? 'Try a different search term.' : 'Check back soon for new lessons.'}
        />
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-6">
            {videos.map((v) => <VideoCard key={v.id} video={v} />)}
          </div>

          {hasNextPage && (
            <div className="flex justify-center mt-8">
              <button onClick={() => fetchNextPage()} disabled={isFetchingNextPage} className="btn-secondary">
                {isFetchingNextPage ? <span className="spinner-sm" /> : 'Load more'}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
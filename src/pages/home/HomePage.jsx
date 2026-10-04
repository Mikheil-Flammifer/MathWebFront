import { useSearchParams } from 'react-router-dom'
import { SearchX, Compass, AlertTriangle } from 'lucide-react'
import useVideos from '../../hooks/useVideos'
import VideoCard from '../../components/video/VideoCard'
import EmptyState from '../../components/common/EmptyState'
import CategoryFilterBar from '../../components/category/CategoryFilterBar'
import SortDropdown from '../../components/category/SortDropdown'

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
  const [params, setParams] = useSearchParams()
  const query = params.get('q') || ''
  const categoryId = params.get('categoryId') ? Number(params.get('categoryId')) : null
  const sort = params.get('sort') || 'newest'

  const updateParam = (key, value) => {
    const next = new URLSearchParams(params)
    if (value == null || value === '') next.delete(key)
    else next.set(key, value)
    setParams(next)
  }

  const { data, isLoading, isError, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useVideos({ query, categoryId, sort })
  const videos = data?.pages.flatMap((p) => p.content) ?? []

  return (
    <div>
      <div className="mb-5">
        <h1 className="page-title">{query ? `Results for "${query}"` : 'Videos'}</h1>
        <p className="text-chalk-400 mt-1">
          {query ? 'Matching lessons across every topic.' : 'Pick a lesson and keep the streak going.'}
        </p>
      </div>

      <div className="flex flex-wrap items-start justify-between gap-3 mb-6">
        <CategoryFilterBar categoryId={categoryId} onSelect={(id) => updateParam('categoryId', id)} />
        <SortDropdown value={sort} onChange={(v) => updateParam('sort', v)} />
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
          title={query ? 'No matches found' : 'No videos found'}
          subtitle={query ? 'Try a different search term.' : 'Try a different category or check back soon.'}
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
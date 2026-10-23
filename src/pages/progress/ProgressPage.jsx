import { Link } from 'react-router-dom';
import { ChevronRight, AlertCircle } from 'lucide-react';
import StreakCard from '../../components/progress/StreakCard';
import TopicProgressCard from '../../components/progress/TopicProgressCard';
import { useProgressTopics } from '../../hooks/useProgress';

export default function ProgressPage() {
  const { data, isLoading, isError } = useProgressTopics();

  // Topics without published problems are noise, so hide them.
  const topics = (data || []).filter((t) => t.totalProblems > 0);

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-4 md:p-6">
      <h1 className="text-2xl font-bold text-white">My progress</h1>

      <StreakCard />

      <Link
        to="/progress/mistakes"
        className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 transition-colors hover:bg-white/10"
      >
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-400/15 text-amber-400">
          <AlertCircle size={24} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="font-semibold text-white">Review mistakes</div>
          <div className="text-sm text-chalk-500">
            Problems you gave up on or solved with help
          </div>
        </div>
        <ChevronRight size={20} className="text-chalk-500" />
      </Link>

      <div>
        <h2 className="mb-3 text-lg font-semibold text-white">Topics</h2>

        {isLoading && (
          <div className="space-y-3">
            <div className="h-32 animate-pulse rounded-2xl bg-white/5" />
            <div className="h-32 animate-pulse rounded-2xl bg-white/5" />
          </div>
        )}

        {isError && (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-sm text-chalk-500">
            Could not load topic progress.
          </div>
        )}

        {!isLoading && !isError && topics.length === 0 && (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-sm text-chalk-500">
            No topics with problems yet.
          </div>
        )}

        <div className="space-y-3">
          {topics.map((topic) => (
            <TopicProgressCard key={topic.categoryId} topic={topic} />
          ))}
        </div>
      </div>
    </div>
  );
}
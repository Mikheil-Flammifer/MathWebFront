import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import MistakeItem from '../../components/progress/MistakeItem';
import { useProgressMistakes, useProgressTopics } from '../../hooks/useProgress';

export default function MistakesPage() {
  const [categoryId, setCategoryId] = useState(null);

  const { data, isLoading, isError } = useProgressMistakes(categoryId);
  const { data: topics } = useProgressTopics();

  const filterTopics = (topics || []).filter((t) => t.totalProblems > 0);
  const items = data || [];

  function chipClass(active) {
    return (
      'rounded-full px-3 py-1.5 text-sm transition-colors ' +
      (active
        ? 'bg-white text-black font-medium'
        : 'bg-white/10 text-chalk-500 hover:text-white')
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-4 md:p-6">
      <div>
        <Link
          to="/progress"
          className="mb-3 inline-flex items-center gap-1.5 text-sm text-chalk-500 hover:text-white"
        >
          <ArrowLeft size={16} />
          My progress
        </Link>
        <h1 className="text-2xl font-bold text-white">Review mistakes</h1>
        <p className="mt-1 text-sm text-chalk-500">
          Problems you gave up on, haven't solved yet, or solved with help. Worst first.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setCategoryId(null)}
          className={chipClass(categoryId === null)}
        >
          All
        </button>
        {filterTopics.map((t) => (
          <button
            key={t.categoryId}
            type="button"
            onClick={() => setCategoryId(t.categoryId)}
            className={chipClass(categoryId === t.categoryId)}
          >
            {t.name}
          </button>
        ))}
      </div>

      {isLoading && (
        <div className="space-y-3">
          <div className="h-24 animate-pulse rounded-2xl bg-white/5" />
          <div className="h-24 animate-pulse rounded-2xl bg-white/5" />
          <div className="h-24 animate-pulse rounded-2xl bg-white/5" />
        </div>
      )}

      {isError && (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-sm text-chalk-500">
          Could not load your mistakes.
        </div>
      )}

      {!isLoading && !isError && items.length === 0 && (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-sm text-chalk-500">
          Nothing to review here. Great work!
        </div>
      )}

      <div className="space-y-3">
        {items.map((item) => (
          <MistakeItem key={item.problemId} item={item} />
        ))}
      </div>
    </div>
  );
}
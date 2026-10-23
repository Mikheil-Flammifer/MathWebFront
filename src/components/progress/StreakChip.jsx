import { Link } from 'react-router-dom';
import { Flame, ChevronRight } from 'lucide-react';
import { useStreak } from '../../hooks/useProgress';

export default function StreakChip() {
  const { data } = useStreak();

  // Stay invisible while loading or on error, so the home page never shows a broken strip.
  if (!data) return null;

  let text = 'Start a streak: solve a problem today';
  if (data.currentStreak > 0 && data.activeToday) {
    text = data.currentStreak + ' day streak. Done for today';
  } else if (data.streakAtRisk) {
    text = data.currentStreak + ' day streak at risk. Solve one problem to keep it';
  }

  const hot = data.currentStreak > 0;
  const atRisk = data.streakAtRisk;

  const iconBox =
    'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ' +
    (hot ? 'bg-amber-400/15 text-amber-400' : 'bg-white/10 text-chalk-500');

  return (
    <Link
      to="/progress"
      className="mb-5 flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 transition-colors hover:bg-white/10"
    >
      <div className={iconBox}>
        <Flame size={20} />
      </div>
      <span
        className={
          'min-w-0 flex-1 text-sm ' + (atRisk ? 'text-amber-400' : 'text-white')
        }
      >
        {text}
      </span>
      <span className="flex items-center gap-1 text-sm text-chalk-500">
        My progress
        <ChevronRight size={16} />
      </span>
    </Link>
  );
}
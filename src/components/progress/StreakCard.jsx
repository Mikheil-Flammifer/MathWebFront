import { Flame } from 'lucide-react';
import { useStreak } from '../../hooks/useProgress';

// Build the last 30 UTC day keys ("YYYY-MM-DD"), oldest first.
// Backend days are UTC, so we compare strings and never format through local time.
function buildLast30Days() {
  const now = new Date();
  const base = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  const days = [];
  for (let i = 29; i >= 0; i--) {
    days.push(new Date(base - i * 86400000).toISOString().slice(0, 10));
  }
  return days;
}

function dayLabel(key) {
  const parts = key.split('-');
  return parts[2] + '.' + parts[1];
}

export default function StreakCard() {
  const { data, isLoading, isError } = useStreak();

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-5 animate-pulse h-48" />
    );
  }

  if (isError || !data) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-sm text-chalk-500">
        Could not load your streak.
      </div>
    );
  }

  const days = buildLast30Days();
  const activeSet = new Set(data.last30Days);
  const todayKey = days[days.length - 1];

  let message = 'Solve a problem to start your streak.';
  if (data.activeToday) {
    message = 'Done for today. Come back tomorrow to keep it going.';
  } else if (data.streakAtRisk) {
    message = 'Solve one problem to keep your streak.';
  }

  const flameColor = data.currentStreak > 0 ? 'text-amber-400' : 'text-chalk-500';

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
      <div className="flex items-center gap-4">
        <div className={'flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5 ' + flameColor}>
          <Flame size={30} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-3xl font-bold leading-none text-white">
            {data.currentStreak}
            <span className="ml-2 text-base font-medium text-chalk-500">
              {data.currentStreak === 1 ? 'day streak' : 'day streak'}
            </span>
          </div>
          <p
            className={
              'mt-1 text-sm ' +
              (data.streakAtRisk ? 'text-amber-400' : 'text-chalk-500')
            }
          >
            {message}
          </p>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-10 gap-1.5">
        {days.map((key) => {
          const active = activeSet.has(key);
          const isToday = key === todayKey;
          return (
            <div
              key={key}
              title={dayLabel(key) + (active ? ' - active' : '')}
              className={
                'aspect-square rounded-md ' +
                (active ? 'bg-amber-400' : 'bg-white/10') +
                (isToday ? ' ring-2 ring-white/60' : '')
              }
            />
          );
        })}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-xl bg-white/5 px-3 py-2">
          <div className="text-chalk-500">Longest streak</div>
          <div className="font-semibold text-white">{data.longestStreak} days</div>
        </div>
        <div className="rounded-xl bg-white/5 px-3 py-2">
          <div className="text-chalk-500">Active days</div>
          <div className="font-semibold text-white">{data.totalActiveDays}</div>
        </div>
      </div>
    </div>
  );
}
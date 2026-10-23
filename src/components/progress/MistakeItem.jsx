import { Link } from 'react-router-dom';
import { Lightbulb, RotateCcw } from 'lucide-react';
import MathText from './../MathText';
import { MISTAKE_REASON, getCategoryTheme } from '../../utils/constants';

// lastAttemptAt is a LocalDateTime without time zone ("2026-10-23T09:12:45.318211").
// Do not pass it to new Date(). Just show the date part as it is.
function formatDay(value) {
  if (!value) return 'No answer submitted';
  const day = String(value).split('T')[0].split('-');
  if (day.length !== 3) return '';
  return day[2] + '.' + day[1] + '.' + day[0];
}

export default function MistakeItem({ item }) {
  const reason = MISTAKE_REASON[item.reason] || MISTAKE_REASON.UNSOLVED_WRONG;
  const theme = getCategoryTheme(item.mainCategoryName);

  return (
    <Link
      to={'/problems/' + item.problemId}
      className="block rounded-2xl border border-white/10 bg-white/5 p-4 transition-colors hover:bg-white/10"
    >
      <div className="mb-2 flex items-center justify-between gap-3">
        <span className={reason.badge}>{reason.label}</span>
        <span className="text-xs text-chalk-500">{formatDay(item.lastAttemptAt)}</span>
      </div>

      <div className="line-clamp-2 text-white">
        <MathText text={item.questionText} />
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-chalk-500">
        <span className="flex items-center gap-1.5">
          <span
            className="inline-block h-2 w-2 rounded-full"
            style={{ backgroundColor: theme.color }}
          />
          {item.mainCategoryName} · {item.categoryName}
        </span>
        <span className="flex items-center gap-1">
          <RotateCcw size={12} />
          {item.attemptsUsed} {item.attemptsUsed === 1 ? 'attempt' : 'attempts'}
        </span>
        {item.hintsUsed > 0 && (
          <span className="flex items-center gap-1">
            <Lightbulb size={12} />
            {item.hintsUsed} {item.hintsUsed === 1 ? 'hint' : 'hints'}
          </span>
        )}
        {item.solved && <span className="text-emerald-400">Solved</span>}
      </div>
    </Link>
  );
}
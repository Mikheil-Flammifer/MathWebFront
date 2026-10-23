import { useState } from 'react';
import { ChevronDown, Sigma, Triangle, Hash, Calculator, BookOpen } from 'lucide-react';
import { TOPIC_LEVEL, getCategoryTheme } from '../../utils/constants';

// Backend "icon" is optional, so unknown or null values fall back to BookOpen.
const ICONS = {
  function: Sigma,
  sigma: Sigma,
  triangle: Triangle,
  hash: Hash,
  calculator: Calculator,
};

function topicColor(topic) {
  return topic.color || getCategoryTheme(topic.name).color;
}

function ProgressBar({ percent, color }) {
  const safe = Math.max(0, Math.min(100, percent));
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
      <div
        className="h-full rounded-full"
        style={{ width: safe + '%', backgroundColor: color }}
      />
    </div>
  );
}

function LevelBadge({ level }) {
  const info = TOPIC_LEVEL[level] || TOPIC_LEVEL.NOT_STARTED;
  return <span className={info.badge}>{info.label}</span>;
}

function SubtopicRow({ sub, parentColor }) {
  const color = sub.color || parentColor;
  return (
    <div className="rounded-xl bg-white/5 px-3 py-3">
      <div className="mb-2 flex items-center justify-between gap-3">
        <span className="min-w-0 truncate text-sm font-medium text-white">
          {sub.name}
        </span>
        <LevelBadge level={sub.level} />
      </div>
      <ProgressBar percent={sub.percent} color={color} />
      <div className="mt-2 flex justify-between text-xs text-chalk-500">
        <span>
          {sub.solved} / {sub.totalProblems} solved
        </span>
        <span>{sub.firstTrySolved} clean solves</span>
      </div>
    </div>
  );
}

export default function TopicProgressCard({ topic }) {
  const [open, setOpen] = useState(false);
  const color = topicColor(topic);
  const Icon = ICONS[topic.icon] || BookOpen;
  const hasSubtopics = topic.subtopics && topic.subtopics.length > 0;

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
      <div className="flex items-center gap-4">
        <div
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
          style={{ backgroundColor: color + '26', color: color }}
        >
          <Icon size={24} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-3">
            <h2 className="truncate text-lg font-semibold text-white">
              {topic.name}
            </h2>
            <LevelBadge level={topic.level} />
          </div>
          <div className="mt-1 text-sm text-chalk-500">
            {topic.solved} / {topic.totalProblems} solved
            {' · '}
            {topic.firstTrySolved} clean solves
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-3">
        <div className="flex-1">
          <ProgressBar percent={topic.percent} color={color} />
        </div>
        <span className="w-12 text-right text-sm font-semibold text-white">
          {Math.round(topic.percent)}%
        </span>
      </div>

      {hasSubtopics && (
        <>
          <button
            type="button"
            onClick={() => setOpen(!open)}
            className="mt-4 flex w-full items-center justify-between text-sm text-chalk-500 hover:text-white"
          >
            <span>
              {open ? 'Hide subtopics' : 'Show subtopics (' + topic.subtopics.length + ')'}
            </span>
            <ChevronDown
              size={18}
              className={open ? 'rotate-180 transition-transform' : 'transition-transform'}
            />
          </button>

          {open && (
            <div className="mt-3 space-y-2">
              {topic.subtopics.map((sub) => (
                <SubtopicRow key={sub.categoryId} sub={sub} parentColor={color} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
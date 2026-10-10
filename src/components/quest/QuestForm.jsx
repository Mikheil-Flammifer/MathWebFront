import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { questApi } from '../../api/questApi';

const LEVELS = [
  ['LEVEL_1_BEGINNER', 'Level 1 · Beginner'],
  ['LEVEL_2_ELEMENTARY', 'Level 2 · Elementary'],
  ['LEVEL_3_INTERMEDIATE', 'Level 3 · Intermediate'],
  ['LEVEL_4_UPPER_INTERMEDIATE', 'Level 4 · Upper intermediate'],
  ['LEVEL_5_ADVANCED', 'Level 5 · Advanced'],
  ['LEVEL_6_EXPERT', 'Level 6 · Expert'],
  ['LEVEL_7_MASTER', 'Level 7 · Master'],
];

const levelLabel = (value) => {
  const found = LEVELS.find(([v]) => v === value);
  return found ? found[1] : value;
};

const inputClass =
  'w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-white/40 focus:border-violet-400 focus:outline-none';

export default function QuestForm({
  initial,
  onSubmit,
  submitting = false,
  error = '',
  submitLabel = 'Save',
  excludeId = null,
}) {
  const [title, setTitle] = useState(initial?.title ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [difficultyLevel, setDifficultyLevel] = useState(
    initial?.difficultyLevel ?? 'LEVEL_1_BEGINNER'
  );
  const [xpReward, setXpReward] = useState(String(initial?.xpReward ?? 0));
  const [prerequisiteIds, setPrerequisiteIds] = useState(
    initial?.prerequisiteIds ?? []
  );
  const [errors, setErrors] = useState({});

  const { data: allQuests = [] } = useQuery({
    queryKey: ['admin-quests-for-prereqs'],
    queryFn: () => questApi.getAdminAll(),
  });

  const candidates = allQuests.filter((q) => q.id !== excludeId);

  const togglePrereq = (id) => {
    setPrerequisiteIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const validate = () => {
    const next = {};
    const t = title.trim();
    if (t.length < 3 || t.length > 255) {
      next.title = 'Title must be between 3 and 255 characters';
    }
    if (description.length > 5000) {
      next.description = 'Description cannot exceed 5000 characters';
    }
    const xp = Number(xpReward);
    if (!Number.isInteger(xp) || xp < 0) {
      next.xpReward = 'XP must be a whole number, 0 or more';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit({
      title: title.trim(),
      description: description.trim(),
      difficultyLevel,
      xpReward: Number(xpReward),
      prerequisiteIds,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="mb-1 block text-sm text-white/70">Title</label>
        <input
          className={inputClass}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Test Island"
        />
        {errors.title && (
          <p className="mt-1 text-xs text-red-400">{errors.title}</p>
        )}
      </div>

      <div>
        <label className="mb-1 block text-sm text-white/70">Description</label>
        <textarea
          className={inputClass}
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        {errors.description && (
          <p className="mt-1 text-xs text-red-400">{errors.description}</p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm text-white/70">
            Difficulty level
          </label>
          <select
            className={inputClass}
            value={difficultyLevel}
            onChange={(e) => setDifficultyLevel(e.target.value)}
          >
            {LEVELS.map(([value, label]) => (
              <option key={value} value={value} className="text-black">
                {label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm text-white/70">XP reward</label>
          <input
            className={inputClass}
            type="number"
            min="0"
            step="1"
            value={xpReward}
            onChange={(e) => setXpReward(e.target.value)}
          />
          {errors.xpReward && (
            <p className="mt-1 text-xs text-red-400">{errors.xpReward}</p>
          )}
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm text-white/70">
          Prerequisites (optional)
        </label>
        <div className="max-h-48 space-y-1 overflow-y-auto rounded-lg border border-white/10 bg-white/5 p-2">
          {candidates.length === 0 && (
            <p className="p-2 text-sm text-white/40">No other quests yet.</p>
          )}
          {candidates.map((q) => (
            <label
              key={q.id}
              className="flex cursor-pointer items-center gap-2 rounded px-2 py-1 text-sm text-white/80 hover:bg-white/5"
            >
              <input
                type="checkbox"
                checked={prerequisiteIds.includes(q.id)}
                onChange={() => togglePrereq(q.id)}
              />
              <span>{q.title}</span>
              <span className="ml-auto text-xs text-white/40">
                {levelLabel(q.difficultyLevel)}
              </span>
            </label>
          ))}
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="rounded-lg bg-violet-500 px-5 py-2 text-sm font-medium text-white hover:bg-violet-400 disabled:opacity-50"
      >
        {submitting ? 'Saving…' : submitLabel}
      </button>
    </form>
  );
}
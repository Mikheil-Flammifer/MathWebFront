import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../api/axios';
import MathText from '../../components/MathText';

const LEVELS = [
  ['LEVEL_1_BEGINNER', 'Level 1 · Beginner'],
  ['LEVEL_2_ELEMENTARY', 'Level 2 · Elementary'],
  ['LEVEL_3_INTERMEDIATE', 'Level 3 · Intermediate'],
  ['LEVEL_4_UPPER_INTERMEDIATE', 'Level 4 · Upper intermediate'],
  ['LEVEL_5_ADVANCED', 'Level 5 · Advanced'],
  ['LEVEL_6_EXPERT', 'Level 6 · Expert'],
  ['LEVEL_7_MASTER', 'Level 7 · Master'],
];

const MAX_HINTS = 3;

const inputClass =
  'w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-white/40 focus:border-violet-400 focus:outline-none';

const emptyOptions = () => [
  { optionText: '', isCorrect: false },
  { optionText: '', isCorrect: false },
  { optionText: '', isCorrect: false },
  { optionText: '', isCorrect: false },
];

function Preview({ text }) {
  if (!text || !text.trim()) return null;
  return (
    <div className="mt-2 rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm text-white">
      <div className="mb-1 text-xs uppercase tracking-wide text-white/40">Preview</div>
      <MathText text={text} />
    </div>
  );
}

export default function ProblemForm({
  initial,
  quests = [],
  lockQuest = false,
  onSubmit,
  submitting = false,
  error = '',
  submitLabel = 'Save',
}) {
  const [questId, setQuestId] = useState(String(initial?.questId ?? ''));
  const [questionText, setQuestionText] = useState(initial?.questionText ?? '');
  const [problemType, setProblemType] = useState(
    initial?.problemType === 'MULTIPLE_CHOICE' ? 'MULTIPLE_CHOICE' : 'OPEN_ANSWER'
  );
  const [difficultyLevel, setDifficultyLevel] = useState(
    initial?.difficultyLevel ?? 'LEVEL_1_BEGINNER'
  );
  const [categoryId, setCategoryId] = useState(String(initial?.categoryId ?? ''));
  const [xpReward, setXpReward] = useState(String(initial?.xpReward ?? 10));
  const [orderIndex, setOrderIndex] = useState(String(initial?.orderIndex ?? 1));
  const [explanation, setExplanation] = useState(initial?.explanation ?? '');
  const [correctAnswer, setCorrectAnswer] = useState(initial?.correctAnswer ?? '');
  const [hints, setHints] = useState(
    Array.isArray(initial?.hints) ? initial.hints.slice(0, MAX_HINTS) : []
  );
  const [options, setOptions] = useState(
    initial?.answerOptions && initial.answerOptions.length > 0
      ? initial.answerOptions
      : emptyOptions()
  );
  const [errors, setErrors] = useState({});

  const { data: categoryTree = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: () => api.get('/api/categories').then((res) => res.data.data),
  });

  const subsOf = (main) =>
    main.subcategories || main.subCategories || main.children || [];

  const handleQuestChange = (value) => {
    setQuestId(value);
    const q = quests.find((x) => String(x.id) === value);
    if (q && !lockQuest) {
      setDifficultyLevel(q.difficultyLevel);
      setOrderIndex(String((q.totalProblems ?? 0) + 1));
    }
  };

  const setOptionText = (index, text) => {
    setOptions((prev) =>
      prev.map((o, i) => (i === index ? { ...o, optionText: text } : o))
    );
  };

  const setCorrect = (index) => {
    setOptions((prev) => prev.map((o, i) => ({ ...o, isCorrect: i === index })));
  };

  const addOption = () => {
    setOptions((prev) => [...prev, { optionText: '', isCorrect: false }]);
  };

  const removeOption = (index) => {
    setOptions((prev) => prev.filter((_, i) => i !== index));
  };

  const setHintText = (index, text) => {
    setHints((prev) => prev.map((h, i) => (i === index ? text : h)));
  };

  const addHint = () => {
    setHints((prev) => (prev.length >= MAX_HINTS ? prev : [...prev, '']));
  };

  const removeHint = (index) => {
    setHints((prev) => prev.filter((_, i) => i !== index));
  };

  const moveHint = (index, direction) => {
    setHints((prev) => {
      const target = index + direction;
      if (target < 0 || target >= prev.length) return prev;
      const next = [...prev];
      const temp = next[index];
      next[index] = next[target];
      next[target] = temp;
      return next;
    });
  };

  const validate = () => {
    const next = {};
    if (!questId) next.questId = 'Choose a quest';
    if (!questionText.trim()) next.questionText = 'Question text is required';
    if (!categoryId) next.categoryId = 'Choose a category';
    const xp = Number(xpReward);
    if (!Number.isInteger(xp) || xp < 0) next.xpReward = 'XP must be 0 or more';
    const oi = Number(orderIndex);
    if (!Number.isInteger(oi) || oi < 1) next.orderIndex = 'Order must be 1 or more';

    if (problemType === 'OPEN_ANSWER') {
      if (!correctAnswer.trim()) next.correctAnswer = 'Correct answer is required';
    } else {
      const filled = options.filter((o) => o.optionText.trim());
      const correctCount = filled.filter((o) => o.isCorrect).length;
      if (filled.length < 2) next.options = 'Add at least 2 options';
      else if (correctCount !== 1) next.options = 'Mark exactly one correct option';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    const payload = {
      questId: Number(questId),
      questionText: questionText.trim(),
      problemType,
      difficultyLevel,
      explanation: explanation.trim(),
      xpReward: Number(xpReward),
      orderIndex: Number(orderIndex),
      categoryId: Number(categoryId),
      hints: hints.map((h) => h.trim()).filter((h) => h.length > 0),
    };
    if (problemType === 'OPEN_ANSWER') {
      payload.correctAnswer = correctAnswer.trim();
    } else {
      payload.answerOptions = options
        .filter((o) => o.optionText.trim())
        .map((o) => ({ optionText: o.optionText.trim(), isCorrect: !!o.isCorrect }));
    }
    onSubmit(payload);
  };

  const fieldError = (key) =>
    errors[key] ? <p className="mt-1 text-xs text-red-400">{errors[key]}</p> : null;

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="mb-1 block text-sm text-white/70">Quest</label>
        <select
          className={inputClass}
          value={questId}
          disabled={lockQuest}
          onChange={(e) => handleQuestChange(e.target.value)}
        >
          <option value="" className="text-black">
            Choose a quest…
          </option>
          {quests.map((q) => (
            <option key={q.id} value={q.id} className="text-black">
              {q.title}
            </option>
          ))}
        </select>
        {fieldError('questId')}
      </div>

      <div>
        <label className="mb-1 block text-sm text-white/70">
          Question (use $...$ for formulas, $$...$$ for display formulas)
        </label>
        <textarea
          className={inputClass}
          rows={4}
          value={questionText}
          onChange={(e) => setQuestionText(e.target.value)}
        />
        {fieldError('questionText')}
        <Preview text={questionText} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm text-white/70">Type</label>
          <select
            className={inputClass}
            value={problemType}
            onChange={(e) => setProblemType(e.target.value)}
          >
            <option value="OPEN_ANSWER" className="text-black">
              Open answer
            </option>
            <option value="MULTIPLE_CHOICE" className="text-black">
              Multiple choice
            </option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm text-white/70">Category</label>
          <select
            className={inputClass}
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
          >
            <option value="" className="text-black">
              Choose a category…
            </option>
            {categoryTree.map((main) => (
              <optgroup key={main.id} label={main.name} className="text-black">
                {subsOf(main).map((sub) => (
                  <option key={sub.id} value={sub.id} className="text-black">
                    {sub.name}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
          {fieldError('categoryId')}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className="mb-1 block text-sm text-white/70">Difficulty</label>
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
          {fieldError('xpReward')}
        </div>
        <div>
          <label className="mb-1 block text-sm text-white/70">Order</label>
          <input
            className={inputClass}
            type="number"
            min="1"
            step="1"
            value={orderIndex}
            onChange={(e) => setOrderIndex(e.target.value)}
          />
          {fieldError('orderIndex')}
        </div>
      </div>

      {problemType === 'OPEN_ANSWER' ? (
        <div>
          <label className="mb-1 block text-sm text-white/70">Correct answer</label>
          <input
            className={inputClass}
            value={correctAnswer}
            onChange={(e) => setCorrectAnswer(e.target.value)}
          />
          {fieldError('correctAnswer')}
        </div>
      ) : (
        <div>
          <label className="mb-1 block text-sm text-white/70">
            Answer options (select the correct one)
          </label>
          <div className="space-y-2">
            {options.map((opt, index) => (
              <div key={index}>
                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="correctOption"
                    checked={!!opt.isCorrect}
                    onChange={() => setCorrect(index)}
                  />
                  <input
                    className={inputClass}
                    value={opt.optionText}
                    placeholder={`Option ${index + 1}`}
                    onChange={(e) => setOptionText(index, e.target.value)}
                  />
                  {options.length > 2 && (
                    <button
                      type="button"
                      onClick={() => removeOption(index)}
                      className="px-2 text-white/50 hover:text-red-400"
                    >
                      ✕
                    </button>
                  )}
                </div>
                {opt.optionText.includes('$') && <Preview text={opt.optionText} />}
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={addOption}
            className="mt-2 text-sm text-violet-300 hover:text-violet-200"
          >
            + Add option
          </button>
          {fieldError('options')}
        </div>
      )}

      <div>
        <label className="mb-1 block text-sm text-white/70">
          Hints (up to {MAX_HINTS}, students reveal them one by one)
        </label>
        <div className="space-y-3">
          {hints.map((hint, index) => (
            <div key={index}>
              <div className="flex items-start gap-2">
                <span className="mt-2 w-5 text-sm text-white/50">{index + 1}.</span>
                <textarea
                  className={inputClass}
                  rows={2}
                  value={hint}
                  placeholder={`Hint ${index + 1}`}
                  onChange={(e) => setHintText(index, e.target.value)}
                />
                <div className="flex flex-col">
                  <button
                    type="button"
                    disabled={index === 0}
                    onClick={() => moveHint(index, -1)}
                    className="px-2 text-white/50 hover:text-white disabled:opacity-30"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    disabled={index === hints.length - 1}
                    onClick={() => moveHint(index, 1)}
                    className="px-2 text-white/50 hover:text-white disabled:opacity-30"
                  >
                    ↓
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => removeHint(index)}
                  className="px-2 pt-2 text-white/50 hover:text-red-400"
                >
                  ✕
                </button>
              </div>
              <Preview text={hint} />
            </div>
          ))}
        </div>
        {hints.length < MAX_HINTS && (
          <button
            type="button"
            onClick={addHint}
            className="mt-2 text-sm text-violet-300 hover:text-violet-200"
          >
            + Add hint
          </button>
        )}
      </div>

      <div>
        <label className="mb-1 block text-sm text-white/70">
          Explanation (shown after a correct solve)
        </label>
        <textarea
          className={inputClass}
          rows={3}
          value={explanation}
          onChange={(e) => setExplanation(e.target.value)}
        />
        <Preview text={explanation} />
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
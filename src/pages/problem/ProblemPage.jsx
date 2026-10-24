import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../api/axios';
import RichMathInput from '../../components/RichMathInput';
import ProblemPreview from '../../components/problem/ProblemPreview';
import ImageUploadField from '../../components/problem/ImageUploadField';

const LEVELS = [
  ['LEVEL_1_BEGINNER', 'Level 1 · Beginner'],
  ['LEVEL_2_ELEMENTARY', 'Level 2 · Elementary'],
  ['LEVEL_3_INTERMEDIATE', 'Level 3 · Intermediate'],
  ['LEVEL_4_UPPER_INTERMEDIATE', 'Level 4 · Upper intermediate'],
  ['LEVEL_5_ADVANCED', 'Level 5 · Advanced'],
  ['LEVEL_6_EXPERT', 'Level 6 · Expert'],
  ['LEVEL_7_MASTER', 'Level 7 · Master'],
];

const TYPES = [
  ['OPEN_ANSWER', 'Open answer', 'Students type their answer in a text box.'],
  ['MULTIPLE_CHOICE', 'Multiple choice', 'Students pick one of several options.'],
];

const STEPS = [
  { id: 'basics', label: 'Basics' },
  { id: 'question', label: 'Question' },
  { id: 'answer', label: 'Answer' },
  { id: 'hints', label: 'Hints' },
  { id: 'review', label: 'Review' },
];

// Which step each validation error belongs to.
const ERROR_STEP = {
  questId: 0,
  categoryId: 0,
  xpReward: 0,
  orderIndex: 0,
  questionText: 1,
  correctAnswer: 2,
  options: 2,
};

const MAX_HINTS = 3;
const LAST_STEP = STEPS.length - 1;

const inputClass =
  'w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder-white/40 focus:border-violet-400 focus:outline-none';
const cardClass = 'space-y-5 rounded-2xl border border-white/10 bg-white/[0.03] p-6';
const labelClass = 'mb-1 block text-sm font-medium text-white/80';
const helpClass = 'mt-1 text-xs text-white/50';
const primaryBtn =
  'rounded-lg bg-violet-500 px-6 py-2.5 text-sm font-medium text-white hover:bg-violet-400 disabled:opacity-50';
const ghostBtn =
  'rounded-lg border border-white/15 px-5 py-2.5 text-sm text-white/80 hover:bg-white/5 disabled:opacity-30';

const emptyOptions = () => [
  { optionText: '', isCorrect: false },
  { optionText: '', isCorrect: false },
  { optionText: '', isCorrect: false },
  { optionText: '', isCorrect: false },
];

function describeImage(savedUrl, file, removed) {
  if (file) return 'New: ' + file.name;
  if (removed) return 'Will be removed';
  if (savedUrl) return 'Saved image';
  return '—';
}

function StepHeader({ title, subtitle }) {
  return (
    <div>
      <h2 className="text-xl font-semibold text-white">{title}</h2>
      <p className="mt-1 text-sm text-white/60">{subtitle}</p>
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
  const [step, setStep] = useState(0);
  const [questId, setQuestId] = useState(String(initial?.questId ?? ''));
  const [questionText, setQuestionText] = useState(initial?.questionText ?? '');
  const [embedUrl, setEmbedUrl] = useState(initial?.embedUrl ?? '');
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

  // Images: saved URLs come from the server, files are picked but not uploaded yet.
  const questionImageUrl = initial?.questionImagePath ?? null;
  const explanationImageUrl = initial?.explanationImagePath ?? null;
  const [questionFile, setQuestionFile] = useState(null);
  const [questionRemoved, setQuestionRemoved] = useState(false);
  const [explanationFile, setExplanationFile] = useState(null);
  const [explanationRemoved, setExplanationRemoved] = useState(false);

  const { data: categoryTree = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: () => api.get('/api/categories').then((res) => res.data.data),
  });

  const subsOf = (main) =>
    main.subcategories || main.subCategories || main.children || [];

  let mainCategoryName = '';
  let categoryName = '';
  categoryTree.forEach((main) => {
    subsOf(main).forEach((sub) => {
      if (String(sub.id) === categoryId) {
        mainCategoryName = main.name;
        categoryName = sub.name;
      }
    });
  });

  const levelLabel = LEVELS.find(([value]) => value === difficultyLevel)?.[1] ?? '';
  const questTitle = quests.find((q) => String(q.id) === questId)?.title ?? '';

  const handleQuestChange = (value) => {
    setQuestId(value);
    const q = quests.find((x) => String(x.id) === value);
    if (q && !lockQuest) {
      setDifficultyLevel(q.difficultyLevel);
      setOrderIndex(String((q.totalProblems ?? 0) + 1));
    }
  };

  const pickQuestionImage = (file) => {
    setQuestionFile(file);
    setQuestionRemoved(false);
  };

  const removeQuestionImage = () => {
    if (questionFile) {
      setQuestionFile(null);
    } else {
      setQuestionRemoved(true);
    }
  };

  const pickExplanationImage = (file) => {
    setExplanationFile(file);
    setExplanationRemoved(false);
  };

  const removeExplanationImage = () => {
    if (explanationFile) {
      setExplanationFile(null);
    } else {
      setExplanationRemoved(true);
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

  const getErrors = () => {
    const next = {};
    if (!questId) next.questId = 'Choose a quest';
    if (!categoryId) next.categoryId = 'Choose a category';
    const xp = Number(xpReward);
    if (!Number.isInteger(xp) || xp < 0) next.xpReward = 'XP must be 0 or more';
    const oi = Number(orderIndex);
    if (!Number.isInteger(oi) || oi < 1) next.orderIndex = 'Order must be 1 or more';
    if (!questionText.trim()) next.questionText = 'Write the question first';

    if (problemType === 'OPEN_ANSWER') {
      if (!correctAnswer.trim()) next.correctAnswer = 'Correct answer is required';
    } else {
      const filled = options.filter((o) => o.optionText.trim());
      const correctCount = filled.filter((o) => o.isCorrect).length;
      if (filled.length < 2) next.options = 'Add at least 2 options';
      else if (correctCount !== 1) next.options = 'Mark exactly one correct option';
    }
    return next;
  };

  const goTo = (index) => {
    setErrors({});
    setStep(index);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const next = () => {
    const all = getErrors();
    const here = {};
    Object.keys(all).forEach((key) => {
      if (ERROR_STEP[key] === step) here[key] = all[key];
    });
    if (Object.keys(here).length > 0) {
      setErrors(here);
      return;
    }
    goTo(step + 1);
  };

  const save = () => {
    const all = getErrors();
    const keys = Object.keys(all);
    if (keys.length > 0) {
      const first = Math.min(...keys.map((key) => ERROR_STEP[key]));
      setErrors(all);
      setStep(first);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

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
      embedUrl: embedUrl.trim() || null,
    };
    if (problemType === 'OPEN_ANSWER') {
      payload.correctAnswer = correctAnswer.trim();
    } else {
      payload.answerOptions = options
        .filter((o) => o.optionText.trim())
        .map((o) => ({ optionText: o.optionText.trim(), isCorrect: !!o.isCorrect }));
    }

    const images = {
      question: { file: questionFile, removed: questionRemoved },
      explanation: { file: explanationFile, removed: explanationRemoved },
    };
    onSubmit(payload, images);
  };

  const fieldError = (key) =>
    errors[key] ? <p className="mt-1 text-xs text-red-400">{errors[key]}</p> : null;

  const pending = step === LAST_STEP ? getErrors() : {};

  const summary = [
    ['Quest', questTitle || '—', 0],
    ['Category', categoryName ? `${mainCategoryName} · ${categoryName}` : '—', 0],
    ['Difficulty', levelLabel || '—', 0],
    ['XP reward', xpReward || '0', 0],
    ['Order in quest', orderIndex || '—', 0],
    ['Graph link', embedUrl.trim() || '—', 1],
    ['Question image', describeImage(questionImageUrl, questionFile, questionRemoved), 1],
    ['Answer type', problemType === 'OPEN_ANSWER' ? 'Open answer' : 'Multiple choice', 2],
    [
      'Explanation image',
      describeImage(explanationImageUrl, explanationFile, explanationRemoved),
      3,
    ],
  ];

  return (
    <form
      onSubmit={(e) => e.preventDefault()}
      className="mx-auto max-w-3xl space-y-6"
    >
      <ol className="flex items-center">
        {STEPS.map((s, i) => (
          <li
            key={s.id}
            className={i < LAST_STEP ? 'flex flex-1 items-center' : 'flex items-center'}
          >
            <button
              type="button"
              onClick={() => goTo(i)}
              className="flex items-center gap-2"
            >
              <span
                className={
                  i === step
                    ? 'flex h-8 w-8 items-center justify-center rounded-full bg-violet-500 text-sm font-semibold text-white'
                    : i < step
                      ? 'flex h-8 w-8 items-center justify-center rounded-full bg-violet-500/30 text-sm font-semibold text-violet-200'
                      : 'flex h-8 w-8 items-center justify-center rounded-full border border-white/20 text-sm text-white/60'
                }
              >
                {i < step ? '✓' : i + 1}
              </span>
              <span
                className={
                  i === step
                    ? 'hidden text-sm font-medium text-white sm:inline'
                    : 'hidden text-sm text-white/60 sm:inline'
                }
              >
                {s.label}
              </span>
            </button>
            {i < LAST_STEP && (
              <span
                className={
                  i < step
                    ? 'mx-3 h-px flex-1 bg-violet-400'
                    : 'mx-3 h-px flex-1 bg-white/15'
                }
              />
            )}
          </li>
        ))}
      </ol>

      {step === 0 && (
        <section className={cardClass}>
          <StepHeader
            title="Basics"
            subtitle="Where does this problem live, and how much is it worth?"
          />

          <div>
            <label className={labelClass}>Quest</label>
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
            <label className={labelClass}>Category</label>
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

          <div>
            <label className={labelClass}>Difficulty</label>
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
            <p className={helpClass}>Filled in from the quest when you pick one.</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass}>XP reward</label>
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
              <label className={labelClass}>Order in quest</label>
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
        </section>
      )}

      {step === 1 && (
        <section className={cardClass}>
          <StepHeader
            title="Question"
            subtitle="Write the question. Use ∑ Formula wherever you need math."
          />
          <RichMathInput
            value={questionText}
            onChange={setQuestionText}
            minRows={6}
            placeholder="Type the question here…"
          />
          {fieldError('questionText')}

          <div className="border-t border-white/10 pt-5">
            <ImageUploadField
              label="Question image (optional)"
              value={questionRemoved ? null : questionImageUrl}
              pendingFile={questionFile}
              busy={submitting}
              onPick={pickQuestionImage}
              onRemove={removeQuestionImage}
            />
          </div>

          <div className="border-t border-white/10 pt-5">
            <label className={labelClass}>Desmos / GeoGebra link (optional)</label>
            <input
              className={inputClass}
              value={embedUrl}
              placeholder="Paste a Desmos or GeoGebra link"
              onChange={(e) => setEmbedUrl(e.target.value)}
            />
            <p className={helpClass}>
              Students will see an interactive graph under the question. Leave empty for none.
            </p>
          </div>
        </section>
      )}

      {step === 2 && (
        <section className={cardClass}>
          <StepHeader
            title="Answer"
            subtitle="Choose how students answer, then set the correct answer."
          />

          <div className="grid gap-3 sm:grid-cols-2">
            {TYPES.map(([value, label, help]) => (
              <button
                key={value}
                type="button"
                onClick={() => setProblemType(value)}
                className={
                  problemType === value
                    ? 'rounded-xl border-2 border-violet-400 bg-violet-500/10 p-4 text-left'
                    : 'rounded-xl border-2 border-white/10 bg-white/5 p-4 text-left hover:border-white/30'
                }
              >
                <div className="font-semibold text-white">{label}</div>
                <div className="mt-1 text-sm text-white/60">{help}</div>
              </button>
            ))}
          </div>

          {problemType === 'OPEN_ANSWER' ? (
            <div>
              <label className={labelClass}>Correct answer</label>
              <input
                className={inputClass}
                value={correctAnswer}
                placeholder="For example: 3"
                onChange={(e) => setCorrectAnswer(e.target.value)}
              />
              {fieldError('correctAnswer')}
            </div>
          ) : (
            <div>
              <label className={labelClass}>Options</label>
              <p className="mb-3 text-xs text-white/50">
                Click the letter circle of the correct option to mark it.
              </p>
              <div className="space-y-3">
                {options.map((opt, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <button
                      type="button"
                      title="Mark as correct"
                      onClick={() => setCorrect(index)}
                      className={
                        opt.isCorrect
                          ? 'mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-green-500 text-sm font-bold text-white'
                          : 'mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/20 text-sm text-white/70 hover:border-green-400'
                      }
                    >
                      {opt.isCorrect ? '✓' : String.fromCharCode(65 + index)}
                    </button>
                    <div className="min-w-0 flex-1">
                      <RichMathInput
                        compact
                        minRows={1}
                        value={opt.optionText}
                        placeholder={`Option ${String.fromCharCode(65 + index)}`}
                        onChange={(text) => setOptionText(index, text)}
                      />
                    </div>
                    {options.length > 2 && (
                      <button
                        type="button"
                        title="Remove option"
                        onClick={() => removeOption(index)}
                        className="px-2 pt-2 text-white/50 hover:text-red-400"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={addOption}
                className="mt-3 text-sm text-violet-300 hover:text-violet-200"
              >
                + Add option
              </button>
              {fieldError('options')}
            </div>
          )}
        </section>
      )}

      {step === 3 && (
        <section className={cardClass}>
          <StepHeader
            title="Hints and explanation"
            subtitle="Both are optional. Students reveal hints one by one, in this order."
          />

          <div className="space-y-4">
            {hints.map((hint, index) => (
              <div
                key={index}
                className="space-y-2 rounded-xl border border-white/10 bg-black/20 p-4"
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-amber-200">Hint {index + 1}</span>
                  <span className="ml-auto flex items-center gap-1">
                    <button
                      type="button"
                      title="Move up"
                      disabled={index === 0}
                      onClick={() => moveHint(index, -1)}
                      className="px-2 text-white/50 hover:text-white disabled:opacity-30"
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      title="Move down"
                      disabled={index === hints.length - 1}
                      onClick={() => moveHint(index, 1)}
                      className="px-2 text-white/50 hover:text-white disabled:opacity-30"
                    >
                      ↓
                    </button>
                    <button
                      type="button"
                      title="Remove hint"
                      onClick={() => removeHint(index)}
                      className="px-2 text-white/50 hover:text-red-400"
                    >
                      ✕
                    </button>
                  </span>
                </div>
                <RichMathInput
                  minRows={2}
                  value={hint}
                  placeholder={`Hint ${index + 1}`}
                  onChange={(text) => setHintText(index, text)}
                />
              </div>
            ))}
          </div>

          {hints.length < MAX_HINTS && (
            <button
              type="button"
              onClick={addHint}
              className="w-full rounded-xl border border-dashed border-white/20 px-4 py-3 text-sm text-violet-300 hover:border-violet-400 hover:text-violet-200"
            >
              + Add hint ({hints.length} / {MAX_HINTS})
            </button>
          )}

          <div className="space-y-2 border-t border-white/10 pt-5">
            <label className={labelClass}>Explanation (shown after the problem is solved)</label>
            <RichMathInput
              value={explanation}
              onChange={setExplanation}
              minRows={4}
              placeholder="Explain the solution step by step…"
            />
          </div>

          <div className="border-t border-white/10 pt-5">
            <ImageUploadField
              label="Explanation image (optional)"
              value={explanationRemoved ? null : explanationImageUrl}
              pendingFile={explanationFile}
              busy={submitting}
              onPick={pickExplanationImage}
              onRemove={removeExplanationImage}
            />
          </div>
        </section>
      )}

      {step === LAST_STEP && (
        <div className="space-y-5">
          <section className={cardClass}>
            <StepHeader
              title="Review"
              subtitle="Check the settings and how students will see this problem."
            />

            {Object.keys(pending).length > 0 && (
              <div className="space-y-2 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
                <div className="font-medium">Fix these before saving:</div>
                {Object.keys(pending).map((key) => (
                  <div key={key} className="flex items-center gap-2">
                    <span>{pending[key]}</span>
                    <button
                      type="button"
                      onClick={() => goTo(ERROR_STEP[key])}
                      className="ml-auto underline"
                    >
                      Go to {STEPS[ERROR_STEP[key]].label}
                    </button>
                  </div>
                ))}
              </div>
            )}

            <dl className="divide-y divide-white/10 rounded-lg border border-white/10 text-sm">
              {summary.map(([label, value, stepIndex]) => (
                <div key={label} className="flex items-center gap-3 px-4 py-2.5">
                  <dt className="w-36 text-white/50">{label}</dt>
                  <dd className="min-w-0 flex-1 break-all text-white">{value}</dd>
                  <button
                    type="button"
                    onClick={() => goTo(stepIndex)}
                    className="text-violet-300 hover:text-violet-200"
                  >
                    Edit
                  </button>
                </div>
              ))}
            </dl>
          </section>

          <ProblemPreview
            questionText={questionText}
            problemType={problemType}
            options={options}
            correctAnswer={correctAnswer}
            hints={hints}
            explanation={explanation}
            xpReward={xpReward}
            mainCategoryName={mainCategoryName}
            categoryName={categoryName}
            levelLabel={levelLabel}
          />
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
          {error}
        </div>
      )}

      <div className="flex items-center justify-between">
        <button
          type="button"
          className={ghostBtn}
          disabled={step === 0}
          onClick={() => goTo(step - 1)}
        >
          ← Back
        </button>
        {step < LAST_STEP ? (
          <button type="button" className={primaryBtn} onClick={next}>
            Next →
          </button>
        ) : (
          <button type="button" className={primaryBtn} disabled={submitting} onClick={save}>
            {submitting ? 'Saving…' : submitLabel}
          </button>
        )}
      </div>
    </form>
  );
}
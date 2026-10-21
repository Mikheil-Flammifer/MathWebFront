import MathText from '../MathText';
import { getCategoryTheme } from '../../utils/constants';

export default function ProblemPreview({
  questionText,
  problemType,
  options,
  correctAnswer,
  hints,
  explanation,
  xpReward,
  mainCategoryName,
  categoryName,
  levelLabel,
}) {
  const theme = mainCategoryName ? getCategoryTheme(mainCategoryName) : null;
  const color = theme?.color ?? '#8b5cf6';

  const filledOptions = (options || []).filter((o) => o.optionText.trim());
  const filledHints = (hints || []).filter((h) => h.trim());
  const isMultiple = problemType === 'MULTIPLE_CHOICE';
  const hasSolution = (correctAnswer || '').trim() || (explanation || '').trim();

  return (
    <div className="space-y-4">
      <div className="text-xs uppercase tracking-wide text-white/40">
        Live preview · what students see
      </div>

      <div className="space-y-5 rounded-xl border border-white/10 bg-white/[0.03] p-6">
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <span className="inline-flex items-center gap-2">
            <span
              className="inline-block h-3 w-3 rounded-full"
              style={{ background: color }}
            />
            <span className="font-semibold text-white">
              {mainCategoryName || 'Category'}
            </span>
            {categoryName && categoryName !== mainCategoryName && (
              <span className="text-white/60">· {categoryName}</span>
            )}
          </span>
          {levelLabel && <span className="text-white/60">{levelLabel}</span>}
          <span className="text-white/60">{xpReward || 0} XP</span>
        </div>

        <div className="text-xl leading-relaxed text-white">
          {questionText.trim() ? (
            <MathText text={questionText} />
          ) : (
            <span className="text-white/30">The question will appear here…</span>
          )}
        </div>

        {isMultiple ? (
          <div className="space-y-2">
            {filledOptions.length === 0 && (
              <p className="text-sm text-white/30">The answer options will appear here…</p>
            )}
            {filledOptions.map((opt, index) => (
              <div
                key={index}
                className="flex items-center justify-between gap-3 rounded-lg border px-4 py-3 text-lg text-white"
                style={{
                  borderColor: opt.isCorrect ? '#4ade80' : 'rgba(148,163,184,0.3)',
                  background: opt.isCorrect ? 'rgba(74,222,128,0.10)' : 'transparent',
                }}
              >
                <span>
                  <MathText text={opt.optionText} />
                </span>
                {opt.isCorrect && (
                  <span className="shrink-0 text-xs font-semibold text-green-300">
                    ✓ correct
                  </span>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white/40">
            Students type their answer here
          </div>
        )}

        {filledHints.length > 0 && (
          <div className="space-y-2">
            <div className="text-xs uppercase tracking-wide text-white/40">
              Hints (students reveal them one by one)
            </div>
            {filledHints.map((hint, index) => (
              <div
                key={index}
                className="rounded-lg border border-amber-300/30 bg-amber-300/10 px-4 py-3 text-white"
              >
                <span className="mr-2 font-semibold text-amber-200">Hint {index + 1}:</span>
                <MathText text={hint} />
              </div>
            ))}
          </div>
        )}
      </div>

      {hasSolution && (
        <div className="space-y-3 rounded-xl border border-white/10 bg-white/[0.03] p-6">
          <div className="text-xs uppercase tracking-wide text-white/40">
            Shown after solving
          </div>
          {!isMultiple && correctAnswer.trim() && (
            <p className="text-lg text-white">
              <span className="text-white/60">Answer:</span>{' '}
              <MathText text={correctAnswer} />
            </p>
          )}
          {explanation.trim() && (
            <p className="text-lg leading-relaxed text-white">
              <MathText text={explanation} />
            </p>
          )}
        </div>
      )}
    </div>
  );
}
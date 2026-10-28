import { useRef, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { ArrowLeft, CheckCircle2, Eye, Lightbulb, Pencil } from 'lucide-react'
import api from '../../api/axios'
import { problemApi } from '../../api/problemApi'
import { getCategoryTheme } from '../../utils/constants'
import useAuthStore from '../../store/authStore'
import MathText from '../../components/MathText'

function fileUrl(path) {
  if (!path) return null
  if (/^https?:\/\//i.test(path)) return path
  const base = (api.defaults.baseURL || '').replace(/\/$/, '')
  return `${base}/${path.replace(/^\//, '')}`
}

function errMessage(err, fallback) {
  return err?.response?.data?.message || err?.message || fallback
}

function hintText(hint) {
  if (typeof hint === 'string') return hint
  return hint?.text ?? hint?.hintText ?? hint?.content ?? ''
}

function HintCard({ hint, number }) {
  return (
    <div
      className="rounded-lg px-4 py-3 border text-sm space-y-1"
      style={{
        borderColor: 'rgba(250,204,21,0.35)',
        background: 'rgba(250,204,21,0.08)',
      }}
    >
      <div className="flex items-center gap-2 text-yellow-300 font-semibold">
        <Lightbulb size={14} /> Hint {number}
      </div>
      <div>
        <MathText text={hintText(hint)} />
      </div>
    </div>
  )
}

function ProblemView({ id }) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const isStaff = useAuthStore((s) => s.isAdminOrTeacher())

  const [selectedOptionId, setSelectedOptionId] = useState(null)
  const [openAnswer, setOpenAnswer] = useState('')
  const [result, setResult] = useState(null)
  const [wrongCount, setWrongCount] = useState(0)
  const [confirmGiveUp, setConfirmGiveUp] = useState(false)
  const [penalty, setPenalty] = useState(0)
  const [questDone, setQuestDone] = useState(false)
  const [showOldHints, setShowOldHints] = useState(false)
  // How many hints were already open when this page was loaded.
  const baseHintCountRef = useRef(null)

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['problem', String(id)],
    queryFn: () => problemApi.getById(id),
    retry: false,
  })

  const submitMutation = useMutation({
    mutationFn: (payload) => problemApi.submit(payload),
    onSuccess: (res) => {
      setResult(res)
      if (res.correct) {
        toast.success(res.xpEarned ? `Correct! +${res.xpEarned} XP` : 'Correct!')
        if (res.questCompleted) toast.success('Quest completed! 🎉')
        queryClient.invalidateQueries({ queryKey: ['problem', String(id)] })
        queryClient.invalidateQueries({ queryKey: ['quest-map'] })
        queryClient.invalidateQueries({ queryKey: ['quests'] })
        queryClient.invalidateQueries({ queryKey: ['progress'] })
      } else {
        setWrongCount((c) => c + 1)
        toast.error('Not quite. Try again!')
      }
    },
    onError: (err) => {
      const status = err?.response?.status
      toast.error(errMessage(err, 'Could not submit answer'))
      if (status === 400) {
        queryClient.invalidateQueries({ queryKey: ['quest-map'] })
        navigate(data?.questId ? `/quests/${data.questId}` : -1)
      }
    },
  })

  const hintMutation = useMutation({
    mutationFn: () => problemApi.hint(id),
    onSuccess: (res) => {
      queryClient.setQueryData(['problem', String(id)], (old) =>
        old
          ? {
              ...old,
              hints: res.hints,
              hintsUsed: res.hintsUsed,
              hintCount: res.hintCount,
            }
          : old
      )
      queryClient.invalidateQueries({ queryKey: ['progress'] })
    },
    onError: (err) => {
      toast.error(errMessage(err, 'Could not load the hint'))
    },
  })

  const giveUpMutation = useMutation({
    mutationFn: () => problemApi.giveUp(id),
    onSuccess: (res) => {
      setConfirmGiveUp(false)
      setPenalty(res.xpPenalty ?? 0)
      queryClient.setQueryData(['problem', String(id)], (old) =>
        old
          ? {
              ...old,
              answerRevealed: true,
              correctAnswer: res.correctAnswer,
              correctOptionId: res.correctOptionId,
              explanation: res.explanation,
              explanationImagePath: res.explanationImagePath,
            }
          : old
      )
      if (res.xpPenalty > 0) toast(`Solution revealed. -${res.xpPenalty} XP`)
      else toast('Solution revealed')
      if (res.questCompleted) {
        setQuestDone(true)
        toast.success('Quest completed! 🎉')
      }
      queryClient.invalidateQueries({ queryKey: ['problem', String(id)] })
      queryClient.invalidateQueries({ queryKey: ['quest-map'] })
      queryClient.invalidateQueries({ queryKey: ['quests'] })
      queryClient.invalidateQueries({ queryKey: ['progress'] })
    },
    onError: (err) => {
      setConfirmGiveUp(false)
      toast.error(errMessage(err, 'Could not reveal the solution'))
      if (err?.response?.status === 400) {
        queryClient.invalidateQueries({ queryKey: ['problem', String(id)] })
      }
    },
  })

  if (isLoading) return <div className="p-8 opacity-70">Loading problem…</div>

  if (isError) {
    const status = error?.response?.status
    return (
      <div className="p-8 space-y-4">
        <p>
          {status === 400
            ? errMessage(error, 'This problem is locked.')
            : status === 404
              ? 'Problem not found.'
              : 'Couldn’t load this problem.'}
        </p>
        <button className="btn-primary" onClick={() => navigate(-1)}>
          Back to map
        </button>
      </div>
    )
  }

  const theme = getCategoryTheme(data.mainCategoryName)
  const isMultiple = data.problemType === 'MULTIPLE_CHOICE'
  const revealed = data.answerRevealed === true
  const solved = data.solved === true || result?.correct === true
  const showSolution = solved || revealed
  const attemptsUsed = result?.attemptsUsed ?? data.attemptsUsed ?? 0
  const explanation = result?.correct ? result.explanation : data.explanation
  const explanationImage = result?.correct
    ? result.explanationImagePath
    : data.explanationImagePath
  const correctAnswer = data.correctAnswer
  const correctOptionId = data.correctOptionId ?? null
  const mapLink = data.questId ? `/quests/${data.questId}` : '/quests'

  const options = [...(data.answerOptions || [])].sort(
    (a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0)
  )

  const hints = Array.isArray(data.hints) ? data.hints : []
  const hintCount = data.hintCount ?? hints.length
  const hasMoreHints = hints.length < hintCount
  const showHintBlock = hintCount > 0

  // Remember how many hints were open on the first render with data.
  // Staff get every hint in the response, so for them nothing is collapsed.
  if (baseHintCountRef.current === null) {
    baseHintCountRef.current = isStaff ? 0 : hints.length
  }
  const baseHintCount = Math.min(baseHintCountRef.current, hints.length)
  const oldHints = hints.slice(0, baseHintCount)
  const newHints = hints.slice(baseHintCount)

  const xpReward = data.xpReward ?? 0
  const estimatedPenalty = xpReward > 0 ? Math.max(1, Math.round(xpReward / 2)) : 0

  const canSubmit =
    !showSolution &&
    !submitMutation.isPending &&
    (isMultiple ? selectedOptionId !== null : openAnswer.trim().length > 0)

  const handleSubmit = () => {
    if (!canSubmit) return
    const payload = isMultiple
      ? { problemId: data.id, selectedOptionId }
      : { problemId: data.id, openAnswer: openAnswer.trim() }
    submitMutation.mutate(payload)
  }

  return (
    <div className="space-y-4 max-w-3xl mx-auto">
      <div className="flex items-center justify-between gap-3">
        <Link
          to={mapLink}
          className="inline-flex items-center gap-1 text-sm opacity-80 hover:opacity-100"
        >
          <ArrowLeft size={16} /> Back to map
        </Link>

        {isStaff && (
          <Link
            to={`/admin/problems/${data.id}/edit`}
            className="inline-flex items-center gap-1 rounded-lg border border-white/15 px-3 py-1.5 text-sm text-white/80 hover:bg-white/5"
          >
            <Pencil size={14} /> Edit problem
          </Link>
        )}
      </div>

      <div className="card p-5 space-y-4">
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <span className="inline-flex items-center gap-2">
            <span
              className="inline-block w-3 h-3 rounded-full"
              style={{ background: theme.color }}
            />
            <span className="font-semibold">{data.mainCategoryName}</span>
            {data.categoryName && data.categoryName !== data.mainCategoryName && (
              <span className="opacity-70">· {data.categoryName}</span>
            )}
          </span>
          <span className={revealed ? 'text-amber-300' : 'opacity-70'}>
            {revealed ? '0 XP (answer revealed)' : `${xpReward} XP`}
          </span>
          <span className="opacity-70">
            Attempt {showSolution ? attemptsUsed : attemptsUsed + 1}
          </span>
        </div>

        <p className="text-lg">
          <MathText text={data.questionText} />
        </p>

        {data.questionImagePath && (
          <img
            src={fileUrl(data.questionImagePath)}
            alt="Problem illustration"
            className="max-h-80 rounded-lg"
          />
        )}

        {data.embedUrl && (
          <iframe
            src={data.embedUrl}
            title="Interactive graph"
            width="100%"
            height="450"
            loading="lazy"
            sandbox="allow-scripts allow-same-origin allow-popups"
            style={{ border: 0 }}
            className="rounded-lg bg-white"
          />
        )}

        {isMultiple ? (
          <div className="space-y-2">
            {options.map((opt) => {
              const selected = !showSolution && selectedOptionId === opt.id
              const isCorrectOption =
                showSolution && correctOptionId !== null && opt.id === correctOptionId
              let borderColor = 'rgba(148,163,184,0.3)'
              let background = 'transparent'
              if (isCorrectOption) {
                borderColor = 'rgba(74,222,128,0.7)'
                background = 'rgba(74,222,128,0.12)'
              } else if (selected) {
                borderColor = theme.color
                background = `${theme.color}22`
              }
              return (
                <button
                  key={opt.id}
                  type="button"
                  disabled={showSolution}
                  onClick={() => setSelectedOptionId(opt.id)}
                  className="w-full text-left rounded-lg px-4 py-3 border transition disabled:opacity-80"
                  style={{ borderColor, background }}
                >
                  <MathText text={opt.optionText} />
                  {opt.optionImagePath && (
                    <img
                      src={fileUrl(opt.optionImagePath)}
                      alt=""
                      className="mt-2 max-h-32 rounded"
                    />
                  )}
                </button>
              )
            })}
          </div>
        ) : (
          <input
            className="input-field w-full"
            placeholder="Your answer"
            value={openAnswer}
            disabled={showSolution}
            onChange={(e) => setOpenAnswer(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSubmit()
            }}
          />
        )}

        {showHintBlock && (
          <div className="space-y-2">
            {oldHints.length > 0 && (
              <button
                type="button"
                className="inline-flex items-center gap-2 text-sm text-yellow-300 hover:text-yellow-200"
                onClick={() => setShowOldHints((v) => !v)}
              >
                <Lightbulb size={14} />
                {showOldHints
                  ? `Hide opened hints (${oldHints.length})`
                  : `Show opened hints (${oldHints.length})`}
              </button>
            )}

            {showOldHints &&
              oldHints.map((hint, index) => (
                <HintCard key={index} hint={hint} number={index + 1} />
              ))}

            {newHints.map((hint, index) => (
              <HintCard
                key={baseHintCount + index}
                hint={hint}
                number={baseHintCount + index + 1}
              />
            ))}

            {!showSolution && hasMoreHints && (
              <button
                type="button"
                className="btn-secondary inline-flex items-center gap-2"
                disabled={hintMutation.isPending}
                onClick={() => hintMutation.mutate()}
              >
                <Lightbulb size={16} />
                {hintMutation.isPending
                  ? 'Loading…'
                  : `Show hint (${hints.length + 1} / ${hintCount})`}
              </button>
            )}
          </div>
        )}

        {!showSolution && result && result.correct === false && (
          <p className="text-sm text-red-300">
            Wrong answer. Wrong tries this session: {wrongCount}. There is no limit, so try again.
          </p>
        )}

        {!showSolution && (
          <div className="flex flex-wrap items-center gap-3">
            <button className="btn-primary" disabled={!canSubmit} onClick={handleSubmit}>
              {submitMutation.isPending ? 'Checking…' : 'Submit answer'}
            </button>

            {!confirmGiveUp && (
              <button
                type="button"
                className="btn-secondary inline-flex items-center gap-2"
                onClick={() => setConfirmGiveUp(true)}
              >
                <Eye size={16} /> Give up
              </button>
            )}
          </div>
        )}

        {!showSolution && confirmGiveUp && (
          <div
            className="rounded-lg px-4 py-3 border text-sm space-y-3"
            style={{
              borderColor: 'rgba(248,113,113,0.4)',
              background: 'rgba(248,113,113,0.08)',
            }}
          >
            <p>
              Show the solution?{' '}
              {estimatedPenalty > 0
                ? `You will lose about ${estimatedPenalty} XP`
                : 'This problem has no XP to lose'}{' '}
              and earn no XP for this problem. This cannot be undone.
            </p>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                className="btn-primary"
                disabled={giveUpMutation.isPending}
                onClick={() => giveUpMutation.mutate()}
              >
                {giveUpMutation.isPending ? 'Loading…' : 'Yes, show the solution'}
              </button>
              <button
                type="button"
                className="btn-secondary"
                disabled={giveUpMutation.isPending}
                onClick={() => setConfirmGiveUp(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {showSolution && (
        <div className="card p-5 space-y-3">
          {revealed ? (
            <div className="flex items-center gap-2 text-amber-300 font-semibold">
              <Eye size={20} /> Answer revealed
            </div>
          ) : (
            <div className="flex items-center gap-2 text-green-300 font-semibold">
              <CheckCircle2 size={20} /> Solved
            </div>
          )}

          {revealed && (
            <p className="text-sm opacity-70">
              No XP for this problem.
              {penalty > 0 ? ` -${penalty} XP was deducted.` : ''}
            </p>
          )}

          {questDone && (
            <p className="text-sm text-green-300 font-semibold">Quest completed! 🎉</p>
          )}

          {correctAnswer && (
            <p className="text-sm">
              <span className="opacity-70">Answer:</span> <MathText text={correctAnswer} />
            </p>
          )}
          {explanation && (
            <p>
              <MathText text={explanation} />
            </p>
          )}
          {explanationImage && (
            <img
              src={fileUrl(explanationImage)}
              alt="Explanation"
              className="max-h-80 rounded-lg"
            />
          )}
          <button className="btn-primary" onClick={() => navigate(mapLink)}>
            {revealed ? 'Continue' : 'Back to map'}
          </button>
        </div>
      )}
    </div>
  )
}

export default function ProblemPage() {
  const { id } = useParams()
  return <ProblemView key={id} id={id} />
}
import { useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { ArrowLeft, CheckCircle2 } from 'lucide-react'
import api from '../../api/axios'
import { problemApi } from '../../api/problemApi'
import { getCategoryTheme } from '../../utils/constants'

function fileUrl(path) {
  if (!path) return null
  if (/^https?:\/\//i.test(path)) return path
  const base = (api.defaults.baseURL || '').replace(/\/$/, '')
  return `${base}/${path.replace(/^\//, '')}`
}

function errMessage(err, fallback) {
  return err?.response?.data?.message || err?.message || fallback
}

function ProblemView({ id }) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [selectedOptionId, setSelectedOptionId] = useState(null)
  const [openAnswer, setOpenAnswer] = useState('')
  const [result, setResult] = useState(null)
  const [wrongCount, setWrongCount] = useState(0)

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
  const solved = data.solved === true || result?.correct === true
  const attemptsUsed = result?.attemptsUsed ?? data.attemptsUsed ?? 0
  const explanation = result?.correct ? result.explanation : data.explanation
  const explanationImage = result?.correct
    ? result.explanationImagePath
    : data.explanationImagePath
  const correctAnswer = data.correctAnswer
  const mapLink = data.questId ? `/quests/${data.questId}` : '/quests'

  const options = [...(data.answerOptions || [])].sort(
    (a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0)
  )

  const canSubmit =
    !solved &&
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
      <Link
        to={mapLink}
        className="inline-flex items-center gap-1 text-sm opacity-80 hover:opacity-100"
      >
        <ArrowLeft size={16} /> Back to map
      </Link>

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
          <span className="opacity-70">{data.xpReward} XP</span>
          <span className="opacity-70">Attempt {solved ? attemptsUsed : attemptsUsed + 1}</span>
        </div>

        <p className="text-lg whitespace-pre-wrap">{data.questionText}</p>

        {data.questionImagePath && (
          <img
            src={fileUrl(data.questionImagePath)}
            alt="Problem illustration"
            className="max-h-80 rounded-lg"
          />
        )}

        {isMultiple ? (
          <div className="space-y-2">
            {options.map((opt) => {
              const selected = selectedOptionId === opt.id
              return (
                <button
                  key={opt.id}
                  type="button"
                  disabled={solved}
                  onClick={() => setSelectedOptionId(opt.id)}
                  className="w-full text-left rounded-lg px-4 py-3 border transition disabled:opacity-60"
                  style={{
                    borderColor: selected ? theme.color : 'rgba(148,163,184,0.3)',
                    background: selected ? `${theme.color}22` : 'transparent',
                  }}
                >
                  <span>{opt.optionText}</span>
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
            disabled={solved}
            onChange={(e) => setOpenAnswer(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSubmit()
            }}
          />
        )}

        {!solved && result && result.correct === false && (
          <p className="text-sm text-red-300">
            Wrong answer. Wrong tries this session: {wrongCount}. There is no limit, so try again.
          </p>
        )}

        {!solved && (
          <button className="btn-primary" disabled={!canSubmit} onClick={handleSubmit}>
            {submitMutation.isPending ? 'Checking…' : 'Submit answer'}
          </button>
        )}
      </div>

      {solved && (
        <div className="card p-5 space-y-3">
          <div className="flex items-center gap-2 text-green-300 font-semibold">
            <CheckCircle2 size={20} /> Solved
          </div>
          {correctAnswer && (
            <p className="text-sm">
              <span className="opacity-70">Answer:</span> {correctAnswer}
            </p>
          )}
          {explanation && <p className="whitespace-pre-wrap">{explanation}</p>}
          {explanationImage && (
            <img
              src={fileUrl(explanationImage)}
              alt="Explanation"
              className="max-h-80 rounded-lg"
            />
          )}
          <button className="btn-primary" onClick={() => navigate(mapLink)}>
            Back to map
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
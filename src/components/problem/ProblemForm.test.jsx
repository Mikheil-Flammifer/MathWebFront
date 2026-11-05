import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import ProblemForm from './ProblemForm'

vi.mock('../../api/axios', () => ({
  default: { get: vi.fn().mockResolvedValue({ data: { data: [] } }) },
}))

// MathLive does not run in jsdom, so use a plain textarea instead.
vi.mock('../RichMathInput', async () => {
  const React = await import('react')
  return {
    default: ({ value, onChange }) =>
      React.createElement('textarea', {
        'aria-label': 'math-input',
        value,
        onChange: (e) => onChange(e.target.value),
      }),
  }
})

vi.mock('./ImageUploadField', () => ({ default: () => null }))
vi.mock('./ProblemPreview', () => ({ default: () => null }))

const baseInitial = {
  questId: 1,
  categoryId: 11,
  questionText: 'What is 1+2?',
  correctAnswer: '3',
}

function renderForm(initial, props = {}) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  const onSubmit = vi.fn()
  render(
    <QueryClientProvider client={client}>
      <ProblemForm
        initial={initial}
        quests={[{ id: 1, title: 'Quest 1', difficultyLevel: 'LEVEL_1_BEGINNER', totalProblems: 0 }]}
        onSubmit={onSubmit}
        {...props}
      />
    </QueryClientProvider>
  )
  return { onSubmit, user: userEvent.setup() }
}

const clickNext = (user) => user.click(screen.getByRole('button', { name: /next/i }))

describe('ProblemForm embed link', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it.each([
    'https://evil.com/calculator/abc',
    'http://www.desmos.com/calculator/abc',
    'javascript:alert(1)',
  ])('blocks Next on the Question step for %s', async (embedUrl) => {
    const { user } = renderForm({ ...baseInitial, embedUrl })

    await clickNext(user) // Basics -> Question
    await clickNext(user) // Question -> should be blocked

    expect(screen.getByText(/only https links from desmos\.com or geogebra\.org/i)).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Answer' })).toBeNull()
  })

  it('lets the user fix the link and continue', async () => {
    const { user } = renderForm({ ...baseInitial, embedUrl: 'https://evil.com/x' })

    await clickNext(user)
    await clickNext(user)
    expect(screen.getByText(/only https links/i)).toBeInTheDocument()

    const input = screen.getByPlaceholderText(/desmos or geogebra/i)
    await user.clear(input)
    await user.type(input, 'https://www.desmos.com/calculator/abc123')
    await clickNext(user)

    expect(screen.getByRole('heading', { name: 'Answer' })).toBeInTheDocument()
  })

  it('allows an empty link', async () => {
    const { user } = renderForm({ ...baseInitial, embedUrl: '' })

    await clickNext(user)
    await clickNext(user)

    expect(screen.getByRole('heading', { name: 'Answer' })).toBeInTheDocument()
  })

  it('saves a valid link trimmed in the payload', async () => {
    const { user, onSubmit } = renderForm({
      ...baseInitial,
      embedUrl: '  https://www.desmos.com/calculator/abc123  ',
    })

    for (let i = 0; i < 4; i++) await clickNext(user)
    await user.click(screen.getByRole('button', { name: 'Save' }))

    expect(onSubmit).toHaveBeenCalledTimes(1)
    expect(onSubmit.mock.calls[0][0].embedUrl).toBe('https://www.desmos.com/calculator/abc123')
  })

  it('does not save when the link is invalid, even from the Review step', async () => {
    const { user, onSubmit } = renderForm({ ...baseInitial, embedUrl: 'https://evil.com/x' })

    await user.click(screen.getByRole('button', { name: /review/i })) // jump via the stepper
    await user.click(screen.getByRole('button', { name: 'Save' }))

    expect(onSubmit).not.toHaveBeenCalled()
  })
})
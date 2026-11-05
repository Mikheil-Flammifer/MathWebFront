import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import ProblemPage from './ProblemPage'
import { problemApi } from '../../api/problemApi'

vi.mock('../../api/axios', () => ({
  default: { defaults: { baseURL: '' } },
}))

vi.mock('../../api/problemApi', () => ({
  problemApi: {
    getById: vi.fn(),
    submit: vi.fn(),
    hint: vi.fn(),
    giveUp: vi.fn(),
  },
}))

vi.mock('../../store/authStore', () => ({
  default: (selector) => selector({ isAdminOrTeacher: () => false }),
}))

const baseProblem = {
  id: 1,
  questionText: 'What is 2+2?',
  problemType: 'OPEN_ANSWER',
  questId: 5,
  mainCategoryName: 'Algebra',
  categoryName: 'Equations',
  xpReward: 10,
  solved: false,
  answerRevealed: false,
  answerOptions: [],
  hints: [],
  hintCount: 0,
  attemptsUsed: 0,
  embedUrl: null,
}

function renderPage() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={['/problems/1']}>
        <Routes>
          <Route path="/problems/:id" element={<ProblemPage />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  )
}

describe('ProblemPage embed iframe', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('shows the iframe for an allowed Desmos link', async () => {
    problemApi.getById.mockResolvedValue({
      ...baseProblem,
      embedUrl: 'https://www.desmos.com/calculator/abc123',
    })
    renderPage()

    await screen.findByText(/Attempt/)
    const frame = screen.getByTitle('Interactive graph')
    expect(frame).toHaveAttribute('src', 'https://www.desmos.com/calculator/abc123')
  })

  it('shows the iframe for an allowed GeoGebra link', async () => {
    problemApi.getById.mockResolvedValue({
      ...baseProblem,
      embedUrl: 'https://www.geogebra.org/calculator/xyz',
    })
    renderPage()

    await screen.findByText(/Attempt/)
    expect(screen.getByTitle('Interactive graph')).toBeInTheDocument()
  })

  it.each([
    'https://evil.com/calculator/abc',
    'http://www.desmos.com/calculator/abc',
    'javascript:alert(1)',
    'https://desmos.com.evil.com/x',
  ])('does not render an iframe for %s', async (embedUrl) => {
    problemApi.getById.mockResolvedValue({ ...baseProblem, embedUrl })
    renderPage()

    await screen.findByText(/Attempt/)
    expect(screen.queryByTitle('Interactive graph')).toBeNull()
  })

  it('does not render an iframe when there is no embed link', async () => {
    problemApi.getById.mockResolvedValue(baseProblem)
    renderPage()

    await screen.findByText(/Attempt/)
    expect(screen.queryByTitle('Interactive graph')).toBeNull()
  })
})
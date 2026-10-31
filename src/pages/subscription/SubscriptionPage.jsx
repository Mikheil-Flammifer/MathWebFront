import { useEffect, useRef, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Link, useNavigate } from 'react-router-dom'
import { CheckCircle2, Loader2, Clock, AlertCircle } from 'lucide-react'
import { fetchPlans } from '../../api/plansApi'
import { fetchMySubscription } from '../../api/subscriptionApi'
import { getPaddle, onPaddleEvent } from '../../utils/paddle'
import useAuthStore from '../../store/authStore'

const POLL_INTERVAL_MS = 2000
const MAX_POLL_ATTEMPTS = 15 // about 30 seconds
const AFTER_ACTIVE_REDIRECT = '/home'

const formatPrice = (priceCents, currency) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(priceCents / 100)

const formatDate = (value) => {
  if (!value) return ''
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '' : date.toLocaleDateString()
}

function Banner({ tone, icon: Icon, children }) {
  const tones = {
    success: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200',
    info: 'border-plasma-500/30 bg-plasma-500/10 text-plasma-200',
    warn: 'border-amber-500/30 bg-amber-500/10 text-amber-200',
  }
  return (
    <div
      role="status"
      className={`mx-auto mb-6 max-w-lg flex items-start gap-2.5 rounded-xl border px-4 py-3 text-sm text-left ${tones[tone]}`}
    >
      <Icon size={16} className="mt-0.5 shrink-0" />
      <span>{children}</span>
    </div>
  )
}

export default function SubscriptionPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const user = useAuthStore((s) => s.user)
  const updateUser = useAuthStore((s) => s.updateUser)

  // idle -> activating -> active | delayed
  const [phase, setPhase] = useState('idle')
  const [openingCode, setOpeningCode] = useState(null)
  const [errorMessage, setErrorMessage] = useState('')
  const completedHandledRef = useRef(false)

  const {
    data: plans,
    isLoading: plansLoading,
    isError: plansError,
    refetch: refetchPlans,
    isFetching: plansFetching,
  } = useQuery({
    queryKey: ['plans'],
    queryFn: fetchPlans,
    staleTime: 5 * 60 * 1000,
  })

  const { data: mySubscription } = useQuery({
    queryKey: ['mySubscription', user?.id],
    queryFn: fetchMySubscription,
    enabled: isAuthenticated,
    staleTime: 0,
  })

  // Load Paddle.js early so the click opens instantly. Errors show only on Buy.
  useEffect(() => {
    if (isAuthenticated) {
      getPaddle().catch(() => {})
    }
  }, [isAuthenticated])

  // "checkout.completed" only means "paid". It never unlocks anything by itself.
  useEffect(() => {
    const unsubscribe = onPaddleEvent((event) => {
      if (event?.name !== 'checkout.completed' || completedHandledRef.current) {
        return
      }
      completedHandledRef.current = true
      getPaddle()
        .then((Paddle) => Paddle.Checkout.close())
        .catch(() => {})
      setPhase('activating')
    })
    return unsubscribe
  }, [])

  // Poll the server until it says isActive === true.
  useEffect(() => {
    if (phase !== 'activating') return undefined

    let cancelled = false
    let attempts = 0
    let timer = null

    const tick = async () => {
      attempts += 1
      try {
        const subscription = await fetchMySubscription()
        if (cancelled) return
        if (subscription?.isActive === true) {
          queryClient.setQueryData(['mySubscription', user?.id], subscription)
          queryClient.invalidateQueries({ queryKey: ['me'] })
          updateUser({ hasActiveSubscription: true })
          setPhase('active')
          return
        }
      } catch (error) {
        // a failed poll is not a failed payment: keep trying until the limit
        console.warn('Subscription poll failed', error)
      }
      if (cancelled) return
      if (attempts >= MAX_POLL_ATTEMPTS) {
        setPhase('delayed')
        return
      }
      timer = setTimeout(tick, POLL_INTERVAL_MS)
    }

    timer = setTimeout(tick, 0)
    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [phase, queryClient, updateUser, user?.id])

  // Access is confirmed: go to the videos page.
  useEffect(() => {
    if (phase !== 'active') return undefined
    const timer = setTimeout(() => navigate(AFTER_ACTIVE_REDIRECT), 1500)
    return () => clearTimeout(timer)
  }, [phase, navigate])

  const handleBuy = async (plan) => {
    setErrorMessage('')

    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/subscribe' } })
      return
    }

    // The backend needs the user id as a NUMBER in customData.
    const userId = Number(user?.id)
    if (!Number.isInteger(userId) || userId <= 0) {
      setErrorMessage('Could not read your account id. Please log in again.')
      return
    }

    setOpeningCode(plan.code)
    try {
      const Paddle = await getPaddle()
      completedHandledRef.current = false
      Paddle.Checkout.open({
        items: [{ priceId: plan.paddlePriceId, quantity: 1 }],
        customData: { userId },
      })
    } catch (error) {
      console.error('Paddle checkout failed to open', error)
      setErrorMessage('Could not open the payment window. Please try again later.')
    } finally {
      setOpeningCode(null)
    }
  }

  const busy = phase !== 'idle'
  const activeUntil = mySubscription?.isActive
    ? formatDate(mySubscription.currentPeriodEnd)
    : ''

  return (
    <div className="text-center">
      <h1 className="page-title mb-2">Get access to all videos</h1>
      <p className="text-chalk-400 mb-8">
        One-time payment. No subscription, no automatic renewal.
      </p>

      {mySubscription?.isActive === true && phase === 'idle' && (
        <Banner tone="success" icon={CheckCircle2}>
          {activeUntil
            ? `Your access is active until ${activeUntil}. Buying again adds days after that date.`
            : 'Your access is active. Buying again adds days after the current end date.'}
        </Banner>
      )}

      {phase === 'activating' && (
        <Banner tone="info" icon={Loader2}>Activating your access...</Banner>
      )}

      {phase === 'active' && (
        <Banner tone="success" icon={CheckCircle2}>
          Your access is active. Taking you to the videos...
        </Banner>
      )}

      {phase === 'delayed' && (
        <Banner tone="warn" icon={Clock}>
          Payment received, access will activate shortly. Refresh in a minute.
        </Banner>
      )}

      {plansLoading && (
        <div className="grid sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
          <div className="rounded-2xl skeleton h-56" />
          <div className="rounded-2xl skeleton h-56" />
        </div>
      )}

      {plansError && (
        <div className="text-chalk-300">
          <p className="mb-3">Could not load prices, try again.</p>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => refetchPlans()}
            disabled={plansFetching}
          >
            {plansFetching ? <span className="spinner-sm" /> : 'Try again'}
          </button>
        </div>
      )}

      {plans && plans.length === 0 && (
        <p className="text-chalk-400">No plans are available right now.</p>
      )}

      {plans && plans.length > 0 && (
        <div className="grid sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.code}
              className="rounded-2xl border border-space-500 bg-space-800/70 p-6 flex flex-col"
            >
              <h2 className="text-lg font-semibold text-chalk-50">{plan.name}</h2>
              <p className="text-chalk-400 text-sm mt-1">
                {plan.durationDays} days of access
              </p>
              <p className="text-4xl font-semibold text-chalk-50 mt-5">
                {formatPrice(plan.priceCents, plan.currency)}
              </p>
              <button
                type="button"
                className="btn-primary mt-6 w-full justify-center"
                disabled={openingCode !== null || busy}
                onClick={() => handleBuy(plan)}
              >
                {!isAuthenticated
                  ? 'Log in to buy'
                  : openingCode === plan.code
                    ? 'Opening...'
                    : 'Buy'}
              </button>
            </div>
          ))}
        </div>
      )}

      {errorMessage && (
        <div role="alert" className="alert-error mx-auto mt-6 max-w-lg text-left">
          <AlertCircle size={16} className="mt-0.5 shrink-0" />
          {errorMessage}
        </div>
      )}

      <p className="mt-8 text-xs text-chalk-400">
        By buying you agree to the{' '}
        <Link to="/terms" className="text-plasma-300 hover:text-plasma-200">Terms</Link>
        {' '}and the{' '}
        <Link to="/refund" className="text-plasma-300 hover:text-plasma-200">Refund Policy</Link>.
      </p>
    </div>
  )
}
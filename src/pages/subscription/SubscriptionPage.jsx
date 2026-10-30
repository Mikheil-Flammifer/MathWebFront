import { useEffect, useRef, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { fetchPlans } from '../../api/plansApi'
import { fetchMySubscription } from '../../api/subscriptionApi'
import { getPaddle, onPaddleEvent } from '../../utils/paddle'
import useAuthStore from '../../store/authStore'
import './SubscriptionPage.css'

const POLL_INTERVAL_MS = 2000
const MAX_POLL_ATTEMPTS = 15 // about 30 seconds
const AFTER_ACTIVE_REDIRECT = '/home'

const formatPrice = (priceCents, currency) =>
  new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency,
  }).format(priceCents / 100)

const formatDate = (value) => {
  if (!value) return ''
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '' : date.toLocaleDateString()
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
    <div className="pricing-page">
      <h1 className="pricing-title">Get access to all videos</h1>
      <p className="pricing-subtitle">
        One-time payment. No subscription, no automatic renewal.
      </p>

      {mySubscription?.isActive === true && phase === 'idle' && (
        <div className="pricing-banner">
          {activeUntil
            ? `Your access is active until ${activeUntil}. Buying again adds days after that date.`
            : 'Your access is active. Buying again adds days after the current end date.'}
        </div>
      )}

      {phase === 'activating' && (
        <div className="pricing-banner">Activating your access...</div>
      )}

      {phase === 'active' && (
        <div className="pricing-banner">Your access is active. Taking you to the videos...</div>
      )}

      {phase === 'delayed' && (
        <div className="pricing-banner">
          Payment received, access will activate shortly. Refresh in a minute.
        </div>
      )}

      {plansLoading && <p className="pricing-status">Loading plans...</p>}

      {plansError && (
        <div className="pricing-status">
          <p>Could not load prices, try again.</p>
          <button type="button" className="pricing-btn" onClick={() => refetchPlans()}>
            Try again
          </button>
        </div>
      )}

      {plans && plans.length === 0 && (
        <p className="pricing-status">No plans are available right now.</p>
      )}

      {plans && plans.length > 0 && (
        <div className="pricing-grid">
          {plans.map((plan) => (
            <div key={plan.code} className="pricing-card">
              <h2 className="pricing-card-name">{plan.name}</h2>
              <div className="pricing-card-price">
                {formatPrice(plan.priceCents, plan.currency)}
              </div>
              <div className="pricing-card-duration">
                {plan.durationDays} days of access
              </div>
              <button
                type="button"
                className="pricing-btn pricing-btn-primary"
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

      {errorMessage && <p className="pricing-error">{errorMessage}</p>}
    </div>
  )
}
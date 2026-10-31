import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Route, PlayCircle, Layers, Sparkles, ArrowRight } from 'lucide-react'
import { fetchPlans } from '../../api/plansApi'

const perks = [
  { icon: Route, title: 'Quest maps', text: 'Problems unlock as you learn, one step at a time.' },
  { icon: PlayCircle, title: 'Video lessons', text: 'Watch, then talk it through in a real discussion.' },
  { icon: Layers, title: '7 difficulty levels', text: 'From Beginner to Master, at your own pace.' },
]

function formatPrice(priceCents, currency) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(priceCents / 100)
}

function PlanCard({ plan }) {
  return (
    <div className="rounded-2xl border border-space-500 bg-space-800/70 p-6 flex flex-col">
      <h3 className="text-lg font-semibold text-chalk-50">{plan.name}</h3>
      <p className="text-chalk-400 text-sm mt-1">{plan.durationDays} days of full access</p>
      <p className="text-4xl font-semibold text-chalk-50 mt-5">
        {formatPrice(plan.priceCents, plan.currency)}
      </p>
      <Link to="/subscribe" className="btn-primary mt-6 justify-center">
        Get access <ArrowRight size={16} />
      </Link>
    </div>
  )
}

function PlanSkeleton() {
  return <div className="rounded-2xl skeleton h-52" />
}

export default function LandingPage() {
  const { data: plans, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ['plans'],
    queryFn: fetchPlans,
    staleTime: 5 * 60 * 1000,
  })

  return (
    <div className="space-y-16">
      {/* Hero */}
      <section className="text-center max-w-2xl mx-auto pt-6">
        <span className="badge-plasma mb-5"><Sparkles size={12} /> Learn math like a game</span>
        <h1 className="text-4xl sm:text-5xl font-semibold leading-tight text-chalk-50 mb-4">
          Every equation is a <span className="text-glow-plasma">quest</span> waiting to be solved.
        </h1>
        <p className="text-chalk-400 mb-8">
          Watch, practice and level up through a map of problems built for how you actually learn.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link to="/register" className="btn-primary">Create an account <ArrowRight size={16} /></Link>
          <Link to="/login" className="btn-secondary">Sign in</Link>
        </div>
      </section>

      {/* Perks */}
      <section className="grid sm:grid-cols-3 gap-4">
        {perks.map(({ icon: Icon, title, text }) => (
          <div key={title} className="rounded-2xl border border-space-500 bg-space-800/70 p-5">
            <span className="w-9 h-9 rounded-lg grid place-items-center bg-plasma-500/10 border border-plasma-500/20 text-plasma-300 mb-3">
              <Icon size={17} />
            </span>
            <h3 className="font-semibold text-chalk-50">{title}</h3>
            <p className="text-sm text-chalk-400 mt-1">{text}</p>
          </div>
        ))}
      </section>

      {/* Pricing */}
      <section aria-labelledby="pricing-title">
        <h2 id="pricing-title" className="page-title text-center mb-2">Pricing</h2>
        <p className="text-chalk-400 text-center mb-8">Pick a pass. You can buy again any time.</p>

        {isLoading ? (
          <div className="grid sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
            <PlanSkeleton /><PlanSkeleton />
          </div>
        ) : isError ? (
          <div className="text-center">
            <p className="text-chalk-300 mb-3">Could not load prices, try again.</p>
            <button onClick={() => refetch()} disabled={isFetching} className="btn-secondary">
              {isFetching ? <span className="spinner-sm" /> : 'Retry'}
            </button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
            {plans.map((plan) => <PlanCard key={plan.code} plan={plan} />)}
          </div>
        )}
      </section>
    </div>
  )
}
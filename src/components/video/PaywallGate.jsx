import { Link } from 'react-router-dom'
import { Lock, Crown } from 'lucide-react'

export default function PaywallGate({ videoTitle }) {
  return (
    <div className="aspect-video rounded-xl bg-space-800 border border-space-500 flex flex-col items-center justify-center text-center p-8">
      <div className="w-14 h-14 rounded-2xl bg-plasma-500/15 border border-plasma-500/30 grid place-items-center text-plasma-300 mb-4">
        <Lock size={24} />
      </div>
      <h2 className="text-lg font-semibold text-chalk-50 mb-1.5">This lesson needs access</h2>
      <p className="text-sm text-chalk-400 max-w-sm mb-5">
        Get a pass to unlock "{videoTitle}" and every other lesson. One-time payment, no auto-renewal.
      </p>
      <Link to="/subscribe" className="btn-primary"><Crown size={16} /> Get access</Link>
    </div>
  )
}
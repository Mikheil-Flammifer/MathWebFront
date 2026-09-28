import { Link } from 'react-router-dom'
import { Sigma } from 'lucide-react'
import { APP_NAME } from '../../utils/constants'

export default function Logo({ to = '/', size = 'md' }) {
  const box = size === 'lg' ? 'w-11 h-11' : 'w-9 h-9'
  return (
    <Link to={to} className="inline-flex items-center gap-2.5">
      <span className={`${box} rounded-xl grid place-items-center bg-plasma-500/15 border border-plasma-500/30 text-plasma-300`}>
        <Sigma size={size === 'lg' ? 22 : 18} />
      </span>
      <span className="font-display text-xl font-semibold tracking-tight text-chalk-50">
        {APP_NAME}
      </span>
    </Link>
  )
}
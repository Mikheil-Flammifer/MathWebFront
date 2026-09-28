import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Search, X } from 'lucide-react'
import Logo from '../common/Logo'
import UserMenu from './UserMenu'

export default function Topbar() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const [q, setQ] = useState(params.get('q') || '')

  const submit = (e) => {
    e.preventDefault()
    const term = q.trim()
    navigate(term ? `/home?q=${encodeURIComponent(term)}` : '/home')
  }

  return (
    <header className="sticky top-0 z-30 h-16 glass border-b border-space-500 flex items-center gap-4 px-4 sm:px-6 lg:px-8">
      <div className="lg:hidden"><Logo to="/home" /></div>

      <form onSubmit={submit} className="hidden sm:block flex-1 max-w-xl" role="search">
        <div className="relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-chalk-500 pointer-events-none" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search lessons, e.g. quadratic equations"
            className="input-field pl-10 pr-10 py-2.5 bg-space-800/80"
            aria-label="Search videos"
          />
          {q && (
            <button
              type="button"
              onClick={() => { setQ(''); navigate('/home') }}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 btn-icon w-7 h-7"
              aria-label="Clear search"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </form>

      <div className="ml-auto"><UserMenu /></div>
    </header>
  )
}
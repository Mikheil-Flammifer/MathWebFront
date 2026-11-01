import { useEffect, useState } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import useAuthStore from '../../store/authStore'
import ForbiddenPage from '../../pages/error/ForbiddenPage'

// roles: array of allowed roles, message: text for the "No access" card
export default function RoleRoute({ roles, message }) {
  const user = useAuthStore((s) => s.user)
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)

  // The store is restored from localStorage. Wait until that is finished,
  // so an allowed user is not blocked for a split second on page reload.
  const [hydrated, setHydrated] = useState(useAuthStore.persist.hasHydrated())

  useEffect(() => {
    setHydrated(useAuthStore.persist.hasHydrated())
    const unsubscribe = useAuthStore.persist.onFinishHydration(() => {
      setHydrated(true)
    })
    return unsubscribe
  }, [])

  if (!hydrated) {
    return (
      <div className="flex items-center justify-center p-12 text-plasma-400">
        <Loader2 className="animate-spin" size={28} />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (!roles.includes(user?.role)) {
    return <ForbiddenPage message={message} />
  }

  return <Outlet />
}
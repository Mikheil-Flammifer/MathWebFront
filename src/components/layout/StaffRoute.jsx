import { useEffect, useState } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import useAuthStore from '../../store/authStore'
import { ROLES } from '../../utils/constants'

export default function StaffRoute() {
  const user = useAuthStore((s) => s.user)
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)

  // The store is restored from localStorage. Wait until that is finished,
  // so a teacher is not redirected for a split second on page reload.
  const [hydrated, setHydrated] = useState(useAuthStore.persist.hasHydrated())

  useEffect(() => {
    setHydrated(useAuthStore.persist.hasHydrated())
    const unsubscribe = useAuthStore.persist.onFinishHydration(() => setHydrated(true))
    return unsubscribe
  }, [])

  if (!hydrated) {
    return (
      <div className="flex items-center justify-center p-12 text-white/60">
        <Loader2 className="animate-spin" size={28} />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  const isStaff = user?.role === ROLES.ADMIN || user?.role === ROLES.TEACHER
  if (!isStaff) {
    return <Navigate to="/home" replace />
  }

  return <Outlet />
}
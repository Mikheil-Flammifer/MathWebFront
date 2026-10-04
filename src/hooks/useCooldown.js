import { useEffect, useState } from 'react'
import { getCooldownRemainingMs } from '../utils/helpers'

export function useCooldown(retryAvailableAt) {
  const [remaining, setRemaining] = useState(() =>
    getCooldownRemainingMs(retryAvailableAt)
  )

  useEffect(() => {
    setRemaining(getCooldownRemainingMs(retryAvailableAt))
    if (!retryAvailableAt) return undefined

    const id = setInterval(() => {
      const left = getCooldownRemainingMs(retryAvailableAt)
      setRemaining(left)
      if (left <= 0) clearInterval(id)
    }, 1000)

    return () => { clearInterval(id) }
  }, [retryAvailableAt])

  return { remaining, active: remaining > 0 }
}
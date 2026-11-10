import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

export type TripIntent = 'invite' | 'addStop' | 'generate'

/**
 * Overview links into a destination with an intent, e.g. "open the invite form".
 * The intent is read once and then cleared from history, so a reload or back does not replay it.
 */
export function useOneShotIntent(): TripIntent | null {
  const location = useLocation()
  const navigate = useNavigate()
  const [intent] = useState<TripIntent | null>(
    () => (location.state as { intent?: TripIntent } | null)?.intent ?? null
  )
  useEffect(() => {
    if (intent) navigate(location.pathname, { replace: true, state: null })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return intent
}

import { Navigate, useLocation } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useAuth } from '@/lib/auth-context'

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { status } = useAuth()
  const location = useLocation()

  if (status === 'loading') {
    return (
      <div
        className="flex min-h-dvh items-center justify-center px-6"
        aria-busy="true"
      >
        <p className="font-display text-lg tracking-[-0.02em] text-muted">
          Opening your logbook…
        </p>
      </div>
    )
  }

  if (status === 'anonymous') {
    return (
      <Navigate to="/sign-in" replace state={{ from: location.pathname }} />
    )
  }

  return <>{children}</>
}

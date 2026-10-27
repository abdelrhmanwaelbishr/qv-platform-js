import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { ApiError, api, type Profile } from './api'

type AuthStatus = 'loading' | 'authenticated' | 'anonymous'

interface AuthContextValue {
  status: AuthStatus
  profile: Profile | null
  signIn: (input: { email: string; password: string }) => Promise<void>
  signUp: (input: {
    name: string
    email: string
    password: string
  }) => Promise<void>
  signOut: () => Promise<void>
  updateName: (name: string) => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

const SESSION_NOT_ACCEPTED =
  'Signed in, but the session was not accepted. Try once more.'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>('loading')
  const [profile, setProfile] = useState<Profile | null>(null)

  const loadProfile = useCallback(async () => {
    try {
      const session = await api.session()
      if (!session) {
        setProfile(null)
        setStatus('anonymous')
        return null
      }
      const next = await api.profile()
      setProfile(next)
      setStatus('authenticated')
      return next
    } catch {
      // Signed out is the safe fallback: no session, or the backend is down.
      setProfile(null)
      setStatus('anonymous')
      return null
    }
  }, [])

  useEffect(() => {
    void loadProfile()
  }, [loadProfile])

  const signIn = useCallback(
    async (input: { email: string; password: string }) => {
      await api.signIn(input)
      const profile = await loadProfile()
      if (!profile) throw new ApiError(SESSION_NOT_ACCEPTED, 401)
    },
    [loadProfile],
  )

  const signUp = useCallback(
    async (input: { name: string; email: string; password: string }) => {
      await api.signUp(input)
      const profile = await loadProfile()
      if (!profile) throw new ApiError(SESSION_NOT_ACCEPTED, 401)
    },
    [loadProfile],
  )

  const signOut = useCallback(async () => {
    try {
      await api.signOut()
    } finally {
      setProfile(null)
      setStatus('anonymous')
    }
  }, [])

  const updateName = useCallback(async (name: string) => {
    const updated = await api.updateProfile({ name })
    setProfile(updated)
  }, [])

  const value = useMemo(
    () => ({ status, profile, signIn, signUp, signOut, updateName }),
    [status, profile, signIn, signUp, signOut, updateName],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used inside <AuthProvider>')
  }
  return context
}

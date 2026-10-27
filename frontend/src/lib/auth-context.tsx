import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
  updateProfile as updateFirebaseProfile,
  type User as FirebaseUser,
} from 'firebase/auth'
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore'
import { auth, db, isFirebaseConfigured } from './firebase'
import { ApiError, api, setAuthToken, type Profile } from './api'

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
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
  updateName: (name: string) => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

async function syncUserToFirestore(
  firebaseUser: FirebaseUser,
  customName?: string,
): Promise<Profile> {
  const now = new Date().toISOString()
  const name =
    customName ||
    firebaseUser.displayName ||
    firebaseUser.email?.split('@')[0] ||
    'User'

  const userRef = doc(db, 'users', firebaseUser.uid)
  let snap
  try {
    snap = await getDoc(userRef)
  } catch (err) {
    console.warn('Firestore read error, will set initial document:', err)
  }

  if (snap && snap.exists()) {
    const data = snap.data()
    return {
      id: firebaseUser.uid,
      email: data.email || firebaseUser.email || '',
      name: data.name || name,
      full_name: data.full_name || data.fullName || name,
      is_active: data.is_active ?? data.isActive ?? true,
      is_superuser: data.is_superuser ?? data.isSuperuser ?? false,
      created_at: data.created_at || data.createdAt || now,
      updated_at: data.updated_at || data.updatedAt || now,
    }
  }

  const initialProfile: Profile = {
    id: firebaseUser.uid,
    email: firebaseUser.email || '',
    name,
    full_name: name,
    is_active: true,
    is_superuser: false,
    created_at: now,
    updated_at: now,
  }

  try {
    await setDoc(userRef, {
      id: initialProfile.id,
      email: initialProfile.email,
      name: initialProfile.name,
      full_name: initialProfile.full_name,
      is_active: initialProfile.is_active,
      is_superuser: initialProfile.is_superuser,
      created_at: initialProfile.created_at,
      updated_at: initialProfile.updated_at,
    })
  } catch (err) {
    console.warn('Firestore write warning:', err)
  }

  return initialProfile
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>('loading')
  const [profile, setProfile] = useState<Profile | null>(null)

  // Listen for Firebase Auth state changes
  useEffect(() => {
    if (!isFirebaseConfigured || !auth) {
      void (async () => {
        try {
          const session = await api.session()
          if (!session) {
            setProfile(null)
            setStatus('anonymous')
            return
          }
          const next = await api.profile()
          setProfile(next)
          setStatus('authenticated')
        } catch {
          setProfile(null)
          setStatus('anonymous')
        }
      })()
      return
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        setAuthToken(null)
        setProfile(null)
        setStatus('anonymous')
        return
      }

      try {
        const token = await firebaseUser.getIdToken()
        setAuthToken(token)

        const userProfile = await syncUserToFirestore(firebaseUser)
        setProfile(userProfile)
        setStatus('authenticated')
      } catch (err) {
        console.error('Failed to resolve auth session:', err)
        setStatus('anonymous')
      }
    })

    return () => unsubscribe()
  }, [])

  const signIn = useCallback(
    async (input: { email: string; password: string }) => {
      if (isFirebaseConfigured && auth) {
        try {
          const cred = await signInWithEmailAndPassword(
            auth,
            input.email,
            input.password,
          )
          const token = await cred.user.getIdToken()
          setAuthToken(token)

          const userProfile = await syncUserToFirestore(cred.user)
          setProfile(userProfile)
          setStatus('authenticated')
          return
        } catch (err: unknown) {
          const message =
            err instanceof Error ? err.message : 'Invalid credentials'
          throw new ApiError(message.replace('Firebase: ', ''), 401)
        }
      }

      await api.signIn(input)
      const next = await api.profile()
      setProfile(next)
      setStatus('authenticated')
    },
    [],
  )

  const signUp = useCallback(
    async (input: { name: string; email: string; password: string }) => {
      if (isFirebaseConfigured && auth) {
        try {
          const cred = await createUserWithEmailAndPassword(
            auth,
            input.email,
            input.password,
          )
          await updateFirebaseProfile(cred.user, {
            displayName: input.name.trim(),
          })
          const token = await cred.user.getIdToken(true)
          setAuthToken(token)

          const userProfile = await syncUserToFirestore(
            cred.user,
            input.name.trim(),
          )
          setProfile(userProfile)
          setStatus('authenticated')
          return
        } catch (err: unknown) {
          const message =
            err instanceof Error ? err.message : 'Could not create account'
          throw new ApiError(message.replace('Firebase: ', ''), 400)
        }
      }

      await api.signUp(input)
      const next = await api.profile()
      setProfile(next)
      setStatus('authenticated')
    },
    [],
  )

  const signInWithGoogle = useCallback(async () => {
    if (!isFirebaseConfigured || !auth) {
      throw new ApiError('Firebase Authentication is not configured.', 500)
    }

    try {
      const provider = new GoogleAuthProvider()
      provider.setCustomParameters({ prompt: 'select_account' })
      const cred = await signInWithPopup(auth, provider)
      const token = await cred.user.getIdToken()
      setAuthToken(token)

      const userProfile = await syncUserToFirestore(cred.user)
      setProfile(userProfile)
      setStatus('authenticated')
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Google sign in failed'
      // Handle user closing popup gracefully
      if (message.includes('auth/popup-closed-by-user')) {
        return
      }
      throw new ApiError(message.replace('Firebase: ', ''), 400)
    }
  }, [])

  const signOut = useCallback(async () => {
    try {
      if (isFirebaseConfigured && auth) {
        await firebaseSignOut(auth)
      } else {
        await api.signOut()
      }
    } finally {
      setAuthToken(null)
      setProfile(null)
      setStatus('anonymous')
    }
  }, [])

  const updateName = useCallback(async (name: string) => {
    const trimmed = name.trim()
    const now = new Date().toISOString()

    if (isFirebaseConfigured && auth?.currentUser) {
      await updateFirebaseProfile(auth.currentUser, { displayName: trimmed })
      try {
        const userRef = doc(db, 'users', auth.currentUser.uid)
        await updateDoc(userRef, {
          name: trimmed,
          full_name: trimmed,
          updated_at: now,
        })
      } catch (err) {
        console.warn('Firestore profile update warning:', err)
      }
    }

    try {
      await api.updateProfile({ name: trimmed })
    } catch {
      // Backend is optional
    }

    setProfile((prev) =>
      prev
        ? {
            ...prev,
            name: trimmed,
            full_name: trimmed,
            updated_at: now,
          }
        : null,
    )
  }, [])

  const value = useMemo(
    () => ({
      status,
      profile,
      signIn,
      signUp,
      signInWithGoogle,
      signOut,
      updateName,
    }),
    [status, profile, signIn, signUp, signInWithGoogle, signOut, updateName],
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

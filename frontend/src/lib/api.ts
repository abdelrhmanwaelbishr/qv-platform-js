/*
  Thin client for the QAWIM backend (NestJS + Better Auth).

  Requests are relative by default so the Vite dev proxy (and any same-origin
  deployment) can set and send the Better Auth session cookie. Set
  VITE_API_URL when the API lives on another origin and cookies are configured
  for it.
*/

const BASE = (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '')

let currentAuthToken: string | null = null

export function setAuthToken(token: string | null) {
  currentAuthToken = token
}

export function getAuthToken(): string | null {
  return currentAuthToken
}

export class ApiError extends Error {
  readonly status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

/** Matches the snake_case shape returned by the NestJS backend. */
export interface Profile {
  id: string
  email: string
  name: string
  full_name: string | null
  is_active: boolean
  is_superuser: boolean
  created_at: string
  updated_at: string
}

interface AuthUser {
  id: string
  name: string
  email: string
}

function readMessage(payload: unknown): string | null {
  if (!payload || typeof payload !== 'object') return null
  const record = payload as Record<string, unknown>
  if (typeof record.message === 'string') return record.message
  const nested = record.error
  if (typeof nested === 'string') return nested
  if (nested && typeof nested === 'object') {
    const message = (nested as Record<string, unknown>).message
    if (typeof message === 'string') return message
  }
  return null
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  let response: Response
  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...((init.headers as Record<string, string>) ?? {}),
    }
    if (currentAuthToken) {
      headers['Authorization'] = `Bearer ${currentAuthToken}`
    }

    response = await fetch(`${BASE}${path}`, {
      credentials: 'include',
      ...init,
      headers,
    })
  } catch {
    throw new ApiError('Could not reach the QAWIM API.', 0)
  }

  const text = await response.text()
  let payload: unknown = null
  if (text) {
    try {
      payload = JSON.parse(text)
    } catch {
      payload = text
    }
  }

  if (!response.ok) {
    throw new ApiError(
      readMessage(payload) ?? fallbackMessage(response.status),
      response.status,
    )
  }

  return payload as T
}

function fallbackMessage(status: number): string {
  if (status === 401) return 'That session has ended. Sign in again.'
  if (status === 403) return 'That account is not allowed to do this.'
  if (status === 404) return 'That was not found.'
  if (status >= 500) return 'QAWIM had trouble with that. Try once more.'
  return 'That did not work. Try once more.'
}

const MOCK_STORAGE_KEY = 'qawim_local_mock_profile'

function getLocalMockProfile(): Profile | null {
  try {
    const raw = localStorage.getItem(MOCK_STORAGE_KEY)
    return raw ? (JSON.parse(raw) as Profile) : null
  } catch {
    return null
  }
}

function setLocalMockProfile(profile: Profile | null) {
  try {
    if (profile) {
      localStorage.setItem(MOCK_STORAGE_KEY, JSON.stringify(profile))
    } else {
      localStorage.removeItem(MOCK_STORAGE_KEY)
    }
  } catch {
    // Ignore storage quota/permission exceptions
  }
}

export const api = {
  /** Returns null when there is no session, with a 200 instead of a 401. Falls back to local storage if backend is offline. */
  async session() {
    try {
      return await request<{ user: AuthUser } | null>('/api/auth/get-session')
    } catch (cause) {
      if (cause instanceof ApiError && cause.status === 0) {
        const local = getLocalMockProfile()
        return local ? { user: { id: local.id, name: local.name, email: local.email } } : null
      }
      throw cause
    }
  },

  async signUp(input: { name: string; email: string; password: string }) {
    try {
      return await request<{ user: AuthUser }>('/api/auth/sign-up/email', {
        method: 'POST',
        body: JSON.stringify({ ...input, name: input.name.trim() }),
      })
    } catch (cause) {
      if (cause instanceof ApiError && cause.status === 0) {
        const now = new Date().toISOString()
        const mockProfile: Profile = {
          id: 'local-' + Math.random().toString(36).substring(2, 9),
          name: input.name.trim(),
          full_name: input.name.trim(),
          email: input.email.trim(),
          is_active: true,
          is_superuser: false,
          created_at: now,
          updated_at: now,
        }
        setLocalMockProfile(mockProfile)
        return { user: { id: mockProfile.id, name: mockProfile.name, email: mockProfile.email } }
      }
      throw cause
    }
  },

  async signIn(input: { email: string; password: string }) {
    try {
      return await request<{ user: AuthUser }>('/api/auth/sign-in/email', {
        method: 'POST',
        body: JSON.stringify({
          email: input.email.trim(),
          password: input.password,
        }),
      })
    } catch (cause) {
      if (cause instanceof ApiError && cause.status === 0) {
        let profile = getLocalMockProfile()
        if (!profile || profile.email !== input.email.trim()) {
          const now = new Date().toISOString()
          profile = {
            id: 'local-' + Math.random().toString(36).substring(2, 9),
            name: input.email.split('@')[0] || 'User',
            full_name: input.email.split('@')[0] || 'User',
            email: input.email.trim(),
            is_active: true,
            is_superuser: false,
            created_at: now,
            updated_at: now,
          }
        }
        setLocalMockProfile(profile)
        return { user: { id: profile.id, name: profile.name, email: profile.email } }
      }
      throw cause
    }
  },

  async signOut() {
    try {
      return await request<{ success?: boolean }>('/api/auth/sign-out', {
        method: 'POST',
        body: '{}',
      })
    } catch (cause) {
      if (cause instanceof ApiError && cause.status === 0) {
        setLocalMockProfile(null)
        return { success: true }
      }
      throw cause
    }
  },

  async profile() {
    try {
      return await request<Profile>('/api/v1/users/me')
    } catch (cause) {
      if (cause instanceof ApiError && cause.status === 0) {
        const local = getLocalMockProfile()
        if (local) return local
        throw new ApiError('No local profile found.', 401)
      }
      throw cause
    }
  },

  async updateProfile(input: { name?: string }) {
    try {
      return await request<Profile>('/api/v1/users/me', {
        method: 'PATCH',
        body: JSON.stringify(input),
      })
    } catch (cause) {
      if (cause instanceof ApiError && cause.status === 0) {
        const local = getLocalMockProfile()
        if (!local) throw new ApiError('No local profile found.', 401)
        const updated: Profile = {
          ...local,
          name: input.name ?? local.name,
          full_name: input.name ?? local.full_name,
          updated_at: new Date().toISOString(),
        }
        setLocalMockProfile(updated)
        return updated
      }
      throw cause
    }
  },
}

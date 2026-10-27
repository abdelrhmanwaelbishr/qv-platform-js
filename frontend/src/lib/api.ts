/*
  Thin client for the QAWIM backend (NestJS + Better Auth).

  Requests are relative by default so the Vite dev proxy (and any same-origin
  deployment) can set and send the Better Auth session cookie. Set
  VITE_API_URL when the API lives on another origin and cookies are configured
  for it.
*/

const BASE = (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '')

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
    response = await fetch(`${BASE}${path}`, {
      credentials: 'include',
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...(init.headers ?? {}),
      },
    })
  } catch {
    throw new ApiError(
      'Could not reach QAWIM. Is the backend running on port 8000?',
      0,
    )
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

export const api = {
  /** Returns null when there is no session, with a 200 instead of a 401. */
  session() {
    return request<{ user: AuthUser } | null>('/api/auth/get-session')
  },

  signUp(input: { name: string; email: string; password: string }) {
    return request<{ user: AuthUser }>('/api/auth/sign-up/email', {
      method: 'POST',
      body: JSON.stringify({ ...input, name: input.name.trim() }),
    })
  },

  signIn(input: { email: string; password: string }) {
    return request<{ user: AuthUser }>('/api/auth/sign-in/email', {
      method: 'POST',
      body: JSON.stringify({
        email: input.email.trim(),
        password: input.password,
      }),
    })
  },

  signOut() {
    return request<{ success?: boolean }>('/api/auth/sign-out', {
      method: 'POST',
      body: '{}',
    })
  },

  profile() {
    return request<Profile>('/api/v1/users/me')
  },

  updateProfile(input: { name?: string }) {
    return request<Profile>('/api/v1/users/me', {
      method: 'PATCH',
      body: JSON.stringify(input),
    })
  },
}

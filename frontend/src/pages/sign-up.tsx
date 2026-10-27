import { useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { AuthLayout, type AuthStep } from '@/components/auth-layout'
import { ApiError } from '@/lib/api'
import { useAuth } from '@/lib/auth-context'

const MIN_PASSWORD = 8

const SIGN_UP_STEPS: AuthStep[] = [
  {
    number: 1,
    title: 'Sign up your account',
    active: true,
  },
  {
    number: 2,
    title: 'Set up your workspace',
    active: false,
  },
  {
    number: 3,
    title: 'Set up your profile',
    active: false,
  },
]

export function SignUpPage() {
  const { status, signUp, signInWithGoogle } = useAuth()
  const navigate = useNavigate()

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  if (status === 'authenticated') {
    return <Navigate to="/app" replace />
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)

    const name = [firstName.trim(), lastName.trim()].filter(Boolean).join(' ')
    if (!name) {
      setError('Please enter your name.')
      return
    }
    if (password.length < MIN_PASSWORD) {
      setError(`Must be at least ${MIN_PASSWORD} characters.`)
      return
    }

    setPending(true)
    try {
      await signUp({ name, email, password })
      navigate('/app', { replace: true })
    } catch (cause) {
      setError(
        cause instanceof ApiError
          ? cause.message
          : 'That did not work. Try once more.',
      )
    } finally {
      setPending(false)
    }
  }

  async function handleGoogleSignIn() {
    setError(null)
    setPending(true)
    try {
      await signInWithGoogle()
      navigate('/app', { replace: true })
    } catch (cause) {
      setError(
        cause instanceof ApiError
          ? cause.message
          : 'Google sign up failed.',
      )
    } finally {
      setPending(false)
    }
  }

  return (
    <AuthLayout
      mode="sign-up"
      headline="Get Started with Us"
      subheadline="Complete these easy steps to register your account."
      formTitle="Sign Up Account"
      formSubtitle="Enter your personal data to create your account."
      steps={SIGN_UP_STEPS}
    >
      {/* Google Sign-in Button */}
      <button
        type="button"
        disabled={pending}
        onClick={handleGoogleSignIn}
        className="flex w-full items-center justify-center gap-2.5 rounded-xl border border-white/10 bg-white/[0.04] py-2.5 px-3 text-xs font-medium text-white transition-all hover:bg-white/[0.08] active:scale-[0.99] disabled:opacity-60 cursor-pointer"
      >
        <svg className="size-4" viewBox="0 0 24 24">
          <path
            fill="#EA4335"
            d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z"
          />
          <path
            fill="#4285F4"
            d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"
          />
          <path
            fill="#FBBC05"
            d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12.3 0 15s.7 5.3 1.9 7.7l3.7-2.9z"
          />
          <path
            fill="#34A853"
            d="M12 24c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.2L1.9 17C3.7 20.7 7.5 24 12 24z"
          />
        </svg>
        <span>Sign up with Google</span>
      </button>

      {/* Or Divider */}
      <div className="flex items-center gap-3 my-4">
        <div className="h-px flex-1 bg-white/10" />
        <span className="text-[11px] font-medium text-neutral-400">Or with email</span>
        <div className="h-px flex-1 bg-white/10" />
      </div>

      {/* Registration Form */}
      <form onSubmit={handleSubmit} className="space-y-3.5" noValidate>
        {/* Name Fields (2 Columns) */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label
              htmlFor="first-name"
              className="block text-xs font-medium text-neutral-300 mb-1"
            >
              First Name
            </label>
            <input
              id="first-name"
              name="first-name"
              type="text"
              autoComplete="given-name"
              placeholder="eg. John"
              required
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2.5 text-xs text-white placeholder:text-neutral-500 outline-none transition-all focus:border-white/30 focus:bg-white/[0.06] focus:ring-1 focus:ring-white/20"
            />
          </div>

          <div>
            <label
              htmlFor="last-name"
              className="block text-xs font-medium text-neutral-300 mb-1"
            >
              Last Name
            </label>
            <input
              id="last-name"
              name="last-name"
              type="text"
              autoComplete="family-name"
              placeholder="eg. Francisco"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2.5 text-xs text-white placeholder:text-neutral-500 outline-none transition-all focus:border-white/30 focus:bg-white/[0.06] focus:ring-1 focus:ring-white/20"
            />
          </div>
        </div>

        {/* Email Field */}
        <div>
          <label
            htmlFor="email"
            className="block text-xs font-medium text-neutral-300 mb-1"
          >
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="eg. johnfrans@gmail.com"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2.5 text-xs text-white placeholder:text-neutral-500 outline-none transition-all focus:border-white/30 focus:bg-white/[0.06] focus:ring-1 focus:ring-white/20"
          />
        </div>

        {/* Password Field */}
        <div>
          <label
            htmlFor="password"
            className="block text-xs font-medium text-neutral-300 mb-1"
          >
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              placeholder="Enter your password"
              required
              minLength={MIN_PASSWORD}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/[0.04] pl-3.5 pr-10 py-2.5 text-xs text-white placeholder:text-neutral-500 outline-none transition-all focus:border-white/30 focus:bg-white/[0.06] focus:ring-1 focus:ring-white/20"
            />
            <button
              type="button"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white transition-colors cursor-pointer"
            >
              {showPassword ? (
                <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                </svg>
              ) : (
                <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          </div>
          <p className="mt-1 text-[11px] text-neutral-400">
            Must be at least 8 characters.
          </p>
        </div>

        {/* Error message */}
        {error && (
          <p className="rounded-lg bg-rose-500/10 border border-rose-500/20 px-3 py-2 text-xs text-rose-300">
            {error}
          </p>
        )}

        {/* Solid White Submit Button */}
        <button
          type="submit"
          disabled={pending}
          className="mt-2 w-full rounded-xl bg-white py-3 text-xs sm:text-sm font-semibold text-neutral-950 shadow-md transition-all hover:bg-neutral-200 active:scale-[0.99] disabled:opacity-60 cursor-pointer"
        >
          {pending ? 'Creating account…' : 'Sign Up'}
        </button>

        {/* Bottom Link */}
        <p className="pt-2 text-center text-xs text-neutral-400">
          Already have an account?{' '}
          <Link
            to="/sign-in"
            className="font-semibold text-white hover:underline transition-all"
          >
            Log in
          </Link>
        </p>
      </form>
    </AuthLayout>
  )
}

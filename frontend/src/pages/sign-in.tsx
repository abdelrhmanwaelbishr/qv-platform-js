import { useState, type FormEvent } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { AuthLayout } from '@/components/auth-layout'
import { Button } from '@/components/ui/button'
import { Field, FieldError } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ApiError } from '@/lib/api'
import { useAuth } from '@/lib/auth-context'

export function SignInPage() {
  const { status, signIn } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const next =
    (location.state as { from?: string } | null)?.from &&
    (location.state as { from?: string }).from !== '/sign-in'
      ? (location.state as { from?: string }).from!
      : '/app'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  if (status === 'authenticated') {
    return <Navigate to={next} replace />
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setPending(true)
    setError(null)
    try {
      await signIn({ email, password })
      navigate(next, { replace: true })
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

  return (
    <AuthLayout
      title="Sign in"
      note="Your logbook is where you left it. Pick up the last entry and keep going."
    >
      <form onSubmit={handleSubmit} className="grid gap-5" noValidate>
        <Field>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            aria-invalid={error ? true : undefined}
          />
        </Field>

        <Field>
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            aria-invalid={error ? true : undefined}
          />
        </Field>

        <FieldError>{error}</FieldError>

        <Button type="submit" size="lg" disabled={pending}>
          {pending ? 'Signing in…' : 'Sign in'}
        </Button>

        <p className="text-sm text-muted">
          No logbook yet?{' '}
          <Link
            to="/sign-up"
            className="text-ink underline decoration-rule-strong underline-offset-4 hover:decoration-ink"
          >
            Start one
          </Link>
          .
        </p>
      </form>
    </AuthLayout>
  )
}

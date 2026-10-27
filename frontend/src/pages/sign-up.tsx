import { useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { AuthLayout } from '@/components/auth-layout'
import { Button } from '@/components/ui/button'
import { Field, FieldError } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ApiError } from '@/lib/api'
import { useAuth } from '@/lib/auth-context'

const MIN_PASSWORD = 8

export function SignUpPage() {
  const { status, signUp } = useAuth()
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  if (status === 'authenticated') {
    return <Navigate to="/app" replace />
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)

    if (!name.trim()) {
      setError('A name is useful on the page. Even a first name will do.')
      return
    }
    if (password.length < MIN_PASSWORD) {
      setError(`Use at least ${MIN_PASSWORD} characters for the password.`)
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

  return (
    <AuthLayout
      title="Start your logbook"
      note="One name, one password, and the first question. You can change any of it later."
    >
      <form onSubmit={handleSubmit} className="grid gap-5" noValidate>
        <Field>
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            name="name"
            type="text"
            autoComplete="name"
            required
            value={name}
            onChange={(event) => setName(event.target.value)}
            aria-invalid={error ? true : undefined}
          />
        </Field>

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
            autoComplete="new-password"
            required
            minLength={MIN_PASSWORD}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            aria-invalid={error ? true : undefined}
            aria-describedby="password-hint"
          />
          <p id="password-hint" className="text-[0.8125rem] text-muted">
            {MIN_PASSWORD} characters or more. A phrase you will remember beats
            a clever scramble.
          </p>
        </Field>

        <FieldError>{error}</FieldError>

        <Button type="submit" size="lg" disabled={pending}>
          {pending ? 'Creating your logbook…' : 'Create logbook'}
        </Button>

        <p className="text-sm text-muted">
          Already keeping one?{' '}
          <Link
            to="/sign-in"
            className="text-ink underline decoration-rule-strong underline-offset-4 hover:decoration-ink"
          >
            Sign in
          </Link>
          .
        </p>
      </form>
    </AuthLayout>
  )
}

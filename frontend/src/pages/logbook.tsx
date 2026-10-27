import { useState, type FormEvent } from 'react'
import { SiteShell } from '@/components/site-shell'
import { SiteHeader } from '@/components/site-header'
import { Button } from '@/components/ui/button'
import { Field, FieldError } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ApiError } from '@/lib/api'
import { useAuth } from '@/lib/auth-context'

function formatDate(value: string | undefined): string {
  if (!value) return 'Unknown'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Unknown'
  return new Intl.DateTimeFormat('en', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date)
}

function firstName(profile: { name: string; full_name: string | null }) {
  const source = profile.full_name?.trim() || profile.name.trim()
  return source.split(/\s+/)[0] || 'there'
}

export function LogbookPage() {
  const { profile, updateName, signOut } = useAuth()
  const [name, setName] = useState(profile?.name ?? '')
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)
  const [pending, setPending] = useState(false)

  if (!profile) return null

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setSaved(false)
    setPending(true)
    try {
      await updateName(name)
      setSaved(true)
    } catch (cause) {
      setError(
        cause instanceof ApiError
          ? cause.message
          : 'That did not save. Try once more.',
      )
    } finally {
      setPending(false)
    }
  }

  return (
    <SiteShell>
      <SiteHeader />

      <main className="pb-24">
        <section className="border-b border-rule py-14 sm:py-16">
          <h1 className="max-w-[20ch] font-display text-[clamp(2rem,6vw,3.25rem)] font-medium leading-[1] tracking-[-0.035em]">
            Welcome back, {firstName(profile)}.
          </h1>
          <p className="mt-5 max-w-[50ch] leading-relaxed text-muted">
            Your account is open. The logbook itself is empty until activity
            logging arrives from the Python backend.
          </p>
        </section>

        <div className="grid gap-14 py-14 lg:grid-cols-[minmax(0,24rem)_minmax(0,1fr)] lg:gap-16">
          <section aria-labelledby="account-heading">
            <h2
              id="account-heading"
              className="font-display text-lg font-medium tracking-[-0.02em]"
            >
              Account
            </h2>

            <dl className="mt-5 border-t border-rule text-sm">
              <div className="flex items-baseline justify-between gap-4 border-b border-rule py-3.5">
                <dt className="text-muted">Email</dt>
                <dd className="truncate text-ink">{profile.email}</dd>
              </div>
              <div className="flex items-baseline justify-between gap-4 border-b border-rule py-3.5">
                <dt className="text-muted">Started</dt>
                <dd className="text-ink">{formatDate(profile.created_at)}</dd>
              </div>
              <div className="flex items-baseline justify-between gap-4 border-b border-rule py-3.5">
                <dt className="text-muted">Status</dt>
                <dd className="text-ink">
                  {profile.is_active ? 'Active' : 'Inactive'}
                </dd>
              </div>
            </dl>

            <form onSubmit={handleSave} className="mt-8 grid gap-3">
              <Field>
                <Label htmlFor="display-name">Display name</Label>
                <Input
                  id="display-name"
                  name="name"
                  value={name}
                  onChange={(event) => {
                    setName(event.target.value)
                    setSaved(false)
                  }}
                  autoComplete="name"
                />
              </Field>
              <FieldError>{error}</FieldError>
              <div className="flex items-center gap-4">
                <Button type="submit" variant="outline" disabled={pending}>
                  {pending ? 'Saving…' : 'Save name'}
                </Button>
                <span
                  role="status"
                  className="text-[0.8125rem] text-brass-deep"
                >
                  {saved ? 'Saved.' : ''}
                </span>
              </div>
            </form>

            <button
              type="button"
              onClick={() => void signOut()}
              className="mt-10 text-sm text-muted underline decoration-rule-strong underline-offset-4 transition-colors hover:text-ink hover:decoration-ink"
            >
              Sign out of this device
            </button>
          </section>

          <section aria-labelledby="logbook-heading">
            <h2
              id="logbook-heading"
              className="font-display text-lg font-medium tracking-[-0.02em]"
            >
              The logbook
            </h2>

            <div className="mt-5 border border-rule bg-paper-raised px-6 py-14 sm:px-10 sm:py-16">
              <p className="max-w-[20ch] font-display text-2xl font-medium leading-[1.2] tracking-[-0.02em]">
                Nothing here yet.
              </p>
              <p className="mt-4 max-w-[44ch] leading-relaxed text-muted">
                When entries arrive, this page holds them in order. For now it
                is one honest line: the logbook is being ported, and it is not
                pretending otherwise.
              </p>
              <p className="mt-8 border-t border-rule pt-5 text-[0.8125rem] leading-relaxed text-muted">
                Next from the Python backend: onboarding, activities and logs.
              </p>
            </div>
          </section>
        </div>
      </main>
    </SiteShell>
  )
}

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

      <main className="pb-24 pt-6">
        <section className="border-b border-white/10 pb-12 pt-8 sm:pb-14">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1 text-xs font-medium text-emerald-300 backdrop-blur-md mb-4">
            <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]" />
            Your Dashboard
          </div>
          <h1 className="max-w-[20ch] font-display text-[clamp(2.25rem,6vw,3.5rem)] font-bold leading-[1.05] tracking-[-0.035em] text-foreground">
            Welcome back,{' '}
            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-200 bg-clip-text text-transparent">
              {firstName(profile)}.
            </span>
          </h1>
          <p className="mt-4 max-w-[50ch] text-base leading-relaxed text-ink-soft">
            Your account is ready. The logbook records your honest entries as the
            activities module is activated.
          </p>
        </section>

        <div className="grid gap-10 py-12 lg:grid-cols-[minmax(0,24rem)_minmax(0,1fr)] lg:gap-12">
          {/* Account Settings Card */}
          <section aria-labelledby="account-heading" className="glass-panel rounded-3xl border border-white/10 p-6 sm:p-8">
            <h2
              id="account-heading"
              className="font-display text-lg font-semibold tracking-[-0.02em] text-foreground"
            >
              Account
            </h2>

            <dl className="mt-5 border-t border-white/10 text-sm">
              <div className="flex items-baseline justify-between gap-4 border-b border-white/[0.07] py-3.5">
                <dt className="text-muted-foreground text-xs uppercase tracking-wider font-mono">Email</dt>
                <dd className="truncate text-foreground font-medium">{profile.email}</dd>
              </div>
              <div className="flex items-baseline justify-between gap-4 border-b border-white/[0.07] py-3.5">
                <dt className="text-muted-foreground text-xs uppercase tracking-wider font-mono">Started</dt>
                <dd className="text-foreground">{formatDate(profile.created_at)}</dd>
              </div>
              <div className="flex items-baseline justify-between gap-4 border-b border-white/[0.07] py-3.5">
                <dt className="text-muted-foreground text-xs uppercase tracking-wider font-mono">Status</dt>
                <dd className="text-foreground">
                  {profile.is_active ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-300">
                      <span className="size-1.5 rounded-full bg-emerald-400" />
                      Active
                    </span>
                  ) : (
                    <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-xs text-muted-foreground">
                      Inactive
                    </span>
                  )}
                </dd>
              </div>
            </dl>

            <form onSubmit={handleSave} className="mt-8 grid gap-4">
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
              <div className="flex items-center gap-3">
                <Button type="submit" variant="outline" size="sm" disabled={pending}>
                  {pending ? 'Saving…' : 'Save name'}
                </Button>
                {saved && (
                  <span
                    role="status"
                    className="text-xs font-medium text-emerald-400"
                  >
                    Saved.
                  </span>
                )}
              </div>
            </form>

            <button
              type="button"
              onClick={() => void signOut()}
              className="mt-8 text-xs text-muted-foreground underline decoration-white/20 underline-offset-4 transition-colors hover:text-rose-400 hover:decoration-rose-400 cursor-pointer"
            >
              Sign out of this device
            </button>
          </section>

          {/* Logbook Area Card */}
          <section aria-labelledby="logbook-heading" className="glass-panel-elevated relative overflow-hidden rounded-3xl border border-white/10 p-8 sm:p-12">
            {/* Subtle ambient blur glow in background */}
            <div
              aria-hidden
              className="pointer-events-none absolute -right-20 -top-20 size-80 rounded-full bg-emerald-500/10 blur-3xl"
            />

            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur-md">
                Entries stream
              </div>

              <h2
                id="logbook-heading"
                className="mt-6 font-display text-2xl font-bold tracking-[-0.02em] text-foreground sm:text-3xl"
              >
                Nothing here yet.
              </h2>
              <p className="mt-4 max-w-[48ch] text-base leading-relaxed text-ink-soft">
                When entries arrive, this page holds them in order. For now it
                is one honest line: the logbook is being ported from the Python backend,
                and it is not pretending otherwise.
              </p>

              <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.02] p-5 backdrop-blur-sm">
                <p className="text-xs font-semibold text-emerald-400 uppercase tracking-wider font-mono">
                  Up next on the roadmap
                </p>
                <p className="mt-2 text-xs leading-relaxed text-ink-soft">
                  Onboarding sequence, activities and logs, goal tracking, and success paths.
                </p>
              </div>
            </div>
          </section>
        </div>
      </main>
    </SiteShell>
  )
}

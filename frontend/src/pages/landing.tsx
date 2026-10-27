import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { MeasureAxis, SiteShell } from '@/components/site-shell'
import { SiteHeader } from '@/components/site-header'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/auth-context'

const questions = [
  {
    title: 'Who you are',
    body: 'Not a personality quiz. A record of what you have actually done, kept long enough to show a pattern instead of a mood.',
  },
  {
    title: 'Where you stand',
    body: 'You describe the problem in your own words. QAWIM asks the questions that turn a vague ache into something you can work on.',
  },
  {
    title: 'What you want',
    body: 'Goals small enough to start this week, with success criteria you can check rather than guess at.',
  },
  {
    title: 'How you move',
    body: 'Every step gets written down. What worked and what did not changes the next step, not the whole plan.',
  },
]

export function LandingPage() {
  const { status } = useAuth()
  const signedIn = status === 'authenticated'

  return (
    <>
      <SiteShell>
        <SiteHeader />

        <main>
          <section className="relative pb-20 pt-16 sm:pb-28 sm:pt-24">
            <MeasureAxis />

            <div className="reveal inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 text-xs font-medium text-emerald-300 backdrop-blur-md">
              <span className="size-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399] animate-pulse" />
              <span>A quiet way to take stock</span>
            </div>

            <h1 className="reveal mt-6 max-w-[15ch] font-display text-[clamp(2.75rem,8vw,5.5rem)] font-bold leading-[0.98] tracking-[-0.035em] text-foreground">
              Know where you{' '}
              <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-200 bg-clip-text text-transparent">
                stand.
              </span>
            </h1>

            <p className="reveal mt-7 max-w-[56ch] text-[1.125rem] leading-[1.7] text-ink-soft [animation-delay:120ms]">
              QAWIM is a quiet, structured way to take stock of your life: what
              you carry, where you are stuck, and the next honest step. No streak
              counters and no cheerleading.
            </p>

            <div className="reveal mt-9 flex flex-wrap items-center gap-3.5 [animation-delay:200ms]">
              <Button asChild size="lg">
                <Link to={signedIn ? '/app' : '/sign-up'}>
                  {signedIn ? 'Open your logbook' : 'Start with an honest look'}
                </Link>
              </Button>
              {signedIn ? (
                <Button asChild size="lg" variant="outline">
                  <a href="#how-it-works">How it works</a>
                </Button>
              ) : (
                <Button asChild size="lg" variant="outline">
                  <Link to="/sign-in">Sign in</Link>
                </Button>
              )}
            </div>

            <div className="reveal mt-12 max-w-[48ch] rounded-xl border border-white/10 bg-white/[0.02] p-4 text-xs leading-relaxed text-muted-foreground backdrop-blur-sm [animation-delay:280ms]">
              <span className="font-semibold text-emerald-400">Early release:</span>{' '}
              Accounts, the four core questions, and your profile are live.
              Activity logging is actively porting over.
            </div>
          </section>

          <section
            id="how-it-works"
            className="scroll-mt-12 border-t border-white/10 py-16 sm:py-24"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-1 text-xs font-medium text-emerald-400 backdrop-blur-md">
              Process
            </div>
            <h2 className="mt-4 max-w-[22ch] font-display text-[clamp(1.75rem,4vw,2.75rem)] font-bold leading-[1.1] tracking-[-0.03em] text-foreground">
              Four questions, asked in order.
            </h2>
            <p className="mt-4 max-w-[56ch] leading-relaxed text-ink-soft">
              Most plans fail because they begin at the last question: <em>how</em>.
              QAWIM begins with what is actually there.
            </p>

            <div className="mt-12 grid gap-4 sm:grid-cols-2">
              {questions.map((question, index) => (
                <div
                  key={question.title}
                  className="glass-panel group relative flex flex-col justify-between rounded-2xl p-6 transition-all duration-300 hover:border-emerald-500/30 hover:bg-white/[0.05] sm:p-7"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="inline-flex size-8 items-center justify-center rounded-full border border-emerald-500/30 bg-emerald-500/10 font-mono text-xs font-semibold text-emerald-300">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                    </div>
                    <h3 className="mt-5 font-display text-xl font-semibold tracking-[-0.02em] text-foreground">
                      {question.title}
                    </h3>
                    <p className="mt-3 text-sm leading-[1.7] text-ink-soft">
                      {question.body}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="border-t border-white/10 py-16 sm:py-24">
            <div className="grid gap-12 lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)] lg:gap-16">
              <div className="lg:pt-2">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-1 text-xs font-medium text-emerald-400 backdrop-blur-md">
                  Real rhythm
                </div>
                <h2 className="mt-4 max-w-[16ch] font-display text-[clamp(1.75rem,3.4vw,2.35rem)] font-bold leading-[1.1] tracking-[-0.03em] text-foreground">
                  A page from someone&rsquo;s week.
                </h2>
                <p className="mt-4 max-w-[34ch] leading-relaxed text-ink-soft">
                  An entry is a few sentences and one decision. Written by hand,
                  read once a week, kept for the pattern it makes.
                </p>
              </div>

              <figure className="glass-panel-elevated relative overflow-hidden rounded-2xl border border-white/10">
                <figcaption className="flex items-baseline justify-between border-b border-white/10 px-5 py-3.5 sm:px-7">
                  <span className="text-xs font-medium text-muted-foreground">
                    Tuesday, 12 March
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[0.75rem] font-medium text-emerald-300">
                    Entry 214
                  </span>
                </figcaption>

                <dl className="px-5 py-3 sm:px-7">
                  <Entry label="logged">
                    Walked to the market instead of driving. Half an hour each way,
                    and the money question sorted itself out on the walk home.
                  </Entry>
                  <Entry label="noticed">
                    The problem is not the money. It is that I decide at nine in
                    the evening, when I have nothing left to decide with.
                  </Entry>
                  <Entry label="next">
                    Move the weekly money decision to Sunday morning. Ten minutes,
                    coffee, no phone.
                  </Entry>
                </dl>

                <div className="flex items-center gap-3 border-t border-white/10 bg-white/[0.02] px-5 py-3.5 text-xs text-ink-soft sm:px-7">
                  <span
                    aria-hidden
                    className="inline-flex size-5 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400"
                  >
                    <svg viewBox="0 0 12 12" className="size-3" aria-hidden>
                      <path
                        d="M2 6.5 4.5 9 10 3"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                  Tried it the following Sunday. It held.
                </div>
              </figure>
            </div>
          </section>

          <section className="border-t border-white/10 py-20 sm:py-28">
            <h2 className="max-w-[20ch] font-display text-[clamp(2.25rem,5.4vw,3.75rem)] font-bold leading-[1.05] tracking-[-0.035em] text-foreground">
              One realistic step at a time.
            </h2>
            <p className="mt-6 max-w-[50ch] text-lg leading-relaxed text-ink-soft">
              Ambitious plans tend to die in the third week. A logbook survives
              because the next step is always small enough to do tonight, and
              specific enough to know whether it happened.
            </p>
          </section>
        </main>
      </SiteShell>

      <footer className="mt-4 border-t border-white/10 bg-black/40 backdrop-blur-xl text-foreground">
        <div className="mx-auto w-full max-w-[1180px] px-4 py-16 sm:px-8">
          <div className="grid gap-12 pl-7 sm:pl-11 md:grid-cols-[1fr_minmax(0,22rem)] md:pl-20">
            <div>
              <p className="font-display text-[clamp(1.75rem,4vw,2.5rem)] font-bold leading-[1.1] tracking-[-0.03em] text-foreground">
                Start where you are.
              </p>
              <p className="mt-4 max-w-[42ch] leading-relaxed text-ink-soft">
                Write the first entry tonight. Ten minutes, in plain words. It
                is the only part that has to be honest.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Button asChild size="lg">
                  <Link to={signedIn ? '/app' : '/sign-up'}>
                    {signedIn ? 'Open your logbook' : 'Create your logbook'}
                  </Link>
                </Button>
                {!signedIn && (
                  <Link
                    to="/sign-in"
                    className="px-3 py-2 text-sm text-ink-soft underline-offset-4 transition-colors hover:text-foreground hover:underline"
                  >
                    I already keep one
                  </Link>
                )}
              </div>
            </div>

            <div className="md:pt-2">
              <p className="text-sm leading-relaxed text-ink-soft">
                QAWIM takes its name from <span lang="ar" className="text-emerald-400 font-medium">قويم</span>, upright —
                the thing a plumb line checks.
              </p>
              <nav
                aria-label="Footer"
                className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground"
              >
                <a href="/#how-it-works" className="py-1 hover:text-emerald-400 transition-colors">
                  How it works
                </a>
                <Link to="/sign-in" className="py-1 hover:text-emerald-400 transition-colors">
                  Sign in
                </Link>
                <Link to="/sign-up" className="py-1 hover:text-emerald-400 transition-colors">
                  Start
                </Link>
              </nav>
              <p className="mt-8 text-xs text-muted-foreground/60">
                © {new Date().getFullYear()} QAWIM
              </p>
            </div>
          </div>
        </div>
      </footer>
    </>
  )
}

function Entry({
  label,
  children,
}: {
  label: string
  children: ReactNode
}) {
  return (
    <div className="grid gap-1 border-b border-white/[0.07] py-4 last:border-b-0 sm:grid-cols-[5.5rem_1fr] sm:gap-6">
      <dt className="text-xs uppercase tracking-wider font-mono text-emerald-400/80 leading-7">{label}</dt>
      <dd className="max-w-[54ch] leading-7 text-foreground/90">{children}</dd>
    </div>
  )
}

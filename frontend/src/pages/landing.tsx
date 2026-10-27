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
          <section className="relative pb-20 pt-14 sm:pb-24 sm:pt-20">
            <MeasureAxis />
            <h1 className="reveal max-w-[15ch] font-display text-[clamp(2.75rem,9vw,6rem)] font-medium leading-[0.95] tracking-[-0.035em]">
              Know where you stand.
            </h1>
            <p className="reveal mt-8 max-w-[56ch] text-[1.0625rem] leading-[1.65] text-muted [animation-delay:120ms]">
              QAWIM is a quiet, structured way to take stock of your life: what
              you carry, where you are stuck, and the next honest step. No streak
              counters and no cheerleading.
            </p>
            <div className="reveal mt-10 flex flex-wrap items-center gap-3 [animation-delay:200ms]">
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
            <p className="reveal mt-10 max-w-[46ch] border-t border-rule pt-5 text-sm leading-relaxed text-muted [animation-delay:280ms]">
              Early release. Accounts, the four questions and your profile are
              live. Activity logging is still being ported from the Python
              backend.
            </p>
          </section>

          <section
            id="how-it-works"
            className="scroll-mt-8 border-t border-rule py-16 sm:py-20"
          >
            <h2 className="max-w-[22ch] font-display text-[clamp(1.65rem,4vw,2.6rem)] font-medium leading-[1.1] tracking-[-0.03em]">
              Four questions, asked in order.
            </h2>
            <p className="mt-4 max-w-[56ch] leading-relaxed text-muted">
              Most plans fail because they begin at the last question, how. QAWIM
              begins with what is actually there.
            </p>

            <ol className="mt-12 border-t border-rule">
              {questions.map((question, index) => (
                <li
                  key={question.title}
                  className="grid gap-2 border-b border-rule py-7 last:border-b-0 md:grid-cols-[2.5rem_13rem_1fr] md:items-baseline md:gap-8"
                >
                  <span className="font-display text-sm tabular-nums text-brass-deep">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <h3 className="font-display text-xl font-medium tracking-[-0.02em]">
                    {question.title}
                  </h3>
                  <p className="max-w-[58ch] leading-[1.7] text-muted">
                    {question.body}
                  </p>
                </li>
              ))}
            </ol>
          </section>

          <section className="border-t border-rule py-16 sm:py-20">
            <div className="grid gap-12 lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)] lg:gap-16">
              <div className="lg:pt-2">
                <h2 className="max-w-[16ch] font-display text-[clamp(1.65rem,3.4vw,2.25rem)] font-medium leading-[1.1] tracking-[-0.03em]">
                  A page from someone&rsquo;s week.
                </h2>
                <p className="mt-4 max-w-[34ch] leading-relaxed text-muted">
                  An entry is a few sentences and one decision. Written by hand,
                  read once a week, kept for the pattern it makes.
                </p>
              </div>

              <figure className="border border-rule bg-paper-raised">
                <figcaption className="flex items-baseline justify-between border-b border-rule px-5 py-3.5 sm:px-7">
                  <span className="text-[0.8125rem] text-muted">
                    Tuesday, 12 March
                  </span>
                  <span className="text-[0.8125rem] text-muted">Entry 214</span>
                </figcaption>

                <dl className="px-5 py-2 sm:px-7">
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

                <div className="flex items-center gap-2.5 border-t border-rule px-5 py-3.5 text-[0.8125rem] text-muted sm:px-7">
                  <span
                    aria-hidden
                    className="inline-flex size-4 items-center justify-center border border-brass-deep text-brass-deep"
                  >
                    <svg viewBox="0 0 12 12" className="size-2.5" aria-hidden>
                      <path
                        d="M1.5 6.5 4.5 9.5 10.5 2.5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.6"
                      />
                    </svg>
                  </span>
                  Tried it the following Sunday. It held.
                </div>
              </figure>
            </div>
          </section>

          <section className="border-t border-rule py-20 sm:py-24">
            <p className="max-w-[20ch] font-display text-[clamp(2rem,5.4vw,3.5rem)] font-medium leading-[1.05] tracking-[-0.035em]">
              One realistic step at a time.
            </p>
            <p className="mt-7 max-w-[50ch] leading-relaxed text-muted">
              Ambitious plans tend to die in the third week. A logbook survives
              because the next step is always small enough to do tonight, and
              specific enough to know whether it happened.
            </p>
          </section>
        </main>
      </SiteShell>

      <footer className="mt-4 bg-ink text-paper">
        <div className="mx-auto w-full max-w-[1180px] px-4 py-16 sm:px-8">
          <div className="grid gap-12 pl-7 sm:pl-11 md:grid-cols-[1fr_minmax(0,22rem)] md:pl-20">
            <div>
              <p className="font-display text-[clamp(1.6rem,4vw,2.4rem)] font-medium leading-[1.1] tracking-[-0.03em]">
                Start where you are.
              </p>
              <p className="mt-5 max-w-[42ch] leading-relaxed text-paper/60">
                Write the first entry tonight. Ten minutes, in plain words. It
                is the only part that has to be honest.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Button
                  asChild
                  size="lg"
                  className="bg-paper text-ink hover:bg-paper-raised"
                >
                  <Link to={signedIn ? '/app' : '/sign-up'}>
                    {signedIn ? 'Open your logbook' : 'Create your logbook'}
                  </Link>
                </Button>
                {!signedIn && (
                  <Link
                    to="/sign-in"
                    className="px-2 py-2 text-sm text-paper/70 underline-offset-4 transition-colors hover:text-paper hover:underline focus-visible:outline-paper"
                  >
                    I already keep one
                  </Link>
                )}
              </div>
            </div>

            <div className="md:pt-2">
              <p className="text-sm leading-relaxed text-paper/60">
                QAWIM takes its name from <span lang="ar">قويم</span>, upright —
                the thing a plumb line checks.
              </p>
              <nav
                aria-label="Footer"
                className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-paper/70"
              >
                <a href="/#how-it-works" className="py-1 hover:text-paper focus-visible:outline-paper">
                  How it works
                </a>
                <Link to="/sign-in" className="py-1 hover:text-paper focus-visible:outline-paper">
                  Sign in
                </Link>
                <Link to="/sign-up" className="py-1 hover:text-paper focus-visible:outline-paper">
                  Start
                </Link>
              </nav>
              <p className="mt-8 text-[0.8125rem] text-paper/55">
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
    <div className="grid gap-1 border-b border-rule/70 py-5 last:border-b-0 sm:grid-cols-[5.5rem_1fr] sm:gap-6">
      <dt className="text-[0.8125rem] leading-7 text-muted">{label}</dt>
      <dd className="max-w-[54ch] leading-7 text-ink-soft">{children}</dd>
    </div>
  )
}

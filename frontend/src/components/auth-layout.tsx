import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

export interface AuthStep {
  number: number
  title: string
  active?: boolean
}

interface AuthLayoutProps {
  mode?: 'sign-in' | 'sign-up'
  headline: string
  subheadline: string
  formTitle: string
  formSubtitle: string
  steps: AuthStep[]
  children: ReactNode
}

export function AuthLayout({
  headline,
  subheadline,
  formTitle,
  formSubtitle,
  steps,
  children,
}: AuthLayoutProps) {
  return (
    <div className="relative min-h-screen w-full bg-black text-white flex flex-col justify-between p-4 sm:p-6 lg:p-10">
      {/* Top minimal header */}
      <header className="mx-auto w-full max-w-[1060px] flex items-center justify-between py-2 mb-4">
        <Link
          to="/"
          className="flex items-center gap-2.5 text-[1.0625rem] font-semibold tracking-[-0.02em] text-white hover:opacity-90 transition-opacity"
        >
          <span
            aria-hidden
            className="size-2 rounded-full bg-emerald-400 shadow-[0_0_10px_#34d399]"
          />
          <span>QAWIM</span>
        </Link>
        <Link
          to="/"
          className="text-xs text-neutral-400 hover:text-white transition-colors"
        >
          Back to front page
        </Link>
      </header>

      {/* Centered Split Card Frame matching the reference */}
      <div className="mx-auto w-full max-w-[1060px] my-auto">
        <div className="overflow-hidden rounded-[24px] border border-white/10 bg-[#090b0a] shadow-[0_30px_70px_rgba(0,0,0,0.85)] grid grid-cols-1 lg:grid-cols-[1.1fr_1fr]">
          
          {/* Left Panel: Glowing Emerald Aurora with 3 Step Cards */}
          <div
            className="relative flex flex-col justify-between p-8 sm:p-12 overflow-hidden min-h-[460px] lg:min-h-[620px]"
            style={{
              background: `
                radial-gradient(circle at 85% 85%, rgba(16, 185, 129, 0.38) 0%, transparent 55%),
                radial-gradient(circle at 15% 15%, rgba(5, 150, 105, 0.28) 0%, transparent 60%),
                radial-gradient(circle at 60% 40%, rgba(6, 78, 59, 0.5) 0%, transparent 70%),
                #041a12
              `,
            }}
          >
            {/* Luminous aurora light texture overlay */}
            <div
              aria-hidden
              className="pointer-events-none absolute -bottom-20 -right-20 size-[320px] rounded-full bg-emerald-400/20 blur-[90px]"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute top-10 left-10 size-[260px] rounded-full bg-teal-500/15 blur-[80px]"
            />

            {/* Headline and Subhead */}
            <div className="relative z-10 pt-4">
              <h1 className="font-display text-3xl sm:text-4xl lg:text-[2.65rem] font-bold leading-[1.08] tracking-[-0.03em] text-white">
                {headline}
              </h1>
              <p className="mt-3.5 max-w-[34ch] text-xs sm:text-sm leading-relaxed text-emerald-100/75">
                {subheadline}
              </p>
            </div>

            {/* Bottom 3 Steps Carousel / Row */}
            <div className="relative z-10 pt-10 sm:pt-16">
              <div className="grid grid-cols-3 gap-3">
                {steps.map((step) => {
                  if (step.active) {
                    return (
                      <div
                        key={step.number}
                        className="rounded-2xl bg-white p-4 flex flex-col justify-between min-h-[116px] shadow-lg transition-transform duration-200"
                      >
                        <span className="flex size-5 sm:size-6 items-center justify-center rounded-full bg-neutral-950 font-mono text-[11px] sm:text-xs font-bold text-white">
                          {step.number}
                        </span>
                        <p className="mt-4 text-[11px] sm:text-xs font-bold leading-snug text-neutral-950">
                          {step.title}
                        </p>
                      </div>
                    )
                  }

                  return (
                    <div
                      key={step.number}
                      className="rounded-2xl border border-white/10 bg-white/[0.08] p-4 flex flex-col justify-between min-h-[116px] backdrop-blur-md transition-colors"
                    >
                      <span className="flex size-5 sm:size-6 items-center justify-center rounded-full bg-white/20 font-mono text-[11px] sm:text-xs font-medium text-white">
                        {step.number}
                      </span>
                      <p className="mt-4 text-[11px] sm:text-xs font-medium leading-snug text-white/80">
                        {step.title}
                      </p>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Right Panel: Clean Obsidian Form Canvas */}
          <div className="flex flex-col justify-center p-8 sm:p-12 lg:p-14 bg-[#090c0a] border-t lg:border-t-0 lg:border-l border-white/10">
            <div className="w-full max-w-[380px] mx-auto">
              {/* Form Title & Subtitle */}
              <div className="text-left mb-6">
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                  {formTitle}
                </h2>
                <p className="mt-1 text-xs text-neutral-400">
                  {formSubtitle}
                </p>
              </div>

              {/* Form Body */}
              {children}
            </div>
          </div>

        </div>
      </div>

      {/* Footer minimal info */}
      <footer className="mx-auto w-full max-w-[1060px] text-center py-2 text-xs text-neutral-500">
        © {new Date().getFullYear()} QAWIM — Know where you stand.
      </footer>
    </div>
  )
}

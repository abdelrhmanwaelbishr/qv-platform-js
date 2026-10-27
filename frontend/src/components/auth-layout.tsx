import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

export function AuthLayout({
  title,
  note,
  children,
}: {
  title: string
  note: string
  children: ReactNode
}) {
  return (
    <div className="grid min-h-dvh grid-cols-1 lg:grid-cols-[1fr_26rem] xl:grid-cols-[1fr_32rem]">
      <div className="flex flex-col px-5 pb-16 sm:px-10">
        <div className="flex items-center justify-between border-b border-rule py-5">
          <Link
            to="/"
            className="font-display text-[1.0625rem] font-medium tracking-[-0.02em]"
          >
            QAWIM
          </Link>
          <Link
            to="/"
            className="text-sm text-muted transition-colors hover:text-ink"
          >
            Back to the front page
          </Link>
        </div>

        <main className="flex w-full max-w-[25rem] flex-1 flex-col justify-center py-14 sm:py-16">
          <h1 className="font-display text-[clamp(1.9rem,4vw,2.5rem)] font-medium leading-[1.05] tracking-[-0.03em]">
            {title}
          </h1>
          <p className="mt-4 max-w-[38ch] leading-relaxed text-muted">{note}</p>
          <div className="mt-10">{children}</div>
        </main>
      </div>

      <aside className="relative hidden overflow-hidden bg-ink text-paper lg:block">
        <div
          aria-hidden
          className="absolute inset-y-0 left-12 w-px bg-paper/15"
        />
        <div
          aria-hidden
          className="absolute left-12 top-0 h-full w-10 opacity-40"
        >
          <div className="tick-rail absolute inset-y-0 left-0 w-full" />
        </div>
        <div className="absolute bottom-14 left-16 right-10">
          <p className="max-w-[22ch] font-display text-[1.75rem] leading-[1.15] tracking-[-0.02em]">
            Nothing here is a streak. It is a record.
          </p>
          <p className="mt-6 max-w-[30ch] text-sm leading-relaxed text-paper/55">
            Entries stay where you left them, so the pattern has room to show
            itself.
          </p>
        </div>
      </aside>
    </div>
  )
}

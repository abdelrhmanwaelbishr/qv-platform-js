import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

/**
 * Page frame. The hairline on the left is the margin rule the whole product
 * hangs from: text is indented past it, like a page in a surveyor's logbook.
 */
export function SiteShell({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        'relative mx-auto w-full max-w-[1180px] px-4 sm:px-8',
        className,
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-4 w-px bg-gradient-to-b from-emerald-500/30 via-white/10 to-emerald-500/10 sm:left-8"
      />
      <div className="relative pl-7 sm:pl-11 md:pl-20">{children}</div>
    </div>
  )
}

/** The hero's measuring ticks and the luminous emerald plumb bob that settles at the end of them. */
export function MeasureAxis({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn(
        'pointer-events-none absolute inset-y-0 -left-7 w-7 sm:-left-11 sm:w-11 md:-left-20 md:w-20',
        className,
      )}
    >
      <div className="tick-rail absolute inset-y-0 left-0 w-full opacity-70" />
      <div className="plumb-bob" />
    </div>
  )
}

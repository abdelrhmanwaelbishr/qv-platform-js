import * as React from 'react'
import { cn } from '@/lib/utils'

function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        'h-11 w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 text-[0.9375rem] text-foreground',
        'placeholder:text-muted/60 backdrop-blur-md transition-all outline-none',
        'focus-visible:border-emerald-400/80 focus-visible:bg-white/[0.07] focus-visible:ring-2 focus-visible:ring-emerald-400/25',
        'disabled:cursor-not-allowed disabled:opacity-50',
        'aria-[invalid=true]:border-destructive aria-[invalid=true]:ring-destructive/20',
        className,
      )}
      {...props}
    />
  )
}

export { Input }

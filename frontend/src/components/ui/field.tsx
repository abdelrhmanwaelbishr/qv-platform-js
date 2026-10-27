import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

function Field({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="field"
      className={cn('grid gap-2', className)}
      {...props}
    />
  )
}

function FieldError({ children }: { children?: ReactNode }) {
  if (!children) return null
  return (
    <p role="alert" className="text-[0.8125rem] leading-relaxed text-destructive">
      {children}
    </p>
  )
}

export { Field, FieldError }

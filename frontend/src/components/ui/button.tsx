import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  [
    'inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-full',
    'font-medium tracking-[-0.01em] transition-all duration-200 cursor-pointer',
    'outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-background',
    'disabled:pointer-events-none disabled:opacity-50',
    '[&_svg]:size-4 [&_svg]:shrink-0',
  ],
  {
    variants: {
      variant: {
        default:
          'bg-gradient-to-r from-emerald-500 via-emerald-400 to-teal-300 text-neutral-950 font-semibold shadow-[0_0_20px_rgba(16,185,129,0.35)] hover:shadow-[0_0_30px_rgba(16,185,129,0.55)] hover:brightness-105 active:scale-[0.98]',
        outline:
          'border border-white/15 bg-white/[0.04] backdrop-blur-md text-foreground hover:bg-white/[0.09] hover:border-emerald-400/40 active:scale-[0.98]',
        ghost: 'text-muted-foreground hover:text-foreground hover:bg-white/[0.06]',
        quiet: 'px-0 text-muted-foreground underline-offset-4 hover:text-foreground hover:underline',
      },
      size: {
        sm: 'h-9 px-4 text-[0.8125rem]',
        default: 'h-11 px-5 text-sm',
        lg: 'h-12 px-7 text-[0.9375rem]',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : 'button'
  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }

import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/auth-context'

export function SiteHeader() {
  const { status, signOut } = useAuth()

  return (
    <header className="sticky top-4 z-40 my-3 flex items-center justify-between gap-4 rounded-full border border-white/10 bg-white/[0.04] px-5 py-3 shadow-[0_8px_32px_0_rgba(0,0,0,0.36)] backdrop-blur-xl sm:px-6">
      <Link
        to="/"
        className="flex items-center gap-2 font-display text-[1.0625rem] font-semibold tracking-[-0.02em] text-foreground transition-opacity hover:opacity-90"
      >
        <span
          aria-hidden
          className="size-2 rounded-full bg-emerald-400 shadow-[0_0_10px_#34d399]"
        />
        <span>QAWIM</span>
      </Link>

      <nav aria-label="Main" className="flex items-center gap-2 sm:gap-4">
        <a
          href="/#how-it-works"
          className="hidden rounded-full px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-white/[0.06] hover:text-foreground sm:inline-block"
        >
          How it works
        </a>

        {status === 'authenticated' ? (
          <>
            <Link
              to="/app"
              className="rounded-full px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-white/[0.06] hover:text-foreground"
            >
              Your logbook
            </Link>
            <Button variant="outline" size="sm" onClick={() => void signOut()}>
              Sign out
            </Button>
          </>
        ) : (
          <>
            <Link
              to="/sign-in"
              className="rounded-full px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-white/[0.06] hover:text-foreground"
            >
              Sign in
            </Link>
            <Button asChild size="sm">
              <Link to="/sign-up">Start</Link>
            </Button>
          </>
        )}
      </nav>
    </header>
  )
}

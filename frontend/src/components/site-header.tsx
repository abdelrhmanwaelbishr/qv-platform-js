import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/auth-context'

export function SiteHeader() {
  const { status, signOut } = useAuth()

  return (
    <header className="flex items-center justify-between gap-4 border-b border-rule py-5">
      <Link
        to="/"
        className="font-display text-[1.0625rem] font-semibold tracking-[-0.02em] text-ink"
      >
        QAWIM
      </Link>

      <nav aria-label="Main" className="flex items-center gap-2 sm:gap-5">
        <a
          href="/#how-it-works"
          className="hidden text-sm text-muted transition-colors hover:text-ink sm:inline"
        >
          How it works
        </a>

        {status === 'authenticated' ? (
          <>
            <Link
              to="/app"
              className="text-sm text-ink transition-colors hover:text-pine"
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
              className="px-2 text-sm text-ink transition-colors hover:text-pine"
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

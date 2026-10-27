import { Link } from 'react-router-dom'
import { SiteShell } from '@/components/site-shell'
import { SiteHeader } from '@/components/site-header'
import { Button } from '@/components/ui/button'

export function NotFoundPage() {
  return (
    <SiteShell>
      <SiteHeader />
      <main className="py-24 sm:py-32">
        <p className="text-sm text-muted">Page not found</p>
        <h1 className="mt-3 max-w-[18ch] font-display text-[clamp(2rem,6vw,3.25rem)] font-medium leading-[1.02] tracking-[-0.035em]">
          This page is not on the map.
        </h1>
        <p className="mt-5 max-w-[44ch] leading-relaxed text-muted">
          The link may be old, or the page may not have been written yet.
        </p>
        <div className="mt-9 flex flex-wrap gap-3">
          <Button asChild variant="outline">
            <Link to="/">Back to the front page</Link>
          </Button>
          <Button asChild>
            <Link to="/app">Your logbook</Link>
          </Button>
        </div>
      </main>
    </SiteShell>
  )
}

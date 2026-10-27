# QAWIM frontend

React front end for the QAWIM backend in `../backend`. Vite, React 19, React
Router 7, Tailwind CSS 4 and shadcn/ui components kept in the project.

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # tsc + vite build
```

The backend must be running on `http://127.0.0.1:8000`. Start it from
`../backend` with `npm run dev`.

## How the two halves talk

Vite proxies `/api` to `http://127.0.0.1:8000` in development, so the browser
stays on one origin. That matters for auth: Better Auth issues a `SameSite=Lax`
session cookie, which a cross-site `fetch` would neither store nor send.

- Keep requests relative and let the proxy handle it.
- For a split deployment, set `VITE_API_URL` and make sure the API allows the
  frontend origin (`ALLOWED_ORIGINS` in `backend/.env`) and that the session
  cookie works across sites (it usually needs `SameSite=None; Secure`).

All API calls live in `src/lib/api.ts`. The backend answers in snake_case
(`full_name`, `is_active`, `created_at`); the client type mirrors that and the
UI reads those fields directly.

## Routes

| Path | Page | Notes |
|---|---|---|
| `/` | Landing | Product page, no auth needed |
| `/sign-in` | Sign in | `POST /api/auth/sign-in/email` |
| `/sign-up` | Sign up | `POST /api/auth/sign-up/email` |
| `/app` | Logbook | Protected: redirects to `/sign-in`, then back |

`AuthProvider` (`src/lib/auth-context.tsx`) checks `/api/auth/get-session` on
mount (a 200 with `null` instead of a 401 when signed out), then reads the
profile from `/api/v1/users/me`.

Wired today: account creation, sign in, sign out, profile read, display-name
update. Activities, onboarding, goals and success paths are still being ported
to the backend, so the logbook page says so instead of inventing entries.

## shadcn/ui

`components.json` is configured for the CLI:

```bash
npx shadcn@latest add dialog
```

Components land in `src/components/ui/` and use the tokens in
`src/index.css`. Tailwind 4 has no `tailwind.config.js`; theme values live in
the `@theme` block.

## Design

The product is named after the Arabic قويم — upright, the thing a plumb line
checks. The interface borrows from a surveyor's logbook:

- one vertical axis on the left, with measure ticks and a brass plumb bob that
  settles once on load (`MeasureAxis`);
- content indented past the axis like a margin rule;
- hairline rules instead of cards;
- pine, mineral paper and brass, with Bitter for display type and Archivo for
  text.

Motion is one page-load moment. Everything is disabled under
`prefers-reduced-motion`. Keep new sections on the same axis and resist adding
a second ornamental element.

## Layout

```
src/
  components/ui/      shadcn primitives (button, input, label, field)
  components/         shell, header, auth panel, protected route
  lib/                api client, auth context, cn helper
  pages/              landing, sign-in, sign-up, logbook, not-found
  index.css           tokens, base styles, plumb-line motion
```

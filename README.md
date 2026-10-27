# QAWIM — qv-platform-js

**قاوم · QAWIM** is a personal development platform. It helps people understand who they are, where they stand, what they want, and how to move toward it, one realistic step at a time.

This repository is the TypeScript rewrite of the Python backend (`qv-platform`). It uses NestJS, Prisma, and PostgreSQL on Neon. The web client in `frontend/` is React with Vite, React Router, Tailwind, and shadcn/ui.

> **Status:** Early port. Authentication, the user module, and the health check are working. The QAWIM domains are being ported from the Python backend in order. See [Roadmap](#roadmap).

## What's here today

| Area | Status | Endpoints |
|---|---|---|
| Health check | Working | `GET /api/v1/health` |
| Accounts (Better Auth) | Working | `POST /api/auth/sign-up/email`, `POST /api/auth/sign-in/email`, `POST /api/auth/sign-out`, `GET /api/auth/get-session` |
| User profile | Working | `GET /api/v1/users/me`, `PATCH /api/v1/users/me` |
| Landing page | Working | `GET /` (plain HTML fallback inside the backend) |
| Web app (`frontend/`) | Working | Landing page, sign in, sign up, protected logbook at `/app` |
| Neon Auth JWT verification | Library only | Not yet wired to a route |
| QAWIM activities, logs, onboarding, goals, success paths, problems, context packages | Not yet ported | See the Python backend |

The Python backend defines the expected behavior for the remaining domains.

## Prerequisites

- Node.js 20+ (developed on Node 24)
- A [Neon](https://neon.com) project with a Postgres database
- Optional: Docker, for a local Postgres through `docker-compose.yml`

## Setup

### 1. Install dependencies

```bash
cd backend
npm install
```

### 2. Configure environment variables

Copy `backend/.env.example` to `backend/.env` and fill in the values:

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | Pooled Neon connection string (host contains `-pooler`). Used by the app. |
| `DIRECT_URL` | Direct Neon connection string (no `-pooler`). Used by Prisma migrations. |
| `NEON_AUTH_BASE_URL` | Neon Auth base URL. Written by `neon deploy`. |
| `NEON_AUTH_JWKS_URL` | Neon Auth JWKS URL. Written by `neon deploy`. |
| `BETTER_AUTH_SECRET` | Secret for Better Auth sessions. Use a random string of 32+ characters. |
| `BETTER_AUTH_URL` | Public base URL of the backend. Default `http://127.0.0.1:8000`. |
| `ALLOWED_ORIGINS` | Comma-separated list of frontend origins allowed for CORS. |
| `PORT`, `HOST` | Server bind address. Defaults `8000` and `127.0.0.1`. |

Generate a Better Auth secret:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Keep `.env` out of git. It holds database credentials.

### 3. Apply database migrations

Migrations run against the direct connection (`DIRECT_URL`):

```bash
npx prisma migrate deploy
npx prisma generate
```

To create a new migration during development, use `npx prisma migrate dev --name <name>`.

### 4. Run the backend

```bash
npm run dev        # watch mode
# or
npm run build && npm run start:prod
```

The server listens on `http://127.0.0.1:8000`:

- Landing page: <http://127.0.0.1:8000/>
- Health check: <http://127.0.0.1:8000/api/v1/health>

## Project layout

```
qv-platform-js/
├── backend/
│   ├── prisma/             # Prisma schema and migrations (Neon Postgres)
│   ├── public/             # Plain HTML fallback served at / by Nest
│   ├── src/
│   │   ├── auth/           # Better Auth config, origins, Neon Auth JWT verifier
│   │   ├── health/         # Health check (database ping)
│   │   ├── prisma/         # Global Prisma service
│   │   ├── users/          # User profile module
│   │   ├── app.module.ts
│   │   └── main.ts         # Bootstrap: static files, Better Auth, /api/v1 prefix
│   └── test/               # End-to-end tests (run against a live server)
├── frontend/               # React app (Vite, React Router, Tailwind, shadcn/ui)
├── vercel.json             # Two services: backend at /api/*, frontend for the rest
└── neon.ts                 # Neon services declaration (postgres, auth)
```

## Authentication

Login uses [Better Auth](https://www.better-auth.com) with the Prisma adapter. Its tables (`user`, `session`, `account`, `verification`) live in the `public` schema, next to the app's data.

- Sessions are cookie-based. Sign in through `POST /api/auth/sign-in/email`, then send the cookie with later requests.
- `GET /api/v1/users/me` returns 401 without a valid session.
- Sign-out (`POST /api/auth/sign-out`) ends the session.

Neon Auth is provisioned, and `src/auth/neon-auth.service.ts` can verify its EdDSA tokens against the JWKS. Login does not use Neon Auth yet.

## Testing

The end-to-end tests call a running server, so start the backend first.

```bash
# Terminal 1
cd backend && npm run dev

# Terminal 2
cd backend
npx ts-node --transpile-only test/auth-flow.e2e.ts
npx ts-node --transpile-only test/neon-auth.e2e.ts   # needs NEON_AUTH_TEST_TOKEN
```

- `auth-flow.e2e.ts` covers register, login, profile read and update, logout, and a wrong password. It creates and leaves behind a test user in the database.
- `neon-auth.e2e.ts` checks token verification. Set `NEON_AUTH_TEST_TOKEN` to a valid Neon Auth JWT. Get one from a Neon Auth session with `POST /token`.

The `npm test` script is wired to Jest, but there are no Jest specs yet.

## Build

```bash
cd backend
npm run build
```

## Deploy on Vercel

`vercel.json` at the repo root deploys both halves as one project with two [services](https://vercel.com/docs/services):

| Service | Root | Framework | Receives |
|---|---|---|---|
| `backend` | `backend` | `nestjs` | `/api/*` |
| `frontend` | `frontend` | `vite` | every other path |

Services receive the original request path, so `/api/auth/*` (Better Auth) and `/api/v1/*` (Nest) need no rewrites or prefix changes. The frontend calls the API with relative URLs and Vite's dev proxy is not involved in production — **do not set `VITE_API_URL` on Vercel**, or requests leave the origin and the session cookie stops being sent.

The frontend service has its own catch-all rewrite to `/index.html` so client-side routes (`/sign-in`, `/app`) survive a reload.

No service bindings are declared, because no service calls another from the server: the frontend is a static SPA, so its API calls come from the browser through the public `/api` route. A binding only injects a URL into another service's server-side code (Vercel Functions), which this project does not have.

### Environment variables

Set these in Vercel under Project → Settings → Environment Variables:

| Variable | Environments | Notes |
|---|---|---|
| `DATABASE_URL` | all | Pooled Neon connection string |
| `BETTER_AUTH_SECRET` | all | 32+ random characters |
| `BETTER_AUTH_URL` | Production | Public origin, e.g. `https://qawim.example.com`. Leave it unset in Preview/Development: the app falls back to `VERCEL_URL`, so every preview keeps its own session origin |
| `ALLOWED_ORIGINS` | optional | Comma-separated extra CORS origins. Vercel's deployment hostnames and localhost (outside production) are added automatically |
| `NODE_PATH` | all | `/var/task/backend/node_modules:/var/task/node_modules` — required, see [Vercel services workarounds](#vercel-services-workarounds) |
| `NODE_OPTIONS` | all | `--experimental-require-module` — required, see [Vercel services workarounds](#vercel-services-workarounds) |

### Vercel services workarounds

Both variables exist because of how Vercel builds a Node service whose root is a subdirectory. They are not needed locally.

- `NODE_PATH`: the services builder traces `node_modules` relative to the repository root, so the deployed bundle puts packages in `/var/task/backend/node_modules` while the handler is `/var/task/main.js`. Node never searches that path on its own, and the function dies on its first import (`Cannot find module 'dotenv/config'`). `NODE_PATH` points the runtime at the directory the packages actually land in.
- `NODE_OPTIONS=--experimental-require-module`: NestJS 12 ships ESM-only packages (`@nestjs/core` has `"type": "module"`), while `nest build` emits CommonJS that `require()`s them. AWS Lambda disables the interop by default, so the function crashes with `ERR_REQUIRE_ESM`. The flag restores Node's default behaviour ([Vercel docs](https://vercel.com/docs/functions/runtimes/node-js/advanced-node-configuration#experimental-node.js-require-of-es-module)).

If Vercel ever fixes service dependency tracing, `NODE_PATH` can be dropped; a missing path in `NODE_PATH` is ignored, so keeping it is harmless.

`DIRECT_URL` is only for migrations; the deployed app never reads it. Apply migrations before the first deploy (from `backend/`, against the direct URL):

```bash
npx prisma migrate deploy
```

`backend/.env` is excluded from CLI uploads by `.vercelignore`. Vercel's own environment variables take precedence over it if it is ever present.

On Vercel, `/` is the React app — `backend/public/index.html` is only what you see when hitting the Nest server directly (for example at `http://127.0.0.1:8000` during local development).

To run the same setup locally, use the CLI, which starts every service and applies the top-level rewrites on `http://localhost:3000`:

```bash
npx vercel dev --local
```

## Roadmap

The port follows the Python backend's domain order:

1. Auth and users: logout invalidation, password change, and the Google sign-in stub (501)
2. QAWIM activities and logs
3. Onboarding and personal understanding
4. Goals
5. Success paths
6. Problems
7. Context packages and the scoring engine
8. React frontend: the rest of the QAWIM screens (see `frontend/README.md`)

Known bugs to fix during the port: the onboarding loop, the success-paths endpoint mismatch, and the orphaned onboarding routes.

## Contributing

This repo is the port of `qv-platform`. Keep each domain's routes and response shapes matching the Python API unless a change is listed as a bug fix.

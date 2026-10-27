# AGENTS.md

QAWIM (`qv-platform-js`) is the TypeScript port of the Python `qv-platform` backend: NestJS + Prisma + Neon Postgres. Backend application code lives in `backend/`; the React frontend lives in `frontend/` (Vite, React Router, Tailwind 4, shadcn/ui).

## Commands

Run all app commands from `backend/`. The repo-root `package.json` only holds Neon CLI dependencies and has no scripts.

- `npm install`
- `npm run dev` — watch mode on `http://127.0.0.1:8000`
- `npm run build` — `nest build`; this is the only typecheck. There is no lint or format config/script.
- `npm run start:prod` — runs `dist/main`; build first.
- `npx prisma migrate deploy` then `npx prisma generate` — after pulling migrations.
- `npx prisma migrate dev --name <name>` — create a migration.

## Tests

`npm test` and `npm run test:e2e` are misleading: there are no Jest specs, no Jest config, and `test/jest-e2e.json` does not exist. Use the standalone ts-node scripts instead.

- `test/auth-flow.e2e.ts` calls a running server: start `npm run dev` in another terminal, then `npx ts-node --transpile-only test/auth-flow.e2e.ts`. It creates and leaves behind a test user.
- `test/neon-auth.e2e.ts` imports `src/` directly (no server), but needs `NEON_AUTH_*` env vars plus a valid `NEON_AUTH_TEST_TOKEN`.
- Tests hardcode `http://127.0.0.1:${PORT ?? 8000}` and send `Origin: http://localhost:5173`, which must remain in `ALLOWED_ORIGINS` / Better Auth `trustedOrigins`.

## Environment

- Copy `backend/.env.example` to `backend/.env`. `dotenv/config` loads from the process cwd, so run commands from `backend/`.
- `neon deploy` writes `NEON_AUTH_*` to the repo-root `.env.local`; copy those values into `backend/.env` or the backend cannot see them.
- `DATABASE_URL` must be the pooled Neon URL (host contains `-pooler`); `DIRECT_URL` must be direct. Prisma uses `directUrl` for migrations.
- `BETTER_AUTH_SECRET` needs 32+ random characters. Defaults: `BETTER_AUTH_URL=http://127.0.0.1:8000`, `PORT=8000`, `HOST=127.0.0.1`.
- Optional local Postgres: `docker compose up -d` from the repo root (`qawim`/`qawim`/`qawim`, port 5432), then point both URLs at it.
- Requires Node 20+ (developed on Node 24).

## Architecture and conventions

- Bootstrap is `src/main.ts`: Better Auth is mounted at `/api/auth` via `toNodeHandler` before Nest's global `/api/v1` prefix. The prefix exclude uses Nest 12 syntax `api/auth/{*path}` — do not revert it to the older `api/auth/*` form.
- New app routes go under `/api/v1`; `/` serves `backend/public/index.html`.
- `PrismaModule` is `@Global()`, so inject `PrismaService` without importing the module.
- Better Auth owns the `user`, `session`, `account`, and `verification` tables in the `public` schema. Add app fields to the `User` model in `prisma/schema.prisma` below the auth block, keeping the existing `@map("snake_case")` style.
- API responses are snake_case (`full_name`, `is_active`, `created_at`) to match the Python API even though Prisma/TS fields are camelCase. Follow `UsersController.toResponse`.
- Controller auth pattern: `auth.api.getSession({ headers })` from `src/auth/auth.ts`; return 401 when there is no session and reject `isActive: false`.
- Neon Auth JWT verification (`src/auth/neon-auth.service.ts`) exists but is not wired to any route; login uses Better Auth.
- `src/auth/auth.ts` creates its own `PrismaClient`, separate from `PrismaService`. Account for the extra connection when changing DB setup.

## Porting rules

- The Python `qv-platform` backend defines expected behavior. Keep each domain's routes and response shapes identical unless a change is a listed bug fix.
- Known bugs to fix during the port: the onboarding loop, the success-paths endpoint mismatch, and the orphaned onboarding routes.
- Port order: auth/user gaps → activities and logs → onboarding → goals → success paths → problems → context packages/scoring → React frontend.
- `neon.ts` at the repo root declares Neon services and branch policy; the root dependencies exist only for the Neon CLI.

## Frontend (`frontend/`)

- `npm install`, then `npm run dev` on `http://localhost:5173`; `npm run build` runs `tsc` then `vite build`.
- Backend must run on `127.0.0.1:8000`. Vite proxies `/api` to it so Better Auth's `SameSite=Lax` cookie works on one origin — keep requests relative, and use `VITE_API_URL` only for split deployments.
- Routes: `/`, `/sign-in`, `/sign-up`, `/app` (protected). API calls are centralised in `src/lib/api.ts`; `src/lib/auth-context.tsx` owns the session.
- shadcn/ui components live in `src/components/ui/`; Tailwind 4 has no config file, tokens are in the `@theme` block of `src/index.css`.
- The visual system is a surveyor's logbook: one left axis with measure ticks and a brass plumb bob, hairline rules instead of cards, Bitter + Archivo. See `frontend/README.md` before adding sections.

/**
 * Origins allowed to talk to the API, shared by Nest's CORS middleware and
 * Better Auth's `trustedOrigins` so the two can never disagree.
 *
 * `ALLOWED_ORIGINS` adds explicit origins on top of the defaults. Vercel
 * injects the deployment's own hostnames, so preview deployments work without
 * any per-deployment config, and localhost is trusted everywhere except a
 * production deployment.
 */
const LOCAL_ORIGINS = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
];

function list(value: string | undefined): string[] {
  return (value ?? '')
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function vercelOrigins(): string[] {
  return [
    process.env.VERCEL_URL,
    process.env.VERCEL_BRANCH_URL,
    process.env.VERCEL_PROJECT_PRODUCTION_URL,
  ]
    .filter((host): host is string => Boolean(host))
    .map((host) => `https://${host}`);
}

export function allowedOrigins(): string[] {
  const configured = list(process.env.ALLOWED_ORIGINS);
  const local = process.env.VERCEL_ENV === 'production' ? [] : LOCAL_ORIGINS;
  return Array.from(new Set([...configured, ...local, ...vercelOrigins()]));
}

/**
 * Public base URL Better Auth issues cookies and callbacks for.
 *
 * Set `BETTER_AUTH_URL` in production when the site has a custom domain.
 * Otherwise the Vercel deployment hostname is used, which keeps preview
 * deployments working on their own URL instead of pointing at production.
 */
export function resolveBaseUrl(): string {
  if (process.env.BETTER_AUTH_URL) {
    return process.env.BETTER_AUTH_URL;
  }

  const host =
    process.env.VERCEL_ENV === 'production'
      ? (process.env.VERCEL_PROJECT_PRODUCTION_URL ?? process.env.VERCEL_URL)
      : process.env.VERCEL_URL;

  return host ? `https://${host}` : 'http://127.0.0.1:8000';
}

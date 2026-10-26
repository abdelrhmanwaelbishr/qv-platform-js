import 'dotenv/config';
import assert from 'node:assert/strict';

const BASE = `http://127.0.0.1:${process.env.PORT ?? 8000}`;

function cookieHeader(setCookie: string[] | null): string {
  return (setCookie ?? []).map((c) => c.split(';')[0]).join('; ');
}

async function main() {
  const email = `e2e-${Date.now()}@example.com`;
  const password = 'E2ePass!2026';

  const reg = await fetch(`${BASE}/api/auth/sign-up/email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Origin: 'http://localhost:5173' },
    body: JSON.stringify({ name: 'E2E User', email, password }),
  });
  assert.equal(reg.status, 200, `register status ${reg.status}`);
  const regBody = (await reg.json()) as { user: { id: string; email: string } };
  assert.equal(regBody.user.email, email);
  console.log(`PASS register: user ${regBody.user.id}`);

  const login = await fetch(`${BASE}/api/auth/sign-in/email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Origin: 'http://localhost:5173' },
    body: JSON.stringify({ email, password }),
  });
  assert.equal(login.status, 200, `login status ${login.status}`);
  const cookie = cookieHeader(login.headers.getSetCookie());
  assert.ok(cookie.length > 0, 'login sets a session cookie');
  console.log('PASS login: session cookie issued');

  const me = await fetch(`${BASE}/api/v1/users/me`, { headers: { Cookie: cookie } });
  assert.equal(me.status, 200, `GET /users/me status ${me.status}`);
  const profile = (await me.json()) as { email: string; full_name: string | null };
  assert.equal(profile.email, email);
  console.log('PASS GET /api/v1/users/me with session');

  const patch = await fetch(`${BASE}/api/v1/users/me`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Cookie: cookie },
    body: JSON.stringify({ fullName: 'Updated Name' }),
  });
  assert.equal(patch.status, 200, `PATCH /users/me status ${patch.status}`);
  const updated = (await patch.json()) as { full_name: string };
  assert.equal(updated.full_name, 'Updated Name');
  console.log('PASS PATCH /api/v1/users/me updates full_name');

  const anon = await fetch(`${BASE}/api/v1/users/me`);
  assert.equal(anon.status, 401, `anonymous status ${anon.status}`);
  console.log('PASS anonymous GET /users/me rejected (401)');

  const out = await fetch(`${BASE}/api/auth/sign-out`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Origin: 'http://localhost:5173', Cookie: cookie },
    body: '{}',
  });
  assert.equal(out.status, 200, `sign-out status ${out.status}`);
  const after = await fetch(`${BASE}/api/v1/users/me`, { headers: { Cookie: cookie } });
  assert.equal(after.status, 401, `post-logout status ${after.status}`);
  console.log('PASS sign-out invalidates the session');

  const bad = await fetch(`${BASE}/api/auth/sign-in/email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Origin: 'http://localhost:5173' },
    body: JSON.stringify({ email, password: 'WrongPass!999' }),
  });
  assert.notEqual(bad.status, 200, 'wrong password must not log in');
  console.log(`PASS wrong password rejected (${bad.status})`);

  console.log(`E2E_EMAIL=${email}`);
}

main().catch((err) => {
  console.error('FAIL', err);
  process.exit(1);
});

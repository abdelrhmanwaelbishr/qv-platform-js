import 'dotenv/config';
import assert from 'node:assert/strict';
import { InvalidTokenError, NeonAuthService } from '../src/auth/neon-auth.service';

async function expectInvalid(service: NeonAuthService, token: string, label: string) {
  try {
    await service.verify(token);
  } catch (err) {
    assert.ok(err instanceof InvalidTokenError, `${label}: expected InvalidTokenError, got ${String(err)}`);
    console.log(`PASS ${label}: rejected`);
    return;
  }
  throw new Error(`FAIL ${label}: token was accepted`);
}

async function main() {
  const token = process.env.NEON_AUTH_TEST_TOKEN;
  if (!token) {
    throw new Error('NEON_AUTH_TEST_TOKEN is not set');
  }

  const service = new NeonAuthService();

  const payload = await service.verify(token);
  assert.ok(payload.sub, 'valid token has a sub claim');
  assert.ok(payload.email, 'valid token has an email claim');
  console.log(`PASS valid Neon Auth token accepted (sub=${payload.sub}, email=${payload.email})`);

  const [header, body, sig] = token.split('.');
  await expectInvalid(service, `${header}.${body}.${sig.slice(0, -4)}AAAA`, 'tampered signature');
  await expectInvalid(service, `${header}.${body}.`, 'missing signature');
  await expectInvalid(service, 'not-a-jwt', 'malformed token');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

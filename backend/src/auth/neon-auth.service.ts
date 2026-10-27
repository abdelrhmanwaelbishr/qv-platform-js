import { createRemoteJWKSet, jwtVerify, JWTPayload, JWTVerifyGetKey } from 'jose';

export class InvalidTokenError extends Error {}

export class NeonAuthService {
  private jwks?: JWTVerifyGetKey;

  // Resolved on first use so the app can boot without Neon Auth configured.
  private getJwks(): JWTVerifyGetKey {
    if (!this.jwks) {
      const url = process.env.NEON_AUTH_JWKS_URL;
      if (!url) {
        throw new Error('NEON_AUTH_JWKS_URL is not set');
      }
      this.jwks = createRemoteJWKSet(new URL(url));
    }
    return this.jwks;
  }

  async verify(token: string): Promise<JWTPayload> {
    const jwks = this.getJwks();
    try {
      const { payload } = await jwtVerify(token, jwks, {
        issuer: new URL(process.env.NEON_AUTH_BASE_URL ?? '').origin,
      });
      return payload;
    } catch {
      throw new InvalidTokenError('Could not validate credentials');
    }
  }
}

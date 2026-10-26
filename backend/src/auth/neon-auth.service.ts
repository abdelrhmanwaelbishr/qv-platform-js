import { createRemoteJWKSet, jwtVerify, JWTPayload } from 'jose';

export class InvalidTokenError extends Error {}

export class NeonAuthService {
  private readonly jwks = createRemoteJWKSet(new URL(this.jwksUrl()));

  private jwksUrl(): string {
    const url = process.env.NEON_AUTH_JWKS_URL;
    if (!url) {
      throw new Error('NEON_AUTH_JWKS_URL is not set');
    }
    return url;
  }

  async verify(token: string): Promise<JWTPayload> {
    try {
      const { payload } = await jwtVerify(token, this.jwks, {
        issuer: new URL(process.env.NEON_AUTH_BASE_URL ?? '').origin,
      });
      return payload;
    } catch {
      throw new InvalidTokenError('Could not validate credentials');
    }
  }
}

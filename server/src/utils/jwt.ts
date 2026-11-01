import crypto from 'crypto';

export interface TokenPayload {
  id: string;
  email: string;
  iat: number;
  exp: number;
}

/**
 * Retrieve the JWT_SECRET from environment variables.
 * Fails safely and immediately if missing or weak.
 */
export function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret || typeof secret !== 'string' || secret.trim().length < 32) {
    throw new Error(
      'FATAL CONFIGURATION ERROR: JWT_SECRET environment variable is missing, empty, or too weak. ' +
      'A cryptographically secure secret of at least 32 characters is strictly required.'
    );
  }
  return secret.trim();
}

/**
 * Validate JWT configuration on server startup.
 */
export function validateJwtConfiguration(): void {
  getJwtSecret();
}

function base64url(input: string | Buffer): string {
  return Buffer.from(input).toString('base64url');
}

/**
 * Sign a JWT token with HS256 HMAC-SHA256
 */
export function signToken(payload: { id: string; email: string }, expiresInSeconds = 7 * 86400): string {
  const secret = getJwtSecret();
  const header = { alg: 'HS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const fullPayload: TokenPayload = {
    id: payload.id,
    email: payload.email,
    iat: now,
    exp: now + expiresInSeconds
  };

  const encodedHeader = base64url(JSON.stringify(header));
  const encodedPayload = base64url(JSON.stringify(fullPayload));
  const data = `${encodedHeader}.${encodedPayload}`;

  const signature = crypto
    .createHmac('sha256', secret)
    .update(data)
    .digest('base64url');

  return `${data}.${signature}`;
}

/**
 * Verify a JWT token signature, algorithm, expiration, and payload structure
 */
export function verifyToken(token: string): TokenPayload | null {
  try {
    if (!token || typeof token !== 'string') return null;

    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const [encodedHeader, encodedPayload, signature] = parts;
    const data = `${encodedHeader}.${encodedPayload}`;

    // Validate algorithm header strictly against algorithm-switching attacks
    const header = JSON.parse(Buffer.from(encodedHeader, 'base64url').toString('utf8'));
    if (!header || header.alg !== 'HS256' || header.typ !== 'JWT') {
      return null;
    }

    const secret = getJwtSecret();
    const expectedSig = crypto
      .createHmac('sha256', secret)
      .update(data)
      .digest('base64url');

    const sigBuf = Buffer.from(signature);
    const expectedBuf = Buffer.from(expectedSig);

    if (sigBuf.length !== expectedBuf.length) return null;
    if (!crypto.timingSafeEqual(sigBuf, expectedBuf)) return null;

    const payload: TokenPayload = JSON.parse(
      Buffer.from(encodedPayload, 'base64url').toString('utf8')
    );

    if (!payload || typeof payload !== 'object' || !payload.id || !payload.email) {
      return null;
    }

    const now = Math.floor(Date.now() / 1000);
    if (typeof payload.exp !== 'number' || payload.exp < now) {
      return null; // Expired
    }

    if (typeof payload.iat !== 'number' || payload.iat > now + 60) {
      return null; // Issued in future beyond tolerable clock skew
    }

    return payload;
  } catch {
    return null;
  }
}

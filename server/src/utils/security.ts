import crypto from 'crypto';

/**
 * Secure password hashing using Node.js crypto.scrypt
 */
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

/**
 * Verify a plaintext password against a stored salt:hash string
 */
export function verifyPassword(password: string, combinedHash: string): boolean {
  try {
    if (!password || !combinedHash || !combinedHash.includes(':')) {
      return false;
    }
    const [salt, storedHash] = combinedHash.split(':');
    const calculatedHash = crypto.scryptSync(password, salt, 64).toString('hex');
    const storedBuf = Buffer.from(storedHash, 'hex');
    const calcBuf = Buffer.from(calculatedHash, 'hex');
    if (storedBuf.length !== calcBuf.length) {
      return false;
    }
    return crypto.timingSafeEqual(storedBuf, calcBuf);
  } catch {
    return false;
  }
}

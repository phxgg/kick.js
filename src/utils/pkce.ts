import crypto from 'crypto';

export function generateCodeVerifier(length = 64) {
  const rnd = crypto.randomBytes(length);
  return rnd.toString('base64url');
}

export function generateCodeChallenge(codeVerifier: string) {
  const hash = crypto.createHash('sha256').update(codeVerifier).digest();
  return hash.toString('base64url');
}

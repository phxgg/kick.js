import crypto from 'crypto';

import { BadRequestError, ForbiddenError, InternalServerError, NotFoundError, UnauthorizedError } from './errors';

export function handleError(response: Response) {
  switch (response.status) {
    case 400:
      throw new BadRequestError();
    case 401:
      throw new UnauthorizedError();
    case 403:
      throw new ForbiddenError();
    case 404:
      throw new NotFoundError();
    case 500:
      throw new InternalServerError();
  }
}

export async function parseJSON<T>(response: Response): Promise<T> {
  try {
    const data = await response.json();
    return data as T;
  } catch (error) {
    throw new Error('Failed to parse response body as JSON.');
  }
}

export function generateCodeVerifier(length = 64) {
  const rnd = crypto.randomBytes(length);
  return rnd.toString('base64url');
}

export function generateCodeChallenge(codeVerifier: string) {
  const hash = crypto.createHash('sha256').update(codeVerifier).digest();
  return hash.toString('base64url');
}

import { NextFunction, Request, Response } from 'express';

import { UserModel } from '@/models/User';

import { verifyAccessToken } from '../utils/jwt';

/**
 * HTTP Bearer token authentication middleware.
 * Supports token in `Authorization` header, request body, or query string as `access_token`.
 */
export async function authMiddleware(req: Request, res: Response, next: NextFunction) {
  let token: string;
  const authorization = req.header('authorization');

  if (authorization) {
    const parts = authorization.split(' ');
    if (parts.length !== 2) return res.status(401).json({ error: 'malformed_authorization_header' });
    const scheme = parts[0];
    const credentials = parts[1];
    if (!/^Bearer$/i.test(scheme)) return res.status(401).json({ error: 'malformed_authorization_header' });
    token = credentials;
  }

  if (req.body && req.body.access_token) {
    if (token) return res.status(400).json({ error: 'multiple_tokens_provided' });
    token = req.body.access_token;
  }

  if (req.query && req.query.access_token) {
    if (token) return res.status(400).json({ error: 'multiple_tokens_provided' });
    token = req.query.access_token as string;
  }

  if (!token) {
    return res.status(401).json({ error: 'no_token_provided' });
  }

  try {
    const payload = verifyAccessToken(token);
    // load user from database and attach to req object
    const user = await UserModel.findById(payload.sub);
    req.user = user;
    next();
  } catch {
    return res.status(401).json({ error: 'invalid_token' });
  }
}

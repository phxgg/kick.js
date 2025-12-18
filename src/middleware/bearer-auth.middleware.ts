import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import { createLogger } from '@/winston.logger';

import { UserModel } from '@/models/User';
import { jwtService } from '@/services/jwt.service';

const logger = createLogger('Middleware.BearerAuth');

/**
 * HTTP Bearer token authentication middleware.
 * Supports token in `Authorization` header, request body, or query string as `access_token`.
 */
export async function bearerAuthMiddleware(req: Request, res: Response, next: NextFunction) {
  let token: string | undefined;
  const authorization = req.header('authorization');

  if (authorization) {
    const parts = authorization.split(' ');
    if (parts.length !== 2) {
      return res.status(StatusCodes.UNAUTHORIZED).json({ error: 'malformed_authorization_header' });
    }
    const scheme = parts[0];
    const credentials = parts[1];
    if (!/^Bearer$/i.test(scheme)) {
      return res.status(StatusCodes.UNAUTHORIZED).json({ error: 'malformed_authorization_header' });
    }
    token = credentials;
  }

  if (req.body && req.body.access_token) {
    if (token) return res.status(StatusCodes.BAD_REQUEST).json({ error: 'multiple_tokens_provided' });
    token = req.body.access_token;
  }

  if (req.query && req.query.access_token) {
    if (token) return res.status(StatusCodes.BAD_REQUEST).json({ error: 'multiple_tokens_provided' });
    token = req.query.access_token as string;
  }

  if (!token) {
    return res.status(StatusCodes.UNAUTHORIZED).json({ error: 'no_token_provided' });
  }

  try {
    const payload = jwtService.verifyAccessToken(token);
    const isRevoked = await jwtService.isRevoked(payload.jti);
    if (isRevoked) {
      return res.status(StatusCodes.FORBIDDEN).json({ error: 'token_revoked' });
    }
    // load user from database and attach to req object
    const user = await UserModel.findById(payload.sub);
    if (!user) {
      throw new Error('User not found');
    }
    req.user = user;
    next();
  } catch (err) {
    logger.warn('Bearer token verification failed', { error: err });
    return res.status(StatusCodes.FORBIDDEN).json({ error: 'invalid_token' });
  }
}

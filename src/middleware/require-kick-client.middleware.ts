import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import { attachKickClientToReq } from './attach-kick-client-to-req.middleware';

/**
 * Middleware to require that `req.kick` is set (KickClient is attached).
 * If `req.kick` doesn't exist, it will try to attach it first by calling `attachKickClientToReq`.
 * Returns 403 if KickClient cannot be attached.
 */
export async function requireKickClient(req: Request, res: Response, next: NextFunction) {
  // If req.kick already exists, we're done
  if (req.kick) {
    return next();
  }

  // req.kick doesn't exist - try to attach it
  await attachKickClientToReq(req, res, (err?: any) => {
    if (err) return next(err);

    // After trying to attach, check if req.kick exists
    if (!req.kick) {
      return res.sendStatus(StatusCodes.FORBIDDEN);
    }
    next();
  });
}

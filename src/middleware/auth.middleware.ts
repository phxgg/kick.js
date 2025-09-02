import { NextFunction, Request, Response } from 'express';

import { verifyAccessToken } from '../utils/jwt';

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.header('Authorization');
  if (!header?.startsWith('Bearer ')) return res.status(401).json({ error: 'Unauthorized' });

  const token = header.slice('Bearer '.length).trim();
  try {
    const { userId } = verifyAccessToken(token);
    // fetch user from database and attach `user` property to req object
    (req as any).userId = userId;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

import { NextFunction, Request, Response } from 'express';

import { UserModel } from '@/models/User';

import { verifyAccessToken } from '../utils/jwt';

export async function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const auth = req.header('authorization');
  if (!auth?.startsWith('Bearer ')) return res.status(401).json({ error: 'missing_token' });
  const token = auth.split(' ')[1];
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

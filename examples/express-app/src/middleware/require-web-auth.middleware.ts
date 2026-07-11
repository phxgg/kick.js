import { NextFunction, Request, Response } from 'express';

/** Redirects to the login page instead of returning a 401/403, since this guards HTML pages. */
export function requireWebAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.isAuthenticated()) return res.redirect('/');
  next();
}

import { Request, Response, NextFunction } from 'express';
import { KickClient } from '@/KickAPI/Client';

export function attachKickClientToReq(client: KickClient) {
  return (req: Request, res: Response, next: NextFunction) => {
    (req as any).client = client;
    next();
  };
}

export default attachKickClientToReq;

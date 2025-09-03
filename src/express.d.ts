/* eslint-disable @typescript-eslint/no-empty-object-type */
import type { KickClient } from '@/KickAPI/Client';

import type { IUser } from './models/User';

declare global {
  namespace Express {
    interface User extends IUser {}
    interface Request {
      kick?: KickClient;
      user?: User;
      rawBody?: Buffer;
    }
  }
}

export {};

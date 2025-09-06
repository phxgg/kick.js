/* eslint-disable @typescript-eslint/no-empty-object-type */
import type { KickClient } from '@/KickAPI/KickClient';
import type { IUser } from '@/models/User';
import type { EnvSchema } from '@/validators/env.validator';

declare global {
  namespace Express {
    interface User extends IUser {}
    interface Request {
      kick?: KickClient;
      user?: User;
      rawBody?: Buffer;
    }
  }
  namespace NodeJS {
    interface ProcessEnv extends EnvSchema {}
  }
}

export {};

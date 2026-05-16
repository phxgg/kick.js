// oxlint-disable typescript/no-empty-object-type
import type { KickClient } from '@phxgg/kick.js';

import type { IUser } from '@/models/User.ts';
import type { EnvSchema } from '@/validators/env.validator.ts';

declare global {
  namespace NodeJS {
    interface ProcessEnv extends EnvSchema {}
  }
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

import type { KickClient } from '@/KickAPI/Client';

declare global {
  namespace Express {
    interface Request {
      client: KickClient;
    }
  }
}

export {};

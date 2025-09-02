import { NextFunction, Request, Response } from 'express';

import { KickClient } from '@/KickAPI/Client';
import { AccountModel } from '@/models/Account';

const REFRESH_THRESHOLD_MS = 60 * 1000; // refresh if <60s left

export async function ensureKickClient(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) return next(); // not authenticated
    const kickUserId = req.user.kickUserId;
    const account = await AccountModel.findOne({
      provider: 'kick',
      providerAccountId: kickUserId,
    });
    if (!account || !account.accessToken) return next();

    // Build a fresh client per request
    const client = new KickClient(process.env.KICK_CLIENT_ID, process.env.KICK_CLIENT_SECRET);

    // Refresh if expiring
    if (account.expiresAt && account.refreshToken && account.expiresAt.getTime() - Date.now() < REFRESH_THRESHOLD_MS) {
      const refreshed = await client.oauth.refreshToken(account.refreshToken);
      account.accessToken = refreshed.access_token;
      if (refreshed.refresh_token) {
        account.refreshToken = refreshed.refresh_token;
      }
      account.tokenType = refreshed.token_type;
      account.expiresAt = new Date(Date.now() + refreshed.expires_in * 1000);
      account.scope = refreshed.scope ? refreshed.scope.split(' ') : account.scope;
      await account.save();
      client.setToken(refreshed);
    } else {
      client.setToken({
        access_token: account.accessToken,
        refresh_token: account.refreshToken || '',
        token_type: account.tokenType || 'bearer',
        expires_in: Math.max(0, account.expiresAt ? Math.floor((account.expiresAt.getTime() - Date.now()) / 1000) : 0),
        scope: account.scope ? account.scope.join(' ') : '',
      });
    }

    req.client = client;
    next();
  } catch (err) {
    next(err);
  }
}

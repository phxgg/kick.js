import { Router } from 'express';
import passport from 'passport';

import { attachKickClientToReq } from '@/middleware/attach-kick-client-to-req.middleware';

// import { signAccessToken, signRefreshToken } from '@/utils/jwt';

export function createOAuthRouter() {
  const router = Router();

  router.get('/kick', passport.authenticate('kick'));

  router.get('/kick/callback', passport.authenticate('kick'), attachKickClientToReq, async (req, res) => {
    const user = req.user;
    const channel = await req.kick.channels.fetchBySlug('phxgg');
    return res.json({ user: user.toJSON(), channel: channel.toJSON() });
    // const accessToken = signAccessToken(userId);
    // const refreshToken = signRefreshToken(userId);

    // Return tokens; in production consider httpOnly cookies for refresh token.
    // return res.json({ accessToken, refreshToken, tokenType: 'Bearer', expiresIn: 900 });
  });

  return router;
}

export default createOAuthRouter;

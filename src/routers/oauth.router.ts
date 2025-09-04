import { Router } from 'express';
import ms, { type StringValue } from 'ms';
import passport from 'passport';

import { signAccessToken, signRefreshToken } from '@/utils/jwt';
import { attachKickClientToReq } from '@/middleware/attach-kick-client-to-req.middleware';

// import { signAccessToken, signRefreshToken } from '@/utils/jwt';

export function createOAuthRouter() {
  const router = Router();

  router.get('/kick', passport.authenticate('kick', { session: false }));

  router.get(
    '/kick/callback',
    passport.authenticate('kick', { session: false }),
    attachKickClientToReq,
    async (req, res) => {
      const userId = req.user._id.toString();
      const accessToken = signAccessToken({ sub: userId });
      const refreshToken = signRefreshToken({ sub: userId });
      return res.json({
        accessToken,
        refreshToken,
        expiresIn: Math.floor(ms(process.env.JWT_ACCESS_EXPIRATION! as StringValue) / 1000),
      });
    }
  );

  return router;
}

export default createOAuthRouter;

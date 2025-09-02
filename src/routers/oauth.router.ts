import { Router } from 'express';
import passport from 'passport';
// import { signAccessToken, signRefreshToken } from '@/utils/jwt';
import { User } from '@/KickAPI/User';

export function createOAuthRouter() {
  const router = Router();

  router.get('/kick', passport.authenticate('kick'));

  router.get('/kick/callback', passport.authenticate('kick'), async (req, res) => {
    const user = req.user;
    const channel = await req.client.channels.fetchBySlug('phxgg');
    return res.json({ user, channel });
    // const accessToken = signAccessToken(userId);
    // const refreshToken = signRefreshToken(userId);

    // Return tokens; in production consider httpOnly cookies for refresh token.
    // return res.json({ accessToken, refreshToken, tokenType: 'Bearer', expiresIn: 900 });
  });

  return router;
}

export default createOAuthRouter;

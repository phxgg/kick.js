import { Router } from 'express';
import passport from 'passport';
// import { signAccessToken, signRefreshToken } from '@/utils/jwt';
import { User } from '@/KickAPI/User';
import { KickClient } from '@/KickAPI/Client';
import { ChatMessageType } from '@/KickAPI/services/ChatService';

export function createOAuthRouter(client: KickClient) {
  const router = Router();

  router.use((req, res, next) => {
    (req as any).client = client;
    next();
  });

  router.get('/kick', passport.authenticate('kick'));

  router.get('/kick/callback', passport.authenticate('kick'), async (req, res) => {
    const user = req.user as User;
    const cl = (req as any).client as KickClient;
    const channel = await cl.channels.fetchBySlug('phxgg');
    const message = await channel.send('Hello World!');
    console.log(message);
    return res.json({ user });
    // const accessToken = signAccessToken(userId);
    // const refreshToken = signRefreshToken(userId);

    // Return tokens; in production consider httpOnly cookies for refresh token.
    // return res.json({ accessToken, refreshToken, tokenType: 'Bearer', expiresIn: 900 });
  });

  return router;
}

export default createOAuthRouter;

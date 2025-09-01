import { Router } from 'express';
import passport from 'passport';
// import { signAccessToken, signRefreshToken } from '@/utils/jwt';
import { User } from '@/KickAPI/User';

const router = Router();

router.get('/kick', passport.authenticate('kick'));

router.get('/kick/callback', passport.authenticate('kick'), async (req, res) => {
  const user = req.user as User;
  return res.json({ user });
  // const accessToken = signAccessToken(userId);
  // const refreshToken = signRefreshToken(userId);

  // Return tokens; in production consider httpOnly cookies for refresh token.
  // return res.json({ accessToken, refreshToken, tokenType: 'Bearer', expiresIn: 900 });
});

export default router;

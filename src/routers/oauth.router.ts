import { Router } from 'express';
import passport from 'passport';

import { oauthController } from '@/controllers/oauth.controller';
import { attachKickClientToReq } from '@/middleware/attach-kick-client-to-req.middleware';
import { bearerAuthMiddleware } from '@/middleware/bearer-auth.middleware';
import { validateData } from '@/middleware/validate-data.middleware';
import { revokeTokenValidator, type RevokeTokenInput } from '@/validators/revoke-token.validator';

export function createOAuthRouter() {
  const router = Router();

  router.get('/kick', passport.authenticate('kick', { session: false }));

  router.get(
    '/kick/callback',
    passport.authenticate('kick', { session: false }),
    attachKickClientToReq,
    oauthController.kickCallback
  );

  router.post('/token/revoke', validateData(revokeTokenValidator), oauthController.revokeToken);
  router.post('/token/revoke-all', bearerAuthMiddleware, oauthController.revokeAllUserTokens);

  return router;
}

export default createOAuthRouter;

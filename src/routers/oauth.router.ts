import { Router } from 'express';
import passport from 'passport';

import { oauthController } from '@/controllers/oauth.controller.js';
import { attachKickClientToReq } from '@/middleware/attach-kick-client-to-req.middleware.js';
import { bearerAuthMiddleware } from '@/middleware/bearer-auth.middleware.js';
import { validateBody } from '@/middleware/validate-body.middleware.js';
import { revokeTokenValidator, type RevokeTokenSchema } from '@/validators/body/revoke-token.validator.js';

export function createOAuthRouter() {
  const router = Router();

  router.get('/kick', passport.authenticate('kick', { session: false }));

  router.get(
    '/kick/callback',
    passport.authenticate('kick', { session: false }),
    attachKickClientToReq,
    oauthController.kickCallback
  );

  router.post('/token/revoke', validateBody(revokeTokenValidator), oauthController.revokeToken);
  router.post('/token/revoke-all', bearerAuthMiddleware, oauthController.revokeAllUserTokens);

  return router;
}

export default createOAuthRouter;

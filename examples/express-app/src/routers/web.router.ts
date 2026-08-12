import { Router } from 'express';

import { webController } from '@/controllers/web.controller.js';
import { attachKickClientToReq } from '@/middleware/attach-kick-client-to-req.middleware.js';
import { requireWebAuth } from '@/middleware/require-web-auth.middleware.js';

export function createWebRouter() {
  const router = Router();

  router.get('/', webController.home);
  router.get('/dashboard', requireWebAuth, attachKickClientToReq, webController.dashboard);
  router.post('/dashboard/events/subscribe', requireWebAuth, webController.subscribeToChat);
  router.post(
    '/dashboard/events/:id/unsubscribe',
    requireWebAuth,
    attachKickClientToReq,
    webController.unsubscribeEvent
  );
  router.post('/logout', requireWebAuth, webController.logout);

  return router;
}

export default createWebRouter;

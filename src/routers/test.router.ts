import { Router } from 'express';

import { testController } from '@/controllers/test.controller';
import { attachKickClientToReq } from '@/middleware/attach-kick-client-to-req.middleware';
import { bearerAuthMiddleware } from '@/middleware/bearer-auth.middleware';
import { validateData } from '@/middleware/validate-data.middleware';
import { testValidator } from '@/validators/test.validator';

export function createTestRouter() {
  const router = Router();

  router.use(bearerAuthMiddleware);
  router.use(attachKickClientToReq);

  router.post('/test', validateData(testValidator), testController.getTest);
  router.get('/events', testController.getEvents);
  router.get('/subscribe', testController.getSubscribe);
  router.get('/delete', testController.getDelete);

  return router;
}

export default createTestRouter;

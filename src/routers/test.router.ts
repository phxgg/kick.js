import { Router } from 'express';

import { testController } from '@/controllers/test.controller.js';
import { attachKickClientToReq } from '@/middleware/attach-kick-client-to-req.middleware.js';
import { bearerAuthMiddleware } from '@/middleware/bearer-auth.middleware.js';
import { requireKickClient } from '@/middleware/require-kick-client.middleware.js';
import { validateBody } from '@/middleware/validate-body.middleware.js';
import { validateParams } from '@/middleware/validate-params.middleware.js';
import { validateQuery } from '@/middleware/validate-query.middleware.js';
import { testBodyValidator } from '@/validators/body/test-body.validator.js';
import { getCategoryParamsValidator } from '@/validators/params/get-category-params.validator.js';
import { categoriesQueryValidator } from '@/validators/query/categories-query.validator.js';

export function createTestRouter() {
  const router = Router();

  router.use(bearerAuthMiddleware);
  router.use(attachKickClientToReq);
  router.use(requireKickClient);

  router.post('/testbody', [validateBody(testBodyValidator)], testController.getTest);
  router.get('/events', testController.getEvents);
  router.get('/events/subscribe', testController.getSubscribe);
  router.get('/events/unsubscribe', testController.getUnsubscribe);
  router.get('/categories', [validateQuery(categoriesQueryValidator)], testController.getCategories);
  router.get('/categories/:id', [validateParams(getCategoryParamsValidator)], testController.getCategory);
  router.post('/token/introspect', testController.postTokenIntrospect);

  return router;
}

export default createTestRouter;

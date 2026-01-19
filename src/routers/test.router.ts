import { Router } from 'express';

import { testController } from '@/controllers/test.controller';
import { attachKickClientToReq } from '@/middleware/attach-kick-client-to-req.middleware';
import { bearerAuthMiddleware } from '@/middleware/bearer-auth.middleware';
import { validateBody } from '@/middleware/validate-body.middleware';
import { validateParams } from '@/middleware/validate-params.middleware';
import { validateQuery } from '@/middleware/validate-query.middleware';
import { testBodyValidator } from '@/validators/body/test-body.validator';
import { getCategoryParamsValidator } from '@/validators/params/get-category-params.validator';
import { categoriesQueryValidator } from '@/validators/query/categories-query.validator';

export function createTestRouter() {
  const router = Router();

  router.use(bearerAuthMiddleware);
  router.use(attachKickClientToReq);

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

import { Router } from 'express';
import { StatusCodes } from 'http-status-codes';

import logger from '@/winston.logger';

import { EventSubscriptionMethod } from '@/KickAPI/services/EventsService';
import { attachKickClientToReq } from '@/middleware/attach-kick-client-to-req.middleware';
import { bearerAuthMiddleware } from '@/middleware/bearer-auth.middleware';
import { validateData } from '@/middleware/validate-data.middleware';
import { testValidator } from '@/validators/test.validator';

export function createTestRouter() {
  const router = Router();

  router.post('/test', bearerAuthMiddleware, validateData(testValidator), attachKickClientToReq, async (req, res) => {
    res.json({ message: 'Data is valid', data: req.body });
  });

  router.get('/events', bearerAuthMiddleware, attachKickClientToReq, async (req, res) => {
    if (!req.kick) {
      return res.sendStatus(StatusCodes.FORBIDDEN);
    }
    const events = await req.kick.events.fetch();
    res.json(events);
  });

  router.get('/subscribe', bearerAuthMiddleware, attachKickClientToReq, async (req, res) => {
    if (!req.kick) {
      return res.sendStatus(StatusCodes.FORBIDDEN);
    }
    const me = await req.kick.users.me();
    const subscription = await req.kick.events.subscribe({
      broadcasterUserId: me.userId,
      event: { name: 'chat.message.sent', version: 1 },
      method: EventSubscriptionMethod.WEBHOOK,
    });
    if (subscription.error) {
      logger.error(`Failed to subscribe to event ${subscription.name} - ERROR_MSG: ${subscription.error}`);
      return res.sendStatus(StatusCodes.INTERNAL_SERVER_ERROR);
    }
    logger.info(subscription);
    return res.json(subscription);
  });

  router.get('/delete', bearerAuthMiddleware, attachKickClientToReq, async (req, res) => {
    if (!req.kick) {
      return res.sendStatus(StatusCodes.FORBIDDEN);
    }
    const subscriptions = await req.kick.events.fetch();
    await req.kick.events.unsubscribeMultiple(subscriptions.map((sub) => sub.id));
    res.sendStatus(StatusCodes.NO_CONTENT);
  });

  return router;
}

export default createTestRouter;

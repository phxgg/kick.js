import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import { WebhookEvents } from '@/KickAPI/webhooks/WebhookEvents';
import { testService } from '@/services/test.service';
import { GetCategoryParams } from '@/validators/params/get-category-params.validator';
import { CategoriesQuerySchema } from '@/validators/query/categories-query.validator';

class TestController {
  async getTest(req: Request, res: Response) {
    res.json({ message: 'Data is valid', data: req.body });
  }

  async getEvents(req: Request, res: Response) {
    if (!req.kick) {
      return res.sendStatus(StatusCodes.FORBIDDEN);
    }
    try {
      const events = await testService.getSubscribedEvents(req.kick);
      res.json(events);
    } catch (err) {
      return res.sendStatus(StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  async getSubscribe(req: Request, res: Response) {
    if (!req.kick) {
      return res.sendStatus(StatusCodes.FORBIDDEN);
    }
    try {
      const subscription = await testService.subscribeToEvent(req.kick, WebhookEvents.CHAT_MESSAGE_SENT);
      return res.json(subscription);
    } catch (err) {
      return res.sendStatus(StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  async getUnsubscribe(req: Request, res: Response) {
    if (!req.kick) {
      return res.sendStatus(StatusCodes.FORBIDDEN);
    }
    try {
      await testService.unsubscribeFromAllEvents(req.kick);
      return res.sendStatus(StatusCodes.NO_CONTENT);
    } catch (err) {
      return res.sendStatus(StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  async getCategories(req: Request, res: Response) {
    if (!req.kick) {
      return res.sendStatus(StatusCodes.FORBIDDEN);
    }
    try {
      const query = req.query as CategoriesQuerySchema;
      const categories = await testService.getCategories(req.kick, query);
      return res.json(categories);
    } catch (err) {
      return res.sendStatus(StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  async getCategory(req: Request, res: Response) {
    if (!req.kick) {
      return res.sendStatus(StatusCodes.FORBIDDEN);
    }
    try {
      const params = req.params as unknown as GetCategoryParams;
      const categories = await testService.getCategory(req.kick, params.id);
      return res.json(categories);
    } catch (err) {
      return res.sendStatus(StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  async postTokenIntrospect(req: Request, res: Response) {
    if (!req.kick) {
      return res.sendStatus(StatusCodes.FORBIDDEN);
    }
    try {
      const introspect = await testService.introspectToken(req.kick);
      return res.json(introspect);
    } catch (err) {
      return res.sendStatus(StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }
}

export const testController = new TestController();

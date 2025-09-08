import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import { WebhookEvents } from '@/KickAPI/webhooks/WebhookEvents';
import { testService } from '@/services/test.service';

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

  async getDelete(req: Request, res: Response) {
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
}

export const testController = new TestController();

import crypto from 'crypto';
import express from 'express';

import logger from '@/winston.logger';

import { getKickPublicKey } from '../services/PublicKeyService';
import { handleChatMessageSent } from './WebhookEventHandlers';
import { WebhookEvents, type WebhookEventNames } from './WebhookEvents';

export function createWebhookRouter() {
  const router = express.Router();

  router.post('/kick', async (req, res) => {
    const messageId = req.header('kick-event-message-id');
    const subscriptionId = req.header('kick-event-subscription-id');
    const eventSignature = req.header('kick-event-signature');
    const messageTimestamp = req.header('kick-event-message-timestamp');
    const eventType = req.header('kick-event-type') as WebhookEventNames;
    const eventVersion = req.header('kick-event-version');

    try {
      const publicKey = await getKickPublicKey();

      const rawBody = req.rawBody!.toString('utf8');
      if (!messageId || !messageTimestamp || !rawBody || !eventSignature) {
        logger.error('Missing required parameters for signature verification');
        return res.sendStatus(400);
      }

      const constructSignature = `${messageId}.${messageTimestamp}.${rawBody}`;
      // create an RSA-SHA256 verifier
      const verifier = crypto.createVerify('RSA-SHA256').update(constructSignature);
      const signature = Buffer.from(eventSignature, 'base64');
      const isValid = verifier.verify(publicKey, signature);
      if (!isValid) {
        logger.warn('Webhook signature verification failed');
        return res.sendStatus(403);
      }
      const parsedBody = JSON.parse(rawBody);
      logger.info('Received Kick webhook event', { event: parsedBody });

      // Handle event
      switch (eventType) {
        case WebhookEvents.CHAT_MESSAGE_SENT:
          handleChatMessageSent(parsedBody);
          break;
      }

      res.sendStatus(200);
    } catch (err) {
      logger.error(`Error processing Kick webhook event`, err);
      res.sendStatus(500);
    }
  });

  return router;
}

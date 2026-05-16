import express from 'express';
import { StatusCodes } from 'http-status-codes';
import {
  dispatchWebhookEvent,
  getKickPublicKey,
  verifyKickSignature,
  WebhookEvents,
  type WebhookEventNames,
} from '@phxgg/kick.js';

import { createLogger } from '@/winston.logger.js';

import {
  handleChannelFollowed,
  handleChannelRewardRedemptionUpdated,
  handleChannelSubscriptionGifts,
  handleChannelSubscriptionNew,
  handleChannelSubscriptionRenewal,
  handleChatMessageSent,
  handleKicksGifted,
  handleLivestreamMetadataUpdated,
  handleLivestreamStatusUpdated,
  handleModerationBanned,
} from './handlers.js';

const logger = createLogger('WebhookRouter');

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
      const rawBody = req.rawBody?.toString('utf8');
      if (!messageId || !messageTimestamp || !rawBody || !eventSignature) {
        logger.error('Missing required parameters for signature verification');
        return res.sendStatus(StatusCodes.BAD_REQUEST);
      }

      const isValid = verifyKickSignature({
        messageId,
        messageTimestamp,
        rawBody,
        signature: eventSignature,
        publicKey,
      });
      if (!isValid) {
        logger.warn('Webhook signature verification failed');
        return res.sendStatus(StatusCodes.FORBIDDEN);
      }

      const payload = JSON.parse(rawBody);
      logger.info('Received Kick webhook event', { event: payload });

      // Route to any KickClient subscribed via `client.on(...)` for this broadcaster.
      dispatchWebhookEvent(eventType, payload);

      // Global handlers (cross-cutting, not per-client).
      switch (eventType) {
        case WebhookEvents.CHAT_MESSAGE_SENT:
          handleChatMessageSent(payload);
          break;
        case WebhookEvents.CHANNEL_FOLLOWED:
          handleChannelFollowed(payload);
          break;
        case WebhookEvents.CHANNEL_SUBSCRIPTION_RENEWAL:
          handleChannelSubscriptionRenewal(payload);
          break;
        case WebhookEvents.CHANNEL_SUBSCRIPTION_GIFTS:
          handleChannelSubscriptionGifts(payload);
          break;
        case WebhookEvents.CHANNEL_SUBSCRIPTION_NEW:
          handleChannelSubscriptionNew(payload);
          break;
        case WebhookEvents.CHANNEL_REWARD_REDEMPTION_UPDATED:
          handleChannelRewardRedemptionUpdated(payload);
          break;
        case WebhookEvents.LIVESTREAM_STATUS_UPDATED:
          handleLivestreamStatusUpdated(payload);
          break;
        case WebhookEvents.LIVESTREAM_METADATA_UPDATED:
          handleLivestreamMetadataUpdated(payload);
          break;
        case WebhookEvents.MODERATION_BANNED:
          handleModerationBanned(payload);
          break;
        case WebhookEvents.KICKS_GIFTED:
          handleKicksGifted(payload);
          break;
        default:
          logger.warn(`Unhandled Kick webhook event type: ${eventType}`);
          break;
      }

      res.sendStatus(StatusCodes.OK);
    } catch (err) {
      logger.error(`Error processing Kick webhook event`, err);
      res.sendStatus(StatusCodes.INTERNAL_SERVER_ERROR);
    }
  });

  return router;
}

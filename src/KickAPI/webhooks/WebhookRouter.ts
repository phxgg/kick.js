import crypto from 'crypto';
import express from 'express';
import { StatusCodes } from 'http-status-codes';

import { createLogger } from '@/winston.logger';

import { eventManager } from '../EventManager';
import { getKickPublicKey } from '../services/PublicKeyService';
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
} from './WebhookEventHandlers';
import { WebhookEvents, type WebhookEventNames } from './WebhookEvents';

const logger = createLogger('KickAPI.WebhookRouter');

// Helper function to extract unique identifier from different event types
function extractUniqueId(eventType: WebhookEventNames, payload: any): string | null {
  // Try user_id, then username, then channel_slug
  if (payload.broadcaster?.user_id) return payload.broadcaster.user_id.toString();
  if (payload.broadcaster?.username) return payload.broadcaster.username.toString();
  if (payload.broadcaster?.channel_slug) return payload.broadcaster.channel_slug.toString();
  return null;
}

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
        return res.sendStatus(StatusCodes.BAD_REQUEST);
      }

      const constructSignature = `${messageId}.${messageTimestamp}.${rawBody}`;
      // create an RSA-SHA256 verifier
      const verifier = crypto.createVerify('RSA-SHA256').update(constructSignature);
      const signature = Buffer.from(eventSignature, 'base64');
      const isValid = verifier.verify(publicKey, signature);
      if (!isValid) {
        logger.warn('Webhook signature verification failed');
        return res.sendStatus(StatusCodes.FORBIDDEN);
      }
      const payload = JSON.parse(rawBody);
      logger.info('Received Kick webhook event', { event: payload });

      // Handle client event emitter listeners.
      // Extract unique identifier from payload to route to correct client.
      // Then, emit to specific client for this channel/user.
      const uniqueId = extractUniqueId(eventType, payload);
      if (uniqueId) {
        eventManager.emit(uniqueId, eventType, payload);
      }

      // Handle event
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

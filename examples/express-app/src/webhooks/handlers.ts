import type {
  ChannelFollowedEventPayload,
  ChannelRewardRedemptionUpdatedEventPayload,
  ChannelSubscriptionGiftsEventPayload,
  ChannelSubscriptionNewEventPayload,
  ChannelSubscriptionRenewalEventPayload,
  ChatMessageSentEventPayload,
  KicksGiftedEventPayload,
  LivestreamMetadataUpdatedEventPayload,
  LivestreamStatusUpdatedEventPayload,
  ModerationBannedEventPayload,
} from '@phxgg/kick.js';

import { createLogger } from '@/winston.logger.js';

const logger = createLogger('WebhookHandlers');

// These run for every webhook event regardless of which (if any) KickClient is subscribed for
// the broadcaster - see webhook.router.ts. The actual bot behavior (auto-replying to chat) lives
// in kick-client-registry.ts via `client.on(...)`; this is just an example of cross-cutting logging.
export async function handleChatMessageSent(data: ChatMessageSentEventPayload) {
  logger.info(`${data.broadcaster?.username ?? 'unknown'} chat: ${data.sender.username}: ${data.content}`);
}

export async function handleChannelFollowed(data: ChannelFollowedEventPayload) {
  //
}

export async function handleChannelSubscriptionRenewal(data: ChannelSubscriptionRenewalEventPayload) {
  //
}

export async function handleChannelSubscriptionGifts(data: ChannelSubscriptionGiftsEventPayload) {
  //
}

export async function handleChannelSubscriptionNew(data: ChannelSubscriptionNewEventPayload) {
  //
}

export async function handleChannelRewardRedemptionUpdated(data: ChannelRewardRedemptionUpdatedEventPayload) {
  //
}

export async function handleLivestreamStatusUpdated(data: LivestreamStatusUpdatedEventPayload) {
  //
}

export async function handleLivestreamMetadataUpdated(data: LivestreamMetadataUpdatedEventPayload) {
  //
}

export async function handleModerationBanned(data: ModerationBannedEventPayload) {
  //
}

export async function handleKicksGifted(data: KicksGiftedEventPayload) {
  //
}

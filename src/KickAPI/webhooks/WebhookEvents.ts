import {
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
} from './v1/payloads';

export enum WebhookEvents {
  CHAT_MESSAGE_SENT = 'chat.message.sent',
  CHANNEL_FOLLOWED = 'channel.followed',
  CHANNEL_SUBSCRIPTION_RENEWAL = 'channel.subscription.renewal',
  CHANNEL_SUBSCRIPTION_GIFTS = 'channel.subscription.gifts',
  CHANNEL_SUBSCRIPTION_NEW = 'channel.subscription.new',
  CHANNEL_REWARD_REDEMPTION_UPDATED = 'channel.reward.redemption.updated',
  LIVESTREAM_STATUS_UPDATED = 'livestream.status.updated',
  LIVESTREAM_METADATA_UPDATED = 'livestream.metadata.updated',
  MODERATION_BANNED = 'moderation.banned',
  KICKS_GIFTED = 'kicks.gifted',
}

export type WebhookEventNames = (typeof WebhookEvents)[keyof typeof WebhookEvents];

export interface WebhookEventPayloadMap {
  [WebhookEvents.CHAT_MESSAGE_SENT]: ChatMessageSentEventPayload;
  [WebhookEvents.CHANNEL_FOLLOWED]: ChannelFollowedEventPayload;
  [WebhookEvents.CHANNEL_SUBSCRIPTION_RENEWAL]: ChannelSubscriptionRenewalEventPayload;
  [WebhookEvents.CHANNEL_SUBSCRIPTION_GIFTS]: ChannelSubscriptionGiftsEventPayload;
  [WebhookEvents.CHANNEL_SUBSCRIPTION_NEW]: ChannelSubscriptionNewEventPayload;
  [WebhookEvents.CHANNEL_REWARD_REDEMPTION_UPDATED]: ChannelRewardRedemptionUpdatedEventPayload;
  [WebhookEvents.LIVESTREAM_STATUS_UPDATED]: LivestreamStatusUpdatedEventPayload;
  [WebhookEvents.LIVESTREAM_METADATA_UPDATED]: LivestreamMetadataUpdatedEventPayload;
  [WebhookEvents.MODERATION_BANNED]: ModerationBannedEventPayload;
  [WebhookEvents.KICKS_GIFTED]: KicksGiftedEventPayload;
}

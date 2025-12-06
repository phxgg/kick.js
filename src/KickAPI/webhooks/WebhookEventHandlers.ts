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
} from './v1/payloads';

export async function handleChatMessageSent(data: ChatMessageSentEventPayload) {
  //
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

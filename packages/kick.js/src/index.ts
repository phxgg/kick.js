// Client
export { KickClient, KICK_BASE_URL } from './KickClient.js';
export type { KickClientOptions } from './KickClient.js';

// OAuth
export { OAuth, TokenHintType } from './OAuth.js';
export type { AppToken, Token, TokenIntrospect, TokenIntrospectResponse } from './OAuth.js';

// Enums / config
export { Scope } from './Scope.js';
export { Version } from './Version.js';

// Common types
export type { BaseResponse, BaseResponseWithPagination } from './BaseResponse.js';

// Errors
export {
  BadRequestError,
  ForbiddenError,
  InternalServerError,
  MissingScopeError,
  NoTokenSetError,
  NotFoundError,
  RateLimitError,
  UnauthorizedError,
} from './Errors.js';

// Serialization
export { Serializable, serialize } from './Serializable.js';
export type { SerializeOptions } from './Serializable.js';

// Event routing (used by webhook dispatchers)
export { eventManager } from './EventManager.js';

// Utilities
export {
  constructEndpoint,
  extractUniqueId,
  generateCodeChallenge,
  generateCodeVerifier,
  handleError,
  parseJSON,
} from './utils.js';

// Services
export { CategoriesService } from './services/CategoriesService.js';
export { CategoriesServiceV2 } from './services/CategoriesServiceV2.js';
export { ChannelRewardsService } from './services/ChannelRewardsService.js';
export { ChannelsService } from './services/ChannelsService.js';
export { ChatService, ChatMessageType } from './services/ChatService.js';
export { EventsService, EventSubscriptionMethod } from './services/EventsService.js';
export { KICKsService } from './services/KICKsService.js';
export { LivestreamsService } from './services/LivestreamsService.js';
export { ModerationService } from './services/ModerationService.js';
export { PublicKeyService, getKickPublicKey } from './services/PublicKeyService.js';
export type { PublicKeyDto, PublicKeyResponse } from './services/PublicKeyService.js';
export { UsersService } from './services/UsersService.js';
export type { FetchUserResponse } from './services/UsersService.js';

// Resources
export { Category } from './resources/Category.js';
export type { CategoryDto } from './resources/Category.js';
export { Channel } from './resources/Channel.js';
export type { ChannelDto } from './resources/Channel.js';
export { ChannelReward } from './resources/ChannelReward.js';
export type { ChannelRewardDto } from './resources/ChannelReward.js';
export type { ChannelRewardRedemptionStatus } from './resources/ChannelRewardRedemption.js';
export { EventSubscription } from './resources/EventSubscription.js';
export type { EventSubscriptionDto } from './resources/EventSubscription.js';
export { Leaderboard } from './resources/Leaderboard.js';
export type { LeaderboardDto } from './resources/Leaderboard.js';
export { Livestream } from './resources/Livestream.js';
export type { LivestreamDto, LivestreamStatsDto } from './resources/Livestream.js';
export { Message } from './resources/Message.js';
export type { MessageDto } from './resources/Message.js';
export { User } from './resources/User.js';
export type { UserDto } from './resources/User.js';

// Webhooks: framework-agnostic primitives
export { verifyKickSignature } from './webhooks/verify.js';
export type { KickWebhookSignatureInput } from './webhooks/verify.js';
export { dispatchWebhookEvent } from './webhooks/dispatch.js';
export { WebhookEvents } from './webhooks/WebhookEvents.js';
export type { WebhookEventNames, WebhookEventPayloadMap } from './webhooks/WebhookEvents.js';

// Webhook payload types (v1)
export type {
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
} from './webhooks/v1/payloads/index.js';

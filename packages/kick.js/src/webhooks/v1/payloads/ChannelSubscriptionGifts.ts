import type { UserEventProperty, WithIdentityNull } from '../Properties.js';

export type ChannelSubscriptionGiftsEventPayload = {
  broadcaster: WithIdentityNull<UserEventProperty>;
  gifter: WithIdentityNull<UserEventProperty>;
  giftees: WithIdentityNull<UserEventProperty>[];
  created_at: string;
  expires_at: string;
};

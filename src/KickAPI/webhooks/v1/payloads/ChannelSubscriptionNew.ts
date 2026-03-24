import type { UserEventProperty, WithIdentityNull } from '../Properties.js';

export type ChannelSubscriptionNewEventPayload = {
  broadcaster: WithIdentityNull<UserEventProperty>;
  subscriber: WithIdentityNull<UserEventProperty>;
  duration: number;
  created_at: string;
  expires_at: string;
};

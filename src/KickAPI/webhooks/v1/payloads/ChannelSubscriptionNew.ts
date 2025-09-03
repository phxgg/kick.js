import type { UserEventProperty, WithIdentityNull } from '../Properties';

export type ChannelSubscriptionNewEventPayload = {
  broadcaster: WithIdentityNull<UserEventProperty>;
  subscriber: WithIdentityNull<UserEventProperty>;
  duration: number;
  created_at: string;
  expires_at: string;
};

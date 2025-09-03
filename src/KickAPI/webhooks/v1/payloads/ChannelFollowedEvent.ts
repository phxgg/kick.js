import type { UserEventProperty, WithIdentityNull } from '../Properties';

export type ChannelFollowedEventPayload = {
  broadcaster: WithIdentityNull<UserEventProperty>;
  follower: WithIdentityNull<UserEventProperty>;
};

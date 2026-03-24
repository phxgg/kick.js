import type { UserEventProperty, WithIdentityNull } from '../Properties.js';

export type ChannelFollowedEventPayload = {
  broadcaster: WithIdentityNull<UserEventProperty>;
  follower: WithIdentityNull<UserEventProperty>;
};

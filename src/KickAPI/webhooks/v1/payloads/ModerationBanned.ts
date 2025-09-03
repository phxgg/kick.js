import type { UserEventProperty, WithIdentityNull } from '../Properties';

export type ModerationBannedEventPayload = {
  broadcaster: WithIdentityNull<UserEventProperty>;
  moderator: WithIdentityNull<UserEventProperty>;
  banned_user: WithIdentityNull<UserEventProperty>;
  metadata: {
    reason: string;
    created_at: string;
    expires_at: string | null; // null for permanent bans
  };
};

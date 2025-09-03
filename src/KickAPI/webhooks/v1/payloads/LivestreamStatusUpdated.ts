import type { UserEventProperty, WithIdentityNull } from '../Properties';

export type LivestreamStatusUpdatedEventPayload = {
  broadcaster: WithIdentityNull<UserEventProperty>;
  is_live: boolean;
  title: string;
  started_at: string;
  ended_at: string | null;
};

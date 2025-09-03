import type { LivestreamMetadataEventProperty, UserEventProperty, WithIdentityNull } from '../Properties';

export type LivestreamMetadataUpdatedEventPayload = {
  broadcaster: WithIdentityNull<UserEventProperty>;
  metadata: LivestreamMetadataEventProperty;
};

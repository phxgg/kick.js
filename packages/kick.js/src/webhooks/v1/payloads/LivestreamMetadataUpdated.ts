import type { LivestreamMetadataEventProperty, UserEventProperty, WithIdentityNull } from '../Properties.js';

export type LivestreamMetadataUpdatedEventPayload = {
  broadcaster: WithIdentityNull<UserEventProperty>;
  metadata: LivestreamMetadataEventProperty;
};

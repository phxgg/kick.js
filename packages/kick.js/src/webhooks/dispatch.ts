import { eventManager } from '../EventManager.js';
import { extractUniqueId } from '../utils.js';
import type { WebhookEventNames, WebhookEventPayloadMap } from './WebhookEvents.js';

/**
 * Routes a verified webhook payload to any `KickClient` subscribed for the
 * targeted broadcaster via `client.on(eventName, listener)`. The lookup uses
 * `broadcaster.user_id`/`username`/`channel_slug` from the payload, in that order.
 *
 * No-op if no client is registered for the resolved unique id.
 */
export function dispatchWebhookEvent<E extends WebhookEventNames>(
  eventType: E,
  payload: WebhookEventPayloadMap[E]
): void {
  const uniqueId = extractUniqueId(eventType, payload);
  if (uniqueId) {
    eventManager.emit(uniqueId, eventType, payload);
  }
}

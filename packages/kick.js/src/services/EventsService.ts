import z from 'zod';

import { BaseResponse } from '../BaseResponse.js';
import type { KickClient } from '../KickClient.js';
import { RequestOptions } from '../RequestOptions.js';
import { EventSubscription, EventSubscriptionDto } from '../resources/EventSubscription.js';
import { Scope } from '../Scope.js';
import { constructEndpoint, handleError, parseJSON } from '../utils.js';
import { Version } from '../Version.js';

export enum EventSubscriptionMethod {
  WEBHOOK = 'webhook',
}

export const eventDetailsSchema = z.object({
  name: z.string(),
  version: z.number(),
});
export type EventDetailsDto = z.infer<typeof eventDetailsSchema>;

export const subscribeToMultipleEventsSchema = z.object({
  broadcasterUserId: z.number().optional(),
  events: z.array(eventDetailsSchema),
  method: z.enum(EventSubscriptionMethod).optional(),
});
export type SubscribeToMultipleEventsParams = z.infer<typeof subscribeToMultipleEventsSchema>;

export const subscribeToSingleEventSchema = z.object({
  broadcasterUserId: z.number().optional(),
  event: eventDetailsSchema,
  method: z.enum(EventSubscriptionMethod).optional(),
});
export type SubscribeToSingleEventParams = z.infer<typeof subscribeToSingleEventSchema>;

export type PostEventSubscriptionData = {
  error?: string;
  name: string;
  subscription_id?: string;
  version: number;
};
export type EventSubscriptionResponse = BaseResponse<PostEventSubscriptionData[]>;
export type FetchEventsResponse = BaseResponse<EventSubscriptionDto[]>;

export class EventsService {
  private readonly EVENTS_URL = constructEndpoint(Version.V1, 'events/subscriptions');
  protected readonly client: KickClient;

  constructor(client: KickClient) {
    this.client = client;
  }

  /**
   * Fetch all event subscriptions for the authenticated user.
   *
   * @returns An array of `EventSubscription` instances.
   */
  async fetch(): Promise<EventSubscription[]> {
    const response = await fetch(this.EVENTS_URL, {
      headers: {
        Authorization: `Bearer ${this.client.authToken()}`,
      },
    });

    if (!response.ok) {
      handleError(response);
    }

    const json = await parseJSON<FetchEventsResponse>(response);
    const data = json.data.map((item) => new EventSubscription(this.client, item));
    return data;
  }

  /**
   * Subscribe to multiple events.
   *
   * Required user scopes:
   * `events:subscribe`
   *
   * @param params The parameters for subscribing to multiple events
   * @param params.broadcasterUserId (Optional) When using a user access token, this field will be ignored and the broadcaster user ID will be inferred from the user access token. When using an app access token, this field is required.
   * @param params.events An array of event details (name and version)
   * @param params.method (Optional) The method of subscription (default is 'webhook')
   * @param options (Optional) Request options
   * @returns An array of `PostEventSubscriptionData` instances.
   */
  async subscribeMultiple(
    params: SubscribeToMultipleEventsParams,
    options?: RequestOptions
  ): Promise<PostEventSubscriptionData[]> {
    // App tokens aren't scoped; only user tokens need the events:subscribe scope check.
    if (this.client.usingUserToken(options?.tokenType)) {
      this.client.requiresUserScope(Scope.EVENTS_SUBSCRIBE);
    }

    const schema = subscribeToMultipleEventsSchema.safeParse(params);

    if (!schema.success) {
      throw new Error(`Invalid parameters: ${schema.error.message}`);
    }

    const { broadcasterUserId, events, method } = schema.data;
    const endpoint = new URL(this.EVENTS_URL);

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.client.authToken(options?.tokenType)}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        broadcaster_user_id: broadcasterUserId,
        events: events,
        method: method,
      }),
    });

    if (!response.ok) {
      handleError(response);
    }

    const json = await parseJSON<EventSubscriptionResponse>(response);

    // Register for dispatch regardless of token type: app tokens must pass broadcasterUserId
    // explicitly, while user tokens subscribe to themselves when it's omitted.
    const targetUserId = broadcasterUserId ?? (await this.client.users.me()).userId;
    this.client.registerEventTarget(targetUserId.toString());

    return json.data;
  }

  /**
   * Subscribe to a single event.
   *
   * Required user scopes:
   * `events:subscribe`
   *
   * @param params The parameters for subscribing to a single event
   * @param params.broadcasterUserId (Optional) When using a user access token, this field will be ignored and the broadcaster user ID will be inferred from the user access token. When using an app access token, this field is required.
   * @param params.event The event details (name and version)
   * @param params.method (Optional) The method of subscription (default is 'webhook')
   * @param options (Optional) Request options
   * @returns The created `PostEventSubscriptionData` instance.
   */
  async subscribe(params: SubscribeToSingleEventParams, options?: RequestOptions): Promise<PostEventSubscriptionData> {
    const { broadcasterUserId, event, method } = params;
    const results = await this.subscribeMultiple(
      {
        broadcasterUserId,
        events: [event],
        method,
      },
      options
    );
    return results[0];
  }

  /**
   * Unsubscribe from multiple events.
   *
   * Required user scopes:
   * `events:subscribe`
   *
   * @param ids Array of subscription IDs to unsubscribe from
   * @returns void
   */
  async unsubscribeMultiple(ids: string[], options?: RequestOptions): Promise<void> {
    if (this.client.usingUserToken(options?.tokenType)) {
      this.client.requiresUserScope(Scope.EVENTS_SUBSCRIBE);
    }

    if (ids.length === 0) return;

    const endpoint = new URL(this.EVENTS_URL);

    ids.forEach((id) => endpoint.searchParams.append('id', id));

    const response = await fetch(endpoint, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${this.client.authToken(options?.tokenType)}`,
      },
    });

    if (!response.ok) {
      handleError(response);
    }
  }

  /**
   * Unsubscribe from a single event.
   *
   * Required user scopes:
   * `events:subscribe`
   *
   * @param id The subscription ID to unsubscribe from
   * @param options (Optional) Request options
   * @returns void
   */
  async unsubscribe(id: string, options?: RequestOptions): Promise<void> {
    return this.unsubscribeMultiple([id], options);
  }
}

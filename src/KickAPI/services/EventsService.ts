import { BaseResponse } from '../BaseResponse';
import { EventSubscription, EventSubscriptionDto } from '../EventSubscription';
import { KICK_BASE_URL, KickClient } from '../KickClient';
import { handleError, parseJSON } from '../utils';

export enum EventSubscriptionMethod {
  WEBHOOK = 'webhook',
}

export type EventDetailsDto = {
  name: string;
  version: number;
};

export type SubscribeToMultipleEventsDto = {
  broadcasterUserId?: number;
  events: EventDetailsDto[];
  method?: EventSubscriptionMethod;
};

export type SubscribeToSingleEventDto = {
  broadcasterUserId?: number;
  event: EventDetailsDto;
  method?: EventSubscriptionMethod;
};

export type PostEventSubscriptionData = {
  error?: string;
  name: string;
  subscription_id?: string;
  version: number;
};
export type EventSubscriptionResponse = BaseResponse<PostEventSubscriptionData[]>;
export type FetchEventsResponse = BaseResponse<EventSubscriptionDto[]>;

export class EventsService {
  private EVENTS_URL: string = KICK_BASE_URL + '/events/subscriptions';
  protected readonly client: KickClient;

  constructor(client: KickClient) {
    this.client = client;
  }

  /**
   * Fetch all event subscriptions for the authenticated user.
   *
   * @returns An array of EventSubscription instances.
   */
  async fetch(): Promise<EventSubscription[]> {
    const response = await fetch(this.EVENTS_URL, {
      headers: {
        Authorization: `Bearer ${this.client.token?.access_token}`,
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
   * @param options The options for subscribing to multiple events
   * @param options.broadcasterUserId (Optional) The ID of the broadcaster to whom the events are related
   * @param options.events An array of event details (name and version)
   * @param options.method (Optional) The method of subscription (default is 'webhook')
   * @returns An array of PostEventSubscriptionData instances.
   */
  async subscribeMultiple({
    broadcasterUserId,
    events,
    method,
  }: SubscribeToMultipleEventsDto): Promise<PostEventSubscriptionData[]> {
    const response = await fetch(this.EVENTS_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.client.token?.access_token}`,
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
    return json.data;
  }

  /**
   * Subscribe to a single event.
   *
   * @param options The options for subscribing to a single event
   * @param options.broadcasterUserId (Optional) The ID of the broadcaster to whom the event is related
   * @param options.event The event details (name and version)
   * @param options.method (Optional) The method of subscription (default is 'webhook')
   * @returns The created PostEventSubscriptionData instance.
   */
  async subscribe({ broadcasterUserId, event, method }: SubscribeToSingleEventDto): Promise<PostEventSubscriptionData> {
    const results = await this.subscribeMultiple({
      broadcasterUserId,
      events: [event],
      method,
    });
    return results[0];
  }

  /**
   * Unsubscribe from multiple events.
   *
   * @param ids Array of subscription IDs to unsubscribe from
   * @returns void
   */
  async unsubscribeMultiple(ids: string[]): Promise<void> {
    if (ids.length === 0) return;
    const url = new URL(this.EVENTS_URL);
    ids.forEach((id) => url.searchParams.append('id', id));
    const response = await fetch(url.toString(), {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${this.client.token?.access_token}`,
      },
    });

    if (!response.ok) {
      handleError(response);
    }
  }

  /**
   * Unsubscribe from a single event.
   *
   * @param id The subscription ID to unsubscribe from
   * @returns void
   */
  async unsubscribe(id: string): Promise<void> {
    return this.unsubscribeMultiple([id]);
  }
}

import { BaseResponse } from '../BaseResponse';
import { handleError } from '../errors';
import { EventSubscription, EventSubscriptionDto } from '../EventSubscription';
import { KICK_BASE_URL, KickClient } from '../KickClient';

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

  async fetch(): Promise<EventSubscription[]> {
    const response = await fetch(this.EVENTS_URL, {
      headers: {
        Authorization: `Bearer ${this.client.token?.access_token}`,
      },
    });

    if (!response.ok) {
      handleError(response);
    }

    const json = (await response.json()) as FetchEventsResponse;
    const data = json.data.map((item) => new EventSubscription(this.client, item));
    return data;
  }

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

    const json = (await response.json()) as EventSubscriptionResponse;
    return json.data;
  }

  async subscribe({ broadcasterUserId, event, method }: SubscribeToSingleEventDto): Promise<PostEventSubscriptionData> {
    const results = await this.subscribeMultiple({
      broadcasterUserId,
      events: [event],
      method,
    });
    return results[0];
  }

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

  async unsubscribe(id: string): Promise<void> {
    return this.unsubscribeMultiple([id]);
  }
}

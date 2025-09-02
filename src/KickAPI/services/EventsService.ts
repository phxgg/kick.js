import { BaseResponse } from '../BaseResponse';
import { KICK_BASE_URL, KickClient } from '../Client';
import { handleError } from '../errors';
import { Event, EventDto } from '../Event';

export enum EventSubscriptionMethod {
  WEBHOOK = 'webhook',
}

export type EventDetailsDto = {
  name: string;
  version: number;
};

export type SubscribeToEventDto = {
  broadcasterUserId?: number;
  events: EventDetailsDto[];
  method?: EventSubscriptionMethod;
};

export type EventSubscriptionDto = {
  error?: string;
  name: string;
  subscription_id?: string;
  version: number;
};

export type EventSubscriptionResponse = BaseResponse<EventSubscriptionDto[]>;

export type FetchEventsResponse = BaseResponse<EventDto[]>;

export class EventsService {
  private EVENTS_URL: string = KICK_BASE_URL + '/events/subscriptions';
  protected readonly client: KickClient;

  constructor(client: KickClient) {
    this.client = client;
  }

  async fetch(): Promise<Event[]> {
    const response = await fetch(this.EVENTS_URL, {
      headers: {
        Authorization: `Bearer ${this.client.token?.access_token}`,
      },
    });

    if (!response.ok) {
      handleError(response);
    }

    const json = (await response.json()) as FetchEventsResponse;
    const data = json.data.map((item) => new Event(this.client, item));
    return data;
  }

  async subscribe({ broadcasterUserId, events, method }: SubscribeToEventDto): Promise<EventSubscriptionDto[]> {
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

  async unsubscribe(ids: string[]): Promise<void> {
    const url = new URL(this.EVENTS_URL);
    url.searchParams.append('id', ids.join(' '));
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
}

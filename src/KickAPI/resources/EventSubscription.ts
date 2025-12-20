import { KickClient } from '../KickClient';
import { Serializable } from '../Serializable';

export type EventSubscriptionDto = {
  app_id: string;
  broadcaster_user_id: number;
  created_at: string;
  event: string;
  id: string;
  method: string;
  updated_at: string;
  version: number;
};

export class EventSubscription extends Serializable {
  protected readonly client: KickClient;

  constructor(
    client: KickClient,
    private dto: EventSubscriptionDto
  ) {
    super();
    this.client = client;
  }

  get appId(): string {
    return this.dto.app_id;
  }

  get broadcasterUserId(): number {
    return this.dto.broadcaster_user_id;
  }

  get createdAt(): Date {
    return new Date(this.dto.created_at);
  }

  get event(): string {
    return this.dto.event;
  }

  get id(): string {
    return this.dto.id;
  }

  get method(): string {
    return this.dto.method;
  }

  get updatedAt(): Date {
    return new Date(this.dto.updated_at);
  }

  get version(): number {
    return this.dto.version;
  }
}

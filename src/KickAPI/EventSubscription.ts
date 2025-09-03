import { KickClient } from './KickClient';
import { Serializable } from './Serializable';

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

  get appId() {
    return this.dto.app_id;
  }

  get broadcasterUserId() {
    return this.dto.broadcaster_user_id;
  }

  get createdAt() {
    return this.dto.created_at;
  }

  get event() {
    return this.dto.event;
  }

  get id() {
    return this.dto.id;
  }

  get method() {
    return this.dto.method;
  }

  get updatedAt() {
    return this.dto.updated_at;
  }

  get version() {
    return this.dto.version;
  }
}

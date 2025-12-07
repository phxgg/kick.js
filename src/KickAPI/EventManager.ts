import EventEmitter from 'events';

import { WebhookEventNames } from './webhooks/WebhookEvents';

class EventManager {
  private static instance: EventManager;
  private clientsByUniqueId: Map<string, EventEmitter> = new Map();

  private constructor() {}

  static getInstance(): EventManager {
    if (!this.instance) {
      this.instance = new EventManager();
    }
    return this.instance;
  }

  register(uniqueId: string, client: EventEmitter) {
    this.clientsByUniqueId.set(uniqueId, client);
  }

  destroy(uniqueId: string) {
    const client = this.clientsByUniqueId.get(uniqueId);
    if (client) {
      client.removeAllListeners();
    }
    this.clientsByUniqueId.delete(uniqueId);
  }

  emit(uniqueId: string, event: WebhookEventNames, payload: any) {
    const client = this.clientsByUniqueId.get(uniqueId);
    if (client) {
      client.emit(event, payload);
    }
  }
}

export const eventManager = EventManager.getInstance();

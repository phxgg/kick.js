import EventEmitter from 'events';

import { WebhookEventNames } from './webhooks/WebhookEvents.js';

class EventManager {
  private static instance: EventManager;
  private clientsByUniqueId: Map<string, Set<EventEmitter>> = new Map();

  private constructor() {}

  static getInstance(): EventManager {
    if (!this.instance) {
      this.instance = new EventManager();
    }
    return this.instance;
  }

  register(uniqueId: string, client: EventEmitter) {
    let clients = this.clientsByUniqueId.get(uniqueId);
    if (!clients) {
      clients = new Set();
      this.clientsByUniqueId.set(uniqueId, clients);
    }
    clients.add(client);
  }

  /** Deregisters a single client's emitter from `uniqueId`, leaving any other clients registered for it untouched. */
  destroy(uniqueId: string, client: EventEmitter) {
    const clients = this.clientsByUniqueId.get(uniqueId);
    if (!clients) return;

    client.removeAllListeners();
    clients.delete(client);
    if (clients.size === 0) {
      this.clientsByUniqueId.delete(uniqueId);
    }
  }

  destroyAll() {
    for (const [uniqueId, clients] of this.clientsByUniqueId) {
      for (const client of clients) {
        client.removeAllListeners();
      }
      this.clientsByUniqueId.delete(uniqueId);
    }
  }

  emit(uniqueId: string, event: WebhookEventNames, payload: any) {
    const clients = this.clientsByUniqueId.get(uniqueId);
    if (!clients) return;

    for (const client of clients) {
      client.emit(event, payload);
    }
  }
}

export const eventManager = EventManager.getInstance();
